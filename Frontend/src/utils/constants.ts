export const APP_CONFIG = {
  name: 'CodeMaster',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  defaultDailyGoal: 150,
  maxStreakBonus: 5,
  sessionTimeout: 3600000,
  cacheTTL: 300000,
} as const;

export const STORAGE_KEYS = {
  auth: 'auth-storage',
  lockdown: 'lockdown-storage',
  dailyGoal: 'daily-goal-storage',
  chat: 'chat-storage',
  music: 'music-storage',
  settings: 'settings-storage',
} as const;

export const ROUTES = {
  home: '/',
  learning: '/learning',
  projects: '/projects',
  problems: '/problems',
  playground: '/playground',
  assignments: '/assignments',
  roadmap: '/roadmap',
  certify: '/certify',
  profile: '/profile',
  settings: '/settings',
  admin: '/admin',
  login: '/login',
  register: '/register',
  lockscreen: '/lockscreen',
} as const;