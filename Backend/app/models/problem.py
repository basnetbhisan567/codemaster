from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    expert = "expert"


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, index=True)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), default="easy")
    category = Column(String(50), default="algorithms")
    language = Column(String(50), default="javascript")
    starter_code = Column(Text, default="")
    test_cases = Column(JSON, default=list)
    solution = Column(Text, default="")
    hints = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    xp_reward = Column(Integer, default=100)
    time_limit_seconds = Column(Integer, default=30)
    is_published = Column(Boolean, default=True)
    times_solved = Column(Integer, default=0)
    success_rate = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

    submissions = relationship("Submission", back_populates="problem")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String(50), default="javascript")
    status = Column(String(20), default="pending")
    passed_tests = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)
    execution_time_ms = Column(Integer, default=0)
    memory_used_kb = Column(Integer, default=0)
    error_message = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

    problem = relationship("Problem", back_populates="submissions")
