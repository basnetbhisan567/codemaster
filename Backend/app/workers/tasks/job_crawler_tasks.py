import httpx
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from dateutil.parser import parse
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from app.core.logger import logger

async def fetch_remotive_jobs():
    jobs = []
    categories = ["software-dev", "product", "devops", "data"]
    try:
        async with httpx.AsyncClient() as client:
            for cat in categories:
                response = await client.get(
                    "https://remotive.com/api/remote-jobs",
                    params={"category": cat, "limit": 25},
                    timeout=30,
                )
                if response.status_code == 200:
                    for j in response.json().get("jobs", []):
                        title = j.get("title", "")
                        company = j.get("company_name", "")
                        key = f"{title[:40]}|{company}"
                        jobs.append({
                            "key": key,
                            "title": title,
                            "company": company,
                            "company_logo": j.get("company_logo_url", ""),
                            "location": j.get("candidate_required_location", "Remote"),
                            "salary": j.get("salary", ""),
                            "description": (j.get("description", "") or "")[:2000],
                            "tags": j.get("tags", []),
                            "remote": True,
                            "source": "remotive",
                            "source_url": j.get("url", ""),
                            "posted_at": parse(j["publication_date"]) if j.get("publication_date") else datetime.now(),
                            "expires_at": datetime.now() + timedelta(days=7),
                        })
        logger.info(f"  ✅ Remotive: {len(jobs)} jobs")
    except Exception as e:
        logger.warning(f"  ⚠️ Remotive: {str(e)[:80]}")
    return jobs


async def save_jobs_to_db(jobs: list):
    async with AsyncSessionLocal() as db:
        saved = 0
        seen_keys = set()
        
        # Get existing keys from DB
        result = await db.execute(select(Job.source_url))
        existing_urls = set(row[0] for row in result.all() if row[0])
        
        for job in jobs:
            if not job.get("source_url"):
                continue
            if job["source_url"] in existing_urls:
                continue
            
            key = job.pop("key", "")
            if key in seen_keys:
                continue
            seen_keys.add(key)
            
            db.add(Job(**job))
            saved += 1
        
        await db.commit()
    logger.info(f"  💾 Saved {saved} unique new jobs")


async def fetch_all_jobs():
    logger.info("=" * 60)
    logger.info("💼 Fetching Jobs...")
    logger.info("=" * 60)
    all_jobs = await fetch_remotive_jobs()
    await save_jobs_to_db(all_jobs)
    logger.info(f"✅ Done: {len(all_jobs)} fetched")
    return len(all_jobs)
