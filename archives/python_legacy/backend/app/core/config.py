from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Office SaaS Management System"
    SECRET_KEY: str = "YOUR_SECRET_KEY"  # Change this in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MONGO_DETAILS: str = "mongodb://localhost:27017"

    class Config:
        env_file = ".env"

settings = Settings()
