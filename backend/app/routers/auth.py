from fastapi import APIRouter, HTTPException, status, Depends
from app.database import db
from app.schemas.auth import LoginRequest, RegisterUserRequest, TokenResponse, UserResponse
from app.security.jwt import get_password_hash, verify_password, create_access_token
from app.security.dependencies import get_current_user, AuthenticatedUser, require_roles

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    user = await db.user.find_unique(where={"email": credentials.email})
    if not user or not verify_password(credentials.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "store_id": user.storeId,
        "full_name": user.fullName,
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.fullName,
        store_id=user.storeId
    )

@router.post("/register", response_model=UserResponse)
async def register(
    req: RegisterUserRequest,
    current_user: AuthenticatedUser = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    existing = await db.user.find_unique(where={"email": req.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Role hierarchy enforcement
    if current_user.role == "STORE_ADMIN":
        # STORE_ADMIN can only create EMPLOYEE accounts for their own store
        if req.role != "EMPLOYEE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Store Admin can only create Employee accounts"
            )
        store_id_to_assign = current_user.store_id
    else:
        # SUPER_ADMIN can create any role
        store_id_to_assign = req.storeId

    hashed_pw = get_password_hash(req.password)
    user = await db.user.create(
        data={
            "email": req.email,
            "passwordHash": hashed_pw,
            "fullName": req.fullName,
            "role": req.role,
            "storeId": store_id_to_assign
        }
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        fullName=user.fullName,
        role=user.role,
        storeId=user.storeId
    )

@router.get("/me", response_model=AuthenticatedUser)
async def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    return current_user
