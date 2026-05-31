export interface AnalysisResult {
  overallScore: number;
  codeQuality: number;
  bestPractices: Array<{ name: string; passed: boolean }>;
  security: Array<{ severity: 'high' | 'medium' | 'low'; description: string }>;
  performance: {
    timeComplexity: string;
    spaceComplexity: string;
  };
  suggestions: string[];
}