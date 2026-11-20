import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'pill-terracotta';
  size?: 'sm' | 'md' | 'lg' | 'pill';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-brand-forest text-brand-ivory hover:bg-brand-forest-hover shadow-soft',
      secondary: 'bg-brand-ivory text-brand-forest border border-brand-forest/20 hover:bg-brand-ivory-dark',
      accent: 'bg-brand-terracotta text-white hover:bg-brand-terracotta-hover shadow-glow-terracotta',
      outline: 'border border-brand-charcoal/20 bg-transparent text-brand-charcoal hover:bg-brand-forest/5',
      ghost: 'bg-transparent text-brand-charcoal hover:bg-brand-forest/5',
      'pill-terracotta': 'bg-brand-terracotta text-white rounded-full hover:bg-brand-terracotta-hover px-6 py-2.5 font-semibold shadow-soft hover:shadow-glow-terracotta transition-shadow',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg',
      md: 'text-sm px-4 py-2 rounded-xl',
      lg: 'text-base px-6 py-3 rounded-2xl',
      pill: 'text-sm px-6 py-2.5 rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
