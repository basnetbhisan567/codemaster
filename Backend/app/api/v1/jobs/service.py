from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from fastapi import HTTPException
from app.models.job import Job
from app.schemas.job import *


class JobService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_jobs(self, params: JobSearchRequest) -> JobListResponse:
        query = select(Job).where(Job.is_active == True)
        
        if params.query:
            query = query.where(or_(
                Job.title.ilike(f"%{params.query}%"),
                Job.company.ilike(f"%{params.query}%"),
                Job.description.ilike(f"%{params.query}%")
            ))
        if params.role:
            query = query.where(Job.title.ilike(f"%{params.role}%"))
        if params.location:
            query = query.where(Job.location.ilike(f"%{params.location}%"))
        if params.remote is not None:
            query = query.where(Job.remote == params.remote)
        if params.company:
            query = query.where(Job.company.ilike(f"%{params.company}%"))
        
        query = query.order_by(Job.posted_at.desc())
        total = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        offset = (params.page - 1) * params.limit
        result = await self.db.execute(query.offset(offset).limit(params.limit))
        jobs = result.scalars().all()
        
        return JobListResponse(
            jobs=[JobResponse.model_validate(j) for j in jobs],
            total=total or 0, page=params.page, limit=params.limit
        )

    async def get_job(self, job_id: int) -> JobResponse:
        result = await self.db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return JobResponse.model_validate(job)
