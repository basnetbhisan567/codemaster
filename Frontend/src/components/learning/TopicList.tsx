import { motion } from 'framer-motion';
import { TopicCard } from './TopicCard';

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  language: string;
}

interface TopicListProps {
  topics: Topic[];
  language?: string;
}

export const TopicList = ({ topics, language }: TopicListProps) => {
  const filteredTopics = language 
    ? topics.filter(t => t.language === language)
    : topics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTopics.map((topic, index) => (
        <motion.div
          key={topic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <TopicCard {...topic} />
        </motion.div>
      ))}
    </div>
  );
};