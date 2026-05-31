export const formatCode = (code: string, language: string): string => {
  return code;
};

export const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rs: 'rust',
    html: 'html',
    css: 'css',
    json: 'json',
  };
  return languageMap[ext || ''] || 'plaintext';
};

export const getStarterCode = (language: string): string => {
  const starters: Record<string, string> = {
    javascript: '// Write your JavaScript code here\n\n',
    python: '# Write your Python code here\n\n',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n',
    cpp: '#include <iostream>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n',
  };
  return starters[language] || '// Write your code here\n';
};