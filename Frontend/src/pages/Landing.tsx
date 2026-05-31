import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import {
  Play, ArrowRight, Sparkles, Trophy, Code, CheckCircle,
  Briefcase, Terminal, Zap, Star, ChevronRight, BookOpen,
  MessageSquare, GitBranch, Cloud, Database, Rocket, Brain,
  FileCode, FolderKanban, Sun, Moon, Loader2, Sunrise,
  LayoutDashboard, LogOut, Music, Pause, ChevronDown, X, Heart
} from 'lucide-react';
import { authService } from '../services/authService';
import { topicService } from '../services/topicService';
import { jobService } from '../services/jobService';

interface UserStats { xp: number; level: number; streak: number; problemsSolved: number; projectsCompleted: number; focusHours: number; longestStreak: number; rank: string; }
interface Topic { id: number; title: string; slug: string; language: string; category: string; difficulty: string; icon: string; xp_reward: number; }
interface Job { id: number; title: string; company: string; location: string; salary: string; remote: boolean; tags: string[]; }
type Theme = 'dark' | 'light';

const lofiTracks = [
  { id: '1', name: 'Lofi Study Beats', artist: 'CodeMaster FM', duration: '3:45' },
  { id: '2', name: 'Chill Coding Vibes', artist: 'LoFi Girl', duration: '4:20' },
  { id: '3', name: 'Deep Focus', artist: 'Brain.fm', duration: '5:10' },
  { id: '4', name: 'Night Owl', artist: 'Chillhop', duration: '3:30' },
];

const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[{ size: 300, color: 'from-primary/15 to-blue-500/8', x: '10%', y: '20%', delay: 0 },{ size: 200, color: 'from-purple-500/10 to-pink-500/8', x: '85%', y: '60%', delay: 2 },{ size: 250, color: 'from-cyan-500/10 to-teal-500/8', x: '50%', y: '80%', delay: 4 }].map((o, i) => (
      <motion.div key={i} animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 20 + i * 5, repeat: Infinity, delay: o.delay, ease: 'linear' }} className={`absolute rounded-full bg-gradient-to-br ${o.color} blur-3xl`} style={{ width: o.size, height: o.size, left: o.x, top: o.y, transform: 'translate(-50%, -50%)' }} />
    ))}
  </div>
);

const AnimatedCounter = ({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0); const ref = useRef(null); const isInView = useInView(ref);
  useEffect(() => { if (!isInView) return; let s = 0; const e = value; const inc = e / (duration * 60); const t = setInterval(() => { s += inc; if (s >= e) { setCount(e); clearInterval(t); } else setCount(Math.floor(s)); }, 1000 / 60); return () => clearInterval(t); }, [isInView, value, duration]);
  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
};

const CodeRain = () => {
  const snips = ['const app = express();', 'def fibonacci(n):', 'SELECT * FROM users', 'use std::collections::HashMap;', 'function useState<T>(init)', 'class NeuralNetwork:', 'docker-compose up -d', 'npm install --save react'];
  return (<div className="absolute inset-0 overflow-hidden pointer-events-none">{Array.from({ length: 15 }).map((_, i) => (<motion.div key={i} initial={{ x: Math.random() * window.innerWidth, y: -50, opacity: 0 }} animate={{ y: window.innerHeight + 50, opacity: [0, 0.2, 0.15, 0] }} transition={{ duration: 10 + Math.random() * 15, repeat: Infinity, delay: Math.random() * 10, ease: 'linear' }} className="absolute text-xs font-mono text-primary/15 whitespace-nowrap" style={{ left: `${Math.random() * 100}%` }}>{snips[i % snips.length]}</motion.div>))}</div>);
};

const DashboardView = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { const h = new Date().getHours(); if (h < 12) setGreeting('Good Morning'); else if (h < 17) setGreeting('Good Afternoon'); else setGreeting('Good Evening'); loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true); setError('');
    try {
      const [p, t, j] = await Promise.allSettled([authService.getProfile(), topicService.getAll(), jobService.getAll()]);
      if (p.status === 'fulfilled' && p.value) { const u: any = p.value; setStats({ xp: u.xp || 0, level: u.level || 1, streak: u.streak || 0, problemsSolved: u.problems_solved || 0, projectsCompleted: u.projects_completed || 0, focusHours: u.focus_hours || 0, longestStreak: u.longest_streak || 0, rank: u.rank || 'Beginner' }); }
      if (t.status === 'fulfilled' && (t.value as any)?.topics) setTopics((t.value as any).topics.slice(0, 6));
      if (j.status === 'fulfilled' && (j.value as any)?.jobs) setJobs((j.value as any).jobs.slice(0, 4));
    } catch { setError('Failed to load dashboard data'); } finally { setLoading(false); }
  };

  const getGreetingIcon = () => { const h = new Date().getHours(); if (h < 12) return <Sunrise className="w-5 h-5 text-yellow-400" />; if (h < 17) return <Sun className="w-5 h-5 text-orange-400" />; return <Moon className="w-5 h-5 text-blue-400" />; };
  const userName = authService.getCurrentUser()?.name || 'Developer';
  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">{getGreetingIcon()}<div><h1 className="text-2xl md:text-3xl font-bold">{greeting}, {userName}!</h1><p className="text-slate-400 text-sm">Let's crush some code today 🚀</p></div></div>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => navigate('/playground')} className="gap-1.5"><Terminal className="w-4 h-4" />Playground</Button><Button size="sm" onClick={() => navigate('/problems')} className="gap-1.5"><Play className="w-4 h-4" />Start Coding</Button></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ icon: Trophy, label: 'Total XP', value: stats.xp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },{ icon: Star, label: 'Day Streak', value: stats.streak, color: 'text-orange-400', bg: 'bg-orange-500/10' },{ icon: Code, label: 'Problems Solved', value: stats.problemsSolved, color: 'text-blue-400', bg: 'bg-blue-500/10' },{ icon: FolderKanban, label: 'Projects', value: stats.projectsCompleted, color: 'text-purple-400', bg: 'bg-purple-500/10' }].map((s, i) => (
              <Card key={i} variant="glass" className="p-4 border-white/10"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div><div><p className="text-2xl font-bold"><AnimatedCounter value={s.value} /></p><p className="text-xs text-slate-400">{s.label}</p></div></div></Card>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="glass" className="p-5 border-white/10">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" />Learning Topics</h3><Button variant="ghost" size="sm" onClick={() => navigate('/learning')}>View All <ChevronRight className="w-3 h-3 ml-1" /></Button></div>
            {topics.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No topics yet.</p> : <div className="space-y-2">{topics.map(t => (<div key={t.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer" onClick={() => navigate(`/learning/${t.slug}`)}><span className="text-xl">{t.icon}</span><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{t.title}</p><p className="text-xs text-slate-400">{t.language} • {t.difficulty}</p></div><Badge variant="warning" size="sm">+{t.xp_reward} XP</Badge></div>))}</div>}
          </Card>
          <Card variant="glass" className="p-5 border-white/10">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-green-400" />Latest Jobs</h3><Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>View All <ChevronRight className="w-3 h-3 ml-1" /></Button></div>
            {jobs.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No jobs yet.</p> : <div className="space-y-2">{jobs.map(j => (<div key={j.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer" onClick={() => navigate(`/jobs/${j.id}`)}><div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">🏢</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{j.title}</p><p className="text-xs text-slate-400">{j.company} • {j.location} {j.remote && '• 🌍 Remote'}</p></div>{j.salary && <Badge variant="success" size="sm">{j.salary}</Badge>}</div>))}</div>}
          </Card>
        </div>
        <Card variant="glass" className="p-5 border-white/10">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-yellow-400" />Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[{ icon: Terminal, label: 'Playground', path: '/playground', color: 'text-blue-400' },{ icon: FileCode, label: 'Problems', path: '/problems', color: 'text-green-400' },{ icon: FolderKanban, label: 'Projects', path: '/projects', color: 'text-purple-400' },{ icon: MessageSquare, label: 'AI Tutor', path: '/learning', color: 'text-pink-400' }].map((l, i) => (<button key={i} onClick={() => navigate(l.path)} className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors text-sm"><l.icon className={`w-4 h-4 ${l.color}`} />{l.label}<ArrowRight className="w-3 h-3 ml-auto text-slate-600" /></button>))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const LandingView = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <FloatingOrbs /><CodeRain />
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <Badge variant="info" size="sm" className="mb-6"><Sparkles className="w-3 h-3 mr-1" />AI-Powered Code Review</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight"><span className="bg-gradient-to-r from-white via-primary to-blue-400 bg-clip-text text-transparent">Master Code.</span><br /><span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Build the Future.</span></h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">Interactive playgrounds, AI-powered learning, and real-world projects.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4"><Button size="lg" className="gap-2 text-lg px-8 shadow-glow group"><Play className="w-5 h-5" />Start Coding Free<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Button></div>
        </motion.div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"><ChevronDown className="w-6 h-6" /></motion.div>
      </section>

      {/* TECH STACK MARQUEE */}
      <section className="border-y border-white/10 bg-white/[0.02]"><div className="relative overflow-hidden py-4"><motion.div animate={{ x: [0, -1920] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-8 whitespace-nowrap">{[{ name: 'React', icon: '⚛️' },{ name: 'TypeScript', icon: '💪' },{ name: 'Python', icon: '🐍' },{ name: 'Node.js', icon: '💚' },{ name: 'Docker', icon: '🐳' },{ name: 'Kubernetes', icon: '☸️' },{ name: 'AWS', icon: '☁️' },{ name: 'Rust', icon: '🦀' }].map((t, i) => (<div key={i} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10"><span className="text-xl">{t.icon}</span><span className="text-sm font-medium text-slate-300">{t.name}</span></div>))}</motion.div></div></section>

      {/* FEATURES */}
      <section className="py-24 px-4"><div className="max-w-7xl mx-auto"><motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16"><Badge variant="info" size="sm" className="mb-4">Features</Badge><h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Excel</span></h2></motion.div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[{ icon: Terminal, title: 'Polyglot Playground', desc: '12+ languages', gradient: 'from-blue-500 to-cyan-500' },{ icon: Brain, title: 'AI Code Review', desc: 'Instant feedback', gradient: 'from-purple-500 to-pink-500' },{ icon: Trophy, title: 'Gamified Learning', desc: 'XP & streaks', gradient: 'from-yellow-500 to-orange-500' },{ icon: GitBranch, title: 'Version Control', desc: 'Built-in Git', gradient: 'from-green-500 to-emerald-500' },{ icon: Cloud, title: 'Cloud IDE', desc: 'No setup', gradient: 'from-cyan-500 to-blue-500' },{ icon: Database, title: 'Full-Stack', desc: 'Build apps', gradient: 'from-red-500 to-pink-500' }].map((f, i) => (<motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} whileHover={{ y: -8 }}><Card variant="glass" className="p-6 h-full border-white/10"><div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}><f.icon className="w-7 h-7 text-white" /></div><h3 className="text-xl font-bold mb-2">{f.title}</h3><p className="text-slate-400 text-sm">{f.desc}</p></Card></motion.div>))}</div></div></section>

      {/* PRICING */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/10"><div className="max-w-7xl mx-auto"><motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16"><Badge variant="success" size="sm" className="mb-4">Pricing</Badge><h2 className="text-4xl md:text-5xl font-bold mb-4">Start Free, Scale as You <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Grow</span></h2></motion.div><div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">{[{ name: 'Starter', price: '$0', period: 'forever', features: ['5 problems/day', 'Basic playground'], hl: false },{ name: 'Pro', price: '$29', period: 'month', features: ['Unlimited problems', 'AI code review', 'Private projects'], hl: true },{ name: 'Enterprise', price: '$99', period: 'month', features: ['Everything in Pro', 'SSO', 'API access'], hl: false }].map((p, i) => (<motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative">{p.hl && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"><Badge variant="success" size="sm">Most Popular</Badge></div>}<Card variant={p.hl ? 'glass' : 'default'} className={`p-6 h-full ${p.hl ? 'border-primary/50 bg-primary/5' : 'border-white/10'}`}><h3 className="text-lg font-bold mb-2">{p.name}</h3><div className="mb-4"><span className="text-4xl font-bold">{p.price}</span><span className="text-slate-400">/{p.period}</span></div><ul className="space-y-3 mb-6">{p.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />{f}</li>))}</ul><Button variant={p.hl ? 'default' : 'outline'} size="lg" className="w-full">Get Started</Button></Card></motion.div>))}</div></div></section>

      {/* CTA */}
      <section className="py-24 px-4"><div className="max-w-4xl mx-auto text-center"><motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="p-12 rounded-3xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30"><h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Level Up?</h2><p className="text-lg text-slate-300 mb-8">Join 150,000+ developers building better software.</p><Button size="lg" className="gap-2 text-lg px-8 shadow-glow"><Rocket className="w-5 h-5" />Get Started Free<ArrowRight className="w-5 h-5" /></Button></motion.div></div></section>

      <footer className="border-t border-white/10 py-12 px-4"><div className="max-w-7xl mx-auto text-center"><p className="text-sm text-slate-500">© {new Date().getFullYear()} CodeMaster. Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> by developers</p></div></footer>
    </div>
  );
};

const ThemeToggle = ({ theme, onToggle }: { theme: Theme; onToggle: () => void }) => (
  <motion.button whileTap={{ scale: 0.9 }} onClick={onToggle} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</motion.button>
);

const MusicPanel = ({ isOpen, onClose, isPlaying, onTogglePlay, volume, onVolumeChange, currentTrack }: { isOpen: boolean; onClose: () => void; isPlaying: boolean; onTogglePlay: () => void; volume: number; onVolumeChange: (v: number) => void; currentTrack: string; }) => (
  <AnimatePresence>{isOpen && (<motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 288, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 border-l border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl overflow-hidden"><div className="w-72 h-full flex flex-col p-4"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Music className="w-4 h-4 text-primary" />Focus Beats</h3><button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-slate-400"><X className="w-4 h-4" /></button></div><div className="text-center mb-4"><div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-500 mx-auto mb-3 flex items-center justify-center"><Music className="w-10 h-10 text-white" /></div><p className="text-sm font-medium">{currentTrack}</p></div><div className="flex items-center justify-center gap-4 mb-4"><button onClick={onTogglePlay} className="p-3 bg-primary rounded-full text-white">{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button></div><input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-full" /><div className="space-y-2 mt-4">{lofiTracks.map(t => (<div key={t.id} className={`p-3 rounded-lg cursor-pointer ${currentTrack===t.name?'bg-primary/10 border border-primary/30':'hover:bg-white/5'}`}><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-slate-400">{t.artist} • {t.duration}</p></div>))}</div></div></motion.div>)}</AnimatePresence>
);

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [musicPanelOpen, setMusicPanelOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [currentTrack] = useState(lofiTracks[0].name);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => { setIsAuthenticated(authService.isAuthenticated()); const h = () => setScrolled(window.scrollY > 50); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { document.documentElement.classList.toggle('light', theme === 'light'); }, [theme]);

  const handleLogout = () => { authService.logout(); setIsAuthenticated(false); };

  return (
    <div className={`min-h-screen flex flex-col ${theme==='light'?'bg-white text-gray-900':'bg-[#0a0a0f] text-white'}`}>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className={`sticky top-0 z-50 transition-all ${scrolled?(theme==='light'?'bg-white/90 backdrop-blur-xl border-b border-gray-200':'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10'):'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center"><Code className="w-5 h-5 text-white" /></div><span className="font-bold text-lg hidden sm:block">CodeMaster</span></div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={()=>setTheme(t=>t==='dark'?'light':'dark')} />
            <Button size="sm" variant="outline" onClick={()=>setMusicPanelOpen(true)} className="gap-1.5"><Music className="w-4 h-4" />Music</Button>
            <Button size="sm" variant="outline" onClick={()=>navigate('/plans')} className="gap-1.5"><LayoutDashboard className="w-4 h-4" />Plans</Button>
            {isAuthenticated ? <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><LogOut className="w-4 h-4" />Logout</button> : <Button size="sm" onClick={()=>setIsAuthenticated(true)}>Sign In</Button>}
          </div>
        </div></div>
      </motion.nav>
      <div className="flex-1 flex min-h-0"><div className="flex-1 flex flex-col min-w-0 overflow-y-auto">{isAuthenticated?<DashboardView/>:<LandingView/>}</div><MusicPanel isOpen={musicPanelOpen} onClose={()=>setMusicPanelOpen(false)} isPlaying={musicPlaying} onTogglePlay={()=>setMusicPlaying(!musicPlaying)} volume={musicVolume} onVolumeChange={setMusicVolume} currentTrack={currentTrack}/></div>
    </div>
  );
}