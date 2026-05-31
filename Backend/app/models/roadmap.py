from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class RoadmapDay(Base):
    __tablename__ = "roadmap_days"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day = Column(Integer, nullable=False)
    title = Column(String(300), nullable=False)
    basic_topic = Column(String(200), default="")
    advanced_topic = Column(String(200), default="")
    status = Column(String(20), default="upcoming")
    snippet_basic = Column(Text, default="")
    snippet_advanced = Column(Text, default="")
    xp_reward = Column(Integer, default=100)
    estimated_time = Column(String(20), default="45 min")
    scheduled_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
