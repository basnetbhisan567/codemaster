from fastapi import APIRouter
from app.api.v1.ai.service import AIService
from app.schemas.ai import (
    ChatRequest, ChatResponse,
    CodeGenerateRequest, CodeGenerateResponse,
    CodeFixRequest, CodeFixResponse,
    CodeReviewRequest, CodeReviewResponse,
    TutorRequest, TutorResponse,
    ProvidersResponse,
)


router = APIRouter(tags=["AI"])  # REMOVED prefix="/ai"
service = AIService()


@router.post("/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    return await service.chat(request)


@router.post("/ai/generate-code", response_model=CodeGenerateResponse)
async def generate_code(request: CodeGenerateRequest):
    return await service.generate_code(request)


@router.post("/ai/fix-code", response_model=CodeFixResponse)
async def fix_code(request: CodeFixRequest):
    return await service.fix_code(request)


@router.post("/ai/review-code", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    return await service.review_code(request)


@router.post("/ai/tutor", response_model=TutorResponse)
async def tutor(request: TutorRequest):
    return await service.tutor(request)


@router.get("/ai/providers", response_model=ProvidersResponse)
async def list_providers():
    return service.get_providers()