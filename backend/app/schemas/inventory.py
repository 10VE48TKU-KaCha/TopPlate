from typing import Optional
from pydantic import BaseModel

class InventoryItemCreate(BaseModel):
    name: str
    currentStock: float
    minStock: float
    unit: str
    unitCost: float = 0.0

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    currentStock: Optional[float] = None
    minStock: Optional[float] = None
    unit: Optional[str] = None
    unitCost: Optional[float] = None

class InventoryItemResponse(BaseModel):
    id: str
    storeId: str
    name: str
    currentStock: float
    minStock: float
    unit: str
    unitCost: float = 0.0
