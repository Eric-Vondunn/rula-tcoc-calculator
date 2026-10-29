import { describe, it, expect } from 'vitest';
import { calculateFinancialBurden, calculateScenario } from '../financial';
import type { ConditionPopulationResult, CostBenchmark, ScenarioAssumptions } from '@/types';

const populationResult: ConditionPopulationResult = {
  conditionId: 'diabetes',
  conditionName: 'Type 2 Diabetes',
  eligiblePopulation: 19500,
  estimatedWithCondition: 2262,
  estimatedWithBhComorbidity: 565.5,
  estimatedUntreated: 322.335,
  prevalenceRate: 0.116,
  bhComorbidityRate: 0.25,
  untreatedRate: 0.57,
  dataAvailable: true,
  notes: [],
};

const costBenchmark: CostBenchmark = {
  benchmarkId: 'ibi_incremental_10k',
  label: '$10,000 (Unverified)',
  annualIncrementalCost: 10000,
  description: 'Test benchmark',
  source: {
    sourceId: 'test',
    publisher: 'Test',
    studyTitle: 'Test',
    publicationYear: 2024,
    sourceUrl: null,
    doi: null,
    exactStatistic: 10000,
    numeratorDefinition: '',
    denominatorDefinition: '',
    ageRange: '18+',
    insurancePopulation: 'Employer',
    geographicScope: 'US',
    observationPeriod: '2024',
    evidenceType: 'modeled',
    causalityType: 'association',
    dateVerified: null,
    approvalStatus: 'pending_verification',
  },
};

describe('calculateFinancialBurden', () => {
  it('should calculate modeled annual spending', () => {
    const result = calculateFinancialBurden(populationResult, costBenchmark, null, 0.80);

    expect(result.modeledAnnualSpending).toBeCloseTo(322.335 * 10000, 0);
    expect(result.potentiallyAvoidableSpending).toBeNull();
    expect(result.costBenchmarkStatus).toBe('unverified');
  });

  it('should calculate potentially avoidable spending when recoverable % is set', () => {
    const result = calculateFinancialBurden(populationResult, costBenchmark, 0.30, 0.80);

    expect(result.potentiallyAvoidableSpending).toBeCloseTo(322.335 * 10000 * 0.30, 0);
  });

  it('should handle null untreated count', () => {
    const nullResult: ConditionPopulationResult = {
      ...populationResult,
      estimatedUntreated: null,
    };

    const result = calculateFinancialBurden(nullResult, costBenchmark, 0.30, 0.80);

    expect(result.modeledAnnualSpending).toBeNull();
    expect(result.potentiallyAvoidableSpending).toBeNull();
  });
});

describe('calculateScenario', () => {
  const baseAssumptions: ScenarioAssumptions = {
    outreachRate: 0.50,
    initiationRate: 0.50,
    completionRate: 0.60,
    averageVisits: 10,
    costPerVisit: 150,
    additionalAdminCostPerMember: 50,
    savingsPerTreatedMember: 3000,
    recoverablePercentage: null,
  };

  it('should calculate scenario results correctly', () => {
    const result = calculateScenario(populationResult, baseAssumptions, 'base', 0.80);

    // eligible = 322.335
    // reached = 322.335 * 0.50 = 161.1675
    // initiated = 161.1675 * 0.50 = 80.58375
    // completed = 80.58375 * 0.60 = 48.350...
    expect(result.reached).toBeCloseTo(161.1675, 2);
    expect(result.initiated).toBeCloseTo(80.58375, 2);
    expect(result.completed).toBeCloseTo(48.35025, 2);
    expect(result.savingsEligible).toBeCloseTo(80.58375, 2);

    // treatmentCost = 80.58375 * 10 * 150 = 120875.625
    expect(result.treatmentCost).toBeCloseTo(120875.625, 0);

    // additionalCost = 80.58375 * 50 = 4029.1875
    expect(result.additionalCost).toBeCloseTo(4029.1875, 0);

    // grossSavings = 80.58375 * 3000 = 241751.25
    expect(result.grossSavings).toBeCloseTo(241751.25, 0);

    // netSavings = 241751.25 - 120875.625 - 4029.1875 = 116846.4375
    expect(result.netSavings).toBeCloseTo(116846.4375, 0);

    expect(result.isComplete).toBe(true);
  });

  it('should return incomplete when savings per member is null', () => {
    const incomplete: ScenarioAssumptions = {
      ...baseAssumptions,
      savingsPerTreatedMember: null,
    };

    const result = calculateScenario(populationResult, incomplete, 'base', 0.80);

    expect(result.grossSavings).toBeNull();
    expect(result.netSavings).toBeNull();
    expect(result.isComplete).toBe(false);
    expect(result.incompleteReasons.length).toBeGreaterThan(0);
  });

  it('should handle zero cost edge case', () => {
    const zeroCost: ScenarioAssumptions = {
      ...baseAssumptions,
      costPerVisit: 0,
      additionalAdminCostPerMember: 0,
    };

    const result = calculateScenario(populationResult, zeroCost, 'base', 0.80);

    // With zero cost, ROI should be null (undefined per spec)
    expect(result.treatmentCost).toBe(0);
    expect(result.netROI).toBeNull();
    expect(result.benefitCostRatio).toBeNull();
  });

  it('should handle null untreated population', () => {
    const nullPop: ConditionPopulationResult = {
      ...populationResult,
      estimatedUntreated: null,
    };

    const result = calculateScenario(nullPop, baseAssumptions, 'base', 0.80);

    expect(result.eligibleUntreated).toBeNull();
    expect(result.isComplete).toBe(false);
  });

  it('should calculate employer net savings correctly', () => {
    const result = calculateScenario(populationResult, baseAssumptions, 'base', 0.80);

    expect(result.employerNetSavings).toBeCloseTo(result.netSavings! * 0.80, 0);
  });
});
