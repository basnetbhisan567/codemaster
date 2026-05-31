import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  User,
  Lock,
  Shield,
  Bell,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  Key,
  Trash2,
  Download,
  Save,
  AlertTriangle,
  Target,
  Layout,
  Code,
  Palette,
  Smartphone,
  Settings as SettingsIcon,
  RotateCcw,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Search,
  Copy,
  Check,
  Phone,
  Calendar,
  Clock,
  Zap,
  Archive,
  VolumeX,
  Cloud,
  CloudRain,
  Flame,
  Waves,
  TreePine,
  CreditCard,
  Receipt,
  History,
  Globe,
  CloudMoon,
  MoonStar,
  ExternalLink,
  Languages,
  Clock3,
  Database
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useLockdownStore } from '../stores/lockdownStore';
import { useUIStore } from '../stores/uiStore';
import { toast } from 'sonner';

type ThemeId =
  | 'dark'
  | 'light'
  | 'system'
  | 'solarized'
  | 'monokai'
  | 'nord'
  | 'ocean'
  | 'forest'
  | 'sunset';

type DensityId = 'compact' | 'comfortable' | 'large';
type FontId = 'inter' | 'fira' | 'jetbrains' | 'cascadia';
type FocusSoundId = 'waves' | 'rain' | 'fire' | 'cafe' | 'none';
type T2FMethod = 'app' | 'sms' | 'email';
type DigestFrequency = 'daily' | 'weekly' | 'never';
type PaymentType = 'card' | 'paypal' | 'crypto';
type PaymentStatus = 'paid' | 'pending' | 'failed';
type CalendarProvider = 'google' | 'outlook' | 'apple';

interface PaymentMethod {
  id: string;
  type: PaymentType;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface BillingRecord {
  id: string;
  date: Date;
  amount: number;
  status: PaymentStatus;
  invoice: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: Date;
  lastUsed?: Date;
  permissions: string[];
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
}

interface UserSettings {
  profile: {
    displayName: string;
    email: string;
    bio: string;
    avatar: string;
    location: string;
    website: string;
    timezone: string;
    language: string;
  };
  appearance: {
    theme: ThemeId;
    density: DensityId;
    font: FontId;
    fontSize: number;
    sidebarCollapsed: boolean;
    highContrast: boolean;
    reduceMotion: boolean;
    glassEffects: boolean;
    particleEffects: boolean;
  };
  editor: {
    autoSave: boolean;
    autoSaveInterval: number;
    bracketColorization: boolean;
    tabSize: 2 | 4;
    wordWrap: boolean;
    defaultLanguage: string;
    fontLigatures: boolean;
    minimap: boolean;
    lineNumbers: boolean;
    highlightActiveLine: boolean;
    formatOnSave: boolean;
    suggestOnType: boolean;
    tabCompletion: boolean;
  };
  focus: {
    dailyGoalMinutes: number;
    weeklyGoalDays: number;
    autoStartMusic: boolean;
    autoStartDND: boolean;
    streakReminders: boolean;
    breakReminders: boolean;
    reminderInterval: number;
    breakDuration: number;
    longBreakInterval: number;
    blockDistractions: boolean;
    whiteNoise: boolean;
    focusSound: FocusSoundId;
  };
  notifications: {
    channels: {
      email: boolean;
      sms: boolean;
      push: boolean;
      desktop: boolean;
    };
    preferences: {
      courseStarts: { email: boolean; sms: boolean; push: boolean };
      newTopics: { email: boolean; sms: boolean; push: boolean };
      assignmentDeadlines: { email: boolean; sms: boolean; push: boolean };
      achievements: { email: boolean; push: boolean };
      streak: { email: boolean; push: boolean };
      comments: { email: boolean; push: boolean };
      mentions: { email: boolean; push: boolean };
    };
    phoneVerification: {
      phoneNumber: string;
      verified: boolean;
    };
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      excludeWeekends: boolean;
    };
    digest: {
      enabled: boolean;
      frequency: DigestFrequency;
      time: string;
    };
  };
  privacy: {
    profilePublic: boolean;
    showOnLeaderboard: boolean;
    showActivity: boolean;
    showEmail: boolean;
    showLocation: boolean;
    allowDataCollection: boolean;
    allowPersonalization: boolean;
    allowThirdParty: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    twoFactorMethod: T2FMethod;
    loginAlerts: boolean;
    trustedDevices: string[];
    sessionTimeout: number;
    passwordExpiry: number;
    loginHistory: boolean;
    biometricEnabled: boolean;
    recoveryCodes: string[];
  };
  integrations: {
    github: { connected: boolean; username: string };
    gitlab: { connected: boolean; username: string };
    bitbucket: { connected: boolean; username: string };
    slack: { connected: boolean; channel: string };
    discord: { connected: boolean; server: string };
    calendar: { connected: boolean; provider: CalendarProvider };
  };
  payment: {
    defaultMethod: string;
    billingAddress: string;
    billingEmail: string;
    taxId: string;
    autoRenew: boolean;
    paymentMethods: PaymentMethod[];
    billingHistory: BillingRecord[];
  };
  api: {
    keys: ApiKey[];
    webhooks: Webhook[];
    rateLimit: number;
    allowedOrigins: string[];
  };
}

const defaultSettings: UserSettings = {
  profile: {
    displayName: 'Bhisan Basnet',
    email: 'basnetbhisan567b@gmail.com',
    bio: 'Passionate full-stack developer building the future of coding education.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bhisan',
    location: 'Kathmandu, Nepal',
    website: 'https://bhisanbasnet.com',
    timezone: 'Asia/Kathmandu',
    language: 'en'
  },
  appearance: {
    theme: 'dark',
    density: 'comfortable',
    font: 'inter',
    fontSize: 14,
    sidebarCollapsed: false,
    highContrast: false,
    reduceMotion: false,
    glassEffects: true,
    particleEffects: true
  },
  editor: {
    autoSave: true,
    autoSaveInterval: 5,
    bracketColorization: true,
    tabSize: 2,
    wordWrap: true,
    defaultLanguage: 'javascript',
    fontLigatures: true,
    minimap: true,
    lineNumbers: true,
    highlightActiveLine: true,
    formatOnSave: true,
    suggestOnType: true,
    tabCompletion: true
  },
  focus: {
    dailyGoalMinutes: 150,
    weeklyGoalDays: 5,
    autoStartMusic: true,
    autoStartDND: true,
    streakReminders: true,
    breakReminders: true,
    reminderInterval: 45,
    breakDuration: 5,
    longBreakInterval: 180,
    blockDistractions: true,
    whiteNoise: false,
    focusSound: 'waves'
  },
  notifications: {
    channels: {
      email: true,
      sms: false,
      push: true,
      desktop: true
    },
    preferences: {
      courseStarts: { email: true, sms: true, push: true },
      newTopics: { email: true, sms: false, push: true },
      assignmentDeadlines: { email: true, sms: true, push: true },
      achievements: { email: true, push: true },
      streak: { email: true, push: true },
      comments: { email: false, push: true },
      mentions: { email: true, push: true }
    },
    phoneVerification: {
      phoneNumber: '',
      verified: false
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
      excludeWeekends: true
    },
    digest: {
      enabled: true,
      frequency: 'weekly',
      time: '09:00'
    }
  },
  privacy: {
    profilePublic: true,
    showOnLeaderboard: true,
    showActivity: true,
    showEmail: false,
    showLocation: true,
    allowDataCollection: true,
    allowPersonalization: true,
    allowThirdParty: false
  },
  security: {
    twoFactorEnabled: false,
    twoFactorMethod: 'app',
    loginAlerts: true,
    trustedDevices: ['MacBook Pro', 'iPhone 15'],
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginHistory: true,
    biometricEnabled: false,
    recoveryCodes: []
  },
  integrations: {
    github: { connected: true, username: 'bhisanbasnet' },
    gitlab: { connected: false, username: '' },
    bitbucket: { connected: false, username: '' },
    slack: { connected: false, channel: '' },
    discord: { connected: true, server: 'CodeMaster Community' },
    calendar: { connected: true, provider: 'google' }
  },
  payment: {
    defaultMethod: 'visa_4242',
    billingAddress: '123 Coding Street, Kathmandu, Nepal',
    billingEmail: 'basnetbhisan567b@gmail.com',
    taxId: '',
    autoRenew: true,
    paymentMethods: [
      { id: '1', type: 'card', last4: '4242', expiryDate: '12/26', isDefault: true },
      { id: '2', type: 'paypal', isDefault: false }
    ],
    billingHistory: [
      { id: '1', date: new Date('2024-04-01'), amount: 49.99, status: 'paid', invoice: 'INV-2024-001' },
      { id: '2', date: new Date('2024-03-01'), amount: 49.99, status: 'paid', invoice: 'INV-2024-002' }
    ]
  },
  api: {
    keys: [],
    webhooks: [],
    rateLimit: 1000,
    allowedOrigins: ['https://codemaster.app', 'http://localhost:5173']
  }
};

const themes = [
  { id: 'dark' as const, name: 'Dark', icon: Moon, color: 'from-gray-700 to-gray-900' },
  { id: 'light' as const, name: 'Light', icon: Sun, color: 'from-yellow-400 to-orange-500' },
  { id: 'system' as const, name: 'System', icon: Monitor, color: 'from-blue-500 to-cyan-500' },
  { id: 'solarized' as const, name: 'Solarized', icon: Palette, color: 'from-cyan-600 to-blue-700' },
  { id: 'monokai' as const, name: 'Monokai', icon: Code, color: 'from-purple-600 to-pink-600' },
  { id: 'nord' as const, name: 'Nord', icon: Sparkles, color: 'from-blue-400 to-indigo-500' },
  { id: 'ocean' as const, name: 'Ocean', icon: Waves, color: 'from-blue-500 to-cyan-400' },
  { id: 'forest' as const, name: 'Forest', icon: TreePine, color: 'from-green-600 to-emerald-500' },
  { id: 'sunset' as const, name: 'Sunset', icon: Sun, color: 'from-orange-500 to-pink-500' }
];

const fonts = [
  { id: 'inter' as const, name: 'Inter', preview: 'The quick brown fox jumps over the lazy dog' },
  { id: 'fira' as const, name: 'Fira Code', preview: 'const example = () => { return "hello" }' },
  { id: 'jetbrains' as const, name: 'JetBrains Mono', preview: 'function hello() { return "world"; }' },
  { id: 'cascadia' as const, name: 'Cascadia Code', preview: 'npm install codemaster --save' }
];

const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'html', 'css', 'sql', 'bash', 'json', 'markdown'];
const focusSounds = [
  { id: 'waves' as const, name: 'Ocean Waves', icon: Waves },
  { id: 'rain' as const, name: 'Gentle Rain', icon: CloudRain },
  { id: 'fire' as const, name: 'Crackling Fire', icon: Flame },
  { id: 'cafe' as const, name: 'Cafe Ambience', icon: CloudMoon },
  { id: 'none' as const, name: 'No Sound', icon: VolumeX }
];

const timezones = [
  'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kathmandu',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland'
];

const SectionHeader = ({ title, icon: Icon, onReset }: { title: string; icon: any; onReset?: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      {title}
    </h2>
    {onReset && (
      <Button variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw className="w-3 h-3 mr-1" />
        Reset
      </Button>
    )}
  </div>
);

const SettingRow = ({ label, description, children }: { label: string; description?: string; children: ReactNode }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <div>{children}</div>
  </div>
);

const Bitcoin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.36 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zM12.66 6.986l.642 2.576c1.284-.32 2.058.033 2.251.482.225.482-.064 1.092-.74 1.38l-.642-2.577c-1.284.32-2.058-.033-2.251-.482-.225-.482.064-1.092.74-1.38zm2.251 6.43c.225-.482-.064-1.092-.74-1.38l.642 2.576c1.284-.32 2.058.033 2.251.482.225.482-.064 1.092-.74 1.38l-.642-2.577c-1.284.32-2.058-.033-2.251-.482z" />
  </svg>
);

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string[]>(['read']);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const { setDailyGoal } = useLockdownStore();
  const { setTheme } = useUIStore();

  useEffect(() => {
    const saved = localStorage.getItem('user_settings');
    if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
  }, []);

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const next: any = structuredClone(prev);
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
    setHasChanges(true);
    toast.success('Setting updated');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('user_settings', JSON.stringify(settings));
      if (['dark', 'light', 'system'].includes(settings.appearance.theme)) {
        setTheme(settings.appearance.theme as 'dark' | 'light' | 'system');
      } else {
        document.documentElement.setAttribute('data-theme', settings.appearance.theme);
      }
      setDailyGoal(settings.focus.dailyGoalMinutes);
      setHasChanges(false);
      toast.success('All settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (section: string) => {
    const sectionDefaults = section.split('.').reduce<any>((obj, key) => obj?.[key], defaultSettings);
    updateSettings(section, sectionDefaults);
    toast.info(`${section} settings reset to default`);
  };

  const generateApiKey = () => {
    if (!newApiKeyName) return;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKeyName,
      key: `cm_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      created: new Date(),
      permissions: newApiKeyPermissions
    };
    setSettings(prev => ({ ...prev, api: { ...prev.api, keys: [...prev.api.keys, newKey] } }));
    setNewApiKeyName('');
    setNewApiKeyPermissions(['read']);
    setShowApiKeyModal(false);
    toast.success('New API key generated');
  };

  const copyApiKey = async (key: string, id: string) => {
    await navigator.clipboard?.writeText(key);
    setCopiedKeyId(id);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const revokeApiKey = (id: string) => {
    setSettings(prev => ({ ...prev, api: { ...prev.api, keys: prev.api.keys.filter(k => k.id !== id) } }));
    toast.success('API key revoked');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE MY ACCOUNT') {
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      toast.success('Account deleted successfully');
    }
  };

  const filteredTab = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Customize your CodeMaster experience</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {hasChanges && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-20 z-20 mb-4 p-4 glass-heavy border border-primary/30 rounded-xl flex items-center justify-between">
          <p className="text-sm"><span className="text-primary">●</span> You have unsaved changes</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Discard</Button>
            <Button size="sm" onClick={handleSave} isLoading={saving}>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto glass p-1">
          <TabsTrigger value="profile"><User className="w-3 h-3 mr-1" />Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-3 h-3 mr-1" />Appearance</TabsTrigger>
          <TabsTrigger value="editor"><Code className="w-3 h-3 mr-1" />Editor</TabsTrigger>
          <TabsTrigger value="focus"><Target className="w-3 h-3 mr-1" />Focus</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-3 h-3 mr-1" />Notifications</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="w-3 h-3 mr-1" />Privacy</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-3 h-3 mr-1" />Security</TabsTrigger>
          <TabsTrigger value="integrations"><Cloud className="w-3 h-3 mr-1" />Integrations</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="w-3 h-3 mr-1" />Payment</TabsTrigger>
          <TabsTrigger value="api"><Key className="w-3 h-3 mr-1" />API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <SectionHeader title="Profile Information" icon={User} onReset={() => handleReset('profile')} />
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img src={settings.profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-primary/30" />
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <Button variant="ghost" size="sm" className="ml-2">Remove</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <Input value={settings.profile.displayName} onChange={(e) => updateSettings('profile.displayName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input type="email" value={settings.profile.email} onChange={(e) => updateSettings('profile.email', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea value={settings.profile.bio} onChange={(e) => updateSettings('profile.bio', e.target.value)} className="w-full p-3 glass rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input value={settings.profile.location} onChange={(e) => updateSettings('profile.location', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input value={settings.profile.website} onChange={(e) => updateSettings('profile.website', e.target.value)} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <SectionHeader title="Theme" icon={Palette} onReset={() => handleReset('appearance.theme')} />
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {themes.map(t => (
                  <button key={t.id} onClick={() => updateSettings('appearance.theme', t.id)} className={cn('p-3 rounded-xl text-center transition-all', settings.appearance.theme === t.id ? 'glass border-2 border-primary shadow-glow' : 'glass hover:bg-white/5')}>
                    <div className={cn('w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br', t.color)}>
                      <t.icon className="w-5 h-5 text-white m-auto mt-2.5" />
                    </div>
                    <p className="text-xs font-medium">{t.name}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <SectionHeader title="Interface" icon={Layout} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Density</label>
                  <div className="flex gap-3">
                    {(['compact', 'comfortable', 'large'] as const).map(d => (
                      <button key={d} onClick={() => updateSettings('appearance.density', d)} className={cn('flex-1 p-3 rounded-xl text-center capitalize', settings.appearance.density === d ? 'glass border border-primary' : 'glass hover:bg-white/5')}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fonts.map(f => (
                      <button key={f.id} onClick={() => updateSettings('appearance.font', f.id)} className={cn('p-3 rounded-xl text-left', settings.appearance.font === f.id ? 'glass border border-primary' : 'glass hover:bg-white/5')}>
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{f.preview}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Size: {settings.appearance.fontSize}px</label>
                  <input type="range" min="12" max="20" step="1" value={settings.appearance.fontSize} onChange={(e) => updateSettings('appearance.fontSize', parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="editor">
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <SectionHeader title="Editor Preferences" icon={Code} onReset={() => handleReset('editor')} />
              <div className="space-y-4">
                <SettingRow label="Auto Save" description="Automatically save code changes">
                  <Switch checked={settings.editor.autoSave} onChange={(c) => updateSettings('editor.autoSave', c)} />
                </SettingRow>
                {settings.editor.autoSave && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto Save Interval: {settings.editor.autoSaveInterval}s</label>
                    <input type="range" min="1" max="30" value={settings.editor.autoSaveInterval} onChange={(e) => updateSettings('editor.autoSaveInterval', parseInt(e.target.value))} className="w-full" />
                  </div>
                )}
                <SettingRow label="Format on Save" description="Auto-format code when saving">
                  <Switch checked={settings.editor.formatOnSave} onChange={(c) => updateSettings('editor.formatOnSave', c)} />
                </SettingRow>
                <SettingRow label="Bracket Colorization" description="Colorize matching brackets">
                  <Switch checked={settings.editor.bracketColorization} onChange={(c) => updateSettings('editor.bracketColorization', c)} />
                </SettingRow>
                <SettingRow label="Font Ligatures" description="Enable programming ligatures">
                  <Switch checked={settings.editor.fontLigatures} onChange={(c) => updateSettings('editor.fontLigatures', c)} />
                </SettingRow>
                <SettingRow label="Word Wrap" description="Wrap long lines of code">
                  <Switch checked={settings.editor.wordWrap} onChange={(c) => updateSettings('editor.wordWrap', c)} />
                </SettingRow>
                <SettingRow label="Minimap" description="Show code minimap">
                  <Switch checked={settings.editor.minimap} onChange={(c) => updateSettings('editor.minimap', c)} />
                </SettingRow>
                <SettingRow label="Line Numbers" description="Display line numbers">
                  <Switch checked={settings.editor.lineNumbers} onChange={(c) => updateSettings('editor.lineNumbers', c)} />
                </SettingRow>
                <SettingRow label="Highlight Active Line" description="Highlight the current line">
                  <Switch checked={settings.editor.highlightActiveLine} onChange={(c) => updateSettings('editor.highlightActiveLine', c)} />
                </SettingRow>
                <SettingRow label="Suggest on Type" description="Show suggestions while typing">
                  <Switch checked={settings.editor.suggestOnType} onChange={(c) => updateSettings('editor.suggestOnType', c)} />
                </SettingRow>
                <SettingRow label="Tab Completion" description="Complete suggestions with Tab">
                  <Switch checked={settings.editor.tabCompletion} onChange={(c) => updateSettings('editor.tabCompletion', c)} />
                </SettingRow>
                <div>
                  <label className="block text-sm font-medium mb-2">Tab Size</label>
                  <div className="flex gap-2">
                    {[2, 4].map(size => (
                      <button key={size} onClick={() => updateSettings('editor.tabSize', size as 2 | 4)} className={cn('px-4 py-2 rounded-lg text-sm', settings.editor.tabSize === size ? 'bg-primary text-white' : 'glass hover:bg-white/5')}>
                        {size} spaces
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Language</label>
                  <select value={settings.editor.defaultLanguage} onChange={(e) => updateSettings('editor.defaultLanguage', e.target.value)} className="w-full p-3 glass rounded-xl border border-white/10">
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="focus">
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <SectionHeader title="Focus Goals" icon={Target} onReset={() => handleReset('focus')} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Daily Focus Goal: {settings.focus.dailyGoalMinutes} minutes</label>
                  <input type="range" min="30" max="480" step="30" value={settings.focus.dailyGoalMinutes} onChange={(e) => updateSettings('focus.dailyGoalMinutes', parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weekly Goal: {settings.focus.weeklyGoalDays} days</label>
                  <input type="range" min="1" max="7" value={settings.focus.weeklyGoalDays} onChange={(e) => updateSettings('focus.weeklyGoalDays', parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card variant="glass" className="p-6">
            <SectionHeader title="Notification Channels" icon={Bell} onReset={() => handleReset('notifications.channels')} />
            <div className="space-y-3">
              <SettingRow label="Email Notifications" description={settings.profile.email}>
                <Switch checked={settings.notifications.channels.email} onChange={(c) => updateSettings('notifications.channels.email', c)} />
              </SettingRow>
              <SettingRow label="SMS Notifications" description={settings.notifications.phoneVerification.phoneNumber || 'No phone added'}>
                <Switch checked={settings.notifications.channels.sms} onChange={(c) => updateSettings('notifications.channels.sms', c)} />
              </SettingRow>
              <SettingRow label="Push Notifications" description="Browser notifications">
                <Switch checked={settings.notifications.channels.push} onChange={(c) => updateSettings('notifications.channels.push', c)} />
              </SettingRow>
              <SettingRow label="Desktop Notifications" description="System tray alerts">
                <Switch checked={settings.notifications.channels.desktop} onChange={(c) => updateSettings('notifications.channels.desktop', c)} />
              </SettingRow>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card variant="glass" className="p-6">
            <SectionHeader title="Privacy Controls" icon={Shield} onReset={() => handleReset('privacy')} />
            <div className="space-y-4">
              <SettingRow label="Public Profile" description="Allow others to view your profile">
                <Switch checked={settings.privacy.profilePublic} onChange={(c) => updateSettings('privacy.profilePublic', c)} />
              </SettingRow>
              <SettingRow label="Show on Leaderboard" description="Display your rank publicly">
                <Switch checked={settings.privacy.showOnLeaderboard} onChange={(c) => updateSettings('privacy.showOnLeaderboard', c)} />
              </SettingRow>
              <SettingRow label="Show Activity" description="Let others see your activity feed">
                <Switch checked={settings.privacy.showActivity} onChange={(c) => updateSettings('privacy.showActivity', c)} />
              </SettingRow>
              <SettingRow label="Show Email" description="Display email on profile">
                <Switch checked={settings.privacy.showEmail} onChange={(c) => updateSettings('privacy.showEmail', c)} />
              </SettingRow>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card variant="glass" className="p-6">
            <SectionHeader title="Authentication" icon={Lock} />
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><Key className="w-4 h-4" />Change Password</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => setShowTwoFactorModal(true)}>
                <span className="flex items-center gap-2"><Shield className="w-4 h-4" />Two-Factor Authentication</span>
                <Badge variant={settings.security.twoFactorEnabled ? 'success' : 'warning'}>
                  {settings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card variant="glass" className="p-6">
            <SectionHeader title="Connected Accounts" icon={Cloud} />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">{settings.integrations.github.connected ? settings.integrations.github.username : 'Not connected'}</p>
                </div>
                <Switch checked={settings.integrations.github.connected} onChange={(c) => updateSettings('integrations.github.connected', c)} />
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="font-medium">GitLab</p>
                  <p className="text-xs text-muted-foreground">{settings.integrations.gitlab.connected ? settings.integrations.gitlab.username : 'Not connected'}</p>
                </div>
                <Switch checked={settings.integrations.gitlab.connected} onChange={(c) => updateSettings('integrations.gitlab.connected', c)} />
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-xs text-muted-foreground">{settings.integrations.slack.connected ? settings.integrations.slack.channel : 'Not connected'}</p>
                </div>
                <Switch checked={settings.integrations.slack.connected} onChange={(c) => updateSettings('integrations.slack.connected', c)} />
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="font-medium">Discord</p>
                  <p className="text-xs text-muted-foreground">{settings.integrations.discord.connected ? settings.integrations.discord.server : 'Not connected'}</p>
                </div>
                <Switch checked={settings.integrations.discord.connected} onChange={(c) => updateSettings('integrations.discord.connected', c)} />
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="font-medium">Calendar</p>
                  <p className="text-xs text-muted-foreground">{settings.integrations.calendar.connected ? settings.integrations.calendar.provider : 'Not connected'}</p>
                </div>
                <Switch checked={settings.integrations.calendar.connected} onChange={(c) => updateSettings('integrations.calendar.connected', c)} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <SectionHeader title="Payment Methods" icon={CreditCard} />
              <div className="space-y-3">
                {settings.payment.paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      {method.type === 'card' && <CreditCard className="w-5 h-5" />}
                      {method.type === 'paypal' && <span className="text-blue-400 font-bold">PayPal</span>}
                      {method.type === 'crypto' && <Bitcoin className="w-5 h-5" />}
                      <div>
                        <p className="font-medium capitalize">{method.type}</p>
                        {method.last4 && <p className="text-xs text-muted-foreground">•••• {method.last4} | Expires {method.expiryDate}</p>}
                      </div>
                    </div>
                    {method.isDefault && <Badge variant="success" size="sm">Default</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <SectionHeader title="API Keys" icon={Key} />
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => setShowApiKeyModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />Generate New API Key
                </Button>

                {settings.api.keys.length > 0 && (
                  <div className="space-y-2">
                    {settings.api.keys.map(key => (
                      <div key={key.id} className="p-3 glass rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{key.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => revokeApiKey(key.id)}>Revoke</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-black/30 px-2 py-1 rounded flex-1">
                            {revealedKeyId === key.id ? key.key : '•'.repeat(32)}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => setRevealedKeyId(revealedKeyId === key.id ? null : key.id)}>
                            {revealedKeyId === key.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => copyApiKey(key.key, key.id)}>
                            {copiedKeyId === key.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <SectionHeader title="Rate Limits" icon={Database} />
              <label className="block text-sm font-medium mb-2">Requests per minute: {settings.api.rateLimit}</label>
              <input type="range" min="100" max="5000" step="100" value={settings.api.rateLimit} onChange={(e) => updateSettings('api.rateLimit', parseInt(e.target.value))} className="w-full" />
            </Card>

            <Card variant="glass" className="p-6">
              <SectionHeader title="Allowed Origins (CORS)" icon={Globe} />
              <div className="space-y-2">
                {settings.api.allowedOrigins.map((origin, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={origin} onChange={(e) => {
                      const next = [...settings.api.allowedOrigins];
                      next[i] = e.target.value;
                      updateSettings('api.allowedOrigins', next);
                    }} className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => updateSettings('api.allowedOrigins', settings.api.allowedOrigins.filter((_, idx) => idx !== i))}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="max-w-md w-full glass-heavy p-6 rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold">Delete Account?</h3>
                <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
              </div>
              <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE MY ACCOUNT" className="mb-4" />
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}>
                  Yes, Delete
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowApiKeyModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="max-w-md w-full glass-heavy p-6 rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Generate API Key</h3>
              <div className="space-y-4">
                <Input value={newApiKeyName} onChange={(e) => setNewApiKeyName(e.target.value)} placeholder="Key Name (e.g., Production)" />
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="flex gap-2 flex-wrap">
                    {['read', 'write', 'delete', 'admin'].map(p => (
                      <button
                        key={p}
                        onClick={() => setNewApiKeyPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                        className={cn('px-3 py-1.5 rounded-lg text-sm capitalize', newApiKeyPermissions.includes(p) ? 'bg-primary text-white' : 'glass')}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={generateApiKey} disabled={!newApiKeyName}>Generate</Button>
                  <Button variant="outline" onClick={() => setShowApiKeyModal(false)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}