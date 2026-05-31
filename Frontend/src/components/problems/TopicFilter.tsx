import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface TopicFilterProps {
  topics: string[];
  selected: string | null;
  onChange: (topic: string | null) => void;
}

export const TopicFilter = ({ topics, selected, onChange }: TopicFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        onClick={() => onChange(null)}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
          !selected ? 'bg-primary text-white' : 'glass text-muted-foreground hover:text-white'
        )}
        whileTap={{ scale: 0.95 }}
      >
        All
      </motion.button>
      
      {topics.map((topic) => (
        <motion.button
          key={topic}
          onClick={() => onChange(topic)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            selected === topic ? 'bg-primary text-white' : 'glass text-muted-foreground hover:text-white'
          )}
          whileTap={{ scale: 0.95 }}
        >
          {topic}
        </motion.button>
      ))}
    </div>
  );
};