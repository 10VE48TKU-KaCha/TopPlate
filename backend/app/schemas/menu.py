from typing import List, Optional
from pydantic import BaseModel

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    storeId: str
    name: str
    description: Optional[str] = None

class MenuItemRecipeItem(BaseModel):
    inventoryItemId: str
    quantityRequired: float

class MenuItemCreate(BaseModel):
    categoryId: str
    name: str
    description: Optional[str] = None
    price: float
    imageUrl: Optional[str] = None
    isAvailable: bool = True
    recipes: Optional[List[MenuItemRecipeItem]] = []

class MenuItemResponse(BaseModel):
    id: str
    storeId: str
    categoryId: str
    name: str
    description: Optional[str] = None
    price: float
    imageUrl: Optional[str] = None
    isAvailable: bool
    recipeCost: float = 0.0
    profitMargin: float = 0.0
