import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select, func
from app.models.content import TechNews
from app.models.news import NewsArticle

async def copy():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(TechNews))
        articles = result.scalars().all()
        saved = 0
        
        for a in articles:
            existing = await db.scalar(
                select(NewsArticle).where(NewsArticle.source_url == a.source_url)
            )
            if not existing:
                db.add(NewsArticle(
                    title=a.title,
                    summary=a.summary or '',
                    source=a.source or '',
                    source_url=a.source_url or '',
                    category=a.category or 'tech',
                    tags=a.tags or [],
                    read_time=a.read_time or '5 min',
                    published_at=a.published_at or a.fetched_at,
                ))
                saved += 1
        
        await db.commit()
        print(f'Copied {saved} articles!')

asyncio.run(copy())
