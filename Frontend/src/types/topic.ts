export type Topic = {
  id: string;
  title: string;
  description: string;
  language: ProgrammingLanguage;
  difficulty: Difficulty;
  prerequisites: string[];
  estimatedMinutes: number;
  content: TopicContent;
  progress?: number;
  completed?: boolean;
};

export type ProgrammingLanguage = 
  | 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' 
  | 'csharp' | 'go' | 'rust' | 'swift' | 'kotlin';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type TopicContent = {
  theory: string;
  examples: CodeExample[];
  exercises: Exercise[];
  quiz: Quiz;
};

export type CodeExample = {
  title: string;
  code: string;
  output?: string;
  explanation: string;
};

export type Exercise = {
  id: string;
  question: string;
  initialCode: string;
  solution: string;
  hints: string[];
};

export type Quiz = {
  questions: QuizQuestion[];
  passingScore: number;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};