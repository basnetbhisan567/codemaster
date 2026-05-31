import { Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface ExampleCodeProps {
  title: string;
  code: string;
  output?: string;
  language?: string;
  onRun?: () => void;
}

export const ExampleCode = ({ title, code, output, language = 'javascript', onRun }: ExampleCodeProps) => {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        {onRun && (
          <Button variant="outline" size="sm" onClick={onRun} className="gap-1">
            <Play className="w-3 h-3" />
            Run
          </Button>
        )}
      </div>
      
      <SyntaxHighlighter code={code} language={language} showLineNumbers={true} />
      
      {output && (
        <div className="mt-3 p-3 bg-black/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Output:</p>
          <code className="text-sm font-mono text-green-400">{output}</code>
        </div>
      )}
    </div>
  );
};