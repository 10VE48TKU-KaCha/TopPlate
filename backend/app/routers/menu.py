from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import db
from app.schemas.menu import CategoryCreate, CategoryResponse, MenuItemCreate, MenuItemResponse
from app.security.dependencies import get_current_tenant_context, TenantContext, require_roles

router = APIRouter(prefix="/menu", tags=["Menu Management"])

# --- Public Endpoint for Customer QR Menu ---
@router.get("/public/{store_id}", response_model=List[MenuItemResponse])
async def get_public_menu(store_id: str):
    items = await db.menuitem.find_many(
        where={"storeId": store_id, "isAvailable": True},
        include={"category": True}
    )
    return [
        MenuItemResponse(
            id=item.id,
            storeId=item.storeId,
            categoryId=item.categoryId,
            name=item.name,
            description=item.description,
            price=item.price,
            imageUrl=item.imageUrl,
            isAvailable=item.isAvailable
        )
        for item in items
    ]

# --- Tenant Admin & Employee Endpoints ---
@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    categories = await db.category.find_many(
        where={"storeId": tenant.store_id},
        order={"name": "asc"}
    )
    return [
        CategoryResponse(
            id=c.id,
            storeId=c.storeId,
            name=c.name,
            description=c.description
        )
        for c in categories
    ]

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    tenant: TenantContext = Depends(get_current_tenant_context),
    _: None = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    category = await db.category.create(
        data={
            "storeId": tenant.store_id,
            "name": payload.name,
            "description": payload.description
        }
    )
    return CategoryResponse(
        id=category.id,
        storeId=category.storeId,
        name=category.name,
        description=category.description
    )

@router.get("/items", response_model=List[MenuItemResponse])
async def list_menu_items(
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    items = await db.menuitem.find_many(
        where={"storeId": tenant.store_id},
        include={"category": True}
    )
    return [
        MenuItemResponse(
            id=item.id,
            storeId=item.storeId,
            categoryId=item.categoryId,
            name=item.name,
            description=item.description,
            price=item.price,
            imageUrl=item.imageUrl,
            isAvailable=item.isAvailable
        )
        for item in items
    ]

@router.post("/items", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    payload: MenuItemCreate,
    tenant: TenantContext = Depends(get_current_tenant_context),
    _: None = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    # Verify category belongs to store
    category = await db.category.find_first(
        where={"id": payload.categoryId, "storeId": tenant.store_id}
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found for this tenant"
        )

    item = await db.menuitem.create(
        data={
            "storeId": tenant.store_id,
            "categoryId": payload.categoryId,
            "name": payload.name,
            "description": payload.description,
            "price": payload.price,
            "imageUrl": payload.imageUrl,
            "isAvailable": payload.isAvailable,
        }
    )

    if payload.recipes:
        for r in payload.recipes:
            await db.menuitemrecipe.create(
                data={
                    "menuItemId": item.id,
                    "inventoryItemId": r.inventoryItemId,
                    "quantityRequired": r.quantityRequired
                }
            )

    return MenuItemResponse(
        id=item.id,
        storeId=item.storeId,
        categoryId=item.categoryId,
        name=item.name,
        description=item.description,
        price=item.price,
        imageUrl=item.imageUrl,
        isAvailable=item.isAvailable
    )
