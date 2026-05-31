"""
Daily Tech News Fetcher
Sources: Dev.to, Hashnode, free APIs
Runs: Every day at 6:00 AM
"""

import httpx
from sqlalchemy import select
from datetime import datetime, timezone
from app.core.database import AsyncSessionLocal
from app.models.news import NewsArticle
from app.core.logger import logger


async def fetch_dev_to_articles():
    """Fetch latest articles from Dev.to API (free, no key needed)."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://dev.to/api/articles",
                params={"tag": "programming", "per_page": 20},
                timeout=30,
            )
            if response.status_code == 200:
                articles = response.json()
                return [
                    {
                        "title": a["title"],
                        "summary": a.get("description", "")[:300],
                        "source": "Dev.to",
                        "source_url": a.get("url", ""),
                        "image_url": a.get("cover_image", "") or a.get("social_image", ""),
                        "category": "tech",
                        "tags": a.get("tags", "").split(",") if isinstance(a.get("tags"), str) else a.get("tag_list", []),
                        "read_time": f"{a.get('reading_time_minutes', 5)} min",
                        "published_at": a.get("published_at", datetime.now(timezone.utc).isoformat()),
                    }
                    for a in articles
                ]
        except Exception as e:
            logger.error(f"Dev.to fetch failed: {e}")
            return []


async def fetch_hashnode_articles():
    """Fetch articles from Hashnode (free, no key needed)."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.hashnode.com/",
                json={
                    "query": """
                    {
                        storiesFeed(type: BEST, limit: 20) {
                            title
                            brief
                            slug
                            coverImage
                            dateAdded
                            replyCount
                        }
                    }
                    """
                },
                timeout=30,
            )
            if response.status_code == 200:
                data = response.json()
                stories = data.get("data", {}).get("storiesFeed", [])
                return [
                    {
                        "title": s.get("title", ""),
                        "summary": s.get("brief", "")[:300],
                        "source": "Hashnode",
                        "source_url": f"https://hashnode.com/post/{s.get('slug', '')}",
                        "image_url": s.get("coverImage", ""),
                        "category": "tech",
                        "tags": ["programming"],
                        "read_time": "5 min",
                        "published_at": s.get("dateAdded", datetime.now(timezone.utc).isoformat()),
                    }
                    for s in stories
                ]
        except Exception as e:
            logger.error(f"Hashnode fetch failed: {e}")
            return []


async def save_articles_to_db(articles: list):
    """Save fetched articles to database, skip duplicates."""
    async with AsyncSessionLocal() as db:
        for article in articles:
            existing = await db.scalar(
                select(NewsArticle).where(NewsArticle.source_url == article["source_url"])
            )
            if not existing:
                news = NewsArticle(**article)
                db.add(news)
        await db.commit()
    logger.info(f"Saved {len(articles)} new articles")


async def fetch_all_news():
    """Main task: Fetch from all sources and save."""
    logger.info("📰 Starting daily news fetch...")

    dev_to = await fetch_dev_to_articles()
    hashnode = await fetch_hashnode_articles()

    all_articles = dev_to + hashnode
    await save_articles_to_db(all_articles)

    logger.info(f"✅ News fetch complete: {len(all_articles)} articles")