import type {
  ConditionPopulationResult,
  ConditionFinancialResult,
  ScenarioAssumptions,
  ScenarioResult,
  ScenarioType,
  CostBenchmark,
  VerificationStatus,
} from '@/types';

function mapApprovalToVerification(approvalStatus: string): VerificationStatus {
  switch (approvalStatus) {
    case 'approved':
      return 'verified';
    case 'pending_verification':
      return 'unverified';
    default:
      return 'unavailable';
  }
}

export function calculateFinancialBurden(
  populationResult: ConditionPopulationResult,
  costBenchmark: CostBenchmark,
  recoverablePercentage: number | null,
  employerPaidShare: number
): ConditionFinancialResult {
  const notes: string[] = [];
  const { estimatedUntreated, conditionId, conditionName } = populationResult;
  const incrementalCostPerPerson = costBenchmark.annualIncrementalCost;
  const costBenchmarkStatus = mapApprovalToVerification(costBenchmark.source.approvalStatus);

  if (costBenchmarkStatus === 'unverified') {
    notes.push('Cost benchmark is unverified. Source has not been independently validated.');
  }

  const modeledAnnualSpending =
    estimatedUntreated !== null
      ? estimatedUntreated * incrementalCostPerPerson
      : null;

  let potentiallyAvoidableSpending: number | null = null;
  if (modeledAnnualSpending !== null && recoverablePercentage !== null) {
    potentiallyAvoidableSpending = modeledAnnualSpending * recoverablePercentage;
  } else if (recoverablePercentage === null) {
    notes.push('Recoverable cost percentage not set. Potentially avoidable spending unavailable.');
  }

  return {
    conditionId,
    conditionName,
    untreatedCount: estimatedUntreated,
    incrementalCostPerPerson,
    modeledAnnualSpending,
    potentiallyAvoidableSpending,
    recoverablePercentage,
    costBenchmarkStatus,
    notes,
  };
}

export function calculateScenario(
  populationResult: ConditionPopulationResult,
  assumptions: ScenarioAssumptions,
  scenarioType: ScenarioType,
  employerPaidShare: number
): ScenarioResult {
  const incompleteReasons: string[] = [];
  const { estimatedUntreated, conditionId } = populationResult;

  if (estimatedUntreated === null) {
    return {
      scenarioType,
      conditionId,
      eligibleUntreated: null,
      reached: null,
      initiated: null,
      completed: null,
      savingsEligible: null,
      treatmentCost: null,
      additionalCost: null,
      grossSavings: null,
      netSavings: null,
      netROI: null,
      benefitCostRatio: null,
      employerNetSavings: null,
      isComplete: false,
      incompleteReasons: ['Untreated population estimate unavailable.'],
    };
  }

  const eligible = estimatedUntreated;
  const reached = eligible * assumptions.outreachRate;
  const initiated = reached * assumptions.initiationRate;
  const completed = initiated * assumptions.completionRate;

  // Those who initiate treatment are savings-eligible
  const savingsEligible = initiated;

  const treatmentCost = initiated * assumptions.averageVisits * assumptions.costPerVisit;
  const additionalCost = initiated * assumptions.additionalAdminCostPerMember;
  const totalCost = treatmentCost + additionalCost;

  let grossSavings: number | null = null;
  let netSavings: number | null = null;
  let netROI: number | null = null;
  let benefitCostRatio: number | null = null;
  let employerNetSavings: number | null = null;

  if (assumptions.savingsPerTreatedMember !== null) {
    grossSavings = savingsEligible * assumptions.savingsPerTreatedMember;
    netSavings = grossSavings - totalCost;
    employerNetSavings = netSavings * employerPaidShare;

    if (totalCost > 0) {
      netROI = netSavings / totalCost;
      benefitCostRatio = grossSavings / totalCost;
    }
    // If totalCost is 0, ROI is undefined (null)
  } else {
    incompleteReasons.push('Savings per treated member not set.');
  }

  return {
    scenarioType,
    conditionId,
    eligibleUntreated: eligible,
    reached,
    initiated,
    completed,
    savingsEligible,
    treatmentCost,
    additionalCost,
    grossSavings,
    netSavings,
    netROI,
    benefitCostRatio,
    employerNetSavings,
    isComplete: incompleteReasons.length === 0,
    incompleteReasons,
  };
}

export function calculateAllScenarios(
  populationResults: ConditionPopulationResult[],
  assumptions: ScenarioAssumptions,
  scenarioType: ScenarioType,
  employerPaidShare: number
): ScenarioResult[] {
  return populationResults.map((pr) =>
    calculateScenario(pr, assumptions, scenarioType, employerPaidShare)
  );
}
