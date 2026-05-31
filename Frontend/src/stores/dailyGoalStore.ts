import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyGoal, GoalProgress } from '../types/dailyGoal';
import { STORAGE_KEYS } from '../config/constants';

interface DailyGoalState {
  currentGoal: DailyGoal | null;
  history: DailyGoal[];
  
  setDailyGoal: (minutes: number) => void;
  addFocusMinutes: (minutes: number) => void;
  getTodayProgress: () => GoalProgress;
  getStreak: () => number;
  resetDailyGoal: () => void;
}

export const useDailyGoalStore = create<DailyGoalState>()(
  persist(
    (set, get) => ({
      currentGoal: null,
      history: [],

      setDailyGoal: (minutes: number) => {
        const today = new Date().toISOString().split('T')[0];
        const existing = get().history.find(g => g.date === today);
        
        const newGoal: DailyGoal = {
          date: today,
          targetMinutes: minutes,
          completedMinutes: existing?.completedMinutes || 0,
          sessions: existing?.sessions || [],
          achieved: false,
          streak: existing?.streak || 0,
        };
        
        set(state => ({
          currentGoal: newGoal,
          history: state.history.some(g => g.date === today)
            ? state.history.map(g => g.date === today ? newGoal : g)
            : [...state.history, newGoal],
        }));
      },

      addFocusMinutes: (minutes: number) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const current = state.currentGoal || {
          date: today,
          targetMinutes: 150,
          completedMinutes: 0,
          sessions: [],
          achieved: false,
          streak: 0,
        };
        
        const updatedGoal: DailyGoal = {
          ...current,
          completedMinutes: current.completedMinutes + minutes,
          achieved: current.completedMinutes + minutes >= current.targetMinutes,
        };
        
        set(state => ({
          currentGoal: updatedGoal,
          history: state.history.some(g => g.date === today)
            ? state.history.map(g => g.date === today ? updatedGoal : g)
            : [...state.history, updatedGoal],
        }));
      },

      getTodayProgress: (): GoalProgress => {
        const state = get();
        const goal = state.currentGoal || {
          targetMinutes: 150,
          completedMinutes: 0,
        };
        
        const percentage = (goal.completedMinutes / goal.targetMinutes) * 100;
        const remaining = Math.max(0, goal.targetMinutes - goal.completedMinutes);
        
        return {
          percentage,
          remaining,
          isComplete: remaining === 0,
          estimatedCompletionTime: remaining > 0 
            ? new Date(Date.now() + remaining * 60000).toLocaleTimeString()
            : 'Complete',
        };
      },

      getStreak: (): number => {
        const history = get().history;
        const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
        
        let streak = 0;
        for (const goal of sortedHistory) {
          if (goal.achieved) {
            streak++;
          } else {
            break;
          }
        }
        
        return streak;
      },

      resetDailyGoal: () => {
        const today = new Date().toISOString().split('T')[0];
        set(state => ({
          currentGoal: null,
          history: state.history.filter(g => g.date !== today),
        }));
      },
    }),
    {
      name: STORAGE_KEYS.dailyGoal,
    }
  )
);