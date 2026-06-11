import asyncio
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel, Field, ValidationError, field_validator
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError, IntegrityError, SQLAlchemyError

from app.core.database import AsyncSessionLocal
from app.core.logger import logger
from app.models.content import TechTool

DEFAULT_HTTP_TIMEOUT = 30.0
MAX_CONCURRENT_REQUESTS = 5


def _sanitize_text(raw: Optional[str], max_length: int = 500) -> str:
    if not raw:
        return ""
    cleaned = re.sub(r"\s+", " ", raw.strip())
    return cleaned[:max_length] if len(cleaned) > max_length else cleaned


def _is_valid_url(url: Any) -> bool:
    if not isinstance(url, str):
        return False
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


class ApiFetchError(Exception):
    pass


class InboundTool(BaseModel):
    name_raw: str = Field(default="Unknown Tool", alias="name")
    description_raw: str = Field(default="", alias="description")
    url_raw: str = Field(default="", alias="url")
    category_raw: str = Field(default="other", alias="category")
    logo_url_raw: str = Field(default="", alias="logo_url")
    github_url_raw: str = Field(default="", alias="github_url")
    pricing_raw: str = Field(default="free", alias="pricing")
    stars_raw: int = Field(default=0, alias="stars")
    tags_raw: List[str] = Field(default_factory=list, alias="tags")

    name: str = ""
    description: str = ""
    url: str = ""
    category: str = ""
    logo_url: str = ""
    github_url: str = ""
    pricing: str = ""
    stars: int = 0
    tags: List[str] = []

    @field_validator("url_raw")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if v and not _is_valid_url(v):
            return ""
        return v

    def model_post_init(self, _context: Any) -> None:
        self.name = _sanitize_text(self.name_raw, max_length=300)
        self.description = _sanitize_text(self.description_raw, max_length=1000)
        self.url = self.url_raw
        self.category = self.category_raw.lower().strip()
        self.logo_url = self.logo_url_raw
        self.github_url = self.github_url_raw
        self.pricing = self.pricing_raw.lower().strip()
        self.stars = int(self.stars_raw)
        self.tags = [t.lower().strip() for t in self.tags_raw if t and t.strip()]


async def _safe_fetch(
    client: httpx.AsyncClient,
    url: str,
    params: Dict[str, Any] = None,
    headers: Dict[str, str] = None,
) -> Dict[str, Any]:
    try:
        resp = await client.get(
            url, params=params or {}, headers=headers, timeout=DEFAULT_HTTP_TIMEOUT
        )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        raise ApiFetchError(f"HTTP {exc.response.status_code} from {url}") from exc
    except (httpx.RequestError, httpx.TimeoutException) as exc:
        raise ApiFetchError(f"Request error for {url}: {exc}") from exc


# =============================================================================
# CATEGORY DETECTION
# =============================================================================
CATEGORY_KEYWORDS = {
    "code": [
        "code", "programming", "developer", "copilot", "editor", "ide",
        "compiler", "debug", "sdk", "api", "cli", "library", "framework",
        "coding", "autocomplete", "refactor", "linter", "formatter",
        "code generation", "code review", "pair programming",
    ],
    "chat": [
        "chat", "llm", "gpt", "language model", "conversation", "assistant",
        "claude", "chatbot", "nlp", "prompt", "rag", "agent",
        "natural language", "dialog", "messaging", "copilot chat",
    ],
    "image": [
        "image", "photo", "art", "design", "generation", "stable diffusion",
        "midjourney", "dalle", "visual", "graphic", "draw", "painting",
        "text-to-image", "img", "illustration", "canvas",
    ],
    "audio": [
        "audio", "music", "voice", "speech", "sound", "tts",
        "synthesis", "recording", "podcast", "text-to-speech",
        "transcription", "audiobook", "synthesizer",
    ],
    "productivity": [
        "productivity", "notes", "calendar", "writing", "docs",
        "automation", "workflow", "task", "project", "team",
        "collaboration", "notion", "gtd", "todo", "kanban",
        "documentation", "wiki", "knowledge", "note-taking",
    ],
}

PROGRAMMING_LANGUAGES = {
    "python", "javascript", "typescript", "java", "go", "rust", "c++", "c#",
    "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "lua", "perl",
    "haskell", "elixir", "clojure", "erlang", "f#", "ocaml", "zig", "nim",
    "c", "objective-c", "assembly", "shell", "powershell", "sql", "html",
    "css", "vue", "react", "angular", "svelte", "nextjs", "nuxt",
    "language", "lang", "js", "ts",
}


def _detect_category(text: str, topics: List[str] = None) -> str:
    combined = (text + " " + " ".join(topics or [])).lower()
    for lang in PROGRAMMING_LANGUAGES:
        combined = combined.replace(f" {lang} ", " ")
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in combined)
        if score > 0:
            scores[cat] = score
    if scores:
        return max(scores, key=scores.get)
    return "other"


def _detect_pricing(text: str) -> str:
    text_lower = text.lower()
    if any(kw in text_lower for kw in ["free", "open source", "open-source", "mit license", "apache license", "gpl"]):
        return "free"
    if any(kw in text_lower for kw in ["paid", "subscription", "enterprise", "pricing", "pro plan"]):
        return "paid"
    return "freemium"


# =============================================================================
# SOURCE 1: GITHUB - Search specific known AI repos
# =============================================================================
KNOWN_AI_REPOS = [
    "Codium-ai/pr-agent",
    "TabbyML/tabby",
    "openai/whisper",
    "openai/openai-cookbook",
    "ggerganov/llama.cpp",
    "lm-sys/FastChat",
    "microsoft/autogen",
    "langchain-ai/langchain",
    "run-llama/llama_index",
    "sunner/ChatALL",
    "AUTOMATIC1111/stable-diffusion-webui",
    "comfyanonymous/ComfyUI",
    "lencx/ChatGPT",
    "binary-husky/gpt_academic",
    "FlowiseAI/Flowise",
    "nocodb/nocodb",
    "appsmithorg/appsmith",
    "n8n-io/n8n",
    "activepieces/activepieces",
    "louislam/dockge",
    "QuivrHQ/quivr",
    "open-webui/open-webui",
    "janhq/jan",
    "mckaywrigley/chatbot-ui",
    "khoj-ai/khoj",
    "getcursor/cursor",
    "continuedev/continue",
    "microsoft/vscode",
    "zed-industries/zed",
    "lapce/lapce",
    "invoke-ai/InvokeAI",
    "TencentARC/GFPGAN",
    "upscayl/upscayl",
    "abi/screenshot-to-code",
    "RVC-Project/Retrieval-based-Voice-Conversion-WebUI",
    "myshell-ai/OpenVoice",
    "coqui-ai/TTS",
    "suno-ai/bark",
    "CorentinJ/Real-Time-Voice-Cloning",
    "getomni-ai/zerox",
    "CopilotKit/CopilotKit",
    "activepieces/activepieces",
    "cline/cline",
    "Raphire/Win11Debloat",
    "dockur/windows",
    "ChrisTitusTech/winutil",
    "microsoft/PowerToys",
    "2noise/ChatTTS",
    "Stirling-Tools/Stirling-PDF",
    "HeyPuter/puter",
    "ItzCrazyKns/Perplexica",
    "danielmiessler/fabric",
    "Dokploy/dokploy",
    "getludic/ludic",
    "plandex-ai/plandex",
    "OpenInterpreter/open-interpreter",
    "microsoft/JARVIS",
    "LAION-AI/Open-Assistant",
    "gpt-engineer-org/gpt-engineer",
    "AntonOsika/gpt-engineer",
    "geekan/MetaGPT",
    "Significant-Gravitas/AutoGPT",
    "yoheinakajima/babyagi",
    "langgenius/dify",
    "THUDM/ChatGLM-6B",
    "tloen/alpaca-lora",
    "Stability-AI/stablediffusion",
    "CompVis/stable-diffusion",
    "openai/DALL-E",
    "microsoft/visual-chatgpt",
    "nutlope/roomGPT",
    "chathub-dev/chathub",
    "getlunzi/lunzi",
    "reworkd/AgentGPT",
    "imartinez/privateGPT",
    "SillyTavern/SillyTavern",
    "openai/chatgpt-retrieval-plugin",
    "huggingface/chat-ui",
    "huggingface/text-generation-inference",
    "vllm-project/vllm",
    "NVIDIA/TensorRT-LLM",
    "microsoft/DeepSpeed",
    "bigscience-workshop/petals",
    "togethercomputer/OpenChatKit",
    "Stability-AI/StableLM",
    "nomic-ai/gpt4all",
    "facebookresearch/llama",
    "meta-llama/llama",
    "microsoft/TypeChat",
    "BerriAI/litellm",
    "Portkey-AI/gateway",
    "superagent-ai/superagent",
    "steven-tey/novel",
    "ricky0123/vad",
    "babysor/MockingBird",
    "neonbjb/tortoise-tts",
    "jaywalnut310/vits",
    "svc-develop-team/so-vits-svc",
    "RVC-Boss/GPT-SoVITS",
    "fishaudio/Bert-VITS2",
    "openai/shap-e",
    "NVlabs/instant-ngp",
    "ashawkey/stable-dreamfusion",
    "threestudio-project/threestudio",
    "graphdeco-inria/gaussian-splatting",
    "nlohmann/json",
    "ocornut/imgui",
    "SerenityOS/serenity",
    "TheAlgorithms/Python",
]


async def fetch_known_github_repos() -> List[Dict[str, Any]]:
    validated: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(headers={"User-Agent": "CodeMaster/1.0"}) as client:
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

        async def process_repo(full_name: str) -> None:
            async with semaphore:
                try:
                    data = await _safe_fetch(
                        client,
                        f"https://api.github.com/repos/{full_name}",
                        headers={"Accept": "application/vnd.github.v3+json"},
                    )
                except ApiFetchError:
                    return

                name = data.get("full_name", "")
                description = data.get("description") or ""
                html_url = data.get("html_url", "")
                github_url = html_url
                stars = data.get("stargazers_count", 0)
                topics = data.get("topics", [])
                homepage = data.get("homepage", "")
                owner = data.get("owner", {})
                owner_avatar = owner.get("avatar_url", "")

                if not html_url or stars < 5:
                    return

                combined_text = f"{name} {description} {' '.join(topics)}"
                category = _detect_category(combined_text, topics)
                pricing = _detect_pricing(description)

                tool_url = homepage if homepage and _is_valid_url(homepage) else html_url
                logo_url = owner_avatar if owner_avatar else ""

                try:
                    tool = InboundTool(
                        name=name,
                        description=description or f"Open source AI tool: {name}",
                        url=tool_url,
                        category=category,
                        logo_url=logo_url,
                        github_url=github_url,
                        pricing=pricing,
                        stars=stars,
                        tags=topics[:8],
                    )
                    validated.append({
                        "name": tool.name,
                        "description": tool.description,
                        "url": tool.url,
                        "category": tool.category,
                        "logo_url": tool.logo_url,
                        "github_url": tool.github_url,
                        "pricing": tool.pricing,
                        "stars": tool.stars,
                        "tags": tool.tags,
                        "is_open_source": True,
                        "is_active": True,
                        "fetched_at": datetime.now(timezone.utc),
                    })
                except ValidationError:
                    pass

        # Process in chunks to avoid rate limiting
        chunk_size = 10
        for i in range(0, len(KNOWN_AI_REPOS), chunk_size):
            chunk = KNOWN_AI_REPOS[i:i + chunk_size]
            await asyncio.gather(*[process_repo(repo) for repo in chunk])
            if i + chunk_size < len(KNOWN_AI_REPOS):
                await asyncio.sleep(1)  # Rate limit pause

    logger.info("GitHub known repos: %d tools fetched", len(validated))
    return validated


# =============================================================================
# SOURCE 2: GITHUB SEARCH (broader search)
# =============================================================================
AI_SEARCH_QUERIES = [
    "ai+chat+bot+stars:>100",
    "ai+coding+assistant+stars:>50",
    "llm+framework+stars:>100",
    "image+generation+ai+stars:>50",
    "text+to+speech+ai+stars:>50",
    "voice+cloning+ai+stars:>30",
    "ai+productivity+stars:>50",
    "stable+diffusion+ui+stars:>50",
]


async def fetch_github_search() -> List[Dict[str, Any]]:
    validated: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(headers={"User-Agent": "CodeMaster/1.0"}) as client:
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

        async def process_query(query: str) -> None:
            async with semaphore:
                try:
                    data = await _safe_fetch(
                        client,
                        "https://api.github.com/search/repositories",
                        params={
                            "q": query,
                            "sort": "stars",
                            "order": "desc",
                            "per_page": 20,
                        },
                        headers={"Accept": "application/vnd.github.v3+json"},
                    )
                except ApiFetchError as exc:
                    logger.warning("GitHub search '%s': %s", query, exc)
                    return

                for repo in data.get("items", []):
                    full_name = repo.get("full_name", "")
                    description = repo.get("description") or ""
                    html_url = repo.get("html_url", "")
                    stars = repo.get("stargazers_count", 0)
                    topics = repo.get("topics", [])
                    homepage = repo.get("homepage", "")
                    owner = repo.get("owner", {})
                    owner_avatar = owner.get("avatar_url", "")

                    if not html_url or stars < 30:
                        continue

                    combined_text = f"{full_name} {description} {' '.join(topics)}"
                    category = _detect_category(combined_text, topics)
                    pricing = _detect_pricing(description)

                    tool_url = homepage if homepage and _is_valid_url(homepage) else html_url
                    logo_url = owner_avatar if owner_avatar else ""

                    try:
                        tool = InboundTool(
                            name=full_name,
                            description=description or f"AI tool: {full_name}",
                            url=tool_url,
                            category=category,
                            logo_url=logo_url,
                            github_url=html_url,
                            pricing=pricing,
                            stars=stars,
                            tags=topics[:8],
                        )
                        validated.append({
                            "name": tool.name,
                            "description": tool.description,
                            "url": tool.url,
                            "category": tool.category,
                            "logo_url": tool.logo_url,
                            "github_url": tool.github_url,
                            "pricing": tool.pricing,
                            "stars": tool.stars,
                            "tags": tool.tags,
                            "is_open_source": True,
                            "is_active": True,
                            "fetched_at": datetime.now(timezone.utc),
                        })
                    except ValidationError:
                        continue

        await asyncio.gather(*[process_query(q) for q in AI_SEARCH_QUERIES])

    logger.info("GitHub search: %d tools fetched", len(validated))
    return validated


# =============================================================================
# DATABASE PERSISTENCE
# =============================================================================
async def save_tools_to_db(tools: List[Dict[str, Any]]) -> int:
    if not tools:
        return 0

    seen_urls = set()
    unique_tools = []
    for tool in tools:
        url = tool.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_tools.append(tool)

    saved = 0
    async with AsyncSessionLocal() as session:
        try:
            async with session.begin():
                for tool_data in unique_tools:
                    result = await session.execute(
                        select(TechTool).where(TechTool.url == tool_data["url"])
                    )
                    existing_tool = result.scalar_one_or_none()

                    if existing_tool:
                        for key, value in tool_data.items():
                            if hasattr(existing_tool, key) and key != "id":
                                setattr(existing_tool, key, value)
                        existing_tool.fetched_at = datetime.now(timezone.utc)
                    else:
                        session.add(TechTool(**tool_data))
                    saved += 1

            logger.info("Saved %d tools to database", saved)
        except (IntegrityError, DBAPIError, SQLAlchemyError) as exc:
            logger.error("Database transaction failed: %s", exc)
            await session.rollback()
            raise

    return saved


# =============================================================================
# MAIN
# =============================================================================
async def fetch_all_tools() -> int:
    logger.info("=" * 60)
    logger.info("Fetching AI Tools from GitHub...")
    logger.info("=" * 60)

    all_tools: List[Dict[str, Any]] = []

    # First: fetch known repos (fast, targeted)
    try:
        known = await fetch_known_github_repos()
        all_tools.extend(known)
    except Exception as exc:
        logger.exception("Known repos fetch failed: %s", exc)

    # Second: broad search
    try:
        search_results = await fetch_github_search()
        all_tools.extend(search_results)
    except Exception as exc:
        logger.exception("GitHub search failed: %s", exc)

    if all_tools:
        saved = await save_tools_to_db(all_tools)
        logger.info("=" * 60)
        logger.info("Tools Fetch Complete: %d saved", saved)
        logger.info("=" * 60)
        return saved

    logger.info("No tools fetched.")
    return 0

