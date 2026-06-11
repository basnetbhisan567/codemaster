from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import decode_token
from app.api.v1.payments.service import PaymentService
from app.core.database import AsyncSessionLocal


# Routes that require specific plans
PROTECTED_ROUTES = {
    "/api/v1/jobs": "job_board_access",
    "/api/v1/content/tools": "ai_tools_access",
    "/api/v1/projects": "projects",
    "/api/v1/ai/chat": "ai_chat_messages",
    "/api/v1/ai/review-code": "ai_code_review",
    "/api/v1/lockscreen/focus/start": "focus_max_minutes",
}


class SubscriptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip non-protected routes
        path = request.url.path
        required_feature = None

        for route_prefix, feature in PROTECTED_ROUTES.items():
            if path.startswith(route_prefix):
                required_feature = feature
                break

        if not required_feature:
            return await call_next(request)

        # Check auth
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return await call_next(request)

        try:
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            user_id = payload.get("user_id")

            if user_id:
                async with AsyncSessionLocal() as db:
                    service = PaymentService(db)
                    allowed, reason = await service.can_use_feature(user_id, required_feature)

                    if not allowed:
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail={
                                "message": reason,
                                "required_plan": "pro",
                                "upgrade_url": "/api/v1/payments/checkout",
                            },
                        )
        except HTTPException:
            raise
        except Exception:
            pass

        return await call_next(request)