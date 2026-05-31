import { Calendar, CheckCircle, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AssignmentCardProps {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export const AssignmentCard = ({ id, title, dueDate, completed }: AssignmentCardProps) => (
  <Link to={`/assignments/${id}`}>
    <div className="glass-card p-4 cursor-pointer hover:border-white/20 transition-all">
      <div className="flex items-center gap-3">
        {completed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
        <div className="flex-1"><h4 className="font-medium">{title}</h4></div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />{dueDate}</div>
      </div>
    </div>
  </Link>
);