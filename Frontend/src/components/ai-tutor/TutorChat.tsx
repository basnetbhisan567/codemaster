import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Shield, Send, Sparkles, Loader2, Copy, Check, 
  Paperclip, X, FileText, ChevronDown, Zap, Brain, Code
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../utils/cn';

interface TutorChatProps {
  context?: string;
  selectedTopic?: { id: string; title: string; language: string; difficulty: string } | null;
  topicId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

interface Model {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const models: Model[] = [
  { id: 'gemini-1.5-flash', name: 'Fast Model', icon: <Zap className="w-4 h-4" />, description: 'Quick responses for general questions' },
  { id: 'gemini-1.5-pro', name: 'Advanced Model', icon: <Brain className="w-4 h-4" />, description: 'Deep reasoning for complex topics' },
];

export const TutorChat = ({ context = 'General Programming', selectedTopic, topicId }: TutorChatProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic greeting based on selected topic
  useEffect(() => {
    const greeting = selectedTopic 
      ? `👋 Hi! I'm your AI coding tutor. Let's master **${selectedTopic.title}** together. What questions do you have about ${selectedTopic.title.toLowerCase()}?`
      : `👋 Hi! I'm your AI coding tutor. I'm here to help you with **${context}**. What would you like to learn today?`;
    
    setMessages([{
      id: '1',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }]);
  }, [selectedTopic, context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📝';
    return '📎';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    
    // 🎯 INGREDIENT PACKAGER - Gather all data
    const payload = {
      message: input,
      topic_id: topicId || selectedTopic?.id || null,
      topic_title: selectedTopic?.title || null,
      topic_language: selectedTopic?.language || null,
      topic_difficulty: selectedTopic?.difficulty || null,
      model_id: selectedModel.id,
      files: uploadedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
    };
    
    console.log('📦 Ingredient Packager Payload:', payload);
    
    setInput('');
    setIsLoading(true);

    try {
      // Create FormData for API call
      const formData = new FormData();
      formData.append('message', input);
      formData.append('topic_id', topicId || selectedTopic?.id || '');
      formData.append('topic_title', selectedTopic?.title || '');
      formData.append('topic_language', selectedTopic?.language || '');
      formData.append('topic_difficulty', selectedTopic?.difficulty || '');
      formData.append('model_id', selectedModel.id);
      
      uploadedFiles.forEach((file) => {
        formData.append('files', file.file);
      });

      // TODO: Replace with actual API call
      // const response = await fetch('/api/ai/chat', { method: 'POST', body: formData });
      // const data = await response.json();
      
      // Mock response with project suggestion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let response = '';
      if (selectedTopic) {
        response = `Great question about **${selectedTopic.title}**! \n\n`;
        
        if (selectedTopic.title.includes('Variables')) {
          response += `I found a **Level 1 "Simple Calculator"** project from GitHub that's perfect for practicing variables. Want to try it? Check the Recommended Projects section on the left!\n\n`;
        } else if (selectedTopic.title.includes('Functions')) {
          response += `I found a **Level 1 "Todo List App"** from GitHub that will help you master functions. Check it out in the Recommended Projects section!\n\n`;
        } else if (selectedTopic.title.includes('Arrays')) {
          response += `I found a **Level 2 "Shopping Cart"** project that uses map, filter, and reduce. Perfect for practicing array methods!\n\n`;
        }
        
        response += `Now, about your question: Here's what you need to know...\n\n`;
      }
      
      response += `I'm analyzing your question about **${input.substring(0, 50)}...**\n\n`;
      response += `Since you're learning **${selectedTopic?.title || context}**, here's a helpful explanation:\n\n`;
      response += `\`\`\`${selectedTopic?.language.toLowerCase() || 'javascript'}\n// Example code for ${selectedTopic?.title || 'your topic'}\nconst example = "This is a sample";\nconsole.log(example);\n\`\`\`\n\n`;
      response += `Would you like me to explain this in more detail or show another example?`;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setUploadedFiles([]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card variant="glass" className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                AI Tutor
                {selectedTopic && (
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                    {selectedTopic.title}
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {selectedTopic ? `${selectedTopic.language} • ${selectedTopic.difficulty}` : 'CS topics only'}
              </p>
            </div>
          </div>
          
          {/* Model Selector */}
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowModelDropdown(!showModelDropdown)} className="flex items-center gap-2">
              {selectedModel.icon}
              <span className="text-xs">{selectedModel.name}</span>
              <ChevronDown className={cn('w-3 h-3 transition-transform', showModelDropdown && 'rotate-180')} />
            </Button>
            
            <AnimatePresence>
              {showModelDropdown && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 w-64 z-50">
                  <Card variant="glass" className="p-2 space-y-1">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                        className={cn('w-full text-left p-3 rounded-lg transition-all flex items-start gap-3', selectedModel.id === model.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5')}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">{model.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </div>
                      </button>
                    ))}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', message.role === 'assistant' ? 'bg-gradient-to-br from-primary to-blue-500' : 'bg-gradient-to-br from-green-500 to-emerald-500')}>
                {message.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
              </div>

              <div className={cn('flex-1 max-w-[80%]', message.role === 'user' && 'flex justify-end')}>
                <div className={cn('rounded-2xl px-4 py-3', message.role === 'assistant' ? 'glass' : 'bg-primary text-primary-foreground')}>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-white/10">
                      {message.attachments.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 text-xs">
                          <span>{getFileIcon(file.type)}</span>
                          <span className="truncate">{file.name}</span>
                          <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        if (!match) return <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
                        
                        return (
                          <div className="relative group my-2">
                            <button onClick={() => copyToClipboard(codeString, message.id)} className="absolute right-2 top-2 z-10 p-1.5 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                              {copiedId === message.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/70" />}
                            </button>
                            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-lg !my-0">{codeString}</SyntaxHighlighter>
                          </div>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  
                  <span className="text-[10px] opacity-50 mt-1 block">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="glass rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Thinking...</span></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-wrap gap-2 mb-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-sm">
                  <span>{getFileIcon(file.type)}</span>
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(file.id)} className="p-0.5 hover:bg-white/10 rounded-full"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${selectedTopic?.title || context}...`}
              disabled={isLoading}
              className="w-full px-4 pr-10 py-2.5 glass rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button onClick={() => fileInputRef.current?.click()} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors" disabled={isLoading}>
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.js,.ts,.py,.java,.cpp" multiple onChange={handleFileUpload} className="hidden" />
          </div>
          <Button onClick={handleSend} disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading} className="px-4"><Send className="w-4 h-4" /></Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Press Enter to send • Supports PDF, TXT, and code files</p>
      </div>
    </Card>
  );
};