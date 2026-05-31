import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface AssignmentTimerProps {
  initialMinutes: number;
  onComplete?: () => void;
}

export const AssignmentTimer = ({ initialMinutes, onComplete }: AssignmentTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  
  useEffect(() => {
    if (timeLeft <= 0) { onComplete?.(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 300;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isWarning ? 'bg-red-500/20 text-red-400' : 'glass'}`}>
      <Timer className="w-4 h-4" />
      <span className="font-mono text-sm">{minutes}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
};