from typing import Optional
from pydantic import BaseModel

class UserUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    role: Optional[str] = None
    storeId: Optional[str] = None
