import type {
  ConditionPopulationResult,
  AbsenteeismInputs,
  AbsenteeismBenchmarks,
  AbsenteeismResult,
  ConditionAbsenteeismResult,
  TreatedVsUntreatedCost,
} from '@/types';

/**
 * Calculate the full absenteeism and productivity impact across all conditions.
 */
export function calculateAbsenteeism(
  populationResults: ConditionPopulationResult[],
  inputs: AbsenteeismInputs,
  benchmarks: AbsenteeismBenchmarks
): AbsenteeismResult {
  const dailyCost = inputs.averageSalary / inputs.workdaysPerYear;
  const rulaCostPerPerson = benchmarks.rulaCostPerSession * benchmarks.rulaAvgSessions;

  const incrementalDaysUntreated =
    benchmarks.missedDaysChronicPlusUntreatedMh - benchmarks.missedDaysNoMh;
  const incrementalDaysTreated =
    benchmarks.missedDaysChronicPlusTreatedMh - benchmarks.missedDaysNoMh;

  const perPersonProductivityLossUntreated = incrementalDaysUntreated * dailyCost;
  const perPersonProductivityLossTreated = incrementalDaysTreated * dailyCost;

  // Build per-condition breakdown
  const conditionBreakdown: ConditionAbsenteeismResult[] = populationResults.map((pr) => {
    const untreatedCount = pr.estimatedUntreated;
    const missedDaysPerPerson = benchmarks.missedDaysChronicPlusUntreatedMh;
    const missedDaysAfterTreatment = benchmarks.missedDaysChronicPlusTreatedMh;
    const daysRecovered = missedDaysPerPerson - missedDaysAfterTreatment;

    if (untreatedCount === null) {
      return {
        conditionId: pr.conditionId,
        conditionName: pr.conditionName,
        untreatedCount: null,
        missedDaysPerPerson,
        totalMissedDays: null,
        productivityLoss: null,
        missedDaysAfterTreatment,
        totalMissedDaysAfterTreatment: null,
        productivityGain: null,
        rulaCost: null,
        netSavings: null,
      };
    }

    const totalMissedDays = untreatedCount * incrementalDaysUntreated;
    const productivityLoss = totalMissedDays * dailyCost;
    const totalMissedDaysAfterTreatment = untreatedCount * incrementalDaysTreated;
    const productivityGain = untreatedCount * daysRecovered * dailyCost;
    const rulaCost = untreatedCount * rulaCostPerPerson;
    const netSavings = productivityGain - rulaCost;

    return {
      conditionId: pr.conditionId,
      conditionName: pr.conditionName,
      untreatedCount,
      missedDaysPerPerson,
      totalMissedDays,
      productivityLoss,
      missedDaysAfterTreatment,
      totalMissedDaysAfterTreatment,
      productivityGain,
      rulaCost,
      netSavings,
    };
  });

  // Aggregate totals (with overlap)
  const totalUntreatedPopulation = conditionBreakdown.reduce(
    (sum, c) => sum + (c.untreatedCount ?? 0), 0
  );
  const totalMissedDaysUntreated = conditionBreakdown.reduce(
    (sum, c) => sum + (c.totalMissedDays ?? 0), 0
  );
  const totalProductivityLossUntreated = conditionBreakdown.reduce(
    (sum, c) => sum + (c.productivityLoss ?? 0), 0
  );
  const totalRulaTreatmentCost = totalUntreatedPopulation * rulaCostPerPerson;
  const totalMissedDaysAfterTreatment = conditionBreakdown.reduce(
    (sum, c) => sum + (c.totalMissedDaysAfterTreatment ?? 0), 0
  );
  const totalProductivityGain = conditionBreakdown.reduce(
    (sum, c) => sum + (c.productivityGain ?? 0), 0
  );
  const netProductivitySavings = totalProductivityGain - totalRulaTreatmentCost;

  return {
    dailyCost,
    missedDaysNoMh: benchmarks.missedDaysNoMh,
    missedDaysUntreatedMh: benchmarks.missedDaysUntreatedMh,
    missedDaysTreatedMh: benchmarks.missedDaysTreatedMh,
    missedDaysChronicUntreated: benchmarks.missedDaysChronicPlusUntreatedMh,
    missedDaysChronicTreated: benchmarks.missedDaysChronicPlusTreatedMh,
    incrementalDaysUntreated,
    incrementalDaysTreated,
    perPersonProductivityLossUntreated,
    perPersonProductivityLossTreated,
    totalUntreatedPopulation,
    totalMissedDaysUntreated,
    totalProductivityLossUntreated,
    rulaCostPerPerson,
    totalRulaTreatmentCost,
    totalMissedDaysAfterTreatment,
    totalProductivityGain,
    netProductivitySavings,
    conditionBreakdown,
  };
}

/**
 * Calculate per-person treated vs untreated cost breakdown for a single condition.
 * Breaks down medical claims, absenteeism, and STD costs.
 */
export function calculateTreatedVsUntreated(
  populationResult: ConditionPopulationResult,
  inputs: AbsenteeismInputs,
  benchmarks: AbsenteeismBenchmarks
): TreatedVsUntreatedCost {
  const dailyCost = inputs.averageSalary / inputs.workdaysPerYear;
  const rulaTreatmentCost = benchmarks.rulaCostPerSession * benchmarks.rulaAvgSessions;

  // Untreated per-person costs
  const untreatedMedicalClaims = benchmarks.incrementalMedicalClaimsUntreated;
  const untreatedAbsenteeismCost =
    (benchmarks.missedDaysChronicPlusUntreatedMh - benchmarks.missedDaysNoMh) * dailyCost;
  const untreatedStdCost =
    benchmarks.annualStdBaselineCost * benchmarks.stdCostMultiplierUntreated;
  const untreatedTotalCost =
    untreatedMedicalClaims + untreatedAbsenteeismCost + untreatedStdCost;

  // Treated per-person costs
  const treatedMedicalClaims = benchmarks.incrementalMedicalClaimsTreated;
  const treatedAbsenteeismCost =
    (benchmarks.missedDaysChronicPlusTreatedMh - benchmarks.missedDaysNoMh) * dailyCost;
  const treatedStdCost =
    benchmarks.annualStdBaselineCost * benchmarks.stdCostMultiplierTreated;
  const treatedTotalCost =
    treatedMedicalClaims + treatedAbsenteeismCost + treatedStdCost + rulaTreatmentCost;

  const annualSavingsPerPerson = untreatedTotalCost - treatedTotalCost;

  const untreatedPopulation = populationResult.estimatedUntreated;
  const populationSavings =
    untreatedPopulation !== null ? untreatedPopulation * annualSavingsPerPerson : null;

  return {
    conditionId: populationResult.conditionId,
    conditionName: populationResult.conditionName,
    untreatedMedicalClaims,
    untreatedAbsenteeismCost,
    untreatedStdCost,
    untreatedTotalCost,
    treatedMedicalClaims,
    treatedAbsenteeismCost,
    treatedStdCost,
    treatedTotalCost,
    rulaTreatmentCost,
    annualSavingsPerPerson,
    untreatedPopulation,
    populationSavings,
  };
}
