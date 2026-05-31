from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProjectResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    level: int
    category: str
    language: str
    requirements: List[str] = []
    starter_code: str = ""
    xp_reward: int
    estimated_hours: int
    times_completed: int
    is_completed: bool = False

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    id: int
    title: str
    slug: str
    level: int
    category: str
    language: str
    xp_reward: int
    estimated_hours: int
    times_completed: int
    is_completed: bool = False

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectListItem]
    total: int
    page: int
    limit: int


class SubmitProjectRequest(BaseModel):
    code: str = ""
    demo_url: str = ""
    repo_url: str = ""


class ProjectSubmissionResponse(BaseModel):
    id: int
    project_id: int
    status: str
    score: int
    feedback: str = ""
    demo_url: str = ""
    repo_url: str = ""
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True