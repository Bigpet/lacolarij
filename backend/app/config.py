"""Application configuration using pydantic-settings."""

import secrets
from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server settings
    host: str = "127.0.0.1"
    port: int = 8080
    debug: bool = False

    # Allow DEBUG to accept non-boolean values (e.g., "pw:api" for debugging)
    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v: bool | str) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            # Accept any non-empty string as truthy for debugging
            # This allows DEBUG=pw:api, DEBUG=1, DEBUG=true, etc.
            return v.lower() not in ("", "0", "false", "no", "off")
        return bool(v)

    # Database
    database_path: Path = Path(__file__).parent.parent / "data" / "jiralocal.db"

    # Security
    secret_key: str = secrets.token_urlsafe(32)  # JWT signing key
    encryption_key: str = ""  # Fernet key for API token encryption (generated if empty)
    access_token_expire_minutes: int = 60 * 24 * 30  # 30 days
    algorithm: str = "HS256"

    # JIRA defaults (for mock server)
    jira_default_url: str = "http://localhost:8000"
    jira_default_project: str = "TEST"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
