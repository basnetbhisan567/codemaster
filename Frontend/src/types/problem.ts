import { ProgrammingLanguage } from './topic';

export type TestCase = {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
  points: number;
};

export type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  constraints: string[];
  examples: ProblemExample[];
  testCases: TestCase[];
  hints: string[];
  solution?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  solved?: boolean;
  attempts?: number;
};

export type ProblemExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type ProblemSubmission = {
  id: string;
  problemId: string;
  code: string;
  language: ProgrammingLanguage;
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'pending';
  runtime?: number;
  memory?: number;
  submittedAt: string;
};