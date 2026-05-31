import { Calendar, Clock } from 'lucide-react';
import { AssignmentWorkspace } from './AssignmentWorkspace';

interface AssignmentDetailProps {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  estimatedTime: string;
}

export const AssignmentDetail = ({ id, title, description, dueDate, estimatedTime }: AssignmentDetailProps) => (
  <div className="space-y-6">
    <div className="glass-card p-6">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{dueDate}</span>
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{estimatedTime}</span>
      </div>
    </div>
    <AssignmentWorkspace assignmentId={id} />
  </div>
);