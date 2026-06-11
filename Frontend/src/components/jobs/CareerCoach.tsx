import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { AssistantMessage } from '../../types/job';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { jobService } from '../../services/jobService';

export function CareerCoach() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: AssistantMessage[] = [
      ...messages,
      { role: 'user', content: input },
    ];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await jobService.getCareerAdvice(input);
      setMessages([...newMessages, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Career coach unavailable. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" className="h-[600px] flex flex-col border-white/10">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Career Coach
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ask about career paths, interview tips, salary negotiation, skill development.
            </p>
          </div>
          <Badge variant="success" size="sm">Online</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Ask me anything about your career!</p>
            <p className="text-xs mt-2">
              "What skills should I learn for FAANG?" • "Review my resume" • "How to negotiate salary?"
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-3 ${
                msg.role === 'user' ? 'bg-primary/20' : 'bg-white/5'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl p-3 bg-white/5">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your career question..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button size="sm" onClick={handleSend} disabled={!input.trim() || loading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}