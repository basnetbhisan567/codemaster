from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware
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
from app.middleware.subscription_middleware import SubscriptionMiddleware


class CORSOnErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Request failed for {request.method} {request.url.path}: {e}", exc_info=True)
            error_response = JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": "An unexpected error occurred",
                        "details": str(e) if settings.DEBUG else None,
                    },
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
            origin = request.headers.get("origin", "*")
            error_response.headers["Access-Control-Allow-Origin"] = origin if origin in settings.CORS_ORIGINS else "*"
            error_response.headers["Access-Control-Allow-Credentials"] = "true"
            error_response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            error_response.headers["Access-Control-Allow-Headers"] = "*"
            error_response.headers["Access-Control-Expose-Headers"] = "*"
            return error_response


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info(f"🚀 {settings.APP_NAME} API v1.0.0 starting...")
    logger.info(f"📍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔗 Port: {settings.PORT}")
    logger.info(f"📖 Docs: http://localhost:{settings.PORT}/docs")
    logger.info("=" * 60)

    # Database setup
    try:
        from app.core.database import engine, Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables ready")
    except Exception as e:
        logger.warning(f"⚠️ Database: {e}")

    # Redis (optional)
    try:
        from app.core.redis import redis_client
        await redis_client.ping()
        logger.info("✅ Redis connected")
    except Exception:
        logger.info("ℹ️ Redis not available (optional)")

    # Check existing data
    job_count = 0
    news_count = 0
    music_count = 0
    tools_count = 0
    try:
        from app.core.database import AsyncSessionLocal
        from app.models.job import Job
        from app.models.news import NewsArticle
        from app.models.music import MusicPlaylist
        from app.models.content import TechTool
        from sqlalchemy import select, func

        async with AsyncSessionLocal() as db:
            job_count = await db.scalar(select(func.count(Job.id)))
            news_count = await db.scalar(select(func.count(NewsArticle.id)))
            music_count = await db.scalar(select(func.count(MusicPlaylist.id)))
            tools_count = await db.scalar(select(func.count(TechTool.id)))
            logger.info(f"📊 Existing data: {job_count} jobs, {news_count} articles, {music_count} playlists, {tools_count} tools")
    except Exception as e:
        logger.warning(f"Content count check failed: {e}")

    # Fetch content if database is empty
    if job_count == 0 or news_count == 0 or music_count == 0 or tools_count == 0:
        logger.info("📡 Fetching fresh content...")

        if news_count == 0:
            try:
                from app.workers.tasks.content_fetcher_tasks import fetch_all_content
                await fetch_all_content()
                logger.info("✅ News, blogs & tools loaded")
            except Exception as e:
                logger.warning(f"Content fetch failed: {e}")

        if job_count == 0:
            try:
                from app.workers.tasks.job_crawler_tasks import fetch_all_jobs
                await fetch_all_jobs()
                logger.info("✅ Jobs loaded")
            except Exception as e:
                logger.warning(f"Job fetch failed: {e}")

        if music_count == 0:
            try:
                import os
                from app.workers.tasks.music_fetcher_tasks import fetch_all_music
                freesound_key = os.getenv("FREESOUND_API_KEY", "")
                logger.info("🎵 Starting music fetch...")
                track_count = await fetch_all_music(freesound_key=freesound_key)
                logger.info(f"✅ Music loaded: {track_count} tracks")
            except Exception as e:
                logger.error(f"Music fetch failed: {e}", exc_info=True)

        if tools_count == 0:
            try:
                from app.workers.tasks.tool_fetcher_tasks import fetch_all_tools
                logger.info("🔧 Starting AI tools fetch...")
                saved = await fetch_all_tools()
                logger.info(f"✅ AI tools loaded: {saved} tools")
            except Exception as e:
                logger.error(f"Tools fetch failed: {e}", exc_info=True)
    else:
        logger.info(f"✅ Database ready: {job_count} jobs, {news_count} articles, {music_count} playlists, {tools_count} tools")

    yield

    logger.info("=" * 60)
    logger.info(f"👋 {settings.APP_NAME} API shutting down...")
    try:
        from app.core.database import engine
        await engine.dispose()
    except Exception:
        pass
    logger.info("=" * 60)


app = FastAPI(
    title=settings.APP_NAME,
    description="CodeMaster API - Premium Coding Education Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware order matters - add in this sequence
app.add_middleware(CORSOnErrorMiddleware)
setup_cors(app)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SubscriptionMiddleware)  # Payment/plan check
setup_error_handlers(app)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {"code": exc.error_code, "message": exc.message, "details": exc.details},
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": "Request validation failed", "details": errors},
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
            "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred", "details": str(exc) if settings.DEBUG else None},
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
            "docs": "/docs",
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
        "checks": {"api": {"status": "ok"}, "database": {"status": "unknown"}},
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
    return health_status


@app.get("/ping")
async def ping():
    return {"pong": True, "timestamp": datetime.utcnow().isoformat()}


from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG, log_level="info")