from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import db
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse
from app.security.dependencies import get_current_tenant_context, TenantContext, require_roles

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.get("", response_model=List[InventoryItemResponse])
async def list_inventory_items(
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    items = await db.inventoryitem.find_many(
        where={"storeId": tenant.store_id},
        order={"name": "asc"}
    )
    return [
        InventoryItemResponse(
            id=item.id,
            storeId=item.storeId,
            name=item.name,
            currentStock=item.currentStock,
            minStock=item.minStock,
            unit=item.unit,
            unitCost=getattr(item, 'unitCost', 0.0) or 0.0
        )
        for item in items
    ]

@router.post("", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    payload: InventoryItemCreate,
    tenant: TenantContext = Depends(get_current_tenant_context),
    _: None = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    item = await db.inventoryitem.create(
        data={
            "storeId": tenant.store_id,
            "name": payload.name,
            "currentStock": payload.currentStock,
            "minStock": payload.minStock,
            "unit": payload.unit,
            "unitCost": payload.unitCost
        }
    )
    return InventoryItemResponse(
        id=item.id,
        storeId=item.storeId,
        name=item.name,
        currentStock=item.currentStock,
        minStock=item.minStock,
        unit=item.unit,
        unitCost=item.unitCost
    )

@router.patch("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: str,
    payload: InventoryItemUpdate,
    tenant: TenantContext = Depends(get_current_tenant_context),
    _: None = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN", "EMPLOYEE"]))
):
    existing = await db.inventoryitem.find_first(
        where={"id": item_id, "storeId": tenant.store_id}
    )
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found for this tenant"
        )
    
    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.currentStock is not None:
        update_data["currentStock"] = payload.currentStock
    if payload.minStock is not None:
        update_data["minStock"] = payload.minStock
    if payload.unit is not None:
        update_data["unit"] = payload.unit
    if payload.unitCost is not None:
        update_data["unitCost"] = payload.unitCost

    updated = await db.inventoryitem.update(
        where={"id": item_id},
        data=update_data
    )

    return InventoryItemResponse(
        id=updated.id,
        storeId=updated.storeId,
        name=updated.name,
        currentStock=updated.currentStock,
        minStock=updated.minStock,
        unit=updated.unit,
        unitCost=getattr(updated, 'unitCost', 0.0) or 0.0
    )
