from typing import List, Optional
from fastapi import Depends, HTTPException, Security, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from prisma.models import User
from app.security.jwt import decode_access_token
from app.database import db

security = HTTPBearer(auto_error=True)

class TokenPayload(BaseModel):
    sub: str
    email: str
    role: str
    store_id: Optional[str] = None
    full_name: Optional[str] = None

class AuthenticatedUser(BaseModel):
    id: str
    email: str
    role: str
    store_id: Optional[str] = None
    full_name: str

class TenantContext(BaseModel):
    user_id: str
    store_id: str
    role: str
    email: str
    full_name: str

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> AuthenticatedUser:
    token = credentials.credentials
    payload_data = decode_access_token(token)
    if not payload_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload_data.get("sub")
    email = payload_data.get("email")
    role = payload_data.get("role")
    store_id = payload_data.get("store_id")
    full_name = payload_data.get("full_name", "")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload",
        )

    return AuthenticatedUser(
        id=user_id,
        email=email,
        role=role,
        store_id=store_id,
        full_name=full_name
    )

async def get_current_tenant_context(
    current_user: AuthenticatedUser = Depends(get_current_user),
    x_store_id: Optional[str] = Header(None, alias="X-Store-Id")
) -> TenantContext:
    """
    ZERO-TRUST TENANT ISOLATION DEPENDENCY
    Extracts store_id strictly from verified JWT claims.
    If SUPER_ADMIN is overriding context via X-Store-Id header, allow it for global management.
    Never trust client body or query params for tenant context!
    """
    store_id = current_user.store_id

    # If SuperAdmin is acting on behalf of a store
    if current_user.role == "SUPER_ADMIN":
        if x_store_id:
            store_id = x_store_id
        elif not store_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SuperAdmin must specify tenant via X-Store-Id header for tenant-specific operations"
            )

    if not store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not associated with any active store tenant"
        )

    return TenantContext(
        user_id=current_user.id,
        store_id=store_id,
        role=current_user.role,
        email=current_user.email,
        full_name=current_user.full_name
    )

def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {allowed_roles}"
            )
        return current_user
    return role_checker
