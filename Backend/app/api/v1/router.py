"""
CodeMaster API v1 — Master Router
All sub-routers registered here appear in Swagger docs.
"""

from fastapi import APIRouter

# Auth
from app.api.v1.auth.router import router as auth_router

# Users & Profile
from app.api.v1.users.router import router as users_router
from app.api.v1.profile.router import router as profile_router

# Settings
from app.api.v1.settings.router import router as settings_router

# Learning
from app.api.v1.topics.router import router as topics_router, progress_router

# AI
from app.api.v1.ai.router import router as ai_router

# Problems & Projects
from app.api.v1.problems.router import router as problems_router
from app.api.v1.projects.router import router as projects_router

# Assignments & Roadmap
from app.api.v1.assignments.router import router as assignments_router
from app.api.v1.roadmap.router import router as roadmap_router

# Community
from app.api.v1.community.router import router as community_router

# Lock Screen
from app.api.v1.lockscreen.router import router as lockscreen_router

# Jobs & News
from app.api.v1.jobs.router import router as jobs_router
from app.api.v1.news.router import router as news_router

# Music & Notifications
from app.api.v1.music.router import router as music_router
from app.api.v1.notifications.router import router as notifications_router

# Analytics, Payments & Playground
from app.api.v1.analytics.router import router as analytics_router
from app.api.v1.payments.router import router as payments_router
from app.api.v1.playground.router import router as playground_router

# Admin
from app.api.v1.admin.router import router as admin_router

# Resources

# Health
from app.api.v1.health.router import router as health_router
from app.api.v1.content.router import router as content_router

api_router = APIRouter()

# Register all routers
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(profile_router)
api_router.include_router(settings_router)
api_router.include_router(topics_router)
api_router.include_router(progress_router)
api_router.include_router(ai_router)
api_router.include_router(problems_router)
api_router.include_router(projects_router)
api_router.include_router(assignments_router)
api_router.include_router(roadmap_router)
api_router.include_router(community_router)
api_router.include_router(lockscreen_router)
api_router.include_router(jobs_router)
api_router.include_router(news_router)
api_router.include_router(music_router)
api_router.include_router(notifications_router)
api_router.include_router(analytics_router)
api_router.include_router(payments_router)
api_router.include_router(playground_router)
api_router.include_router(admin_router)
api_router.include_router(content_router, prefix="/content")