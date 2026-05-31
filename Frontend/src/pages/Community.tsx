import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, BookOpen, Users2, Search, Plus,
  MessageCircle, Globe, Lock, X, Paperclip, Send,
  Loader2, Badge as BadgeIcon
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

const Community = () => {
  const [activeTab, setActiveTab] = useState('lobby');
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

  useEffect(() => { fetchForumTopics(); fetchChatMessages(); fetchStudyGroups(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSendingMessage(true);
    try {
      const response = await apiClient.post('/community/chat/send', { content: message.trim(), room: 'global' }, { requiresAuth: true });
      if (response.data) { setChatMessages(prev => [...prev, response.data as ChatMessageFromAPI]); setMessage(''); }
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
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, data as ChatMessageFromAPI]);
      }
    } catch (err) { console.error('Upload failed:', err); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    try {
      const response = await apiClient.post('/community/forums', { title: newTopicTitle, content: newTopicContent, category: 'general', tags: [] }, { requiresAuth: true });
      if (response.data) { setForumTopics(prev => [response.data as ForumTopicFromAPI, ...prev]); setNewTopicTitle(''); setNewTopicContent(''); setShowNewTopic(false); }
    } catch (err: any) { console.error('Create topic failed:', err); }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const response = await apiClient.post('/community/groups', { name: newGroupName, description: '', topic: 'general', max_members: 50, is_private: false }, { requiresAuth: true });
      if (response.data) { setStudyGroups(prev => [response.data as StudyGroupFromAPI, ...prev]); setNewGroupName(''); setShowNewGroup(false); }
    } catch (err: any) { console.error('Create group failed:', err); }
  };

  const handleJoinGroup = async (groupId: number) => {
    try { await apiClient.post(`/community/groups/${groupId}/join`, {}, { requiresAuth: true }); fetchStudyGroups(); }
    catch (err: any) { console.error('Join failed:', err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Community</h1>
          <p className="text-muted-foreground mt-1">Connect, chat, share files, and find study partners</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ icon: Users, label: 'Forum Topics', value: forumTopics.length, color: 'text-green-400' },
          { icon: MessageSquare, label: 'Chat Messages', value: chatMessages.length, color: 'text-blue-400' },
          { icon: Users2, label: 'Study Groups', value: studyGroups.length, color: 'text-purple-400' },
          { icon: Globe, label: 'Community', value: 'Active', color: 'text-yellow-400' }].map((s, i) => (
          <Card key={i} variant="glass" className="p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ key: 'lobby', icon: MessageCircle, label: 'Chat' },
          { key: 'forums', icon: BookOpen, label: 'Forums' },
          { key: 'groups', icon: Users2, label: 'Groups' }].map(tab => (
          <Button key={tab.key} variant={activeTab === tab.key ? 'default' : 'ghost'} size="sm" className="gap-2" onClick={() => setActiveTab(tab.key)}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'lobby' && (
        <Card variant="glass" className="h-[500px] flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold">Global Chat</h3>
            <Badge variant="success" size="sm">{chatMessages.length} messages</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingChat ? <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> :
             chatMessages.length === 0 ? <div className="flex items-center justify-center h-full text-slate-500"><p>No messages yet. Start the conversation!</p></div> :
             chatMessages.map(msg => (
              <div key={msg.id} className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">{(msg.sender_name || '?')[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{msg.sender_name || 'Unknown'}</span>
                    <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {msg.message_type === 'image' && msg.file_url ? (
                    <div>
                      <img src={`http://localhost:5000${msg.file_url}`} alt={msg.file_name} className="max-w-[300px] max-h-[200px] rounded-lg mt-1" />
                      <p className="text-xs text-slate-400 mt-1">{msg.file_name} ({msg.file_size})</p>
                    </div>
                  ) : msg.message_type === 'file' ? (
                    <div className="flex items-center gap-2 p-2 rounded bg-white/5 mt-1">
                      <Paperclip className="w-4 h-4 text-blue-400" />
                      <div>
                        <a href={`http://localhost:5000${msg.file_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{msg.file_name}</a>
                        <p className="text-xs text-slate-500">{msg.file_size}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFileUpload} />
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'File'}
              </Button>
              <span className="text-xs text-slate-500 self-center">Images, PDF, DOC, TXT, ZIP (max 10MB)</span>
            </div>
            <div className="flex gap-2">
              <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="flex-1" />
              <Button size="sm" onClick={handleSendMessage} disabled={!message.trim() || sendingMessage}>
                {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'forums' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search topics..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
            <Button className="gap-2" onClick={() => setShowNewTopic(true)}><Plus className="w-4 h-4" />New Topic</Button>
          </div>
          <AnimatePresence>
            {showNewTopic && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Card variant="glass" className="p-4 space-y-3">
                  <Input placeholder="Topic title..." value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} />
                  <textarea placeholder="Write your topic content..." value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)} className="w-full h-24 bg-transparent border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary" />
                  <div className="flex gap-2"><Button size="sm" onClick={handleCreateTopic}>Publish</Button><Button size="sm" variant="ghost" onClick={() => setShowNewTopic(false)}>Cancel</Button></div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {loadingForums ? <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> :
           <Card variant="glass" className="divide-y divide-white/5">
            {forumTopics.filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(topic => (
              <div key={topic.id} className="p-4 hover:bg-white/5">
                <div className="flex items-center gap-2 mb-1"><Badge variant="info" size="sm">{topic.category}</Badge><h3 className="font-medium text-sm">{topic.title}</h3></div>
                <p className="text-sm text-slate-400 mb-2 line-clamp-2">{topic.content}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500"><span>{topic.author_name}</span><span>{topic.replies_count} replies</span><span>{topic.views} views</span><span>{new Date(topic.created_at).toLocaleDateString()}</span></div>
              </div>
            ))}
          </Card>}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Study Groups</h3><Button size="sm" className="gap-2" onClick={() => setShowNewGroup(true)}><Plus className="w-4 h-4" />Create Group</Button></div>
          <AnimatePresence>
            {showNewGroup && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Card variant="glass" className="p-4 flex gap-2"><Input placeholder="Group name..." value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateGroup()} /><Button size="sm" onClick={handleCreateGroup}>Create</Button><Button size="sm" variant="ghost" onClick={() => setShowNewGroup(false)}><X className="w-4 h-4" /></Button></Card>
              </motion.div>
            )}
          </AnimatePresence>
          {loadingGroups ? <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> :
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyGroups.map(group => (
              <Card key={group.id} variant="glass" className="p-5">
                <div className="flex items-center gap-2 mb-2">{group.is_private ? <Lock className="w-4 h-4 text-yellow-400" /> : <Globe className="w-4 h-4 text-green-400" />}<h4 className="font-semibold">{group.name}</h4></div>
                <p className="text-sm text-slate-400 mb-3">{group.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3"><span>{group.members_count}/{group.max_members} members</span><Badge variant="outline" size="sm">{group.topic}</Badge></div>
                <Button size="sm" className="w-full" onClick={() => handleJoinGroup(group.id)}>Join Group</Button>
              </Card>
            ))}
          </div>}
        </div>
      )}
    </motion.div>
  );
};

export default Community;