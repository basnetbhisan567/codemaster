

import httpx
from sqlalchemy import select
from datetime import datetime, timezone
from app.core.database import AsyncSessionLocal
from app.models.project import Project
from app.core.logger import logger


# ============================================
# SOURCE 1: GITHUB TRENDING - Real Projects
# ============================================
async def fetch_github_trending():
    """Fetch trending repos from GitHub - turn them into project ideas."""
    ideas = []
    languages = ["javascript", "python", "typescript", "go", "rust", "java"]
    
    try:
        async with httpx.AsyncClient() as client:
            for lang in languages:
                response = await client.get(
                    f"https://api.github.com/search/repositories",
                    params={
                        "q": f"language:{lang} stars:>100 created:>2024-01-01",
                        "sort": "stars",
                        "order": "desc",
                        "per_page": 10,
                    },
                    headers={"Accept": "application/vnd.github.v3+json"},
                    timeout=30,
                )
                if response.status_code == 200:
                    repos = response.json().get("items", [])
                    for repo in repos:
                        ideas.append({
                            "title": f"Build a {repo['name']} Clone",
                            "description": f"Project based on {repo['full_name']} ({repo.get('stargazers_count', 0)}⭐): {repo.get('description', '')}",
                            "level": 2 if repo.get('stargazers_count', 0) > 500 else 1,
                            "category": "clone",
                            "language": lang,
                            "requirements": [
                                f"Study the original: {repo['html_url']}",
                                "Implement core features",
                                "Add unique improvements",
                                "Deploy and share",
                            ],
                            "starter_code": f"// Inspired by: {repo['html_url']}",
                            "xp_reward": 500 + (repo.get('stargazers_count', 0) // 10),
                            "estimated_hours": 8 + (repo.get('stargazers_count', 0) // 1000),
                        })
            logger.info(f"  ✅ GitHub Trending: {len(ideas)} ideas")
    except Exception as e:
        logger.warning(f"  ⚠️ GitHub: {str(e)[:80]}")
    return ideas


# ============================================
# SOURCE 2: DEV.TO - Tutorial Projects
# ============================================
async def fetch_devto_projects():
    """Fetch project tutorials from Dev.to."""
    ideas = []
    tags = ["tutorial", "project", "showdev", "react", "python", "javascript"]
    
    try:
        async with httpx.AsyncClient() as client:
            for tag in tags:
                response = await client.get(
                    "https://dev.to/api/articles",
                    params={"tag": tag, "per_page": 10, "top": "1"},
                    timeout=30,
                )
                if response.status_code == 200:
                    articles = response.json()
                    for article in articles:
                        if "project" in article.get("title", "").lower() or "build" in article.get("title", "").lower():
                            ideas.append({
                                "title": article.get("title", "")[:300],
                                "description": (article.get("description") or "Build this project")[:500],
                                "level": 1 if "beginner" in (article.get("title", "") + article.get("description", "")).lower() else 2,
                                "category": "tutorial",
                                "language": tag if tag in ["react", "python", "javascript"] else "javascript",
                                "requirements": [
                                    "Read the tutorial",
                                    "Build along step by step",
                                    "Add your own features",
                                    "Share your version",
                                ],
                                "starter_code": "",
                                "xp_reward": 300,
                                "estimated_hours": 5,
                            })
            logger.info(f"  ✅ Dev.to: {len(ideas)} ideas")
    except Exception as e:
        logger.warning(f"  ⚠️ Dev.to: {str(e)[:80]}")
    return ideas


# ============================================
# SOURCE 3: PUBLIC APIs - API-based Projects
# ============================================
async def fetch_api_project_ideas():
    """Fetch public APIs and create project ideas around them."""
    ideas = []
    
    try:
        async with httpx.AsyncClient() as client:
            # Fetch list of free public APIs
            response = await client.get(
                "https://api.publicapis.org/entries",
                params={"category": "development"},
                timeout=30,
            )
            if response.status_code == 200:
                apis = response.json().get("entries", [])
                for api in apis[:20]:
                    if api.get("API") and api.get("Description"):
                        ideas.append({
                            "title": f"Build an App using {api['API']}",
                            "description": f"Create a project using {api['API']}: {api.get('Description', '')[:200]}",
                            "level": 2,
                            "category": "api-integration",
                            "language": "javascript",
                            "requirements": [
                                f"Integrate {api['API']} API",
                                "Build a user interface",
                                "Handle API errors gracefully",
                                "Deploy the application",
                            ],
                            "starter_code": f"// API: {api.get('Link', '')}",
                            "xp_reward": 400,
                            "estimated_hours": 6,
                        })
            logger.info(f"  ✅ Public APIs: {len(ideas)} ideas")
    except Exception as e:
        logger.warning(f"  ⚠️ Public APIs: {str(e)[:80]}")
    return ideas


# ============================================
# SOURCE 4: PRE-DEFINED REAL-WORLD PROJECTS
# ============================================
async def get_real_world_projects():
    """Curated real-world project ideas that companies actually use."""
    projects = [
        {
            "title": "E-Commerce Platform with Stripe Payments",
            "description": "Build a full-featured online store with product listings, cart, checkout, and Stripe payment integration.",
            "level": 3, "category": "fullstack", "language": "javascript",
            "requirements": ["Product catalog with search/filter", "Shopping cart with persistence", "Stripe checkout integration", "Order management dashboard", "User authentication"],
            "xp_reward": 1500, "estimated_hours": 20,
        },
        {
            "title": "Real-Time Chat Application",
            "description": "Build a Slack-like chat app with rooms, direct messages, file sharing, and online status.",
            "level": 3, "category": "fullstack", "language": "javascript",
            "requirements": ["WebSocket real-time messaging", "Chat rooms & DMs", "File/image sharing", "Typing indicators", "Message history"],
            "xp_reward": 1200, "estimated_hours": 15,
        },
        {
            "title": "AI-Powered Code Review Assistant",
            "description": "Create a tool that analyzes pull requests and provides AI-generated code review comments.",
            "level": 4, "category": "ai-ml", "language": "python",
            "requirements": ["GitHub API integration", "AI model for code analysis", "PR diff parsing", "Inline comment generation", "Dashboard UI"],
            "xp_reward": 2000, "estimated_hours": 25,
        },
        {
            "title": "Job Application Tracker Dashboard",
            "description": "Build a personal CRM for tracking job applications with status updates, reminders, and analytics.",
            "level": 2, "category": "frontend", "language": "javascript",
            "requirements": ["CRUD for job applications", "Status tracking (applied/interview/offer)", "Calendar for interviews", "Statistics dashboard", "Resume upload"],
            "xp_reward": 800, "estimated_hours": 10,
        },
        {
            "title": "Microservices with Docker & Kubernetes",
            "description": "Build a microservices architecture with multiple services, API gateway, and container orchestration.",
            "level": 4, "category": "devops", "language": "python",
            "requirements": ["3+ microservices", "API Gateway", "Docker containers", "Kubernetes deployment", "Service monitoring"],
            "xp_reward": 2500, "estimated_hours": 30,
        },
        {
            "title": "Personal Finance Tracker",
            "description": "Build an expense tracker with budget planning, charts, and bank statement import.",
            "level": 1, "category": "fullstack", "language": "javascript",
            "requirements": ["Expense CRUD", "Budget categories", "Charts & graphs", "CSV import", "Monthly reports"],
            "xp_reward": 500, "estimated_hours": 8,
        },
        {
            "title": "Social Media Analytics Dashboard",
            "description": "Create a dashboard that aggregates analytics from multiple social media platforms.",
            "level": 2, "category": "api-integration", "language": "python",
            "requirements": ["Twitter/X API", "Instagram API", "Data visualization", "Scheduled reports", "Export to PDF"],
            "xp_reward": 1000, "estimated_hours": 12,
        },
        {
            "title": "DevOps CI/CD Pipeline Builder",
            "description": "Build a visual CI/CD pipeline builder with drag-and-drop stages and GitHub Actions integration.",
            "level": 3, "category": "devops", "language": "typescript",
            "requirements": ["Visual pipeline editor", "GitHub Actions sync", "Stage templates", "Build logs viewer", "Deployment tracking"],
            "xp_reward": 1800, "estimated_hours": 22,
        },
        {
            "title": "Blockchain Voting System",
            "description": "Create a secure voting system using blockchain for transparent and immutable vote counting.",
            "level": 4, "category": "blockchain", "language": "javascript",
            "requirements": ["Smart contracts", "Wallet integration", "Vote casting UI", "Real-time results", "Voter verification"],
            "xp_reward": 2200, "estimated_hours": 28,
        },
        {
            "title": "AI Resume Builder with ATS Optimization",
            "description": "Build an AI-powered resume builder that optimizes content for Applicant Tracking Systems.",
            "level": 3, "category": "ai-ml", "language": "python",
            "requirements": ["Resume templates", "AI content suggestions", "ATS keyword analysis", "PDF export", "Version history"],
            "xp_reward": 1500, "estimated_hours": 18,
        },
    ]
    logger.info(f"  ✅ Real-World Projects: {len(projects)} ideas")
    return projects


# ============================================
# SAVE TO DATABASE
# ============================================
async def save_projects_to_db(ideas: list):
    async with AsyncSessionLocal() as db:
        saved = 0
        for idea in ideas:
            slug = idea["title"].lower().replace(" ", "-").replace("/", "-")[:200]
            existing = await db.scalar(select(Project).where(Project.slug == slug))
            if not existing:
                db.add(Project(
                    slug=slug,
                    title=idea["title"],
                    description=idea.get("description", ""),
                    level=idea.get("level", 1),
                    category=idea.get("category", "general"),
                    language=idea.get("language", "javascript"),
                    requirements=idea.get("requirements", []),
                    starter_code=idea.get("starter_code", ""),
                    xp_reward=idea.get("xp_reward", 500),
                    estimated_hours=idea.get("estimated_hours", 10),
                ))
                saved += 1
        await db.commit()
    logger.info(f"  💾 Saved {saved} new projects")


# ============================================
# MAIN FETCH ALL PROJECTS
# ============================================
async def fetch_all_projects():
    logger.info("=" * 60)
    logger.info("💡 Fetching Project Ideas from ALL Sources...")
    logger.info("=" * 60)
    
    all_ideas = []
    
    all_ideas.extend(await fetch_github_trending())
    all_ideas.extend(await fetch_devto_projects())
    all_ideas.extend(await fetch_api_project_ideas())
    all_ideas.extend(await get_real_world_projects())
    
    await save_projects_to_db(all_ideas)
    
    logger.info("=" * 60)
    logger.info(f"✅ Total: {len(all_ideas)} project ideas from 4 sources")
    logger.info("=" * 60)
    return len(all_ideas)