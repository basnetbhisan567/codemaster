from fastapi import APIRouter, Depends, Query, UploadFile, File
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.community.service import CommunityService
from app.schemas.community import (
    ForumTopicResponse, ForumTopicListResponse, ForumReplyResponse,
    CreateTopicRequest, CreateReplyRequest,
    ChatMessageResponse, ChatMessageRequest,
    StudyGroupResponse, CreateGroupRequest,
    EncryptedMessageRequest, KeyUploadRequest,
)

router = APIRouter(prefix="/community", tags=["Community"])

# ========== FORUMS ==========
@router.get("/forums", response_model=ForumTopicListResponse)
async def list_topics(category: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).get_topics(category, page, limit)

@router.post("/forums", response_model=ForumTopicResponse)
async def create_topic(data: CreateTopicRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).create_topic(current_user.id, data)

@router.get("/forums/{topic_id}", response_model=ForumTopicResponse)
async def get_topic(topic_id: int, db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).get_topic(topic_id)

@router.post("/forums/{topic_id}/replies", response_model=ForumReplyResponse)
async def reply_to_topic(topic_id: int, data: CreateReplyRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).create_reply(current_user.id, topic_id, data)

# ========== REGULAR CHAT ==========
@router.get("/chat/{room}", response_model=list[ChatMessageResponse])
async def get_chat(room: str = "global", db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).get_chat(room)

@router.post("/chat/send", response_model=ChatMessageResponse)
async def send_message(data: ChatMessageRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).send_message(current_user.id, data)

@router.post("/chat/upload", response_model=ChatMessageResponse)
async def upload_chat_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).upload_file(current_user.id, file)

# ========== E2E ENCRYPTED CHAT ==========
@router.post("/chat/encrypted/send")
async def send_encrypted_message(data: EncryptedMessageRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).send_encrypted_message(current_user.id, data)

@router.get("/chat/encrypted/{user_id}")
async def get_encrypted_messages(user_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).get_encrypted_messages(current_user.id, user_id)

@router.post("/keys/upload")
async def upload_public_key(data: KeyUploadRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).upload_public_key(current_user.id, data.public_key)

@router.get("/keys/{user_id}")
async def get_public_key(user_id: int, db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).get_public_key(user_id)

# ========== GROUPS ==========
@router.get("/groups", response_model=list[StudyGroupResponse])
async def list_groups(db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).get_groups()

@router.post("/groups", response_model=StudyGroupResponse)
async def create_group(data: CreateGroupRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).create_group(current_user.id, data)

@router.post("/groups/{group_id}/join")
async def join_group(group_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await CommunityService(db).join_group(current_user.id, group_id)