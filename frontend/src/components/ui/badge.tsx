import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'forest' | 'terracotta' | 'outline' | 'mint' | 'mint-bright' | 'mint-pill';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-brand-forest/10 text-brand-forest border-transparent',
    forest: 'bg-brand-forest text-brand-ivory border-transparent',
    terracotta: 'bg-brand-terracotta/15 text-brand-terracotta border-brand-terracotta/20',
    mint: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
    'mint-bright': 'bg-emerald-500/30 text-emerald-100 border-emerald-300/80 font-bold tracking-wider shadow-sm',
    'mint-pill': 'bg-emerald-500/30 text-emerald-100 border-emerald-300/80 font-mono font-bold tracking-wider shadow-sm',
    outline: 'border border-brand-charcoal/20 text-brand-charcoal',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-colors border',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
