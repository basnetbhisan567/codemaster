import { create } from 'zustand';
import { ValidationResult } from '../types/certification';

interface ValidationState {
  currentValidation: ValidationResult | null;
  validationHistory: ValidationResult[];
  isAnalyzing: boolean;
  error: string | null;
  
  setValidation: (result: ValidationResult) => void;
  clearValidation: () => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  getLatestValidation: () => ValidationResult | null;
}

export const useValidationStore = create<ValidationState>((set, get) => ({
  currentValidation: null,
  validationHistory: [],
  isAnalyzing: false,
  error: null,

  setValidation: (result: ValidationResult) => {
    set(state => ({
      currentValidation: result,
      validationHistory: [result, ...state.validationHistory].slice(0, 50),
      isAnalyzing: false,
      error: null,
    }));
  },

  clearValidation: () => {
    set({ currentValidation: null, error: null });
  },

  setAnalyzing: (analyzing: boolean) => {
    set({ isAnalyzing: analyzing });
  },

  setError: (error: string | null) => {
    set({ error, isAnalyzing: false });
  },

  getLatestValidation: () => {
    return get().currentValidation;
  },
}));