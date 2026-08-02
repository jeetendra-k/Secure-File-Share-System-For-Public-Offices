from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    role: str
    department: str
    is_active: bool

    class Config:
        from_attributes = True
