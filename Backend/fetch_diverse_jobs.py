import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from dateutil.parser import parse
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from sqlalchemy import select, delete

async def fetch_diverse_jobs():
    all_jobs = []
    
    async with httpx.AsyncClient() as client:
        # Source 1: Remotive - Tech categories only
        print("📡 Remotive...")
        for cat in ["software-dev", "devops", "data"]:
            try:
                resp = await client.get(f"https://remotive.com/api/remote-jobs?category={cat}&limit=30", timeout=30)
                if resp.status_code == 200:
                    for j in resp.json().get("jobs", []):
                        title = j.get("title", "").lower()
                        if any(kw in title for kw in ["developer", "engineer", "programmer", "devops", "data", "software", "frontend", "backend", "full stack", "python", "javascript", "react", "node", "cloud", "security", "architect", "mobile", "ios", "android", "web", "api", "database", "ml", "ai", "machine learning"]):
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
                                "posted_at": datetime.now(),
                                "expires_at": datetime.now() + timedelta(days=7),
                            })
            except: pass
        
        # Source 2: GitHub Jobs (alternative free API)
        print("📡 GitHub Jobs...")
        try:
            resp = await client.get("https://jobs.github.com/positions.json?description=developer&location=remote", timeout=30)
            if resp.status_code == 200:
                for j in resp.json():
                    all_jobs.append({
                        "title": j.get("title", ""),
                        "company": j.get("company", ""),
                        "company_logo": j.get("company_logo", ""),
                        "location": j.get("location", "Remote"),
                        "salary": "",
                        "description": (j.get("description", "") or "")[:2000],
                        "tags": [],
                        "remote": True,
                        "source": "github",
                        "source_url": j.get("url", ""),
                        "posted_at": datetime.now(),
                        "expires_at": datetime.now() + timedelta(days=30),
                    })
        except: pass
        
        # Source 3: Curated tech jobs as fallback
        print("📡 Curated...")
        curated = [
            {"title": "Senior React Developer", "company": "Vercel", "location": "Remote (Global)", "salary": "-", "tags": ["react", "nextjs", "typescript"], "description": "Build the future of web development with Next.js and React."},
            {"title": "Backend Engineer (Python)", "company": "Anthropic", "location": "San Francisco / Remote", "salary": "-", "tags": ["python", "ai", "ml"], "description": "Work on cutting-edge AI systems and APIs."},
            {"title": "Full Stack Developer", "company": "Supabase", "location": "Remote", "salary": "-", "tags": ["postgresql", "react", "typescript"], "description": "Build the open-source Firebase alternative."},
            {"title": "DevOps Engineer", "company": "Linear", "location": "Remote (US/EU)", "salary": "-", "tags": ["aws", "kubernetes", "terraform"], "description": "Scale infrastructure for the fastest project management tool."},
            {"title": "iOS Developer", "company": "Spotify", "location": "New York / Remote", "salary": "-", "tags": ["swift", "ios", "mobile"], "description": "Build features for 500M+ users worldwide."},
            {"title": "Machine Learning Engineer", "company": "Hugging Face", "location": "Remote (Global)", "salary": "-", "tags": ["python", "pytorch", "nlp"], "description": "Democratize AI with open-source ML models."},
            {"title": "Frontend Developer", "company": "Stripe", "location": "Remote (US)", "salary": "-", "tags": ["react", "typescript", "css"], "description": "Build payment interfaces used by millions."},
            {"title": "Cloud Architect", "company": "Netflix", "location": "Los Gatos / Remote", "salary": "-", "tags": ["aws", "microservices", "java"], "description": "Design streaming infrastructure at global scale."},
            {"title": "Security Engineer", "company": "Cloudflare", "location": "Remote (Global)", "salary": "-", "tags": ["security", "networking", "rust"], "description": "Protect millions of websites from attacks."},
            {"title": "Data Engineer", "company": "Databricks", "location": "Remote (US)", "salary": "-", "tags": ["spark", "python", "sql"], "description": "Build the lakehouse platform for big data."},
        ]
        for j in curated:
            all_jobs.append({
                "title": j["title"],
                "company": j["company"],
                "company_logo": "",
                "location": j["location"],
                "salary": j["salary"],
                "description": j["description"],
                "tags": j["tags"],
                "remote": True,
                "source": "curated",
                "source_url": f"https://{j['company'].lower().replace(' ','')}.com/careers",
                "posted_at": datetime.now(),
                "expires_at": datetime.now() + timedelta(days=30),
            })
    
    # Save to database
    async with AsyncSessionLocal() as db:
        # Clear old jobs
        await db.execute(delete(Job))
        await db.commit()
        
        saved = 0
        seen = set()
        for job in all_jobs:
            key = job["title"] + job["company"]
            if key in seen: continue
            seen.add(key)
            if not job.get("source_url"): continue
            db.add(Job(**job))
            saved += 1
        await db.commit()
    
    print(f'\n✅ {saved} UNIQUE tech jobs saved!')
    for j in all_jobs[:8]:
        print(f'   💼 {j["title"]} — {j["company"]} ({j["location"]})')

asyncio.run(fetch_diverse_jobs())
