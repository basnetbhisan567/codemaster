"""
Ollama Local AI Provider
Runs AI models locally on your computer - 100% private
Download: https://ollama.com
Models: codellama, llama3, mistral, gemma2, deepseek-coder, llama3.2:3b
"""

import httpx
import json
from typing import List, Dict, AsyncGenerator
from app.config import settings
from app.core.logger import logger


class OllamaProvider:
    BASE_URL = settings.OLLAMA_BASE_URL or "http://localhost:11434"
    DEFAULT_MODEL = "llama3.2:3b"

    def __init__(self):
        if settings.OLLAMA_ENABLED:
            logger.info(f"✅ Ollama local AI provider initialized at {self.BASE_URL}")
        else:
            logger.info("Ollama not enabled. Set OLLAMA_ENABLED=true in .env")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = DEFAULT_MODEL,
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

                error_body = response.text[:200] if response.text else "no body"
                logger.error(
                    f"Ollama error {response.status_code} for model '{model}': {error_body}"
                )
                raise ValueError(
                    f"Ollama error: {response.status_code} - Model '{model}' may not be installed "
                    f"or may not have enough memory. Run: ollama pull {model}"
                )

        except httpx.RequestError as e:
            logger.error(f"Ollama not reachable: {e}")
            raise ValueError("Ollama not running. Start with: ollama serve")
        except Exception as e:
            logger.error(f"Ollama chat error: {e}")
            raise

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = DEFAULT_MODEL,
        temperature: float = 0.7,
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
                        "options": {"temperature": temperature},
                    },
                    timeout=120.0,
                ) as response:
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                if data.get("message") and data["message"].get("content"):
                                    yield data["message"]["content"]
                            except json.JSONDecodeError:
                                continue

        except Exception as e:
            logger.error(f"Ollama stream error: {e}")
            yield f"Ollama error: {str(e)}"

    async def list_models(self) -> List[str]:
        """List installed Ollama models."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.BASE_URL + "/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    return [m["name"] for m in data.get("models", [])]
                return []
        except Exception as e:
            logger.error(f"Failed to list Ollama models: {e}")
            return []

    async def generate_code(self, prompt: str, language: str = "python") -> str:
        """Generate code using local model."""
        messages = [
            {"role": "system", "content": f"You are a {language} expert. Write clean code."},
            {"role": "user", "content": prompt},
        ]
        return await self.chat(messages, model="codellama")


ollama_provider = OllamaProvider()