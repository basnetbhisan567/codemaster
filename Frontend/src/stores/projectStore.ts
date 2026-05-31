import { create } from 'zustand';

interface ProjectStore {
  userLevel: number;
  completedTopics: number;
  completedProjects: number;
  hasCertification: boolean;
}

export const useProjectStore = create<ProjectStore>(() => ({
  userLevel: 1,
  completedTopics: 0,
  completedProjects: 0,
  hasCertification: false,
}));