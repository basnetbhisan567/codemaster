import { create } from 'zustand';

interface ProblemState {
  currentProblemId: string | null;
  code: string;
  language: string;
  output: string;
  isSubmitting: boolean;
  
  setCurrentProblem: (id: string) => void;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setOutput: (output: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

export const useProblemStore = create<ProblemState>((set) => ({
  currentProblemId: null,
  code: '',
  language: 'javascript',
  output: '',
  isSubmitting: false,

  setCurrentProblem: (id) => set({ currentProblemId: id }),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setOutput: (output) => set({ output }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () => set({ code: '', output: '', isSubmitting: false }),
}));