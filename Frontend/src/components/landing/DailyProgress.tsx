import { useLockdownStore } from '../../stores/lockdownStore';
import { ProgressBar } from '../ui/ProgressBar';

export const DailyProgress = () => {
  const { todayFocusedMinutes, dailyGoalMinutes } = useLockdownStore();
  const progress = (todayFocusedMinutes / dailyGoalMinutes) * 100;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Daily Progress</h3>
      <ProgressBar value={progress} showLabel />
      <p className="text-sm text-muted-foreground mt-2">
        {todayFocusedMinutes} / {dailyGoalMinutes} minutes
      </p>
    </div>
  );
};