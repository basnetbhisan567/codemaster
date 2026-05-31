import { ReminderCard } from './ReminderCard';
import { X } from 'lucide-react';

export const NotificationList = ({ onClose }: { onClose: () => void }) => (
  <div className="glass-card p-4">
    <div className="flex items-center justify-between mb-3"><h3 className="font-medium">Notifications</h3><button onClick={onClose}><X className="w-4 h-4" /></button></div>
    <ReminderCard title="Complete daily goal" time="2 hours left" />
    <ReminderCard title="Assignment due" time="Tomorrow" />
  </div>
);