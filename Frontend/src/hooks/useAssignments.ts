import { useState, useEffect } from 'react';
import { assignmentService } from '../services/assignmentService';
import { Assignment } from '../types/assignment';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentService.getAll().then(setAssignments).finally(() => setLoading(false));
  }, []);

  const submitAssignment = async (assignmentId: string, answers: Record<string, string>) => {
    await assignmentService.submitAssignment(assignmentId, answers);
  };

  return { assignments, loading, submitAssignment };
};