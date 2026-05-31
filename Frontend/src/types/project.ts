export type ProjectLevel = 1 | 2 | 3 | 4 | 5;

export type ProjectCategory = 'Web' | 'Mobile' | 'Game Dev' | 'Data Science' | 'DevOps' | 'AI/ML';

export type ProjectSource = 'GitHub' | 'FrontendMentor' | 'CodePen' | 'Vercel' | 'Internal';

export type Project = {
  id: string;
  title: string;
  description: string;
  level: ProjectLevel;
  category: ProjectCategory;
  techStack: string[];
  estimatedTime: string;
  difficulty: 'Beginner' | 'Apprentice' | 'Intermediate' | 'Advanced' | 'Expert';
  source: ProjectSource;
  sourceUrl: string;
  sourceLabel: string;
  requirements: string[];
  learningObjectives: string[];
  resources: { title: string; url: string }[];
  previewImage?: string;
  livePreview?: string;
  aiContext: string;
  completed?: boolean;
  progress?: number;
};

export const LEVEL_CONFIG: Record<ProjectLevel, { name: string; focus: string; skills: string[]; color: string }> = {
  1: { name: 'Beginner', focus: 'UI/Layout', skills: ['HTML', 'CSS'], color: 'from-green-500 to-emerald-500' },
  2: { name: 'Apprentice', focus: 'Logic & State', skills: ['JavaScript', 'DOM'], color: 'from-blue-500 to-cyan-500' },
  3: { name: 'Intermediate', focus: 'API Integration', skills: ['React', 'Data Fetching'], color: 'from-yellow-500 to-orange-500' },
  4: { name: 'Advanced', focus: 'Full-Stack', skills: ['Database', 'Auth'], color: 'from-purple-500 to-pink-500' },
  5: { name: 'Expert', focus: 'Real-world Systems', skills: ['Optimization', 'Security'], color: 'from-red-500 to-orange-500' },
};