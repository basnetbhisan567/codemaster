import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Download, Upload, Sparkles,
  Mail, Cloud, Zap, Code, FileCode,
  CheckCircle2, Clock, AlertCircle,
  PenTool, Lightbulb, Filter, Search,
  Save, FolderOpen, Trophy, RotateCcw,
  Github, Paperclip, Copy,
  Loader2, Play, X, Bell,
  Brain, Send, Plus, Trash2,
  ExternalLink, Calendar, Users, Star,
  Briefcase, Building2, Globe, Server
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { apiClient } from '../services/apiClient';

// ============================================
// TYPES
// ============================================
interface AssignmentFromAPI {
  id: number;
  title: string;
  description: string;
  source: string;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string[];
  notes: string;
  progress: number;
  xp_reward: number;
  created_at: string;
}

interface HackathonProject {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  language: string;
  requirements: string[];
  xp_reward: number;
  estimated_hours: number;
  times_completed: number;
}

interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================
// SVG ICONS
// ============================================
const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
);

const BugIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v2a4 4 0 0 1-8 0v-2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2V8a4 4 0 0 1 4-4z" />
    <path d="M8 2v2" /><path d="M16 2v2" /><path d="M12 10v4" />
  </svg>
);

// ============================================
// HELPERS
// ============================================
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getDaysUntilDue = (dueDate: string | null): number => {
  if (!dueDate) return 999;
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return colors[priority] || 'bg-gray-500/20 text-gray-400';
};

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    expert: 'from-red-500 to-orange-500',
    hard: 'from-orange-500 to-yellow-500',
    medium: 'from-yellow-500 to-green-500',
    easy: 'from-green-500 to-emerald-500',
  };
  return colors[difficulty] || 'from-gray-500 to-gray-600';
};

// ============================================
// AI ASSISTANT PANEL
// ============================================
const AIAssistantPanel = ({ assignment, onClose }: { assignment: AssignmentFromAPI; onClose: () => void }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1', role: 'assistant',
      content: `👋 Hi! I can help with "${assignment.title}".\n\n📝 Explain concepts\n💡 Break down problems\n🐛 Debug code\n\nWhat do you need?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: AIChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await apiClient.post('/ai/chat', {
        messages: [{ role: 'user', content: input }],
        provider: 'auto',
      });
      
      const aiMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: (response.data as any)?.response || 'Sorry, AI is unavailable right now.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'AI service is currently unavailable. Please try again later.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickPrompts = [
    { icon: Lightbulb, text: 'Explain', prompt: 'Explain this in simple terms' },
    { icon: Code, text: 'Example', prompt: 'Show me a code example' },
    { icon: ListIcon, text: 'Steps', prompt: 'Break this into steps' },
    { icon: BugIcon, text: 'Debug', prompt: 'What are common mistakes?' },
  ];

  return (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-[420px] bg-[#0d1117] border-l border-[#30363d] shadow-2xl z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-gradient-to-r from-purple-600/10 to-blue-600/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-[#8b949e] truncate max-w-[200px]">{assignment.title}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl p-3 ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-slate-800/50 border border-slate-700/50'}`}>
              <div className="text-sm whitespace-pre-wrap text-[#c9d1d9]">{msg.content}</div>
              <span className="text-[10px] text-[#484f58] mt-1 block">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-2 text-sm text-[#8b949e]">
              <Loader2 className="w-3 h-3 animate-spin" />Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 py-2 border-t border-[#30363d] flex gap-2 overflow-x-auto">
        {quickPrompts.map((qp, i) => (
          <button key={i} onClick={() => setInput(qp.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-[#8b949e] hover:text-[#c9d1d9] hover:border-primary/50 whitespace-nowrap transition-colors">
            <qp.icon className="w-3 h-3" />{qp.text}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-[#30363d]">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-primary" />
          <Button size="sm" onClick={handleSend} disabled={!input.trim() || isThinking}><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// NOTEBOOK PANEL
// ============================================
const NotebookPanel = ({ assignment, onSave, onClose, onOpenAI }: {
  assignment: AssignmentFromAPI;
  onSave: (id: number, notes: string) => void;
  onClose: () => void;
  onOpenAI: () => void;
}) => {
  const [content, setContent] = useState(assignment.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(assignment.id, content);
    setIsSaving(false);
  };

  return (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-[#0d1117] border-l border-[#30363d] shadow-2xl z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <div className="flex items-center gap-2"><PenTool className="w-4 h-4 text-blue-400" /><h3 className="font-semibold text-sm">Notebook</h3></div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onOpenAI}><Sparkles className="w-4 h-4 text-purple-400" /></Button>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="p-4 bg-[#161b22] border-b border-[#30363d]">
        <p className="text-xs text-[#8b949e]">Notes for:</p>
        <p className="text-sm font-medium text-[#c9d1d9] truncate">{assignment.title}</p>
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="# Notes...&#10;&#10;## Approach&#10;- Step 1&#10;- Step 2"
        className="flex-1 bg-transparent p-4 text-sm font-mono text-[#c9d1d9] resize-none focus:outline-none placeholder:text-[#484f58]" />
      <div className="p-4 border-t border-[#30363d] flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleSave}><Save className="w-3 h-3 mr-1" />Save</Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => navigator.clipboard.writeText(content)}><Copy className="w-3 h-3 mr-1" />Copy</Button>
      </div>
    </motion.div>
  );
};

// ============================================
// ASSIGNMENT CARD
// ============================================
const AssignmentCard = ({ assignment, onOpenNotebook, onOpenAI, onStatusChange, onDelete }: {
  assignment: AssignmentFromAPI;
  onOpenNotebook: (a: AssignmentFromAPI) => void;
  onOpenAI: (a: AssignmentFromAPI) => void;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}) => {
  const daysUntilDue = getDaysUntilDue(assignment.due_date);
  const isUrgent = daysUntilDue <= 1 && assignment.status !== 'completed';

  return (
    <motion.div whileHover={{ y: -4 }} className="glass p-5 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          assignment.source === 'outlook' ? 'bg-blue-500/20' : assignment.source === 'upload' ? 'bg-purple-500/20' : 'bg-green-500/20'
        }`}>
          {assignment.source === 'outlook' ? <Mail className="w-5 h-5 text-blue-400" /> : 
           assignment.source === 'upload' ? <Upload className="w-5 h-5 text-purple-400" /> : 
           <FileText className="w-5 h-5 text-green-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm truncate">{assignment.title}</h3>
            <Badge variant="outline" size="sm" className={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{assignment.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {assignment.tags?.map(tag => <Badge key={tag} variant="outline" size="sm" className="text-xs">{tag}</Badge>)}
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span className="font-medium">{assignment.progress}%</span></div>
        <div className="w-full bg-slate-700 rounded-full h-1.5"><div className="bg-gradient-to-r from-primary to-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${assignment.progress}%` }} /></div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" />{assignment.xp_reward} XP</span>
        {assignment.due_date && (
          <span className={`flex items-center gap-1 ${isUrgent ? 'text-red-400 font-medium' : 'text-yellow-400'}`}>
            <AlertCircle className="w-3 h-3" />{daysUntilDue <= 0 ? 'Overdue!' : `${daysUntilDue}d left`}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => onOpenNotebook(assignment)}><PenTool className="w-3 h-3" />Notes</Button>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => onOpenAI(assignment)}><Sparkles className="w-3 h-3 text-purple-400" />AI</Button>
        <Button variant="outline" size="sm" className="gap-1 text-red-400" onClick={() => onDelete(assignment.id)}><Trash2 className="w-3 h-3" />Delete</Button>
        {assignment.status !== 'completed' ? (
          <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(assignment.id, 'completed')}><CheckCircle2 className="w-3 h-3" />Done</Button>
        ) : (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => onStatusChange(assignment.id, 'in-progress')}><RotateCcw className="w-3 h-3" />Reopen</Button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// HACKATHON CARD
// ============================================
const HackathonCard = ({ project, onStart }: { project: HackathonProject; onStart: (p: HackathonProject) => void }) => (
  <motion.div whileHover={{ y: -6 }} className="glass p-6 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all">
    <div className="flex items-center justify-between mb-3">
      <Badge className={`bg-gradient-to-r ${getDifficultyColor(project.difficulty)} text-white text-xs`}>{project.difficulty}</Badge>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.times_completed} completed</span>
        <span><Trophy className="w-3 h-3 text-yellow-400 inline" />{project.xp_reward} XP</span>
      </div>
    </div>
    <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors">{project.title}</h3>
    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
    <div className="flex items-center gap-2 mb-3">
      <Badge variant="outline" size="sm" className="text-xs">{project.category}</Badge>
      <Badge variant="outline" size="sm" className="text-xs">{project.language}</Badge>
    </div>
    <div className="space-y-1 mb-4">
      {project.requirements?.slice(0, 3).map((r, i) => (
        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /><span className="line-clamp-1">{r}</span></div>
      ))}
    </div>
    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
      <span><Clock className="w-3 h-3 inline" />{project.estimated_hours}h</span>
    </div>
    <Button size="sm" className="w-full gap-1 bg-gradient-to-r from-purple-600 to-blue-600" onClick={() => onStart(project)}>
      <Play className="w-3 h-3" />Start Challenge
    </Button>
  </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================
const Assignments = () => {
  const [activeTab, setActiveTab] = useState('academic');
  
  // Assignment state
  const [assignments, setAssignments] = useState<AssignmentFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Hackathon state
  const [hackathons, setHackathons] = useState<HackathonProject[]>([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);
  
  // UI state
  const [notebookAssignment, setNotebookAssignment] = useState<AssignmentFromAPI | null>(null);
  const [aiAssignment, setAiAssignment] = useState<AssignmentFromAPI | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dragOver, setDragOver] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // FETCH ASSIGNMENTS FROM BACKEND
  // ============================================
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/assignments/', { requiresAuth: true });
      if (response.data) {
        setAssignments(response.data as AssignmentFromAPI[]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // FETCH HACKATHON PROJECTS FROM BACKEND
  // ============================================
  const fetchHackathons = useCallback(async () => {
    setLoadingHackathons(true);
    try {
      const response = await apiClient.get('/projects/', { requiresAuth: false });
      const data = response.data as any;
      if (data?.projects) {
        setHackathons(data.projects as HackathonProject[]);
      }
    } catch (err: any) {
      console.log('Hackathons not available:', err.message);
    } finally {
      setLoadingHackathons(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchHackathons();
  }, [fetchAssignments, fetchHackathons]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  const handleCreateAssignment = async () => {
    if (!newTitle.trim()) return;
    try {
      const response = await apiClient.post('/assignments/', {
        title: newTitle,
        description: '',
        priority: 'medium',
        tags: [],
        xp_reward: 200,
      }, { requiresAuth: true });
      
      if (response.data) {
        setAssignments(prev => [response.data as AssignmentFromAPI, ...prev]);
        setNewTitle('');
        setCreating(false);
      }
    } catch (err: any) {
      console.error('Failed to create:', err);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiClient.put(`/assignments/${id}`, { status }, { requiresAuth: true });
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, status, progress: status === 'completed' ? 100 : a.progress } : a));
    } catch (err: any) {
      console.error('Failed to update:', err);
    }
  };

  const handleSaveNotes = async (id: number, notes: string) => {
    try {
      await apiClient.put(`/assignments/${id}`, { notes }, { requiresAuth: true });
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, notes } : a));
    } catch (err: any) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/assignments/${id}`, { requiresAuth: true });
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Failed to delete:', err);
    }
  };

  const handleStartHackathon = async (project: HackathonProject) => {
    try {
      await apiClient.post(`/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}/submit`, {
        code: '',
        demo_url: '',
        repo_url: '',
      }, { requiresAuth: true });
      alert(`Started: ${project.title}`);
    } catch (err: any) {
      console.error('Failed to start:', err);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingCount = assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length;
  const urgentCount = assignments.filter(a => {
    const days = getDaysUntilDue(a.due_date);
    return days <= 1 && a.status !== 'completed';
  }).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Assignments</h1>
          <p className="text-muted-foreground mt-1">{assignments.length} assignments • Track your progress</p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />New Assignment
        </Button>
      </div>

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card variant="glass" className="p-4 border-primary/30">
              <div className="flex gap-2">
                <Input
                  placeholder="Assignment title..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateAssignment()}
                  autoFocus
                />
                <Button onClick={handleCreateAssignment} disabled={!newTitle.trim()}>Create</Button>
                <Button variant="ghost" onClick={() => setCreating(false)}><X className="w-4 h-4" /></Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, color: 'text-blue-400', value: assignments.length, label: 'Total Tasks' },
          { icon: Clock, color: 'text-yellow-400', value: pendingCount, label: 'Pending' },
          { icon: AlertCircle, color: 'text-red-400', value: urgentCount, label: 'Urgent' },
          { icon: Trophy, color: 'text-yellow-400', value: hackathons.length, label: 'Challenges' },
        ].map((stat, i) => (
          <Card key={i} variant="glass" className="p-4 text-center">
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full glass p-1">
          <TabsTrigger value="academic"><div className="flex items-center gap-2"><BookOpen className="w-4 h-4" />🎓 My Assignments{pendingCount > 0 && <Badge variant="warning" size="sm">{pendingCount}</Badge>}</div></TabsTrigger>
          <TabsTrigger value="realworld"><div className="flex items-center gap-2"><Zap className="w-4 h-4" />🚀 Hackathon Projects</div></TabsTrigger>
        </TabsList>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4 mt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search assignments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2 text-slate-400">Loading...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <Card variant="glass" className="p-6 text-center border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={fetchAssignments}>Retry</Button>
            </Card>
          )}

          {/* Empty */}
          {!loading && !error && assignments.length === 0 && (
            <Card variant="glass" className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-400">No assignments yet</h3>
              <p className="text-sm text-slate-500 mt-1">Click "New Assignment" to create your first one</p>
            </Card>
          )}

          {/* Assignment Cards */}
          {!loading && filteredAssignments.map(a => (
            <AssignmentCard key={a.id} assignment={a}
              onOpenNotebook={setNotebookAssignment}
              onOpenAI={setAiAssignment}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </TabsContent>

        {/* Hackathon Tab */}
        <TabsContent value="realworld" className="space-y-4 mt-6">
          {loadingHackathons && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2 text-slate-400">Loading projects...</span>
            </div>
          )}

          {!loadingHackathons && hackathons.length === 0 && (
            <Card variant="glass" className="p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-400">No projects yet</h3>
              <p className="text-sm text-slate-500 mt-1">Projects will appear here once seeded</p>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hackathons.map(p => (
              <HackathonCard key={p.id} project={p} onStart={handleStartHackathon} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Notebook Panel */}
      <AnimatePresence>
        {notebookAssignment && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30" onClick={() => setNotebookAssignment(null)} />
            <NotebookPanel assignment={notebookAssignment} onSave={handleSaveNotes}
              onClose={() => setNotebookAssignment(null)}
              onOpenAI={() => { setNotebookAssignment(null); setAiAssignment(notebookAssignment); }} />
          </>
        )}
      </AnimatePresence>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {aiAssignment && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30" onClick={() => setAiAssignment(null)} />
            <AIAssistantPanel assignment={aiAssignment} onClose={() => setAiAssignment(null)} />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Assignments;