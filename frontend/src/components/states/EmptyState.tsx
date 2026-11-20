import React from 'react';
import { Inbox, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No active records found',
  description = 'Your verified activity will appear here once connected.',
  actionLabel = 'Explore Pre-Approved Limit',
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-brand-ivory border border-dashed border-brand-forest/20 my-6">
      <div className="w-14 h-14 rounded-2xl bg-brand-forest/10 flex items-center justify-center text-brand-forest mb-4">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="font-display font-bold text-lg text-brand-charcoal">{title}</h3>
      <p className="text-sm text-brand-charcoal/60 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <Button variant="primary" size="pill" onClick={onAction}>
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this data stream. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-3xl bg-red-50/60 border border-red-200 my-6">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="font-display font-bold text-base text-red-900">{title}</h4>
      <p className="text-xs text-red-700/80 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </Button>
      )}
    </div>
  );
};
