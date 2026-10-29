// ============================================================
// Core Domain Types
// ============================================================

export type ConditionId =
  | 'diabetes'
  | 'cardiovascular'
  | 'cancer'
  | 'musculoskeletal'
  | 'gastrointestinal'
  | 'specialty_rx_glp1';

export type VerificationStatus = 'verified' | 'unverified' | 'unavailable';

export type EvidenceType = 'observed' | 'modeled';

export type CausalityType = 'association' | 'causal';

export type ApprovalStatus = 'approved' | 'pending_verification' | 'rejected';

// ============================================================
// Research Benchmark Types
// ============================================================

export interface BenchmarkSource {
  sourceId: string;
  publisher: string;
  studyTitle: string;
  publicationYear: number;
  sourceUrl: string | null;
  doi: string | null;
  exactStatistic: number | null;
  numeratorDefinition: string;
  denominatorDefinition: string;
  ageRange: string;
  insurancePopulation: string;
  geographicScope: string;
  observationPeriod: string;
  evidenceType: EvidenceType;
  causalityType: CausalityType;
  dateVerified: string | null;
  approvalStatus: ApprovalStatus;
}

export interface ConditionBenchmark {
  conditionId: ConditionId;
  conditionName: string;
  clinicalDefinition: string;
  prevalenceRate: number | null;
  prevalenceDenominator: 'total_members' | 'adult_members' | 'specific_cohort';
  prevalenceSource: BenchmarkSource | null;
  bhComorbidityRate: number | null;
  bhDefinition: string;
  bhComorbiditySource: BenchmarkSource | null;
  untreatedRate: number | null;
  untreatedSource: BenchmarkSource | null;
  notes: string;
}

export interface CostBenchmark {
  benchmarkId: string;
  label: string;
  annualIncrementalCost: number;
  description: string;
  source: BenchmarkSource;
}

// ============================================================
// User Input Types
// ============================================================

export interface ClientInputs {
  clientName: string;
  totalCoveredMembers: number;
  analysisYear: number;
  adultPercentage: number;
  employerPaidShare: number;
  bhTreatmentRate: number | null;
  selectedCostBenchmarkId: string;
  recoverableCostPercentage: number | null;
}

export interface ScenarioAssumptions {
  outreachRate: number;
  initiationRate: number;
  completionRate: number;
  averageVisits: number;
  costPerVisit: number;
  additionalAdminCostPerMember: number;
  savingsPerTreatedMember: number | null;
  recoverablePercentage: number | null;
}

export interface ScenarioSet {
  conservative: ScenarioAssumptions;
  base: ScenarioAssumptions;
  optimistic: ScenarioAssumptions;
}

export type ScenarioType = keyof ScenarioSet;

// ============================================================
// Calculation Result Types
// ============================================================

export interface ConditionPopulationResult {
  conditionId: ConditionId;
  conditionName: string;
  eligiblePopulation: number;
  estimatedWithCondition: number | null;
  estimatedWithBhComorbidity: number | null;
  estimatedUntreated: number | null;
  prevalenceRate: number | null;
  bhComorbidityRate: number | null;
  untreatedRate: number | null;
  dataAvailable: boolean;
  notes: string[];
}

export interface ConditionFinancialResult {
  conditionId: ConditionId;
  conditionName: string;
  untreatedCount: number | null;
  incrementalCostPerPerson: number;
  modeledAnnualSpending: number | null;
  potentiallyAvoidableSpending: number | null;
  recoverablePercentage: number | null;
  costBenchmarkStatus: VerificationStatus;
  notes: string[];
}

export interface ScenarioResult {
  scenarioType: ScenarioType;
  conditionId: ConditionId;
  eligibleUntreated: number | null;
  reached: number | null;
  initiated: number | null;
  completed: number | null;
  savingsEligible: number | null;
  treatmentCost: number | null;
  additionalCost: number | null;
  grossSavings: number | null;
  netSavings: number | null;
  netROI: number | null;
  benefitCostRatio: number | null;
  employerNetSavings: number | null;
  isComplete: boolean;
  incompleteReasons: string[];
}

export interface AggregateScenarioResult {
  scenarioType: ScenarioType;
  conditionResults: ScenarioResult[];
  totalTreatmentCost: number | null;
  totalGrossSavings: number | null;
  totalNetSavings: number | null;
  disclaimers: string[];
}

// ============================================================
// Absenteeism & Productivity Types
// ============================================================

export interface AbsenteeismInputs {
  averageSalary: number;
  workdaysPerYear: number;
}

export interface AbsenteeismBenchmarks {
  missedDaysNoMh: number;
  missedDaysUntreatedMh: number;
  missedDaysTreatedMh: number;
  missedDaysChronicPlusUntreatedMh: number;
  missedDaysChronicPlusTreatedMh: number;
  incrementalMedicalClaimsUntreated: number;
  incrementalMedicalClaimsTreated: number;
  stdCostMultiplierUntreated: number;
  stdCostMultiplierTreated: number;
  annualStdBaselineCost: number;
  rulaCostPerSession: number;
  rulaAvgSessions: number;
}

export interface TreatedVsUntreatedCost {
  conditionId: ConditionId;
  conditionName: string;
  untreatedMedicalClaims: number;
  untreatedAbsenteeismCost: number;
  untreatedStdCost: number;
  untreatedTotalCost: number;
  treatedMedicalClaims: number;
  treatedAbsenteeismCost: number;
  treatedStdCost: number;
  treatedTotalCost: number;
  rulaTreatmentCost: number;
  annualSavingsPerPerson: number;
  untreatedPopulation: number | null;
  populationSavings: number | null;
}

export interface AbsenteeismResult {
  dailyCost: number;
  missedDaysNoMh: number;
  missedDaysUntreatedMh: number;
  missedDaysTreatedMh: number;
  missedDaysChronicUntreated: number;
  missedDaysChronicTreated: number;
  incrementalDaysUntreated: number;
  incrementalDaysTreated: number;
  perPersonProductivityLossUntreated: number;
  perPersonProductivityLossTreated: number;
  totalUntreatedPopulation: number;
  totalMissedDaysUntreated: number;
  totalProductivityLossUntreated: number;
  rulaCostPerPerson: number;
  totalRulaTreatmentCost: number;
  totalMissedDaysAfterTreatment: number;
  totalProductivityGain: number;
  netProductivitySavings: number;
  conditionBreakdown: ConditionAbsenteeismResult[];
}

export interface ConditionAbsenteeismResult {
  conditionId: ConditionId;
  conditionName: string;
  untreatedCount: number | null;
  missedDaysPerPerson: number;
  totalMissedDays: number | null;
  productivityLoss: number | null;
  missedDaysAfterTreatment: number;
  totalMissedDaysAfterTreatment: number | null;
  productivityGain: number | null;
  rulaCost: number | null;
  netSavings: number | null;
}

// ============================================================
// Application State
// ============================================================

export interface AppState {
  clientInputs: ClientInputs;
  scenarios: ScenarioSet;
  absenteeismInputs: AbsenteeismInputs;
  activeTab: string;
}
