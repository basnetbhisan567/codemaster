from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    action_url: str
    created_at: datetime
    user_email: str = ""
    user_phone: str = ""

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
    total: int


class CreateNotificationRequest(BaseModel):
    user_id: int
    type: str = "system"
    title: str
    message: str
    action_url: str = ""


class SendAllRequest(BaseModel):
    type: str = "system"
    title: str
    message: str
    action_url: str = ""