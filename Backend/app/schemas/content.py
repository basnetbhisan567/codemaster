from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TechBlogResponse(BaseModel):
    id: int
    title: str
    summary: str
    author: str
    source: str
    source_url: str
    image_url: str
    category: str
    tags: List[str] = []
    read_time: str
    published_at: Optional[datetime] = None
    view_count: int

    class Config:
        from_attributes = True


class TechBlogListResponse(BaseModel):
    blogs: List[TechBlogResponse]
    total: int
    page: int
    limit: int


class TechToolResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    url: str
    github_url: str
    pricing: str
    features: List[str] = []
    tags: List[str] = []
    stars: int
    rating: int
    logo_url: str
    is_open_source: bool
    view_count: int

    class Config:
        from_attributes = True


class TechToolListResponse(BaseModel):
    tools: List[TechToolResponse]
    total: int
    page: int
    limit: int


class TechNewsResponse(BaseModel):
    id: int
    title: str
    summary: str
    source: str
    source_url: str
    image_url: str
    category: str
    tags: List[str] = []
    read_time: str
    published_at: Optional[datetime] = None
    view_count: int

    class Config:
        from_attributes = True


class TechNewsListResponse(BaseModel):
    news: List[TechNewsResponse]
    total: int
    page: int
    limit: int