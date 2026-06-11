from typing import Optional
from app.schemas.ai import (
    ChatRequest, ChatResponse,
    CodeGenerateRequest, CodeGenerateResponse,
    CodeFixRequest, CodeFixResponse,
    CodeReviewRequest, CodeReviewResponse,
    TutorRequest, TutorResponse,
    ProvidersResponse, ProviderInfo,
)
from app.core.logger import logger


class AIService:
    def __init__(self):
        self.default_provider = "gemini"
        self._init_providers()

    def _init_providers(self):
        self.gemini_available = False
        self.groq_available = False
        self.deepseek_available = False
        self.openrouter_available = False
        self.ollama_available = False

        # Gemini
        try:
            from app.services.ai_providers.gemini_provider import gemini_provider
            self.gemini = gemini_provider
            self.gemini_available = self.gemini.model is not None
        except Exception as e:
            logger.warning(f"Gemini provider not available: {e}")
            self.gemini = None

        # Groq
        try:
            from app.services.ai_providers.groq_provider import groq_provider
            self.groq = groq_provider
            self.groq_available = self.groq.client is not None
        except Exception as e:
            logger.warning(f"Groq provider not available: {e}")
            self.groq = None

        # DeepSeek
        try:
            from app.services.ai_providers.deepseek_provider import deepseek_provider
            self.deepseek = deepseek_provider
            self.deepseek_available = deepseek_provider.api_key != ""
        except Exception as e:
            logger.warning(f"DeepSeek provider not available: {e}")
            self.deepseek = None

        # OpenRouter
        try:
            from app.services.ai_providers.openrouter_provider import openrouter_provider
            self.openrouter = openrouter_provider
            self.openrouter_available = openrouter_provider.api_key != ""
        except Exception as e:
            logger.warning(f"OpenRouter provider not available: {e}")
            self.openrouter = None

        # Ollama
        try:
            from app.config import settings
            if settings.OLLAMA_ENABLED:
                from app.services.ai_providers.ollama_provider import ollama_provider
                self.ollama = ollama_provider
                self.ollama_available = True
                logger.info("✅ Ollama provider initialized")
            else:
                logger.info("Ollama not enabled in settings")
        except Exception as e:
            logger.warning(f"Ollama provider not available: {e}")
            self.ollama = None

    def _get_provider(self, requested: Optional[str] = None):
        if requested == "gemini" and self.gemini_available:
            return "gemini", self.gemini
        if requested == "groq" and self.groq_available:
            return "groq", self.groq
        if requested == "deepseek" and self.deepseek_available:
            return "deepseek", self.deepseek
        if requested == "openrouter" and self.openrouter_available:
            return "openrouter", self.openrouter
        if requested == "ollama" and self.ollama_available:
            return "ollama", self.ollama

        if self.gemini_available:
            return "gemini", self.gemini
        if self.groq_available:
            return "groq", self.groq
        if self.deepseek_available:
            return "deepseek", self.deepseek
        if self.openrouter_available:
            return "openrouter", self.openrouter
        if self.ollama_available:
            return "ollama", self.ollama

        return None, None

    async def chat(self, request: ChatRequest) -> ChatResponse:
        provider_name, provider = self._get_provider(request.provider)

        if not provider:
            logger.warning("No AI provider available")
            return ChatResponse(
                response="No AI provider configured. Add API keys to .env file or start Ollama.",
                provider="none",
                model="none",
            )

        messages = [{"role": m.role, "content": m.content} for m in request.messages]

        if provider_name == "ollama":
            model_name = request.model or "llama3.2:3b"
        else:
            model_name = request.model or "default"

        logger.info(
            f"AI Chat: provider={provider_name}, model={model_name}, temperature={request.temperature or 0.7}"
        )

        try:
            response = await provider.chat(
                messages,
                model=model_name,
                temperature=request.temperature or 0.7,
            )
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            return ChatResponse(
                response=f"AI error: {str(e)}",
                provider=provider_name,
                model=model_name,
            )

        return ChatResponse(response=response, provider=provider_name, model=model_name)

    async def generate_code(self, request: CodeGenerateRequest) -> CodeGenerateResponse:
        provider_name, provider = self._get_provider(request.provider)

        if not provider:
            return CodeGenerateResponse(
                code="# No AI provider configured",
                language=request.language,
                provider="none",
            )

        if provider_name == "ollama":
            model_name = request.model or "llama3.2:3b"
        else:
            model_name = request.model or "default"

        prompt = f"Write {request.language} code:\n{request.prompt}"

        try:
            response = await provider.chat(
                [{"role": "user", "content": prompt}],
                model=model_name,
                temperature=request.temperature or 0.7,
            )
        except Exception as e:
            logger.error(f"Code generation error: {e}")
            return CodeGenerateResponse(
                code=f"# AI error: {str(e)}",
                language=request.language,
                provider="none",
            )

        return CodeGenerateResponse(
            code=response,
            language=request.language,
            provider=provider_name,
        )

    def get_providers(self) -> ProvidersResponse:
        providers = []

        providers.append(ProviderInfo(
            name="Gemini",
            type="cloud",
            models=["gemini-1.5-flash", "gemini-1.5-pro"],
            available=self.gemini_available,
        ))

        providers.append(ProviderInfo(
            name="Groq",
            type="cloud",
            models=["llama-3.3-70b", "mixtral-8x7b", "gemma2-9b"],
            available=self.groq_available,
        ))

        providers.append(ProviderInfo(
            name="DeepSeek",
            type="cloud",
            models=["deepseek-coder", "deepseek-chat"],
            available=self.deepseek_available,
        ))

        providers.append(ProviderInfo(
            name="OpenRouter",
            type="cloud",
            models=["gemma-2-9b", "llama-3.2-3b", "mistral-7b"],
            available=self.openrouter_available,
        ))

        providers.append(ProviderInfo(
            name="Ollama",
            type="local",
            models=["codellama", "llama3.2:3b", "deepseek-coder", "gemma2:latest"],
            available=self.ollama_available,
        ))

        return ProvidersResponse(providers=providers, default=self.default_provider)