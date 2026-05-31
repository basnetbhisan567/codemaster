from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.news.service import NewsService
from app.schemas.news import NewsListResponse

router = APIRouter(prefix="/news", tags=["News"])


@router.get("/", response_model=NewsListResponse)
async def list_articles(
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await NewsService(db).get_articles(category, page, limit)