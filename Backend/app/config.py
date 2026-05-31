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
    GEMINI_API_KEY: str = "AIzaSyCQgvh39aNRlvc5JZZN5h5y_B9byVdYDaM"
    GOOGLE_AI_API_KEY: str = "AIzaSyCQgvh39aNRlvc5JZZN5h5y_B9byVdYDaM"
    GROQ_API_KEY: str = "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"
    DEEPSEEK_API_KEY: str = "sk-b865ed2852f841a69c00c6c8138b33ce"
    OPENROUTER_API_KEY: str = "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"

    # Local AI
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_ENABLED: bool = False
    LOCALAI_BASE_URL: str = "http://localhost:8080"
    LOCALAI_ENABLED: bool = False

    # Security
    SNYK_API_KEY: str = "203561fe-1778-486a-bf66-fabc3750c825"

    # Email
    RESEND_API_KEY: str = ""
    STRIPE_SECRET_KEY: str = "sk_test_51TccZT1rTYVRDCiu6mazKYInueVArPom0TSDuhjslAxOltbhsrAzOeMUD5ATxNZXidyiT587JcKTU09hflD7Nhb90093PKwZMm"
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_51TccZT1rTYVRDCiujqB1Tq6BjUTNVBZV8I4zsJEMuzU47mMkurpa13gaDLCAAHK399qbLACaKU0NbhkEMPrV6hFD00BSpu62Ht"

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