from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.api.v1.projects.service import ProjectService
from app.schemas.project import (
    ProjectResponse, ProjectListResponse,
    SubmitProjectRequest, ProjectSubmissionResponse,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    level: Optional[int] = None,
    category: Optional[str] = None,
    language: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await ProjectService(db).list_projects(
        user_id=None, level=level, category=category, language=language,
        page=page, limit=limit,
    )


@router.get("/{slug}", response_model=ProjectResponse)
async def get_project(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    return await ProjectService(db).get_project(slug, user_id=None)


@router.post("/{slug}/submit", response_model=ProjectSubmissionResponse)
async def submit_project(
    slug: str,
    data: SubmitProjectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProjectService(db).submit_project(current_user.id, slug, data)


@router.get("/my/submissions", response_model=list[ProjectSubmissionResponse])
async def my_submissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProjectService(db).get_submissions(current_user.id)