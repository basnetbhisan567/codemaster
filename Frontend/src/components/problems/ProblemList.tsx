import { motion } from 'framer-motion';
import { ProblemCard } from './ProblemCard';

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  solved?: boolean;
}

interface ProblemListProps {
  problems: Problem[];
  filter?: string;
}

export const ProblemList = ({ problems, filter }: ProblemListProps) => {
  const filteredProblems = filter
    ? problems.filter(p => p.topic === filter || p.difficulty === filter)
    : problems;

  return (
    <div className="space-y-2">
      {filteredProblems.map((problem, index) => (
        <motion.div
          key={problem.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
        >
          <ProblemCard {...problem} />
        </motion.div>
      ))}
    </div>
  );
};