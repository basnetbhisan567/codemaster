import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface Language {
  id: string;
  name: string;
  icon: string;
}

interface LanguageSelectorProps {
  languages: Language[];
  selected: string;
  onChange: (languageId: string) => void;
}

export const LanguageSelector = ({ languages, selected, onChange }: LanguageSelectorProps) => {
  return (
    <div className="flex gap-2 p-1 glass rounded-xl">
      {languages.map((lang) => (
        <motion.button
          key={lang.id}
          onClick={() => onChange(lang.id)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all relative',
            selected === lang.id
              ? 'text-white'
              : 'text-muted-foreground hover:text-white'
          )}
          whileTap={{ scale: 0.95 }}
        >
          {selected === lang.id && (
            <motion.div
              layoutId="language-selector"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <span>{lang.icon}</span>
            {lang.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
};