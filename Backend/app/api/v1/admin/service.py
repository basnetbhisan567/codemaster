from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.problem import Problem, Submission
from app.models.project import Project, ProjectSubmission
from app.models.community import ForumTopic, ChatMessage
from app.models.job import Job


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_stats(self) -> dict:
        total_users = await self.db.scalar(select(func.count(User.id)))
        active_users = await self.db.scalar(
            select(func.count(User.id)).where(User.status == "active")
        )
        total_problems = await self.db.scalar(select(func.count(Problem.id)))
        total_projects = await self.db.scalar(select(func.count(Project.id)))
        total_jobs = await self.db.scalar(select(func.count(Job.id)))
        total_messages = await self.db.scalar(select(func.count(ChatMessage.id)))

        return {
            "users": {"total": total_users or 0, "active": active_users or 0},
            "content": {
                "problems": total_problems or 0,
                "projects": total_projects or 0,
                "jobs": total_jobs or 0,
                "messages": total_messages or 0,
            },
        }

    async def get_recent_users(self, limit: int = 10) -> list:
        result = await self.db.execute(
            select(User).order_by(User.created_at.desc()).limit(limit)
        )
        users = result.scalars().all()
        return [
            {
                "id": u.id, "name": u.name, "email": u.email,
                "role": u.role, "status": u.status,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ]

    async def update_user_status(self, user_id: int, status: str) -> dict:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return {"error": "User not found"}
        user.status = status
        await self.db.commit()
        return {"message": f"User {user_id} status updated to {status}"}