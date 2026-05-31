from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.music import MusicPlaylist


class MusicService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_playlists(self) -> list:
        result = await self.db.execute(select(MusicPlaylist))
        playlists = result.scalars().all()

        if not playlists:
            default_playlists = [
                {"name": "Deep Focus", "category": "focus", "tracks": [
                    {"title": "Ambient Study", "url": "", "duration": "3:00"},
                    {"title": "Lo-Fi Beats", "url": "", "duration": "2:45"},
                ]},
                {"name": "Coding Session", "category": "coding", "tracks": [
                    {"title": "Electronic Focus", "url": "", "duration": "3:30"},
                ]},
            ]
            for p in default_playlists:
                playlist = MusicPlaylist(**p)
                self.db.add(playlist)
            await self.db.commit()
            result = await self.db.execute(select(MusicPlaylist))
            playlists = result.scalars().all()

        return [{"id": p.id, "name": p.name, "category": p.category, "tracks": p.tracks} for p in playlists]