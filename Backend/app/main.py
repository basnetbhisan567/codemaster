from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import text
import uvicorn

from app.config import settings
from app.core.logger import logger
from app.core.exceptions import (
    AppException,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
)
from app.middleware.cors_middleware import setup_cors
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.error_handler import setup_error_handlers
from app.middleware.rate_limit_middleware import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info(f"🚀 {settings.APP_NAME} API v1.0.0 starting...")
    logger.info(f"📍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔗 Port: {settings.PORT}")
    logger.info(f"📖 Docs: http://localhost:{settings.PORT}/docs")
    logger.info(f"📚 ReDoc: http://localhost:{settings.PORT}/redoc")
    logger.info("=" * 60)

    try:
        from app.core.database import engine, Base
        import app.models  # noqa: F401

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("✅ Database connection pool created")
        logger.info("✅ Database tables verified/created")
    except Exception as e:
        logger.warning(f"⚠️ Database not configured: {e}")

    try:
        from app.core.redis import redis_client
        await redis_client.ping()
        logger.info("✅ Redis connection established")
    except Exception as e:
        logger.warning(f"⚠️ Redis not available: {e}")

    try:
        from app.workers.celery_app import celery_app  # noqa: F401
        logger.info("✅ Celery workers ready")
    except Exception as e:
        logger.warning(f"⚠️ Celery not configured: {e}")

    yield

    logger.info("=" * 60)
    logger.info(f"👋 {settings.APP_NAME} API shutting down...")

    try:
        from app.core.database import engine
        await engine.dispose()
        logger.info("✅ Database connections closed")
    except Exception:
        pass

    try:
        from app.core.redis import redis_client
        await redis_client.close()
        logger.info("✅ Redis connections closed")
    except Exception:
        pass

    logger.info("=" * 60)


app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## CodeMaster API - Premium Coding Education Platform

    ### Features:
    - **🔐 Authentication** - JWT-based login/register with 2FA
    - **📚 Learning** - Topics, lessons, and progress tracking
    - **🏆 Problems** - Coding challenges with AI-powered hints
    - **💻 Projects** - 5-level project system with auto-grading
    - **🤖 AI Tutor** - Multi-provider AI (OpenAI, Anthropic, Gemini)
    - **👥 Community** - Forums, study groups, real-time chat
    - **💼 Jobs** - Fresh job listings with auto-cleanup
    - **📰 News** - Daily tech news aggregation
    - **🎵 Music** - Focus-enhancing study music
    - **🔒 Focus Mode** - Lockdown system with quiz-based unlock
    - **📊 Analytics** - User engagement and progress analytics
    - **💳 Payments** - Stripe integration for premium plans
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "CodeMaster Support",
        "email": "support@codemaster.com",
        "url": "https://codemaster.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    terms_of_service="https://codemaster.com/terms",
)

setup_cors(app)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
setup_error_handlers(app)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
            },
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append(
            {
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
        )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": errors,
            },
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": str(exc) if settings.DEBUG else None,
            },
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.get("/")
async def root():
    return {
        "success": True,
        "data": {
            "name": settings.APP_NAME,
            "version": "1.0.0",
            "status": "running",
            "environment": settings.ENVIRONMENT,
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/health")
async def health_check():
    health_status = {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "checks": {
            "api": {"status": "ok"},
            "database": {"status": "unknown"},
            "redis": {"status": "unknown"},
            "celery": {"status": "unknown"},
        },
        "timestamp": datetime.utcnow().isoformat(),
    }

    try:
        from app.core.database import engine
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {"status": "ok"}
    except Exception as e:
        health_status["checks"]["database"] = {"status": "error", "message": str(e)}
        health_status["status"] = "degraded"

    try:
        from app.core.redis import redis_client
        await redis_client.ping()
        health_status["checks"]["redis"] = {"status": "ok"}
    except Exception as e:
        health_status["checks"]["redis"] = {"status": "error", "message": str(e)}
        health_status["status"] = "degraded"

    return health_status


@app.get("/ping")
async def ping():
    return {"pong": True, "timestamp": datetime.utcnow().isoformat()}


from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )