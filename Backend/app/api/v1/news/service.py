from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.news import NewsArticle
from app.schemas.news import NewsResponse, NewsListResponse


class NewsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_articles(
        self, category: str = None, page: int = 1, limit: int = 20
    ) -> NewsListResponse:
        query = select(NewsArticle)
        if category:
            query = query.where(NewsArticle.category == category)
        query = query.order_by(NewsArticle.published_at.desc())

        total = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        offset = (page - 1) * limit
        result = await self.db.execute(query.offset(offset).limit(limit))
        articles = result.scalars().all()

        return NewsListResponse(
            articles=[NewsResponse.model_validate(a) for a in articles],
            total=total, page=page, limit=limit,
        )