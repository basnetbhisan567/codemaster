"""
Project Ideas Fetcher
Fetches trending project ideas from GitHub
Runs: Weekly
"""

import httpx
from sqlalchemy import select
from datetime import datetime, timezone
from app.core.database import AsyncSessionLocal
from app.models.project import Project
from app.core.logger import logger


async def fetch_trending_repos():
    """Fetch trending repos from GitHub (free API)."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://api.github.com/search/repositories",
                params={
                    "q": "stars:>100 topic:javascript topic:python created:>2024-01-01",
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 30,
                },
                headers={"Accept": "application/vnd.github.v3+json"},
                timeout=30,
            )
            if response.status_code == 200:
                repos = response.json().get("items", [])
                return [
                    {
                        "title": f"Build a {r['name']} clone",
                        "description": f"Project idea based on {r['full_name']}: {r.get('description', '')}",
                        "category": r.get("language", "javascript").lower(),
                        "language": r.get("language", "javascript").lower() if r.get("language") else "javascript",
                        "requirements": [
                            f"Study the original repo: {r['html_url']}",
                            "Implement core features",
                            "Add your own improvements",
                            "Deploy and share",
                        ],
                        "xp_reward": 500 + (r.get("stargazers_count", 0) // 100),
                        "estimated_hours": 10,
                    }
                    for r in repos[:10]
                ]
        except Exception as e:
            logger.error(f"GitHub trending fetch failed: {e}")
            return []


async def save_project_ideas(ideas: list):
    """Save project ideas to database."""
    async with AsyncSessionLocal() as db:
        for idea in ideas:
            slug = idea["title"].lower().replace(" ", "-").replace("/", "-")[:200]
            existing = await db.scalar(select(Project).where(Project.slug == slug))
            if not existing:
                project = Project(
                    slug=slug,
                    title=idea["title"],
                    description=idea["description"],
                    category=idea["category"],
                    language=idea["language"],
                    requirements=idea["requirements"],
                    xp_reward=idea["xp_reward"],
                    estimated_hours=idea["estimated_hours"],
                )
                db.add(project)
        await db.commit()
    logger.info(f"Saved {len(ideas)} project ideas")


async def fetch_all_projects():
    """Main task: Fetch project ideas."""
    logger.info("💻 Starting project ideas fetch...")
    ideas = await fetch_trending_repos()
    await save_project_ideas(ideas)
    logger.info(f"✅ Project ideas fetch complete: {len(ideas)} ideas")