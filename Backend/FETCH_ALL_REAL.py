import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from app.core.database import AsyncSessionLocal
from app.models.job import Job
from app.models.news import NewsArticle
from app.models.content import TechBlog, TechTool, TechNews
from app.models.topic import Topic
from app.models.problem import Problem
from app.models.project import Project
from app.models.music import MusicPlaylist
from sqlalchemy import select, func

async def fetch_and_store_everything():
    async with AsyncSessionLocal() as db:
        
        # ========== 1. FETCH REAL JOBS (Remotive API - FREE) ==========
        print('📡 Fetching real jobs from Remotive...')
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=50', timeout=30)
                if resp.status_code == 200:
                    jobs = resp.json().get('jobs', [])
                    saved = 0
                    for j in jobs:
                        url = j.get('url', '')
                        if not url:
                            continue
                        exists = await db.scalar(select(Job).where(Job.source_url == url))
                        if not exists:
                            db.add(Job(
                                title=j.get('title',''),
                                company=j.get('company_name',''),
                                company_logo=j.get('company_logo_url',''),
                                location=j.get('candidate_required_location','Remote'),
                                salary=j.get('salary',''),
                                description=(j.get('description','') or '')[:1000],
                                tags=j.get('tags',[]),
                                remote=True,
                                source='remotive',
                                source_url=url,
                                posted_at=datetime.now(),
                                expires_at=datetime.now() + timedelta(days=7),
                            ))
                            saved += 1
                    await db.commit()
                    print(f'✅ {saved} real jobs saved')
        except Exception as e:
            print(f'⚠️ Jobs fetch failed: {e}')

        # ========== 2. FETCH REAL NEWS (Hacker News + Dev.to - FREE) ==========
        print('📡 Fetching real news from Hacker News + Dev.to...')
        saved_news = 0
        
        # Hacker News
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get('https://hacker-news.firebaseio.com/v0/topstories.json', timeout=30)
                if resp.status_code == 200:
                    ids = resp.json()[:20]
                    for sid in ids[:15]:
                        try:
                            sr = await client.get(f'https://hacker-news.firebaseio.com/v0/item/{sid}.json', timeout=10)
                            if sr.status_code == 200:
                                story = sr.json()
                                if story and story.get('title'):
                                    surl = story.get('url', f'https://news.ycombinator.com/item?id={sid}')
                                    exists = await db.scalar(select(NewsArticle).where(NewsArticle.source_url == surl))
                                    if not exists:
                                        db.add(NewsArticle(
                                            title=story.get('title',''),
                                            summary=(story.get('text') or '')[:500],
                                            source='Hacker News',
                                            source_url=surl,
                                            category='tech',
                                            tags=['hackernews','tech'],
                                            read_time='5 min',
                                            published_at=datetime.now(),
                                        ))
                                        saved_news += 1
                        except:
                            continue
        except Exception as e:
            print(f'⚠️ HN fetch failed: {e}')

        # Dev.to
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get('https://dev.to/api/articles?tag=programming&per_page=30', timeout=30)
                if resp.status_code == 200:
                    articles = resp.json()
                    for a in articles:
                        surl = a.get('url','')
                        if not surl:
                            continue
                        exists = await db.scalar(select(NewsArticle).where(NewsArticle.source_url == surl))
                        if not exists:
                            db.add(NewsArticle(
                                title=a.get('title',''),
                                summary=(a.get('description') or '')[:500],
                                source='Dev.to',
                                source_url=surl,
                                category='tech',
                                tags=a.get('tag_list',[]),
                                read_time=f"{a.get('reading_time_minutes',5)} min",
                                published_at=datetime.now(),
                            ))
                            saved_news += 1
        except Exception as e:
            print(f'⚠️ Dev.to fetch failed: {e}')
        
        await db.commit()
        print(f'✅ {saved_news} real news articles saved')

        # ========== 3. FETCH TECH BLOGS (Dev.to - FREE) ==========
        print('📡 Fetching tech blogs from Dev.to...')
        saved_blogs = 0
        tags = ['javascript','python','react','webdev','ai']
        try:
            async with httpx.AsyncClient() as client:
                for tag in tags:
                    resp = await client.get(f'https://dev.to/api/articles?tag={tag}&per_page=10', timeout=30)
                    if resp.status_code == 200:
                        for a in resp.json():
                            surl = a.get('url','')
                            if not surl:
                                continue
                            exists = await db.scalar(select(TechBlog).where(TechBlog.source_url == surl))
                            if not exists:
                                db.add(TechBlog(
                                    title=a.get('title',''),
                                    summary=(a.get('description') or '')[:500],
                                    content=(a.get('body_html') or a.get('description') or '')[:5000],
                                    author=a.get('user',{}).get('name','Unknown'),
                                    source=f'Dev.to ({tag})',
                                    source_url=surl,
                                    category=tag,
                                    tags=a.get('tag_list',[]),
                                    language=tag,
                                    read_time=f"{a.get('reading_time_minutes',5)} min",
                                    published_at=datetime.now(),
                                ))
                                saved_blogs += 1
            await db.commit()
            print(f'✅ {saved_blogs} tech blogs saved')
        except Exception as e:
            print(f'⚠️ Blogs fetch failed: {e}')

        # ========== 4. FETCH TECH TOOLS (GitHub API - FREE) ==========
        print('📡 Fetching trending tools from GitHub...')
        saved_tools = 0
        languages = ['javascript','python','typescript']
        try:
            async with httpx.AsyncClient() as client:
                for lang in languages:
                    resp = await client.get(
                        f'https://api.github.com/search/repositories?q=language:{lang}+stars:>50&sort=stars&order=desc&per_page=10',
                        headers={'Accept':'application/vnd.github.v3+json'},
                        timeout=30,
                    )
                    if resp.status_code == 200:
                        for r in resp.json().get('items',[]):
                            gurl = r.get('html_url','')
                            if not gurl:
                                continue
                            exists = await db.scalar(select(TechTool).where(TechTool.url == gurl))
                            if not exists:
                                db.add(TechTool(
                                    name=r.get('full_name',''),
                                    description=(r.get('description') or '')[:500],
                                    category=f'language-{lang}',
                                    url=gurl,
                                    github_url=gurl,
                                    pricing='free',
                                    features=[f"⭐ {r.get('stargazers_count',0)} stars"],
                                    tags=r.get('topics',[]),
                                    language=lang,
                                    stars=r.get('stargazers_count',0),
                                    rating=min(5, r.get('stargazers_count',0)//1000),
                                    logo_url=r.get('owner',{}).get('avatar_url',''),
                                    is_open_source=True,
                                ))
                                saved_tools += 1
            await db.commit()
            print(f'✅ {saved_tools} tech tools saved')
        except Exception as e:
            print(f'⚠️ Tools fetch failed: {e}')

        # ========== 5. SEED STATIC CONTENT (if empty) ==========
        if await db.scalar(select(func.count(Topic.id))) == 0:
            db.add_all([
                Topic(title='Variables & Data Types',slug='variables',language='javascript',category='fundamentals',difficulty='beginner',order=1,icon='📦',xp_reward=100),
                Topic(title='Functions & Scope',slug='functions',language='javascript',category='fundamentals',difficulty='beginner',order=2,icon='⚡',xp_reward=150),
                Topic(title='Arrays & Objects',slug='arrays',language='javascript',category='data-structures',difficulty='intermediate',order=3,icon='📚',xp_reward=200),
                Topic(title='Async Programming',slug='async',language='javascript',category='advanced',difficulty='advanced',order=4,icon='⏳',xp_reward=300),
                Topic(title='Python Basics',slug='python-basics',language='python',category='fundamentals',difficulty='beginner',order=1,icon='🐍',xp_reward=100),
                Topic(title='React Fundamentals',slug='react',language='javascript',category='frontend',difficulty='intermediate',order=5,icon='⚛️',xp_reward=250),
                Topic(title='Node.js Basics',slug='nodejs',language='javascript',category='backend',difficulty='intermediate',order=6,icon='🟢',xp_reward=200),
                Topic(title='Database Design',slug='databases',language='sql',category='databases',difficulty='intermediate',order=7,icon='🗄️',xp_reward=200),
            ])
            print('✅ Topics seeded')

        if await db.scalar(select(func.count(Problem.id))) == 0:
            db.add_all([
                Problem(title='Two Sum',slug='two-sum',description='Find two numbers that sum to target.',difficulty='easy',category='algorithms',language='javascript',starter_code='function twoSum(nums,target){\n  // Your code here\n}',xp_reward=100),
                Problem(title='FizzBuzz',slug='fizzbuzz',description='Multiples of 3 and 5.',difficulty='easy',category='algorithms',language='python',starter_code='def fizzbuzz(n):\n    pass',xp_reward=75),
                Problem(title='Palindrome',slug='palindrome',description='Check if string is palindrome.',difficulty='easy',category='algorithms',language='python',starter_code='def is_palindrome(s):\n    pass',xp_reward=100),
                Problem(title='Binary Search',slug='binary-search',description='Implement binary search.',difficulty='medium',category='algorithms',language='javascript',starter_code='function binarySearch(arr,target){\n  // Your code here\n}',xp_reward=200),
                Problem(title='Reverse String',slug='reverse-string',description='Reverse a given string.',difficulty='easy',category='algorithms',language='javascript',starter_code='function reverse(str){\n  // Your code here\n}',xp_reward=50),
            ])
            print('✅ Problems seeded')

        if await db.scalar(select(func.count(Project.id))) == 0:
            db.add_all([
                Project(title='Todo App',slug='todo-app',description='Full CRUD todo application.',level=1,category='frontend',language='javascript',requirements=['Add/Delete','Mark complete','Save to localStorage'],xp_reward=500,estimated_hours=5),
                Project(title='Weather Dashboard',slug='weather',description='Fetch and display weather data.',level=2,category='frontend',language='javascript',requirements=['API integration','Search city','Error handling'],xp_reward=750,estimated_hours=8),
                Project(title='REST API',slug='rest-api',description='Build a RESTful API.',level=3,category='backend',language='python',requirements=['CRUD operations','Database','Validation'],xp_reward=1000,estimated_hours=10),
            ])
            print('✅ Projects seeded')

        if await db.scalar(select(func.count(MusicPlaylist.id))) == 0:
            db.add_all([
                MusicPlaylist(name="Deep Focus",category="focus",tracks=[
                    {"title":"Ambient Study","url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3","duration":"4:12"},
                    {"title":"Calm Piano","url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3","duration":"5:30"},
                ]),
                MusicPlaylist(name="Coding Session",category="coding",tracks=[
                    {"title":"Electronic Focus","url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3","duration":"4:00"},
                ]),
            ])
            print('✅ Music seeded')

        await db.commit()
    
    print('\n🎉 COMPLETE! All data from FREE APIs stored in your database forever!')
    print('📰 News: Hacker News + Dev.to (real)')
    print('💼 Jobs: Remotive (real)')
    print('📝 Blogs: Dev.to (real)')
    print('🛠️ Tools: GitHub Trending (real)')
    print('📚 Topics: 8 (curated)')
    print('🏆 Problems: 5 (curated)')
    print('💻 Projects: 3 (curated)')
    print('🎵 Music: 2 playlists (free URLs)')
    print('🚀 Start server and everything works!')

asyncio.run(fetch_and_store_everything())
