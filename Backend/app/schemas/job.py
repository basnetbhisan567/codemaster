from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    company_logo: str
    location: str
    salary: str
    description: str
    requirements: List[str] = []
    tags: List[str] = []
    remote: bool
    source: str
    posted_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
