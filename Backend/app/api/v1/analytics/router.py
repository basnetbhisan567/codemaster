from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.problem import Submission
from app.models.project import ProjectSubmission
from app.models.lockscreen import FocusSession

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db)):
    total_users = await db.scalar(select(func.count(User.id)))
    total_submissions = await db.scalar(select(func.count(Submission.id)))
    total_projects = await db.scalar(select(func.count(ProjectSubmission.id)))
    total_focus_minutes = await db.scalar(select(func.coalesce(func.sum(FocusSession.actual_minutes), 0)))

    return {
        "total_users": total_users or 0,
        "total_submissions": total_submissions or 0,
        "total_projects": total_projects or 0,
        "total_focus_minutes": total_focus_minutes or 0,
    }


@router.get("/user/{user_id}")
async def user_analytics(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    problems = await db.scalar(
        select(func.count(Submission.id)).where(Submission.user_id == user_id)
    )
    solved = await db.scalar(
        select(func.count(Submission.id)).where(
            Submission.user_id == user_id, Submission.status == "accepted"
        )
    )
    projects = await db.scalar(
        select(func.count(ProjectSubmission.id)).where(ProjectSubmission.user_id == user_id)
    )
    focus = await db.scalar(
        select(func.coalesce(func.sum(FocusSession.actual_minutes), 0)).where(
            FocusSession.user_id == user_id
        )
    )

    return {
        "problems_attempted": problems or 0,
        "problems_solved": solved or 0,
        "projects_submitted": projects or 0,
        "focus_minutes": focus or 0,
    }