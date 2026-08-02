from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        # 🔐 Decode JWT
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        employee_id = payload.get("sub")
        role = payload.get("role")

        if not employee_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        # 🔥 Fetch full user from DB
        user = (
            db.query(User)
            .filter(User.employee_id == employee_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # ✅ NORMALIZED USER OBJECT (USED EVERYWHERE)
        return {
            "id": user.id,                     # 🔑 REQUIRED (files, ownership)
            "employee_id": user.employee_id,   # 🔑 Required
            "role": user.role,                 # 🔑 RBAC
            "department": user.department      # 🔑 File access control
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
