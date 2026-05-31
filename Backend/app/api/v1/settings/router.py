from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.settings.service import SettingsService
from app.schemas.settings import (
    SettingsResponse, ThemeUpdate, NotificationUpdate,
    FocusUpdate, EditorUpdate, LanguageUpdate, PrivacyUpdate,
)

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/", response_model=SettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SettingsService(db).get_settings(current_user.id)


@router.put("/theme", response_model=SettingsResponse)
async def update_theme(
    data: ThemeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SettingsService(db).update_theme(current_user.id, data)


@router.put("/notifications", response_model=SettingsResponse)
async def update_notifications(
    data: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SettingsService(db).update_notifications(current_user.id, data)


@router.put("/focus", response_model=SettingsResponse)
async def update_focus(
    data: FocusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SettingsService(db).update_focus(current_user.id, data)


@router.put("/editor", response_model=SettingsResponse)
async def update_editor(
    data: EditorUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SettingsService(db).update_editor(current_user.id, data)


@router.put("/language", response_model=SettingsResponse)
async def update_language(
    data: LanguageUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SettingsService(db).update_language(current_user.id, data)


@router.put("/privacy", response_model=SettingsResponse)
async def update_privacy(
    data: PrivacyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await SettingsService(db).update_privacy(current_user.id, data)