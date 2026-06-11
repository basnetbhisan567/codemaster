import asyncio
from app.core.database import AsyncSessionLocal
from app.models.music import MusicPlaylist
from sqlalchemy import select

WORKING_TRACKS = [
    {"title": "Ambient Dream", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "duration": "4:12"},
    {"title": "Calm Waters", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "duration": "5:30"},
    {"title": "Digital Rain", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "duration": "3:45"},
    {"title": "Neon Nights", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", "duration": "4:00"},
    {"title": "Binary Sunset", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", "duration": "3:30"},
    {"title": "Code Compile", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", "duration": "4:15"},
    {"title": "Pixel Dreams", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", "duration": "3:30"},
    {"title": "Data Stream", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", "duration": "4:00"},
]

PLAYLISTS = [
    {"name": "Deep Focus", "category": "focus"},
    {"name": "Coding Session", "category": "coding"},
    {"name": "Lo-Fi Study", "category": "study"},
    {"name": "Classical Focus", "category": "classical"},
    {"name": "Nature Sounds", "category": "nature"},
    {"name": "Electronic Vibes", "category": "electronic"},
    {"name": "Jazz Focus", "category": "jazz"},
    {"name": "Night Coding", "category": "ambient"},
]

import random

async def setup():
    async with AsyncSessionLocal() as db:
        # Delete old playlists
        result = await db.execute(select(MusicPlaylist))
        for p in result.scalars().all():
            await db.delete(p)
        await db.commit()
        
        # Create all 8 playlists with tracks
        available = WORKING_TRACKS.copy()
        random.shuffle(available)
        
        for pl in PLAYLISTS:
            num = random.randint(3, 5)
            tracks = []
            for _ in range(num):
                if available:
                    t = available.pop()
                    tracks.append({"title": t["title"], "url": t["url"], "duration": t["duration"]})
                else:
                    # Reuse tracks if we run out
                    t = random.choice(WORKING_TRACKS)
                    tracks.append({"title": t["title"], "url": t["url"], "duration": t["duration"]})
            
            db.add(MusicPlaylist(name=pl["name"], category=pl["category"], tracks=tracks))
        
        await db.commit()
    
    print('✅ 8 playlists created with tracks!')
    for pl in PLAYLISTS:
        print(f'   🎵 {pl["name"]}')

asyncio.run(setup())
