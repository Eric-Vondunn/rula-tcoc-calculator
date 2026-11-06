import type { ConditionBenchmark, ClientInputs, ConditionPopulationResult } from '@/types';
import { getAnalysisPopulation, getEffectiveAdultPercentage, getPopulationLabels } from '@/lib/population-basis';

export function calculateConditionPopulation(
  benchmark: ConditionBenchmark,
  inputs: ClientInputs
): ConditionPopulationResult {
  const notes: string[] = [];
  const totalPopulation = getAnalysisPopulation(inputs);
  const adultPercentage = getEffectiveAdultPercentage(inputs);
  const labels = getPopulationLabels(inputs.populationBasis);

  // Determine eligible population based on denominator
  let eligiblePopulation: number;
  switch (benchmark.prevalenceDenominator) {
    case 'adult_members':
      eligiblePopulation = totalPopulation * adultPercentage;
      notes.push(
        inputs.populationBasis === 'members'
          ? `Eligible population based on adult members (${(adultPercentage * 100).toFixed(0)}% of total).`
          : 'Eligible population includes all employees (all adults).'
      );
      break;
    case 'total_members':
      eligiblePopulation = totalPopulation;
      notes.push(`Eligible population includes all ${labels.plural}.`);
      break;
    case 'specific_cohort':
      eligiblePopulation = totalPopulation;
      notes.push('Requires client-specific cohort data.');
      break;
    default:
      eligiblePopulation = totalPopulation;
  }

  // Calculate condition prevalence
  const prevalenceRate = benchmark.prevalenceRate;
  const estimatedWithCondition = prevalenceRate !== null
    ? eligiblePopulation * prevalenceRate
    : null;

  if (prevalenceRate === null) {
    notes.push('Condition prevalence benchmark unavailable.');
  }

  // Calculate BH comorbidity
  const bhComorbidityRate = benchmark.bhComorbidityRate;
  const estimatedWithBhComorbidity =
    estimatedWithCondition !== null && bhComorbidityRate !== null
      ? estimatedWithCondition * bhComorbidityRate
      : null;

  if (bhComorbidityRate === null) {
    notes.push('Behavioral health comorbidity benchmark unavailable.');
  }

  // Calculate untreated
  const untreatedRate = benchmark.untreatedRate;
  const estimatedUntreated =
    estimatedWithBhComorbidity !== null && untreatedRate !== null
      ? estimatedWithBhComorbidity * untreatedRate
      : null;

  if (untreatedRate === null && estimatedWithBhComorbidity !== null) {
    notes.push('Untreated rate unavailable. Showing comorbidity estimate only.');
  }

  const dataAvailable =
    prevalenceRate !== null && bhComorbidityRate !== null;

  return {
    conditionId: benchmark.conditionId,
    conditionName: benchmark.conditionName,
    eligiblePopulation,
    estimatedWithCondition,
    estimatedWithBhComorbidity,
    estimatedUntreated,
    prevalenceRate,
    bhComorbidityRate,
    untreatedRate,
    dataAvailable,
    notes,
  };
}

export function calculateAllConditions(
  benchmarks: ConditionBenchmark[],
  inputs: ClientInputs
): ConditionPopulationResult[] {
  return benchmarks.map((b) => calculateConditionPopulation(b, inputs));
}
