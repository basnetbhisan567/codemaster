export type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  questions: AssignmentQuestion[];
  status: 'pending' | 'in_progress' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
};

export type AssignmentQuestion = {
  id: string;
  type: 'code' | 'multiple_choice' | 'short_answer' | 'essay';
  question: string;
  points: number;
  options?: string[];
  correctAnswer?: string | number;
  userAnswer?: string;
};