from fastapi import Depends, HTTPException, status
from app.utils.auth import get_current_user


# =========================================================
# ROLE-BASED ROUTE PROTECTION (API-LEVEL)
# =========================================================
def require_roles(*allowed_roles):
    """
    Enforces role-based access at route level
    Works with JWT user (dict)
    """
    def role_checker(user=Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: insufficient role"
            )
        return user

    return role_checker


# =========================================================
# FILE-LEVEL ACCESS CONTROL (ZERO TRUST)
# =========================================================
def has_access(user: dict, file) -> bool:
    """
    Determines whether a user can access a file.

    user  -> dict (JWT payload)
    file  -> SecureFile SQLAlchemy model
    """

    role = user.get("role")
    department = user.get("department")

    # 🔑 SUPER ADMIN → Full access
    if role == "SUPER_ADMIN":
        return True

    # 🛡️ SECURITY OFFICER → Read access to all files
    if role == "SECURITY_OFFICER":
        return True

    # 👑 ADMIN → All except TOP_SECRET
    if role == "ADMIN":
        return file.classification != "Top Secret"

    # 🏢 DEPT OFFICER → Same department only
    if role == "DEPT_OFFICER":
        return file.department == department

    # 🗂️ CLERK → Public + Internal only
    if role == "CLERK":
        return file.classification in ["Public", "Internal"]

    # 📋 AUDITOR → No file download
    if role == "AUDITOR":
        return False

    return False
