import asyncio
from datetime import datetime
from app.core.logger import logger

async def run_scheduler():
    logger.info("Scheduler started - no Redis needed")

    while True:
        now = datetime.now()

        if now.hour == 6 and now.minute == 0:
            try:
                from app.workers.tasks.content_fetcher_tasks import fetch_all_content
                await fetch_all_content()
                logger.info("News fetched")
            except Exception as e:
                logger.error(str(e))

        if now.hour == 7 and now.minute == 0:
            try:
                from app.workers.tasks.job_crawler_tasks import fetch_all_jobs
                await fetch_all_jobs()
                logger.info("Jobs fetched")
            except Exception as e:
                logger.error(str(e))

        if now.hour == 8 and now.minute == 0:
            try:
                from app.workers.tasks.tool_fetcher_tasks import fetch_all_tools
                await fetch_all_tools()
                logger.info("AI Tools fetched")
            except Exception as e:
                logger.error(str(e))

        if now.hour == 9 and now.minute == 0:
            try:
                from app.workers.tasks.music_fetcher_tasks import fetch_all_music
                await fetch_all_music()
                logger.info("Music fetched")
            except Exception as e:
                logger.error(str(e))

        if now.weekday() == 0 and now.hour == 8 and now.minute == 5:
            try:
                from app.workers.tasks.assignment_fetcher import fetch_all_assignments
                await fetch_all_assignments()
                logger.info("Projects fetched")
            except Exception as e:
                logger.error(str(e))

        await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(run_scheduler())
