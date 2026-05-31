from pydantic import BaseModel, Field
from typing import List, Optional


class SettingsResponse(BaseModel):
    user_id: int
    theme: str
    email_notifications: bool
    push_notifications: bool
    sms_notifications: bool
    daily_reminder: bool
    streak_reminder: bool
    daily_goal_minutes: int
    focus_start_time: str
    focus_end_time: str
    focus_days: List[str]
    auto_start_focus: bool
    editor_font_size: int
    editor_tab_size: int
    editor_theme: str
    editor_word_wrap: bool
    preferred_language: str
    show_profile: bool
    show_activity: bool

    class Config:
        from_attributes = True


class ThemeUpdate(BaseModel):
    theme: str = Field(..., pattern="^(dark|light|white|forest|sunset|ocean)$")


class NotificationUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    daily_reminder: Optional[bool] = None
    streak_reminder: Optional[bool] = None


class FocusUpdate(BaseModel):
    daily_goal_minutes: Optional[int] = Field(None, ge=30, le=480)
    focus_start_time: Optional[str] = None
    focus_end_time: Optional[str] = None
    focus_days: Optional[List[str]] = None
    auto_start_focus: Optional[bool] = None


class EditorUpdate(BaseModel):
    editor_font_size: Optional[int] = Field(None, ge=10, le=24)
    editor_tab_size: Optional[int] = Field(None, ge=1, le=8)
    editor_theme: Optional[str] = None
    editor_word_wrap: Optional[bool] = None


class LanguageUpdate(BaseModel):
    preferred_language: str


class PrivacyUpdate(BaseModel):
    show_profile: Optional[bool] = None
    show_activity: Optional[bool] = None