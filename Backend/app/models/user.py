from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="")
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    email_verified = Column(Boolean, default=False)
    phone = Column(String(20), default="")
    phone_verified = Column(Boolean, default=False)
    
    avatar = Column(String(500), default="")
    bio = Column(String(500), default="")
    location = Column(String(100), default="")
    github = Column(String(200), default="")
    linkedin = Column(String(200), default="")
    
    role = Column(String(20), default="student")
    status = Column(String(20), default="active")
    
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    problems_solved = Column(Integer, default=0)
    projects_completed = Column(Integer, default=0)
    
    notifications_enabled = Column(Boolean, default=True)
    skills = Column(JSON, default=list)
    badges = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
