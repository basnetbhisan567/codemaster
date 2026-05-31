from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException
from app.models.assignment import Assignment
from app.schemas.assignment import (
    AssignmentResponse, CreateAssignmentRequest, UpdateAssignmentRequest,
)


class AssignmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, user_id: int, status: str = None) -> list[AssignmentResponse]:
        query = select(Assignment).where(Assignment.user_id == user_id)
        if status:
            query = query.where(Assignment.status == status)
        query = query.order_by(Assignment.due_date.asc().nulls_last(), Assignment.created_at.desc())
        result = await self.db.execute(query)
        return [AssignmentResponse.model_validate(a) for a in result.scalars().all()]

    async def create(self, user_id: int, data: CreateAssignmentRequest) -> AssignmentResponse:
        assignment = Assignment(user_id=user_id, **data.model_dump())
        self.db.add(assignment)
        await self.db.commit()
        await self.db.refresh(assignment)
        return AssignmentResponse.model_validate(assignment)

    async def update(self, user_id: int, assignment_id: int, data: UpdateAssignmentRequest) -> AssignmentResponse:
        result = await self.db.execute(
            select(Assignment).where(Assignment.id == assignment_id, Assignment.user_id == user_id)
        )
        assignment = result.scalar_one_or_none()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(assignment, field, value)
        await self.db.commit()
        await self.db.refresh(assignment)
        return AssignmentResponse.model_validate(assignment)

    async def delete(self, user_id: int, assignment_id: int) -> dict:
        result = await self.db.execute(
            select(Assignment).where(Assignment.id == assignment_id, Assignment.user_id == user_id)
        )
        assignment = result.scalar_one_or_none()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        await self.db.delete(assignment)
        await self.db.commit()
        return {"message": "Assignment deleted"}