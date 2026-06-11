from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.community import ForumTopic, ForumReply, StudyGroup, ChatMessage
from app.models.user import User
from app.schemas.community import (
    ForumTopicResponse, ForumTopicListResponse, ForumReplyResponse,
    CreateTopicRequest, CreateReplyRequest,
    ChatMessageResponse, ChatMessageRequest,
    StudyGroupResponse, CreateGroupRequest,
)
import json, os, shutil
from datetime import datetime

UPLOAD_DIR = "static/uploads/chat"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class CommunityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ========== FORUMS ==========
    async def get_topics(self, category: str = None, page: int = 1, limit: int = 20) -> ForumTopicListResponse:
        query = select(ForumTopic)
        if category: query = query.where(ForumTopic.category == category)
        query = query.order_by(ForumTopic.is_pinned.desc(), ForumTopic.created_at.desc())
        total = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        offset = (page - 1) * limit
        result = await self.db.execute(query.offset(offset).limit(limit))
        topics = result.scalars().all()
        topic_list = []
        for t in topics:
            author = await self.db.scalar(select(User.name).where(User.id == t.author_id))
            replies_count = await self.db.scalar(select(func.count(ForumReply.id)).where(ForumReply.topic_id == t.id))
            topic_list.append(ForumTopicResponse(id=t.id, title=t.title, content=t.content, author_name=author or "Unknown", category=t.category, is_pinned=t.is_pinned, views=t.views, tags=t.tags or [], replies_count=replies_count or 0, replies=[], created_at=t.created_at))
        return ForumTopicListResponse(topics=topic_list, total=total or 0, page=page, limit=limit)

    async def create_topic(self, user_id: int, data: CreateTopicRequest) -> ForumTopicResponse:
        topic = ForumTopic(title=data.title, content=data.content, author_id=user_id, category=data.category, tags=data.tags)
        self.db.add(topic); await self.db.commit(); await self.db.refresh(topic)
        author = await self.db.scalar(select(User.name).where(User.id == user_id))
        return ForumTopicResponse(id=topic.id, title=topic.title, content=topic.content, author_name=author or "Unknown", category=topic.category, is_pinned=False, views=0, tags=topic.tags or [], replies_count=0, replies=[], created_at=topic.created_at)

    async def get_topic(self, topic_id: int) -> ForumTopicResponse:
        result = await self.db.execute(select(ForumTopic).where(ForumTopic.id == topic_id))
        topic = result.scalar_one_or_none()
        if not topic: raise HTTPException(status_code=404, detail="Topic not found")
        topic.views += 1; await self.db.commit()
        author = await self.db.scalar(select(User.name).where(User.id == topic.author_id))
        replies_result = await self.db.execute(select(ForumReply).where(ForumReply.topic_id == topic_id).order_by(ForumReply.created_at))
        replies = replies_result.scalars().all()
        reply_list = [ForumReplyResponse(id=r.id, topic_id=r.topic_id, author_name=(await self.db.scalar(select(User.name).where(User.id == r.author_id))) or "Unknown", content=r.content, is_solution=r.is_solution, upvotes=r.upvotes, created_at=r.created_at) for r in replies]
        return ForumTopicResponse(id=topic.id, title=topic.title, content=topic.content, author_name=author or "Unknown", category=topic.category, is_pinned=topic.is_pinned, views=topic.views, tags=topic.tags or [], replies_count=len(reply_list), replies=reply_list, created_at=topic.created_at)

    async def create_reply(self, user_id: int, topic_id: int, data: CreateReplyRequest) -> ForumReplyResponse:
        result = await self.db.execute(select(ForumTopic).where(ForumTopic.id == topic_id))
        topic = result.scalar_one_or_none()
        if not topic: raise HTTPException(status_code=404, detail="Topic not found")
        if topic.is_locked: raise HTTPException(status_code=403, detail="Topic is locked")
        reply = ForumReply(topic_id=topic_id, author_id=user_id, content=data.content)
        self.db.add(reply); await self.db.commit(); await self.db.refresh(reply)
        author = await self.db.scalar(select(User.name).where(User.id == user_id))
        return ForumReplyResponse(id=reply.id, topic_id=reply.topic_id, author_name=author or "Unknown", content=reply.content, is_solution=False, upvotes=0, created_at=reply.created_at)

    # ========== CHAT ==========
    async def get_chat(self, room: str = "global", limit: int = 50) -> list[ChatMessageResponse]:
        result = await self.db.execute(select(ChatMessage).where(ChatMessage.room == room, ChatMessage.is_deleted == False).order_by(ChatMessage.created_at.desc()).limit(limit))
        messages = result.scalars().all()
        return [ChatMessageResponse(id=m.id, sender_name=(await self.db.scalar(select(User.name).where(User.id == m.sender_id))) or "Unknown", content=m.content or "", encrypted_content=m.encrypted_content or "", encryption_key_id=m.encryption_key_id or "", room=m.room, message_type=m.message_type or "text", file_url=m.file_url or "", file_name=m.file_name or "", file_size=m.file_size or "", created_at=m.created_at) for m in reversed(messages)]

    async def send_message(self, user_id: int, data: ChatMessageRequest) -> ChatMessageResponse:
        msg = ChatMessage(sender_id=user_id, content=data.content, room=data.room)
        self.db.add(msg); await self.db.commit(); await self.db.refresh(msg)
        author = await self.db.scalar(select(User.name).where(User.id == user_id))
        return ChatMessageResponse(id=msg.id, sender_name=author or "Unknown", content=msg.content, room=msg.room, message_type="text", created_at=msg.created_at)

    async def upload_file(self, user_id: int, file) -> ChatMessageResponse:
        allowed = ['image/jpeg','image/png','image/gif','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','application/zip']
        if file.content_type not in allowed: raise HTTPException(status_code=400, detail="File type not allowed")
        if file.size > 10*1024*1024: raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        safe = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        with open(os.path.join(UPLOAD_DIR, safe), "wb") as b: shutil.copyfileobj(file.file, b)
        url = f"/static/uploads/chat/{safe}"
        is_img = file.content_type.startswith('image/')
        msg = ChatMessage(sender_id=user_id, content=f"📎 {file.filename}", room="global", message_type="image" if is_img else "file", file_url=url, file_name=file.filename, file_size=f"{file.size/1024:.1f} KB")
        self.db.add(msg); await self.db.commit(); await self.db.refresh(msg)
        author = await self.db.scalar(select(User.name).where(User.id == user_id))
        return ChatMessageResponse(id=msg.id, sender_name=author or "Unknown", content=msg.content, room=msg.room, message_type=msg.message_type, file_url=msg.file_url, file_name=msg.file_name, file_size=msg.file_size, created_at=msg.created_at)

    # ========== E2E ENCRYPTED CHAT ==========
    async def send_encrypted_message(self, user_id: int, data) -> ChatMessageResponse:
        msg = ChatMessage(sender_id=user_id, encrypted_content=json.dumps(data.encrypted_data), encryption_key_id=str(data.recipient_id), content="🔒 Encrypted Message", room="encrypted")
        self.db.add(msg); await self.db.commit(); await self.db.refresh(msg)
        author = await self.db.scalar(select(User.name).where(User.id == user_id))
        return ChatMessageResponse(id=msg.id, sender_name=author or "Unknown", content=msg.content, encrypted_content=msg.encrypted_content, encryption_key_id=msg.encryption_key_id, room=msg.room, created_at=msg.created_at)

    async def get_encrypted_messages(self, user_id: int, other_user_id: int) -> list:
        result = await self.db.execute(select(ChatMessage).where(ChatMessage.room == "encrypted", ((ChatMessage.sender_id == user_id) & (ChatMessage.encryption_key_id == str(other_user_id))) | ((ChatMessage.sender_id == other_user_id) & (ChatMessage.encryption_key_id == str(user_id)))).order_by(ChatMessage.created_at).limit(100))
        return [{"id": m.id, "sender_id": m.sender_id, "encrypted_content": m.encrypted_content, "timestamp": m.created_at.isoformat()} for m in result.scalars().all()]

    async def upload_public_key(self, user_id: int, public_key: str) -> dict:
        if not public_key.startswith("-----BEGIN PUBLIC KEY-----"):
            raise HTTPException(status_code=400, detail="Invalid public key format")
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user: raise HTTPException(status_code=404, detail="User not found")
        user.public_key = public_key; await self.db.commit()
        return {"status": "key_uploaded", "user_id": user_id}

    async def get_public_key(self, user_id: int) -> dict:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user: raise HTTPException(status_code=404, detail="User not found")
        if not user.public_key: return {"error": "No public key found for this user"}
        return {"user_id": user_id, "public_key": user.public_key}

    # ========== GROUPS ==========
    async def get_groups(self) -> list[StudyGroupResponse]:
        result = await self.db.execute(select(StudyGroup).order_by(StudyGroup.created_at.desc()))
        return [StudyGroupResponse(id=g.id, name=g.name, description=g.description or "", topic=g.topic, owner_name=(await self.db.scalar(select(User.name).where(User.id == g.owner_id))) or "Unknown", max_members=g.max_members, is_private=g.is_private, members_count=len(g.members or []), created_at=g.created_at) for g in result.scalars().all()]

    async def create_group(self, user_id: int, data: CreateGroupRequest) -> StudyGroupResponse:
        group = StudyGroup(name=data.name, description=data.description, topic=data.topic, owner_id=user_id, max_members=data.max_members, is_private=data.is_private, members=[user_id])
        self.db.add(group); await self.db.commit(); await self.db.refresh(group)
        owner = await self.db.scalar(select(User.name).where(User.id == user_id))
        return StudyGroupResponse(id=group.id, name=group.name, description=group.description or "", topic=group.topic, owner_name=owner or "Unknown", max_members=group.max_members, is_private=group.is_private, members_count=1, created_at=group.created_at)

    async def join_group(self, user_id: int, group_id: int) -> dict:
        result = await self.db.execute(select(StudyGroup).where(StudyGroup.id == group_id))
        group = result.scalar_one_or_none()
        if not group: raise HTTPException(status_code=404, detail="Group not found")
        members = group.members or []
        if user_id in members: return {"message": "Already a member"}
        if len(members) >= group.max_members: raise HTTPException(status_code=400, detail="Group is full")
        members.append(user_id); group.members = members; await self.db.commit()
        return {"message": "Joined group", "members_count": len(members)}