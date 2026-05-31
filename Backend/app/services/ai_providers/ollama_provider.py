"""
Ollama Local AI Provider
Runs AI models locally on your computer - 100% private
Download: https://ollama.com
Models: codellama, llama3, mistral, gemma2, deepseek-coder
"""

import httpx
import json
from typing import List, Dict, AsyncGenerator
from app.config import settings
from app.core.logger import logger


class OllamaProvider:
    BASE_URL = settings.OLLAMA_BASE_URL  # http://localhost:11434

    def __init__(self):
        if settings.OLLAMA_ENABLED:
            logger.info("✅ Ollama local AI provider initialized at " + self.BASE_URL)
        else:
            logger.info("Ollama not enabled. Set OLLAMA_ENABLED=true in .env")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "codellama",
        temperature: float = 0.7,
    ) -> str:
        """Send chat to local Ollama model."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.BASE_URL + "/api/chat",
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": temperature},
                    },
                    timeout=120.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["message"]["content"]
                else:
                    return "Ollama error: " + str(response.status_code)
                    
        except Exception as e:
            return "Ollama not running. Start with: ollama serve"

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "codellama",
    ) -> AsyncGenerator[str, None]:
        """Stream chat from Ollama."""
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    self.BASE_URL + "/api/chat",
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": True,
                    },
                    timeout=120.0,
                ) as response:
                    async for line in response.aiter_lines():
                        if line:
                            data = json.loads(line)
                            if data["message"].get("content"):
                                yield data["message"]["content"]
                                
        except Exception as e:
            yield "Ollama error: " + str(e)

    async def list_models(self) -> List[str]:
        """List installed Ollama models."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.BASE_URL + "/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    return [m["name"] for m in data["models"]]
                return []
        except:
            return []

    async def generate_code(self, prompt: str, language: str = "python") -> str:
        """Generate code using local model."""
        messages = [
            {"role": "system", "content": "You are a " + language + " expert. Write clean code."},
            {"role": "user", "content": prompt},
        ]
        return await self.chat(messages, model="codellama")


ollama_provider = OllamaProvider()