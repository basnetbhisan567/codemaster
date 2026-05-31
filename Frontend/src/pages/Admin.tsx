import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  Users, UserPlus, Shield, MessageSquare, AlertTriangle,
  Search, Filter, Download, Upload, Save, Play, Eye, EyeOff,
  Settings, Activity, BarChart3, TrendingUp, Clock, Calendar,
  Database, Key, Terminal, Code, FileCode, GitBranch,
  Bell, CheckCircle, XCircle, AlertCircle, Zap, Lock, Unlock,
  Ban, Flag, History, Edit, Trash2, Plus, Minus, RefreshCw,
  ChevronRight, ChevronDown, ExternalLink, Copy, Check,
  Mail, Phone, MapPin, Globe, Monitor, Smartphone,
  Server, Cloud, UserCheck, UserCog, Users as UsersIcon,
  BookOpen, GraduationCap, Trophy, Target, Award,
  LogOut, Home, LayoutDashboard, LineChart, PieChart,
  Sparkles, Crown, Star, Zap as ZapIcon, Flame, X,
  Send, Clock3, MailOpen, MessageCircle, Smartphone as PhoneIcon,
  GanttChart, Route, Waypoints, Timer, BellRing, Webhook,
  SlidersHorizontal, Workflow, GitMerge, Link2, Unlink,
  Braces, Hash, Variable, ListOrdered, MoveVertical
} from 'lucide-react';
import { cn } from '../utils/cn';

// Format utilities
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

// ============================================
// TYPES
// ============================================
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailProvider?: 'gmail' | 'outlook' | 'other';
  avatar: string;
  role: 'student' | 'moderator' | 'instructor' | 'admin';
  status: 'active' | 'banned' | 'shadow_banned' | 'temp_banned';
  banExpiry?: Date;
  joinedAt: Date;
  lastActive: Date;
  ipAddress: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  progress: number;
  subscription: 'free' | 'pro' | 'enterprise';
  currentGoal?: string;
  roadmapDay?: number;
  notificationsEnabled: { email: boolean; sms: boolean; push: boolean };
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'daily_todo' | 'task_reminder' | 'topic_update' | 'streak_reminder' | 'custom';
  subject: string;
  body: string;
  channel: 'email' | 'sms' | 'both';
  lastSent?: Date;
  enabled: boolean;
}

interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  path: 'javascript' | 'python' | 'java' | 'cpp';
  day: number;
  prerequisites: string[];
  isLocked: boolean;
  completionRate: number;
  studentsStuck: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'inactivity' | 'streak_danger' | 'milestone' | 'custom';
  condition: string;
  action: 'send_email' | 'send_sms' | 'both';
  template: string;
  enabled: boolean;
  schedule?: string;
}

interface ApiIntegration {
  id: string;
  service: 'sendgrid' | 'twilio' | 'postmark' | 'firebase';
  apiKey: string;
  isActive: boolean;
  lastTested?: Date;
}

// ============================================
// MOCK DATA
// ============================================
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@gmail.com', phone: '+1-555-0101', emailProvider: 'gmail', avatar: 'JD', role: 'student', status: 'active', joinedAt: new Date('2024-01-15'), lastActive: new Date(), ipAddress: '192.168.1.1', deviceType: 'desktop', progress: 45, subscription: 'pro', currentGoal: 'React Basics', roadmapDay: 12, notificationsEnabled: { email: true, sms: true, push: true } },
  { id: '2', name: 'Jane Smith', email: 'jane@outlook.com', phone: '+1-555-0102', emailProvider: 'outlook', avatar: 'JS', role: 'instructor', status: 'active', joinedAt: new Date('2023-11-20'), lastActive: new Date(Date.now() - 86400000), ipAddress: '192.168.1.2', deviceType: 'mobile', progress: 78, subscription: 'enterprise', currentGoal: 'Advanced React', roadmapDay: 28, notificationsEnabled: { email: true, sms: false, push: true } },
  { id: '3', name: 'Bob Johnson', email: 'bob@yahoo.com', phone: '+1-555-0103', emailProvider: 'other', avatar: 'BJ', role: 'student', status: 'temp_banned', banExpiry: new Date(Date.now() + 86400000 * 3), joinedAt: new Date('2024-02-01'), lastActive: new Date(Date.now() - 172800000), ipAddress: '192.168.1.3', deviceType: 'tablet', progress: 12, subscription: 'free', currentGoal: 'JavaScript Basics', roadmapDay: 3, notificationsEnabled: { email: true, sms: true, push: false } },
];

const mockTemplates: NotificationTemplate[] = [
  { id: '1', name: 'Daily Todo', type: 'daily_todo', subject: 'Your Daily Coding Tasks', body: 'Hey {{name}}, here are your tasks for today:\n\n✅ Complete "Arrays" lesson\n✅ Solve 3 problems\n✅ Review yesterday\'s notes\n\nKeep up the streak! 🔥', channel: 'both', enabled: true },
  { id: '2', name: 'Streak Reminder', type: 'streak_reminder', subject: 'Don\'t Break Your Streak!', body: 'CodeMaster: Day {{day}} starts now! Don\'t break your {{streak}}-day streak. Your next lesson "{{nextTopic}}" is waiting. 🚀', channel: 'sms', enabled: true },
  { id: '3', name: 'Task Reminder', type: 'task_reminder', subject: 'Reminder: {{assignmentName}}', body: 'Hey {{name}}, don\'t forget to finish your "{{assignmentName}}" assignment today! You\'re {{progress}}% done.', channel: 'email', enabled: true },
];

const mockRoadmapTopics: RoadmapTopic[] = [
  { id: '1', title: 'Variables & Data Types', description: 'Learn var, let, const and primitive types', path: 'javascript', day: 1, prerequisites: [], isLocked: false, completionRate: 92, studentsStuck: 12 },
  { id: '2', title: 'Functions & Scope', description: 'Function declarations, expressions, and scope chain', path: 'javascript', day: 2, prerequisites: ['1'], isLocked: false, completionRate: 78, studentsStuck: 45 },
  { id: '3', title: 'Arrays & Array Methods', description: 'Map, filter, reduce, and other array methods', path: 'javascript', day: 3, prerequisites: ['2'], isLocked: true, completionRate: 65, studentsStuck: 89 },
  { id: '4', title: 'Objects & Prototypes', description: 'Object literals, constructors, and prototypal inheritance', path: 'javascript', day: 4, prerequisites: ['3'], isLocked: true, completionRate: 54, studentsStuck: 120 },
  { id: '5', title: 'Async Programming', description: 'Callbacks, Promises, and Async/Await', path: 'javascript', day: 5, prerequisites: ['3'], isLocked: true, completionRate: 38, studentsStuck: 156 },
];

const mockAutomationRules: AutomationRule[] = [
  { id: '1', name: 'Inactivity Reminder', trigger: 'inactivity', condition: 'User has not logged in for 2 days', action: 'send_sms', template: 'streak_reminder', enabled: true, schedule: '10:00 AM' },
  { id: '2', name: 'Streak Danger Alert', trigger: 'streak_danger', condition: 'Streak about to break (< 2 hours left)', action: 'both', template: 'streak_reminder', enabled: true, schedule: '8:00 PM' },
  { id: '3', name: 'Milestone Congratulations', trigger: 'milestone', condition: 'User completed 7-day streak', action: 'send_email', template: 'daily_todo', enabled: true },
];

const mockApiIntegrations: ApiIntegration[] = [
  { id: '1', service: 'sendgrid', apiKey: 'SG.●●●●●●●●●●●●●●●●●●●●', isActive: true, lastTested: new Date(Date.now() - 86400000) },
  { id: '2', service: 'twilio', apiKey: 'SK●●●●●●●●●●●●●●●●●●●●', isActive: false },
  { id: '3', service: 'postmark', apiKey: '●●●●●●●●●●●●●●●●●●●●', isActive: true, lastTested: new Date(Date.now() - 3600000) },
];

// Components
const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <Card variant="glass" className="p-5">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend !== undefined && (
        <Badge variant={trend > 0 ? 'success' : 'warning'} size="sm">
          <TrendingUp className="w-3 h-3 mr-0.5" />{trend > 0 ? '+' : ''}{trend}%
        </Badge>
      )}
    </div>
    <p className="text-2xl font-bold mt-3">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </Card>
);

const UserRow = ({ user, onAction, onNudge }: { user: User; onAction: (action: string, user: User) => void; onNudge: (user: User) => void }) => {
  const statusColors = { active: 'success' as const, banned: 'error' as const, shadow_banned: 'warning' as const, temp_banned: 'warning' as const };
  const roleColors = { student: 'default' as const, moderator: 'info' as const, instructor: 'primary' as const, admin: 'error' as const };

  return (
    <div className="glass p-4 rounded-xl flex items-center justify-between group hover:bg-white/5">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center font-bold flex-shrink-0">
          {user.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{user.name}</span>
            <Badge variant={roleColors[user.role]} size="sm">{user.role}</Badge>
            <Badge variant={statusColors[user.status]} size="sm">{user.status.replace('_', ' ')}</Badge>
            {user.emailProvider && (
              <Badge variant="outline" size="sm">
                {user.emailProvider === 'gmail' ? '📧 Gmail' : user.emailProvider === 'outlook' ? '📨 Outlook' : '📬 Other'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{user.email}</span>
            {user.phone && <span>• {user.phone}</span>}
            {user.currentGoal && (
              <Badge variant="info" size="sm" className="text-xs">
                <Target className="w-2.5 h-2.5 mr-0.5" />
                {user.currentGoal}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm">{user.subscription}</p>
            <p className="text-xs text-muted-foreground">Day {user.roadmapDay || '--'}</p>
          </div>
          <ProgressBar value={user.progress} className="w-20" />
        </div>
      </div>
      <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => onNudge(user)}>
          <span className="sr-only">Send Reminder</span>
          <Bell className="w-4 h-4 text-yellow-400" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction('view', user)}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction('promote', user)}>
          <UserCog className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction('ban', user)} className="text-red-400">
          <Ban className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState<User[]>(mockUsers);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates);
  const [roadmapTopics, setRoadmapTopics] = useState<RoadmapTopic[]>(mockRoadmapTopics);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(mockAutomationRules);
  const [apiIntegrations, setApiIntegrations] = useState<ApiIntegration[]>(mockApiIntegrations);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  // Notification Dispatcher State
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<{ email: boolean; sms: boolean }>({ email: true, sms: false });
  const [isSending, setIsSending] = useState(false);

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNudge = (user: User) => {
    showNotification('success', `Reminder sent to ${user.name} via ${user.emailProvider || 'email'}`);
  };

  const handleUserAction = (action: string, user: User) => {
    switch (action) {
      case 'promote':
        showNotification('success', `${user.name} promoted`);
        break;
      case 'ban':
        showNotification('warning', `${user.name} has been banned`);
        break;
    }
  };

  const handleSendNotification = () => {
    if (!selectedTemplate && !customMessage) {
      showNotification('warning', 'Please select a template or write a message');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showNotification('success', `Notification sent to ${selectedRecipient === 'all' ? 'all users' : selectedRecipient}`);
    }, 1500);
  };

  const handleSaveApiKey = (id: string, key: string) => {
    setApiIntegrations(integrations => 
      integrations.map(i => i.id === id ? { ...i, apiKey: key, isActive: true, lastTested: new Date() } : i)
    );
    showNotification('success', 'API key saved and verified');
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(rules => rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const toggleRoadmapLock = (id: string) => {
    setRoadmapTopics(topics => topics.map(t => t.id === id ? { ...t, isLocked: !t.isLocked } : t));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedIntegrations = apiIntegrations.filter(i => i.isActive).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-8">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 z-50" />
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={cn('fixed top-16 right-8 z-50 p-4 rounded-xl glass-heavy border shadow-2xl', notification.type === 'success' ? 'border-green-500/50' : 'border-yellow-500/50')}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
              <span className="text-sm">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-400" />
            Admin Command Center
          </h1>
          <p className="text-muted-foreground mt-1">Platform management, notifications, roadmap & automation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowNotificationPanel(true)}>
            <Send className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto glass p-1">
          <TabsTrigger value="overview"><LayoutDashboard className="w-3 h-3 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="users"><UsersIcon className="w-3 h-3 mr-1" />Users</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-3 h-3 mr-1" />Notifications</TabsTrigger>
          <TabsTrigger value="roadmap"><Route className="w-3 h-3 mr-1" />Roadmap</TabsTrigger>
          <TabsTrigger value="automation"><Workflow className="w-3 h-3 mr-1" />Automation</TabsTrigger>
          <TabsTrigger value="integrations"><Webhook className="w-3 h-3 mr-1" />Integrations</TabsTrigger>
          <TabsTrigger value="system"><Server className="w-3 h-3 mr-1" />System</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={UsersIcon} label="Total Users" value={12450} trend={12} color="from-blue-500 to-cyan-500" />
              <StatCard icon={ZapIcon} label="Active Now" value={342} trend={8} color="from-green-500 to-emerald-500" />
              <StatCard icon={Bell} label="Notifications Sent" value={1247} color="from-purple-500 to-pink-500" />
              <StatCard icon={AlertTriangle} label="Students Stuck" value={89} trend={-5} color="from-yellow-500 to-orange-500" />
            </div>

            {/* ACTION CENTER - New Card */}
            <Card variant="glass" className="p-6 border-primary/30 bg-gradient-to-r from-primary/5 to-blue-500/5">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Action Center
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={() => setShowNotificationPanel(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 h-auto py-4 flex-col">
                  <Send className="w-6 h-6" />
                  <span className="text-sm">Send Notification</span>
                </Button>
                <Button onClick={() => setActiveTab('roadmap')} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 h-auto py-4 flex-col">
                  <Route className="w-6 h-6" />
                  <span className="text-sm">Edit Roadmap</span>
                </Button>
                <Button onClick={() => setActiveTab('automation')} className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 h-auto py-4 flex-col">
                  <Workflow className="w-6 h-6" />
                  <span className="text-sm">Automation Rules</span>
                </Button>
                <Button onClick={() => setActiveTab('integrations')} className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 h-auto py-4 flex-col">
                  <Webhook className="w-6 h-6" />
                  <span className="text-sm">API Integrations</span>
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="glass p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={i === 1 ? 'success' : i === 2 ? 'warning' : 'info'} size="sm">
                          {i === 1 ? 'NOTIFICATION' : i === 2 ? 'ROADMAP' : 'USER'}
                        </Badge>
                        <span className="text-sm">
                          {i === 1 ? 'Daily todo sent to 342 users' : i === 2 ? 'React Day 3 updated' : 'New user registered'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(new Date(Date.now() - i * 3600000))}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <h3 className="font-semibold mb-4">System Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={Server} label="API" value="Online" color="from-green-500 to-emerald-500" />
                  <StatCard icon={Database} label="DB" value="Online" color="from-green-500 to-emerald-500" />
                  <StatCard icon={Cloud} label="Email" value={connectedIntegrations >= 1 ? 'Connected' : 'Offline'} color={connectedIntegrations >= 1 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'} />
                  <StatCard icon={Smartphone} label="SMS" value={apiIntegrations.find(i => i.service === 'twilio')?.isActive ? 'Connected' : 'Offline'} color={apiIntegrations.find(i => i.service === 'twilio')?.isActive ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'} />
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== USERS TAB (Enhanced) ===== */}
        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users by name, email, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
              <Button><UserPlus className="w-4 h-4 mr-2" />Add User</Button>
            </div>

            <Card variant="glass" className="p-4 space-y-3">
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} onAction={handleUserAction} onNudge={handleNudge} />
              ))}
            </Card>
          </div>
        </TabsContent>

        {/* ===== NOTIFICATIONS TAB (NEW) ===== */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Notification Dispatcher */}
            <Card variant="glass" className="p-6 border-primary/30">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Notification Dispatcher
              </h3>
              <div className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient</label>
                  <div className="flex gap-2">
                    <select 
                      value={selectedRecipient} 
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm flex-1"
                    >
                      <option value="all">All Users</option>
                      <option value="premium">All Premium Users</option>
                      <option value="free">All Free Users</option>
                      <option value="inactive">Inactive Users (2+ days)</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                    <Input 
                      placeholder="Search specific user..." 
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Template Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Message Template</label>
                  <div className="grid grid-cols-3 gap-2">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setSelectedTemplate(t.id); setCustomMessage(t.body); }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedTemplate === t.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {t.type === 'daily_todo' ? <ListOrdered className="w-3 h-3 text-blue-400" /> :
                           t.type === 'streak_reminder' ? <Flame className="w-3 h-3 text-orange-400" /> :
                           <Bell className="w-3 h-3 text-purple-400" />}
                          <span className="text-sm font-medium">{t.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.subject}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Channels</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedChannels(s => ({ ...s, email: !s.email }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedChannels.email ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-border'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      onClick={() => setSelectedChannels(s => ({ ...s, sms: !s.sms }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedChannels.sms ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-border'
                      }`}
                    >
                      <PhoneIcon className="w-4 h-4" />
                      SMS
                    </button>
                  </div>
                </div>

                {/* Message Editor */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Message Body</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Write your notification message... Use {{name}}, {{day}}, {{streak}}, {{nextTopic}} as placeholders"
                    className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['{{name}}', '{{day}}', '{{streak}}', '{{nextTopic}}', '{{assignmentName}}', '{{progress}}'].map(placeholder => (
                      <button
                        key={placeholder}
                        onClick={() => setCustomMessage(prev => prev + ' ' + placeholder)}
                        className="px-2 py-0.5 text-xs bg-background border border-border rounded hover:border-primary/50 transition-colors"
                      >
                        {placeholder}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSendNotification} disabled={isSending} className="gap-2">
                    {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isSending ? 'Sending...' : 'Send Now'}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Clock3 className="w-4 h-4" />
                    Schedule
                  </Button>
                  <Button variant="ghost" onClick={() => { setCustomMessage(''); setSelectedTemplate(''); }}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </Card>

            {/* Template Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Notification Templates</h3>
                  <Button size="sm"><Plus className="w-3 h-3 mr-1" />New Template</Button>
                </div>
                <div className="space-y-3">
                  {templates.map(t => (
                    <div key={t.id} className="glass p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{t.name}</span>
                          <Badge size="sm">{t.channel}</Badge>
                        </div>
                        <Switch 
  checked={t.enabled} 
  onChange={() => setTemplates(prev => prev.map(template => 
    template.id === t.id ? { ...template, enabled: !template.enabled } : template
  ))} 
/>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.body}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Preview */}
              <Card variant="glass" className="p-6">
                <h3 className="font-semibold mb-4">Live Preview</h3>
                <div className="space-y-4">
                  {templates.filter(t => t.id === selectedTemplate || selectedTemplate === '').slice(0, 2).map(t => (
                    <div key={t.id} className="p-4 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        {t.channel === 'email' ? '📧 Email Preview' : t.channel === 'sms' ? '📱 SMS Preview' : '📧📱 Multi-channel'}
                      </p>
                      <p className="text-sm font-medium mb-1">{t.subject}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {t.body.replace(/{{name}}/g, 'John').replace(/{{day}}/g, '12').replace(/{{streak}}/g, '5').replace(/{{nextTopic}}/g, 'React Hooks').replace(/{{assignmentName}}/g, 'Array Methods').replace(/{{progress}}/g, '75')}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== ROADMAP TAB (NEW) ===== */}
        <TabsContent value="roadmap">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Route className="w-6 h-6 text-primary" />
                Roadmap Content Manager
              </h2>
              <Button><Plus className="w-4 h-4 mr-2" />Add Topic</Button>
            </div>

            {/* Path Selector */}
            <div className="flex gap-2">
              {['javascript', 'python', 'java', 'cpp'].map(path => (
                <Button key={path} variant="outline" size="sm" className="capitalize">
                  {path === 'javascript' ? '📜' : path === 'python' ? '🐍' : path === 'java' ? '☕' : '⚡'} {path}
                </Button>
              ))}
            </div>

            {/* Roadmap Tree */}
            <div className="space-y-3">
              {roadmapTopics.map((topic, i) => (
                <Card key={topic.id} variant="glass" className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm">
                      Day {topic.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{topic.title}</h4>
                        {topic.isLocked && <Lock className="w-3 h-3 text-yellow-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{topic.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Prerequisites: {topic.prerequisites.length > 0 ? topic.prerequisites.map(p => `Day ${p}`).join(', ') : 'None'}
                        </span>
                        <Badge variant="info" size="sm">{topic.completionRate}% complete</Badge>
                        <Badge variant="warning" size="sm">{topic.studentsStuck} stuck</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleRoadmapLock(topic.id)}>
                        {topic.isLocked ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-yellow-400" />}
                      </Button>
                      <Button variant="ghost" size="sm"><MoveVertical className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="sm"><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    </div>
                  </div>
                  {i < roadmapTopics.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Progress Oversight */}
            <Card variant="glass" className="p-6">
              <h3 className="font-semibold mb-4">Student Progress Oversight</h3>
              <div className="space-y-3">
                {roadmapTopics.filter(t => t.studentsStuck > 50).map(topic => (
                  <div key={topic.id} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{topic.title} (Day {topic.day})</p>
                      <p className="text-xs text-muted-foreground">{topic.studentsStuck} students stuck here</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedTemplate('3');
                        setCustomMessage(`Hey! Many students are stuck on "${topic.title}". Need help? Reply to this message!`);
                        setActiveTab('notifications');
                      }}>
                        <Bell className="w-3 h-3 mr-1" /> Send Help Blast
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ===== AUTOMATION TAB (NEW) ===== */}
        <TabsContent value="automation">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Workflow className="w-6 h-6 text-primary" />
                Automation Rules
              </h2>
              <Button><Plus className="w-4 h-4 mr-2" />New Rule</Button>
            </div>

            {automationRules.map(rule => (
              <Card key={rule.id} variant="glass" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Workflow className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-xs text-muted-foreground">{rule.condition}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trigger:</span>
                        <Badge variant="info" size="sm" className="ml-2">{rule.trigger}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Action:</span>
                        <Badge variant="warning" size="sm" className="ml-2">{rule.action}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Schedule:</span>
                        <span className="ml-2 font-medium">{rule.schedule || 'On trigger'}</span>
                      </div>
                    </div>
                  </div>
                  <Switch checked={rule.enabled} onChange={() => toggleAutomationRule(rule.id)} />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== INTEGRATIONS TAB (NEW) ===== */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Webhook className="w-6 h-6 text-primary" />
              API Integrations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apiIntegrations.map(integration => (
                <Card key={integration.id} variant="glass" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      {integration.service === 'sendgrid' ? <Mail className="w-6 h-6 text-white" /> :
                       integration.service === 'twilio' ? <PhoneIcon className="w-6 h-6 text-white" /> :
                       <Webhook className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">{integration.service}</h3>
                      <Badge variant={integration.isActive ? 'success' : 'outline'} size="sm" className="mt-1">
                        {integration.isActive ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">API Key</label>
                      <div className="flex gap-2">
                        <Input 
                          type="password" 
                          value={integration.apiKey} 
                          placeholder="Enter API key..." 
                          className="font-mono text-sm"
                          onChange={(e) => {
                            setApiIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, apiKey: e.target.value } : i));
                          }}
                        />
                        <Button size="sm" onClick={() => handleSaveApiKey(integration.id, integration.apiKey)}>Save</Button>
                      </div>
                    </div>
                    {integration.lastTested && (
                      <p className="text-xs text-green-400">✓ Last tested: {formatTime(integration.lastTested)}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ===== SYSTEM TAB ===== */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="font-semibold mb-4">System Status</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {['API', 'Database', 'AI Service'].map(service => (
                  <div key={service} className="glass p-4 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">{service}</p>
                    <p className="text-xs text-green-400">Operational</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Notification Panel Modal */}
      <AnimatePresence>
        {showNotificationPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowNotificationPanel(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="max-w-2xl w-full glass-heavy rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Send Notification
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowNotificationPanel(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="all">All Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="inactive">Inactive Users</option>
                </select>
                <select 
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  value={selectedTemplate}
                  onChange={e => { setSelectedTemplate(e.target.value); const t = templates.find(t => t.id === e.target.value); if (t) setCustomMessage(t.body); }}
                >
                  <option value="">Select a template...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <textarea 
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="w-full h-40 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary"
                  placeholder="Write your message..."
                />
                <div className="flex gap-3">
                  <Button onClick={handleSendNotification} disabled={isSending} className="flex-1 gap-2">
                    {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Now
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Clock3 className="w-4 h-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}