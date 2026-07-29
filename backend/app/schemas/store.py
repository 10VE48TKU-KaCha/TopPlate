from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class StoreCreate(BaseModel):
    name: str
    slug: str
    address: Optional[str] = None
    phone: Optional[str] = None

class StoreResponse(BaseModel):
    id: str
    name: str
    slug: str
    address: Optional[str] = None
    phone: Optional[str] = None
    createdAt: datetime
