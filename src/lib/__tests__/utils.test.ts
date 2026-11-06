import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyExact, roundDownToHundred } from '../utils';

describe('roundDownToHundred', () => {
  it('rounds positive values down to the nearest hundred', () => {
    expect(roundDownToHundred(1_234_567.89)).toBe(1_234_500);
    expect(roundDownToHundred(199.99)).toBe(100);
    expect(roundDownToHundred(1300)).toBe(1300);
    expect(roundDownToHundred(99)).toBe(0);
  });

  it('rounds negative values toward zero', () => {
    expect(roundDownToHundred(-1_250)).toBe(-1_200);
    expect(Object.is(roundDownToHundred(-50), 0)).toBe(true);
  });
});

describe('formatCurrency', () => {
  it('formats rounded-down dollars', () => {
    expect(formatCurrency(1_234_567.89)).toBe('$1,234,500');
    expect(formatCurrency(-50)).toBe('$0');
    expect(formatCurrency(-1_250)).toBe('-$1,200');
  });
});

describe('formatCurrencyExact', () => {
  it('keeps inputs and unit rates to the dollar', () => {
    expect(formatCurrencyExact(130)).toBe('$130');
    expect(formatCurrencyExact(65_432.4)).toBe('$65,432');
  });
});
