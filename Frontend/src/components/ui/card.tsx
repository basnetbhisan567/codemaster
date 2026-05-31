import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'interactive' | 'bordered';
  depth?: 1 | 2 | 3 | 4 | 5;
  glow?: boolean;
  glowColor?: 'primary' | 'blue' | 'purple' | 'cyan';
  noHover?: boolean;
  children?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    depth = 1,
    glow = false,
    glowColor = 'primary',
    noHover = false,
    children, 
    ...props 
  }, ref) => {
    
    const depthStyles = {
      1: 'shadow-lg shadow-black/10',
      2: 'shadow-xl shadow-black/20',
      3: 'shadow-2xl shadow-black/30',
      4: 'shadow-[0_20px_50px_-12px] shadow-black/40',
      5: 'shadow-[0_30px_60px_-15px] shadow-black/50',
    };

    const glowColors = {
      primary: 'hover:shadow-primary/20',
      blue: 'hover:shadow-blue-500/20',
      purple: 'hover:shadow-purple-500/20',
      cyan: 'hover:shadow-cyan-500/20',
    };

    const variants = {
      default: cn(
        'bg-card rounded-xl border border-border',
        depthStyles[depth]
      ),
      glass: cn(
        'glass rounded-xl',
        'backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border border-white/10',
        depthStyles[depth]
      ),
      elevated: cn(
        'bg-gradient-to-br from-card to-background rounded-xl',
        'border border-white/5',
        'shadow-2xl shadow-black/30',
        'relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none'
      ),
      interactive: cn(
        'glass rounded-xl cursor-pointer',
        'backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border border-white/10',
        depthStyles[depth],
        !noHover && 'hover:border-white/20 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300',
        glow && cn(
          'hover:shadow-[0_0_30px_-5px]',
          glowColors[glowColor]
        )
      ),
      bordered: cn(
        'bg-transparent rounded-xl',
        'border-2 border-white/5',
        'hover:border-white/10 transition-colors'
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          !noHover && variant !== 'interactive' && 'hover:-translate-y-1 hover:scale-[1.02]',
          variants[variant],
          className
        )}
        {...props}
      >
        {(variant === 'glass' || variant === 'interactive') && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
              borderRadius: 'inherit'
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';