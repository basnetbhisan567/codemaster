from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: str
    source: str
    status: str
    priority: str
    due_date: Optional[datetime] = None
    tags: List[str] = []
    notes: str = ""
    progress: int
    xp_reward: int
    created_at: datetime

    class Config:
        from_attributes = True


class CreateAssignmentRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    description: str = ""
    priority: str = "medium"
    due_date: Optional[datetime] = None
    tags: List[str] = []
    xp_reward: int = 200


class UpdateAssignmentRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)