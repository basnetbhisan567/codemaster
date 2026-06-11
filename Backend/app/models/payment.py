from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from datetime import datetime, timezone
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, default=0)  # Amount in cents
    currency = Column(String(10), default="usd")
    plan = Column(String(50), default="free")  # free, pro, pro_max
    status = Column(String(20), default="pending")  # pending, completed, failed, refunded
    stripe_session_id = Column(String(200), default="", unique=True)
    stripe_payment_intent_id = Column(String(200), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    plan = Column(String(50), default="free")  # free, pro, pro_max
    status = Column(String(20), default="active")  # active, cancelled, expired
    stripe_subscription_id = Column(String(200), default="")
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))