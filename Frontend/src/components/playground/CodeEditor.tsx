import { useState } from 'react';

export const CodeEditor = ({ language = 'javascript' }: { language?: string }) => {
  const [code, setCode] = useState('');
  return <textarea value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none" placeholder={`Write ${language} code...`} />;
};