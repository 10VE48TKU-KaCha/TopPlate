from typing import Optional
from pydantic import BaseModel

class InventoryItemCreate(BaseModel):
    name: str
    currentStock: float
    minStock: float
    unit: str

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    currentStock: Optional[float] = None
    minStock: Optional[float] = None
    unit: Optional[str] = None

class InventoryItemResponse(BaseModel):
    id: str
    storeId: str
    name: str
    currentStock: float
    minStock: float
    unit: str
