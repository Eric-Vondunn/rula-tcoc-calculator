import type { ClientInputs, ScenarioSet, AbsenteeismInputs, AbsenteeismBenchmarks } from '@/types';

export const OVERLAP_DISCLAIMER =
  'Condition populations may overlap. Category estimates should not be summed to estimate unique individuals or total employer-wide costs.';

export const FINANCIAL_DISCLAIMER =
  'Financial estimates are modeled projections, not guaranteed outcomes. Actual results depend on population characteristics, treatment engagement, intervention design, and other factors.';

export const UNVERIFIED_COST_DISCLAIMER =
  'The $10,000 annual incremental cost assumption has not been independently verified against the claimed IBI source. Use with appropriate disclosure.';

export const PRODUCTIVITY_DISCLAIMER =
  'Absenteeism and productivity estimates are based on published workforce research benchmarks. Actual missed workdays and costs vary by industry, role, and employer policies. These figures do not include presenteeism (reduced on-the-job productivity).';

// ============================================================
// Absenteeism & Productivity Defaults
// ============================================================

export const defaultAbsenteeismInputs: AbsenteeismInputs = {
  averageSalary: 75000,
  workdaysPerYear: 250,
};

/**
 * Absenteeism benchmark data points — all pending verification.
 *
 * Sources:
 * - Kessler et al. (2006) "The prevalence and effects of mood disorders
 *   on work performance" — ~8.7 excess workdays lost per year for depression
 * - Stewart et al. (2003) JAMA "Cost of lost productive work time among
 *   US workers with depression" — ~5.6 hours/week lost productivity
 * - Greenberg et al. (2015) "The economic burden of adults with major
 *   depressive disorder in the US (2005 and 2010)" — workplace costs
 * - Loeppke et al. (2009) "Health and productivity as a business strategy"
 *   — chronic conditions + comorbid depression increase absenteeism 2-3x
 * - SAMHSA / NSDUH workforce data
 * - Bureau of Labor Statistics — baseline absence rates
 */
export const absenteeismBenchmarks: AbsenteeismBenchmarks = {
  // Workdays missed per year
  missedDaysNoMh: 4.0,                        // BLS: avg unscheduled absences, no MH condition
  missedDaysUntreatedMh: 9.0,                 // Kessler et al.: ~2.2x baseline for untreated depression
  missedDaysTreatedMh: 5.5,                   // Estimated reduction with effective BH treatment
  missedDaysChronicPlusUntreatedMh: 12.0,     // Loeppke et al.: chronic + untreated MH = highest absenteeism
  missedDaysChronicPlusTreatedMh: 7.0,        // Modeled: treatment reduces but doesn't eliminate excess

  // Incremental medical claims (annual, above baseline)
  incrementalMedicalClaimsUntreated: 5000,    // Per-person incremental claims for untreated BH
  incrementalMedicalClaimsTreated: 2000,      // Reduced but not eliminated with treatment

  // Short-term disability
  stdCostMultiplierUntreated: 2.0,            // 2x baseline STD cost for untreated MH
  stdCostMultiplierTreated: 1.3,              // 1.3x baseline with treatment
  annualStdBaselineCost: 800,                 // Avg annual STD cost per employee (baseline)

  // Rula treatment parameters
  rulaCostPerSession: 130,                    // Average cost of a Rula provider session
  rulaAvgSessions: 10,                        // Average sessions per individual
};

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
