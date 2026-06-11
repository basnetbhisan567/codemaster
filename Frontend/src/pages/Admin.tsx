import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  Users, UserPlus, Shield, Bell, AlertTriangle,
  Search, Filter, Settings, Activity, TrendingUp,
  Zap, Lock, Unlock,
  Ban, Edit, Trash2, Plus, RefreshCw,
  ChevronRight, X,
  Mail, Phone,
  Server, Cloud,
  Send, MessageCircle, Smartphone as PhoneIcon,
  Route, Timer, BellRing, Webhook,
  Workflow, Flame, Calendar,
  LayoutDashboard, ListOrdered
} from 'lucide-react';
import { cn } from '../utils/cn';

// ============================================
// TYPES
// ============================================
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: 'student' | 'moderator' | 'instructor' | 'admin';
  status: 'active' | 'banned' | 'shadow_banned' | 'temp_banned';
  banExpiry?: Date;
  joinedAt: Date;
  lastActive: Date;
  progress: number;
  subscription: 'free' | 'pro' | 'enterprise';
  currentGoal?: string;
  roadmapDay?: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'daily_todo' | 'task_reminder' | 'topic_update' | 'streak_reminder' | 'custom';
  subject: string;
  body: string;
  channel: 'email' | 'sms' | 'both';
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
  trigger: 'inactivity' | 'streak_danger' | 'milestone' | 'schedule' | 'custom';
  condition: string;
  action: 'send_email' | 'send_sms' | 'both';
  template: string;
  enabled: boolean;
  schedule?: { time: string; days: string[] };
}

interface ApiIntegration {
  id: string;
  service: 'sendgrid' | 'twilio' | 'postmark' | 'firebase';
  apiKey: string;
  isActive: boolean;
  lastTested?: Date;
}

interface ScheduleConfig {
  date: string;
  time: string;
  timezone: string;
}

// ============================================
// TIMEZONE LIST
// ============================================
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

// ============================================
// MOCK DATA
// ============================================
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@gmail.com', phone: '+1-555-0101', avatar: 'JD', role: 'student', status: 'active', joinedAt: new Date('2024-01-15'), lastActive: new Date(), progress: 45, subscription: 'pro', currentGoal: 'React Basics', roadmapDay: 12 },
  { id: '2', name: 'Jane Smith', email: 'jane@outlook.com', phone: '+1-555-0102', avatar: 'JS', role: 'instructor', status: 'active', joinedAt: new Date('2023-11-20'), lastActive: new Date(Date.now() - 86400000), progress: 78, subscription: 'enterprise', currentGoal: 'Advanced React', roadmapDay: 28 },
  { id: '3', name: 'Bob Johnson', email: 'bob@yahoo.com', phone: '+1-555-0103', avatar: 'BJ', role: 'student', status: 'temp_banned', banExpiry: new Date(Date.now() + 86400000 * 3), joinedAt: new Date('2024-02-01'), lastActive: new Date(Date.now() - 172800000), progress: 12, subscription: 'free', currentGoal: 'JavaScript Basics', roadmapDay: 3 },
];

const mockTemplates: NotificationTemplate[] = [
  { id: '1', name: 'Daily Todo', type: 'daily_todo', subject: 'Your Daily Coding Tasks', body: 'Hey {{name}}, here are your tasks for today:\n\n✅ Complete lesson\n✅ Solve 3 problems\n✅ Review notes\n\nKeep up the streak! 🔥', channel: 'both', enabled: true },
  { id: '2', name: 'Streak Reminder', type: 'streak_reminder', subject: "Don't Break Your Streak!", body: 'Day {{day}} starts now! Don\'t break your {{streak}}-day streak. {{nextTopic}} is waiting. 🚀', channel: 'sms', enabled: true },
  { id: '3', name: 'Task Reminder', type: 'task_reminder', subject: 'Reminder: {{assignmentName}}', body: 'Hey {{name}}, finish your "{{assignmentName}}" assignment today! You\'re {{progress}}% done.', channel: 'email', enabled: true },
];

const mockRoadmapTopics: RoadmapTopic[] = [
  { id: '1', title: 'Variables & Data Types', description: 'Learn var, let, const and primitive types', path: 'javascript', day: 1, prerequisites: [], isLocked: false, completionRate: 92, studentsStuck: 12 },
  { id: '2', title: 'Functions & Scope', description: 'Function declarations, expressions, and scope chain', path: 'javascript', day: 2, prerequisites: ['1'], isLocked: false, completionRate: 78, studentsStuck: 45 },
  { id: '3', title: 'Arrays & Methods', description: 'Map, filter, reduce, and array methods', path: 'javascript', day: 3, prerequisites: ['2'], isLocked: true, completionRate: 65, studentsStuck: 89 },
  { id: '4', title: 'Objects & Prototypes', description: 'Object literals, constructors, inheritance', path: 'javascript', day: 4, prerequisites: ['3'], isLocked: true, completionRate: 54, studentsStuck: 120 },
  { id: '5', title: 'Async Programming', description: 'Callbacks, Promises, Async/Await', path: 'javascript', day: 5, prerequisites: ['3'], isLocked: true, completionRate: 38, studentsStuck: 156 },
];

const mockAutomationRules: AutomationRule[] = [
  { id: '1', name: 'Inactivity Nudge', trigger: 'inactivity', condition: 'No login for 2 days', action: 'send_sms', template: 'streak_reminder', enabled: true, schedule: { time: '10:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] } },
  { id: '2', name: 'Streak Danger Alert', trigger: 'streak_danger', condition: 'Less than 2 hours left', action: 'both', template: 'streak_reminder', enabled: true },
  { id: '3', name: 'Weekly Progress Report', trigger: 'schedule', condition: 'Every Monday 8 AM', action: 'send_email', template: 'daily_todo', enabled: true, schedule: { time: '08:00', days: ['Mon'] } },
];

const mockApiIntegrations: ApiIntegration[] = [
  { id: '1', service: 'sendgrid', apiKey: 'SG.●●●●●●●●●●●●●●●●●●●●', isActive: true, lastTested: new Date(Date.now() - 86400000) },
  { id: '2', service: 'twilio', apiKey: 'SK●●●●●●●●●●●●●●●●●●●●', isActive: false },
  { id: '3', service: 'postmark', apiKey: '●●●●●●●●●●●●●●●●●●●●', isActive: true, lastTested: new Date(Date.now() - 3600000) },
];

// ============================================
// SUB-COMPONENTS
// ============================================
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
  const statusColors: any = { active: 'success', banned: 'error', shadow_banned: 'warning', temp_banned: 'warning' };
  const roleColors: any = { student: 'default', moderator: 'info', instructor: 'primary', admin: 'error' };

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
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{user.email}</span>
            {user.phone && <span>• {user.phone}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm">{user.subscription}</p>
          <p className="text-xs text-muted-foreground">Day {user.roadmapDay || '--'}</p>
        </div>
        <ProgressBar value={user.progress} className="w-20" />
      </div>
      <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => onNudge(user)}>
          <Bell className="w-4 h-4 text-yellow-400" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction('ban', user)} className="text-red-400">
          <Ban className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================
// MAIN ADMIN COMPONENT
// ============================================
export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState<User[]>(mockUsers);
  const [templates] = useState<NotificationTemplate[]>(mockTemplates);
  const [roadmapTopics, setRoadmapTopics] = useState<RoadmapTopic[]>(mockRoadmapTopics);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(mockAutomationRules);
  const [apiIntegrations, setApiIntegrations] = useState<ApiIntegration[]>(mockApiIntegrations);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  // Unified Notification State
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'both'>('email');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [isScheduled, setIsScheduled] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNudge = (user: User) => {
    showNotification('success', `Reminder sent to ${user.name}`);
  };

  const handleUserAction = (action: string, user: User) => {
    if (action === 'ban') showNotification('warning', `${user.name} has been banned`);
  };

  const handleSendNotification = () => {
    if (!selectedTemplate && !customMessage) {
      showNotification('warning', 'Please select a template or write a message');
      return;
    }
    if (selectedChannel === 'email' && !recipientEmail && selectedRecipient === 'custom') {
      showNotification('warning', 'Please enter recipient email');
      return;
    }
    if (selectedChannel === 'sms' && !recipientPhone && selectedRecipient === 'custom') {
      showNotification('warning', 'Please enter recipient phone number');
      return;
    }
    if (isScheduled && (!scheduleConfig.date || !scheduleConfig.time)) {
      showNotification('warning', 'Please set schedule date and time');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const scheduleInfo = isScheduled
        ? `scheduled for ${scheduleConfig.date} at ${scheduleConfig.time}`
        : 'sent now';
      showNotification('success', `Notification ${scheduleInfo}`);
      setShowNotificationPanel(false);
    }, 1500);
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(rules => rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const toggleRoadmapLock = (id: string) => {
    setRoadmapTopics(topics => topics.map(t => t.id === id ? { ...t, isLocked: !t.isLocked } : t));
  };

  const handleSaveApiKey = (id: string, key: string) => {
    setApiIntegrations(integrations =>
      integrations.map(i => i.id === id ? { ...i, apiKey: key, isActive: true, lastTested: new Date() } : i)
    );
    showNotification('success', 'API key saved and verified');
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedIntegrations = apiIntegrations.filter(i => i.isActive).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-8">
      {/* Admin Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 z-50" />

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-16 right-8 z-50 p-4 rounded-xl glass-heavy border shadow-2xl',
              notification.type === 'success' ? 'border-green-500/50' : 'border-yellow-500/50'
            )}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <AlertTriangle className="w-5 h-5 text-green-400" style={{ display: 'none' }} />
              ) : null}
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
          <p className="text-muted-foreground mt-1">Platform management • Notifications • Automation</p>
        </div>
        <Button onClick={() => setShowNotificationPanel(true)} className="gap-2 bg-gradient-to-r from-primary to-blue-600">
          <Send className="w-4 h-4" />
          Send Notification
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto glass p-1">
          <TabsTrigger value="overview"><LayoutDashboard className="w-3 h-3 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-3 h-3 mr-1" />Users</TabsTrigger>
          <TabsTrigger value="roadmap"><Route className="w-3 h-3 mr-1" />Roadmap</TabsTrigger>
          <TabsTrigger value="automation"><Workflow className="w-3 h-3 mr-1" />Automation</TabsTrigger>
          <TabsTrigger value="integrations"><Webhook className="w-3 h-3 mr-1" />Integrations</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={12450} trend={12} color="from-blue-500 to-cyan-500" />
              <StatCard icon={Zap} label="Active Now" value={342} trend={8} color="from-green-500 to-emerald-500" />
              <StatCard icon={Bell} label="Notifications Sent" value={1247} color="from-purple-500 to-pink-500" />
              <StatCard icon={AlertTriangle} label="Students Stuck" value={89} trend={-5} color="from-yellow-500 to-orange-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-green-400" />
                  System Health
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'API Server', status: 'Operational', color: 'green' },
                    { name: 'Database', status: 'Operational', color: 'green' },
                    { name: 'Email Service', status: connectedIntegrations >= 1 ? 'Connected' : 'Offline', color: connectedIntegrations >= 1 ? 'green' : 'red' },
                    { name: 'SMS Service', status: apiIntegrations.find(i => i.service === 'twilio')?.isActive ? 'Connected' : 'Offline', color: apiIntegrations.find(i => i.service === 'twilio')?.isActive ? 'green' : 'red' },
                  ].map(svc => (
                    <div key={svc.name} className="flex items-center justify-between p-3 glass rounded-lg">
                      <span className="text-sm">{svc.name}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${svc.color === 'green' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className={`text-xs ${svc.color === 'green' ? 'text-green-400' : 'text-red-400'}`}>{svc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={i === 1 ? 'success' : i === 2 ? 'warning' : 'info'} size="sm">
                          {i === 1 ? 'SENT' : i === 2 ? 'ROADMAP' : 'USER'}
                        </Badge>
                        <span className="text-sm">
                          {i === 1 ? 'Daily todo sent to 342 users' : i === 2 ? 'React Day 3 updated' : 'New user registered'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{i}h ago</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== USERS ===== */}
        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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

        {/* ===== ROADMAP ===== */}
        <TabsContent value="roadmap">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Route className="w-6 h-6 text-primary" />
                Roadmap Manager
              </h2>
              <Button><Plus className="w-4 h-4 mr-2" />Add Topic</Button>
            </div>

            <div className="flex gap-2">
              {(['javascript', 'python', 'java', 'cpp'] as const).map(path => (
                <Button key={path} variant="outline" size="sm" className="capitalize">
                  {path === 'javascript' ? '📜' : path === 'python' ? '🐍' : path === 'java' ? '☕' : '⚡'} {path}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {roadmapTopics.map((topic, i) => (
                <Card key={topic.id} variant="glass" className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm">
                      {topic.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{topic.title}</h4>
                        {topic.isLocked && <Lock className="w-3 h-3 text-yellow-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{topic.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="info" size="sm">{topic.completionRate}% complete</Badge>
                        <Badge variant="warning" size="sm">{topic.studentsStuck} stuck</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleRoadmapLock(topic.id)}>
                        {topic.isLocked ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-yellow-400" />}
                      </Button>
                      <Button variant="ghost" size="sm"><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    </div>
                  </div>
                  {i < roadmapTopics.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ===== AUTOMATION ===== */}
        <TabsContent value="automation">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Workflow className="w-6 h-6 text-primary" />
                Automation Rules
              </h2>
              <Button><Plus className="w-4 h-4 mr-2" />New Rule</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {automationRules.map(rule => (
                <Card key={rule.id} variant="glass" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center ${
                          rule.trigger === 'inactivity' ? 'from-yellow-500 to-orange-500' :
                          rule.trigger === 'streak_danger' ? 'from-red-500 to-pink-500' :
                          rule.trigger === 'schedule' ? 'from-blue-500 to-cyan-500' :
                          'from-purple-500 to-pink-500'
                        }`}>
                          {rule.trigger === 'inactivity' ? <Timer className="w-5 h-5 text-white" /> :
                           rule.trigger === 'streak_danger' ? <Flame className="w-5 h-5 text-white" /> :
                           rule.trigger === 'schedule' ? <Calendar className="w-5 h-5 text-white" /> :
                           <Workflow className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{rule.name}</h3>
                          <p className="text-xs text-muted-foreground">{rule.condition}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-background/30 rounded-lg">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1" style={{ display: 'block' }}>Trigger Type</label>
                          <Badge variant="info" size="sm" className="capitalize">{rule.trigger.replace('_', ' ')}</Badge>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1" style={{ display: 'block' }}>Action</label>
                          <Badge variant="warning" size="sm">{rule.action === 'both' ? 'Email + SMS' : rule.action === 'send_email' ? 'Email' : 'SMS'}</Badge>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1" style={{ display: 'block' }}>Template</label>
                          <span className="text-sm">{templates.find(t => t.id === rule.template)?.name || rule.template}</span>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1" style={{ display: 'block' }}>Schedule</label>
                          <span className="text-sm">
                            {rule.schedule
                              ? `${rule.schedule.time} on ${rule.schedule.days.join(', ')}`
                              : 'On trigger'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Switch checked={rule.enabled} onChange={() => toggleAutomationRule(rule.id)} />
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card variant="glass" className="p-6">
              <h3 className="font-semibold mb-4">Automation Performance</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="glass p-4 rounded-xl">
                  <p className="text-2xl font-bold text-green-400">{automationRules.filter(r => r.enabled).length}</p>
                  <p className="text-xs text-muted-foreground">Active Rules</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-2xl font-bold text-blue-400">1,247</p>
                  <p className="text-xs text-muted-foreground">Automated This Month</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-2xl font-bold text-purple-400">98.5%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ===== INTEGRATIONS ===== */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Webhook className="w-6 h-6 text-primary" />
              API Integrations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <label className="text-xs text-muted-foreground" style={{ display: 'block' }}>API Key</label>
                      <div className="flex gap-2 mt-1">
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
                      <p className="text-xs text-green-400">✓ Last tested: {integration.lastTested.toLocaleDateString()}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== UNIFIED NOTIFICATION PANEL (MODAL) ===== */}
      <AnimatePresence>
        {showNotificationPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowNotificationPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-xl w-full glass-heavy rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Send Notification
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowNotificationPanel(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Step 1: Recipient */}
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Recipient
                  </label>
                  <select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Users</option>
                    <option value="premium">Premium Users Only</option>
                    <option value="free">Free Users Only</option>
                    <option value="inactive">Inactive Users (2+ days)</option>
                    <option value="custom">Specific User</option>
                  </select>

                  {selectedRecipient === 'custom' && (
                    <div className="mt-3 space-y-3">
                      <Input
                        placeholder="Enter recipient email..."
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        type="email"
                      />
                      <Input
                        placeholder="Enter recipient phone (+1-555-0101)..."
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        type="tel"
                      />
                    </div>
                  )}
                </div>

                {/* Step 2: Channel */}
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-muted-foreground" />
                    Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'email' as const, icon: Mail, label: 'Email' },
                      { value: 'sms' as const, icon: PhoneIcon, label: 'SMS' },
                      { value: 'both' as const, icon: MessageCircle, label: 'Both' },
                    ]).map(ch => (
                      <button
                        key={ch.value}
                        onClick={() => setSelectedChannel(ch.value)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                          selectedChannel === ch.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <ch.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{ch.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Template */}
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Template
                  </label>
                  <div className="grid grid-cols-1 gap-2">
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
                          <Badge size="sm" variant="outline">{t.channel}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.subject}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Message */}
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                    Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Write your notification message..."
                    className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {['{{name}}', '{{day}}', '{{streak}}', '{{nextTopic}}', '{{assignmentName}}', '{{progress}}'].map(p => (
                      <button
                        key={p}
                        onClick={() => setCustomMessage(prev => prev + ' ' + p)}
                        className="px-2 py-1 text-[10px] bg-background border border-border rounded-md hover:border-primary/50 transition-colors text-muted-foreground hover:text-white"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 5: Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Schedule (Optional)
                    </label>
                    <Switch checked={isScheduled} onChange={setIsScheduled} />
                  </div>

                  {isScheduled && (
                    <div className="space-y-3 p-4 bg-background/30 rounded-lg border border-border">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1" style={{ display: 'block' }}>Date</label>
                          <input
                            type="date"
                            value={scheduleConfig.date}
                            onChange={(e) => setScheduleConfig(prev => ({ ...prev, date: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1" style={{ display: 'block' }}>Time</label>
                          <input
                            type="time"
                            value={scheduleConfig.time}
                            onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1" style={{ display: 'block' }}>Timezone</label>
                        <select
                          value={scheduleConfig.timezone}
                          onChange={(e) => setScheduleConfig(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        >
                          {TIMEZONES.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                      </div>
                      {scheduleConfig.date && scheduleConfig.time && (
                        <p className="text-xs text-primary">
                          Will send on {new Date(`${scheduleConfig.date}T${scheduleConfig.time}`).toLocaleString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                <Button onClick={handleSendNotification} disabled={isSending} className="flex-1 gap-2 bg-gradient-to-r from-primary to-blue-600">
                  {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSending ? 'Sending...' : isScheduled ? 'Schedule Notification' : 'Send Now'}
                </Button>
                <Button variant="ghost" onClick={() => {
                  setCustomMessage('');
                  setSelectedTemplate('');
                  setSelectedChannel('email');
                  setRecipientEmail('');
                  setRecipientPhone('');
                  setIsScheduled(false);
                  setScheduleConfig({ date: '', time: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
                }}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}