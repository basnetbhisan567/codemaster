from fastapi import APIRouter, Depends, Request, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import stripe
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.payment import Payment, Subscription
from app.schemas.payment import (
    CheckoutRequest, CheckoutResponse, VerifyResponse,
    PaymentHistoryItem, SubscriptionResponse, CancelSubscriptionResponse
)
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/payments", tags=["Payments"])

# ============================================
# PLAN DEFINITIONS
# ============================================
PLANS = {
    "free": {
        "name": "CodeMaster Free",
        "amount": 0,
        "currency": "usd",
        "features": {
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
    },
    "pro": {
        "name": "CodeMaster Pro",
        "amount": 2900,  # $29.00 in cents
        "currency": "usd",
        "features": {
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
    },
    "pro_max": {
        "name": "CodeMaster Pro Max",
        "amount": 9900,  # $99.00 in cents
        "currency": "usd",
        "features": {
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
    },
}


# ============================================
# HELPER FUNCTIONS
# ============================================
async def get_user_subscription(user_id: int, db: AsyncSession) -> Subscription | None:
    """Get active subscription for a user."""
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.status == "active",
        )
    )
    return result.scalar_one_or_none()


async def activate_subscription(user_id: int, plan: str, db: AsyncSession, stripe_sub_id: str = ""):
    """Create or update a subscription."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id)
    )
    sub = result.scalar_one_or_none()

    if sub:
        sub.plan = plan
        sub.status = "active"
        sub.stripe_subscription_id = stripe_sub_id
        sub.current_period_start = datetime.now(timezone.utc)
        sub.current_period_end = None  # For one-time payments, no expiry
        sub.updated_at = datetime.now(timezone.utc)
    else:
        sub = Subscription(
            user_id=user_id,
            plan=plan,
            status="active",
            stripe_subscription_id=stripe_sub_id,
            current_period_start=datetime.now(timezone.utc),
        )
        db.add(sub)

    await db.commit()
    await db.refresh(sub)
    return sub


# ============================================
# ENDPOINTS
# ============================================

@router.get("/plans")
async def get_plans():
    """Get all available plans with features."""
    return {
        "success": True,
        "data": {
            plan_id: {
                "name": data["name"],
                "amount": data["amount"],
                "currency": data["currency"],
                "features": data["features"],
            }
            for plan_id, data in PLANS.items()
        },
    }


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's subscription status."""
    sub = await get_user_subscription(current_user.id, db)

    if not sub or sub.plan == "free":
        return SubscriptionResponse(
            plan="free",
            status="active",
            auto_renew=False,
            features=PLANS["free"]["features"],
        )

    plan_data = PLANS.get(sub.plan, PLANS["free"])
    return SubscriptionResponse(
        plan=sub.plan,
        status=sub.status,
        current_period_end=sub.current_period_end.isoformat() if sub.current_period_end else None,
        auto_renew=sub.auto_renew,
        features=plan_data["features"],
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request_data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe checkout session."""
    plan = request_data.plan

    if plan not in ["pro", "pro_max"]:
        raise HTTPException(status_code=400, detail="Invalid plan. Choose 'pro' or 'pro_max'")

    plan_data = PLANS.get(plan)
    if not plan_data:
        raise HTTPException(status_code=400, detail="Plan not found")

    # Check if user already has this plan
    existing_sub = await get_user_subscription(current_user.id, db)
    if existing_sub and existing_sub.plan == plan:
        raise HTTPException(
            status_code=400,
            detail=f"You already have an active {plan} subscription",
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": plan_data["currency"],
                    "product_data": {
                        "name": plan_data["name"],
                        "description": f"CodeMaster {plan.replace('_', ' ').title()} Plan",
                    },
                    "unit_amount": plan_data["amount"],
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/payment/cancel",
            customer_email=current_user.email,
            metadata={
                "user_id": str(current_user.id),
                "plan": plan,
            },
        )

        # Save pending payment record
        payment = Payment(
            user_id=current_user.id,
            plan=plan,
            amount=plan_data["amount"],
            currency=plan_data["currency"],
            status="pending",
            stripe_session_id=session.id,
        )
        db.add(payment)
        await db.commit()

        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id,
        )

    except stripe.error.StripeError as e:
        return CheckoutResponse(error=str(e))


@router.get("/verify", response_model=VerifyResponse)
async def verify_payment(
    session_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify Stripe payment and activate subscription."""
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        # Verify this session belongs to the current user
        if session.metadata.get("user_id") != str(current_user.id):
            raise HTTPException(status_code=403, detail="This payment does not belong to you")

        if session.payment_status == "paid":
            # Update payment record
            result = await db.execute(
                select(Payment).where(Payment.stripe_session_id == session_id)
            )
            payment = result.scalar_one_or_none()
            if payment:
                payment.status = "completed"
                payment.stripe_payment_intent_id = session.payment_intent or ""
                payment.completed_at = datetime.now(timezone.utc)

            # Activate subscription
            plan = session.metadata.get("plan", "pro")
            await activate_subscription(
                user_id=current_user.id,
                plan=plan,
                db=db,
                stripe_sub_id=session.id,
            )

            await db.commit()

            plan_data = PLANS.get(plan, PLANS["pro"])
            return VerifyResponse(
                success=True,
                message=f"Payment successful! Welcome to {plan_data['name']}! 🎉",
                plan=plan,
            )

        return VerifyResponse(
            success=False,
            message="Payment not completed yet",
        )

    except stripe.error.StripeError as e:
        return VerifyResponse(success=False, message=str(e), error=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        session_id = session.get("id")
        user_id = int(session.get("metadata", {}).get("user_id", 0))
        plan = session.get("metadata", {}).get("plan", "pro")

        if user_id and session_id:
            result = await db.execute(
                select(Payment).where(Payment.stripe_session_id == session_id)
            )
            payment = result.scalar_one_or_none()
            if payment:
                payment.status = "completed"
                payment.stripe_payment_intent_id = session.get("payment_intent", "")
                payment.completed_at = datetime.now(timezone.utc)

            await activate_subscription(
                user_id=user_id,
                plan=plan,
                db=db,
                stripe_sub_id=session_id,
            )
            await db.commit()

    # Handle checkout.session.expired
    elif event["type"] == "checkout.session.expired":
        session = event["data"]["object"]
        session_id = session.get("id")

        result = await db.execute(
            select(Payment).where(Payment.stripe_session_id == session_id)
        )
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = "failed"
            await db.commit()

    return {"status": "success"}


@router.get("/history")
async def payment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's payment history."""
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "plan": p.plan,
                "amount": p.amount,
                "currency": p.currency,
                "status": p.status,
                "date": p.created_at.isoformat() if p.created_at else None,
                "completed_at": p.completed_at.isoformat() if p.completed_at else None,
            }
            for p in payments
        ],
    }


@router.post("/cancel", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel current subscription (downgrade to free at period end)."""
    sub = await get_user_subscription(current_user.id, db)

    if not sub or sub.plan == "free":
        return CancelSubscriptionResponse(
            success=False,
            message="No active subscription to cancel",
        )

    sub.status = "cancelled"
    sub.auto_renew = False
    await db.commit()

    return CancelSubscriptionResponse(
        success=True,
        message=f"Your {sub.plan} subscription has been cancelled. You will have access until the end of your billing period.",
    )