from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from datetime import datetime, timezone
import random
from app.models.lockscreen import FocusSession, LockdownState
from app.schemas.lockscreen import (
    StartFocusRequest, EndFocusRequest,
    FocusSessionResponse, FocusStatsResponse,
    LockdownStatusResponse, UnlockRequest, UnlockResponse,
)


QUIZ_QUESTIONS = [
    {"question": "What is the time complexity of binary search?", "answer": "O(log n)"},
    {"question": "What does HTML stand for?", "answer": "HyperText Markup Language"},
    {"question": "In JavaScript, what is 2 + '2'?", "answer": "22"},
    {"question": "What keyword declares a constant in JavaScript?", "answer": "const"},
    {"question": "What is 5 + 3 * 2?", "answer": "11"},
]


class LockScreenService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def start_focus(self, user_id: int, data: StartFocusRequest) -> FocusSessionResponse:
        active = await self.db.scalar(
            select(FocusSession).where(
                FocusSession.user_id == user_id,
                FocusSession.completed == False,
            )
        )
        if active:
            raise HTTPException(status_code=400, detail="Active focus session already exists")

        session = FocusSession(
            user_id=user_id,
            start_time=datetime.now(timezone.utc),
            target_minutes=data.target_minutes,
        )
        self.db.add(session)

        quiz = random.choice(QUIZ_QUESTIONS)
        lockdown = await self.db.scalar(
            select(LockdownState).where(LockdownState.user_id == user_id)
        )
        if lockdown:
            lockdown.is_locked = True
            lockdown.lock_reason = "focus_mode"
            lockdown.quiz_question = quiz["question"]
            lockdown.quiz_answer = quiz["answer"].lower()
            lockdown.quiz_attempts = 0
            lockdown.locked_at = datetime.now(timezone.utc)
        else:
            lockdown = LockdownState(
                user_id=user_id,
                is_locked=True,
                lock_reason="focus_mode",
                quiz_question=quiz["question"],
                quiz_answer=quiz["answer"].lower(),
                locked_at=datetime.now(timezone.utc),
            )
            self.db.add(lockdown)

        await self.db.commit()
        await self.db.refresh(session)

        elapsed = int((datetime.now(timezone.utc) - session.start_time).total_seconds())
        remaining = max(0, (data.target_minutes * 60) - elapsed)

        return FocusSessionResponse(
            id=session.id,
            start_time=session.start_time,
            target_minutes=session.target_minutes,
            actual_minutes=0,
            completed=False,
            remaining_seconds=remaining,
        )

    async def end_focus(self, user_id: int, data: EndFocusRequest) -> FocusSessionResponse:
        result = await self.db.execute(
            select(FocusSession).where(
                FocusSession.user_id == user_id,
                FocusSession.completed == False,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="No active focus session")

        session.end_time = datetime.now(timezone.utc)
        session.actual_minutes = data.actual_minutes
        session.completed = True

        lockdown = await self.db.scalar(
            select(LockdownState).where(LockdownState.user_id == user_id)
        )
        if lockdown:
            lockdown.is_locked = False
            lockdown.lock_reason = ""

        await self.db.commit()
        await self.db.refresh(session)

        return FocusSessionResponse(
            id=session.id,
            start_time=session.start_time,
            end_time=session.end_time,
            target_minutes=session.target_minutes,
            actual_minutes=session.actual_minutes,
            completed=True,
            remaining_seconds=0,
        )

    async def get_active_session(self, user_id: int) -> FocusSessionResponse:
        result = await self.db.execute(
            select(FocusSession).where(
                FocusSession.user_id == user_id,
                FocusSession.completed == False,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="No active focus session")

        elapsed = int((datetime.now(timezone.utc) - session.start_time).total_seconds())
        remaining = max(0, (session.target_minutes * 60) - elapsed)

        return FocusSessionResponse(
            id=session.id,
            start_time=session.start_time,
            target_minutes=session.target_minutes,
            actual_minutes=session.actual_minutes,
            completed=False,
            remaining_seconds=remaining,
        )

    async def get_stats(self, user_id: int) -> FocusStatsResponse:
        total = await self.db.scalar(
            select(func.count(FocusSession.id)).where(FocusSession.user_id == user_id)
        )
        completed = await self.db.scalar(
            select(func.count(FocusSession.id)).where(
                FocusSession.user_id == user_id,
                FocusSession.completed == True,
            )
        )
        total_minutes = await self.db.scalar(
            select(func.coalesce(func.sum(FocusSession.actual_minutes), 0)).where(
                FocusSession.user_id == user_id,
            )
        )

        today = await self.db.scalar(
            select(func.coalesce(func.sum(FocusSession.actual_minutes), 0)).where(
                FocusSession.user_id == user_id,
                func.date(FocusSession.start_time) == func.date(datetime.now(timezone.utc)),
            )
        )

        return FocusStatsResponse(
            total_sessions=total or 0,
            total_minutes=total_minutes or 0,
            completed_sessions=completed or 0,
            current_streak=0,
            today_minutes=today or 0,
        )

    async def get_lockdown_status(self, user_id: int) -> LockdownStatusResponse:
        result = await self.db.execute(
            select(LockdownState).where(LockdownState.user_id == user_id)
        )
        state = result.scalar_one_or_none()

        if not state or not state.is_locked:
            return LockdownStatusResponse(is_locked=False, lock_reason="", attempts_remaining=3)

        return LockdownStatusResponse(
            is_locked=True,
            lock_reason=state.lock_reason,
            quiz_question=state.quiz_question,
            attempts_remaining=state.max_attempts - state.quiz_attempts,
        )

    async def attempt_unlock(self, user_id: int, data: UnlockRequest) -> UnlockResponse:
        result = await self.db.execute(
            select(LockdownState).where(LockdownState.user_id == user_id)
        )
        state = result.scalar_one_or_none()

        if not state or not state.is_locked:
            return UnlockResponse(success=True, message="Not locked")

        state.quiz_attempts += 1

        if data.answer.lower().strip() == state.quiz_answer.lower():
            state.is_locked = False
            state.lock_reason = ""
            await self.db.commit()
            return UnlockResponse(success=True, message="Unlocked!")

        remaining = state.max_attempts - state.quiz_attempts

        if remaining <= 0:
            quiz = random.choice(QUIZ_QUESTIONS)
            state.quiz_question = quiz["question"]
            state.quiz_answer = quiz["answer"].lower()
            state.quiz_attempts = 0
            await self.db.commit()
            return UnlockResponse(
                success=False,
                message="Max attempts reached. New question generated.",
                remaining_attempts=3,
            )

        await self.db.commit()
        return UnlockResponse(
            success=False,
            message=f"Wrong answer. {remaining} attempts remaining.",
            remaining_attempts=remaining,
        )