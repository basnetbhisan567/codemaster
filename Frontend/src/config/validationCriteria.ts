export const VALIDATION_CRITERIA = {
  codeQuality: {
    minScore: 70,
    checks: [
      'Proper variable naming',
      'Consistent formatting',
      'No commented-out code',
      'Appropriate use of functions',
    ],
  },
  bestPractices: {
    minScore: 75,
    checks: [
      'DRY principle',
      'Single responsibility',
      'Error handling',
      'Input validation',
    ],
  },
  security: {
    minScore: 80,
    checks: [
      'No hardcoded secrets',
      'SQL injection prevention',
      'XSS protection',
      'Secure dependencies',
    ],
  },
  performance: {
    minScore: 65,
    checks: [
      'Efficient algorithms',
      'Proper data structures',
      'No memory leaks',
      'Optimized queries',
    ],
  },
  documentation: {
    minScore: 60,
    checks: [
      'Clear comments',
      'README file',
      'Function documentation',
      'Usage examples',
    ],
  },
} as const;

export const getPassingCriteria = (level: number) => {
  const baseScore = 70;
  const levelBonus = level * 2;
  return Math.min(90, baseScore + levelBonus);
};