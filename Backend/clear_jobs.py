import asyncio
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from sqlalchemy import delete

async def clear():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(Job))
        await db.commit()
    print('Cleared!')

asyncio.run(clear())
