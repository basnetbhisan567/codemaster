from pydantic import BaseModel, Field
from typing import Optional, List
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


class JobSearchRequest(BaseModel):
    query: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    remote: Optional[bool] = None
    company: Optional[str] = None
    tags: List[str] = []
    page: int = 1
    limit: int = 20


class ResumeData(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    summary: str = ""
    skills: List[str] = []
    experience: List[dict] = []
    education: List[dict] = []
    projects: List[dict] = []
    certifications: List[dict] = []
    portfolio_url: str = ""
    github_url: str = ""
    linkedin_url: str = ""


class ATSReviewResponse(BaseModel):
    score: int
    strengths: List[str] = []
    weaknesses: List[str] = []
    suggestions: List[str] = []
    keyword_match: int = 0
    format_score: int = 0
    content_score: int = 0
    overall_feedback: str = ""


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    job_title: str = ""
    company: str = ""
    status: str
    ats_score: int = 0
    applied_at: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    notes: str = ""
    created_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationStats(BaseModel):
    total_applications: int
    applied: int
    interviewing: int
    offered: int
    accepted: int
    rejected: int
    response_rate: float


class CareerAdviceRequest(BaseModel):
    question: str
    context: Optional[str] = None