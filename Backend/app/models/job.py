from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime
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
    posted_at = Column(DateTime, default=lambda: datetime.utcnow())
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
