"""
Job Crawler - Fixed for SQLite
"""
import httpx
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from dateutil.parser import parse
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from app.core.logger import logger


async def fetch_github_jobs():
    jobs = []
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://remotive.com/api/remote-jobs",
                params={"category": "software-dev", "limit": 50},
                timeout=30,
            )
            if response.status_code == 200:
                data = response.json()
                for j in data.get("jobs", []):
                    jobs.append({
                        "title": j.get("title", ""),
                        "company": j.get("company_name", ""),
                        "company_logo": j.get("company_logo_url", ""),
                        "location": j.get("candidate_required_location", "Remote"),
                        "salary": j.get("salary", ""),
                        "description": j.get("description", "")[:1000],
                        "tags": j.get("tags", []),
                        "remote": True,
                        "source": "remotive",
                        "source_url": j.get("url", ""),
                        "posted_at": parse(j.get("publication_date")) if j.get("publication_date") else datetime.now(),
                        "expires_at": datetime.now() + timedelta(days=7),
                    })
        except Exception as e:
            logger.error(f"Job fetch failed: {e}")
    return jobs


async def save_jobs_to_db(jobs: list):
    async with AsyncSessionLocal() as db:
        saved = 0
        for job in jobs:
            if not job.get("source_url"):
                continue
            existing = await db.scalar(
                select(Job).where(Job.source_url == job["source_url"])
            )
            if not existing:
                db.add(Job(**job))
                saved += 1
        await db.commit()
    logger.info(f"Saved {saved} new jobs")


async def cleanup_old_jobs():
    async with AsyncSessionLocal() as db:
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        result = await db.execute(
            select(Job).where(Job.posted_at < cutoff, Job.is_active == True)
        )
        expired = result.scalars().all()
        for job in expired:
            job.is_active = False
        await db.commit()
    logger.info(f"Cleaned up {len(expired)} old jobs")


async def fetch_all_jobs():
    logger.info("Starting job crawl...")
    jobs = await fetch_github_jobs()
    await save_jobs_to_db(jobs)
    await cleanup_old_jobs()
    logger.info(f"Job crawl complete: {len(jobs)} jobs")
