from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class SkillItem(BaseModel):
    name: str
    level: int = Field(..., ge=0, le=100)


class BadgeItem(BaseModel):
    name: str
    icon: str
    earned: bool = False
    date: Optional[datetime] = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    username: Optional[str] = None
    avatar: str = ""
    bio: str = ""
    location: str = ""
    website: str = ""
    github: str = ""
    twitter: str = ""
    linkedin: str = ""
    role: str
    level: int
    xp: int
    streak: int
    longest_streak: int
    problems_solved: int
    projects_completed: int
    focus_hours: int
    email_verified: bool
    phone_verified: bool
    skills: List[SkillItem] = Field(default_factory=list)
    badges: List[BadgeItem] = Field(default_factory=list)
    created_at: Optional[datetime] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=200)
    github: Optional[str] = Field(None, max_length=200)
    twitter: Optional[str] = Field(None, max_length=200)
    linkedin: Optional[str] = Field(None, max_length=200)
    avatar: Optional[str] = None


class ProfileStatsResponse(BaseModel):
    problems_solved: int
    projects_completed: int
    streak: int
    longest_streak: int
    focus_hours: int
    level: int
    xp: int
    rank: str