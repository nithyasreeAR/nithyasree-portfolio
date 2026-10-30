from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://portfolio:portfolio@localhost:5432/portfolio"
    frontend_origins: str = "http://localhost:3000"
    resend_api_key: str = ""
    resend_from_email: str = ""
    contact_recipient_email: str = "nithyasree2904@gmail.com"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_use_tls: bool = True
    smtp_timeout_seconds: int = 15
    # Absolute paths make local config independent of the process working directory.
    # Process environment always takes precedence over dotenv files.
    model_config = SettingsConfigDict(
        env_file=(BACKEND_ROOT / ".env", PROJECT_ROOT / ".env.local"),
        extra="ignore",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def use_installed_postgres_driver(cls, value: str) -> str:
        # The project installs psycopg 3, while hosted URLs commonly omit a driver.
        if isinstance(value, str) and value.startswith("postgres://"):
            return "postgresql+psycopg://" + value.removeprefix("postgres://")
        if isinstance(value, str) and value.startswith("postgresql://"):
            return "postgresql+psycopg://" + value.removeprefix("postgresql://")
        return value

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
