import { forwardRef, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ButtonProps extends Omit<MotionProps, 'onDrag'> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'glass' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  magnetic?: boolean;
  magneticStrength?: number;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    isLoading, 
    fullWidth,
    magnetic = false,
    magneticStrength = 0.5,
    children, 
    disabled,
    onClick,
    type = 'button',
    ...props 
  }, ref) => {
    
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    // Magnetic effect values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const springX = useSpring(x, { stiffness: 300, damping: 20 });
    const springY = useSpring(y, { stiffness: 300, damping: 20 });
    
    const magneticX = useTransform(springX, [-100, 100], [-magneticStrength * 20, magneticStrength * 20]);
    const magneticY = useTransform(springY, [-100, 100], [-magneticStrength * 20, magneticStrength * 20]);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return;
      
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = ((e.clientX - centerX) / (rect.width / 2)) * 100;
      const distanceY = ((e.clientY - centerY) / (rect.height / 2)) * 100;
      
      x.set(distanceX);
      y.set(distanceY);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    };

    const baseStyles = cn(
      'inline-flex items-center justify-center rounded-xl font-medium',
      'transition-all duration-200 relative',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      fullWidth && 'w-full'
    );

    const variants = {
      default: cn(
        'bg-primary text-primary-foreground',
        'shadow-lg shadow-primary/25',
        'hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30',
        'active:scale-[0.98]'
      ),
      outline: cn(
        'border-2 border-input bg-transparent',
        'hover:bg-accent hover:text-accent-foreground hover:border-accent',
        'active:scale-[0.98]'
      ),
      ghost: cn(
        'hover:bg-accent hover:text-accent-foreground',
        'active:scale-[0.98]'
      ),
      destructive: cn(
        'bg-destructive text-destructive-foreground',
        'shadow-lg shadow-destructive/25',
        'hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/30',
        'active:scale-[0.98]'
      ),
      glass: cn(
        'glass',
        'backdrop-blur-xl bg-white/5',
        'border border-white/10',
        'shadow-lg shadow-black/20',
        'hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/30',
        'active:scale-[0.98]'
      ),
      glow: cn(
        'bg-gradient-to-r from-primary to-blue-500',
        'text-white font-semibold',
        'shadow-lg shadow-primary/30',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        'hover:shadow-xl hover:shadow-primary/40',
        'active:scale-[0.98]'
      ),
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm gap-1.5',
      md: 'h-11 px-6 text-base gap-2',
      lg: 'h-14 px-8 text-lg gap-2.5',
      xl: 'h-16 px-10 text-xl gap-3',
    };

    const content = (
      <>
        {magnetic && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary/20 blur-xl"
            style={{ x: magneticX, y: magneticY }}
          />
        )}
        
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </>
    );

    const combinedRef = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    if (magnetic) {
      return (
        <motion.button
          ref={combinedRef}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          style={{ x: magneticX, y: magneticY }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={isLoading || disabled}
          onClick={onClick}
          type={type}
          whileTap={{ scale: 0.97 }}
          {...(props as any)}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <motion.button
        ref={combinedRef}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || disabled}
        onClick={onClick}
        type={type}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        {...(props as any)}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';