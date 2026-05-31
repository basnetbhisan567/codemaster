export type UserProgress = {
  userId: string;
  topicsCompleted: number;
  totalTopics: number;
  projectsCompleted: number;
  problemsSolved: number;
  currentLevel: number;
  xp: number;
  levelProgress: number;
  streak: number;
  lastActive: string;
};

export type TopicProgress = {
  topicId: string;
  completed: boolean;
  progressPercent: number;
  lastAccessed: string;
  timeSpent: number;
};

export type DailyStats = {
  date: string;
  focusMinutes: number;
  topicsCompleted: number;
  problemsSolved: number;
  xpEarned: number;
};