import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  BookOpen, Brain, Search, Send, Loader2,
  ChevronRight, Star, GitFork, Trophy, Clock,
  Grid3x3, List, Minimize2, Maximize2, Sparkles,
  Zap, Cpu, Globe, Code, Terminal, MessageSquare,
  Upload, FileText, Paperclip, Image, FileCode,
  X, Download, Copy, CheckCircle2, AlertCircle,
  History, Trash2, PanelLeft, PanelRight
} from 'lucide-react';
import { topicService } from '../services/topicService';
import { aiService } from '../services/aiService';

interface Topic {
  id: number;
  title: string;
  slug: string;
  description: string;
  language: string;
  category: string;
  difficulty: string;
  icon: string;
  tags: string[];
  estimated_hours: number;
  xp_reward: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: string;
  attachments?: { name: string; type: string; content: string }[];
}

interface AIModel {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface LanguageOption {
  id: string;
  name: string;
  icon: string;
}

const AI_MODELS: AIModel[] = [
  { id: 'auto', name: 'Auto Select', icon: '🧠', color: 'from-purple-500 to-pink-500', description: 'Best available' },
  { id: 'gemini', name: 'Gemini Flash', icon: '🌟', color: 'from-blue-500 to-cyan-500', description: 'Fast & free - Google' },
  { id: 'groq', name: 'Llama 3.3 70B', icon: '⚡', color: 'from-orange-500 to-red-500', description: 'Most powerful - 70B' },
  { id: 'groq-mixtral', name: 'Mixtral 8x7B', icon: '🔀', color: 'from-amber-500 to-orange-500', description: 'Mixture of experts' },
  { id: 'groq-gemma', name: 'Gemma 2 9B', icon: '💎', color: 'from-teal-500 to-green-500', description: 'Efficient & fast' },
  { id: 'groq-llama8b', name: 'Llama 3.1 8B', icon: '🚀', color: 'from-red-500 to-pink-500', description: 'Instant responses' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🔮', color: 'from-indigo-500 to-purple-500', description: 'Code expert' },
  { id: 'openrouter', name: 'Gemma 9B', icon: '🌐', color: 'from-emerald-500 to-teal-500', description: 'Open source' },
];

const LANGUAGES: LanguageOption[] = [
  { id: 'javascript', name: 'JavaScript', icon: '📜' },
  { id: 'typescript', name: 'TypeScript', icon: '💪' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚡' },
  { id: 'csharp', name: 'C#', icon: '🎯' },
  { id: 'go', name: 'Go', icon: '🟦' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
  { id: 'php', name: 'PHP', icon: '🐘' },
  { id: 'sql', name: 'SQL', icon: '🗄️' },
];

const SAMPLE_TOPICS: Record<string, Topic[]> = {
  javascript: [
    { id: 1, title: 'Variables & Data Types', slug: 'variables', description: 'Master var, let, const and primitive types', language: 'javascript', category: 'fundamentals', difficulty: 'beginner', icon: '📦', tags: ['basics'], estimated_hours: 1, xp_reward: 100 },
    { id: 2, title: 'Functions & Scope', slug: 'functions', description: 'Function declarations, expressions, and closures', language: 'javascript', category: 'fundamentals', difficulty: 'beginner', icon: '⚡', tags: ['functions'], estimated_hours: 2, xp_reward: 150 },
    { id: 3, title: 'Arrays & Objects', slug: 'arrays', description: 'Map, filter, reduce and object manipulation', language: 'javascript', category: 'data-structures', difficulty: 'intermediate', icon: '📚', tags: ['collections'], estimated_hours: 2, xp_reward: 200 },
    { id: 4, title: 'Async Programming', slug: 'async', description: 'Promises, async/await, and event loop', language: 'javascript', category: 'advanced', difficulty: 'advanced', icon: '⏳', tags: ['async'], estimated_hours: 3, xp_reward: 300 },
    { id: 5, title: 'Error Handling', slug: 'errors', description: 'Try/catch, custom errors, debugging', language: 'javascript', category: 'advanced', difficulty: 'intermediate', icon: '🐛', tags: ['debugging'], estimated_hours: 2, xp_reward: 200 },
  ],
  python: [
    { id: 101, title: 'Variables & Types', slug: 'variables', description: 'Learn Python variables and primitive values', language: 'python', category: 'fundamentals', difficulty: 'beginner', icon: '📦', tags: ['basics'], estimated_hours: 1, xp_reward: 100 },
    { id: 102, title: 'Functions', slug: 'functions', description: 'Define reusable logic with functions', language: 'python', category: 'fundamentals', difficulty: 'beginner', icon: '⚡', tags: ['functions'], estimated_hours: 2, xp_reward: 150 },
    { id: 103, title: 'Lists & Dictionaries', slug: 'collections', description: 'Work with Python collections effectively', language: 'python', category: 'data-structures', difficulty: 'intermediate', icon: '📚', tags: ['collections'], estimated_hours: 2, xp_reward: 200 },
  ],
  typescript: [
    { id: 201, title: 'Types & Interfaces', slug: 'types', description: 'Build type-safe applications with TypeScript', language: 'typescript', category: 'fundamentals', difficulty: 'beginner', icon: '📦', tags: ['types'], estimated_hours: 2, xp_reward: 150 },
    { id: 202, title: 'Generics', slug: 'generics', description: 'Create reusable typed utilities', language: 'typescript', category: 'advanced', difficulty: 'intermediate', icon: '⚡', tags: ['generics'], estimated_hours: 3, xp_reward: 250 },
  ],
  java: [
    { id: 301, title: 'OOP Basics', slug: 'oop', description: 'Classes, objects, inheritance, and polymorphism', language: 'java', category: 'fundamentals', difficulty: 'beginner', icon: '☕', tags: ['oop'], estimated_hours: 2, xp_reward: 150 },
    { id: 302, title: 'Collections Framework', slug: 'collections', description: 'List, Set, Map, Queue and iterators', language: 'java', category: 'intermediate', difficulty: 'intermediate', icon: '📚', tags: ['collections'], estimated_hours: 3, xp_reward: 250 },
    { id: 303, title: 'Exceptions & Generics', slug: 'exceptions', description: 'Handle errors and build flexible code', language: 'java', category: 'advanced', difficulty: 'intermediate', icon: '🐛', tags: ['errors'], estimated_hours: 3, xp_reward: 250 },
  ],
  cpp: [
    { id: 401, title: 'Syntax & Variables', slug: 'syntax', description: 'Core C++ syntax and basic data types', language: 'cpp', category: 'fundamentals', difficulty: 'beginner', icon: '⚡', tags: ['basics'], estimated_hours: 2, xp_reward: 150 },
  ],
  csharp: [],
  go: [],
  rust: [],
  php: [],
  sql: [],
};

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'];

const normalizeModelId = (id: string) => id === 'auto' ? 'auto' : id;

export default function Learning() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [chatExpanded, setChatExpanded] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; content: string }[]>([]);
  const [chatHistory, setChatHistory] = useState<{ topic: string; date: Date; preview: string }[]>([]);
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTopics();
  }, [selectedLanguage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadTopics = async () => {
    setLoading(true);
    setSystemNotice(null);
    try {
      const data = await topicService.getAll(selectedLanguage);
      const response = data as { topics?: Topic[] } | Topic[];
      if (Array.isArray(response)) {
        setTopics(response);
      } else if (response?.topics) {
        setTopics(response.topics);
      } else {
        setTopics(SAMPLE_TOPICS[selectedLanguage] || []);
      }
    } catch {
      setTopics(SAMPLE_TOPICS[selectedLanguage] || []);
      setSystemNotice('Using built-in learning topics because the live topic service is unavailable.');
    } finally {
      setLoading(false);
      setSelectedTopic(null);
      setChatMessages([]);
    }
  };

  const initialAssistantMessage = (topic: Topic) => ({
    id: Date.now().toString(),
    role: 'assistant' as const,
    content: `👋 I’m ready to help you learn ${topic.title}.\n\nYou can ask me to:\n• explain concepts\n• show code examples\n• debug errors\n• review your files\n• create practice exercises`,
    timestamp: new Date(),
  });

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setChatMessages([initialAssistantMessage(topic)]);
    setChatHistory(prev => [
      {
        topic: topic.title,
        date: new Date(),
        preview: `Opened topic: ${topic.title}`,
      },
      ...prev,
    ].slice(0, 20));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploaded: { name: string; type: string; content: string }[] = [];

    await Promise.all(Array.from(files).map(file => new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = event => {
        const content = String(event.target?.result || '');
        const newFile = {
          name: file.name,
          type: file.type.startsWith('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'code',
          content: content.substring(0, 5000),
        };
        uploaded.push(newFile);
        resolve();
      };
      if (file.type.startsWith('image')) reader.readAsDataURL(file);
      else reader.readAsText(file);
    })));

    setUploadedFiles(prev => [...prev, ...uploaded]);

    const fileNames = uploaded.map(f => f.name).join(', ');
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: `📎 Uploaded files: ${fileNames}`,
        timestamp: new Date(),
        attachments: uploaded,
      },
    ]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const context = selectedTopic
        ? `You are an expert ${selectedTopic.language} tutor teaching ${selectedTopic.title}. Be clear, concise, and practical.`
        : 'You are an expert coding tutor. Be clear, concise, and practical.';

      const fileContext = uploadedFiles.length > 0
        ? `\n\nThe user uploaded files:\n${uploadedFiles.map(f => `- ${f.name}: ${f.content.substring(0, 1000)}`).join('\n')}`
        : '';

      const response = await aiService.chat({
        messages: [
          { role: 'system', content: context + fileContext },
          ...chatMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: trimmed },
        ],
        provider: normalizeModelId(selectedModel),
        temperature: 0.7,
      });

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          provider: response.provider,
        },
      ]);

      setChatHistory(prev => [
        {
          topic: selectedTopic?.title || 'General',
          date: new Date(),
          preview: trimmed.substring(0, 50),
        },
        ...prev,
      ].slice(0, 20));

      setUploadedFiles([]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Sorry, I could not generate a response right now. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = () => sendMessage(chatInput);

  const handleQuickPrompt = (prompt: string) => {
    if (!selectedTopic) return;
    setChatInput(prompt);
    void sendMessage(prompt);
  };

  const clearChat = () => {
    setChatMessages(selectedTopic ? [initialAssistantMessage(selectedTopic)] : []);
    setUploadedFiles([]);
  };

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchesDifficulty = difficultyFilter === 'all' || t.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDifficulty && matchesSearch;
    });
  }, [topics, difficultyFilter, searchQuery]);

  const diffColor = (d: string) =>
    d === 'beginner'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : d === 'intermediate'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  const languageTopics = selectedLanguage === 'all' ? topics : filteredTopics;
  const currentLanguage = LANGUAGES.find(l => l.id === selectedLanguage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen text-slate-100"
      style={{
        background:
          'radial-gradient(circle at top, rgba(59,130,246,0.12), transparent 35%), linear-gradient(180deg, #08111f 0%, #0b1324 45%, #0a0f1a 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700/60 bg-slate-900/50 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Learning Center
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Learning Center
            </h1>
            <p className="text-slate-400">Master programming with AI-powered guidance and topic-based learning.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  selectedLanguage === lang.id
                    ? 'bg-sky-500/20 text-white border-sky-500/40 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-900/40 text-slate-400 border-slate-700/50 hover:text-white hover:border-slate-600/80'
                }`}
              >
                <span className="mr-2">{lang.icon}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {systemNotice && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertCircle className="w-4 h-4" />
            {systemNotice}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-slate-700/60 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="bg-slate-950/50 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-300"
              >
                <option value="all">All</option>
                {DIFFICULTY_ORDER.map(d => (
                  <option key={d} value={d}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>

              <div className="flex items-center rounded-lg border border-slate-700/60 bg-slate-950/50 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-sky-500/15 text-sky-400' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-sky-500/15 text-sky-400' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Card variant="glass" className="p-4 border-slate-700/30 bg-slate-950/40">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  Topics
                </h2>
                <Badge variant="info" size="sm" className="bg-sky-500/15 text-sky-400">
                  {languageTopics.length}
                </Badge>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 rounded-xl bg-slate-800/40 animate-pulse" />
                  ))}
                </div>
              ) : languageTopics.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
                  No topics found for {currentLanguage?.name || selectedLanguage}.
                </div>
              ) : (
                <div className={`space-y-3 ${viewMode === 'grid' ? '' : ''}`}>
                  {languageTopics.map(topic => (
                    <motion.div
                      key={topic.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleTopicSelect(topic)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedTopic?.id === topic.id
                          ? 'bg-sky-500/10 border-sky-500/35 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-900/30 border-slate-800 hover:border-sky-500/25'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{topic.icon}</span>
                        <h3 className="font-semibold text-slate-100 truncate">{topic.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3">{topic.description}</p>
                      <div className="flex items-center flex-wrap gap-2">
                        <Badge variant="outline" size="sm" className={diffColor(topic.difficulty)}>
                          {topic.difficulty}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          {topic.xp_reward} XP
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {topic.estimated_hours}h
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            <Card variant="glass" className="p-4 border-slate-700/30 bg-slate-950/40">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-violet-400" />
                Recent Topics
              </h3>
              <div className="space-y-2">
                {chatHistory.length === 0 ? (
                  <div className="text-sm text-slate-500">No recent activity yet.</div>
                ) : (
                  chatHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-800">
                      <div>
                        <div className="text-sm text-slate-200">{entry.topic}</div>
                        <div className="text-xs text-slate-500">{entry.preview}</div>
                      </div>
                      <span className="text-[11px] text-slate-600">
                        {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card variant="glass" className={`flex flex-col ${chatExpanded ? 'h-[760px]' : 'h-[520px]'} border-slate-700/30 bg-slate-950/40 overflow-hidden`}>
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500 to-violet-500">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{selectedTopic ? selectedTopic.title : 'AI Tutor'}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedTopic ? `${selectedTopic.language} • ${selectedTopic.difficulty}` : 'Select a topic to begin'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                  >
                    {AI_MODELS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.icon} {m.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={clearChat}
                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setChatExpanded(prev => !prev)}
                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
                    title="Expand or collapse"
                  >
                    {chatExpanded ? <Minimize2 className="w-4 h-4 text-slate-500" /> : <Maximize2 className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950/70 to-slate-950/90">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-12">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center border border-slate-800 bg-slate-900/60">
                      <Brain className="w-12 h-12 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Your AI Learning Partner</h3>
                      <p className="text-slate-500 mt-2 max-w-md">
                        Select a topic, upload files, and start asking questions. The assistant will guide you with explanations and examples.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        'Explain this topic simply',
                        'Give me examples',
                        'Create practice questions',
                        'Help me debug code',
                      ].map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => handleQuickPrompt(prompt)}
                          disabled={!selectedTopic || chatLoading}
                          className="px-4 py-2 rounded-full text-sm border border-slate-700/60 bg-slate-900/40 text-slate-400 hover:text-white hover:border-sky-500/30 hover:bg-sky-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {chatMessages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-2xl p-4 ${
                            msg.role === 'user'
                              ? 'bg-sky-500/10 border border-sky-500/25'
                              : 'bg-slate-900/60 border border-slate-800'
                          }`}
                        >
                          <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800">
                            <span className="text-xs text-slate-600">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.provider && (
                              <Badge variant="outline" size="sm" className="text-xs bg-slate-800/70 text-slate-400 border-slate-700/60">
                                {msg.provider}
                              </Badge>
                            )}
                            {msg.role === 'assistant' && (
                              <button
                                onClick={() => navigator.clipboard.writeText(msg.content)}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                                title="Copy response"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                          <span className="text-sm text-slate-400">Thinking...</span>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-950/90"
                  >
                    {uploadedFiles.map((file, i) => (
                      <div key={`${file.name}-${i}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-400">
                        <Paperclip className="w-3 h-3" />
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-rose-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 border-t border-slate-800 bg-slate-950/95">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.js,.ts,.tsx,.py,.java,.cpp,.html,.css,.json,.md,.pdf,.png,.jpg,.jpeg,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/25 transition-all"
                    title="Upload files"
                  >
                    <Upload className="w-4 h-4" />
                  </button>

                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder={selectedTopic ? `Ask about ${selectedTopic.title}...` : 'Select a topic first...'}
                    disabled={chatLoading}
                    className="flex-1 bg-slate-900/60 border-slate-700/60 text-slate-100 placeholder:text-slate-500"
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || chatLoading}
                    className="gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500"
                  >
                    {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                  {AI_MODELS.filter(m => m.id !== 'auto').map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-medium border ${
                        selectedModel === model.id
                          ? 'text-white shadow-lg border-transparent'
                          : 'text-slate-500 border-slate-800 bg-slate-900/40 hover:text-slate-300'
                      }`}
                      style={
                        selectedModel === model.id
                          ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }
                          : undefined
                      }
                    >
                      <span>{model.icon}</span>
                      {model.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}