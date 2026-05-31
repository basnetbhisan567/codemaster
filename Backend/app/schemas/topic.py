from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class LessonResponse(BaseModel):
    id: int
    title: str
    content: str = ""
    code_example: str = ""
    explanation: str = ""
    order: int
    estimated_minutes: int

    class Config:
        from_attributes = True


class TopicResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str = ""
    language: str
    category: str
    difficulty: str
    order: int
    icon: str
    tags: List[str] = []
    estimated_hours: int
    xp_reward: int
    lessons: List[LessonResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class TopicListResponse(BaseModel):
    topics: List[TopicResponse]
    total: int
    page: int
    limit: int


class UserProgressResponse(BaseModel):
    topic_id: int
    topic_title: str
    completed: bool
    score: int
    time_spent_minutes: int
    total_lessons: int
    completed_lessons: int
    progress_percent: float
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MarkCompleteRequest(BaseModel):
    lesson_id: int
    time_spent_minutes: int = Field(default=0, ge=0)
    score: int = Field(default=100, ge=0, le=100)