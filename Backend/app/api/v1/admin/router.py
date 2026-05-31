from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.admin.service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ["admin", "moderator"]:
        return {"error": "Access denied"}
    return await AdminService(db).get_dashboard_stats()


@router.get("/users")
async def recent_users(
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ["admin", "moderator"]:
        return {"error": "Access denied"}
    return await AdminService(db).get_recent_users(limit)


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status: str = Query(..., pattern="^(active|banned|shadow_banned)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in ["admin", "moderator"]:
        return {"error": "Access denied"}
    return await AdminService(db).update_user_status(user_id, status)