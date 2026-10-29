import { describe, it, expect } from 'vitest';
import { calculateConditionPopulation } from '../population';
import type { ConditionBenchmark, ClientInputs } from '@/types';

const baseInputs: ClientInputs = {
  clientName: 'Test Employer',
  totalCoveredMembers: 25000,
  analysisYear: 2024,
  adultPercentage: 0.78,
  employerPaidShare: 0.80,
  bhTreatmentRate: null,
  selectedCostBenchmarkId: 'ibi_incremental_10k',
  recoverableCostPercentage: null,
};

const diabetesBenchmark: ConditionBenchmark = {
  conditionId: 'diabetes',
  conditionName: 'Type 2 Diabetes',
  clinicalDefinition: 'ICD-10 E11.x',
  prevalenceRate: 0.116,
  prevalenceDenominator: 'adult_members',
  prevalenceSource: null,
  bhComorbidityRate: 0.25,
  bhDefinition: 'Depression among T2D patients',
  bhComorbiditySource: null,
  untreatedRate: 0.57,
  untreatedSource: null,
  notes: 'Test benchmark',
};

describe('calculateConditionPopulation', () => {
  it('should calculate population estimates for adult-denominator conditions', () => {
    const result = calculateConditionPopulation(diabetesBenchmark, baseInputs);

    // Eligible = 25000 * 0.78 = 19500
    expect(result.eligiblePopulation).toBe(19500);
    // With condition = 19500 * 0.116 = 2262
    expect(result.estimatedWithCondition).toBeCloseTo(2262, 0);
    // With BH = 2262 * 0.25 = 565.5
    expect(result.estimatedWithBhComorbidity).toBeCloseTo(565.5, 0);
    // Untreated = 565.5 * 0.57 = 322.335
    expect(result.estimatedUntreated).toBeCloseTo(322.335, 0);
    expect(result.dataAvailable).toBe(true);
  });

  it('should use total members for total_members denominator', () => {
    const cancerBenchmark: ConditionBenchmark = {
      ...diabetesBenchmark,
      conditionId: 'cancer',
      prevalenceDenominator: 'total_members',
      prevalenceRate: 0.054,
    };

    const result = calculateConditionPopulation(cancerBenchmark, baseInputs);

    expect(result.eligiblePopulation).toBe(25000);
    expect(result.estimatedWithCondition).toBeCloseTo(1350, 0);
  });

  it('should handle null prevalence rate', () => {
    const nullBenchmark: ConditionBenchmark = {
      ...diabetesBenchmark,
      conditionId: 'specialty_rx_glp1',
      prevalenceRate: null,
      bhComorbidityRate: null,
      untreatedRate: null,
    };

    const result = calculateConditionPopulation(nullBenchmark, baseInputs);

    expect(result.estimatedWithCondition).toBeNull();
    expect(result.estimatedWithBhComorbidity).toBeNull();
    expect(result.estimatedUntreated).toBeNull();
    expect(result.dataAvailable).toBe(false);
  });

  it('should handle null untreated rate', () => {
    const noUntreatedBenchmark: ConditionBenchmark = {
      ...diabetesBenchmark,
      untreatedRate: null,
    };

    const result = calculateConditionPopulation(noUntreatedBenchmark, baseInputs);

    expect(result.estimatedWithCondition).toBeCloseTo(2262, 0);
    expect(result.estimatedWithBhComorbidity).toBeCloseTo(565.5, 0);
    expect(result.estimatedUntreated).toBeNull();
  });

  it('should use unrounded intermediate values', () => {
    const result = calculateConditionPopulation(diabetesBenchmark, baseInputs);

    // Verify exact intermediate value (not rounded)
    const expected = 19500 * 0.116 * 0.25 * 0.57;
    expect(result.estimatedUntreated).toBeCloseTo(expected, 6);
  });
});
