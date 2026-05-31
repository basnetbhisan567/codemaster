from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest, ProfileStatsResponse


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: int) -> ProfileResponse:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return ProfileResponse.model_validate(user)

    async def update_profile(self, user_id: int, data: ProfileUpdateRequest) -> ProfileResponse:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        await self.db.commit()
        await self.db.refresh(user)
        return ProfileResponse.model_validate(user)

    async def get_stats(self, user_id: int) -> ProfileStatsResponse:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        ranks = ["Beginner", "Apprentice", "Coder", "Developer", "Engineer", "Architect", "Master"]
        rank_index = min(user.level // 5, len(ranks) - 1)

        return ProfileStatsResponse(
            problems_solved=user.problems_solved,
            projects_completed=user.projects_completed,
            streak=user.streak,
            longest_streak=user.longest_streak,
            focus_hours=user.focus_hours,
            level=user.level,
            xp=user.xp,
            rank=ranks[rank_index],
        )