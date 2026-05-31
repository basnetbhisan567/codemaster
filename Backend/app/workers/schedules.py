from celery.schedules import crontab
from app.workers.celery_app import celery_app

celery_app.conf.beat_schedule = {
    # Tech Blogs — Every day at 6:00 AM
    "fetch-tech-blogs": {
        "task": "app.workers.tasks.content_fetcher_tasks.fetch_all_blogs",
        "schedule": crontab(hour=6, minute=0),
    },
    # Tech Tools — Every day at 7:00 AM
    "fetch-tech-tools": {
        "task": "app.workers.tasks.content_fetcher_tasks.fetch_all_tools",
        "schedule": crontab(hour=7, minute=0),
    },
    # Tech News — Every day at 8:00 AM + every 6 hours
    "fetch-tech-news": {
        "task": "app.workers.tasks.content_fetcher_tasks.fetch_all_news",
        "schedule": crontab(hour="8,14,20", minute=0),
    },
}