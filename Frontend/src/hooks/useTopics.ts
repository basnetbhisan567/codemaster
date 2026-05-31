import { useState, useEffect, useCallback } from 'react';
import { topicService } from '../services/topicService';
import { Topic, ProgrammingLanguage } from '../types/topic';

export const useTopics = (language?: ProgrammingLanguage) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Topic[] = [];
      
      // Try API first, fall back to mock data
      try {
        data = language 
          ? await topicService.getByLanguage(language)
          : await topicService.getAll();
      } catch (apiError) {
        console.warn('API not available, using sample topics');
        // Fall back to sample topics if API is not running
        data = getSampleTopics(language);
      }
      
      setTopics(data);
    } catch (err) {
      setError('Failed to load topics');
      console.error('Topics fetch error:', err);
      // Still show sample topics even on error
      setTopics(getSampleTopics(language));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const updateProgress = async (topicId: string, progress: number) => {
    try {
      await topicService.updateProgress(topicId, progress);
      setTopics(prev => prev.map(t => 
        t.id === topicId ? { ...t, progress } : t
      ));
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  return { 
    topics, 
    loading, 
    error, 
    updateProgress, 
    refetch: fetchTopics 
  };
};

// Sample topics for offline/development use
function getSampleTopics(language?: string): Topic[] {
  const allTopics: Topic[] = [
    {
      id: '1',
      title: 'Variables and Data Types',
      description: 'Learn about var, let, const and primitive types in JavaScript',
      language: 'javascript',
      difficulty: 'beginner',
      prerequisites: [],
      estimatedMinutes: 15,
      content: { theory: '', examples: [], exercises: [], quiz: { questions: [], passingScore: 70 } },
    },
    {
      id: '2',
      title: 'Functions and Scope',
      description: 'Understanding function declarations, expressions, and scope',
      language: 'javascript',
      difficulty: 'beginner',
      prerequisites: [],
      estimatedMinutes: 20,
      content: { theory: '', examples: [], exercises: [], quiz: { questions: [], passingScore: 70 } },
    },
    {
      id: '3',
      title: 'Arrays and Array Methods',
      description: 'Master array manipulation with map, filter, reduce',
      language: 'javascript',
      difficulty: 'intermediate',
      prerequisites: [],
      estimatedMinutes: 25,
      content: { theory: '', examples: [], exercises: [], quiz: { questions: [], passingScore: 70 } },
    },
    {
      id: '4',
      title: 'Objects and Prototypes',
      description: 'Deep dive into JavaScript objects and inheritance',
      language: 'javascript',
      difficulty: 'intermediate',
      prerequisites: [],
      estimatedMinutes: 30,
      content: { theory: '', examples: [], exercises: [], quiz: { questions: [], passingScore: 70 } },
    },
    {
      id: '5',
      title: 'Async Programming',
      description: 'Promises, async/await, and event loop',
      language: 'javascript',
      difficulty: 'advanced',
      prerequisites: [],
      estimatedMinutes: 35,
      content: { theory: '', examples: [], exercises: [], quiz: { questions: [], passingScore: 70 } },
    },
    {
      id: '6',
      title: 'Python Basics',
      description: 'Syntax, variables, and data types in Python',
      language: 'python',
      difficulty: 'beginner',
      prerequisites: [],
      estimatedMinutes: 15,
      content: { theory: '', examples: [], exercises: [], quiz: { questions: [], passingScore: 70 } },
    },
    {
      id: '7',
      title: 'TypeScript Fundamentals',
      description: 'Static typing and interfaces in TypeScript',
      language: 'typescript',
      difficulty: 'intermediate',
      prerequisites: [],
      estimatedMinutes: 20,
      content: { theory: '', examples: [], exercises: [], quiz: { questions: [], passingScore: 70 } },
    },
  ];

  if (language) {
    return allTopics.filter(t => t.language === language);
  }
  return allTopics;
}