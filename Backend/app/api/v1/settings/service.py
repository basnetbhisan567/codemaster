from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.settings import UserSettings
from app.schemas.settings import (
    SettingsResponse, ThemeUpdate, NotificationUpdate,
    FocusUpdate, EditorUpdate, LanguageUpdate, PrivacyUpdate,
)


class SettingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create(self, user_id: int) -> UserSettings:
        result = await self.db.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        settings = result.scalar_one_or_none()

        if not settings:
            settings = UserSettings(user_id=user_id)
            self.db.add(settings)
            await self.db.commit()
            await self.db.refresh(settings)

        return settings

    async def get_settings(self, user_id: int) -> SettingsResponse:
        settings = await self.get_or_create(user_id)
        return SettingsResponse.model_validate(settings)

    async def update_theme(self, user_id: int, data: ThemeUpdate) -> SettingsResponse:
        settings = await self.get_or_create(user_id)
        settings.theme = data.theme
        await self.db.commit()
        await self.db.refresh(settings)
        return SettingsResponse.model_validate(settings)

    async def update_notifications(self, user_id: int, data: NotificationUpdate) -> SettingsResponse:
        settings = await self.get_or_create(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        await self.db.commit()
        await self.db.refresh(settings)
        return SettingsResponse.model_validate(settings)

    async def update_focus(self, user_id: int, data: FocusUpdate) -> SettingsResponse:
        settings = await self.get_or_create(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        await self.db.commit()
        await self.db.refresh(settings)
        return SettingsResponse.model_validate(settings)

    async def update_editor(self, user_id: int, data: EditorUpdate) -> SettingsResponse:
        settings = await self.get_or_create(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        await self.db.commit()
        await self.db.refresh(settings)
        return SettingsResponse.model_validate(settings)

    async def update_language(self, user_id: int, data: LanguageUpdate) -> SettingsResponse:
        settings = await self.get_or_create(user_id)
        settings.preferred_language = data.preferred_language
        await self.db.commit()
        await self.db.refresh(settings)
        return SettingsResponse.model_validate(settings)

    async def update_privacy(self, user_id: int, data: PrivacyUpdate) -> SettingsResponse:
        settings = await self.get_or_create(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        await self.db.commit()
        await self.db.refresh(settings)
        return SettingsResponse.model_validate(settings)