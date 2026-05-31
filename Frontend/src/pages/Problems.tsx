import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, Brain, Cpu, FolderKanban, Bot, 
  Clock, Trophy, Users, Flame, Star, 
  Zap, ChevronRight, Play, Timer, Target,
  BookOpen, Award, BarChart3,
  FileCode, Bug, Terminal,
  CheckCircle2, ArrowRight, Search,
  Filter, SlidersHorizontal, Loader2,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

// Types matching backend response
interface ProblemFromAPI {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  category: string;
  language: string;
  tags: string[];
  xp_reward: number;
  times_solved: number;
  success_rate: number;
  is_solved: boolean;
}

interface ProblemListResponse {
  problems: ProblemFromAPI[];
  total: number;
  page: number;
  limit: number;
}

// Component
const Problems = () => {
  const [problems, setProblems] = useState<ProblemFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  
  // Filters
  const [activeDifficulty, setActiveDifficulty] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeLanguage, setActiveLanguage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalProblems: 0,
    streak: 0,
    xp: 0,
    level: 1,
  });

  // Fetch problems from backend
  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (activeDifficulty) params.append('difficulty', activeDifficulty);
      if (activeCategory) params.append('category', activeCategory);
      if (activeLanguage) params.append('language', activeLanguage);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:5000/api/v1/problems/?${params}`, { headers });
      
      if (!response.ok) throw new Error('Failed to fetch problems');
      
      const data: ProblemListResponse = await response.json();
      setProblems(data.problems);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
      // Fallback to empty state
      setProblems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/v1/profile/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalSolved: data.problems_solved || 0,
          totalProblems: total || 500,
          streak: data.streak || 0,
          xp: data.xp || 0,
          level: data.level || 1,
        });
      }
    } catch {
      // Silently fail - stats are optional
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [activeDifficulty, activeCategory, activeLanguage, page]);

  useEffect(() => {
    fetchStats();
  }, [total]);

  // Filter options
  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
  ];

  const categories = [
    { value: '', label: 'All Categories', icon: BookOpen },
    { value: 'algorithms', label: 'Algorithms', icon: Brain },
    { value: 'data-structures', label: 'Data Structures', icon: Cpu },
    { value: 'frontend', label: 'Frontend', icon: Code },
    { value: 'backend', label: 'Backend', icon: Terminal },
    { value: 'databases', label: 'Databases', icon: FolderKanban },
    { value: 'ai-ml', label: 'AI/ML', icon: Bot },
  ];

  const languages = [
    { value: '', label: 'All Languages', icon: '🌐' },
    { value: 'javascript', label: 'JavaScript', icon: '📜' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'java', label: 'Java', icon: '☕' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      hard: 'bg-orange-500/20 text-orange-400',
      expert: 'bg-red-500/20 text-red-400',
    };
    return colors[difficulty] || 'bg-slate-500/20 text-slate-400';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      algorithms: Brain,
      'data-structures': Cpu,
      frontend: Code,
      backend: Terminal,
      databases: FolderKanban,
      'ai-ml': Bot,
    };
    return icons[category] || FileCode;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Coding Problems
          </h1>
          <p className="text-slate-400 mt-1">
            {total > 0 ? `${total} problems available` : 'Master your skills with hands-on practice'}
          </p>
        </div>
        <Button size="lg" className="gap-2 shadow-glow">
          <Timer className="w-5 h-5" />
          Start Focus Session
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card variant="glass" className="p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.totalSolved}<span className="text-sm text-slate-400">/{total || '--'}</span></p>
          <p className="text-xs text-slate-400">Solved</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.streak}<span className="text-sm">d</span></p>
          <p className="text-xs text-slate-400">Streak</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.xp.toLocaleString()}</p>
          <p className="text-xs text-slate-400">XP</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <Award className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold">Lv.{stats.level}</p>
          <p className="text-xs text-slate-400">Level</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{total}</p>
          <p className="text-xs text-slate-400">Available</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card variant="glass" className="p-4">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search problems by title, tag, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProblems()}
              className="pl-10"
            />
          </div>

          {/* Difficulty */}
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => { setActiveDifficulty(diff.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeDifficulty === diff.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Languages */}
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => { setActiveLanguage(lang.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeLanguage === lang.value
                    ? 'bg-primary text-white border border-primary/50'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <span>{lang.icon}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-slate-400">Loading problems...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card variant="glass" className="p-6 text-center border-red-500/30">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchProblems}>
            Retry
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && problems.length === 0 && (
        <Card variant="glass" className="p-12 text-center">
          <FileCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400">No problems found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or check back later</p>
        </Card>
      )}

      {/* Problems Grid */}
      {!loading && problems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <motion.div
              key={problem.id}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-xl border p-5 cursor-pointer transition-all ${
                problem.is_solved
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-slate-700/30 bg-slate-800/20 hover:border-primary/50'
              }`}
              onClick={() => window.location.href = `/problems/${problem.slug}`}
            >
              {/* Solved Badge */}
              {problem.is_solved && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
              )}

              {/* Category Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center`}>
                  {React.createElement(getCategoryIcon(problem.category), { className: "w-5 h-5 text-white" })}
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                    {problem.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{problem.category}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {problem.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" size="sm" className="text-xs">{tag}</Badge>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="info" size="sm" className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </Badge>
                <Badge variant="warning" size="sm" className="text-xs">
                  <Trophy className="w-3 h-3 mr-0.5" />{problem.xp_reward} XP
                </Badge>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {problem.times_solved} solved
                </span>
                <span>{problem.success_rate}% success</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-400">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default Problems;