import { motion } from 'framer-motion';
import { AssignmentCard } from './AssignmentCard';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface AssignmentListProps {
  assignments: Assignment[];
}

export const AssignmentList = ({ assignments }: AssignmentListProps) => (
  <div className="space-y-3">
    {assignments.map((assignment, i) => (
      <motion.div key={assignment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
        <AssignmentCard {...assignment} />
      </motion.div>
    ))}
  </div>
);