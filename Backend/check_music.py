import asyncio
from app.core.database import AsyncSessionLocal
from app.models.music import MusicPlaylist
from sqlalchemy import select, func

async def check():
    async with AsyncSessionLocal() as db:
        count = await db.scalar(select(func.count(MusicPlaylist.id)))
        print(f"Music playlists in DB: {count}")
        
        result = await db.execute(select(MusicPlaylist).limit(5))
        playlists = result.scalars().all()
        for p in playlists:
            print(f"  - {p.name} ({p.category}): {len(p.tracks)} tracks")

asyncio.run(check())
