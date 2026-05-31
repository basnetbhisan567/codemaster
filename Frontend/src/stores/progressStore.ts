import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress } from '../types/progress';

interface ProgressState {
  progress: UserProgress | null;
  completedTopics: string[];
  completedProblems: string[];
  
  setProgress: (progress: UserProgress) => void;
  markTopicComplete: (topicId: string) => void;
  markProblemComplete: (problemId: string) => void;
  getOverallProgress: () => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: null,
      completedTopics: [],
      completedProblems: [],

      setProgress: (progress) => set({ progress }),

      markTopicComplete: (topicId) => {
        set(state => ({
          completedTopics: [...state.completedTopics, topicId],
        }));
      },

      markProblemComplete: (problemId) => {
        set(state => ({
          completedProblems: [...state.completedProblems, problemId],
        }));
      },

      getOverallProgress: () => {
        const state = get();
        if (state.progress) return state.progress.levelProgress;
        return (state.completedTopics.length / 50) * 100;
      },
    }),
    { name: 'progress-storage' }
  )
);