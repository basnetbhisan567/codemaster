export type FocusSession = {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  goalMinutes: number;
  completed: boolean;
};

export type DailyGoal = {
  date: string;
  targetMinutes: number;
  completedMinutes: number;
  sessions: FocusSession[];
  achieved: boolean;
  streak: number;
};

export type GoalProgress = {
  percentage: number;
  remaining: number;
  isComplete: boolean;
  estimatedCompletionTime: string;
};