from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class StartFocusRequest(BaseModel):
    target_minutes: int = Field(..., ge=10, le=480)


class EndFocusRequest(BaseModel):
    actual_minutes: int = Field(..., ge=0)


class FocusSessionResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    target_minutes: int
    actual_minutes: int
    completed: bool
    remaining_seconds: int = 0

    class Config:
        from_attributes = True


class FocusStatsResponse(BaseModel):
    total_sessions: int
    total_minutes: int
    completed_sessions: int
    current_streak: int
    today_minutes: int


class LockdownStatusResponse(BaseModel):
    is_locked: bool
    lock_reason: str
    quiz_question: str = ""
    attempts_remaining: int = 3


class UnlockRequest(BaseModel):
    answer: str = Field(..., min_length=1)


class UnlockResponse(BaseModel):
    success: bool
    message: str
    remaining_attempts: int = 0
