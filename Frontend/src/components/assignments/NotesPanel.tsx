import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../ui/Button';

export const NotesPanel = () => {
  const [notes, setNotes] = useState('');
  return (
    <div className="w-80 border-l border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm font-medium">Notes</span>
        <Button variant="ghost" size="sm"><Save className="w-4 h-4" /></Button>
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 p-4 bg-transparent text-sm resize-none focus:outline-none" placeholder="Take notes..." />
    </div>
  );
};