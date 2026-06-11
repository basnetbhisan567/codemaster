from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.payment import Subscription

PLAN_FEATURES = {
    "free": {
        "playground_languages": 3,
        "daily_problems": 3,
        "ai_code_review": 0,
        "ai_chat_messages": 0,
        "ai_tools_access": False,
        "job_board_access": False,
        "projects": 0,
        "focus_max_minutes": 15,
        "study_music_playlists": 1,
        "tech_blogs": "read",
        "study_groups": 1,
        "file_upload_mb": 0,
        "api_access": False,
        "sso": False,
        "support": "community",
    },
    "pro": {
        "playground_languages": 12,
        "daily_problems": "unlimited",
        "ai_code_review": 100,
        "ai_chat_messages": 200,
        "ai_tools_access": True,
        "job_board_access": True,
        "projects": 3,
        "focus_max_minutes": 90,
        "study_music_playlists": "all",
        "tech_blogs": "read_bookmark",
        "study_groups": 5,
        "file_upload_mb": 25,
        "api_access": False,
        "sso": False,
        "support": "priority_email",
    },
    "pro_max": {
        "playground_languages": "unlimited",
        "daily_problems": "unlimited",
        "ai_code_review": "unlimited",
        "ai_chat_messages": "unlimited",
        "ai_tools_access": True,
        "job_board_access": True,
        "projects": "unlimited",
        "focus_max_minutes": "unlimited",
        "study_music_playlists": "all_custom",
        "tech_blogs": "read_download",
        "study_groups": "unlimited",
        "file_upload_mb": 100,
        "api_access": True,
        "sso": True,
        "support": "live_chat",
    },
}


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_plan(self, user_id: int) -> str:
        """Get the current plan for a user."""
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.status == "active",
            )
        )
        sub = result.scalar_one_or_none()
        return sub.plan if sub else "free"

    async def get_features(self, user_id: int) -> dict:
        """Get features for the current user's plan."""
        plan = await self.get_user_plan(user_id)
        return PLAN_FEATURES.get(plan, PLAN_FEATURES["free"])

    async def check_access(self, user_id: int, feature: str) -> bool:
        """Check if user has access to a specific feature."""
        features = await self.get_features(user_id)
        value = features.get(feature)
        if value is None:
            return False
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value > 0
        if value == "unlimited":
            return True
        return bool(value)

    async def get_usage_count(self, user_id: int, feature: str) -> int:
        """Get the current usage count for rate-limited features."""
        # This would track daily/monthly usage in a separate table
        # For now, return 0
        return 0

    async def can_use_feature(self, user_id: int, feature: str) -> tuple[bool, str]:
        """Check if user can use a feature, returns (allowed, reason)."""
        features = await self.get_features(user_id)
        limit = features.get(feature)

        if limit is None:
            return False, f"Feature '{feature}' not available on your plan"

        if limit == "unlimited" or limit is True:
            return True, ""

        if isinstance(limit, bool) and not limit:
            return False, f"Feature '{feature}' requires a Pro or Pro Max plan"

        if isinstance(limit, (int, float)) and limit > 0:
            used = await self.get_usage_count(user_id, feature)
            if used >= limit:
                return False, f"You've reached your {feature} limit ({limit}). Upgrade to continue."
            return True, ""

        return False, f"Feature '{feature}' not available"