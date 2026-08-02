from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import numpy as np

from app.database import get_db
from app.utils.auth import get_current_user
from app.utils.face_utils import encode_face, verify_faces
from app.utils.audit import create_audit_log
from app.models.biometric import BiometricData

router = APIRouter(prefix="/biometric", tags=["Biometric"])

FACE_THRESHOLD = 0.6  # Recommended for face_recognition


# =========================================================
# 🔐 ENROLL BIOMETRIC
# =========================================================
@router.post("/enroll")
async def enroll_biometric(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_bytes = await file.read()

    encoding = encode_face(image_bytes)
    if encoding is None:
        raise HTTPException(400, "No face detected")

    encoding_bytes = encoding.astype("float32").tobytes()

    record = db.query(BiometricData).filter(
        BiometricData.user_id == user["id"]
    ).first()

    if record:
        record.face_encoding = encoding_bytes
    else:
        db.add(BiometricData(
            user_id=user["id"],
            face_encoding=encoding_bytes
        ))

    db.commit()

    create_audit_log(
        db=db,
        user_id=user["id"],
        action="BIOMETRIC_ENROLL",
        resource="SELF",
        ip=None,
        user_agent=None,
    )

    return {"message": "Biometric enrolled successfully"}


# =========================================================
# 🔐 VERIFY BEFORE DOWNLOAD
# =========================================================
@router.post("/verify-download")
async def verify_before_download(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(BiometricData).filter(
        BiometricData.user_id == user["id"]
    ).first()

    if not record:
        raise HTTPException(404, "Biometric not enrolled")

    stored_encoding = np.frombuffer(
        record.face_encoding, dtype=np.float32
    )

    image_bytes = await file.read()
    live_encoding = encode_face(image_bytes)

    if live_encoding is None:
        raise HTTPException(400, "No face detected")

    verified, distance = verify_faces(
        stored_encoding,
        live_encoding,
        threshold=FACE_THRESHOLD
    )

    create_audit_log(
        db=db,
        user_id=user["id"],
        action=f"BIOMETRIC_VERIFY_{'SUCCESS' if verified else 'DENIED'}",
        resource="FILE_DOWNLOAD",
        ip=None,
        user_agent=None,
    )

    if not verified:
        raise HTTPException(403, "Biometric verification failed")

    return {
        "verified": True,
        "distance": round(distance, 3)
    }
