import asyncio
from app.core.database import AsyncSessionLocal
from app.models.music import MusicPlaylist
from sqlalchemy import select, delete
import random

WORKING_TRACKS = [
    {"title": "Ambient Dream", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "duration": "4:12"},
    {"title": "Calm Waters", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "duration": "5:30"},
    {"title": "Digital Rain", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "duration": "3:45"},
    {"title": "Neon Nights", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", "duration": "4:00"},
    {"title": "Binary Sunset", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", "duration": "3:30"},
    {"title": "Code Compile", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", "duration": "4:15"},
    {"title": "Pixel Dreams", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", "duration": "3:30"},
    {"title": "Data Stream", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", "duration": "4:00"},
    {"title": "Quantum Leap", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", "duration": "3:00"},
    {"title": "Silicon Dreams", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", "duration": "3:30"},
    {"title": "Cloud Computing", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", "duration": "4:12"},
    {"title": "Matrix Rain", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", "duration": "5:30"},
    {"title": "Cyber Punk", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", "duration": "3:45"},
    {"title": "Deep Focus", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", "duration": "4:00"},
    {"title": "Late Night Code", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", "duration": "3:30"},
]

PLAYLISTS = [
    ("Deep Focus", "focus"),
    ("Coding Session", "coding"),
    ("Lo-Fi Study", "study"),
    ("Classical Focus", "classical"),
    ("Nature & Ambient", "nature"),
    ("Electronic Vibes", "electronic"),
    ("Jazz Focus", "jazz"),
    ("Night Coding", "ambient"),
]

async def setup():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(MusicPlaylist))
        await db.commit()
        
        available = WORKING_TRACKS.copy()
        random.shuffle(available)
        
        for name, category in PLAYLISTS:
            num = random.randint(3, 5)
            tracks = []
            for _ in range(num):
                t = available.pop() if available else random.choice(WORKING_TRACKS)
                tracks.append(t)
            db.add(MusicPlaylist(name=name, category=category, tracks=tracks))
        
        await db.commit()
    print(f'✅ {len(PLAYLISTS)} playlists with working SoundHelix URLs!')

asyncio.run(setup())
