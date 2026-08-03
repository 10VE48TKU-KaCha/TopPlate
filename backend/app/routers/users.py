from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.database import db
from app.schemas.auth import UserResponse
from app.schemas.users import UserUpdateRequest
from app.security.dependencies import get_current_user, AuthenticatedUser, require_roles

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
async def list_users(
    store_id: Optional[str] = None,
    current_user: AuthenticatedUser = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    where_clause = {}
    
    if current_user.role == "STORE_ADMIN":
        if not current_user.store_id:
            return []
        where_clause["storeId"] = current_user.store_id
        where_clause["role"] = {"in": ["EMPLOYEE", "STORE_ADMIN"]}
    elif store_id:
        where_clause["storeId"] = store_id

    users = await db.user.find_many(where=where_clause if where_clause else None)
    
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            fullName=u.fullName,
            role=u.role,
            storeId=u.storeId
        ) for u in users
    ]

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    req: UserUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role == "STORE_ADMIN":
        if user.storeId != current_user.store_id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this user")
        # Store admin cannot change a user's storeId to something else, or make them a SUPER_ADMIN/STORE_ADMIN
        if req.storeId and req.storeId != current_user.store_id:
            raise HTTPException(status_code=403, detail="Cannot move user to another store")
        if req.role and req.role != "EMPLOYEE":
            raise HTTPException(status_code=403, detail="Store Admin can only assign Employee role")
            
    update_data = {}
    if req.fullName is not None:
        update_data["fullName"] = req.fullName
    if req.role is not None:
        update_data["role"] = req.role
    if req.storeId is not None:
        update_data["storeId"] = req.storeId
        
    updated_user = await db.user.update(
        where={"id": user_id},
        data=update_data
    )
    
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        fullName=updated_user.fullName,
        role=updated_user.role,
        storeId=updated_user.storeId
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: AuthenticatedUser = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role == "STORE_ADMIN":
        if user.storeId != current_user.store_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this user")
            
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    await db.user.delete(where={"id": user_id})
    return {"message": "User deleted successfully"}
