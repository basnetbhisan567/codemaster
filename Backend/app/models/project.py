from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, index=True)
    description = Column(Text, nullable=False)
    level = Column(Integer, default=1)
    category = Column(String(50), default="frontend")
    language = Column(String(50), default="javascript")
    requirements = Column(JSON, default=list)
    starter_code = Column(Text, default="")
    solution_guide = Column(Text, default="")
    xp_reward = Column(Integer, default=500)
    estimated_hours = Column(Integer, default=10)
    is_published = Column(Boolean, default=True)
    times_completed = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

    submissions = relationship("ProjectSubmission", back_populates="project")


class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    code = Column(Text, default="")
    demo_url = Column(String(500), default="")
    repo_url = Column(String(500), default="")
    status = Column(String(20), default="pending")
    score = Column(Integer, default=0)
    feedback = Column(Text, default="")
    submitted_at = Column(DateTime, default=lambda: datetime.utcnow())
    reviewed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="submissions")
