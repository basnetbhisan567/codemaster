import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';
import { useLockdownStore } from '../../stores/lockdownStore';
import { Button } from '../ui/Button';

export const ExitVerification = () => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const { unlockQuiz, unlockApp } = useLockdownStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockApp(answer);
    if (!success) {
      setError('Incorrect answer. Try again.');
    }
  };

  if (!unlockQuiz) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">Exit Verification</h2>
      </div>

      <p className="text-muted-foreground mb-4">
        Answer this CS question to exit focus mode:
      </p>

      <div className="p-4 bg-secondary/30 rounded-lg mb-6">
        <p className="font-medium text-lg">{unlockQuiz.question}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError('');
          }}
          placeholder="Your answer..."
          className={`w-full h-11 px-4 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-destructive' : 'border-input'
          }`}
        />
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full">
          Verify & Exit
        </Button>
      </form>
    </motion.div>
  );
};