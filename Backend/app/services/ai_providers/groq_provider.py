"""
Groq AI Provider
Free tier: 30 requests/minute, 14,400 requests/day
Get free key: https://console.groq.com/keys
"""

from typing import List, Dict, AsyncGenerator
from app.config import settings
from app.core.logger import logger

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("groq not installed. Run: pip install groq")


class GroqProvider:
    MODELS = {
        "llama": "llama-3.3-70b-versatile",
        "mixtral": "mixtral-8x7b-32768",
        "gemma": "gemma2-9b-it",
        "llama-small": "llama-3.1-8b-instant",
    }

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = None
        
        if self.api_key and GROQ_AVAILABLE:
            self.client = AsyncGroq(api_key=self.api_key)
            logger.info("✅ Groq AI provider initialized")
        elif not self.api_key:
            logger.warning("Groq API key not configured")
        else:
            logger.warning("groq package not installed")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama",
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        """Send chat messages to Groq."""
        if not self.client:
            return "Groq API is not configured. Get free key at https://console.groq.com"

        try:
            model_name = self.MODELS.get(model, self.MODELS["llama"])
            
            completion = await self.client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            logger.error("Groq API error: " + str(e))
            return "AI Error: " + str(e)

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama",
    ) -> AsyncGenerator[str, None]:
        """Stream chat responses from Groq."""
        if not self.client:
            yield "Groq API is not configured."
            return

        try:
            model_name = self.MODELS.get(model, self.MODELS["llama"])
            
            stream = await self.client.chat.completions.create(
                model=model_name,
                messages=messages,
                stream=True,
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error("Groq streaming error: " + str(e))
            yield "Error: " + str(e)

    async def code_review(self, code: str, language: str) -> Dict:
        """Review code and provide detailed feedback."""
        if not self.client:
            return {"error": "Groq API not configured"}

        prompt = (
            "Review this " + language + " code:\n\n"
            "```" + language + "\n" + code + "\n```\n\n"
            "Provide:\n"
            "1. Bugs found\n"
            "2. Performance improvements\n"
            "3. Security concerns\n"
            "4. Readability suggestions\n\n"
            "Be specific and show code examples."
        )

        response = await self.chat(
            messages=[{"role": "user", "content": prompt}],
            model="llama",
        )
        
        return {"review": response}

    async def explain_concept(self, concept: str, level: str = "intermediate") -> str:
        """Explain a programming concept."""
        if not self.client:
            return "Groq API is not configured."

        prompt = (
            'Explain "' + concept + '" at a ' + level + " level.\n\n"
            "Include:\n"
            "- Simple definition\n"
            "- Code example\n"
            "- When to use it\n"
            "- Common mistakes\n\n"
            "Be concise but thorough."
        )

        response = await self.chat(
            messages=[{"role": "user", "content": prompt}],
            model="llama",
        )
        
        return response

    async def generate_hints(self, problem: str, code: str) -> List[str]:
        """Generate progressive hints for coding problems."""
        if not self.client:
            return ["Groq API not configured"]

        prompt = (
            "A student is stuck on this problem:\n\n"
            "Problem: " + problem + "\n"
            "Their code:\n```\n" + code + "\n```\n\n"
            "Give 3 progressive hints (each more revealing):\n"
            "Hint 1: Gentle nudge\n"
            "Hint 2: More specific guidance\n"
            "Hint 3: Almost solution\n\n"
            "Format as JSON array."
        )

        response = await self.chat(
            messages=[{"role": "user", "content": prompt}],
            model="llama",
        )
        
        try:
            import json
            return json.loads(response)
        except Exception:
            return [response]


groq_provider = GroqProvider()