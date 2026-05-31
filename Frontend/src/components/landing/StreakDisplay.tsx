import { Flame } from 'lucide-react';

export const StreakDisplay = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3">
        <Flame className="w-8 h-8 text-orange-500" />
        <div>
          <p className="text-2xl font-bold">7</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </div>
    </div>
  );
};