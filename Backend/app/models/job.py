from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey, Float
from datetime import datetime
from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    company = Column(String(200), nullable=False)
    company_logo = Column(String(500), default="")
    location = Column(String(200), default="")
    salary = Column(String(100), default="")
    description = Column(Text, default="")
    requirements = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    remote = Column(Boolean, default=False)
    source = Column(String(50), default="manual")
    source_url = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
    posted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(String(30), default="saved")
    resume_url = Column(String(500), default="")
    cover_letter = Column(Text, default="")
    ats_score = Column(Integer, default=0)
    ats_feedback = Column(JSON, default=list)
    notes = Column(Text, default="")
    applied_at = Column(DateTime, nullable=True)
    interview_date = Column(DateTime, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserResume(Base):
    __tablename__ = "user_resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String(200), default="")
    email = Column(String(255), default="")
    phone = Column(String(20), default="")
    summary = Column(Text, default="")
    skills = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    education = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    portfolio_url = Column(String(500), default="")
    github_url = Column(String(500), default="")
    linkedin_url = Column(String(500), default="")
    resume_file_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
