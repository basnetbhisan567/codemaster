import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { 
  Search, Filter, X, CheckCircle, Trophy, 
  Target, Clock 
} from 'lucide-react';
import { Project, LEVEL_CONFIG, ProjectCategory } from '../types/project';
import projectsData from '../data/projects.json';

const categories: (ProjectCategory | 'All')[] = ['All', 'Web', 'Mobile', 'Game Dev', 'Data Science', 'DevOps', 'AI/ML'];
const levels = [1, 2, 3, 4, 5] as const;
const timeFilters = ['All', 'Quick (< 3h)', 'Medium (3-8h)', 'Long (1w+)'];

export default function Projects() {
  // Cast the imported data to Project[]
  const [projects] = useState<Project[]>(projectsData.projects as Project[]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projectsData.projects as Project[]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const completedProjects = projects.filter(p => p.completed).length;
  const totalProjects = projects.length;
  const overallProgress = (completedProjects / totalProjects) * 100;
  const currentLevel = projects.find(p => !p.completed)?.level || 1;

  useEffect(() => {
    let filtered = [...projects];

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedLevels.length > 0) {
      filtered = filtered.filter(p => selectedLevels.includes(p.level));
    }

    if (selectedTime !== 'All') {
      filtered = filtered.filter(p => {
        if (selectedTime === 'Quick (< 3h)') return p.estimatedTime.includes('hour') && parseInt(p.estimatedTime) <= 3;
        if (selectedTime === 'Medium (3-8h)') return p.estimatedTime.includes('hour') && parseInt(p.estimatedTime) > 3;
        return p.estimatedTime.includes('week');
      });
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedCategory, selectedLevels, selectedTime]);

  const toggleLevel = (level: number) => {
    setSelectedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleAIAssist = (project: Project) => {
    console.log('AI Assist for:', project.title);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-primary" />
          5-Level Project System
        </h1>
        <p className="text-muted-foreground mt-1">
          Build real projects and level up your skills from Beginner to Expert
        </p>
      </div>

      {/* Progress Roadmap */}
      <Card variant="glass" className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Your Progress Roadmap
        </h2>
        
        <div className="relative mb-6">
          <div className="absolute top-3 left-0 right-0 h-2 bg-secondary/50 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full"
            />
          </div>
          
          <div className="relative flex justify-between">
            {levels.map((level) => {
              const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG];
              const isCompleted = level < currentLevel;
              const isCurrent = level === currentLevel;
              
              return (
                <div key={level} className="text-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2',
                    isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary animate-pulse' : 'bg-secondary'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-bold">{level}</span>
                    )}
                  </div>
                  <p className="text-xs font-medium">{config.name}</p>
                  <p className="text-[10px] text-muted-foreground">{config.focus}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div><p className="text-2xl font-bold">{completedProjects}/{totalProjects}</p><p className="text-xs text-muted-foreground">Projects Done</p></div>
          <div><p className="text-2xl font-bold">{Math.round(overallProgress)}%</p><p className="text-xs text-muted-foreground">Overall Progress</p></div>
          <div><p className="text-2xl font-bold">{currentLevel}</p><p className="text-xs text-muted-foreground">Current Level</p></div>
          <div><p className="text-2xl font-bold">{projects.length}</p><p className="text-xs text-muted-foreground">Total Projects</p></div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search projects, technologies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button variant={showFilters ? 'default' : 'outline'} onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="w-4 h-4" /> Filters
          {(selectedCategory !== 'All' || selectedLevels.length > 0 || selectedTime !== 'All') && (
            <Badge variant="primary" size="sm">{[selectedCategory !== 'All', selectedLevels.length > 0, selectedTime !== 'All'].filter(Boolean).length}</Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <Card variant="glass" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory('All'); setSelectedLevels([]); setSelectedTime('All'); }} className="gap-1"><X className="w-3 h-3" />Clear all</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', selectedCategory === cat ? 'bg-primary text-white' : 'glass text-muted-foreground hover:text-white')}>{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button key={level} onClick={() => toggleLevel(level)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2', selectedLevels.includes(level) ? 'bg-primary text-white' : 'glass text-muted-foreground hover:text-white')}>Level {level}{selectedLevels.includes(level) && <CheckCircle className="w-3 h-3" />}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Clock className="w-4 h-4" />Estimated Time</label>
              <div className="flex flex-wrap gap-2">
                {timeFilters.map((time) => (
                  <button key={time} onClick={() => setSelectedTime(time)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', selectedTime === time ? 'bg-primary text-white' : 'glass text-muted-foreground hover:text-white')}>{time}</button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} onClick={() => handleProjectClick(project)}>
            <ProjectCard project={project} onAIAssist={handleAIAssist} />
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card variant="glass" className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query</p>
        </Card>
      )}

      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAIAssist={handleAIAssist} />
    </motion.div>
  );
}