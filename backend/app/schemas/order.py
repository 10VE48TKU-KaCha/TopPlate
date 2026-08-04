from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class OrderItemCreate(BaseModel):
    menuItemId: str
    quantity: int

class OrderCreate(BaseModel):
    tableId: Optional[str] = None
    customerNotes: Optional[str] = None
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str # PENDING, COOKING, SERVED, COMPLETED, CANCELLED

class OrderItemResponse(BaseModel):
    id: str
    menuItemId: str
    menuItemName: Optional[str] = None
    quantity: int
    unitPrice: float
    unitCost: float = 0.0
    recipeCost: float = 0.0
    subtotal: float

class OrderResponse(BaseModel):
    id: str
    storeId: str
    tableId: Optional[str] = None
    tableNumber: Optional[str] = None
    status: str
    totalAmount: float
    totalCost: float = 0.0
    grossProfit: float = 0.0
    customerNotes: Optional[str] = None
    createdAt: datetime
    orderItems: List[OrderItemResponse]
