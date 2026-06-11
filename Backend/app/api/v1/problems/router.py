from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.api.v1.problems.service import ProblemService, SubmissionService
from app.schemas.problem import (
    ProblemResponse, ProblemListResponse,
    SubmitCodeRequest, SubmissionResponse, HintRequest,
)

router = APIRouter(prefix="/problems", tags=["Problems"])


@router.get("/", response_model=ProblemListResponse)
async def list_problems(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProblemService(db).list_problems(
        user_id=current_user.id if current_user else None,
        difficulty=difficulty, category=category, language=language,
        page=page, limit=limit,
    )


@router.get("/{slug}", response_model=ProblemResponse)
async def get_problem(slug: str, db: AsyncSession = Depends(get_db)):
    return await ProblemService(db).get_problem(slug)


@router.get("/{slug}/hints")
async def get_hint(
    slug: str,
    hint_index: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    return await ProblemService(db).get_hint(slug, HintRequest(hint_index=hint_index))


@router.post("/{slug}/submit", response_model=SubmissionResponse)
async def submit_solution(
    slug: str,
    data: SubmitCodeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SubmissionService(db).submit(current_user.id, slug, data)


@router.get("/{slug}/submissions", response_model=list[SubmissionResponse])
async def get_submissions(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SubmissionService(db).get_submissions(current_user.id, slug)
