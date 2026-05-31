from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.project import Project, ProjectSubmission
from app.schemas.project import (
    ProjectResponse, ProjectListItem, ProjectListResponse,
    SubmitProjectRequest, ProjectSubmissionResponse,
)


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_projects(
        self,
        user_id: int = None,
        level: int = None,
        category: str = None,
        language: str = None,
        page: int = 1,
        limit: int = 20,
    ) -> ProjectListResponse:
        query = select(Project).where(Project.is_published == True)

        if level:
            query = query.where(Project.level == level)
        if category:
            query = query.where(Project.category == category)
        if language:
            query = query.where(Project.language == language)

        query = query.order_by(Project.level, Project.id)
        total = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        offset = (page - 1) * limit
        result = await self.db.execute(query.offset(offset).limit(limit))
        projects = result.scalars().all()

        project_list = []
        for p in projects:
            is_completed = False
            if user_id:
                completed = await self.db.scalar(
                    select(func.count(ProjectSubmission.id)).where(
                        ProjectSubmission.user_id == user_id,
                        ProjectSubmission.project_id == p.id,
                        ProjectSubmission.status == "approved",
                    )
                )
                is_completed = completed > 0

            project_list.append(ProjectListItem(
                id=p.id, title=p.title, slug=p.slug,
                level=p.level, category=p.category, language=p.language,
                xp_reward=p.xp_reward, estimated_hours=p.estimated_hours,
                times_completed=p.times_completed, is_completed=is_completed,
            ))

        return ProjectListResponse(projects=project_list, total=total, page=page, limit=limit)

    async def get_project(self, slug: str, user_id: int = None) -> ProjectResponse:
        result = await self.db.execute(select(Project).where(Project.slug == slug))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        is_completed = False
        if user_id:
            completed = await self.db.scalar(
                select(func.count(ProjectSubmission.id)).where(
                    ProjectSubmission.user_id == user_id,
                    ProjectSubmission.project_id == project.id,
                    ProjectSubmission.status == "approved",
                )
            )
            is_completed = completed > 0

        return ProjectResponse(
            id=project.id, title=project.title, slug=project.slug,
            description=project.description, level=project.level,
            category=project.category, language=project.language,
            requirements=project.requirements or [],
            starter_code=project.starter_code or "",
            xp_reward=project.xp_reward, estimated_hours=project.estimated_hours,
            times_completed=project.times_completed, is_completed=is_completed,
        )

    async def submit_project(
        self, user_id: int, slug: str, data: SubmitProjectRequest
    ) -> ProjectSubmissionResponse:
        result = await self.db.execute(select(Project).where(Project.slug == slug))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        submission = ProjectSubmission(
            user_id=user_id,
            project_id=project.id,
            code=data.code,
            demo_url=data.demo_url,
            repo_url=data.repo_url,
            status="pending",
        )
        self.db.add(submission)
        await self.db.commit()
        await self.db.refresh(submission)

        return ProjectSubmissionResponse(
            id=submission.id, project_id=submission.project_id,
            status=submission.status, score=submission.score,
            feedback=submission.feedback or "",
            demo_url=submission.demo_url or "",
            repo_url=submission.repo_url or "",
            submitted_at=submission.submitted_at,
            reviewed_at=submission.reviewed_at,
        )

    async def get_submissions(self, user_id: int) -> list[ProjectSubmissionResponse]:
        result = await self.db.execute(
            select(ProjectSubmission)
            .where(ProjectSubmission.user_id == user_id)
            .order_by(ProjectSubmission.submitted_at.desc())
            .limit(50)
        )
        submissions = result.scalars().all()

        return [ProjectSubmissionResponse(
            id=s.id, project_id=s.project_id, status=s.status,
            score=s.score, feedback=s.feedback or "",
            demo_url=s.demo_url or "", repo_url=s.repo_url or "",
            submitted_at=s.submitted_at, reviewed_at=s.reviewed_at,
        ) for s in submissions]