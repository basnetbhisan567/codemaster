from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.models.notification import Notification
from app.models.user import User
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

        # Get user info for email/phone
        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        return NotificationListResponse(
            notifications=[
                NotificationResponse(
                    id=n.id,
                    type=n.type,
                    title=n.title,
                    message=n.message or "",
                    is_read=n.is_read,
                    action_url=n.action_url or "",
                    created_at=n.created_at,
                    user_email=user.email if user else "",
                    user_phone=user.phone if user else "",
                )
                for n in notifications
            ],
            unread_count=unread or 0,
            total=len(notifications),
        )

    async def get_all_users_with_info(self) -> list:
        """Get all users with email and phone for admin notification dispatcher."""
        result = await self.db.execute(select(User))
        users = result.scalars().all()
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone": u.phone or "",
                "role": u.role,
            }
            for u in users
        ]

    async def mark_as_read(self, user_id: int, notification_id: int = None) -> dict:
        if notification_id:
            result = await self.db.execute(
                select(Notification).where(
                    Notification.id == notification_id,
                    Notification.user_id == user_id,
                )
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

    async def create(
        self,
        user_id: int,
        type: str,
        title: str,
        message: str,
        action_url: str = "",
    ) -> NotificationResponse:
        notif = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            action_url=action_url,
        )
        self.db.add(notif)
        await self.db.commit()
        await self.db.refresh(notif)

        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        return NotificationResponse(
            id=notif.id,
            type=notif.type,
            title=notif.title,
            message=notif.message or "",
            is_read=notif.is_read,
            action_url=notif.action_url or "",
            created_at=notif.created_at,
            user_email=user.email if user else "",
            user_phone=user.phone if user else "",
        )

    async def send_to_all(
        self,
        type: str,
        title: str,
        message: str,
        action_url: str = "",
    ) -> dict:
        """Send notification to all users."""
        result = await self.db.execute(select(User))
        users = result.scalars().all()
        count = 0
        for user in users:
            notif = Notification(
                user_id=user.id,
                type=type,
                title=title,
                message=message,
                action_url=action_url,
            )
            self.db.add(notif)
            count += 1
        await self.db.commit()
        return {"sent": count, "message": f"Sent to {count} users"}