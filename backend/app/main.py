from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_db, disconnect_db, db
from app.routers import auth, stores, menu, inventory, orders, tables
from app.security.jwt import get_password_hash

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    # Seed default SuperAdmin if none exists
    try:
        super_admin = await db.user.find_first(where={"role": "SUPER_ADMIN"})
        if not super_admin:
            await db.user.create(
                data={
                    "email": "superadmin@topplate.com",
                    "passwordHash": get_password_hash("SuperAdminPass123!"),
                    "fullName": "System Super Admin",
                    "role": "SUPER_ADMIN",
                }
            )
            print("INFO: Default SuperAdmin initialized (superadmin@topplate.com / SuperAdminPass123!)")
    except Exception as e:
        print(f"WARNING: Automatic DB seeding skipped or pending migration: {e}")
    
    yield
    await disconnect_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(stores.router, prefix=settings.API_V1_STR)
app.include_router(menu.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(tables.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

