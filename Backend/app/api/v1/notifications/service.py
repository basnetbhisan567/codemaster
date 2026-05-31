from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationListResponse


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_notifications(self, user_id: int, limit: int = 50) -> NotificationListResponse:
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        notifications = result.scalars().all()

        unread = await self.db.scalar(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
        )

        return NotificationListResponse(
            notifications=[NotificationResponse.model_validate(n) for n in notifications],
            unread_count=unread or 0,
            total=len(notifications),
        )

    async def mark_as_read(self, user_id: int, notification_id: int = None) -> dict:
        if notification_id:
            result = await self.db.execute(
                select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
            )
            notif = result.scalar_one_or_none()
            if notif:
                notif.is_read = True
        else:
            await self.db.execute(
                update(Notification)
                .where(Notification.user_id == user_id, Notification.is_read == False)
                .values(is_read=True)
            )
        await self.db.commit()
        return {"message": "Marked as read"}

    async def create(self, user_id: int, type: str, title: str, message: str, action_url: str = "") -> NotificationResponse:
        notif = Notification(
            user_id=user_id, type=type, title=title,
            message=message, action_url=action_url,
        )
        self.db.add(notif)
        await self.db.commit()
        await self.db.refresh(notif)
        return NotificationResponse.model_validate(notif)