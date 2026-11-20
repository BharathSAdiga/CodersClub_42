import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'forest' | 'terracotta' | 'outline' | 'mint' | 'mint-bright';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-brand-forest/10 text-brand-forest border-transparent',
    forest: 'bg-brand-forest text-brand-ivory border-transparent',
    terracotta: 'bg-brand-terracotta/15 text-brand-terracotta border-brand-terracotta/20',
    mint: 'bg-brand-mint/20 text-emerald-800 border-emerald-300',
    'mint-bright': 'bg-brand-mint/20 text-brand-mint border-brand-mint/40 font-semibold',
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
