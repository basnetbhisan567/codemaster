import { motion } from 'framer-motion';
import { ProblemSolve } from './ProblemSolve';

interface ProblemDetailProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
}

export const ProblemDetail = ({ id, title, description, difficulty, examples, constraints }: ProblemDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="glass-card p-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <span className={`text-sm font-medium ${
          difficulty === 'Easy' ? 'text-green-400' :
          difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {difficulty}
        </span>
        
        <p className="mt-4 text-muted-foreground">{description}</p>
        
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Examples:</h3>
          {examples.map((ex, i) => (
            <div key={i} className="bg-secondary/20 rounded-lg p-4">
              <p className="text-sm"><strong>Input:</strong> {ex.input}</p>
              <p className="text-sm"><strong>Output:</strong> {ex.output}</p>
              {ex.explanation && (
                <p className="text-xs text-muted-foreground mt-1">{ex.explanation}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Constraints:</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {constraints.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>
      
      <ProblemSolve problemId={id} />
    </motion.div>
  );
};