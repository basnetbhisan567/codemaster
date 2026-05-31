from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.problem import Problem, Submission
from app.schemas.problem import (
    ProblemResponse, ProblemListItem, ProblemListResponse,
    SubmitCodeRequest, SubmissionResponse, HintRequest,
)


class ProblemService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_problems(
        self,
        user_id: int = None,
        difficulty: str = None,
        category: str = None,
        language: str = None,
        page: int = 1,
        limit: int = 20,
    ) -> ProblemListResponse:
        query = select(Problem).where(Problem.is_published == True)

        if difficulty:
            query = query.where(Problem.difficulty == difficulty)
        if category:
            query = query.where(Problem.category == category)
        if language:
            query = query.where(Problem.language == language)

        total = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        offset = (page - 1) * limit
        result = await self.db.execute(query.offset(offset).limit(limit))
        problems = result.scalars().all()

        problem_list = []
        for p in problems:
            is_solved = False
            if user_id:
                solved = await self.db.scalar(
                    select(func.count(Submission.id)).where(
                        Submission.user_id == user_id,
                        Submission.problem_id == p.id,
                        Submission.status == "accepted",
                    )
                )
                is_solved = solved > 0

            problem_list.append(ProblemListItem(
                id=p.id, title=p.title, slug=p.slug,
                difficulty=p.difficulty, category=p.category,
                language=p.language, tags=p.tags or [],
                xp_reward=p.xp_reward, times_solved=p.times_solved,
                success_rate=p.success_rate, is_solved=is_solved,
            ))

        return ProblemListResponse(problems=problem_list, total=total, page=page, limit=limit)

    async def get_problem(self, slug: str) -> ProblemResponse:
        result = await self.db.execute(select(Problem).where(Problem.slug == slug))
        problem = result.scalar_one_or_none()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        return ProblemResponse.model_validate(problem)

    async def get_hint(self, slug: str, request: HintRequest) -> dict:
        result = await self.db.execute(select(Problem).where(Problem.slug == slug))
        problem = result.scalar_one_or_none()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        hints = problem.hints or []
        if request.hint_index >= len(hints):
            return {"hint": "No more hints available", "index": request.hint_index}

        return {"hint": hints[request.hint_index], "index": request.hint_index}


class SubmissionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def submit(
        self,
        user_id: int,
        slug: str,
        data: SubmitCodeRequest,
    ) -> SubmissionResponse:
        result = await self.db.execute(select(Problem).where(Problem.slug == slug))
        problem = result.scalar_one_or_none()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        import time
        import random

        start_time = time.time()
        time.sleep(random.uniform(0.1, 0.5))

        test_cases = problem.test_cases or []
        total_tests = len(test_cases)
        passed_tests = random.randint(0, total_tests) if total_tests > 0 else 0

        if total_tests == 0:
            status_result = "accepted"
            passed_tests = 1
            total_tests = 1
        elif passed_tests == total_tests:
            status_result = "accepted"
        elif passed_tests > 0:
            status_result = "partial"
        else:
            status_result = "failed"

        execution_time = int((time.time() - start_time) * 1000)
        memory_used = random.randint(1000, 50000)

        submission = Submission(
            user_id=user_id,
            problem_id=problem.id,
            code=data.code,
            language=data.language,
            status=status_result,
            passed_tests=passed_tests,
            total_tests=total_tests,
            execution_time_ms=execution_time,
            memory_used_kb=memory_used,
        )
        self.db.add(submission)

        if status_result == "accepted":
            problem.times_solved += 1
            if problem.times_solved > 0:
                problem.success_rate = int((problem.times_solved - 1) / problem.times_solved * 100)

        await self.db.commit()
        await self.db.refresh(submission)

        xp = problem.xp_reward if status_result == "accepted" else 0

        return SubmissionResponse(
            id=submission.id,
            problem_id=problem.id,
            status=status_result,
            passed_tests=passed_tests,
            total_tests=total_tests,
            execution_time_ms=execution_time,
            error_message="" if status_result == "accepted" else "Some test cases failed",
            xp_earned=xp,
            created_at=submission.created_at,
        )

    async def get_submissions(self, user_id: int, slug: str) -> list[SubmissionResponse]:
        result = await self.db.execute(select(Problem).where(Problem.slug == slug))
        problem = result.scalar_one_or_none()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        result = await self.db.execute(
            select(Submission)
            .where(Submission.user_id == user_id, Submission.problem_id == problem.id)
            .order_by(Submission.created_at.desc())
            .limit(20)
        )
        submissions = result.scalars().all()

        return [SubmissionResponse(
            id=s.id, problem_id=s.problem_id, status=s.status,
            passed_tests=s.passed_tests, total_tests=s.total_tests,
            execution_time_ms=s.execution_time_ms,
            error_message=s.error_message,
            xp_earned=problem.xp_reward if s.status == "accepted" else 0,
            created_at=s.created_at,
        ) for s in submissions]