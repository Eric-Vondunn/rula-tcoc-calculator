import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Rounds a dollar amount down to the nearest $100 (toward zero, so negative
 * values don't appear larger than they are).
 */
export function roundDownToHundred(value: number): number {
  return Math.trunc(value / 100) * 100 + 0; // + 0 normalizes -0
}

/** Formats a calculated cost, rounded down to the nearest $100. */
export function formatCurrency(value: number): string {
  return usdFormatter.format(roundDownToHundred(value));
}

/** Formats an input or unit rate (e.g. salary, per-session cost) to the nearest dollar. */
export function formatCurrencyExact(value: number): string {
  return usdFormatter.format(Math.round(value));
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPercentValue(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function roundForDisplay(value: number): number {
  return Math.round(value);
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(1, value));
}
