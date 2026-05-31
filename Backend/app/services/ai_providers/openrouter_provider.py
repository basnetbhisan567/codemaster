"""
OpenRouter AI Provider
Access to 200+ models including FREE ones
Get free key: https://openrouter.ai/keys
"""

import httpx
import json
from typing import List, Dict, AsyncGenerator
from app.config import settings
from app.core.logger import logger


class OpenRouterProvider:
    # Currently working FREE models on OpenRouter
    FREE_MODELS = {
        "gemma": "google/gemma-2-9b-it:free",
        "llama": "meta-llama/llama-3.2-3b-instruct:free",
        "mistral": "mistralai/mistral-7b-instruct:free",
        "phi": "microsoft/phi-3-mini-128k-instruct:free",
    }

    BASE_URL = "https://openrouter.ai/api/v1"

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        if self.api_key:
            logger.info("✅ OpenRouter AI provider initialized")
        else:
            logger.warning("OpenRouter API key not configured")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gemma",
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> str:
        if not self.api_key:
            return "OpenRouter API key not configured"

        model_name = self.FREE_MODELS.get(model, self.FREE_MODELS["gemma"])

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.BASE_URL + "/chat/completions",
                    headers={
                        "Authorization": "Bearer " + self.api_key,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:5000",
                        "X-Title": "CodeMaster",
                    },
                    json={
                        "model": model_name,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                    },
                    timeout=30.0,
                )

                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                elif response.status_code == 402:
                    return "OpenRouter: This model requires payment. Try model='llama' for free."
                elif response.status_code == 404:
                    return "OpenRouter: Model not found. Try model='llama' or model='mistral'."
                else:
                    return f"OpenRouter Error {response.status_code}: {response.text[:200]}"

        except Exception as e:
            logger.error("OpenRouter error: " + str(e))
            return "OpenRouter connection failed"

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gemma",
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            yield "OpenRouter API key not configured"
            return

        model_name = self.FREE_MODELS.get(model, self.FREE_MODELS["gemma"])

        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    self.BASE_URL + "/chat/completions",
                    headers={
                        "Authorization": "Bearer " + self.api_key,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:5000",
                        "X-Title": "CodeMaster",
                    },
                    json={
                        "model": model_name,
                        "messages": messages,
                        "stream": True,
                    },
                    timeout=60.0,
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: ") and line != "data: [DONE]":
                            data = json.loads(line[6:])
                            content = data["choices"][0]["delta"].get("content", "")
                            if content:
                                yield content

        except Exception as e:
            yield "Error: " + str(e)


openrouter_provider = OpenRouterProvider()