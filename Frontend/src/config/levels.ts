export const PROJECT_LEVELS = [
  {
    level: 1,
    name: 'Foundations',
    description: 'Basic syntax and simple programs',
    requiredTopics: ['variables', 'data types', 'loops', 'functions', 'arrays'],
    projects: [
      { id: 'calculator', name: 'Simple Calculator', difficulty: 'Easy' },
      { id: 'todo', name: 'Todo List', difficulty: 'Easy' },
      { id: 'temperature', name: 'Temperature Converter', difficulty: 'Easy' },
    ],
    unlockCriteria: {
      completedTopics: 5,
      minProjects: 2,
    },
  },
  {
    level: 2,
    name: 'Builder',
    description: 'DOM manipulation and basic algorithms',
    requiredTopics: ['dom', 'events', 'objects', 'arrays advanced', 'algorithms basic'],
    projects: [
      { id: 'quiz', name: 'Quiz App', difficulty: 'Medium' },
      { id: 'weather', name: 'Weather Widget', difficulty: 'Medium' },
      { id: 'markdown', name: 'Markdown Previewer', difficulty: 'Medium' },
    ],
    unlockCriteria: {
      completedTopics: 10,
      minProjects: 3,
    },
  },
  {
    level: 3,
    name: 'Creator',
    description: 'Full-stack concepts and APIs',
    requiredTopics: ['fetch', 'promises', 'async/await', 'rest api', 'node basics'],
    projects: [
      { id: 'blog', name: 'Blog Platform', difficulty: 'Hard' },
      { id: 'chat', name: 'Real-time Chat', difficulty: 'Hard' },
      { id: 'ecommerce', name: 'E-commerce Cart', difficulty: 'Hard' },
    ],
    unlockCriteria: {
      completedTopics: 15,
      minProjects: 2,
    },
  },
  {
    level: 4,
    name: 'Architect',
    description: 'Advanced patterns and optimization',
    requiredTopics: ['design patterns', 'performance', 'security', 'testing'],
    projects: [
      { id: 'dashboard', name: 'Analytics Dashboard', difficulty: 'Expert' },
      { id: 'social', name: 'Social Media Clone', difficulty: 'Expert' },
    ],
    unlockCriteria: {
      completedTopics: 20,
      minProjects: 2,
    },
  },
  {
    level: 5,
    name: 'Innovator',
    description: 'Real-world open source & hackathons',
    requiredTopics: ['open source', 'git advanced', 'system design'],
    projects: [
      { id: 'opensource', name: 'Contribute to Open Source', difficulty: 'Real World' },
      { id: 'hackathon', name: 'Hackathon Project', difficulty: 'Real World' },
    ],
    unlockCriteria: {
      completedTopics: 25,
      minProjects: 1,
      requiresCertification: true,
    },
  },
];

export const getLevel = (levelNumber: number) => 
  PROJECT_LEVELS.find(l => l.level === levelNumber);

export const canUnlockLevel = (
  currentLevel: number,
  completedTopics: number,
  completedProjects: number,
  hasCertification: boolean = false
): boolean => {
  const nextLevel = PROJECT_LEVELS.find(l => l.level === currentLevel + 1);
  if (!nextLevel) return false;
  
  const criteria = nextLevel.unlockCriteria;
  return (
    completedTopics >= criteria.completedTopics &&
    completedProjects >= criteria.minProjects &&
    (!criteria.requiresCertification || hasCertification)
  );
};