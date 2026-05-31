from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True)
    description = Column(Text, default="")
    language = Column(String(50), default="javascript")
    category = Column(String(50), default="fundamentals")
    difficulty = Column(String(20), default="beginner")
    order = Column(Integer, default=0)
    icon = Column(String(10), default="📚")
    tags = Column(JSON, default=list)
    estimated_hours = Column(Integer, default=1)
    xp_reward = Column(Integer, default=100)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow())

    lessons = relationship("Lesson", back_populates="topic", order_by="Lesson.order")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    code_example = Column(Text, default="")
    explanation = Column(Text, default="")
    order = Column(Integer, default=0)
    estimated_minutes = Column(Integer, default=15)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

    topic = relationship("Topic", back_populates="lessons")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    completed = Column(Boolean, default=False)
    score = Column(Integer, default=0)
    time_spent_minutes = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
