import { create } from 'zustand';
import { Topic, ProgrammingLanguage, Difficulty } from '../types/topic';

interface TopicState {
  topics: Topic[];
  currentTopic: Topic | null;
  completedTopics: string[];
  isLoading: boolean;
  filter: {
    language: ProgrammingLanguage | null;
    difficulty: Difficulty | null;
  };
  
  setTopics: (topics: Topic[]) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  markTopicComplete: (topicId: string) => void;
  updateProgress: (topicId: string, progress: number) => void;
  setFilter: (language: ProgrammingLanguage | null, difficulty: Difficulty | null) => void;
  getFilteredTopics: () => Topic[];
  getProgress: () => { completed: number; total: number; percentage: number };
}

export const useTopicStore = create<TopicState>((set, get) => ({
  topics: [],
  currentTopic: null,
  completedTopics: [],
  isLoading: false,
  filter: {
    language: null,
    difficulty: null,
  },

  setTopics: (topics: Topic[]) => {
    set({ topics });
  },

  setCurrentTopic: (topic: Topic | null) => {
    set({ currentTopic: topic });
  },

  markTopicComplete: (topicId: string) => {
    set(state => ({
      completedTopics: [...state.completedTopics, topicId],
      topics: state.topics.map(t =>
        t.id === topicId ? { ...t, completed: true, progress: 100 } : t
      ),
    }));
  },

  updateProgress: (topicId: string, progress: number) => {
    set(state => ({
      topics: state.topics.map(t =>
        t.id === topicId ? { ...t, progress, completed: progress >= 100 } : t
      ),
    }));
  },

  setFilter: (language: ProgrammingLanguage | null, difficulty: Difficulty | null) => {
    set({ filter: { language, difficulty } });
  },

  getFilteredTopics: () => {
    const { topics, filter } = get();
    return topics.filter(topic => {
      if (filter.language && topic.language !== filter.language) return false;
      if (filter.difficulty && topic.difficulty !== filter.difficulty) return false;
      return true;
    });
  },

  getProgress: () => {
    const { topics, completedTopics } = get();
    return {
      completed: completedTopics.length,
      total: topics.length,
      percentage: topics.length > 0 ? (completedTopics.length / topics.length) * 100 : 0,
    };
  },
}));