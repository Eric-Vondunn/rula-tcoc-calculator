'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | null;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  unavailableText?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-teal-600',
  unavailableText = 'Data unavailable',
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            {value !== null ? (
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">{unavailableText}</p>
            )}
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn('rounded-lg bg-gray-50 p-2', iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
