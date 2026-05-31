from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.topic import Topic, Lesson, UserProgress
from app.schemas.topic import (
    TopicResponse, TopicListResponse,
    UserProgressResponse, MarkCompleteRequest,
)


class TopicService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        language: str = None,
        category: str = None,
        difficulty: str = None,
        page: int = 1,
        limit: int = 20,
    ) -> TopicListResponse:
        query = select(Topic).where(Topic.is_published == True).options(selectinload(Topic.lessons))

        if language:
            query = query.where(Topic.language == language)
        if category:
            query = query.where(Topic.category == category)
        if difficulty:
            query = query.where(Topic.difficulty == difficulty)

        query = query.order_by(Topic.order)
        offset = (page - 1) * limit

        result = await self.db.execute(query.offset(offset).limit(limit))
        topics = result.scalars().all()

        total_query = select(func.count(Topic.id)).where(Topic.is_published == True)
        if language:
            total_query = total_query.where(Topic.language == language)
        total = await self.db.scalar(total_query)

        return TopicListResponse(
            topics=[TopicResponse.model_validate(t) for t in topics],
            total=total,
            page=page,
            limit=limit,
        )

    async def get_by_slug(self, slug: str) -> TopicResponse:
        query = select(Topic).where(Topic.slug == slug).options(selectinload(Topic.lessons))
        result = await self.db.execute(query)
        topic = result.scalar_one_or_none()

        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        return TopicResponse.model_validate(topic)

    async def get_by_language(self, language: str) -> list[TopicResponse]:
        query = select(Topic).where(Topic.language == language, Topic.is_published == True).options(selectinload(Topic.lessons)).order_by(Topic.order)
        result = await self.db.execute(query)
        return [TopicResponse.model_validate(t) for t in result.scalars().all()]

    async def get_categories(self) -> list[str]:
        result = await self.db.execute(select(Topic.category).where(Topic.is_published == True).distinct())
        return sorted(result.scalars().all())

    async def get_languages(self) -> list[str]:
        result = await self.db.execute(select(Topic.language).where(Topic.is_published == True).distinct())
        return sorted(result.scalars().all())


class ProgressService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_progress(self, user_id: int) -> list[UserProgressResponse]:
        result = await self.db.execute(
            select(UserProgress).where(UserProgress.user_id == user_id)
        )
        progress_entries = result.scalars().all()

        progress_list = []
        for entry in progress_entries:
            topic_result = await self.db.execute(select(Topic).where(Topic.id == entry.topic_id))
            topic = topic_result.scalar_one_or_none()

            lesson_count = await self.db.scalar(
                select(func.count(Lesson.id)).where(Lesson.topic_id == entry.topic_id)
            )

            completed_count = await self.db.scalar(
                select(func.count(UserProgress.id)).where(
                    UserProgress.user_id == user_id,
                    UserProgress.topic_id == entry.topic_id,
                    UserProgress.completed == True,
                )
            )

            progress_list.append(UserProgressResponse(
                topic_id=entry.topic_id,
                topic_title=topic.title if topic else "Unknown",
                completed=entry.completed,
                score=entry.score,
                time_spent_minutes=entry.time_spent_minutes,
                total_lessons=lesson_count or 0,
                completed_lessons=completed_count or 0,
                progress_percent=round((completed_count / lesson_count * 100) if lesson_count else 0, 1),
                completed_at=entry.completed_at,
            ))

        return progress_list

    async def mark_lesson_complete(self, user_id: int, data: MarkCompleteRequest) -> dict:
        result = await self.db.execute(select(Lesson).where(Lesson.id == data.lesson_id))
        lesson = result.scalar_one_or_none()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        existing = await self.db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user_id,
                UserProgress.lesson_id == data.lesson_id,
            )
        )
        progress = existing.scalar_one_or_none()

        if progress:
            progress.completed = True
            progress.score = max(progress.score, data.score)
            progress.time_spent_minutes += data.time_spent_minutes
        else:
            from datetime import datetime, timezone
            progress = UserProgress(
                user_id=user_id,
                topic_id=lesson.topic_id,
                lesson_id=data.lesson_id,
                completed=True,
                score=data.score,
                time_spent_minutes=data.time_spent_minutes,
                completed_at=datetime.now(timezone.utc),
            )
            self.db.add(progress)

        await self.db.commit()

        total_lessons = await self.db.scalar(
            select(func.count(Lesson.id)).where(Lesson.topic_id == lesson.topic_id)
        )
        completed_lessons = await self.db.scalar(
            select(func.count(UserProgress.id)).where(
                UserProgress.user_id == user_id,
                UserProgress.topic_id == lesson.topic_id,
                UserProgress.completed == True,
            )
        )

        return {
            "lesson_id": data.lesson_id,
            "completed": True,
            "topic_progress": round((completed_lessons / total_lessons * 100) if total_lessons else 0, 1),
        }