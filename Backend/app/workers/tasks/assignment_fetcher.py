# app/workers/tasks/assignment_fetcher.py

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
from app.models.assignment import Assignment

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


class InboundAssignment(BaseModel):
    title_raw: str = Field(default="Untitled Project", alias="title")
    description_raw: str = Field(default="", alias="description")
    source_raw: str = Field(default="github", alias="source")
    tags_raw: List[str] = Field(default_factory=list, alias="tags")
    priority_raw: str = Field(default="medium", alias="priority")

    title: str = ""
    description: str = ""
    source: str = ""
    tags: List[str] = []
    priority: str = ""

    def model_post_init(self, _context: Any) -> None:
        self.title = _sanitize_text(self.title_raw, max_length=300)
        self.description = _sanitize_text(self.description_raw, max_length=2000)
        self.source = self.source_raw
        self.tags = [t.lower().strip() for t in self.tags_raw if t and t.strip()][:10]
        self.priority = self.priority_raw.lower().strip()


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
# SOURCE 1: GITHUB — Trending repositories as project ideas
# =============================================================================
GITHUB_PROJECT_QUERIES = [
    "hackathon+project+topic:hackathon",
    "awesome+project+ideas",
    "build+your+own+x",
    "project+based+learning",
    "fullstack+project+starter",
    "ai+project+template",
    "machine+learning+project",
    "api+project+example",
    "real+world+project",
    "portfolio+project+idea",
]


def _detect_priority(stars: int, description: str) -> str:
    """Auto-detect priority based on stars and description complexity."""
    if stars > 5000:
        return "high"
    if stars > 1000:
        return "medium"
    if "beginner" in description.lower() or "easy" in description.lower():
        return "low"
    return "medium"


def _extract_tags(name: str, description: str, topics: List[str]) -> List[str]:
    """Extract meaningful tags from repo data."""
    all_text = f"{name} {description} {' '.join(topics)}".lower()
    tags = set()

    tech_keywords = [
        "react", "vue", "angular", "nextjs", "node", "python", "django", "flask",
        "fastapi", "typescript", "javascript", "go", "rust", "java", "kotlin",
        "swift", "flutter", "docker", "kubernetes", "aws", "firebase", "mongodb",
        "postgresql", "redis", "graphql", "rest", "websocket", "ai", "ml",
        "machine-learning", "nlp", "computer-vision", "blockchain", "web3",
    ]

    for kw in tech_keywords:
        if kw in all_text:
            tags.add(kw)

    return list(tags)[:8]


async def fetch_github_projects() -> List[Dict[str, Any]]:
    """Fetch real project ideas from GitHub trending repos."""
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
                            "per_page": 10,
                        },
                        headers={"Accept": "application/vnd.github.v3+json"},
                    )
                except ApiFetchError as exc:
                    logger.warning("GitHub query '%s': %s", query, exc)
                    return

                for repo in data.get("items", []):
                    name = repo.get("full_name", "")
                    description = repo.get("description") or ""
                    stars = repo.get("stargazers_count", 0)
                    topics = repo.get("topics", [])
                    language = repo.get("language", "")

                    if not description or stars < 20:
                        continue

                    tags = _extract_tags(name, description, topics)
                    if language:
                        tags.append(language.lower())

                    priority = _detect_priority(stars, description)

                    # Build a project-idea style description
                    project_description = (
                        f"🌟 Build this project: {description}\n\n"
                        f"📊 GitHub Stars: {stars:,}\n"
                        f"🔗 Repository: https://github.com/{name}\n"
                        f"🏷️ Topics: {', '.join(topics[:5]) if topics else 'N/A'}\n\n"
                        f"💡 Use this as inspiration to build your own version!"
                    )

                    try:
                        assignment = InboundAssignment(
                            title=f"Build: {name}",
                            description=project_description,
                            source="github",
                            tags=list(set(tags)),
                            priority=priority,
                        )
                        validated.append({
                            "title": assignment.title,
                            "description": assignment.description,
                            "source": assignment.source,
                            "tags": assignment.tags,
                            "priority": assignment.priority,
                            "status": "pending",
                            "xp_reward": min(500, stars // 10),
                            "user_id": 1,  # System user
                            "created_at": datetime.now(timezone.utc),
                        })
                    except ValidationError:
                        continue

        await asyncio.gather(*[process_query(q) for q in GITHUB_PROJECT_QUERIES])

    logger.info("GitHub: %d project ideas fetched", len(validated))
    return validated


# =============================================================================
# SOURCE 2: PUBLIC APIs — Project ideas from real-world data
# =============================================================================
async def fetch_real_world_api_ideas() -> List[Dict[str, Any]]:
    """Generate project ideas based on available public APIs."""
    ideas = [
        {
            "title": "COVID-19 Data Dashboard",
            "description": "Build an interactive dashboard using the disease.sh API to display real-time COVID-19 statistics worldwide. Include charts, maps, and country comparisons.",
            "source": "api_idea",
            "tags": ["react", "chart.js", "api", "dashboard", "data-visualization"],
            "priority": "medium",
        },
        {
            "title": "Weather Forecast App",
            "description": "Create a weather app using OpenWeatherMap API. Show 7-day forecasts, weather maps, and location-based alerts. Add features like saving favorite cities.",
            "source": "api_idea",
            "tags": ["react", "api", "weather", "mobile-first", "geolocation"],
            "priority": "low",
        },
        {
            "title": "Space Mission Tracker",
            "description": "Build an app using the SpaceX API to track launches, rockets, and missions. Include countdown timers, launch notifications, and mission details.",
            "source": "api_idea",
            "tags": ["react", "api", "space", "real-time", "notifications"],
            "priority": "medium",
        },
        {
            "title": "Pokémon Team Builder",
            "description": "Create a team builder using PokéAPI. Let users search Pokémon, view stats, build teams of 6, and check type advantages/weaknesses.",
            "source": "api_idea",
            "tags": ["react", "api", "game", "search", "interactive"],
            "priority": "low",
        },
        {
            "title": "Cryptocurrency Portfolio Tracker",
            "description": "Build a crypto portfolio tracker using CoinGecko API. Track prices in real-time, calculate profit/loss, and show portfolio distribution charts.",
            "source": "api_idea",
            "tags": ["react", "api", "crypto", "real-time", "charts"],
            "priority": "high",
        },
        {
            "title": "Recipe Finder & Meal Planner",
            "description": "Create a recipe app using Spoonacular API. Search recipes by ingredients, filter by diet, plan weekly meals, and generate shopping lists.",
            "source": "api_idea",
            "tags": ["react", "api", "search", "planning", "mobile"],
            "priority": "medium",
        },
        {
            "title": "Movie & TV Show Discovery",
            "description": "Build a discovery app using TMDB API. Browse trending movies/TV, search by genre, create watchlists, and get AI-powered recommendations.",
            "source": "api_idea",
            "tags": ["react", "api", "movies", "search", "recommendation"],
            "priority": "medium",
        },
        {
            "title": "GitHub Profile Analyzer",
            "description": "Create a tool using GitHub API to analyze developer profiles. Show contribution graphs, language stats, top repos, and coding activity insights.",
            "source": "api_idea",
            "tags": ["react", "api", "github", "analytics", "charts"],
            "priority": "low",
        },
    ]

    result = []
    for idea in ideas:
        result.append({
            "title": idea["title"],
            "description": idea["description"],
            "source": idea["source"],
            "tags": idea["tags"],
            "priority": idea["priority"],
            "status": "pending",
            "xp_reward": 250,
            "user_id": 1,
            "created_at": datetime.now(timezone.utc),
        })

    logger.info("API Ideas: %d project ideas generated", len(result))
    return result


# =============================================================================
# DATABASE PERSISTENCE
# =============================================================================
async def save_assignments_to_db(assignments: List[Dict[str, Any]]) -> int:
    """Save assignments with deduplication by title."""
    if not assignments:
        return 0

    saved = 0
    async with AsyncSessionLocal() as session:
        try:
            async with session.begin():
                for assignment_data in assignments:
                    # Check if already exists by title
                    result = await session.execute(
                        select(Assignment).where(
                            Assignment.title == assignment_data["title"],
                            Assignment.source == assignment_data["source"],
                        )
                    )
                    existing = result.scalar_one_or_none()

                    if not existing:
                        session.add(Assignment(**assignment_data))
                        saved += 1

            logger.info("Saved %d new assignments to database", saved)
        except (IntegrityError, DBAPIError, SQLAlchemyError) as exc:
            logger.error("Database transaction failed: %s", exc)
            await session.rollback()
            raise

    return saved


# =============================================================================
# MAIN ORCHESTRATOR
# =============================================================================
async def fetch_all_assignments() -> int:
    """Fetch real project ideas from all sources."""
    logger.info("=" * 60)
    logger.info("🔍 Fetching Real Project Ideas from Internet...")
    logger.info("=" * 60)

    all_assignments: List[Dict[str, Any]] = []

    # Source 1: GitHub trending repos
    try:
        github_projects = await fetch_github_projects()
        all_assignments.extend(github_projects)
    except Exception as exc:
        logger.exception("GitHub fetch failed: %s", exc)

    # Source 2: Public API project ideas
    try:
        api_ideas = await fetch_real_world_api_ideas()
        all_assignments.extend(api_ideas)
    except Exception as exc:
        logger.exception("API ideas failed: %s", exc)

    if all_assignments:
        saved = await save_assignments_to_db(all_assignments)
        logger.info("=" * 60)
        logger.info("✅ Assignments Fetch Complete: %d new projects saved", saved)
        logger.info("=" * 60)
        return saved

    logger.info("No new assignments found.")
    return 0