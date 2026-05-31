import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({ value: '', onValueChange: () => {} });

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('flex p-1 bg-secondary/50 rounded-xl', className)}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ 
  value, 
  children, 
  disabled 
}: { 
  value: string; 
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      className={cn(
        'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all relative',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-background rounded-lg shadow-sm"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const TabsContent = ({ 
  value, 
  children,
  className 
}: { 
  value: string; 
  children: React.ReactNode;
  className?: string;
}) => {
  const { value: selectedValue } = React.useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};