from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.database import db
from app.security.dependencies import get_current_tenant_context, TenantContext, require_roles

router = APIRouter(prefix="/tables", tags=["Table Management"])

class TableCreate(BaseModel):
    tableNumber: str
    capacity: int = 4

class TableStatusUpdate(BaseModel):
    status: str

class TableResponse(BaseModel):
    id: str
    storeId: str
    tableNumber: str
    capacity: int
    status: str

@router.get("", response_model=List[TableResponse])
async def list_tables(
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    tables = await db.table.find_many(
        where={"storeId": tenant.store_id},
        order={"tableNumber": "asc"}
    )
    return [
        TableResponse(
            id=t.id,
            storeId=t.storeId,
            tableNumber=t.tableNumber,
            capacity=t.capacity,
            status=t.status
        )
        for t in tables
    ]

@router.post("", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(
    payload: TableCreate,
    tenant: TenantContext = Depends(get_current_tenant_context),
    _: None = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    existing = await db.table.find_first(
        where={"storeId": tenant.store_id, "tableNumber": payload.tableNumber}
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Table number already exists in this store")

    table = await db.table.create(
        data={
            "storeId": tenant.store_id,
            "tableNumber": payload.tableNumber,
            "capacity": payload.capacity,
            "status": "AVAILABLE"
        }
    )
    return TableResponse(
        id=table.id,
        storeId=table.storeId,
        tableNumber=table.tableNumber,
        capacity=table.capacity,
        status=table.status
    )

@router.patch("/{table_id}/status", response_model=TableResponse)
async def update_table_status(
    table_id: str,
    payload: TableStatusUpdate,
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    table = await db.table.find_first(
        where={"id": table_id, "storeId": tenant.store_id}
    )
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found for this tenant")

    updated = await db.table.update(
        where={"id": table_id},
        data={"status": payload.status}
    )
    return TableResponse(
        id=updated.id,
        storeId=updated.storeId,
        tableNumber=updated.tableNumber,
        capacity=updated.capacity,
        status=updated.status
    )
