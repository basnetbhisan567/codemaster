import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Briefcase, MapPin, Building2, Clock, DollarSign,
  Filter, Loader2, AlertCircle, Bookmark, BookmarkCheck,
  ExternalLink, Sparkles, FileText, Target, TrendingUp,
  Send, ChevronRight, X, Globe, RotateCcw, BarChart3,
  MessageSquare
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Job {
  id: number;
  title: string;
  company: string;
  company_logo: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  tags: string[];
  remote: boolean;
  source: string;
  source_url: string;
  posted_at: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);

  // UI State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [savedJobs, setSavedJobs] = useState<number[]>(() => {
    const saved = localStorage.getItem('saved_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'stats'>('search');

  const API = 'http://localhost:5000/api/v1';

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (remoteOnly) params.append('remote', 'true');
      if (selectedLocation) params.append('location', selectedLocation);
      if (selectedCompany) params.append('company', selectedCompany);
      if (selectedTag) params.append('tags', selectedTag);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await fetch(`${API}/jobs/?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, remoteOnly, selectedLocation, selectedCompany, selectedTag, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const openJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const toggleSave = (jobId: number) => {
    const updated = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    setSavedJobs(updated);
    localStorage.setItem('saved_jobs', JSON.stringify(updated));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stripHtml = (html: string) => {
    return html?.replace(/<[^>]*>/g, '').substring(0, 300) || '';
  };

  const savedJobsList = jobs.filter(j => savedJobs.includes(j.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Jobs & Career Center
        </h1>
        <p className="text-muted-foreground mt-1">{total} jobs available • Find your next opportunity</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'search' as const, icon: Search, label: 'Job Search', count: total },
          { id: 'saved' as const, icon: Bookmark, label: 'Saved', count: savedJobs.length },
          { id: 'stats' as const, icon: BarChart3, label: 'Stats', count: null },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-4 h-4" />{tab.label}
            {tab.count !== null && <Badge variant="outline" size="sm">{tab.count}</Badge>}
          </Button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by title, company, or keyword..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button type="submit" size="sm">Search</Button>
        <Button variant={remoteOnly ? 'default' : 'outline'} size="sm" onClick={() => setRemoteOnly(!remoteOnly)}>
          <Globe className="w-4 h-4 mr-1" />Remote
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-1" />Filters
        </Button>
      </form>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card variant="glass" className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Filter by location..." value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} />
              <Input placeholder="Filter by company..." value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} />
              <Input placeholder="Filter by tag (react, python)..." value={selectedTag} onChange={e => setSelectedTag(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setPage(1); fetchJobs(); }}>Apply Filters</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelectedLocation(''); setSelectedCompany(''); setSelectedTag(''); setRemoteOnly(false); setPage(1); }}>
                  <RotateCcw className="w-3 h-3 mr-1" />Reset
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : error ? (
        <Card variant="glass" className="p-6 text-center border-red-500/30">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" /><p className="text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchJobs}>Retry</Button>
        </Card>
      ) : jobs.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No jobs found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === 'saved' ? savedJobsList : jobs).map(job => (
            <motion.div key={job.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Card variant="glass" className="p-5 cursor-pointer hover:border-primary/30 transition-all h-full flex flex-col" onClick={() => openJob(job)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center text-lg flex-shrink-0">
                    {job.company_logo ? <img src={job.company_logo} alt="" className="w-8 h-8 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <Briefcase className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }} className={`flex-shrink-0 ${savedJobs.includes(job.id) ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {savedJobs.includes(job.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="info" size="sm" className="text-xs"><MapPin className="w-3 h-3 mr-0.5" />{job.location || 'Remote'}</Badge>
                  {job.remote && <Badge variant="success" size="sm" className="text-xs">🌍 Remote</Badge>}
                  {job.salary && <Badge variant="warning" size="sm" className="text-xs"><DollarSign className="w-3 h-3 mr-0.5" />{job.salary}</Badge>}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1">{stripHtml(job.description)}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.tags?.slice(0, 3).map(tag => <Badge key={tag} variant="outline" size="sm" className="text-xs">{tag}</Badge>)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(job.posted_at)}</span>
                  <span className="text-primary flex items-center gap-1">View <ChevronRight className="w-3 h-3" /></span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-slate-400 self-center">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <AnimatePresence>
        {showJobModal && selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
            onClick={() => setShowJobModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="max-w-2xl w-full glass-heavy rounded-2xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex items-start justify-between sticky top-0 bg-inherit z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                    <p className="text-slate-400">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowJobModal(false)}><X className="w-5 h-5" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedJob.remote && <Badge variant="success" size="sm">🌍 Remote</Badge>}
                  {selectedJob.salary && <Badge variant="warning" size="sm"><DollarSign className="w-3 h-3 mr-0.5" />{selectedJob.salary}</Badge>}
                  <Badge variant="info" size="sm">{selectedJob.source}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedJob.description?.substring(0, 2000) || '' }} />
                </div>
                {selectedJob.tags?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Skills & Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.tags.map(tag => <Badge key={tag} variant="outline" size="sm">{tag}</Badge>)}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  {selectedJob.source_url && (
                    <a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full gap-2"><ExternalLink className="w-4 h-4" />Apply on {selectedJob.source}</Button>
                    </a>
                  )}
                  <Button variant="outline" onClick={() => toggleSave(selectedJob.id)} className="gap-2">
                    {savedJobs.includes(selectedJob.id) ? <BookmarkCheck className="w-4 h-4 text-yellow-400" /> : <Bookmark className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}