from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class TechBlog(Base):
    __tablename__ = "tech_blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, default="")
    content = Column(Text, default="")
    author = Column(String(200), default="")
    source = Column(String(100), default="")
    source_url = Column(String(1000), default="")
    image_url = Column(String(500), default="")
    category = Column(String(50), default="tech")
    tags = Column(JSON, default=list)
    language = Column(String(50), default="")
    read_time = Column(String(20), default="")
    published_at = Column(DateTime, nullable=True)
    fetched_at = Column(DateTime, default=lambda: datetime.utcnow())
    view_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class TechTool(Base):
    __tablename__ = "tech_tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="")
    url = Column(String(500), default="")
    github_url = Column(String(500), default="")
    docs_url = Column(String(500), default="")
    pricing = Column(String(50), default="free")
    features = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    language = Column(String(50), default="")
    stars = Column(Integer, default=0)
    rating = Column(Integer, default=0)
    logo_url = Column(String(500), default="")
    is_open_source = Column(Boolean, default=False)
    fetched_at = Column(DateTime, default=lambda: datetime.utcnow())
    view_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class TechNews(Base):
    __tablename__ = "tech_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, default="")
    content = Column(Text, default="")
    source = Column(String(200), default="")
    source_url = Column(String(1000), default="")
    image_url = Column(String(500), default="")
    category = Column(String(50), default="tech")
    tags = Column(JSON, default=list)
    read_time = Column(String(20), default="")
    published_at = Column(DateTime, nullable=True)
    fetched_at = Column(DateTime, default=lambda: datetime.utcnow())
    view_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
