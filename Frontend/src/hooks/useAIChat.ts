import { useState, useCallback } from 'react';

interface UseAIChatOptions {
  model: string;
  context?: string;
}

export const useAIChat = ({ model, context }: UseAIChatOptions) => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, files?: File[]): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Create FormData for API call
      const formData = new FormData();
      formData.append('message', content);
      formData.append('model', model);
      formData.append('context', context || '');
      
      if (files) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/ai/chat', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      // return data.response;

      // Mock response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responses: Record<string, string> = {
        'javascript': "In JavaScript, you can declare variables using `let`, `const`, or `var`.\n\n```javascript\nlet name = 'John';\nconst age = 25;\n```",
        'python': "Python uses simple variable assignment:\n\n```python\nname = 'John'\nage = 25\n```",
      };
      
      const lowerContent = content.toLowerCase();
      let response = '';
      
      if (lowerContent.includes('variable')) {
        response = responses.javascript;
      } else if (lowerContent.includes('function')) {
        response = "Functions are reusable blocks of code:\n\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```";
      } else {
        response = `I'm here to help you learn! What specific topic would you like to explore?`;
      }
      
      return response;
    } catch (error) {
      console.error('AI Chat error:', error);
      return 'Sorry, I encountered an error. Please try again.';
    } finally {
      setIsLoading(false);
    }
  }, [model, context]);

  return {
    isLoading,
    sendMessage,
  };
};