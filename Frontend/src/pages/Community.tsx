import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, BookOpen, Users2, Search, Plus,
  MessageCircle, Globe, Lock, X, Paperclip, Send,
  Loader2, Code, Smile, Bold, Italic, Star, Clock, 
  Settings, ArrowRight, ExternalLink, Image as ImageIcon, FileText, 
  Archive, File, UserPlus, Braces, Activity
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../services/apiClient';

interface ForumTopicFromAPI {
  id: number; title: string; content: string; author_name: string;
  category: string; is_pinned: boolean; views: number;
  tags: string[]; replies_count: number; created_at: string;
}

interface ChatMessageFromAPI {
  id: number; sender_name: string; content: string; room: string;
  message_type: string; file_url: string; file_name: string;
  file_size: string; created_at: string;
}

interface StudyGroupFromAPI {
  id: number; name: string; description: string; topic: string;
  owner_name: string; max_members: number; is_private: boolean;
  members_count: number; created_at: string;
}

const MetricCard = ({ icon: Icon, label, value, accentColor, onClick }: {
  icon: React.ElementType; label: string; value: number | string; color: string; accentColor: string; onClick?: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg group flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
      </div>
      <div>
        <p className="text-xs font-medium text-[#8B949E] uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-[#FFFFFF]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
    <Activity className="w-3.5 h-3.5 text-[#8B949E] opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

const OnlineDot = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EA44F] opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2EA44F]" />
  </span>
);

const Community = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [forumTopics, setForumTopics] = useState<ForumTopicFromAPI[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageFromAPI[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroupFromAPI[]>([]);
  const [loadingForums, setLoadingForums] = useState(true);
  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCodeBlock, setShowCodeBlock] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchForumTopics = useCallback(async () => {
    setLoadingForums(true);
    try {
      const response = await apiClient.get('/community/forums', { requiresAuth: false });
      const data = response.data as any;
      if (data?.topics) setForumTopics(data.topics);
    } catch (err: any) { console.log('Forums:', err.message); }
    finally { setLoadingForums(false); }
  }, []);

  const fetchChatMessages = useCallback(async () => {
    setLoadingChat(true);
    try {
      const response = await apiClient.get('/community/chat/global', { requiresAuth: false });
      const data = response.data as any;
      if (Array.isArray(data)) setChatMessages(data);
    } catch (err: any) { console.log('Chat:', err.message); }
    finally { setLoadingChat(false); }
  }, []);

  const fetchStudyGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const response = await apiClient.get('/community/groups', { requiresAuth: false });
      const data = response.data as any;
      if (Array.isArray(data)) setStudyGroups(data);
    } catch (err: any) { console.log('Groups:', err.message); }
    finally { setLoadingGroups(false); }
  }, []);

  useEffect(() => { fetchForumTopics(); fetchChatMessages(); fetchStudyGroups(); }, [fetchForumTopics, fetchChatMessages, fetchStudyGroups]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSendingMessage(true);
    try {
      const response = await apiClient.post('/community/chat/send', { content: message.trim(), room: 'global' }, { requiresAuth: true });
      if (response.data) {
        setChatMessages(prev => [...prev, response.data as ChatMessageFromAPI]);
        setMessage('');
        setShowCodeBlock(false);
      }
    } catch (err: any) { console.error('Send failed:', err); }
    finally { setSendingMessage(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/v1/community/chat/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, data as ChatMessageFromAPI]);
      }
    } catch (err) { console.error('Upload failed:', err); }
    finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    try {
      const response = await apiClient.post('/community/forums', { title: newTopicTitle, content: newTopicContent, category: 'general', tags: [] }, { requiresAuth: true });
      if (response.data) {
        setForumTopics(prev => [response.data as ForumTopicFromAPI, ...prev]);
        setNewTopicTitle('');
        setNewTopicContent('');
        setShowNewTopic(false);
      }
    } catch (err: any) { console.error('Create topic failed:', err); }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const response = await apiClient.post('/community/groups', { name: newGroupName, description: '', topic: 'general', max_members: 50, is_private: false }, { requiresAuth: true });
      if (response.data) {
        setStudyGroups(prev => [response.data as StudyGroupFromAPI, ...prev]);
        setNewGroupName('');
        setShowNewGroup(false);
      }
    } catch (err: any) { console.error('Create group failed:', err); }
  };

  const handleJoinGroup = async (groupId: number) => {
    try { await apiClient.post(`/community/groups/${groupId}/join`, {}, { requiresAuth: true }); fetchStudyGroups(); }
    catch (err: any) { console.error('Join failed:', err); }
  };

  const insertCodeBlock = () => {
    setMessage(prev => prev + '\n```\n// Your code here\n```\n');
    setShowCodeBlock(false);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <ImageIcon className="w-4 h-4 text-pink-400" />;
    if (['pdf'].includes(ext || '')) return <FileText className="w-4 h-4 text-red-400" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-4 h-4 text-blue-400" />;
    if (['zip', 'rar', '7z'].includes(ext || '')) return <Archive className="w-4 h-4 text-yellow-400" />;
    return <File className="w-4 h-4 text-[#8B949E]" />;
  };

  const onlineTeammates = [
    { name: 'Alex Chen', avatar: 'AC', color: 'from-blue-500 to-cyan-500' },
    { name: 'Sarah Kim', avatar: 'SK', color: 'from-purple-500 to-pink-500' },
    { name: 'Mike Ross', avatar: 'MR', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0 h-full" style={{ backgroundColor: '#0D1117' }}>
      
      {/* 1. Header Metrics Row */}
      <div className="px-6 pt-6 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard icon={BookOpen} label="Forum Topics" value={forumTopics.length} color="text-[#2EA44F]" accentColor="#2EA44F" onClick={() => setActiveTab('forums')} />
          <MetricCard icon={MessageSquare} label="Chat Messages" value={chatMessages.length} color="text-[#58A6FF]" accentColor="#58A6FF" onClick={() => setActiveTab('chat')} />
          <MetricCard icon={Users2} label="Active Study Groups" value={studyGroups.length} color="text-[#BC8CFF]" accentColor="#BC8CFF" onClick={() => setActiveTab('groups')} />
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex px-6 pb-6 gap-5 min-h-0 mt-2">
        
        {/* LEFT COLUMN: Controls & Actions */}
        <div className="w-[220px] flex-shrink-0 flex flex-col justify-between border-r border-[#30363D]/60 pr-4">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider px-2 mb-2">Actions Panel</div>
              {activeTab === 'forums' && (
                <Button size="sm" className="w-full justify-start gap-2 bg-[#2EA44F] hover:bg-[#2C974B]" onClick={() => setShowNewTopic(true)}>
                  <Plus className="w-4 h-4" /> New Forum Topic
                </Button>
              )}
              {activeTab === 'groups' && (
                <Button size="sm" className="w-full justify-start gap-2 bg-[#58A6FF] hover:bg-[#478edb]" onClick={() => setShowNewGroup(true)}>
                  <Plus className="w-4 h-4" /> Create Study Group
                </Button>
              )}
              {activeTab === 'chat' && (
                <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-xl text-center">
                  <p className="text-xs text-[#8B949E] mb-2">Need local files in chat?</p>
                  <Button size="sm" variant="outline" className="w-full gap-1.5 border-[#30363D] text-xs text-white" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="w-3.5 h-3.5 text-[#8B949E]" /> Choose File
                  </Button>
                </div>
              )}
            </div>

            <div>
              <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider px-2 mb-1">Quick Links</div>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs text-[#8B949E] hover:text-white hover:bg-[#1F2937]/50 transition-colors">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span>Popular Topics</span>
              </button>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs text-[#8B949E] hover:text-white hover:bg-[#1F2937]/50 transition-colors">
                <Clock className="w-3.5 h-3.5 text-[#58A6FF]" />
                <span>Recent Activity</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#30363D]/60">
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs text-[#8B949E] hover:text-white hover:bg-[#1F2937]/50 transition-colors">
              <Settings className="w-3.5 h-3.5" />
              <span>Community Settings</span>
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: Central Navigation & Feed Board */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
          
          {/* Top Horizontal Navigation Tab bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0D1117] border-b border-[#30363D]">
            <div className="flex items-center gap-1">
              {[
                { id: 'chat', label: 'Global Chat', icon: MessageCircle, hasLive: true },
                { id: 'forums', label: 'Forums & Topics', icon: BookOpen },
                { id: 'groups', label: 'Study Groups', icon: Users2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected 
                        ? 'bg-[#161B22] text-white border-t-2 border-[#58A6FF]' 
                        : 'text-[#8B949E] hover:text-white hover:bg-[#1F2937]/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.hasLive && (
                      <span className="flex items-center gap-1 ml-1 bg-[#2EA44F]/10 px-1.5 py-0.5 rounded text-[10px] text-[#2EA44F]">
                        <OnlineDot /> Live
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Contextual Sub-Search bar inside center content wrapper */}
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#6E7681]" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-md py-1 pl-8 pr-3 text-xs text-white placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          {/* Interactive Core Target View Panel */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingChat ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-[#58A6FF]" />
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <div className="w-14 h-14 rounded-xl bg-[#1F2937] flex items-center justify-center mb-3">
                        <Braces className="w-6 h-6 text-[#8B949E]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#8B949E] mb-1">No messages yet</h3>
                      <p className="text-xs text-[#6E7681] max-w-xs">Start the conversation! Share snippets or ask questions.</p>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="flex items-start gap-3 group hover:bg-[#1F2937]/20 rounded-lg p-2 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#58A6FF]/30 to-[#BC8CFF]/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {(msg.sender_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-white">{msg.sender_name || 'Unknown'}</span>
                            <span className="text-[10px] text-[#6E7681]">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {msg.message_type === 'image' && msg.file_url ? (
                            <div className="mt-1">
                              <img src={`http://localhost:5000${msg.file_url}`} alt={msg.file_name} className="max-w-[320px] max-h-[200px] rounded-lg border border-[#30363D]" />
                              <p className="text-[10px] text-[#6E7681] mt-1">{msg.file_name} ({msg.file_size})</p>
                            </div>
                          ) : msg.message_type === 'file' ? (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-[#0D1117] border border-[#30363D] mt-1 max-w-sm">
                              {getFileIcon(msg.file_name || '')}
                              <div className="flex-1 min-w-0">
                                <a href={`http://localhost:5000${msg.file_url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#58A6FF] hover:underline truncate block">
                                  {msg.file_name}
                                </a>
                                <p className="text-[10px] text-[#6E7681]">{msg.file_size}</p>
                              </div>
                              <a href={`http://localhost:5000${msg.file_url}`} download className="text-[#8B949E] hover:text-white">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-[#C9D1D9] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Tray Footer Container with newly structured File-Uploader */}
                <div className="p-3 border-t border-[#30363D] bg-[#0D1117]">
                  <AnimatePresence>
                    {showCodeBlock && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="mb-2 p-2 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-between">
                        <span className="text-[11px] text-[#8B949E] font-medium">Inject code context:</span>
                        <div className="flex gap-1.5">
                          {['JS', 'Python', 'TS', 'Plain'].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => {
                                if (lang === 'Plain') insertCodeBlock();
                                else setMessage(prev => prev + `\n\`\`\`${lang.toLowerCase()}\n// Paste code here\n\`\`\`\n`);
                                setShowCodeBlock(false);
                              }}
                              className="px-2 py-0.5 text-[10px] bg-[#1F2937] rounded hover:bg-[#30363D] text-[#8B949E] transition-colors"
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#161B22] rounded-lg border border-[#30363D] px-2 py-1 gap-0.5">
                      {/* Fixed: Removed 'title' attribute from custom Buttons to satisfy TypeScript */}
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowCodeBlock(!showCodeBlock)}>
                        <Code className="w-3.5 h-3.5 text-[#8B949E]" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setMessage(prev => prev + '**bold**')}>
                        <Bold className="w-3.5 h-3.5 text-[#8B949E]" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setMessage(prev => prev + '*italic*')}>
                        <Italic className="w-3.5 h-3.5 text-[#8B949E]" />
                      </Button>
                      
                      <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFileUpload} />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5 text-[#8B949E]" />}
                      </Button>
                    </div>

                    <Input
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Type a group broadcast message..."
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 bg-[#161B22] border-[#30363D] text-xs h-9 text-white placeholder:text-[#6E7681]"
                    />

                    <Button size="sm" onClick={handleSendMessage} disabled={!message.trim() || sendingMessage} className="h-9 w-9 p-0 bg-[#58A6FF] hover:bg-[#478edb] text-white">
                      {sendingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'forums' && (
              <div className="p-4">
                <AnimatePresence>
                  {showNewTopic && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                      <Card className="p-4 space-y-3 bg-[#0D1117] border-[#30363D]">
                        <Input placeholder="Topic title..." value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} className="bg-[#161B22] border-[#30363D] text-xs text-white" />
                        <textarea placeholder="Write your forum content payload..." value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)} className="w-full h-20 bg-[#161B22] border border-[#30363D] rounded-lg p-2.5 text-xs resize-none text-white focus:outline-none focus:border-[#58A6FF]" />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" className="text-xs text-[#8B949E] hover:text-white" onClick={() => setShowNewTopic(false)}>Cancel</Button>
                          <Button size="sm" className="text-xs bg-[#2EA44F] hover:bg-[#2C974B] text-white" onClick={handleCreateTopic}>Publish</Button>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loadingForums ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#58A6FF]" /></div>
                ) : (
                  <div className="space-y-2">
                    {forumTopics.filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(topic => (
                      <div key={topic.id} className="p-3 rounded-lg bg-[#0D1117]/40 hover:bg-[#1F2937]/30 transition-colors border border-[#30363D]/60 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" size="sm" className="text-[10px] text-[#58A6FF] border-[#58A6FF]/30">{topic.category}</Badge>
                          <h3 className="font-semibold text-xs text-white">{topic.title}</h3>
                        </div>
                        <p className="text-xs text-[#8B949E] mb-2 line-clamp-2">{topic.content}</p>
                        <div className="flex items-center gap-3 text-[10px] text-[#6E7681]">
                          <span>By: {topic.author_name}</span>
                          <span>• {topic.replies_count} replies</span>
                          <span>• {topic.views} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="p-4">
                <AnimatePresence>
                  {showNewGroup && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                      <Card className="p-3 flex gap-2 bg-[#0D1117] border-[#30363D]">
                        <Input placeholder="Enter workspace group label..." value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="bg-[#161B22] border-[#30363D] text-xs flex-1 text-white" />
                        <Button size="sm" className="text-xs bg-[#2EA44F] text-white" onClick={handleCreateGroup}>Create</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowNewGroup(false)} className="text-[#8B949E] hover:text-white"><X className="w-3.5 h-3.5" /></Button>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loadingGroups ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#58A6FF]" /></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studyGroups.map(group => (
                      <div key={group.id} className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex flex-col justify-between hover:border-[#8B949E] transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {group.is_private ? <Lock className="w-3.5 h-3.5 text-yellow-500" /> : <Globe className="w-3.5 h-3.5 text-[#2EA44F]" />}
                            <h4 className="font-semibold text-xs text-white">{group.name}</h4>
                          </div>
                          <p className="text-[11px] text-[#8B949E] line-clamp-2 mb-2">{group.description || 'No specialized description provided yet.'}</p>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between text-[10px] text-[#6E7681]">
                            <span>{group.members_count}/{group.max_members} Devs</span>
                            <Badge variant="outline" size="sm" className="text-[9px] text-[#8B949E] border-[#30363D]">{group.topic}</Badge>
                          </div>
                          <Button size="sm" className="w-full text-xs bg-[#2EA44F] hover:bg-[#2C974B] text-white h-7" onClick={() => handleJoinGroup(group.id)}>
                            Join Unit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Teammates Monitoring & Shared Context Assets */}
        <div className="w-[240px] flex-shrink-0 flex flex-col border-l border-[#30363D]/60 pl-4">
          <div className="space-y-5 flex-1 overflow-y-auto">
            
            {/* Teammates online list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">Teammates</h4>
                <Badge variant="outline" size="sm" className="text-[9px] bg-[#2EA44F]/10 text-[#2EA44F] border-none px-1.5 py-0">
                  {onlineTeammates.length} Active
                </Badge>
              </div>
              <div className="space-y-1.5">
                {onlineTeammates.map((mate, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#161B22] transition-colors cursor-pointer group">
                    <div className="relative flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${mate.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {mate.avatar}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#2EA44F] border border-[#0D1117]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{mate.name}</p>
                      <p className="text-[10px] text-[#2EA44F]">Online</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared workspace documents registry */}
            <div>
              <h4 className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-2">Recent Documents</h4>
              {chatMessages.filter(m => m.file_url).slice(0, 4).length === 0 ? (
                <div className="border border-dashed border-[#30363D] rounded-xl py-4 text-center">
                  <p className="text-[10px] text-[#6E7681]">No assets uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {chatMessages.filter(m => m.file_url).slice(0, 4).map((msg, i) => (
                    <a key={i} href={`http://localhost:5000${msg.file_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#161B22] transition-colors group">
                      {getFileIcon(msg.file_name || '')}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white truncate font-medium">{msg.file_name}</p>
                        <p className="text-[9px] text-[#6E7681]">{msg.file_size}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#6E7681] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#30363D]/60 mt-auto">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-[#30363D] text-[#8B949E] hover:text-white hover:bg-[#1F2937]/50 h-8 transition-colors">
              <UserPlus className="w-3.5 h-3.5" />
              Invite Teammates
            </Button>
          </div>
        </div>

      </div>

      {/* Footer Branding Area */}
      <div className="px-6 py-3 border-t border-[#30363D]/60 flex items-center justify-between bg-[#0D1117]">
        <div className="flex items-center gap-2">
          <OnlineDot />
          <span className="text-[10px] text-[#8B949E] font-medium tracking-wide uppercase">
            Platform Services Online
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#6E7681]">
          <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
          <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          <span className="hover:text-white cursor-pointer transition-colors">API Status</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Community;