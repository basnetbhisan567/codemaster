import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight } from 'lucide-react';

interface SyntaxHelperProps {
  topic: string;
  syntax: string;
  examples: string[];
  tips: string[];
}

export const SyntaxHelper = ({ topic, syntax, examples, tips }: SyntaxHelperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold">{topic}</h3>
          <p className="text-sm text-muted-foreground font-mono">{syntax}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">Examples:</h4>
          <div className="space-y-2">
            {examples.map((example, i) => (
              <div key={i} className="bg-black/30 rounded-lg p-3">
                <code className="text-sm font-mono text-white/80">{example}</code>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Pro Tips:</h4>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};