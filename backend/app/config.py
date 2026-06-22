"""
FarmIntel – Configuration
Reads all settings from environment variables (or .env file).
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://farmintel_user:farmintel_pass@localhost:5432/farmintel_db"

    # ── Security ──────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-to-a-long-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── App metadata ──────────────────────────────────────────────────────
    APP_NAME: str = "FarmIntel"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    return Settings()

