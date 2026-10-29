'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MetricCard } from '@/components/shared/metric-card';
import { NumberInput } from '@/components/shared/number-input';
import { Disclaimer } from '@/components/shared/disclaimer';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { OVERLAP_DISCLAIMER, UNVERIFIED_COST_DISCLAIMER } from '@/data/defaults';
import { DollarSign, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#0d9488', '#0891b2', '#6366f1', '#d97706', '#059669', '#94a3b8'];

export function FinancialImpact() {
  const { state, derived, updateClientInputs } = useCalculator();
  const { clientInputs } = state;
  const { financialResults, treatedVsUntreatedResults } = derived;

  // Aggregate totals
  const totalUntreated = financialResults.reduce(
    (sum, r) => sum + (r.untreatedCount ?? 0), 0
  );
  const totalModeledSpending = financialResults.reduce(
    (sum, r) => sum + (r.modeledAnnualSpending ?? 0), 0
  );
  const totalAvoidableSpending = financialResults.reduce(
    (sum, r) => sum + (r.potentiallyAvoidableSpending ?? 0), 0
  );
  const hasAvoidable = financialResults.some((r) => r.potentiallyAvoidableSpending !== null);

  // Population-level savings by component
  const totalMedicalSavings = treatedVsUntreatedResults.reduce(
    (sum, r) => sum + ((r.untreatedPopulation ?? 0) * (r.untreatedMedicalClaims - r.treatedMedicalClaims)), 0
  );
  const totalAbsenteeismSavings = treatedVsUntreatedResults.reduce(
    (sum, r) => sum + ((r.untreatedPopulation ?? 0) * (r.untreatedAbsenteeismCost - r.treatedAbsenteeismCost)), 0
  );
  const totalStdSavings = treatedVsUntreatedResults.reduce(
    (sum, r) => sum + ((r.untreatedPopulation ?? 0) * (r.untreatedStdCost - r.treatedStdCost)), 0
  );
  const totalRulaCost = treatedVsUntreatedResults.reduce(
    (sum, r) => sum + ((r.untreatedPopulation ?? 0) * r.rulaTreatmentCost), 0
  );
  const totalGrossSavings = totalMedicalSavings + totalAbsenteeismSavings + totalStdSavings;
  const totalNetAllComponents = totalGrossSavings - totalRulaCost;

  const chartData = financialResults
    .filter((r) => r.modeledAnnualSpending !== null)
    .map((r) => ({
      name: r.conditionName.length > 18
        ? r.conditionName.substring(0, 16) + '...'
        : r.conditionName,
      fullName: r.conditionName,
      spending: Math.round(r.modeledAnnualSpending!),
    }));

  return (
    <div className="space-y-6">
      {/* Unverified Source Warning */}
      <Disclaimer variant="caution">
        <div className="flex items-start gap-2">
          <div>
            <p className="font-semibold">Unverified Cost Benchmark</p>
            <p className="mt-1">{UNVERIFIED_COST_DISCLAIMER}</p>
          </div>
        </div>
      </Disclaimer>

      {/* Assumptions Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Assumptions</CardTitle>
          <CardDescription>
            Configure the cost model parameters. All values are user-configurable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Cost Benchmark</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-gray-900">$10,000</p>
                <StatusBadge status="unverified" label="Unverified" />
              </div>
              <p className="text-xs text-gray-400">Annual incremental cost per untreated individual</p>
            </div>
            <NumberInput
              label="Employer-Paid Share"
              value={clientInputs.employerPaidShare}
              onChange={(v) => updateClientInputs({ employerPaidShare: v ?? 0.80 })}
              min={0}
              max={1}
              step={0.01}
              formatAsPercent
              suffix="%"
              helpText="Share of allowed claims paid by employer"
            />
            <NumberInput
              label="Recoverable Cost %"
              value={clientInputs.recoverableCostPercentage}
              onChange={(v) => updateClientInputs({ recoverableCostPercentage: v })}
              min={0}
              max={1}
              step={0.01}
              formatAsPercent
              suffix="%"
              allowNull
              placeholder="Not set"
              helpText="Hypothetical share of costs reducible through treatment"
            />
          </div>
        </CardContent>
      </Card>

      {/* Aggregate Financial Totals */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aggregate Financial Impact</CardTitle>
          <CardDescription className="text-xs text-amber-700">
            Combined totals across all conditions. Includes population overlap — do not interpret as deduplicated employer-wide cost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Untreated (All Conditions)</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatNumber(totalUntreated)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Modeled Annual Spending</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalModeledSpending)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Potentially Avoidable</p>
              {hasAvoidable ? (
                <p className="text-2xl font-bold text-teal-700 tracking-tight">{formatCurrency(totalAvoidableSpending)}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Set recoverable % to calculate</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Savings by Component */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Projected Annual Savings (Treated vs Untreated)</CardTitle>
          <CardDescription className="text-xs text-amber-700">
            Population-level savings if untreated BH individuals received treatment. Includes overlap across conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Medical Claims</p>
              <p className="text-xl font-bold text-green-700 tracking-tight">{formatCurrency(totalMedicalSavings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Absenteeism</p>
              <p className="text-xl font-bold text-green-700 tracking-tight">{formatCurrency(totalAbsenteeismSavings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Short-Term Disability</p>
              <p className="text-xl font-bold text-green-700 tracking-tight">{formatCurrency(totalStdSavings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Gross Savings</p>
              <p className="text-xl font-bold text-green-700 tracking-tight">{formatCurrency(totalGrossSavings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Rula Investment</p>
              <p className="text-xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalRulaCost)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Net Savings</p>
              <p className={`text-xl font-bold tracking-tight ${totalNetAllComponents >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {formatCurrency(totalNetAllComponents)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treated vs Untreated Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-teal-600" />
            Treated vs Untreated: Per-Person Annual Cost
          </CardTitle>
          <CardDescription>
            Per-person annual cost breakdown comparing untreated behavioral health comorbidity vs treatment
            through Rula. Includes medical claims, absenteeism, and short-term disability components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500" rowSpan={2}>Cost Component</th>
                  <th className="text-center py-2 px-3 font-medium text-red-600 border-b border-red-100" colSpan={1}>Untreated</th>
                  <th className="text-center py-2 px-3 font-medium text-teal-600 border-b border-teal-100" colSpan={1}>Treated (with Rula)</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500" rowSpan={2}>Savings</th>
                </tr>
              </thead>
              <tbody>
                {treatedVsUntreatedResults.length > 0 && (() => {
                  // Use first condition as representative per-person costs (benchmarks are the same across conditions)
                  const r = treatedVsUntreatedResults[0];
                  const rows = [
                    {
                      label: 'Incremental Medical Claims',
                      untreated: r.untreatedMedicalClaims,
                      treated: r.treatedMedicalClaims,
                    },
                    {
                      label: 'Absenteeism / Productivity Loss',
                      untreated: r.untreatedAbsenteeismCost,
                      treated: r.treatedAbsenteeismCost,
                    },
                    {
                      label: 'Short-Term Disability',
                      untreated: r.untreatedStdCost,
                      treated: r.treatedStdCost,
                    },
                  ];
                  const untreatedTotal = r.untreatedTotalCost;
                  const treatedTotal = r.treatedTotalCost;

                  return (
                    <>
                      {rows.map((row) => (
                        <tr key={row.label} className="border-b border-gray-100">
                          <td className="py-3 px-3 text-gray-700">{row.label}</td>
                          <td className="py-3 px-3 text-right text-red-700 font-medium">
                            {formatCurrency(row.untreated)}
                          </td>
                          <td className="py-3 px-3 text-right text-teal-700 font-medium">
                            {formatCurrency(row.treated)}
                          </td>
                          <td className="py-3 px-3 text-right text-green-700 font-medium">
                            {formatCurrency(row.untreated - row.treated)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-3 text-gray-700">Rula Treatment Cost</td>
                        <td className="py-3 px-3 text-right text-gray-400">—</td>
                        <td className="py-3 px-3 text-right text-teal-700 font-medium">
                          {formatCurrency(r.rulaTreatmentCost)}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-400">—</td>
                      </tr>
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td className="py-3 px-3 font-bold text-gray-900">Total Per Person / Year</td>
                        <td className="py-3 px-3 text-right font-bold text-red-700">
                          {formatCurrency(untreatedTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-teal-700">
                          {formatCurrency(treatedTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-green-700">
                          {formatCurrency(r.annualSavingsPerPerson)}
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            All per-person costs are incremental (above baseline for individuals without behavioral health conditions).
            Rula treatment cost: $130/session × 10 avg sessions = $1,300 per person.
          </p>
        </CardContent>
      </Card>

      {/* Population-Level Savings by Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Population-Level Savings Opportunity
          </CardTitle>
          <CardDescription>
            Projected annual savings per condition if untreated individuals received Rula behavioral health treatment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Condition</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Untreated Pop.</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Savings/Person</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Total Savings</th>
                </tr>
              </thead>
              <tbody>
                {treatedVsUntreatedResults.map((r) => (
                  <tr key={r.conditionId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">{r.conditionName}</td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {r.untreatedPopulation !== null
                        ? formatNumber(r.untreatedPopulation)
                        : <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="py-3 px-3 text-right text-green-700 font-medium">
                      {formatCurrency(r.annualSavingsPerPerson)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-green-700">
                      {r.populationSavings !== null
                        ? formatCurrency(r.populationSavings)
                        : <span className="text-gray-400 italic">N/A</span>}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-900">
                    Combined Total
                    <span className="block text-xs font-normal text-amber-700">Includes overlap</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    {formatNumber(treatedVsUntreatedResults.reduce(
                      (sum, r) => sum + (r.untreatedPopulation ?? 0), 0
                    ))}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-400">—</td>
                  <td className="py-3 px-3 text-right font-bold text-green-700">
                    {formatCurrency(treatedVsUntreatedResults.reduce(
                      (sum, r) => sum + (r.populationSavings ?? 0), 0
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Modeled Annual Spending Associated With Untreated Comorbidity</CardTitle>
          <CardDescription>
            Per-condition estimates. These are modeled associations, not guaranteed savings or proven causal effects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={180}
                  tick={{ fontSize: 12, fill: '#374151' }}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Modeled Spending']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="spending" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 italic py-8 text-center">
              No financial data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Financial Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Impact by Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Condition</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Untreated Count</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Cost/Person</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Modeled Spending</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Potentially Avoidable</th>
                </tr>
              </thead>
              <tbody>
                {financialResults.map((r) => (
                  <tr key={r.conditionId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{r.conditionName}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {r.untreatedCount !== null
                        ? formatNumber(r.untreatedCount)
                        : <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatCurrency(r.incrementalCostPerPerson)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {r.modeledAnnualSpending !== null
                        ? formatCurrency(r.modeledAnnualSpending)
                        : <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-teal-700 font-semibold">
                      {r.potentiallyAvoidableSpending !== null
                        ? formatCurrency(r.potentiallyAvoidableSpending)
                        : <span className="text-gray-400 italic text-xs">Set recoverable %</span>}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Combined Total
                    <span className="block text-xs font-normal text-amber-700">Includes overlap</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatNumber(totalUntreated)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">—</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatCurrency(totalModeledSpending)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-teal-700">
                    {hasAvoidable
                      ? formatCurrency(totalAvoidableSpending)
                      : <span className="text-gray-400 italic text-xs">Set recoverable %</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Disclaimer variant="warning">{OVERLAP_DISCLAIMER}</Disclaimer>

      <Disclaimer variant="info">
        The recoverable cost percentage represents a hypothetical share of associated costs that might
        be reduced through effective behavioral health treatment. It is not an expected or guaranteed
        outcome. If not set, potentially avoidable spending is not calculated.
      </Disclaimer>
    </div>
  );
}
