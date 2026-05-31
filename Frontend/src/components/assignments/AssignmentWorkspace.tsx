import { useState } from 'react';
import { Play, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { NotesPanel } from './NotesPanel';

interface AssignmentWorkspaceProps {
  assignmentId: string;
}

export const AssignmentWorkspace = ({ assignmentId }: AssignmentWorkspaceProps) => {
  const [code, setCode] = useState('');
  return (
    <div className="glass-card h-[500px] flex">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-sm font-medium">Solution</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Play className="w-4 h-4" />Run</Button>
            <Button size="sm"><Save className="w-4 h-4" />Submit</Button>
          </div>
        </div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 p-4 bg-transparent font-mono text-sm resize-none focus:outline-none" placeholder="Write your solution..." />
      </div>
      <NotesPanel />
    </div>
  );
};