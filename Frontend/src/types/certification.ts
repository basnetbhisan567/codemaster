export type Certification = {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  score: number;
  skills: string[];
  badgeUrl: string;
  issuedAt: string;
  expiresAt?: string;
  verificationCode: string;
};

export type ValidationResult = {
  passed: boolean;
  overallScore: number;
  metrics: ValidationMetrics;
  feedback: ValidationFeedback;
};

export type ValidationMetrics = {
  codeQuality: number;
  bestPractices: number;
  security: number;
  performance: number;
  documentation: number;
};

export type ValidationFeedback = {
  strengths: string[];
  improvements: string[];
  suggestions: string[];
};