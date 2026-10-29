'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Disclaimer } from '@/components/shared/disclaimer';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';
import { OVERLAP_DISCLAIMER, FINANCIAL_DISCLAIMER } from '@/data/defaults';
import { conditionBenchmarks } from '@/data/benchmarks';

export function ExecutiveSummary() {
  const { state, derived } = useCalculator();
  const { clientInputs, absenteeismInputs } = state;
  const {
    populationResults, financialResults, scenarioResults, adultMembers,
    absenteeismResult, treatedVsUntreatedResults,
  } = derived;

  const clientName = clientInputs.clientName || 'Employer';
  const availableConditions = populationResults.filter((r) => r.dataAvailable);
  const baseScenarioComplete = scenarioResults.base.filter((r) => r.isComplete);

  // Aggregate totals
  const totalWithCondition = populationResults.reduce(
    (sum, r) => sum + (r.estimatedWithCondition ?? 0), 0
  );
  const totalWithBhComorbidity = populationResults.reduce(
    (sum, r) => sum + (r.estimatedWithBhComorbidity ?? 0), 0
  );
  const totalUntreated = populationResults.reduce(
    (sum, r) => sum + (r.estimatedUntreated ?? 0), 0
  );
  const totalModeledSpending = financialResults.reduce(
    (sum, r) => sum + (r.modeledAnnualSpending ?? 0), 0
  );
  const totalGrossSavings = baseScenarioComplete.reduce(
    (sum, r) => sum + (r.grossSavings ?? 0), 0
  );
  const totalTreatmentCost = baseScenarioComplete.reduce(
    (sum, r) => sum + (r.treatmentCost ?? 0) + (r.additionalCost ?? 0), 0
  );
  const totalNetSavings = baseScenarioComplete.reduce(
    (sum, r) => sum + (r.netSavings ?? 0), 0
  );

  // Treated vs untreated aggregate
  const totalPopulationSavings = treatedVsUntreatedResults.reduce(
    (sum, r) => sum + (r.populationSavings ?? 0), 0
  );

  const generateNarrative = (): string => {
    const condCount = availableConditions.length;
    const totalMembers = formatNumber(clientInputs.totalCoveredMembers);

    let narrative = `Based on national population health benchmarks, an employer with ${totalMembers} covered members may have a meaningful population experiencing co-occurring chronic physical and behavioral health conditions across ${condCount} evaluated condition categories.`;

    narrative += ' Improving access to appropriate behavioral health treatment may offer opportunities to reduce medical utilization and associated spending.';

    narrative += ` Beyond direct medical costs, untreated behavioral health conditions drive significant productivity losses through absenteeism. Research indicates that individuals with untreated mental health conditions miss approximately ${absenteeismResult.missedDaysChronicUntreated} workdays per year when combined with a chronic condition — compared to ${absenteeismResult.missedDaysNoMh} days for those without mental health conditions. At an average salary of ${formatCurrency(absenteeismInputs.averageSalary)}, this represents a meaningful per-employee cost to the organization.`;

    narrative += ' Financial estimates depend on the specific population mix, treatment engagement rates, intervention costs, and realized clinical outcomes.';

    narrative += ' All estimates presented are modeled projections and should not be interpreted as guaranteed results.';

    return narrative;
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
        <CardContent className="p-8">
          <div className="space-y-2">
            <p className="text-sm font-medium text-teal-700 uppercase tracking-wide">
              Executive Summary
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Behavioral Health Total Cost of Care Analysis
            </h2>
            <p className="text-lg text-gray-600">
              Prepared for{' '}
              <span className="font-semibold text-gray-900">{clientName}</span>
            </p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <span>
                Covered Members:{' '}
                <span className="font-semibold text-gray-900">
                  {formatNumber(clientInputs.totalCoveredMembers)}
                </span>
              </span>
              <span>
                Analysis Year:{' '}
                <span className="font-semibold text-gray-900">{clientInputs.analysisYear}</span>
              </span>
              <span>
                Date:{' '}
                <span className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Narrative */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{generateNarrative()}</p>
        </CardContent>
      </Card>

      {/* Aggregate Totals */}
      <Card className="border-teal-200">
        <CardHeader className="pb-2">
          <CardTitle>Key Figures</CardTitle>
          <p className="text-xs text-amber-700 mt-1">
            Combined totals include population overlap across condition categories and do not represent unique individuals.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Covered Members</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(clientInputs.totalCoveredMembers)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Combined Chronic Conditions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalWithCondition)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Combined BH Comorbidity</p>
              <p className="text-2xl font-bold text-indigo-700">{formatNumber(totalWithBhComorbidity)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Combined Untreated BH</p>
              <p className="text-2xl font-bold text-teal-700">{formatNumber(totalUntreated)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Combined Modeled Spending</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalModeledSpending)}</p>
            </div>
            {baseScenarioComplete.length > 0 && (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Combined Gross Savings (Base)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGrossSavings)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Combined Treatment Cost (Base)</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalTreatmentCost)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Combined Net Savings (Base)</p>
                  <p className={`text-2xl font-bold ${totalNetSavings >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatCurrency(totalNetSavings)}
                  </p>
                </div>
              </>
            )}
          </div>
          <Separator className="my-4" />
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Absenteeism & Productivity</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Missed Days (Untreated)</p>
              <p className="text-2xl font-bold text-red-600">
                {formatNumber(absenteeismResult.totalMissedDaysUntreated)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Productivity Loss</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(absenteeismResult.totalProductivityLossUntreated)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Rula Investment</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(absenteeismResult.totalRulaTreatmentCost)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Net Productivity Savings</p>
              <p className={`text-2xl font-bold ${absenteeismResult.netProductivitySavings >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {formatCurrency(absenteeismResult.netProductivitySavings)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Savings/Person (Treated vs Untreated)</p>
              <p className="text-2xl font-bold text-green-700">
                {treatedVsUntreatedResults.length > 0
                  ? formatCurrency(treatedVsUntreatedResults[0].annualSavingsPerPerson)
                  : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Population Savings</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(totalPopulationSavings)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Avg Days Missed (Untreated + Chronic)</p>
              <p className="text-2xl font-bold text-gray-900">
                {absenteeismResult.missedDaysChronicUntreated} days
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Avg Days Missed (Treated + Chronic)</p>
              <p className="text-2xl font-bold text-teal-700">
                {absenteeismResult.missedDaysChronicTreated} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Population Estimates by Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Condition</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Est. With Condition</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Est. BH Comorbidity</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Est. Untreated</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Modeled Spending</th>
                </tr>
              </thead>
              <tbody>
                {populationResults.map((pop) => {
                  const fin = financialResults.find((f) => f.conditionId === pop.conditionId);
                  return (
                    <tr key={pop.conditionId} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{pop.conditionName}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {pop.estimatedWithCondition !== null
                          ? formatNumber(pop.estimatedWithCondition)
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {pop.estimatedWithBhComorbidity !== null
                          ? formatNumber(pop.estimatedWithBhComorbidity)
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {pop.estimatedUntreated !== null
                          ? formatNumber(pop.estimatedUntreated)
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {fin?.modeledAnnualSpending !== null && fin?.modeledAnnualSpending !== undefined
                          ? formatCurrency(fin.modeledAnnualSpending)
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Combined Total
                    <span className="block text-xs font-normal text-amber-700">Includes overlap</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatNumber(totalWithCondition)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-700">
                    {formatNumber(totalWithBhComorbidity)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-teal-700">
                    {formatNumber(totalUntreated)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatCurrency(totalModeledSpending)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-400 italic">{OVERLAP_DISCLAIMER}</p>
        </CardContent>
      </Card>

      {/* Base Scenario Summary */}
      {baseScenarioComplete.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Base Scenario ROI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Condition</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Members Treated</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Treatment Cost</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Gross Savings</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Net Savings</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">BCR</th>
                  </tr>
                </thead>
                <tbody>
                  {baseScenarioComplete.map((r) => {
                    const cond = populationResults.find((p) => p.conditionId === r.conditionId);
                    return (
                      <tr key={r.conditionId} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {cond?.conditionName ?? r.conditionId}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.initiated !== null ? formatNumber(r.initiated) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.treatmentCost !== null ? formatCurrency(r.treatmentCost) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.grossSavings !== null ? formatCurrency(r.grossSavings) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          <span className={r.netSavings !== null && r.netSavings >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                            {r.netSavings !== null ? formatCurrency(r.netSavings) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.benefitCostRatio !== null ? `${r.benefitCostRatio.toFixed(2)}x` : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals Row */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      Combined Total
                      <span className="block text-xs font-normal text-amber-700">Includes overlap</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {formatNumber(baseScenarioComplete.reduce((s, r) => s + (r.initiated ?? 0), 0))}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {formatCurrency(totalTreatmentCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {formatCurrency(totalGrossSavings)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={totalNetSavings >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {formatCurrency(totalNetSavings)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Absenteeism & Productivity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Absenteeism & Productivity Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Condition</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Untreated Pop.</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Missed Days</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Productivity Loss</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Productivity Gain</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Rula Cost</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Net Savings</th>
                </tr>
              </thead>
              <tbody>
                {absenteeismResult.conditionBreakdown.map((c) => (
                  <tr key={c.conditionId} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{c.conditionName}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {c.untreatedCount !== null ? formatNumber(c.untreatedCount) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {c.totalMissedDays !== null ? formatNumber(c.totalMissedDays) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      {c.productivityLoss !== null ? formatCurrency(c.productivityLoss) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-green-700 font-medium">
                      {c.productivityGain !== null ? formatCurrency(c.productivityGain) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {c.rulaCost !== null ? formatCurrency(c.rulaCost) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {c.netSavings !== null ? (
                        <span className={c.netSavings >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {formatCurrency(c.netSavings)}
                        </span>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Combined Total
                    <span className="block text-xs font-normal text-amber-700">Includes overlap</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatNumber(absenteeismResult.totalUntreatedPopulation)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatNumber(absenteeismResult.totalMissedDaysUntreated)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-red-600">
                    {formatCurrency(absenteeismResult.totalProductivityLossUntreated)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-green-700">
                    {formatCurrency(absenteeismResult.totalProductivityGain)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatCurrency(absenteeismResult.totalRulaTreatmentCost)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={absenteeismResult.netProductivitySavings >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                      {formatCurrency(absenteeismResult.netProductivitySavings)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-400 italic">
            Based on avg salary of {formatCurrency(absenteeismInputs.averageSalary)} and {absenteeismInputs.workdaysPerYear} workdays/year.
            Rula treatment: $130/session × 10 sessions = $1,300/person. {OVERLAP_DISCLAIMER}
          </p>
        </CardContent>
      </Card>

      {/* Treated vs Untreated Per-Person Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Treated vs Untreated: Per-Person Annual Cost</CardTitle>
        </CardHeader>
        <CardContent>
          {treatedVsUntreatedResults.length > 0 && (() => {
            const r = treatedVsUntreatedResults[0];
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Cost Component</th>
                      <th className="text-right py-3 px-4 font-medium text-red-600">Untreated</th>
                      <th className="text-right py-3 px-4 font-medium text-teal-600">Treated (Rula)</th>
                      <th className="text-right py-3 px-4 font-medium text-green-600">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">Incremental Medical Claims</td>
                      <td className="py-3 px-4 text-right text-red-700 font-medium">{formatCurrency(r.untreatedMedicalClaims)}</td>
                      <td className="py-3 px-4 text-right text-teal-700 font-medium">{formatCurrency(r.treatedMedicalClaims)}</td>
                      <td className="py-3 px-4 text-right text-green-700 font-medium">{formatCurrency(r.untreatedMedicalClaims - r.treatedMedicalClaims)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">Absenteeism / Productivity</td>
                      <td className="py-3 px-4 text-right text-red-700 font-medium">{formatCurrency(r.untreatedAbsenteeismCost)}</td>
                      <td className="py-3 px-4 text-right text-teal-700 font-medium">{formatCurrency(r.treatedAbsenteeismCost)}</td>
                      <td className="py-3 px-4 text-right text-green-700 font-medium">{formatCurrency(r.untreatedAbsenteeismCost - r.treatedAbsenteeismCost)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">Short-Term Disability</td>
                      <td className="py-3 px-4 text-right text-red-700 font-medium">{formatCurrency(r.untreatedStdCost)}</td>
                      <td className="py-3 px-4 text-right text-teal-700 font-medium">{formatCurrency(r.treatedStdCost)}</td>
                      <td className="py-3 px-4 text-right text-green-700 font-medium">{formatCurrency(r.untreatedStdCost - r.treatedStdCost)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">Rula Treatment Cost</td>
                      <td className="py-3 px-4 text-right text-gray-400">—</td>
                      <td className="py-3 px-4 text-right text-teal-700 font-medium">{formatCurrency(r.rulaTreatmentCost)}</td>
                      <td className="py-3 px-4 text-right text-gray-400">—</td>
                    </tr>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900">Total Per Person / Year</td>
                      <td className="py-3 px-4 text-right font-bold text-red-700">{formatCurrency(r.untreatedTotalCost)}</td>
                      <td className="py-3 px-4 text-right font-bold text-teal-700">{formatCurrency(r.treatedTotalCost)}</td>
                      <td className="py-3 px-4 text-right font-bold text-green-700">{formatCurrency(r.annualSavingsPerPerson)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Key Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle>Key Assumptions & Limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Assumptions</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Adult population estimated at {(clientInputs.adultPercentage * 100).toFixed(0)}% of covered members</li>
              <li>Employer-paid share of claims: {(clientInputs.employerPaidShare * 100).toFixed(0)}%</li>
              <li>
                Incremental cost benchmark: $10,000/year per untreated individual{' '}
                <Badge variant="warning" className="text-xs">Unverified</Badge>
              </li>
              <li>Untreated BH rate: ~57% (NIMH/NSDUH general population estimate)</li>
              {clientInputs.recoverableCostPercentage !== null && (
                <li>Recoverable cost percentage: {(clientInputs.recoverableCostPercentage * 100).toFixed(0)}%</li>
              )}
              <li>Average salary: {formatCurrency(absenteeismInputs.averageSalary)} / {absenteeismInputs.workdaysPerYear} workdays/year</li>
              <li>
                Rula treatment cost: $130/session × 10 avg sessions = $1,300/person{' '}
                <Badge variant="warning" className="text-xs">Pending Verification</Badge>
              </li>
              <li>Missed workdays: ~{absenteeismResult.missedDaysNoMh} (no MH), ~{absenteeismResult.missedDaysChronicUntreated} (chronic + untreated MH), ~{absenteeismResult.missedDaysChronicTreated} (chronic + treated MH)</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Important Limitations</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>All prevalence estimates are from national studies and may not match this specific population.</li>
              <li>Condition categories may overlap. Totals should not be summed across conditions.</li>
              <li>Financial projections are modeled associations, not guaranteed outcomes.</li>
              <li>The $10,000 cost benchmark has not been verified against the claimed source.</li>
              <li>BH comorbidity rates reflect depression only (not combined depression + anxiety).</li>
              <li>Scenario assumptions are hypothetical unless verified with Rula operational data.</li>
              <li>Absenteeism benchmarks are population averages (Kessler, Greenberg, Loeppke) and may not reflect this employer&apos;s workforce.</li>
              <li>Productivity loss assumes full daily cost for each missed day. Actual employer cost may vary.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Research Citations</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-500">
              {conditionBenchmarks
                .filter((b) => b.prevalenceSource)
                .map((b) => (
                  <li key={b.conditionId}>
                    {b.prevalenceSource!.publisher} ({b.prevalenceSource!.publicationYear}).{' '}
                    {b.prevalenceSource!.studyTitle}
                  </li>
                ))}
              {conditionBenchmarks
                .filter((b) => b.bhComorbiditySource)
                .map((b) => (
                  <li key={`bh-${b.conditionId}`}>
                    {b.bhComorbiditySource!.publisher} ({b.bhComorbiditySource!.publicationYear}).{' '}
                    {b.bhComorbiditySource!.studyTitle}
                  </li>
                ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Disclaimer variant="info">{FINANCIAL_DISCLAIMER}</Disclaimer>
    </div>
  );
}
