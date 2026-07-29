from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterUserRequest(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    role: str = "EMPLOYEE"
    storeId: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    full_name: str
    store_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    fullName: str
    role: str
    storeId: Optional[str] = None
