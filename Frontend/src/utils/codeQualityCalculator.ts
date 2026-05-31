import { CodeAnalysisResult, ComplexityMetrics, MaintainabilityMetrics, SecurityMetrics } from '../types/codeQuality';

export const calculateCodeQualityScore = (analysis: Partial<CodeAnalysisResult>): number => {
  const weights = {
    complexity: 0.25,
    maintainability: 0.30,
    security: 0.25,
    bestPractices: 0.20,
  };
  
  let score = 0;
  
  if (analysis.complexity) {
    score += calculateComplexityScore(analysis.complexity) * weights.complexity;
  }
  
  if (analysis.maintainability) {
    score += calculateMaintainabilityScore(analysis.maintainability) * weights.maintainability;
  }
  
  if (analysis.security) {
    score += calculateSecurityScore(analysis.security) * weights.security;
  }
  
  return Math.round(score);
};

export const calculateComplexityScore = (metrics: ComplexityMetrics): number => {
  let score = 100;
  
  if (metrics.cyclomaticComplexity > 20) score -= 30;
  else if (metrics.cyclomaticComplexity > 10) score -= 15;
  
  if (metrics.cognitiveComplexity > 30) score -= 25;
  else if (metrics.cognitiveComplexity > 15) score -= 10;
  
  if (metrics.linesOfCode > 500) score -= 20;
  else if (metrics.linesOfCode > 200) score -= 10;
  
  if (metrics.averageFunctionLength > 50) score -= 15;
  else if (metrics.averageFunctionLength > 25) score -= 5;
  
  return Math.max(0, score);
};

export const calculateMaintainabilityScore = (metrics: MaintainabilityMetrics): number => {
  let score = metrics.maintainabilityIndex;
  
  if (metrics.technicalDebtRatio > 10) score -= 20;
  else if (metrics.technicalDebtRatio > 5) score -= 10;
  
  if (metrics.duplicationPercentage > 10) score -= 15;
  else if (metrics.duplicationPercentage > 5) score -= 5;
  
  if (metrics.commentDensity < 10) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

export const calculateSecurityScore = (metrics: SecurityMetrics): number => {
  const severityWeights = {
    critical: 40,
    high: 25,
    medium: 10,
    low: 5,
  };
  
  let penalty = 0;
  
  metrics.vulnerabilities.forEach(v => {
    penalty += severityWeights[v.severity];
  });
  
  return Math.max(0, 100 - penalty);
};

export const getScoreGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
};