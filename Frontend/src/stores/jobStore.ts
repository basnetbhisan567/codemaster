import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface JobStore {
  savedJobIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      toggleSaved: (id) => set((state) => ({
        savedJobIds: state.savedJobIds.includes(id)
          ? state.savedJobIds.filter(jid => jid !== id)
          : [...state.savedJobIds, id]
      })),
      isSaved: (id) => get().savedJobIds.includes(id),
    }),
    { name: 'job-storage' }
  )
);