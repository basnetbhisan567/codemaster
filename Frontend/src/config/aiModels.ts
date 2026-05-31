export const AI_MODELS = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    contextWindow: 1000000,
    costPer1k: 0.000075,
    strengths: ['Fast responses', 'Large context', 'Code generation'],
    bestFor: ['Quick questions', 'Code review', 'Syntax help'],
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    contextWindow: 2000000,
    costPer1k: 0.00025,
    strengths: ['Deep reasoning', 'Complex analysis', 'Multi-step problems'],
    bestFor: ['Algorithm explanation', 'System design', 'Advanced topics'],
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    contextWindow: 200000,
    costPer1k: 0.00025,
    strengths: ['Concise answers', 'Safety focused', 'Natural conversation'],
    bestFor: ['Quick tutoring', 'Concept explanation', 'Debugging help'],
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'Mistral AI',
    contextWindow: 32000,
    costPer1k: 0.0002,
    strengths: ['Efficient', 'Open weights', 'Multilingual'],
    bestFor: ['General CS topics', 'Code generation', 'Language practice'],
  },
] as const;

export type AIModelId = typeof AI_MODELS[number]['id'];

export const DEFAULT_MODEL: AIModelId = 'gemini-1.5-flash';

export const getModelById = (id: AIModelId) => {
  return AI_MODELS.find(model => model.id === id);
};