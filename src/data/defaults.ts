import type { ClientInputs, ScenarioSet } from '@/types';

export const OVERLAP_DISCLAIMER =
  'Condition populations may overlap. Category estimates should not be summed to estimate unique individuals or total employer-wide costs.';

export const FINANCIAL_DISCLAIMER =
  'Financial estimates are modeled projections, not guaranteed outcomes. Actual results depend on population characteristics, treatment engagement, intervention design, and other factors.';

export const UNVERIFIED_COST_DISCLAIMER =
  'The $10,000 annual incremental cost assumption has not been independently verified against the claimed IBI source. Use with appropriate disclosure.';

export const currentYear = new Date().getFullYear();

export const defaultClientInputs: ClientInputs = {
  clientName: '',
  totalCoveredMembers: 25000,
  analysisYear: currentYear,
  adultPercentage: 0.78,
  employerPaidShare: 0.80,
  bhTreatmentRate: null,
  selectedCostBenchmarkId: 'ibi_incremental_10k',
  recoverableCostPercentage: null,
};

export const defaultScenarios: ScenarioSet = {
  conservative: {
    outreachRate: 0.30,
    initiationRate: 0.40,
    completionRate: 0.50,
    averageVisits: 8,
    costPerVisit: 150,
    additionalAdminCostPerMember: 50,
    savingsPerTreatedMember: null,
    recoverablePercentage: null,
  },
  base: {
    outreachRate: 0.50,
    initiationRate: 0.50,
    completionRate: 0.60,
    averageVisits: 10,
    costPerVisit: 150,
    additionalAdminCostPerMember: 50,
    savingsPerTreatedMember: null,
    recoverablePercentage: null,
  },
  optimistic: {
    outreachRate: 0.70,
    initiationRate: 0.60,
    completionRate: 0.70,
    averageVisits: 12,
    costPerVisit: 150,
    additionalAdminCostPerMember: 50,
    savingsPerTreatedMember: null,
    recoverablePercentage: null,
  },
};
