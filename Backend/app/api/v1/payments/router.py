from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import stripe
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/payments", tags=["Payments"])

PLANS = {
    "pro": {"name": "CodeMaster Pro", "amount": 999, "currency": "usd"},
    "enterprise": {"name": "CodeMaster Enterprise", "amount": 2999, "currency": "usd"},
}


@router.post("/checkout")
async def create_checkout(
    plan: str = "pro",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a REAL Stripe checkout session."""
    plan_data = PLANS.get(plan, PLANS["pro"])

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": plan_data["currency"],
                    "product_data": {"name": plan_data["name"]},
                    "unit_amount": plan_data["amount"],
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url="http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:5173/payment/cancel",
            metadata={"user_id": str(current_user.id), "plan": plan},
        )

        # Save pending payment
        payment = Payment(
            user_id=current_user.id,
            plan=plan,
            amount=plan_data["amount"],
            status="pending",
            stripe_session_id=session.id,
        )
        db.add(payment)
        await db.commit()

        return {"checkout_url": session.url, "session_id": session.id}

    except stripe.error.StripeError as e:
        return {"error": str(e)}


@router.get("/verify")
async def verify_payment(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify Stripe payment and activate subscription."""
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == "paid":
            result = await db.execute(
                select(Payment).where(Payment.stripe_session_id == session_id)
            )
            payment = result.scalar_one_or_none()
            if payment:
                payment.status = "completed"
                await db.commit()

            return {
                "success": True,
                "message": "Payment successful! Welcome to CodeMaster Pro! 🎉",
                "plan": session.metadata.get("plan"),
            }

        return {"success": False, "message": "Payment not completed"}

    except stripe.error.StripeError as e:
        return {"error": str(e)}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            result = await db.execute(
                select(Payment).where(Payment.stripe_session_id == session["id"])
            )
            payment = result.scalar_one_or_none()
            if payment:
                payment.status = "completed"
                await db.commit()

        return {"status": "success"}

    except stripe.error.SignatureVerificationError:
        return {"error": "Invalid signature"}, 400


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
    return [
        {
            "id": p.id,
            "plan": p.plan,
            "amount": p.amount,
            "status": p.status,
            "date": p.created_at.isoformat(),
        }
        for p in payments
    ]