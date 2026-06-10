from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration centralisee, lue depuis les variables d'environnement."""

    database_url: str = "sqlite:///./congesflow.db"
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
