from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str
    FILE_MASTER_KEY: str
    BIOMETRIC_API_URL: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
