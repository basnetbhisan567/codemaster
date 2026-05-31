import { useState, useEffect } from 'react';
import { problemService } from '../services/problemService';
import { Problem } from '../types/problem';

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    problemService.getAll().then(setProblems).finally(() => setLoading(false));
  }, []);

  const submitSolution = async (problemId: string, code: string, language: string) => {
    return await problemService.submitSolution(problemId, code, language);
  };

  const getHint = async (problemId: string) => {
    return await problemService.getHint(problemId);
  };

  return { problems, loading, submitSolution, getHint };
};