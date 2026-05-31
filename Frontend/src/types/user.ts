export type UserRank = 'Script Kiddy' | 'Code Ninja' | 'Logic Architect' | 'CodeMaster' | 'AI Sensei';

export type SkillArea = 'Frontend' | 'Backend' | 'Problem Solving' | 'Consistency' | 'Speed';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  category: 'milestone' | 'achievement' | 'event' | 'certification';
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'student' | 'admin';
  rank: UserRank;
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  totalFocusMinutes: number;
  createdAt: Date;
  skills: SkillArea[];
  skillLevels: Record<SkillArea, number>;
  badges: Badge[];
  techStack: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  activity: ActivityItem[];
  contributions: ContributionDay[];
  featuredProjects: string[];
  followers: number;
  following: number;
  rank_position: number;
  verified: boolean;
};

export type ActivityItem = {
  id: string;
  type: 'assignment' | 'project' | 'problem' | 'streak' | 'badge' | 'focus';
  title: string;
  description: string;
  timestamp: Date;
  xpGained?: number;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export const RANK_THRESHOLDS: Record<UserRank, { minXP: number; color: string; icon: string }> = {
  'Script Kiddy': { minXP: 0, color: 'from-gray-500 to-slate-500', icon: '🐣' },
  'Code Ninja': { minXP: 1000, color: 'from-green-500 to-emerald-500', icon: '🥷' },
  'Logic Architect': { minXP: 5000, color: 'from-blue-500 to-cyan-500', icon: '🏛️' },
  'CodeMaster': { minXP: 15000, color: 'from-purple-500 to-pink-500', icon: '👑' },
  'AI Sensei': { minXP: 50000, color: 'from-yellow-500 to-orange-500', icon: '🤖' },
};

export const SAMPLE_BADGES: Badge[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Completed your first assignment', icon: '👣', rarity: 'common', category: 'milestone' },
  { id: 'century-club', name: 'Century Club', description: 'Wrote 100 lines of code', icon: '💯', rarity: 'rare', category: 'milestone' },
  { id: 'night-owl', name: 'Night Owl', description: 'Coded past midnight', icon: '🦉', rarity: 'epic', category: 'achievement' },
  { id: 'bug-hunter', name: 'Bug Hunter', description: 'Fixed 50 bugs', icon: '🐛', rarity: 'rare', category: 'achievement' },
  { id: 'streak-master', name: 'Streak Master', description: '7-day coding streak', icon: '🔥', rarity: 'epic', category: 'achievement' },
  { id: 'certified', name: 'CodeMaster Certified', description: 'Passed the certification exam', icon: '✅', rarity: 'legendary', category: 'certification' },
  { id: 'holiday-coder', name: 'Holiday Coder', description: 'Completed holiday challenge', icon: '🎄', rarity: 'epic', category: 'event' },
  { id: 'early-bird', name: 'Early Bird', description: 'Coded before 6 AM', icon: '🌅', rarity: 'rare', category: 'achievement' },
];