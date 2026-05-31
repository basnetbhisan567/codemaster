"""
Celery Beat Schedule
All automated tasks run on schedule
"""

from celery.schedules import crontab
from app.workers.celery_app import celery_app

celery_app.conf.beat_schedule = {
    # News - Every day at 6:00 AM
    "fetch-daily-news": {
        "task": "app.workers.tasks.news_fetcher_tasks.fetch_all_news",
        "schedule": crontab(hour=6, minute=0),
    },
    # Jobs - Every day at 7:00 AM
    "fetch-daily-jobs": {
        "task": "app.workers.tasks.job_crawler_tasks.fetch_all_jobs",
        "schedule": crontab(hour=7, minute=0),
    },
    # Project ideas - Every Monday at 8:00 AM
    "fetch-weekly-projects": {
        "task": "app.workers.tasks.project_ideas_tasks.fetch_all_projects",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),
    },
}