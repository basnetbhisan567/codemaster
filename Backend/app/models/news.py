from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from datetime import datetime
from app.core.database import Base


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    summary = Column(Text, default="")
    source = Column(String(200), default="")
    source_url = Column(String(500), default="")
    image_url = Column(String(500), default="")
    category = Column(String(50), default="tech")
    tags = Column(JSON, default=list)
    read_time = Column(String(20), default="")
    published_at = Column(DateTime, default=lambda: datetime.utcnow())
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
