import { ALLOWED_TOPICS, BLOCKED_TOPICS } from '../../config/topics';

export const TopicGuard = ({ message }: { message: string }) => {
  const isAllowed = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // Check blocked topics first
    if (BLOCKED_TOPICS.some(topic => lowerText.includes(topic))) {
      return false;
    }
    
    // Check if at least one allowed topic is mentioned
    return ALLOWED_TOPICS.some(topic => lowerText.includes(topic));
  };

  if (!isAllowed(message)) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
        <p className="text-destructive font-medium">
          🚫 I can only help with computer science and programming topics.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please ask about coding, algorithms, data structures, web development, or CS theory.
        </p>
      </div>
    );
  }

  return null;
};