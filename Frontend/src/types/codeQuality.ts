export type CodeAnalysisResult = {
  score: number;
  complexity: ComplexityMetrics;
  maintainability: MaintainabilityMetrics;
  security: SecurityMetrics;
  suggestions: CodeSuggestion[];
};

export type ComplexityMetrics = {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  functionCount: number;
  averageFunctionLength: number;
};

export type MaintainabilityMetrics = {
  maintainabilityIndex: number;
  technicalDebtRatio: number;
  duplicationPercentage: number;
  commentDensity: number;
};

export type SecurityMetrics = {
  vulnerabilities: Vulnerability[];
  riskScore: number;
  securityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
};

export type Vulnerability = {
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  lineNumber?: number;
  remediation: string;
};

export type CodeSuggestion = {
  type: 'improvement' | 'warning' | 'error';
  message: string;
  lineNumber?: number;
  code?: string;
};