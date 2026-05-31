from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.logger import logger


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> TokenResponse:
        """Register a new user."""
        result = await self.db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        if data.username:
            result = await self.db.execute(select(User).where(User.username == data.username))
            if result.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Username taken")

        user = User(
            name=data.name,
            email=data.email,
            username=data.username or data.email.split("@")[0],
            hashed_password=hash_password(data.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        logger.info(f"User registered: {user.email}")

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            user={"id": user.id, "name": user.name, "email": user.email, "role": user.role, "level": user.level},
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
            user={"id": user.id, "name": user.name, "email": user.email, "role": user.role, "level": user.level},
        )