import asyncio
from app.workers.tasks.job_crawler_tasks import fetch_all_jobs
asyncio.run(fetch_all_jobs())
