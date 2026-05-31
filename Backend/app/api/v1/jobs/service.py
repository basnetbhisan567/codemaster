from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException
from datetime import datetime, timezone
from app.models.job import Job
from app.schemas.job import JobResponse, JobListResponse


class JobService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_jobs(
        self, search: str = None, remote: bool = None,
        tag: str = None, page: int = 1, limit: int = 20
    ) -> JobListResponse:
        query = select(Job).where(Job.is_active == True)

        if search:
            query = query.where(
                Job.title.ilike(f"%{search}%") | Job.company.ilike(f"%{search}%")
            )
        if remote is not None:
            query = query.where(Job.remote == remote)
        if tag:
            query = query.where(Job.tags.contains([tag]))

        query = query.order_by(Job.posted_at.desc())
        total = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        offset = (page - 1) * limit
        result = await self.db.execute(query.offset(offset).limit(limit))
        jobs = result.scalars().all()

        return JobListResponse(
            jobs=[JobResponse.model_validate(j) for j in jobs],
            total=total, page=page, limit=limit,
        )

    async def get_job(self, job_id: int) -> JobResponse:
        result = await self.db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return JobResponse.model_validate(job)

    async def cleanup_old_jobs(self):
        cutoff = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(Job).where(Job.expires_at < cutoff, Job.is_active == True)
        )
        expired = result.scalars().all()
        for job in expired:
            job.is_active = False
        await self.db.commit()
        return {"removed": len(expired)}