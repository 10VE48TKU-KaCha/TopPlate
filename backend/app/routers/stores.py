from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import db
from app.schemas.store import StoreCreate, StoreResponse
from app.security.dependencies import AuthenticatedUser, require_roles

router = APIRouter(prefix="/stores", tags=["Store Management"])

@router.get("", response_model=List[StoreResponse])
async def list_stores(
    current_user: AuthenticatedUser = Depends(require_roles(["SUPER_ADMIN"]))
):
    stores = await db.store.find_many(order={"createdAt": "desc"})
    return [
        StoreResponse(
            id=s.id,
            name=s.name,
            slug=s.slug,
            address=s.address,
            phone=s.phone,
            createdAt=s.createdAt
        )
        for s in stores
    ]

@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def create_store(
    payload: StoreCreate,
    current_user: AuthenticatedUser = Depends(require_roles(["SUPER_ADMIN"]))
):
    existing = await db.store.find_unique(where={"slug": payload.slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store with this slug already exists"
        )
    
    store = await db.store.create(
        data={
            "name": payload.name,
            "slug": payload.slug,
            "address": payload.address,
            "phone": payload.phone
        }
    )

    # Seed default tables for the new store
    for i in range(1, 6):
        await db.table.create(
            data={
                "storeId": store.id,
                "tableNumber": f"Table {i}",
                "capacity": 4,
                "status": "AVAILABLE"
            }
        )

    return StoreResponse(
        id=store.id,
        name=store.name,
        slug=store.slug,
        address=store.address,
        phone=store.phone,
        createdAt=store.createdAt
    )

@router.get("/{store_id}", response_model=StoreResponse)
async def get_store_details(
    store_id: str,
    current_user: AuthenticatedUser = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    if current_user.role != "SUPER_ADMIN" and current_user.store_id != store_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this store")

    store = await db.store.find_unique(where={"id": store_id})
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")

    return StoreResponse(
        id=store.id,
        name=store.name,
        slug=store.slug,
        address=store.address,
        phone=store.phone,
        createdAt=store.createdAt
    )
