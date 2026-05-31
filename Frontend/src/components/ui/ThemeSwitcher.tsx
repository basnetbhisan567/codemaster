import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Circle } from 'lucide-react';
import { Button } from './Button';

type Theme = 'dark' | 'light' | 'white';

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="flex items-center gap-1 p-1 glass rounded-xl">
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchTheme('dark')}
        className="gap-1"
      >
        <Moon className="w-4 h-4" />
        Dark
      </Button>
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchTheme('light')}
        className="gap-1"
      >
        <Sun className="w-4 h-4" />
        Light
      </Button>
      <Button
        variant={theme === 'white' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchTheme('white')}
        className="gap-1"
      >
        <Circle className="w-4 h-4" />
        Pure
      </Button>
    </div>
  );
};