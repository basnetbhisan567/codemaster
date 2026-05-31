import { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';
import { UserProgress } from '../types/progress';

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService.getUserProgress().then(setProgress).finally(() => setLoading(false));
  }, []);

  const updateTopicProgress = async (topicId: string, progressPercent: number) => {
    await progressService.updateTopicProgress(topicId, progressPercent);
  };

  const updateStreak = async () => {
    return await progressService.updateStreak();
  };

  return { progress, loading, updateTopicProgress, updateStreak };
};