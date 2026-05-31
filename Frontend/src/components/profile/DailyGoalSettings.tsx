import { useState } from 'react';
import { Button } from '../ui/Button';

export const DailyGoalSettings = () => {
  const [goal, setGoal] = useState(150);
  return (
    <div className="space-y-4">
      <label className="block"><span className="text-sm">Daily Focus Goal (minutes)</span><input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="w-full mt-1 p-2 glass rounded-lg" min="30" max="480" /></label>
      <Button size="sm">Save</Button>
    </div>
  );
};