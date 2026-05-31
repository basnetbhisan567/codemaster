export const CODE_QUALITY_THRESHOLDS = {
  complexity: {
    cyclomaticComplexity: {
      excellent: 5,
      good: 10,
      acceptable: 20,
      poor: 30,
    },
    cognitiveComplexity: {
      excellent: 10,
      good: 20,
      acceptable: 35,
      poor: 50,
    },
    linesOfCode: {
      function: {
        excellent: 20,
        good: 50,
        acceptable: 100,
        poor: 200,
      },
      file: {
        excellent: 200,
        good: 500,
        acceptable: 1000,
        poor: 2000,
      },
    },
  },
  
  maintainability: {
    maintainabilityIndex: {
      excellent: 85,
      good: 65,
      acceptable: 45,
      poor: 25,
    },
    technicalDebtRatio: {
      excellent: 5,
      good: 10,
      acceptable: 20,
      poor: 30,
    },
    duplicationPercentage: {
      excellent: 3,
      good: 5,
      acceptable: 10,
      poor: 15,
    },
  },
  
  security: {
    maxAllowedVulnerabilities: {
      critical: 0,
      high: 0,
      medium: 2,
      low: 5,
    },
  },
  
  performance: {
    timeComplexity: {
      excellent: 'O(1)',
      good: 'O(log n)',
      acceptable: 'O(n)',
      poor: 'O(n²)',
    },
    spaceComplexity: {
      excellent: 'O(1)',
      good: 'O(log n)',
      acceptable: 'O(n)',
      poor: 'O(n²)',
    },
  },
} as const;

export const PASSING_SCORE_THRESHOLD = 70;
export const CERTIFICATION_SCORE_THRESHOLD = 85;
export const EXCELLENCE_SCORE_THRESHOLD = 95;