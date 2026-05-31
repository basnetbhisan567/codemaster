from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime
from app.core.database import Base


class MusicPlaylist(Base):
    __tablename__ = "music_playlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), default="focus")
    tracks = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
