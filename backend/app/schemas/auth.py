from pydantic import BaseModel


# =========================
# Login Request Schema
# =========================
class LoginRequest(BaseModel):
    employee_id: str
    password: str


# =========================
# User Output Schema
# =========================
class UserOut(BaseModel):
    id: int
    employee_id: str
    role: str
    department: str | None = None

    model_config = {
        "from_attributes": True
    }


# =========================
# Login Response Schema
# =========================
class TokenResponse(BaseModel):
    token: str
    user: UserOut
