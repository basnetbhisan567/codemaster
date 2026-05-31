import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Newspaper, Search, Clock, Bookmark, BookmarkCheck,
  Share2, ExternalLink, Filter, ChevronDown, ChevronUp,
  Eye, Calendar, Loader2, AlertCircle,
  Bell, Mail, X, Check, Twitter, Linkedin
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  image_url: string;
  category: string;
  tags: string[];
  read_time: string;
  published_at: string;
  view_count: number;
  is_bookmarked?: boolean;
}

export default function TechNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('news_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const categories = ['all', 'tech', 'programming', 'ai', 'webdev', 'mobile', 'devops', 'security'];
  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (activeCategory && activeCategory !== 'all') params.append('category', activeCategory);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`http://localhost:5000/api/v1/news/?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setArticles(data.articles.map((a: NewsArticle) => ({
        ...a,
        is_bookmarked: bookmarks.includes(a.id),
      })));
      setTotal(data.total || 0);
      
      // Set daily updates from first 4 articles
      if (data.articles?.length > 0) {
        setDailyUpdates(data.articles.slice(0, 4).map((a: NewsArticle) => a.title));
      }
    } catch (err: any) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [activeCategory, page, sortBy]);

  const toggleBookmark = (id: number) => {
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('news_bookmarks', JSON.stringify(updated));
    setArticles(prev => prev.map(a => a.id === id ? { ...a, is_bookmarked: !a.is_bookmarked } : a));
  };

  const handleSearch = () => { setPage(1); fetchArticles(); };

  const handleNewsletterSignup = () => {
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setTimeout(() => { setShowNewsletter(false); setNewsletterSuccess(false); setNewsletterEmail(''); }, 2000);
    }
  };

  const shareArticle = (article: NewsArticle, platform: string) => {
    const url = article.source_url;
    const text = article.title;
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    if (shareUrls[platform]) window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    else navigator.clipboard.writeText(url);
  };

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    return b.view_count - a.view_count;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Tech News</h1>
            <p className="text-sm text-slate-400">{formattedDate} • {total} articles</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search articles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-10" />
          </div>
          <Button onClick={handleSearch} size="sm">Search</Button>
        </div>
      </div>

      {/* Newsletter Banner */}
      <AnimatePresence>
        {!showNewsletter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card variant="glass" className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 cursor-pointer" onClick={() => setShowNewsletter(true)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  <div><p className="text-sm font-medium">Get Weekly Tech Digest</p><p className="text-xs text-slate-400">Stay updated with the latest in tech</p></div>
                </div>
                <Button size="sm" variant="outline">Subscribe</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter Modal */}
      <AnimatePresence>
        {showNewsletter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card variant="glass" className="p-6 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Weekly Tech Digest</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowNewsletter(false)}><X className="w-4 h-4" /></Button>
              </div>
              {newsletterSuccess ? (
                <div className="flex items-center gap-3 text-green-400"><Check className="w-5 h-5" /><span>Subscribed!</span></div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="basnetbhisan@codemaster.com" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} className="flex-1" />
                  <Button onClick={handleNewsletterSignup}><Mail className="w-4 h-4 mr-1" />Subscribe</Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sort + Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex gap-1 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => { setActiveCategory(cat === 'all' ? '' : cat); setPage(1); }}
                    className={`px-2 py-1 rounded text-xs capitalize transition-all ${(cat === 'all' && !activeCategory) || activeCategory === cat ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSortBy('latest')} className={`flex items-center gap-1 text-xs ${sortBy === 'latest' ? 'text-primary' : 'text-slate-400'}`}><Clock className="w-3 h-3" />Latest</button>
              <button onClick={() => setSortBy('popular')} className={`flex items-center gap-1 text-xs ${sortBy === 'popular' ? 'text-primary' : 'text-slate-400'}`}><TrendingUp className="w-3 h-3" />Popular</button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /><span className="ml-2 text-slate-400">Loading...</span></div>
          )}

          {error && !loading && (
            <Card variant="glass" className="p-6 text-center border-red-500/30"><AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" /><p className="text-red-400">{error}</p></Card>
          )}

          {!loading && sortedArticles.map(article => (
            <motion.div key={article.id} whileHover={{ y: -3, scale: 1.01 }} className="group">
              <Card variant="glass" className="p-5 hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info" size="sm" className="text-xs">{article.category || 'tech'}</Badge>
                      <Badge variant="outline" size="sm" className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{article.read_time || '5 min'}</Badge>
                    </div>
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2 mb-1">
                      <a href={article.source_url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{article.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{article.source}</span><span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.view_count || 0}</span><span>•</span>
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); toggleBookmark(article.id); }} className="p-1.5 rounded hover:bg-slate-700">{article.is_bookmarked ? <BookmarkCheck className="w-4 h-4 text-yellow-400" /> : <Bookmark className="w-4 h-4 text-slate-400" />}</button>
                        <button onClick={e => { e.stopPropagation(); shareArticle(article, 'twitter'); }} className="p-1.5 rounded hover:bg-slate-700"><Twitter className="w-4 h-4 text-slate-400 hover:text-blue-400" /></button>
                        <button onClick={e => { e.stopPropagation(); shareArticle(article, 'linkedin'); }} className="p-1.5 rounded hover:bg-slate-700"><Linkedin className="w-4 h-4 text-slate-400 hover:text-blue-600" /></button>
                        <button onClick={e => { e.stopPropagation(); shareArticle(article, 'copy'); }} className="p-1.5 rounded hover:bg-slate-700"><Share2 className="w-4 h-4 text-slate-400" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {!loading && !error && articles.length === 0 && (
            <Card variant="glass" className="p-12 text-center"><Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No articles found</p></Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending */}
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-green-400" /><span className="text-sm font-medium">Trending Topics</span></div>
            <div className="flex flex-wrap gap-1.5">
              {['#ReactJS','#TypeScript','#AI','#WebDev','#Coding','#DevOps','#Python','#JavaScript'].map((topic, i) => (
                <button key={i} onClick={() => { setSearchQuery(topic); handleSearch(); }} className="text-xs px-2.5 py-1.5 glass rounded-full text-slate-400 hover:text-white hover:bg-primary/20 transition-all">{topic}</button>
              ))}
            </div>
          </Card>

          {/* Daily Updates */}
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-blue-400" /><span className="text-sm font-medium">Latest Updates</span></div>
            <p className="text-xs text-slate-500 mb-3">{formattedDate}</p>
            {dailyUpdates.length > 0 ? (
              <div className="space-y-2">
                {dailyUpdates.map((update, i) => (
                  <div key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><p className="text-sm text-slate-400">{update}</p></div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Loading updates...</p>
            )}
          </Card>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-2 mb-3"><BookmarkCheck className="w-4 h-4 text-yellow-400" /><span className="text-sm font-medium">Saved</span><Badge variant="warning" size="sm">{bookmarks.length}</Badge></div>
              {articles.filter(a => a.is_bookmarked).slice(0, 5).map(article => (
                <div key={article.id} className="text-sm text-slate-400 truncate hover:text-white cursor-pointer">{article.title}</div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <footer className="border-t border-slate-800 pt-6 text-center">
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} CodeMaster. All rights reserved.</p>
      </footer>
    </motion.div>
  );
}