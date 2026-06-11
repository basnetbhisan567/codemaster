from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ForumTopic(Base):
    __tablename__ = "forum_topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), default="general")
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    replies = relationship("ForumReply", back_populates="topic", order_by="ForumReply.created_at")


class ForumReply(Base):
    __tablename__ = "forum_replies"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("forum_topics.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_solution = Column(Boolean, default=False)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("ForumTopic", back_populates="replies")


class StudyGroup(Base):
    __tablename__ = "study_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    topic = Column(String(100), default="general")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    max_members = Column(Integer, default=50)
    is_private = Column(Boolean, default=False)
    members = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, default="")
    encrypted_content = Column(Text, default="")
    encryption_key_id = Column(String(100), default="")
    room = Column(String(50), default="global")
    message_type = Column(String(20), default="text")
    file_url = Column(String(500), default="")
    file_name = Column(String(200), default="")
    file_size = Column(String(20), default="")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)