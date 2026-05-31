import { useState } from 'react';

export const useCodeRunner = () => {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCode = async (code: string, language: string) => {
    setIsRunning(true);
    setError(null);
    
    try {
      // Mock execution - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (language === 'javascript') {
        const result = eval(code);
        setOutput(String(result));
      } else {
        setOutput(`[${language}] Code execution simulated`);
      }
    } catch (err: any) {
      setError(err.message);
      setOutput('');
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError(null);
  };

  return { output, isRunning, error, runCode, clearOutput };
};