from typing import List, Dict, AsyncGenerator, Optional
import json

from app.config import settings
from app.core.logger import logger

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not installed. Run: pip install google-generativeai")


class GeminiProvider:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or settings.GOOGLE_AI_API_KEY
        self.model = None
        self.pro_model = None
        self.model_name = None
        self.pro_model_name = None

        if not self.api_key:
            logger.warning("Gemini API key not configured")
            return

        if not GEMINI_AVAILABLE:
            logger.warning("google-generativeai package not installed")
            return

        try:
            genai.configure(api_key=self.api_key)
            available = self._get_available_models()

            self.model_name = self._pick_model(available, preferred=["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"])
            self.pro_model_name = self._pick_model(available, preferred=["gemini-2.0-pro", "gemini-1.5-pro", "gemini-pro"])

            if self.model_name:
                self.model = genai.GenerativeModel(self.model_name)
            if self.pro_model_name:
                self.pro_model = genai.GenerativeModel(self.pro_model_name)

            if self.model:
                logger.info(f"✅ Gemini initialized with model: {self.model_name}")
            else:
                logger.warning("⚠️ No compatible Gemini model found")

        except Exception as e:
            logger.error(f"Gemini initialization error: {e}")
            self.model = None
            self.pro_model = None

    def _get_available_models(self):
        models = []
        try:
            for m in genai.list_models():
                methods = getattr(m, "supported_generation_methods", []) or []
                name = getattr(m, "name", "")
                models.append({"name": name, "methods": methods})
        except Exception as e:
            logger.warning(f"Could not list Gemini models: {e}")
        return models

    def _pick_model(self, available, preferred):
        names = []
        for m in available:
            raw = m["name"]
            short = raw.split("/")[-1]
            methods = m["methods"]
            if "generateContent" in methods:
                names.append(short)

        for candidate in preferred:
            if candidate in names:
                return candidate

        return names[0] if names else None

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "flash",
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> str:
        if not self.model:
            return "Gemini API is not configured or no supported model is available."

        try:
            selected_model = self.pro_model if model == "pro" and self.pro_model else self.model
            prompt = self._format_messages(messages)

            response = await selected_model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                ),
            )

            return response.text if getattr(response, "text", None) else "No response generated"

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return f"AI Error: {str(e)}"

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "flash",
    ) -> AsyncGenerator[str, None]:
        if not self.model:
            yield "Gemini API is not configured or no supported model is available."
            return

        try:
            selected_model = self.pro_model if model == "pro" and self.pro_model else self.model
            prompt = self._format_messages(messages)

            response = await selected_model.generate_content_async(prompt, stream=True)

            async for chunk in response:
                if getattr(chunk, "text", None):
                    yield chunk.text

        except Exception as e:
            logger.error(f"Gemini streaming error: {str(e)}")
            yield f"Error: {str(e)}"

    async def analyze_code(self, code: str, language: str) -> Dict:
        if not self.model:
            return {"error": "Gemini API not configured or no supported model is available"}

        prompt = (
            f"Analyze this {language} code and provide feedback:\n\n"
            "1. Code Quality (1-10)\n"
            "2. Potential Bugs\n"
            "3. Performance Issues\n"
            "4. Best Practice Violations\n"
            "5. Suggested Improvements\n\n"
            f"Code:\n```{language}\n{code}\n```\n\n"
            "Respond in JSON format."
        )

        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text if getattr(response, "text", None) else "{}"
            return json.loads(text)
        except Exception as e:
            logger.error(f"Code analysis error: {e}")
            return {"analysis": "Could not analyze code"}

    async def tutor_response(
        self,
        question: str,
        topic: str,
        difficulty: str = "beginner",
    ) -> str:
        if not self.model:
            return "Gemini API is not configured or no supported model is available."

        prompt = (
            "You are a coding tutor for CodeMaster.\n"
            f"Topic: {topic}\n"
            f"Difficulty: {difficulty}\n\n"
            f"Student Question: {question}\n\n"
            "Provide a helpful, educational response that:\n"
            "1. Explains the concept clearly\n"
            "2. Shows code examples\n"
            "3. Mentions common pitfalls\n"
            "4. Suggests next steps\n\n"
            "Keep it friendly and encouraging!"
        )

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text if getattr(response, "text", None) else "No response"
        except Exception as e:
            logger.error(f"Tutor response error: {e}")
            return f"AI Error: {str(e)}"

    async def moderate_content(self, text: str) -> Dict:
        if not self.model:
            return {"is_safe": True, "score": 0}

        prompt = (
            "Rate the following content for inappropriate material (0-100):\n\n"
            f"Content: {text}\n\n"
            'Return JSON: {"score": number, "is_safe": boolean, "reason": string}'
        )

        try:
            response = await self.model.generate_content_async(prompt)
            raw = response.text if getattr(response, "text", None) else "{}"
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Moderation error: {e}")
            return {"is_safe": True, "score": 0, "reason": "Unable to analyze"}

    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        formatted = []
        for msg in messages:
            role = "User" if msg.get("role") == "user" else "Assistant"
            formatted.append(f"{role}: {msg.get('content', '')}")
        formatted.append("Assistant: ")
        return "\n".join(formatted)


gemini_provider = GeminiProvider()