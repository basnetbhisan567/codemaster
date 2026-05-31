from pydantic import BaseModel
from typing import List
from datetime import datetime


class NewsResponse(BaseModel):
    id: int
    title: str
    summary: str
    source: str
    source_url: str
    image_url: str
    category: str
    tags: List[str] = []
    read_time: str
    published_at: datetime

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    articles: List[NewsResponse]
    total: int
    page: int
    limit: int