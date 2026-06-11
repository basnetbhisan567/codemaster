import asyncio
from app.core.database import engine, Base
from app.models.job import Job, JobApplication, UserResume

async def recreate_jobs():
    async with engine.begin() as conn:
        # Drop only jobs-related tables
        await conn.run_sync(Base.metadata.drop_all, tables=[Job.__table__, JobApplication.__table__, UserResume.__table__])
        # Recreate them
        await conn.run_sync(Base.metadata.create_all, tables=[Job.__table__, JobApplication.__table__, UserResume.__table__])
    print('✅ Jobs tables recreated!')

asyncio.run(recreate_jobs())
