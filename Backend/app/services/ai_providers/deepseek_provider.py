"""
DeepSeek AI Provider - Best for coding tasks
Free tier available at: https://platform.deepseek.com
Model: deepseek-coder (specialized for programming)
"""

import httpx
import json
from typing import List, Dict, AsyncGenerator
from app.config import settings
from app.core.logger import logger


class DeepSeekProvider:
    BASE_URL = "https://api.deepseek.com/v1"
    
    MODELS = {
        "coder": "deepseek-coder",
        "chat": "deepseek-chat",
    }

    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        if self.api_key:
            logger.info("✅ DeepSeek AI provider initialized")
        else:
            logger.warning("DeepSeek API key not configured. Get key at https://platform.deepseek.com")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "coder",
        max_tokens: int = 4096,
        temperature: float = 0.0,
    ) -> str:
        """Send chat messages to DeepSeek."""
        if not self.api_key:
            return "DeepSeek API not configured."

        try:
            model_name = self.MODELS.get(model, self.MODELS["coder"])
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.BASE_URL + "/chat/completions",
                    headers={
                        "Authorization": "Bearer " + self.api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model_name,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                    },
                    timeout=60.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    return "API Error: " + str(response.status_code)
                    
        except Exception as e:
            logger.error("DeepSeek error: " + str(e))
            return "AI Error: " + str(e)

    async def generate_code(
        self,
        prompt: str,
        language: str = "python",
    ) -> str:
        """Generate code using DeepSeek Coder (best for programming)."""
        if not self.api_key:
            return "# DeepSeek API not configured"

        messages = [
            {
                "role": "system",
                "content": "You are an expert programmer. Write clean, well-documented " + language + " code."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        return await self.chat(messages, model="coder", temperature=0.0)

    async def debug_code(self, code: str, error: str, language: str) -> str:
        """Debug code and explain the fix."""
        if not self.api_key:
            return "DeepSeek API not configured."

        prompt = (
            "Debug this " + language + " code:\n\n"
            "```" + language + "\n" + code + "\n```\n\n"
            "Error:\n" + error + "\n\n"
            "Explain:\n"
            "1. What caused the error\n"
            "2. How to fix it\n"
            "3. Show the corrected code"
        )

        messages = [{"role": "user", "content": prompt}]
        return await self.chat(messages, model="coder")

    async def review_code(self, code: str, language: str) -> Dict:
        """Comprehensive code review."""
        if not self.api_key:
            return {"error": "DeepSeek API not configured"}

        prompt = (
            "Review this " + language + " code:\n\n"
            "```" + language + "\n" + code + "\n```\n\n"
            "Provide in JSON:\n"
            "{\n"
            '  "score": 1-10,\n'
            '  "bugs": ["list of bugs"],\n'
            '  "improvements": ["suggestions"],\n'
            '  "security": ["security issues"],\n'
            '  "performance": ["performance tips"]\n'
            "}"
        )

        messages = [{"role": "user", "content": prompt}]
        response = await self.chat(messages, model="coder")
        
        try:
            return json.loads(response)
        except:
            return {"review": response}


deepseek_provider = DeepSeekProvider()