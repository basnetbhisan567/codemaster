import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, Brain, Cpu, FolderKanban, Bot, 
  Trophy, Users, Flame, Star, 
  BookOpen, BarChart3,
  FileCode, Terminal,
  CheckCircle2,
  Loader2,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/apiClient';

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

const Problems = () => {
  const [problems, setProblems] = useState<ProblemFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  
  const [activeDifficulty, setActiveDifficulty] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeLanguage, setActiveLanguage] = useState<string>('');
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState({
    totalSolved: 0,
    streak: 0,
    xp: 0,
    level: 1,
  });

  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (activeDifficulty) params.append('difficulty', activeDifficulty);
      if (activeCategory) params.append('category', activeCategory);
      if (activeLanguage) params.append('language', activeLanguage);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await apiClient.get(`/problems/?${params}`);
      const data = response.data as any;
      
      if (data) {
        setProblems(data.problems || []);
        setTotal(data.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load problems');
      setProblems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/profile/stats', { requiresAuth: true });
      const data = response.data as any;
      
      if (data) {
        setStats({
          totalSolved: data.problems_solved || 0,
          streak: data.streak || 0,
          xp: data.xp || 0,
          level: data.level || 1,
        });
      }
    } catch {
      // Stats are optional
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [activeDifficulty, activeCategory, activeLanguage, page]);

  useEffect(() => {
    fetchStats();
  }, [total]);

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const categories = [
    { value: '', label: 'All', icon: BookOpen },
    { value: 'algorithms', label: 'Algorithms', icon: Brain },
    { value: 'data-structures', label: 'Data Structures', icon: Cpu },
    { value: 'frontend', label: 'Frontend', icon: Code },
    { value: 'backend', label: 'Backend', icon: Terminal },
  ];

  const languages = [
    { value: '', label: 'All', icon: '🌐' },
    { value: 'javascript', label: 'JS', icon: '📜' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      hard: 'bg-orange-500/20 text-orange-400',
    };
    return colors[difficulty] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Coding Problems
        </h1>
        <p className="text-slate-400 mt-1">
          {total > 0 ? `${total} problems available` : 'Master your skills'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card variant="glass" className="p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.totalSolved}</p>
          <p className="text-xs text-slate-400">Solved</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.streak}d</p>
          <p className="text-xs text-slate-400">Streak</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.xp.toLocaleString()}</p>
          <p className="text-xs text-slate-400">XP</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{total}</p>
          <p className="text-xs text-slate-400">Available</p>
        </Card>
      </div>

      <Card variant="glass" className="p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => { setActiveDifficulty(diff.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeDifficulty === diff.value ? 'bg-primary text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.value ? 'bg-primary text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />{cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => { setActiveLanguage(lang.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeLanguage === lang.value ? 'bg-primary text-white border border-primary/50' : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <span>{lang.icon}</span>{lang.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {error && !loading && (
        <Card variant="glass" className="p-6 text-center border-red-500/30">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchProblems}>Retry</Button>
        </Card>
      )}

      {!loading && !error && problems.length === 0 && (
        <Card variant="glass" className="p-12 text-center">
          <FileCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400">No problems found</h3>
        </Card>
      )}

      {!loading && problems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <motion.div
              key={problem.id}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-xl border p-5 cursor-pointer transition-all ${
                problem.is_solved ? 'border-green-500/30 bg-green-500/5' : 'border-slate-700/30 bg-slate-800/20 hover:border-primary/50'
              }`}
            >
              {problem.is_solved && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{problem.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{problem.category}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {problem.tags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline" size="sm" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="info" size="sm" className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </Badge>
                <Badge variant="warning" size="sm" className="text-xs">
                  <Trophy className="w-3 h-3 mr-0.5" />{problem.xp_reward} XP
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{problem.times_solved} solved</span>
                <span>{problem.success_rate}% success</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Problems;