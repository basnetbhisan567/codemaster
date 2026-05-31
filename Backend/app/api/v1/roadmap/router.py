from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.roadmap.service import RoadmapService
from app.schemas.roadmap import RoadmapDayResponse, GenerateRoadmapRequest

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


@router.get("/", response_model=list[RoadmapDayResponse])
async def get_roadmap(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RoadmapService(db).get_roadmap(current_user.id)


@router.post("/generate", response_model=list[RoadmapDayResponse])
async def generate_roadmap(
    data: GenerateRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RoadmapService(db).generate(current_user.id, data)


@router.post("/complete/{day_id}", response_model=RoadmapDayResponse)
async def complete_day(
    day_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RoadmapService(db).complete_day(current_user.id, day_id)