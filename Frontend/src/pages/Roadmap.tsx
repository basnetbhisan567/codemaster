import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, CheckCircle2, 
  Circle, Play, Code, Eye, Clock, Bell, BellRing,
  Settings, X, Sparkles, Trophy, Star, Zap,
  ArrowRight, BookOpen, Lightbulb, Timer, Flame,
  Mail, Smartphone, BellDot, BellOff, Sun, Moon,
  Sunrise, Sunset, Coffee, Plus, Wand2, Target,
  ListOrdered, CalendarDays, Hash, Send, Phone,
  AlertCircle, Loader2, Check, Edit3, Trash2,
  Lock, Unlock, ExternalLink
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';

// ============================================
// TYPES
// ============================================
interface CodeSnippet {
  basic: string;
  advanced: string;
}

interface RoadmapDay {
  id: string;
  day: number;
  title: string;
  basic: string;
  advanced: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  snippet: CodeSnippet;
  xpReward: number;
  estimatedTime: string;
  category: string;
  icon: string;
  scheduledDate: Date;
  completedAt?: Date;
}

interface NotificationPrefs {
  morningTask: boolean;
  eveningPreview: boolean;
  afternoonNudge: boolean;
  streakReminder: boolean;
  channel: 'email' | 'sms' | 'both';
  phoneNumber?: string;
  secondaryEmail?: string;
}

interface RoadmapGeneratorInput {
  language: string;
  topic: string;
  duration: number;
  intensity: 'basic-only' | 'basic-advanced' | 'full';
  startDate: Date;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Dynamically calculate dates starting from today
const generateDates = (totalDays: number): Date[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });
};

// Get tomorrow's task
const getTomorrowTask = (roadmap: RoadmapDay[]): RoadmapDay | null => {
  const currentDay = roadmap.find(d => d.status === 'current');
  if (!currentDay) return null;
  return roadmap.find(d => d.day === currentDay.day + 1) || null;
};

// Get today's task
const getTodayTask = (roadmap: RoadmapDay[]): RoadmapDay | null => {
  return roadmap.find(d => d.status === 'current') || null;
};

// Split topic into daily roadmap with dynamic dates
const generateRoadmapFromTopic = (input: RoadmapGeneratorInput): RoadmapDay[] => {
  const topics = input.topic
    .split(/[,;\n]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  if (topics.length === 0) return [];

  const dates = generateDates(input.duration);
  const roadmap: RoadmapDay[] = [];

  for (let i = 0; i < input.duration; i++) {
    const basicTopic = topics[i % topics.length] || `Day ${i + 1} Topic`;
    const advancedTopic = topics[(i + 1) % topics.length] || `${basicTopic} Advanced`;
    const categoryIcons = ['🎯', '📚', '⚡', '🌐', '⏳', '🚀', '🏆', '💡', '🔧', '🎨'];
    
    roadmap.push({
      id: `gen-${Date.now()}-${i}`,
      day: i + 1,
      title: `Day ${i + 1}: ${basicTopic}`,
      basic: basicTopic,
      advanced: input.intensity === 'basic-only' ? 'Review & Practice' : advancedTopic,
      status: i === 0 ? 'current' : i === 1 ? 'upcoming' : 'locked',
      snippet: {
        basic: `// ${basicTopic}\n// Start coding here...\n\nfunction example() {\n  // TODO: Implement ${basicTopic}\n  console.log("Learning: ${basicTopic}");\n}\n\nexample();`,
        advanced: `// ${advancedTopic} - Advanced\n// Challenge yourself!\n\nfunction advancedExample() {\n  // Research and implement:\n  // ${advancedTopic}\n  \n  return "Mastered: ${advancedTopic}";\n}\n\nconsole.log(advancedExample());`,
      },
      xpReward: 100 + (i * 25),
      estimatedTime: `${30 + (i * 10)} min`,
      category: 'custom',
      icon: categoryIcons[i % categoryIcons.length],
      scheduledDate: dates[i],
    });
  }

  return roadmap;
};

// ============================================
// DEFAULT DATA
// ============================================
const createDefaultRoadmap = (): RoadmapDay[] => {
  const dates = generateDates(5);
  return [
    {
      id: 'd1', day: 1, title: 'Variables & Scope',
      basic: 'Variables & Data Types', advanced: 'Closure & Hoisting',
      status: 'completed', completedAt: new Date(Date.now() - 86400000),
      snippet: { basic: 'let name = "John";\nconst age = 25;\nconsole.log(`Hello, ${name}!`);', advanced: 'function outer() {\n  let count = 0;\n  return () => ++count;\n}' },
      xpReward: 100, estimatedTime: '45 min', category: 'fundamentals', icon: '📦', scheduledDate: dates[0],
    },
    {
      id: 'd2', day: 2, title: 'Arrays & Objects',
      basic: 'Arrays & Object Basics', advanced: 'Destructuring & Spread',
      status: 'current',
      snippet: { basic: 'const arr = [1, 2, 3];\narr.push(4);', advanced: 'const [first, ...rest] = [1, 2, 3];' },
      xpReward: 150, estimatedTime: '60 min', category: 'data-structures', icon: '📚', scheduledDate: dates[1],
    },
    {
      id: 'd3', day: 3, title: 'Functions Deep Dive',
      basic: 'Function Basics', advanced: 'Higher-Order Functions',
      status: 'upcoming',
      snippet: { basic: 'function greet(name) {\n  return `Hello, ${name}!`;\n}', advanced: 'const compose = (f, g) => x => f(g(x));' },
      xpReward: 200, estimatedTime: '90 min', category: 'functions', icon: '⚡', scheduledDate: dates[2],
    },
    {
      id: 'd4', day: 4, title: 'DOM Manipulation',
      basic: 'Selecting Elements', advanced: 'Event Delegation',
      status: 'locked',
      snippet: { basic: 'document.querySelector("h1").textContent = "Hello!";', advanced: 'document.body.addEventListener("click", e => {\n  if (e.target.matches(".btn")) handleClick(e);\n});' },
      xpReward: 175, estimatedTime: '75 min', category: 'fundamentals', icon: '🌐', scheduledDate: dates[3],
    },
    {
      id: 'd5', day: 5, title: 'Async JavaScript',
      basic: 'Callbacks & Promises', advanced: 'Async/Await',
      status: 'locked',
      snippet: { basic: 'fetch("/api/data").then(r => r.json()).then(console.log);', advanced: 'async function fetchData() {\n  const res = await fetch("/api/data");\n  return res.json();\n}' },
      xpReward: 250, estimatedTime: '120 min', category: 'async', icon: '⏳', scheduledDate: dates[4],
    },
  ];
};

// ============================================
// ROADMAP GENERATOR MODAL
// ============================================
const RoadmapGeneratorModal = ({
  onGenerate,
  onClose,
}: {
  onGenerate: (input: RoadmapGeneratorInput) => void;
  onClose: () => void;
}) => {
  const [language, setLanguage] = useState('javascript');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(7);
  const [intensity, setIntensity] = useState<'basic-only' | 'basic-advanced' | 'full'>('basic-advanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '📜', color: 'from-yellow-400 to-yellow-600' },
    { id: 'python', name: 'Python', icon: '🐍', color: 'from-blue-400 to-blue-600' },
    { id: 'java', name: 'Java', icon: '☕', color: 'from-red-400 to-red-600' },
    { id: 'cpp', name: 'C++', icon: '⚡', color: 'from-purple-400 to-purple-600' },
    { id: 'rust', name: 'Rust', icon: '🦀', color: 'from-orange-400 to-orange-600' },
    { id: 'typescript', name: 'TypeScript', icon: '💪', color: 'from-blue-400 to-blue-600' },
  ];

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate({ language, topic, duration, intensity, startDate: new Date() });
      setIsGenerating(false);
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="max-w-xl w-full glass-heavy rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            Generate Your Learning Path
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Step {step} of 3: {step === 1 ? 'Choose your language' : step === 2 ? 'Define your topics' : 'Set duration & intensity'}
          </p>
        </div>

        {/* Step 1: Language */}
        {step === 1 && (
          <div className="p-6">
            <label className="text-sm font-medium mb-3 block">What do you want to learn?</label>
            <div className="grid grid-cols-2 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => { setLanguage(lang.id); setStep(2); }}
                  className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                    language === lang.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-3xl block mb-2">{lang.icon}</span>
                  <p className="font-medium text-sm">{lang.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Topics */}
        {step === 2 && (
          <div className="p-6">
            <label className="text-sm font-medium mb-2 block">
              What topics do you want to cover?
            </label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={`Paste your syllabus or list topics...\n\nExamples:\n• Variables & Data Types\n• Functions & Scope\n• Arrays & Objects\n• DOM Manipulation\n• Async Programming\n• Error Handling\n• ES6+ Features`}
              className="w-full h-44 bg-background border border-border rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-primary font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Separate topics with commas, new lines, or bullet points
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} disabled={!topic.trim()} className="flex-1">Next</Button>
            </div>
          </div>
        )}

        {/* Step 3: Duration & Intensity */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Duration: <span className="text-primary font-bold">{duration} days</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[3, 5, 7, 10, 14, 21, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                      duration === d ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Intensity Level</label>
              <div className="space-y-2">
                {[
                  { id: 'basic-only' as const, label: '🌱 Beginner', desc: '1 topic per day - Gentle learning curve', time: '20-30 min/day' },
                  { id: 'basic-advanced' as const, label: '⚡ Standard', desc: 'Basic + Advanced concepts daily', time: '45-60 min/day' },
                  { id: 'full' as const, label: '🚀 Intensive', desc: 'Full theory + practice + projects', time: '90-120 min/day' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setIntensity(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      intensity === opt.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{opt.label}</p>
                      <Badge variant="info" size="sm">{opt.time}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {isGenerating ? 'Creating...' : 'Generate Roadmap'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ============================================
// CODE SNIPPET MODAL
// ============================================
const SnippetModal = ({ day, onClose }: { day: RoadmapDay; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="max-w-3xl w-full glass-heavy rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">Day {day.day}: {day.title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        <div className="flex border-b border-white/10">
          {(['basic', 'advanced'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-white'
              }`}
            >
              {tab === 'basic' ? '📖 Basic' : '✨ Advanced'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => navigator.clipboard.writeText(activeTab === 'basic' ? day.snippet.basic : day.snippet.advanced)}
            >
              Copy
            </Button>
            <pre className="bg-black/30 rounded-xl p-4 overflow-x-auto">
              <code className="text-sm font-mono text-green-400 whitespace-pre">
                {activeTab === 'basic' ? day.snippet.basic : day.snippet.advanced}
              </code>
            </pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// DAY CARD COMPONENT
// ============================================
const DayCard = ({ 
  day, 
  isActive, 
  onComplete, 
  onSnippetClick 
}: {
  day: RoadmapDay;
  isActive: boolean;
  onComplete: (day: RoadmapDay) => void;
  onSnippetClick: (day: RoadmapDay) => void;
}) => {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', badge: 'success' as const, label: '✓ Done' },
    current: { icon: Play, color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20', badge: 'warning' as const, label: '▶ Active' },
    upcoming: { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', badge: 'info' as const, label: 'Coming' },
    locked: { icon: Lock, color: 'text-gray-500', bg: 'bg-gray-500/5 border-gray-500/20', badge: 'outline' as const, label: '🔒 Locked' },
  };
  const config = statusConfig[day.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileHover={day.status !== 'locked' ? { y: -6, scale: 1.03 } : {}}
      className={`relative flex-shrink-0 w-72 p-5 rounded-2xl border transition-all duration-300 ${config.bg} ${
        isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      } ${day.status === 'current' ? 'animate-pulse-glow' : ''} ${
        day.status === 'locked' ? 'opacity-60' : 'cursor-pointer hover:shadow-xl'
      }`}
      id={`day-${day.day}`}
    >
      {/* Status Badge */}
      <div className="absolute -top-3 -right-3 z-10">
        <Badge variant={config.badge} size="sm" className="shadow-lg">
          <StatusIcon className={`w-3 h-3 mr-1 ${config.color}`} />{config.label}
        </Badge>
      </div>

      {/* Day Number & Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{day.icon}</span>
          <span className="text-xs font-bold text-muted-foreground">Day {day.day}</span>
        </div>
        <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
          {new Date(day.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <h3 className="text-base font-bold mb-3 line-clamp-2">{day.title}</h3>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="truncate text-xs">{day.basic}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="truncate text-xs">{day.advanced}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="warning" size="sm"><Trophy className="w-3 h-3 mr-0.5" />{day.xpReward} XP</Badge>
        <Badge variant="info" size="sm"><Clock className="w-3 h-3 mr-0.5" />{day.estimatedTime}</Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {day.status !== 'locked' ? (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onSnippetClick(day); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
            >
              <Code className="w-3.5 h-3.5" />View Code
            </button>
            {day.status === 'current' && (
              <button
                onClick={(e) => { e.stopPropagation(); onComplete(day); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors text-xs font-medium border border-green-500/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />Complete
              </button>
            )}
          </>
        ) : (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-500/5 text-gray-600 text-xs font-medium cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />Complete Previous Day
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// NOTIFICATION SETTINGS MODAL
// ============================================
const NotificationModal = ({
  prefs,
  onSave,
  onClose,
}: {
  prefs: NotificationPrefs;
  onSave: (prefs: NotificationPrefs) => void;
  onClose: () => void;
}) => {
  const [localPrefs, setLocalPrefs] = useState<NotificationPrefs>(prefs);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="max-w-md w-full glass-heavy rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2"><Bell className="w-5 h-5 text-yellow-400" />Notification Settings</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Channel</label>
            <div className="grid grid-cols-3 gap-2">
              {(['email', 'sms', 'both'] as const).map(c => (
                <button key={c} onClick={() => setLocalPrefs(p => ({ ...p, channel: c }))}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm border capitalize ${
                    localPrefs.channel === c ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  }`}>
                  {c === 'email' && <Mail className="w-4 h-4" />}{c === 'sms' && <Smartphone className="w-4 h-4" />}{c === 'both' && <BellRing className="w-4 h-4" />}{c}
                </button>
              ))}
            </div>
          </div>
          {(localPrefs.channel === 'sms' || localPrefs.channel === 'both') && (
            <div>
              <label className="text-sm font-medium mb-2 block"><Phone className="w-4 h-4 inline mr-1" />Phone</label>
              <Input type="tel" value={localPrefs.phoneNumber || ''} onChange={e => setLocalPrefs(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+1 (555) 000-0000" />
            </div>
          )}
          {[
            { key: 'morningTask' as const, icon: Sunrise, color: 'text-orange-400', label: 'Morning Alert', desc: '8:00 AM daily task' },
            { key: 'eveningPreview' as const, icon: Sunset, color: 'text-purple-400', label: 'Evening Preview', desc: "8:00 PM tomorrow's peek" },
            { key: 'afternoonNudge' as const, icon: Coffee, color: 'text-amber-400', label: 'Afternoon Nudge', desc: "6:00 PM reminder" },
            { key: 'streakReminder' as const, icon: Flame, color: 'text-red-400', label: 'Streak Guard', desc: 'Before streak expires' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2"><item.icon className={`w-4 h-4 ${item.color}`} /><span className="text-sm">{item.label}</span></div>
              <Switch checked={localPrefs[item.key]} onChange={() => setLocalPrefs(p => ({ ...p, [item.key]: !p[item.key] }))} />
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-white/10 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => { onSave(localPrefs); onClose(); }}>Save</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN ROADMAP COMPONENT
// ============================================
const Roadmap = () => {
  const [roadmap, setRoadmap] = useState<RoadmapDay[]>(createDefaultRoadmap);
  const [snippetDay, setSnippetDay] = useState<RoadmapDay | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [highlightedDay, setHighlightedDay] = useState<number | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    morningTask: true, eveningPreview: true, afternoonNudge: false, streakReminder: true, channel: 'email',
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const completedDays = roadmap.filter(d => d.status === 'completed').length;
  const totalDays = roadmap.length;
  const progressPercent = Math.round((completedDays / totalDays) * 100);
  const currentDay = getTodayTask(roadmap);
  const tomorrowTask = getTomorrowTask(roadmap);
  const totalXP = roadmap.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.xpReward, 0);

  // Scroll to specific day
  const scrollToDay = useCallback((dayNum: number) => {
    setHighlightedDay(dayNum);
    const element = document.getElementById(`day-${dayNum}`);
    if (element && scrollRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setTimeout(() => setHighlightedDay(null), 3000);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  // Handle day completion
  const handleCompleteDay = useCallback((day: RoadmapDay) => {
    setRoadmap(prev => prev.map(d => {
      if (d.id === day.id) return { ...d, status: 'completed' as const, completedAt: new Date() };
      if (d.day === day.day + 1 && d.status === 'upcoming') return { ...d, status: 'current' as const };
      if (d.day === day.day + 1 && d.status === 'locked') return { ...d, status: 'current' as const };
      return d;
    }));
  }, []);

  // Handle roadmap generation
  const handleGenerateRoadmap = (input: RoadmapGeneratorInput) => {
    const newRoadmap = generateRoadmapFromTopic(input);
    setRoadmap(newRoadmap);
  };

  const handleSaveNotifications = (prefs: NotificationPrefs) => {
    setNotificationPrefs(prefs);
  };

  const handleResetRoadmap = () => {
    setRoadmap(createDefaultRoadmap());
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Your Learning Roadmap
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalDays}-day path • Track progress daily • Dynamic calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowNotifications(true)} className="gap-2">
            <Bell className="w-4 h-4" />Notifications
          </Button>
          <Button onClick={() => setShowGenerator(true)} className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
            <Wand2 className="w-4 h-4" />Generate Path
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetRoadmap}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="glass" className="p-4 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{totalXP}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </Card>
        <Card variant="glass" className="p-4 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{completedDays}<span className="text-sm">/{totalDays}</span></p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </Card>
        <Card variant="glass" className="p-4 text-center">
          <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{currentDay ? `Day ${currentDay.day}` : 'Done!'}</p>
          <p className="text-xs text-muted-foreground">Current</p>
        </Card>
        <Card variant="glass" className="p-4 text-center">
          <CalendarDays className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{tomorrowTask ? `Day ${tomorrowTask.day}` : '--'}</p>
          <p className="text-xs text-muted-foreground">Tomorrow</p>
        </Card>
        <Card variant="glass" className="p-4 text-center">
          <ProgressBar value={progressPercent} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{progressPercent}% Complete</p>
        </Card>
      </div>

      {/* Tomorrow Preview Banner - CLICKABLE */}
      {tomorrowTask && (
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Card 
            variant="glass" 
            className="p-4 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => scrollToDay(tomorrowTask.day)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sunset className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium">Tomorrow's Preview</p>
                  <p className="text-xs text-muted-foreground">
                    Day {tomorrowTask.day}: {tomorrowTask.basic} → {tomorrowTask.advanced}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {new Date(tomorrowTask.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Badge>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Horizontal Timeline */}
      <div className="relative">
        <button onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/20 shadow-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/20 shadow-lg">
          <ChevronRight className="w-5 h-5" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 px-8 scrollbar-hide snap-x snap-mandatory scroll-smooth"
        >
          {roadmap.map((day) => (
            <div key={day.id} className="snap-center">
              <DayCard
                day={day}
                isActive={highlightedDay === day.day}
                onComplete={handleCompleteDay}
                onSnippetClick={(d) => setSnippetDay(d)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Timeline Indicator */}
      <div className="flex items-center justify-center gap-2">
        {roadmap.map((day) => (
          <button
            key={day.id}
            onClick={() => scrollToDay(day.day)}
            className={`w-3 h-3 rounded-full transition-all ${
              day.status === 'completed' ? 'bg-green-400 scale-100' :
              day.status === 'current' ? 'bg-yellow-400 scale-125 ring-2 ring-yellow-400/50' :
              day.status === 'upcoming' ? 'bg-blue-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {snippetDay && <SnippetModal day={snippetDay} onClose={() => setSnippetDay(null)} />}
        {showNotifications && (
          <NotificationModal prefs={notificationPrefs} onSave={handleSaveNotifications} onClose={() => setShowNotifications(false)} />
        )}
        {showGenerator && (
          <RoadmapGeneratorModal onGenerate={handleGenerateRoadmap} onClose={() => setShowGenerator(false)} />
        )}
      </AnimatePresence>

      
    </motion.div>
  );
};

export default Roadmap;