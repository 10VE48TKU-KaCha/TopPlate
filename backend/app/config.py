import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TopPlate SaaS Multi-Tenant Platform"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://topplate_admin:topplate_secret_password@localhost:5432/topplate_db?schema=public")
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "topplate_super_secret_jwt_key_32_chars_min_len")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

    class Config:
        case_sensitive = True

settings = Settings()
