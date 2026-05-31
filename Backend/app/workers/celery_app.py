try:
    from celery import Celery
    from app.config import settings

    celery_app = Celery(
        "codemaster",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
    )

    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
    )
except ImportError:
    celery_app = None
    print("⚠️ Celery not installed. Background tasks disabled.")