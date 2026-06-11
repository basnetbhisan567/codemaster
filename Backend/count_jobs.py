import asyncio
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from sqlalchemy import select, func

async def check():
    async with AsyncSessionLocal() as db:
        total = await db.scalar(select(func.count(Job.id)))
        print(f'Total jobs in database: {total}')

asyncio.run(check())
