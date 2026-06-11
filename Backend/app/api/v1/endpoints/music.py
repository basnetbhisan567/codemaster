from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.music import MusicPlaylist

router = APIRouter(prefix="/music", tags=["music"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/playlists")
async def get_playlists(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MusicPlaylist).order_by(MusicPlaylist.name))
    playlists = result.scalars().all()
    return {
        "success": True,
        "data": [
            {
                "id": str(p.id),
                "name": p.name,
                "category": p.category,
                "tracks": p.tracks,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in playlists
        ],
    }

@router.get("/playlists/{playlist_id}")
async def get_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    from uuid import UUID
    result = await db.execute(
        select(MusicPlaylist).where(MusicPlaylist.id == UUID(playlist_id))
    )
    playlist = result.scalar_one_or_none()
    if not playlist:
        return {"success": False, "error": {"message": "Playlist not found"}}
    return {
        "success": True,
        "data": {
            "id": str(playlist.id),
            "name": playlist.name,
            "category": playlist.category,
            "tracks": playlist.tracks,
            "created_at": playlist.created_at.isoformat() if playlist.created_at else None,
        },
    }
