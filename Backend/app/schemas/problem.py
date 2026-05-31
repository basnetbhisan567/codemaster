from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TestCase(BaseModel):
    input: str
    expected_output: str
    description: str = ""


class Hint(BaseModel):
    text: str
    cost_percentage: int = 25


class ProblemResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    difficulty: str
    category: str
    language: str
    starter_code: str = ""
    test_cases: List[TestCase] = []
    hints: List[Hint] = []
    tags: List[str] = []
    xp_reward: int
    time_limit_seconds: int
    times_solved: int
    success_rate: int

    class Config:
        from_attributes = True


class ProblemListItem(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: str
    category: str
    language: str
    tags: List[str] = []
    xp_reward: int
    times_solved: int
    success_rate: int
    is_solved: bool = False

    class Config:
        from_attributes = True


class ProblemListResponse(BaseModel):
    problems: List[ProblemListItem]
    total: int
    page: int
    limit: int


class SubmitCodeRequest(BaseModel):
    code: str = Field(..., min_length=5)
    language: str = "javascript"


class SubmissionResponse(BaseModel):
    id: int
    problem_id: int
    status: str
    passed_tests: int
    total_tests: int
    execution_time_ms: int
    error_message: str = ""
    xp_earned: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class HintRequest(BaseModel):
    hint_index: int = Field(0, ge=0)