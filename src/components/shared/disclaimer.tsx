'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerProps {
  variant?: 'info' | 'warning' | 'caution';
  children: React.ReactNode;
  className?: string;
}

export function Disclaimer({ variant = 'info', children, className }: DisclaimerProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    caution: 'bg-red-50 border-red-200 text-red-800',
  };

  const Icon = variant === 'info' ? Info : AlertTriangle;

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4 text-sm', styles[variant], className)}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}
