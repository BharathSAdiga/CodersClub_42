from pydantic_settings import BaseSettings
from typing import List
import json

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "UDYOGA Financial Intelligence Platform"
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./udyoga.db"
    
    DEMO_MODE: bool = True
    JWT_SECRET_KEY: str = "udyoga-production-hardening-secret-key-2026-secure-jwt-token"
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "udyoga-api"
    JWT_AUDIENCE: str = "udyoga-platform"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_MIN_LENGTH: int = 8

    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-1.5-flash"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
