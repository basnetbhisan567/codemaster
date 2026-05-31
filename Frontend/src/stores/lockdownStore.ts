import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: string[];
}

interface UnlockQuiz {
  question: string;
  answer: string;
  attempts: number;
  maxAttempts: number;
}

interface LockdownState {
  isLocked: boolean;
  focusActive: boolean;
  dailyGoalMinutes: number;
  todayFocusedMinutes: number;
  lockReason: string | null;
  unlockQuiz: UnlockQuiz | null;
  schedule: FocusSchedule;
  focusStartTime: number | null;
  focusEndTime: number | null;
  canExit: boolean;

  startFocus: () => void;
  endFocus: () => void;
  lockApp: (reason: string) => void;
  unlockApp: (quizAnswer?: string) => boolean;
  addFocusedTime: (minutes: number) => void;
  setDailyGoal: (minutes: number) => void;
  setSchedule: (schedule: Partial<FocusSchedule>) => void;
  resetDailyProgress: () => void;
  checkScheduledFocus: () => boolean;
  allowExit: () => void;
}

function generateLockQuiz(): UnlockQuiz {
  const questions = [
    { question: 'What is the time complexity of binary search?', answer: 'O(log n)' },
    { question: 'What does HTML stand for?', answer: 'HyperText Markup Language' },
    { question: 'In JavaScript, what is the result of 2 + "2"?', answer: '22' },
    { question: 'What is the capital of France?', answer: 'Paris' },
    { question: 'What is 5 + 3 * 2?', answer: '11' },
  ];
  const selected = questions[Math.floor(Math.random() * questions.length)];
  return { ...selected, attempts: 0, maxAttempts: 3 };
}

export const useLockdownStore = create<LockdownState>()(
  persist(
    (set, get) => ({
      isLocked: false,
      focusActive: false,
      dailyGoalMinutes: 150,
      todayFocusedMinutes: 0,
      lockReason: null,
      unlockQuiz: null,
      schedule: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      focusStartTime: null,
      focusEndTime: null,
      canExit: false,

      startFocus: () => {
        const quiz = generateLockQuiz();
        const now = Date.now();
        const durationMs = get().dailyGoalMinutes * 60 * 1000;
        const endTime = now + durationMs;
        
        set({ 
          focusActive: true, 
          isLocked: true, 
          lockReason: 'focus_mode_active',
          unlockQuiz: quiz,
          focusStartTime: now,
          focusEndTime: endTime,
          canExit: false,
        });
        
        // Request fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        }
        
        // CRITICAL: Pass duration to Electron for timer-based auto-unlock
        if (window.electronAPI?.startLockdown) {
          window.electronAPI?.startLockdown?.()?.then((success: boolean) => console.log('[Focus] Lockdown started:', success)).catch((err: any) => console.error('[Focus] Lockdown error:', err));
        }
        
        // Listen for auto-unlock from Electron timer
        if (window.electronAPI?.onLockdownAutoEnded) {
          window.electronAPI.onLockdownAutoEnded(() => {
            console.log('[Focus] Timer finished! Auto-unlocking...');
            set({ 
              focusActive: false, 
              isLocked: false, 
              lockReason: null, 
              unlockQuiz: null,
              focusStartTime: null,
              focusEndTime: null,
              canExit: true,
            });
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
          });
        }
      },

      endFocus: () => {
        set({ 
          focusActive: false, 
          isLocked: false, 
          lockReason: null, 
          unlockQuiz: null,
          focusStartTime: null,
          focusEndTime: null,
          canExit: true,
        });
        
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        
        if (window.electronAPI?.endLockdown) {
          window.electronAPI.endLockdown()
            .then((success: boolean) => console.log('[Focus] Lockdown ended:', success))
            .catch((err: any) => console.error('[Focus] End error:', err));
        }
        
        if (window.electronAPI?.removeLockdownListener) {
          window.electronAPI.removeLockdownListener();
        }
      },

      lockApp: (reason) => {
        const quiz = generateLockQuiz();
        const now = Date.now();
        const endTime = now + (get().dailyGoalMinutes * 60 * 1000);
        set({ isLocked: true, lockReason: reason, unlockQuiz: quiz, focusStartTime: now, focusEndTime: endTime, canExit: false });
      },

      unlockApp: (quizAnswer) => {
        const { unlockQuiz, focusEndTime } = get();
        if (!unlockQuiz) return false;
        
        // Only allow quiz unlock if timer has finished
        const now = Date.now();
        if (focusEndTime && now < focusEndTime) {
          return false;
        }
        
        const updatedQuiz = { ...unlockQuiz, attempts: unlockQuiz.attempts + 1 };
        set({ unlockQuiz: updatedQuiz });
        
        if (quizAnswer?.toLowerCase().trim() === unlockQuiz.answer.toLowerCase()) {
          set({ isLocked: false, lockReason: null, unlockQuiz: null, focusStartTime: null, focusEndTime: null, canExit: true });
          return true;
        }
        
        if (updatedQuiz.attempts >= unlockQuiz.maxAttempts) {
          setTimeout(() => set({ unlockQuiz: generateLockQuiz() }), 1000);
        }
        return false;
      },

      addFocusedTime: (minutes) => set((state) => ({ todayFocusedMinutes: state.todayFocusedMinutes + minutes })),
      setDailyGoal: (minutes) => set({ dailyGoalMinutes: minutes }),
      
      setSchedule: (newSchedule) => set((state) => ({ schedule: { ...state.schedule, ...newSchedule } })),
      resetDailyProgress: () => set({ todayFocusedMinutes: 0 }),
      allowExit: () => set({ canExit: true }),

      checkScheduledFocus: () => {
        const { schedule } = get();
        if (!schedule.enabled) return false;
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return schedule.days.includes(currentDay) && currentTime >= schedule.startTime && currentTime < schedule.endTime;
      },
    }),
    { name: 'lockdown-storage' }
  )
);