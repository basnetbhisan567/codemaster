"""
Celery Beat Schedule
All automated tasks run on schedule
"""

from celery.schedules import crontab
from app.workers.celery_app import celery_app

celery_app.conf.beat_schedule = {
    # ============================================
    # DAILY TASKS
    # ============================================

    # News & Blogs - Every day at 6:00 AM
    "fetch-daily-news": {
        "task": "app.workers.tasks.content_fetcher_tasks.fetch_all_content",
        "schedule": crontab(hour=6, minute=0),
    },

    # Jobs - Every day at 7:00 AM
    "fetch-daily-jobs": {
        "task": "app.workers.tasks.job_crawler_tasks.fetch_all_jobs",
        "schedule": crontab(hour=7, minute=0),
    },

    # AI Tools - Every day at 8:00 AM
    "fetch-daily-ai-tools": {
        "task": "app.workers.tasks.tool_fetcher_tasks.fetch_all_tools",
        "schedule": crontab(hour=8, minute=0),
    },

    # Focus Music - Every day at 9:00 AM
    "fetch-daily-music": {
        "task": "app.workers.tasks.music_fetcher_tasks.fetch_all_music",
        "schedule": crontab(hour=9, minute=0),
    },

    # ============================================
    # WEEKLY TASKS
    # ============================================

    # Project Ideas - Every Monday at 8:00 AM
    "fetch-weekly-projects": {
        "task": "app.workers.tasks.assignment_fetcher.fetch_all_assignments",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),
    },

    # ============================================
    # HOURLY TASKS
    # ============================================

    # Check for trending tools (every 4 hours)
    "fetch-trending-tools": {
        "task": "app.workers.tasks.tool_fetcher_tasks.fetch_all_tools",
        "schedule": crontab(hour="*/4", minute=0),
    },

    # Refresh music streams (every 6 hours)
    "refresh-music-streams": {
        "task": "app.workers.tasks.music_fetcher_tasks.fetch_all_music",
        "schedule": crontab(hour="*/6", minute=30),
    },
}