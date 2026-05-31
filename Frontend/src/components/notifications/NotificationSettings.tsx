import { useState } from 'react';
import { Button } from '../ui/Button';

export const NotificationSettings = () => {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between"><span>Email Notifications</span><input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} /></label>
      <label className="flex items-center justify-between"><span>Push Notifications</span><input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} /></label>
      <Button size="sm">Save</Button>
    </div>
  );
};