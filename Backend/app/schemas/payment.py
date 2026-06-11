from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CheckoutRequest(BaseModel):
    plan: str = "pro"  # pro or pro_max


class CheckoutResponse(BaseModel):
    checkout_url: Optional[str] = None
    session_id: Optional[str] = None
    error: Optional[str] = None


class VerifyResponse(BaseModel):
    success: bool
    message: str
    plan: Optional[str] = None
    error: Optional[str] = None


class PaymentHistoryItem(BaseModel):
    id: int
    plan: str
    amount: int
    currency: str
    status: str
    date: str


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[str] = None
    auto_renew: bool
    features: dict


class CancelSubscriptionResponse(BaseModel):
    success: bool
    message: str