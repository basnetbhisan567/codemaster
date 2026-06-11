from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.models.notification import Notification
from app.schemas.auth import RegisterRequest, TokenResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.core.logger import logger


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> TokenResponse:
        """Register a new user."""
        # Check email
        result = await self.db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check username
        if data.username:
            result = await self.db.execute(
                select(User).where(User.username == data.username)
            )
            if result.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Username taken")

        # Create user
        user = User(
            name=data.name,
            email=data.email,
            username=data.username or data.email.split("@")[0],
            phone=data.phone if hasattr(data, 'phone') else "",
            hashed_password=hash_password(data.password),
        )
        self.db.add(user)
        await self.db.flush()

        # Create welcome notification for the new user
        welcome_notif = Notification(
            user_id=user.id,
            type="system",
            title="Welcome to CodeMaster! 🚀",
            message=f"Hi {user.name}, your account has been created. Start your coding journey now! Complete your profile to get started.",
            action_url="/profile",
        )
        self.db.add(welcome_notif)

        # Notify admin about new user
        admin_notif = Notification(
            user_id=1,  # Admin user ID
            type="admin",
            title="New User Registered",
            message=f"New user: {user.name} ({user.email}) | Phone: {user.phone or 'N/A'}",
            action_url="/admin/users",
        )
        self.db.add(admin_notif)

        await self.db.commit()
        await self.db.refresh(user)

        logger.info(f"User registered: {user.email} (ID: {user.id})")

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            user={
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "level": user.level,
            },
        )

    async def login(self, email: str, password: str) -> TokenResponse:
        """Authenticate a user and return tokens."""
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if user.status == "banned":
            raise HTTPException(status_code=403, detail="Account banned")

        logger.info(f"User logged in: {user.email}")

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            user={
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "level": user.level,
            },
        )

    async def get_all_users(self) -> list:
        """Get all users for admin panel."""
        result = await self.db.execute(select(User).order_by(User.created_at.desc()))
        users = result.scalars().all()
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone": u.phone or "",
                "role": u.role,
                "status": u.status,
                "level": u.level,
                "created_at": u.created_at.isoformat() if u.created_at else "",
            }
            for u in users
        ]