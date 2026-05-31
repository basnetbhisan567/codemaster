import { create } from 'zustand';

interface AssignmentState {
  currentAssignmentId: string | null;
  answers: Record<string, string>;
  timeSpent: number;
  isSubmitting: boolean;
  
  setCurrentAssignment: (id: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setTimeSpent: (time: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  currentAssignmentId: null,
  answers: {},
  timeSpent: 0,
  isSubmitting: false,

  setCurrentAssignment: (id) => set({ currentAssignmentId: id }),
  setAnswer: (questionId, answer) => {
    set(state => ({
      answers: { ...state.answers, [questionId]: answer },
    }));
  },
  setTimeSpent: (timeSpent) => set({ timeSpent }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () => set({ answers: {}, timeSpent: 0, isSubmitting: false }),
}));