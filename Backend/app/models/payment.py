from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, default=0)
    currency = Column(String(10), default="usd")
    plan = Column(String(50), default="pro")
    status = Column(String(20), default="pending")
    stripe_session_id = Column(String(200), default="")
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
