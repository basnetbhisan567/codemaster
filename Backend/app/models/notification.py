from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from datetime import datetime
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(30), default="system")
    title = Column(String(200), nullable=False)
    message = Column(Text, default="")
    data = Column(JSON, default=dict)
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), default="")
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
