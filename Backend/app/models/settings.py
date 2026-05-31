from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    theme = Column(String(20), default="dark")
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    daily_reminder = Column(Boolean, default=True)
    streak_reminder = Column(Boolean, default=True)

    daily_goal_minutes = Column(Integer, default=150)
    focus_start_time = Column(String(10), default="09:00")
    focus_end_time = Column(String(10), default="18:00")
    focus_days = Column(JSON, default=lambda: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    auto_start_focus = Column(Boolean, default=False)

    editor_font_size = Column(Integer, default=14)
    editor_tab_size = Column(Integer, default=2)
    editor_theme = Column(String(20), default="vs-dark")
    editor_word_wrap = Column(Boolean, default=True)

    preferred_language = Column(String(20), default="javascript")
    show_profile = Column(Boolean, default=True)
    show_activity = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())
