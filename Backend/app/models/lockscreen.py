from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    target_minutes = Column(Integer, nullable=False)
    actual_minutes = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    exit_attempts = Column(Integer, default=0)
    warnings_issued = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())


class LockdownState(Base):
    __tablename__ = "lockdown_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    is_locked = Column(Boolean, default=False)
    lock_reason = Column(String(100), default="")
    quiz_question = Column(String(300), default="")
    quiz_answer = Column(String(100), default="")
    quiz_attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    locked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
