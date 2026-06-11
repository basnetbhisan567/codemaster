from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ForumReplyResponse(BaseModel):
    id: int; topic_id: int; author_name: str = ""; content: str
    is_solution: bool = False; upvotes: int = 0; created_at: datetime
    class Config: from_attributes = True


class ForumTopicResponse(BaseModel):
    id: int; title: str; content: str; author_name: str = ""; category: str
    is_pinned: bool; views: int; tags: List[str] = []
    replies_count: int = 0; replies: List[ForumReplyResponse] = []; created_at: datetime
    class Config: from_attributes = True


class ForumTopicListResponse(BaseModel):
    topics: List[ForumTopicResponse]; total: int; page: int; limit: int


class CreateTopicRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=300)
    content: str = Field(..., min_length=10)
    category: str = "general"; tags: List[str] = []


class CreateReplyRequest(BaseModel):
    content: str = Field(..., min_length=2)


class ChatMessageResponse(BaseModel):
    id: int; sender_name: str = ""; content: str = ""
    encrypted_content: str = ""; encryption_key_id: str = ""
    room: str; message_type: str = "text"
    file_url: str = ""; file_name: str = ""; file_size: str = ""; created_at: datetime
    class Config: from_attributes = True


class ChatMessageRequest(BaseModel):
    content: str = Field(default="", max_length=5000); room: str = "global"


class EncryptedMessageRequest(BaseModel):
    encrypted_data: dict; recipient_id: int


class KeyUploadRequest(BaseModel):
    public_key: str = Field(..., min_length=100)


class StudyGroupResponse(BaseModel):
    id: int; name: str; description: str; topic: str; owner_name: str = ""
    max_members: int; is_private: bool; members_count: int = 0; created_at: datetime
    class Config: from_attributes = True


class CreateGroupRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200); description: str = ""
    topic: str = "general"; max_members: int = Field(default=50, ge=5, le=200)
    is_private: bool = False