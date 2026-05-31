from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RoadmapDayResponse(BaseModel):
    id: int
    day: int
    title: str
    basic_topic: str
    advanced_topic: str
    status: str
    snippet_basic: str
    snippet_advanced: str
    xp_reward: int
    estimated_time: str
    scheduled_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GenerateRoadmapRequest(BaseModel):
    language: str = "javascript"
    topic: str = Field(..., min_length=5)
    duration: int = Field(default=7, ge=3, le=30)
    intensity: str = Field(default="basic-advanced", pattern="^(basic-only|basic-advanced|full)$")