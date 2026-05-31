import { useState } from 'react';
import { Button } from '../ui/Button';

export const NotificationPrefs = () => {
  const [reminders, setReminders] = useState(true);
  const [achievements, setAchievements] = useState(true);
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between"><span>Study Reminders</span><input type="checkbox" checked={reminders} onChange={(e) => setReminders(e.target.checked)} /></label>
      <label className="flex items-center justify-between"><span>Achievement Alerts</span><input type="checkbox" checked={achievements} onChange={(e) => setAchievements(e.target.checked)} /></label>
      <Button size="sm">Save Preferences</Button>
    </div>
  );
};