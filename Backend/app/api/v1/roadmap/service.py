from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from app.models.roadmap import RoadmapDay
from app.schemas.roadmap import RoadmapDayResponse, GenerateRoadmapRequest


class RoadmapService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_roadmap(self, user_id: int) -> list[RoadmapDayResponse]:
        result = await self.db.execute(
            select(RoadmapDay)
            .where(RoadmapDay.user_id == user_id)
            .order_by(RoadmapDay.day)
        )
        days = result.scalars().all()

        if not days:
            return []
        return [RoadmapDayResponse.model_validate(d) for d in days]

    async def generate(self, user_id: int, data: GenerateRoadmapRequest) -> list[RoadmapDayResponse]:
        await self.db.execute(
            select(RoadmapDay).where(RoadmapDay.user_id == user_id)
        )
        existing = (await self.db.execute(
            select(RoadmapDay).where(RoadmapDay.user_id == user_id)
        )).scalars().all()
        for d in existing:
            await self.db.delete(d)
        await self.db.commit()

        topics = [t.strip() for t in data.topic.split(",") if t.strip()]
        if not topics:
            topics = ["Variables", "Functions", "Arrays", "Objects", "DOM", "Async", "Project"]

        days = []
        today = datetime.now(timezone.utc)
        for i in range(data.duration):
            basic = topics[i % len(topics)] if topics else f"Day {i+1} Basic"
            advanced = f"{basic} Advanced" if data.intensity != "basic-only" else "Review & Practice"

            day = RoadmapDay(
                user_id=user_id,
                day=i + 1,
                title=f"Day {i + 1}: {basic}",
                basic_topic=basic,
                advanced_topic=advanced,
                status="current" if i == 0 else "upcoming",
                xp_reward=100 + (i * 25),
                estimated_time=f"{30 + (i * 10)} min",
                scheduled_date=today + timedelta(days=i),
            )
            self.db.add(day)
            days.append(day)

        await self.db.commit()
        return [RoadmapDayResponse.model_validate(d) for d in days]

    async def complete_day(self, user_id: int, day_id: int) -> RoadmapDayResponse:
        result = await self.db.execute(
            select(RoadmapDay).where(RoadmapDay.id == day_id, RoadmapDay.user_id == user_id)
        )
        day = result.scalar_one_or_none()
        if not day:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Day not found")

        day.status = "completed"
        day.completed_at = datetime.now(timezone.utc)

        next_day = await self.db.scalar(
            select(RoadmapDay).where(
                RoadmapDay.user_id == user_id,
                RoadmapDay.day == day.day + 1,
                RoadmapDay.status == "upcoming",
            )
        )
        if next_day:
            next_day_result = await self.db.execute(
                select(RoadmapDay).where(RoadmapDay.id == next_day)
            )
            next_day = next_day_result.scalar_one_or_none()
            if next_day:
                next_day.status = "current"

        await self.db.commit()
        await self.db.refresh(day)
        return RoadmapDayResponse.model_validate(day)