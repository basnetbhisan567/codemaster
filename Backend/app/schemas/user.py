from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    username: Optional[str] = None
    role: str
    level: int
    avatar: str = ""
    bio: str = ""
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    avatar: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    github: Optional[str] = Field(None, max_length=200)
    linkedin: Optional[str] = Field(None, max_length=200)


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    limit: int