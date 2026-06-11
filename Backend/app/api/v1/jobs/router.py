from fastapi import APIRouter, Depends, Query, Body
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.api.v1.jobs.service import JobService
from app.schemas.job import *

router = APIRouter(prefix="/jobs", tags=["Jobs & Career"])


@router.get("/", response_model=JobListResponse)
async def search_jobs(
    query: Optional[str] = None,
    role: Optional[str] = None,
    location: Optional[str] = None,
    remote: Optional[bool] = None,
    company: Optional[str] = None,
    tags: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    params = JobSearchRequest(
        query=query, role=role, location=location, remote=remote,
        company=company, tags=tags.split(",") if tags else [],
        page=page, limit=limit,
    )
    return await JobService(db).search_jobs(params)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    return await JobService(db).get_job(job_id)


@router.post("/resume/save")
async def save_resume(
    data: ResumeData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await JobService(db).save_resume(current_user.id, data)


@router.get("/resume/get")
async def get_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resume = await JobService(db).get_resume(current_user.id)
    if not resume:
        return {"message": "No resume found", "resume": None}
    return {"resume": ResumeData.model_validate(resume)}


@router.post("/resume/review")
async def review_resume(
    job_id: Optional[int] = Body(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await JobService(db).review_resume(current_user.id, job_id)


@router.post("/career-advice")
async def career_advice(
    question: str = Body(...),
    context: str = Body(""),
):
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:5000/api/v1/ai/chat",
                json={
                    "messages": [{"role": "user", "content": f"Career advice. Context: {context}. Question: {question}"}],
                    "provider": "auto",
                },
                timeout=30,
            )
            if response.status_code == 200:
                return response.json()
    except:
        pass
    return {"response": "Career coach available. Try again shortly."}
