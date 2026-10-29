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
  const { clientInputs } = state;
  const { populationResults, financialResults, scenarioResults, adultMembers } = derived;

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

  const generateNarrative = (): string => {
    const condCount = availableConditions.length;
    const totalMembers = formatNumber(clientInputs.totalCoveredMembers);

    let narrative = `Based on national population health benchmarks, an employer with ${totalMembers} covered members may have a meaningful population experiencing co-occurring chronic physical and behavioral health conditions across ${condCount} evaluated condition categories.`;

    narrative += ' Improving access to appropriate behavioral health treatment may offer opportunities to reduce medical utilization and associated spending.';

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
