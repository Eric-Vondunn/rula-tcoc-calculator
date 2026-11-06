import { describe, it, expect } from 'vitest';
import {
  MEMBERS_PER_EMPLOYEE, getAnalysisPopulation, getEffectiveAdultPercentage,
} from '../population-basis';
import { calculateConditionPopulation } from '../engine/population';
import type { ClientInputs, ConditionBenchmark } from '@/types';

const inputs = (basis: ClientInputs['populationBasis']): ClientInputs => ({
  clientName: 'Test', employeeCount: 10_000, populationBasis: basis, analysisYear: 2026,
  adultPercentage: 0.78, employerPaidShare: 0.8, bhTreatmentRate: null,
  selectedCostBenchmarkId: 'ibi_incremental_10k', recoverableCostPercentage: null,
});

const adultBenchmark = {
  conditionId: 'diabetes', conditionName: 'Diabetes', clinicalDefinition: '', prevalenceRate: 0.1,
  prevalenceDenominator: 'adult_members', prevalenceSource: null, bhComorbidityRate: 0.5,
  bhDefinition: '', bhComorbiditySource: null, untreatedRate: 0.5, untreatedSource: null, notes: '',
} satisfies ConditionBenchmark;

describe('population basis', () => {
  it('uses employees × 2.2 for members', () => {
    expect(MEMBERS_PER_EMPLOYEE).toBe(2.2);
    expect(getAnalysisPopulation(inputs('members'))).toBeCloseTo(22_000);
    expect(getAnalysisPopulation(inputs('employees'))).toBe(10_000);
  });

  it('only applies the adult share to members', () => {
    expect(getEffectiveAdultPercentage(inputs('members'))).toBe(0.78);
    expect(getEffectiveAdultPercentage(inputs('employees'))).toBe(1);
  });

  it('drives the population engine', () => {
    expect(calculateConditionPopulation(adultBenchmark, inputs('members')).eligiblePopulation).toBeCloseTo(17_160);
    expect(calculateConditionPopulation(adultBenchmark, inputs('employees')).eligiblePopulation).toBe(10_000);
  });
});
