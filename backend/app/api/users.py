from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import numpy as np
import cv2

from app.database import get_db
from app.models.user import User
from app.models.biometric import BiometricData

from app.utils.auth import get_current_user
from app.utils.rbac import require_roles
from app.core.security import hash_password
from app.utils.audit import create_audit_log

import face_recognition  # ✅ dlib-based

router = APIRouter(prefix="/users", tags=["Users"])


# =========================================================
# 👤 CREATE USER WITH BIOMETRICS (DLIB)
# =========================================================
@router.post(
    "/create",
    dependencies=[Depends(require_roles("SUPER_ADMIN", "ADMIN"))],
)
async def create_user_with_biometrics(
    employee_id: str = Form(...),
    name: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    department: str = Form(...),
    face_image: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1️⃣ Prevent duplicate employee
    if db.query(User).filter(User.employee_id == employee_id).first():
        raise HTTPException(status_code=400, detail="Employee already exists")

    # 2️⃣ Read image
    image_bytes = await face_image.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # 3️⃣ Convert BGR → RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # 4️⃣ Detect & encode face (DLIB)
    face_locations = face_recognition.face_locations(rgb_image)
    if len(face_locations) == 0:
        raise HTTPException(status_code=400, detail="No face detected")

    face_encodings = face_recognition.face_encodings(
        rgb_image, face_locations
    )

    if len(face_encodings) == 0:
        raise HTTPException(status_code=400, detail="Face encoding failed")

    embedding = face_encodings[0]  # 128-D vector

    # 5️⃣ Create user
    user = User(
        employee_id=employee_id,
        name=name,
        password_hash=hash_password(password),
        role=role,
        department=department,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 6️⃣ Store biometric
    biometric = BiometricData(
        user_id=user.id,
        face_encoding=np.asarray(embedding, dtype=np.float32).tobytes(),
    )
    db.add(biometric)
    db.commit()

    # 7️⃣ Audit log
    create_audit_log(
        db=db,
        user_id=current_user["id"],
        action="CREATE_EMPLOYEE",
        resource=f"user:{user.id}",
        ip=None,
        user_agent=None,
    )

    return {
        "message": "Employee created with biometric enrollment",
        "user_id": user.id,
        "employee_id": employee_id,
    }


# =========================================================
# 📋 GET ALL USERS
# =========================================================
@router.get(
    "",
    dependencies=[Depends(require_roles("SUPER_ADMIN", "ADMIN"))],
)
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "employee_id": u.employee_id,
            "name": u.name,
            "role": u.role,
            "department": u.department,
            "is_active": u.is_active,
        }
        for u in users
    ]
