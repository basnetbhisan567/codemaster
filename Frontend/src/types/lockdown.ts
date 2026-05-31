export type LockdownState = {
  isLocked: boolean;
  focusActive: boolean;
  lockReason: LockReason;
  unlockQuiz: UnlockQuiz | null;
  blockedUrls: string[];
};

export type LockReason = 
  | 'daily_goal_not_met'
  | 'focus_mode_active'
  | 'exam_mode'
  | 'admin_lock';

export type UnlockQuiz = {
  question: string;
  answer: string;
  attempts: number;
  maxAttempts: number;
};

export type FocusSession = {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  goalMinutes: number;
  completed: boolean;
};