import asyncio
from app.core.database import engine, Base
from app.models.user import User
from app.models.topic import Topic, Lesson, UserProgress
from app.models.problem import Problem, Submission
from app.models.project import Project, ProjectSubmission
from app.models.assignment import Assignment
from app.models.roadmap import RoadmapDay
from app.models.job import Job
from app.models.news import NewsArticle
from app.models.community import ForumTopic, ForumReply, StudyGroup, ChatMessage
from app.models.settings import UserSettings
from app.models.lockscreen import FocusSession, LockdownState
from app.models.notification import Notification
from app.models.music import MusicPlaylist
from app.models.payment import Payment
from app.models.content import TechBlog, TechTool, TechNews

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('All tables created!')

asyncio.run(init())
