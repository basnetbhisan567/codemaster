import { Bell } from 'lucide-react';
import { useState } from 'react';
import { NotificationList } from './NotificationList';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const count = 3;
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 glass rounded-lg"><Bell className="w-5 h-5" />{count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-xs flex items-center justify-center">{count}</span>}</button>
      {isOpen && <div className="absolute right-0 mt-2 w-80 z-50"><NotificationList onClose={() => setIsOpen(false)} /></div>}
    </div>
  );
};