from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CodeMaster"
    PORT: int = 5000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./codemaster.db"
    REDIS_URL: str = "redis://localhost:6379/0"

# JWT
    SECRET_KEY: str = "9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c"
    JWT_SECRET: str = "9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c" # <-- Add this line
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # CORS - Allow ALL localhost ports used by frontend and Swagger
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
    ]

    # FREE AI APIs
    GEMINI_API_KEY: str = ""
    GOOGLE_AI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    # Local AI
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_ENABLED: bool = False
    LOCALAI_BASE_URL: str = "http://localhost:8080"
    LOCALAI_ENABLED: bool = False

    # Security
    SNYK_API_KEY: str = ""

    # Email
    RESEND_API_KEY: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""

    # SMS
    TWILIO_SID: str = ""
    TWILIO_TOKEN: str = ""
    TWILIO_PHONE: str = ""

    # Storage (AWS S3)
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""
    S3_BUCKET: str = ""
    S3_REGION: str = "us-east-1"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
