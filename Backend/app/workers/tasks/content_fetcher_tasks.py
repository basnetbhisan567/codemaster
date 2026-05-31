"""
Complete Content Fetcher
Fetches Tech Blogs, Tech Tools, and Tech News from multiple free sources
All content stored permanently in database
"""

import httpx
import random
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
import dateutil.parser
from app.core.database import AsyncSessionLocal
from app.models.content import TechBlog, TechTool, TechNews
from app.core.logger import logger


# ============================================
# TECH BLOGS FETCHER
# ============================================

BLOG_SOURCES = [
    {
        "name": "Dev.to",
        "url": "https://dev.to/api/articles",
        "params": {"tag": "programming", "per_page": 30},
    },
    {
        "name": "Dev.to JavaScript",
        "url": "https://dev.to/api/articles",
        "params": {"tag": "javascript", "per_page": 20},
    },
    {
        "name": "Dev.to Python",
        "url": "https://dev.to/api/articles",
        "params": {"tag": "python", "per_page": 20},
    },
    {
        "name": "Dev.to React",
        "url": "https://dev.to/api/articles",
        "params": {"tag": "react", "per_page": 20},
    },
    {
        "name": "Dev.to WebDev",
        "url": "https://dev.to/api/articles",
        "params": {"tag": "webdev", "per_page": 20},
    },
    {
        "name": "Dev.to AI",
        "url": "https://dev.to/api/articles",
        "params": {"tag": "ai", "per_page": 20},
    },
]


async def fetch_blogs():
    """Fetch tech blogs from all sources."""
    all_blogs = []

    async with httpx.AsyncClient() as client:
        for source in BLOG_SOURCES:
            try:
                response = await client.get(
                    source["url"],
                    params=source["params"],
                    timeout=30,
                )
                if response.status_code == 200:
                    articles = response.json()
                    for article in articles:
                        all_blogs.append({
                            "title": article.get("title", ""),
                            "summary": (article.get("description") or "")[:500],
                            "content": (article.get("body_html") or article.get("description") or "")[:10000],
                            "author": article.get("user", {}).get("name", "Unknown"),
                            "source": source["name"],
                            "source_url": article.get("url", ""),
                            "image_url": article.get("cover_image") or article.get("social_image", ""),
                            "category": source["params"].get("tag", "tech"),
                            "tags": article.get("tag_list", []),
                            "language": source["params"].get("tag", ""),
                            "read_time": f"{article.get('reading_time_minutes', 5)} min",
                            "published_at": article.get("published_at"),
                        })
                    logger.info(f"  ✅ {source['name']}: {len(articles)} articles")
                else:
                    logger.warning(f"  ⚠️ {source['name']}: HTTP {response.status_code}")
            except Exception as e:
                logger.warning(f"  ❌ {source['name']}: {str(e)[:80]}")

    return all_blogs


# ============================================
# TECH TOOLS FETCHER
# ============================================

TOOL_SOURCES = [
    {
        "name": "GitHub Trending JS",
        "url": "https://api.github.com/search/repositories",
        "params": {"q": "language:javascript stars:>50", "sort": "stars", "order": "desc", "per_page": 30},
    },
    {
        "name": "GitHub Trending Python",
        "url": "https://api.github.com/search/repositories",
        "params": {"q": "language:python stars:>50", "sort": "stars", "order": "desc", "per_page": 30},
    },
    {
        "name": "GitHub Trending TypeScript",
        "url": "https://api.github.com/search/repositories",
        "params": {"q": "language:typescript stars:>50", "sort": "stars", "order": "desc", "per_page": 20},
    },
]


async def fetch_tools():
    """Fetch trending developer tools from GitHub."""
    all_tools = []

    async with httpx.AsyncClient() as client:
        for source in TOOL_SOURCES:
            try:
                response = await client.get(
                    source["url"],
                    params=source["params"],
                    headers={"Accept": "application/vnd.github.v3+json"},
                    timeout=30,
                )
                if response.status_code == 200:
                    repos = response.json().get("items", [])
                    for repo in repos:
                        all_tools.append({
                            "name": repo.get("full_name", ""),
                            "description": (repo.get("description") or "")[:500],
                            "category": source["params"]["q"].split(":")[0].replace("language:", "language-"),
                            "url": repo.get("html_url", ""),
                            "github_url": repo.get("html_url", ""),
                            "docs_url": repo.get("homepage", "") or "",
                            "pricing": "free",
                            "features": [
                                f"⭐ {repo.get('stargazers_count', 0)} stars",
                                f"🔀 {repo.get('forks_count', 0)} forks",
                                f"👀 {repo.get('watchers_count', 0)} watchers",
                            ],
                            "tags": repo.get("topics", []),
                            "language": repo.get("language", "").lower() if repo.get("language") else "",
                            "stars": repo.get("stargazers_count", 0),
                            "rating": min(5, repo.get("stargazers_count", 0) // 1000),
                            "logo_url": repo.get("owner", {}).get("avatar_url", ""),
                            "is_open_source": True,
                        })
                    logger.info(f"  ✅ {source['name']}: {len(repos)} tools")
            except Exception as e:
                logger.warning(f"  ❌ {source['name']}: {str(e)[:80]}")

    return all_tools


# ============================================
# TECH NEWS FETCHER
# ============================================

NEWS_SOURCES = [
    {
        "name": "Hacker News",
        "url": "https://hacker-news.firebaseio.com/v0/topstories.json",
        "type": "hn",
    },
    {
        "name": "Dev.to Top",
        "url": "https://dev.to/api/articles",
        "params": {"tag": "news", "per_page": 20},
        "type": "devto",
    },
]


async def fetch_hacker_news():
    """Fetch top stories from Hacker News."""
    news = []
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(NEWS_SOURCES[0]["url"], timeout=30)
            if response.status_code == 200:
                story_ids = response.json()[:20]

                for story_id in story_ids[:15]:
                    try:
                        story_resp = await client.get(
                            f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json",
                            timeout=10,
                        )
                        if story_resp.status_code == 200:
                            story = story_resp.json()
                            if story and story.get("title"):
                                news.append({
                                    "title": story.get("title", ""),
                                    "summary": (story.get("text") or "")[:500],
                                    "content": (story.get("text") or "")[:5000],
                                    "source": "Hacker News",
                                    "source_url": story.get("url", f"https://news.ycombinator.com/item?id={story_id}"),
                                    "image_url": "",
                                    "category": "tech",
                                    "tags": ["hackernews", "tech"],
                                    "read_time": "5 min",
                                    "published_at": datetime.fromtimestamp(story.get("time", 0), tz=timezone.utc).isoformat() if story.get("time") else None,
                                })
                    except Exception:
                        continue
        except Exception as e:
            logger.warning(f"  ❌ Hacker News: {str(e)[:80]}")
    return news


async def fetch_news():
    """Fetch tech news from all sources."""
    all_news = []

    hn_news = await fetch_hacker_news()
    all_news.extend(hn_news)
    logger.info(f"  ✅ Hacker News: {len(hn_news)} stories")

    async with httpx.AsyncClient() as client:
        for source in NEWS_SOURCES[1:]:
            try:
                response = await client.get(source["url"], params=source.get("params"), timeout=30)
                if response.status_code == 200:
                    articles = response.json()
                    for article in articles:
                        all_news.append({
                            "title": article.get("title", ""),
                            "summary": (article.get("description") or "")[:500],
                            "content": (article.get("body_html") or article.get("description") or "")[:5000],
                            "source": source["name"],
                            "source_url": article.get("url", ""),
                            "image_url": article.get("cover_image", ""),
                            "category": "tech",
                            "tags": article.get("tag_list", []),
                            "read_time": "5 min",
                            "published_at": article.get("published_at"),
                        })
                    logger.info(f"  ✅ {source['name']}: {len(articles)} articles")
            except Exception as e:
                logger.warning(f"  ❌ {source['name']}: {str(e)[:80]}")

    return all_news


# ============================================
# SAVE TO DATABASE
# ============================================

async def save_blogs_to_db(blogs: list):
    """Save blogs to database. Skip duplicates."""
    async with AsyncSessionLocal() as db:
        saved = 0
        for blog in blogs:
            if not blog.get("source_url"):
                continue
            
            pub_date = blog.get("published_at")
            if isinstance(pub_date, str):
                try:
                    pub_date = dateutil.parser.parse(pub_date)
                except:
                    pub_date = datetime.now()
            elif pub_date is None:
                pub_date = datetime.now()
            
            blog["published_at"] = pub_date
            
            existing = await db.scalar(
                select(TechBlog).where(TechBlog.source_url == blog["source_url"])
            )
            if not existing:
                db.add(TechBlog(**blog))
                saved += 1
        await db.commit()
    logger.info(f"  💾 Saved {saved} new blogs to database")

async def save_tools_to_db(tools: list):
    """Save tools to database. Skip duplicates."""
    async with AsyncSessionLocal() as db:
        saved = 0
        for tool in tools:
            if not tool.get("url"):
                continue
            existing = await db.scalar(
                select(TechTool).where(TechTool.url == tool["url"])
            )
            if not existing:
                db.add(TechTool(**tool))
                saved += 1
        await db.commit()
    logger.info(f"  💾 Saved {saved} new tools to database")


async def save_news_to_db(news: list):
    """Save news to database. Skip duplicates."""
    async with AsyncSessionLocal() as db:
        saved = 0
        for item in news:
            if not item.get("source_url"):
                continue
            
            # Fix: Convert string date to datetime object for SQLite
            pub_date = item.get("published_at")
            if isinstance(pub_date, str):
                try:
                    pub_date = dateutil.parser.parse(pub_date)
                except:
                    pub_date = datetime.now()
            elif pub_date is None:
                pub_date = datetime.now()
            
            item["published_at"] = pub_date
            
            existing = await db.scalar(
                select(TechNews).where(TechNews.source_url == item["source_url"])
            )
            if not existing:
                db.add(TechNews(**item))
                saved += 1
        await db.commit()
    logger.info(f"  💾 Saved {saved} new news to database")

# ============================================
# MAIN FETCH TASKS
# ============================================

async def fetch_all_blogs():
    """Main task: Fetch all tech blogs."""
    logger.info("=" * 50)
    logger.info("📝 Starting Tech Blogs Fetch...")
    blogs = await fetch_blogs()
    await save_blogs_to_db(blogs)
    logger.info(f"✅ Tech Blogs Complete: {len(blogs)} total")
    logger.info("=" * 50)


async def fetch_all_tools():
    """Main task: Fetch all tech tools."""
    logger.info("=" * 50)
    logger.info("🛠️ Starting Tech Tools Fetch...")
    tools = await fetch_tools()
    await save_tools_to_db(tools)
    logger.info(f"✅ Tech Tools Complete: {len(tools)} total")
    logger.info("=" * 50)


async def fetch_all_news():
    """Main task: Fetch all tech news."""
    logger.info("=" * 50)
    logger.info("📰 Starting Tech News Fetch...")
    news = await fetch_news()
    await save_news_to_db(news)
    logger.info(f"✅ Tech News Complete: {len(news)} total")
    logger.info("=" * 50)


async def fetch_all_content():
    """Master task: Fetch everything at once."""
    logger.info("🚀 STARTING FULL CONTENT FETCH")
    await fetch_all_blogs()
    await fetch_all_tools()
    await fetch_all_news()
    logger.info("🎉 FULL CONTENT FETCH COMPLETE")

