import { motion } from 'framer-motion';
import { Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface CodeExplainProps {
  code: string;
  explanation: string;
  language?: string;
}

export const CodeExplain = ({ code, explanation, language = 'javascript' }: CodeExplainProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium uppercase">{language}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      
      <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono text-white/90">{code}</code>
      </pre>
      
      <div className="text-sm text-muted-foreground border-t border-white/10 pt-3">
        <p>{explanation}</p>
      </div>
    </motion.div>
  );
};