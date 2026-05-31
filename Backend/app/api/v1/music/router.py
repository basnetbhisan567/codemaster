from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.music.service import MusicService

router = APIRouter(prefix="/music", tags=["Music"])


@router.get("/playlists")
async def get_playlists(db: AsyncSession = Depends(get_db)):
    return await MusicService(db).get_playlists()