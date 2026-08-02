from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
    Request,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import uuid
import os
import io

from app.database import get_db
from app.utils.auth import get_current_user
from app.utils.rbac import require_roles, has_access
from app.utils.crypto import encrypt_file, decrypt_file
from app.utils.audit import create_audit_log
from app.core.config import settings
from app.models.secure_file import SecureFile
from app.models.user import User

router = APIRouter(prefix="/files", tags=["Files"])


# =========================================================
# 📁 LIST FILES (METADATA ONLY – RBAC)
# =========================================================
@router.get(
    "/",
    dependencies=[
        Depends(require_roles(
            "SUPER_ADMIN",
            "ADMIN",
            "SECURITY_OFFICER",
            "DEPT_OFFICER",
            "CLERK",
            "AUDITOR",
        ))
    ],
)
def list_files(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    files = db.query(SecureFile).all()

    return [
        {
            "id": f.id,
            "filename": f.filename,
            "classification": f.classification,
            "department": f.department,
            "uploaded_at": f.uploaded_at,
        }
        for f in files
    ]


# =========================================================
# 🔐 SECURE FILE UPLOAD (AES-256 ENVELOPE ENCRYPTION)
# =========================================================
@router.post(
    "/upload",
    dependencies=[
        Depends(require_roles(
            "SUPER_ADMIN",
            "ADMIN",
            "DEPT_OFFICER",
            "CLERK",
        ))
    ],
)
def upload_file(
    file: UploadFile = File(...),
    classification: str = Form(...),
    request: Request = None,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1️⃣ Fetch DB user
    db_user = (
        db.query(User)
        .filter(User.employee_id == user["employee_id"])
        .first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2️⃣ Read file
    file_bytes = file.file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # 3️⃣ Encrypt file
    crypto = encrypt_file(
        file_bytes=file_bytes,
        master_key=settings.FILE_MASTER_KEY.encode(),
    )

    # 4️⃣ Store encrypted file
    os.makedirs("storage", exist_ok=True)
    encrypted_path = f"storage/{uuid.uuid4().hex}.enc"

    with open(encrypted_path, "wb") as f:
        f.write(crypto["encrypted_file"])

    # 5️⃣ Save metadata
    record = SecureFile(
        filename=file.filename,
        owner_id=db_user.id,
        department=db_user.department,
        classification=classification,
        encrypted_key=crypto["encrypted_key"],
        encrypted_path=encrypted_path,
        size=len(file_bytes),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    # 🧾 AUDIT: FILE UPLOAD
    create_audit_log(
        db=db,
        user_id=db_user.id,
        action="UPLOAD_FILE",
        resource=f"file:{record.id}",
        ip=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
        request_body={
            "classification": classification,
            "filename": file.filename,
        },
    )

    return {
        "message": "File securely uploaded",
        "file_id": record.id,
    }


# =========================================================
# 🔓 SECURE FILE DOWNLOAD (ZERO TRUST + AUDIT)
# =========================================================
@router.get("/{file_id}")
def download_file(
    file_id: int,
    biometric_verified: bool = False,
    mfa_verified: bool = False,
    request: Request = None,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1️⃣ Fetch file
    file = db.query(SecureFile).filter(SecureFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # 2️⃣ Fetch DB user
    db_user = (
        db.query(User)
        .filter(User.employee_id == user["employee_id"])
        .first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3️⃣ RBAC check
    if not has_access(
        {
            "id": db_user.id,
            "role": db_user.role,
            "department": db_user.department,
        },
        file,
    ):
        create_audit_log(
            db=db,
            user_id=db_user.id,
            action="ACCESS_DENIED_RBAC",
            resource=f"file:{file.id}",
            ip=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None,
        )
        raise HTTPException(status_code=403, detail="RBAC denied")

    # 4️⃣ Classification checks
    if file.classification in ["Secret", "Top Secret"] and not biometric_verified:
        create_audit_log(
            db=db,
            user_id=db_user.id,
            action="ACCESS_DENIED_BIOMETRIC",
            resource=f"file:{file.id}",
            ip=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None,
        )
        raise HTTPException(
            status_code=403,
            detail="Biometric verification required",
        )

    if file.classification == "Top Secret" and not mfa_verified:
        create_audit_log(
            db=db,
            user_id=db_user.id,
            action="ACCESS_DENIED_MFA",
            resource=f"file:{file.id}",
            ip=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None,
        )
        raise HTTPException(
            status_code=403,
            detail="MFA verification required",
        )

    # 5️⃣ Load encrypted file
    if not os.path.exists(file.encrypted_path):
        raise HTTPException(
            status_code=500,
            detail="Encrypted file missing",
        )

    encrypted_data = open(file.encrypted_path, "rb").read()

    # 6️⃣ Decrypt
    decrypted_data = decrypt_file(
        encrypted_file=encrypted_data,
        encrypted_key=file.encrypted_key,
        master_key=settings.FILE_MASTER_KEY.encode(),
    )

    # 7️⃣ AUDIT: SUCCESSFUL DOWNLOAD
    create_audit_log(
        db=db,
        user_id=db_user.id,
        action="DOWNLOAD_FILE",
        resource=f"file:{file.id}",
        ip=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
        request_body={
            "biometric_verified": biometric_verified,
            "mfa_verified": mfa_verified,
        },
    )

    # 8️⃣ Stream file
    return StreamingResponse(
        io.BytesIO(decrypted_data),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{file.filename}"',
        },
    )
