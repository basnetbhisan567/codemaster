import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select, func
from app.models.content import TechNews
from app.models.news import NewsArticle

async def check():
    async with AsyncSessionLocal() as db:
        tn = await db.scalar(select(func.count(TechNews.id)))
        na = await db.scalar(select(func.count(NewsArticle.id)))
        print(f'tech_news: {tn}, news_articles: {na}')

asyncio.run(check())
