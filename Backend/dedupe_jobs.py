import asyncio
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from sqlalchemy import select, delete

async def deduplicate():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Job).order_by(Job.id))
        jobs = result.scalars().all()
        
        seen = set()
        removed = 0
        for job in jobs:
            # Match by company + first 3 words of title
            title_prefix = ' '.join(job.title.split()[:4])
            key = f"{title_prefix}|{job.company}"
            if key in seen:
                await db.execute(delete(Job).where(Job.id == job.id))
                removed += 1
            else:
                seen.add(key)
        
        await db.commit()
        remaining = len(seen)
        print(f'Removed {removed} near-duplicates. {remaining} unique jobs remain.')

asyncio.run(deduplicate())
