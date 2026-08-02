from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.core.security import verify_password
from app.utils.jwt import create_access_token, create_refresh_token
from app.core.config import settings
from app.utils.audit import create_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])


# =========================================================
# 🔐 LOGIN
# =========================================================
@router.post("/login")
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.employee_id == payload.employee_id
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user.employee_id,
        "role": user.role,
        "user_id": user.id,
    })

    # SAFE AUDIT (cannot crash)
    create_audit_log(
        db=db,
        user_id=user.id,
        action="LOGIN_SUCCESS",
        resource="AUTH",
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return {
        "token": token,
        "user": {
            "id": user.id,
            "employee_id": user.employee_id,
            "role": user.role,
            "department": user.department,
        },
    }


# =========================================================
# 🔄 REFRESH TOKEN
# =========================================================
@router.post("/refresh")
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(
            refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        employee_id = payload.get("sub")
        if not employee_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        user = (
            db.query(User)
            .filter(User.employee_id == employee_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        new_access_token = create_access_token({
            "sub": user.employee_id,
            "role": user.role,
            "user_id": user.id,
        })

        return {
            "token": new_access_token,
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )


# =========================================================
# 🚪 LOGOUT
# =========================================================
@router.post("/logout")
def logout():
    return {
        "message": "Logout successful. Client must delete tokens.",
    }
