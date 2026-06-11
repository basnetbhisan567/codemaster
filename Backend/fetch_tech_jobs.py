import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from dateutil.parser import parse
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from sqlalchemy import select

TECH_CATEGORIES = ["software-dev", "devops", "data", "product"]

async def fetch_better_jobs():
    all_jobs = []
    async with httpx.AsyncClient() as client:
        for cat in TECH_CATEGORIES:
            resp = await client.get(
                "https://remotive.com/api/remote-jobs",
                params={"category": cat, "limit": 25},
                timeout=30,
            )
            if resp.status_code == 200:
                for j in resp.json().get("jobs", []):
                    title = j.get("title", "").lower()
                    # ONLY keep actual tech jobs
                    tech_keywords = ["developer", "engineer", "programmer", "devops", "data", "software", "frontend", "backend", "full stack", "python", "javascript", "react", "node", "cloud", "security", "architect", "sre", "qa", "test", "mobile", "ios", "android"]
                    if any(kw in title for kw in tech_keywords):
                        all_jobs.append({
                            "title": j.get("title", ""),
                            "company": j.get("company_name", ""),
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
    
    async with AsyncSessionLocal() as db:
        saved = 0
        for job in all_jobs:
            if not job.get("source_url"): continue
            exists = await db.scalar(select(Job).where(Job.source_url == job["source_url"]))
            if not exists:
                db.add(Job(**job))
                saved += 1
        await db.commit()
    
    print(f'✅ {saved} REAL TECH JOBS saved!')
    for j in all_jobs[:5]:
        print(f'   💼 {j["title"]} at {j["company"]}')

asyncio.run(fetch_better_jobs())
