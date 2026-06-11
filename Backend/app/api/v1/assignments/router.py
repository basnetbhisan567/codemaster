from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.assignments.service import AssignmentService
from app.schemas.assignment import (
    AssignmentResponse, CreateAssignmentRequest, UpdateAssignmentRequest,
)

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.get("/", response_model=list[AssignmentResponse])
async def list_assignments(
    status: Optional[str] = None,
    
    db: AsyncSession = Depends(get_db),
):
    return await AssignmentService(db).get_all(current_user.id, status)


@router.post("/", response_model=AssignmentResponse)
async def create_assignment(
    data: CreateAssignmentRequest,
    
    db: AsyncSession = Depends(get_db),
):
    return await AssignmentService(db).create(current_user.id, data)


@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: int,
    data: UpdateAssignmentRequest,
    
    db: AsyncSession = Depends(get_db),
):
    return await AssignmentService(db).update(current_user.id, assignment_id, data)


@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: int,
    
    db: AsyncSession = Depends(get_db),
):
    return await AssignmentService(db).delete(current_user.id, assignment_id)
