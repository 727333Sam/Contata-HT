"""Application configuration using pydantic-settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Core application settings loaded from .env."""

    DATABASE_URL: str = "postgresql://postgres:admin@localhost:5432/taskflow_pro"
    CLAUDE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    SECRET_KEY: str = "super-secret-key-change-in-production"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings singleton."""
    return Settings()
