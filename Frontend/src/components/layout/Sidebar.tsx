import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, BookOpen, Code, Trophy, Play, Calendar, 
  Briefcase, User, Settings, Shield, Sparkles,
  Newspaper, Lightbulb, Music, FileText, Users,
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLockdownStore } from '../../stores/lockdownStore';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { focusActive } = useLockdownStore();
  
  // Load user from localStorage for consistent naming
  const getUserData = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };
  
  const user = getUserData();
  const userName = user?.name || user?.username || 'Student';
  const userEmail = user?.email || 'student@codemaster.com';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('codemaster_user');
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Learning', path: '/learning' },
    { icon: Code, label: 'Projects', path: '/projects' },
    { icon: Trophy, label: 'Problems', path: '/problems' },
    { icon: Play, label: 'Playground', path: '/playground' },
    { icon: FileText, label: 'Assignments', path: '/assignments' },
    { icon: Calendar, label: 'Roadmap', path: '/roadmap' },
    { icon: Users, label: 'Community', path: '/community' },
  ].filter(item => {
    if (focusActive) {
      return ['/', '/learning', '/problems', '/playground', '/assignments', '/roadmap', '/projects'].includes(item.path);
    }
    return true;
  });

  const resourceItems = [
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Newspaper, label: 'Tech News', path: '/tech-news' },
    { icon: Lightbulb, label: 'AI Tools', path: '/ai-tools' },
    { icon: Music, label: 'Study Music', path: '/music' },
  ].filter(() => !focusActive);

  const bottomItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Shield, label: 'Admin', path: '/admin' },
  ].filter(() => !focusActive);

  return (
    <motion.aside 
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Logo Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 border-b border-white/8"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              CodeMaster
            </h1>
            <p className="text-xs text-white/40">Pro Developer</p>
          </div>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-4 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Link to={item.path} className="block">
                  <motion.div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group',
                      isActive 
                        ? 'bg-primary/20 text-white border border-primary/30' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      'relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                      isActive ? 'bg-primary/30' : 'bg-white/5 group-hover:bg-white/10'
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="relative z-10 font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-indicator"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Resources Section */}
        {resourceItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 mt-6"
          >
            <p className="px-4 text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
              Resources
            </p>
            <div className="space-y-1">
              {resourceItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <Link to={item.path} className="block">
                      <motion.div
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group',
                          isActive 
                            ? 'bg-primary/20 text-white border border-primary/30' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        )}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={cn(
                          'relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          isActive ? 'bg-primary/30' : 'bg-white/5 group-hover:bg-white/10'
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="relative z-10 font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Bottom Items */}
        {bottomItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-4 mt-6 pt-6 border-t border-white/8"
          >
            {bottomItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Link to={item.path} className="block">
                  <motion.div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </nav>

      {/* Footer with User Info + Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 border-t border-white/8"
      >
        <div className="glass rounded-xl p-3 backdrop-blur-sm bg-white/3 border border-white/8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-white/40 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </motion.aside>
  );
};