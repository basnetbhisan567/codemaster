import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';

interface HintSystemProps {
  problemId: string;
}

export const HintSystem = ({ problemId }: HintSystemProps) => {
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  
  const hints = [
    'Think about using a loop to iterate through the array.',
    'You can use a variable to keep track of the running sum.',
    'Consider edge cases like empty arrays.',
  ];

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h4 className="font-medium">Progressive Hints</h4>
      </div>
      
      {hints.map((hint, index) => (
        <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => revealHint(index)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium">Hint {index + 1}</span>
            {revealedHints.includes(index) ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {revealedHints.includes(index) && (
            <div className="p-3 bg-secondary/20 border-t border-white/10">
              <p className="text-sm text-muted-foreground">{hint}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};