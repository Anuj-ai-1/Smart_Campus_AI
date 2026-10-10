import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Smart Campus Student Success & Analytics Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./students.db")
    
    # CORS settings allowing standard frontend dev servers and all origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "*"
    ]
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-campus-jwt-key-2024")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

settings = Settings()
