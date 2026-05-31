"""
Content API Router
Tech Blogs, Tech Tools, Tech News — all served from local database
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.content import TechBlog, TechTool, TechNews
from app.schemas.content import (
    TechBlogListResponse, TechBlogResponse,
    TechToolListResponse, TechToolResponse,
    TechNewsListResponse, TechNewsResponse,
)

router = APIRouter(tags=["Content"])


# ============================================
# TECH BLOGS
# ============================================

@router.get("/blogs", response_model=TechBlogListResponse)
async def list_blogs(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get tech blogs from database (even if original source is gone)."""
    query = select(TechBlog).where(TechBlog.is_active == True)

    if search:
        query = query.where(TechBlog.title.ilike(f"%{search}%"))
    if category:
        query = query.where(TechBlog.category == category)
    if tag:
        query = query.where(TechBlog.tags.contains([tag]))

    query = query.order_by(TechBlog.published_at.desc().nulls_last())
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    blogs = result.scalars().all()

    return TechBlogListResponse(
        blogs=[TechBlogResponse.model_validate(b) for b in blogs],
        total=total or 0, page=page, limit=limit,
    )


@router.get("/blogs/{blog_id}", response_model=TechBlogResponse)
async def get_blog(blog_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single blog with full content."""
    result = await db.execute(select(TechBlog).where(TechBlog.id == blog_id))
    blog = result.scalar_one_or_none()
    if not blog:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog not found")

    blog.view_count += 1
    await db.commit()
    return TechBlogResponse.model_validate(blog)


# ============================================
# TECH TOOLS
# ============================================

@router.get("/tools", response_model=TechToolListResponse)
async def list_tools(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    pricing: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get tech tools from database."""
    query = select(TechTool).where(TechTool.is_active == True)

    if search:
        query = query.where(TechTool.name.ilike(f"%{search}%"))
    if category:
        query = query.where(TechTool.category == category)
    if tag:
        query = query.where(TechTool.tags.contains([tag]))
    if pricing:
        query = query.where(TechTool.pricing == pricing)

    query = query.order_by(TechTool.stars.desc().nulls_last())
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    tools = result.scalars().all()

    return TechToolListResponse(
        tools=[TechToolResponse.model_validate(t) for t in tools],
        total=total or 0, page=page, limit=limit,
    )


@router.get("/tools/{tool_id}", response_model=TechToolResponse)
async def get_tool(tool_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single tool with full details."""
    result = await db.execute(select(TechTool).where(TechTool.id == tool_id))
    tool = result.scalar_one_or_none()
    if not tool:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Tool not found")

    tool.view_count += 1
    await db.commit()
    return TechToolResponse.model_validate(tool)


# ============================================
# TECH NEWS
# ============================================

@router.get("/news", response_model=TechNewsListResponse)
async def list_news(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get tech news from database."""
    query = select(TechNews).where(TechNews.is_active == True)

    if search:
        query = query.where(TechNews.title.ilike(f"%{search}%"))
    if category:
        query = query.where(TechNews.category == category)
    if tag:
        query = query.where(TechNews.tags.contains([tag]))

    query = query.order_by(TechNews.published_at.desc().nulls_last())
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    news = result.scalars().all()

    return TechNewsListResponse(
        news=[TechNewsResponse.model_validate(n) for n in news],
        total=total or 0, page=page, limit=limit,
    )


@router.get("/news/{news_id}", response_model=TechNewsResponse)
async def get_news_item(news_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single news item with full content."""
    result = await db.execute(select(TechNews).where(TechNews.id == news_id))
    item = result.scalar_one_or_none()
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="News not found")

    item.view_count += 1
    await db.commit()
    return TechNewsResponse.model_validate(item)