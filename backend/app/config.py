"""Application configuration using pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "MakeMeFit API"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql+asyncpg://makemefit:makemefit@localhost:5432/makemefit"
    
    # Telegram
    telegram_bot_token: str
    telegram_bot_username: str
    
    # LLM Provider
    llm_provider: str = "openai"  # openai, anthropic, custom (any OpenAI-compatible)
    llm_api_key: str
    llm_base_url: Optional[str] = None  # Custom base URL for OpenAI-compatible API (e.g., https://foundation-models.api.cloud.ru/v1)
    llm_model: str = "gpt-4o-mini"  # Use small model for anti-fraud
    llm_model_full: str = "gpt-4o"  # Use larger model for full answers
    llm_streaming: bool = True  # Enable streaming for better UX
    
    # Payments
    payment_provider_token: Optional[str] = None  # Telegram payment provider token (optional for testing)
    
    # Security
    secret_key: str  # For JWT signing
    rate_limit_per_minute: int = 10
    
    # Admin
    admin_secret: Optional[str] = None
    
    # PDF
    pdf_storage_path: str = "/tmp/pdfs"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
