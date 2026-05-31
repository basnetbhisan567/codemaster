from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    source = Column(String(20), default="manual")
    status = Column(String(20), default="pending")
    priority = Column(String(10), default="medium")
    due_date = Column(DateTime, nullable=True)
    tags = Column(JSON, default=list)
    notes = Column(Text, default="")
    attachments = Column(JSON, default=list)
    progress = Column(Integer, default=0)
    xp_reward = Column(Integer, default=200)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
