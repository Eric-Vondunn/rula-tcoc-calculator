'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  placeholder?: string;
  helpText?: string;
  sourceLabel?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  allowNull?: boolean;
  formatAsPercent?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  prefix,
  placeholder,
  helpText,
  sourceLabel,
  disabled = false,
  className,
  id,
  allowNull = false,
  formatAsPercent = false,
}: NumberInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  const displayValue = React.useMemo(() => {
    if (value === null) return '';
    if (formatAsPercent) return (value * 100).toString();
    return value.toString();
  }, [value, formatAsPercent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' && allowNull) {
      onChange(null);
      return;
    }
    if (raw === '') {
      onChange(min ?? 0);
      return;
    }
    let parsed = parseFloat(raw);
    if (isNaN(parsed)) return;
    if (formatAsPercent) parsed = parsed / 100;
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    onChange(parsed);
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {prefix}
          </span>
        )}
        <Input
          id={inputId}
          type="number"
          value={displayValue}
          onChange={handleChange}
          min={formatAsPercent && min !== undefined ? min * 100 : min}
          max={formatAsPercent && max !== undefined ? max * 100 : max}
          step={formatAsPercent ? (step < 1 ? step * 100 : step) : step}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            prefix && 'pl-7',
            suffix && 'pr-10'
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {helpText && <p className="text-xs text-gray-400">{helpText}</p>}
      {sourceLabel && (
        <p className="text-xs text-teal-600">Source: {sourceLabel}</p>
      )}
    </div>
  );
}
