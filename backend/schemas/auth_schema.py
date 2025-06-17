from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    id: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    fullName: Optional[str] = None
    error: Optional[str] = None
