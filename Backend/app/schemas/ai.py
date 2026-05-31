from pydantic import BaseModel, Field
from typing import Optional, List


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    provider: Optional[str] = Field(default="auto", pattern="^(auto|gemini|groq|deepseek|openrouter|ollama)$")
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=0.7, ge=0, le=2)


class ChatResponse(BaseModel):
    response: str
    provider: str
    model: str


class CodeGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=5)
    language: str = Field(default="python")
    provider: Optional[str] = Field(default="auto", pattern="^(auto|gemini|groq|deepseek|openrouter|ollama)$")


class CodeGenerateResponse(BaseModel):
    code: str
    language: str
    provider: str
    explanation: str = ""


class CodeFixRequest(BaseModel):
    code: str = Field(..., min_length=5)
    error: str = Field(..., min_length=5)
    language: str = Field(default="python")
    provider: Optional[str] = Field(default="auto", pattern="^(auto|gemini|groq|deepseek|openrouter|ollama)$")


class CodeFixResponse(BaseModel):
    explanation: str
    fixed_code: str
    provider: str


class CodeReviewRequest(BaseModel):
    code: str = Field(..., min_length=10)
    language: str = Field(default="python")
    provider: Optional[str] = Field(default="auto", pattern="^(auto|gemini|groq|deepseek|openrouter|ollama)$")


class CodeReviewResponse(BaseModel):
    score: int = Field(..., ge=0, le=10)
    bugs: List[str] = []
    improvements: List[str] = []
    security: List[str] = []
    performance: List[str] = []
    provider: str


class TutorRequest(BaseModel):
    question: str = Field(..., min_length=5)
    topic: str = Field(..., min_length=2)
    difficulty: str = Field(default="beginner", pattern="^(beginner|intermediate|advanced)$")
    provider: Optional[str] = Field(default="auto", pattern="^(auto|gemini|groq|deepseek|openrouter|ollama)$")


class TutorResponse(BaseModel):
    response: str
    provider: str


class ProviderInfo(BaseModel):
    name: str
    type: str
    models: List[str]
    available: bool


class ProvidersResponse(BaseModel):
    providers: List[ProviderInfo]
    default: str