import asyncio
from app.core.database import AsyncSessionLocal
from app.models.topic import Topic

async def seed():
    async with AsyncSessionLocal() as db:
        topics = [
            Topic(title='Variables & Data Types', slug='variables-and-data-types', language='javascript', category='fundamentals', difficulty='beginner', order=1, icon='📦', xp_reward=100),
            Topic(title='Functions & Scope', slug='functions-and-scope', language='javascript', category='fundamentals', difficulty='beginner', order=2, icon='⚡', xp_reward=150),
            Topic(title='Arrays & Objects', slug='arrays-and-objects', language='javascript', category='data-structures', difficulty='intermediate', order=3, icon='📚', xp_reward=200),
            Topic(title='Async Programming', slug='async-programming', language='javascript', category='advanced', difficulty='advanced', order=4, icon='⏳', xp_reward=300),
            Topic(title='Python Basics', slug='python-basics', language='python', category='fundamentals', difficulty='beginner', order=1, icon='🐍', xp_reward=100),
        ]
        db.add_all(topics)
        await db.commit()
    print('Done!')

asyncio.run(seed())
