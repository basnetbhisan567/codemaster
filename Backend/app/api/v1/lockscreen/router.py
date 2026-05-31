from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.lockscreen.service import LockScreenService
from app.schemas.lockscreen import (
    StartFocusRequest, EndFocusRequest,
    FocusSessionResponse, FocusStatsResponse,
    LockdownStatusResponse, UnlockRequest, UnlockResponse,
)

router = APIRouter(prefix="/lockscreen", tags=["Lock Screen"])


@router.post("/focus/start", response_model=FocusSessionResponse)
async def start_focus(
    data: StartFocusRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LockScreenService(db).start_focus(current_user.id, data)


@router.post("/focus/end", response_model=FocusSessionResponse)
async def end_focus(
    data: EndFocusRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LockScreenService(db).end_focus(current_user.id, data)


@router.get("/focus/active", response_model=FocusSessionResponse)
async def get_active_focus(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LockScreenService(db).get_active_session(current_user.id)


@router.get("/focus/stats", response_model=FocusStatsResponse)
async def get_focus_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LockScreenService(db).get_stats(current_user.id)


@router.get("/lockdown/status", response_model=LockdownStatusResponse)
async def get_lockdown_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LockScreenService(db).get_lockdown_status(current_user.id)


@router.post("/lockdown/unlock", response_model=UnlockResponse)
async def attempt_unlock(
    data: UnlockRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LockScreenService(db).attempt_unlock(current_user.id, data)