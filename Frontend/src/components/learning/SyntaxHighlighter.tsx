import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export const SyntaxHighlighter = ({ code, language = 'javascript', showLineNumbers = true }: SyntaxHighlighterProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-medium uppercase text-muted-foreground">{language}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 w-7 p-0">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono">
          {showLineNumbers ? (
            <table className="border-spacing-y-0">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-right text-white/30 select-none border-r border-white/10">
                      {i + 1}
                    </td>
                    <td className="pl-4 text-white/90">{line || ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
};