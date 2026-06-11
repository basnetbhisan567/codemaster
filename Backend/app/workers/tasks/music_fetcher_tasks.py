import asyncio
import hashlib
import random
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator
from sqlalchemy import delete
from sqlalchemy.exc import DBAPIError, IntegrityError, SQLAlchemyError

from app.core.database import AsyncSessionLocal
from app.core.logger import logger
from app.models.music import MusicPlaylist

DEFAULT_HTTP_TIMEOUT = 30.0
MAX_TITLE_LENGTH = 200
MAX_CONCURRENT_REQUESTS = 5

# ============================================
# GENRE DEFINITIONS — Real search terms for APIs
# ============================================
GENRE_PLAYLISTS = {
    "space_cosmic": {
        "name": "Space & Cosmic Ambient",
        "category": "ambient",
        "icon": "🌌",
        "description": "Deep space drift with alpha/beta waves for a massive sonic bubble",
        "radio_tags": ["ambient", "space", "drone", "atmospheric"],
        "freesound_tags": ["space-ambient", "deep-drone", "alpha-waves"],
        "ia_queries": ["space+ambient+alpha+waves", "deep+space+drift+ambient"],
    },
    "rain_thunder": {
        "name": "Rain & Thunder Focus",
        "category": "nature",
        "icon": "🌧️",
        "description": "Binaural beats layered under heavy rain for maximum distraction blocking",
        "radio_tags": ["rain", "thunder", "nature", "white-noise"],
        "freesound_tags": ["rain-ambient", "thunderstorm", "white-noise"],
        "ia_queries": ["binaural+beats+rain+focus", "thunderstorm+white+noise+study"],
    },
    "neo_classical": {
        "name": "Neo-Classical Piano",
        "category": "classical",
        "icon": "🎹",
        "description": "Solo piano with alpha waves — gentle, melancholic, and clinically focused",
        "radio_tags": ["piano", "classical", "instrumental", "ambient"],
        "freesound_tags": ["piano-ambient", "classical-focus", "solfeggio"],
        "ia_queries": ["solfeggio+frequencies+piano", "alpha+waves+classical+study"],
    },
    "lofi_hiphop": {
        "name": "Lo-Fi Hip Hop Beats",
        "category": "lofi",
        "icon": "🎧",
        "description": "Downtempo beats with jazz chords and vinyl warmth — the internet's favorite",
        "radio_tags": ["lofi", "hip-hop", "chill", "downtempo"],
        "freesound_tags": ["lofi-beats", "chill-hiphop"],
        "ia_queries": ["lofi+hip+hop+study+beats", "chill+beats+focus+music"],
    },
    "ambient_drone": {
        "name": "Ambient & Drone Soundscapes",
        "category": "ambient",
        "icon": "🎛️",
        "description": "Textural floating soundscapes that mask noise without demanding attention",
        "radio_tags": ["ambient", "drone", "atmospheric", "soundscape"],
        "freesound_tags": ["ambient-drone", "soundscape", "atmospheric"],
        "ia_queries": ["ambient+drone+focus", "atmospheric+soundscape+study"],
    },
    "baroque_classical": {
        "name": "Baroque Classical Focus",
        "category": "classical",
        "icon": "🎻",
        "description": "60 BPM Baroque music aligned with alpha brainwaves for relaxed alertness",
        "radio_tags": ["classical", "baroque", "orchestral", "instrumental"],
        "freesound_tags": ["classical-focus", "baroque-study"],
        "ia_queries": ["baroque+classical+focus", "bach+study+music"],
    },
    "synthwave": {
        "name": "Synthwave & Chillwave Drive",
        "category": "electronic",
        "icon": "🌆",
        "description": "Retro synthesizers with driving basslines for energetic forward momentum",
        "radio_tags": ["synthwave", "electronic", "retro", "chillwave"],
        "freesound_tags": ["synthwave", "retro-electronic"],
        "ia_queries": ["synthwave+focus+music", "chillwave+coding+beats"],
    },
    "video_game": {
        "name": "Video Game Soundtracks",
        "category": "gaming",
        "icon": "🎮",
        "description": "Music designed to engage and maintain focus — from Minecraft to Zelda",
        "radio_tags": ["soundtrack", "instrumental", "orchestral", "ambient"],
        "freesound_tags": ["game-soundtrack", "orchestral-ambient"],
        "ia_queries": ["video+game+soundtrack+focus", "minecraft+study+music"],
    },
}

PLAYLIST_DEFINITIONS: Dict[str, Tuple[str, str]] = {
    "radio-browser": ("Study Radio", "study"),
    "freesound": ("Nature & Ambient", "nature"),
    "internet-archive": ("Binaural & Focus", "binaural"),
}

CURATED_PLAYLISTS: List[Tuple[str, str]] = [
    ("Deep Focus", "focus"),
    ("Coding Session", "coding"),
    ("Study Mix", "study"),
    ("Night Coding", "ambient"),
]


def _sanitize_title(raw: Optional[str], max_length: int = MAX_TITLE_LENGTH) -> str:
    if not raw:
        return "Untitled"
    cleaned = re.sub(r"\s+", " ", raw.strip())
    return cleaned[:max_length] if len(cleaned) > max_length else cleaned


def _parse_duration_to_mmss(value: Any) -> str:
    if value is None:
        return "00:00"
    if isinstance(value, str):
        if value == "∞":
            return "∞"
        if re.fullmatch(r"\d{1,2}:\d{2}", value):
            return value
        if re.fullmatch(r"\d{1,2}:\d{2}:\d{2}", value):
            parts = value.split(":")
            total_seconds = int(parts[-2]) * 60 + int(parts[-1])
            minutes, seconds = divmod(total_seconds, 60)
            return f"{minutes}:{seconds:02d}"
        try:
            value = float(value)
        except (ValueError, TypeError):
            return "00:00"
    try:
        total_seconds = round(float(value))
        total_seconds = max(0, min(total_seconds, 86399))
        minutes, seconds = divmod(total_seconds, 60)
        return f"{minutes}:{seconds:02d}"
    except (ValueError, TypeError):
        return "00:00"


def _is_valid_http_url(url: Any) -> bool:
    if not isinstance(url, str):
        return False
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def _deterministic_shuffle(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not items:
        return items
    seed = hashlib.sha256(
        "".join(sorted(i.get("url", "") for i in items)).encode()
    ).digest()
    rng = random.Random(int.from_bytes(seed[:8], "big"))
    shuffled = list(items)
    rng.shuffle(shuffled)
    return shuffled


class InboundTrack(BaseModel):
    title_raw: str = Field(default="Untitled", alias="title")
    url_raw: str = Field(..., alias="url")
    duration_raw: Any = Field(default=None, alias="duration")
    source: str = Field(default="unknown")
    genre: str = Field(default="")

    title: str = ""
    url: str = ""
    duration: str = "00:00"
    genre: str = ""

    @field_validator("url_raw")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not _is_valid_http_url(v):
            raise ValueError(f"Not a valid HTTP(S) URL: {v!r}")
        return v

    @model_validator(mode="before")
    @classmethod
    def coerce_duration(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        for alias in ("track_duration", "length", "audio_duration"):
            if alias in values and "duration" not in values:
                values["duration"] = values[alias]
        return values

    def model_post_init(self, _context: Any) -> None:
        self.title = _sanitize_title(self.title_raw)
        self.url = self.url_raw
        self.duration = _parse_duration_to_mmss(self.duration_raw)
        self.genre = self.genre or ""


class ValidatedTrack(BaseModel):
    title: str
    url: str
    duration: str
    source: str
    genre: str


class ApiFetchError(Exception):
    pass


async def _safe_fetch(
    client: httpx.AsyncClient, url: str, params: Dict[str, Any]
) -> Dict[str, Any]:
    try:
        resp = await client.get(url, params=params, timeout=DEFAULT_HTTP_TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        raise ApiFetchError(
            f"HTTP {exc.response.status_code} from {url}: {exc.response.text[:200]}"
        ) from exc
    except (httpx.RequestError, httpx.TimeoutException) as exc:
        raise ApiFetchError(f"Request error for {url}: {exc}") from exc


# =============================================================================
# SOURCE 1: RADIO BROWSER (no API key)
# =============================================================================
async def fetch_radio_browser_tracks(genre_tags: List[str], genre_key: str) -> List[Dict[str, Any]]:
    """Fetch radio streams for a specific genre."""
    validated: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(headers={"User-Agent": "CodeMaster/1.0"}) as client:
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

        async def process_tag(tag: str) -> None:
            async with semaphore:
                try:
                    data = await _safe_fetch(
                        client,
                        "https://de1.api.radio-browser.info/json/stations/search",
                        {
                            "tag": tag,
                            "limit": 10,
                            "hidebroken": "true",
                            "order": "clickcount",
                            "reverse": "true",
                        },
                    )
                except ApiFetchError as exc:
                    logger.warning("Radio Browser tag '%s': %s", tag, exc)
                    return

                for station in data[:5]:
                    url = station.get("url_resolved") or station.get("url")
                    if not url:
                        continue
                    try:
                        track = InboundTrack(
                            title=station.get("name", "Radio Stream"),
                            url=url,
                            duration="∞",
                            source="radio-browser",
                            genre=genre_key,
                        )
                        validated.append(
                            ValidatedTrack(
                                title=track.title,
                                url=track.url,
                                duration=track.duration,
                                source=track.source,
                                genre=track.genre,
                            ).model_dump()
                        )
                    except ValidationError:
                        continue

        await asyncio.gather(*[process_tag(tag) for tag in genre_tags[:3]])

    return validated


# =============================================================================
# SOURCE 2: FREESOUND (needs free API key)
# =============================================================================
async def fetch_freesound_tracks(api_key: str, genre_tags: List[str], genre_key: str) -> List[Dict[str, Any]]:
    if not api_key:
        return []

    validated: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(headers={"User-Agent": "CodeMaster/1.0"}) as client:
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

        async def process_tag(tag: str) -> None:
            async with semaphore:
                try:
                    data = await _safe_fetch(
                        client,
                        "https://freesound.org/apiv2/search/text/",
                        {
                            "query": tag,
                            "token": api_key,
                            "fields": "id,name,previews,duration",
                            "page_size": 15,
                            "sort": "rating_desc",
                        },
                    )
                except ApiFetchError as exc:
                    logger.warning("Freesound tag '%s': %s", tag, exc)
                    return

                for sound in data.get("results", []):
                    previews = sound.get("previews", {}) or {}
                    preview_url = previews.get("preview-hq-mp3") or previews.get("preview-lq-mp3")
                    if not preview_url:
                        continue
                    try:
                        track = InboundTrack(
                            title=sound.get("name", tag),
                            url=preview_url,
                            duration=sound.get("duration"),
                            source="freesound",
                            genre=genre_key,
                        )
                        validated.append(
                            ValidatedTrack(
                                title=track.title,
                                url=track.url,
                                duration=track.duration,
                                source=track.source,
                                genre=track.genre,
                            ).model_dump()
                        )
                    except ValidationError:
                        continue

        await asyncio.gather(*[process_tag(tag) for tag in genre_tags[:3]])

    return validated


# =============================================================================
# SOURCE 3: INTERNET ARCHIVE (no API key)
# =============================================================================
async def fetch_internet_archive_tracks(ia_queries: List[str], genre_key: str) -> List[Dict[str, Any]]:
    validated: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(headers={"User-Agent": "CodeMaster/1.0"}) as client:
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

        async def process_query(query: str) -> None:
            async with semaphore:
                try:
                    data = await _safe_fetch(
                        client,
                        "https://archive.org/advancedsearch.php",
                        {
                            "q": f"{query} AND mediatype:(audio) AND format:(MP3)",
                            "fl[]": "identifier,title",
                            "output": "json",
                            "rows": 10,
                        },
                    )
                except ApiFetchError as exc:
                    logger.warning("Internet Archive query '%s': %s", query, exc)
                    return

                docs = data.get("response", {}).get("docs", [])
                for doc in docs:
                    identifier = doc.get("identifier", "")
                    title = doc.get("title", query)
                    if not identifier:
                        continue

                    mp3_url = f"https://archive.org/download/{identifier}/{identifier}.mp3"

                    try:
                        track = InboundTrack(
                            title=title,
                            url=mp3_url,
                            duration=None,
                            source="internet-archive",
                            genre=genre_key,
                        )
                        validated.append(
                            ValidatedTrack(
                                title=track.title,
                                url=track.url,
                                duration=track.duration,
                                source=track.source,
                                genre=track.genre,
                            ).model_dump()
                        )
                    except ValidationError:
                        continue

        await asyncio.gather(*[process_query(q) for q in ia_queries[:2]])

    return validated


# =============================================================================
# DATABASE PERSISTENCE — Genre-based playlists
# =============================================================================
async def save_music_to_db(all_tracks: List[Dict[str, Any]]) -> None:
    if not all_tracks:
        logger.info("No tracks to persist.")
        return

    # Group by genre first
    genre_playlists: Dict[str, List[Dict[str, str]]] = {}
    for track in all_tracks:
        genre = track.get("genre", "other")
        genre_playlists.setdefault(genre, []).append(
            {
                "title": track["title"],
                "url": track["url"],
                "duration": track["duration"],
                "source": track.get("source", ""),
                "genre": genre,
            }
        )

    async with AsyncSessionLocal() as session:
        try:
            async with session.begin():
                await session.execute(
                    delete(MusicPlaylist).execution_options(synchronize_session="fetch")
                )

                for genre_key, tracks in genre_playlists.items():
                    genre_info = GENRE_PLAYLISTS.get(genre_key, {"name": genre_key.title(), "category": "other"})
                    session.add(
                        MusicPlaylist(
                            name=genre_info["name"],
                            category=genre_info["category"],
                            tracks=tracks,
                            created_at=datetime.now(timezone.utc),
                        )
                    )

            logger.info(
                "Saved %d tracks across %d genre playlists",
                len(all_tracks),
                len(genre_playlists),
            )
        except (IntegrityError, DBAPIError, SQLAlchemyError) as exc:
            logger.error("Database transaction failed: %s", exc)
            await session.rollback()
            raise


# =============================================================================
# MAIN ORCHESTRATOR — Fetch ALL genres
# =============================================================================
async def fetch_all_music(freesound_key: str = "") -> int:
    logger.info("=" * 60)
    logger.info("🎵 Fetching Music from 8 Genres via Live APIs...")
    logger.info("=" * 60)

    all_tracks: List[Dict[str, Any]] = []

    for genre_key, genre_info in GENRE_PLAYLISTS.items():
        logger.info(f"  📻 Fetching: {genre_info['icon']} {genre_info['name']}...")

        # Radio Browser
        try:
            radio_tracks = await fetch_radio_browser_tracks(genre_info["radio_tags"], genre_key)
            all_tracks.extend(radio_tracks)
        except Exception as exc:
            logger.warning(f"Radio fetch for {genre_key}: {exc}")

        # Freesound
        if freesound_key:
            try:
                fs_tracks = await fetch_freesound_tracks(freesound_key, genre_info["freesound_tags"], genre_key)
                all_tracks.extend(fs_tracks)
            except Exception as exc:
                logger.warning(f"Freesound fetch for {genre_key}: {exc}")

        # Internet Archive
        try:
            ia_tracks = await fetch_internet_archive_tracks(genre_info["ia_queries"], genre_key)
            all_tracks.extend(ia_tracks)
        except Exception as exc:
            logger.warning(f"Internet Archive fetch for {genre_key}: {exc}")

        # Small delay between genres to avoid rate limits
        await asyncio.sleep(0.5)

    if all_tracks:
        await save_music_to_db(all_tracks)

    logger.info("=" * 60)
    logger.info(f"✅ Music Fetch Complete: {len(all_tracks)} total tracks across {len(GENRE_PLAYLISTS)} genres")
    logger.info("=" * 60)
    return len(all_tracks)