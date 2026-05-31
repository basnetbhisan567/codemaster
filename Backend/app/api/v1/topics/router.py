from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.topics.service import TopicService, ProgressService
from app.schemas.topic import (
    TopicResponse, TopicListResponse,
    UserProgressResponse, MarkCompleteRequest,
)

router = APIRouter(prefix="/topics", tags=["Topics"])
progress_router = APIRouter(prefix="/learning", tags=["Learning"])


@router.get("/", response_model=TopicListResponse)
async def list_topics(
    language: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await TopicService(db).get_all(language, category, difficulty, page, limit)


@router.get("/languages")
async def get_languages(db: AsyncSession = Depends(get_db)):
    return {"languages": await TopicService(db).get_languages()}


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    return {"categories": await TopicService(db).get_categories()}


@router.get("/language/{language}", response_model=list[TopicResponse])
async def topics_by_language(language: str, db: AsyncSession = Depends(get_db)):
    return await TopicService(db).get_by_language(language)


@router.get("/{slug}", response_model=TopicResponse)
async def get_topic(slug: str, db: AsyncSession = Depends(get_db)):
    return await TopicService(db).get_by_slug(slug)


@progress_router.get("/progress", response_model=list[UserProgressResponse])
async def get_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProgressService(db).get_user_progress(current_user.id)


@progress_router.post("/complete")
async def mark_complete(
    data: MarkCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProgressService(db).mark_lesson_complete(current_user.id, data)