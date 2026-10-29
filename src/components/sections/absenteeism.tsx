'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NumberInput } from '@/components/shared/number-input';
import { Disclaimer } from '@/components/shared/disclaimer';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { OVERLAP_DISCLAIMER, PRODUCTIVITY_DISCLAIMER } from '@/data/defaults';
import { absenteeismBenchmarks } from '@/data/defaults';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

const COLORS = {
  untreated: '#dc2626',
  treated: '#059669',
  noMh: '#94a3b8',
  rula: '#0d9488',
};

export function Absenteeism() {
  const { state, derived, updateAbsenteeismInputs } = useCalculator();
  const { absenteeismInputs } = state;
  const { absenteeismResult, treatedVsUntreatedResults } = derived;
  const ar = absenteeismResult;

  const rulaCostPerPerson = absenteeismBenchmarks.rulaCostPerSession * absenteeismBenchmarks.rulaAvgSessions;

  // Chart: days missed comparison
  const daysChartData = [
    { name: 'No MH Condition', days: ar.missedDaysNoMh, fill: COLORS.noMh },
    { name: 'MH Condition (Untreated)', days: ar.missedDaysUntreatedMh, fill: COLORS.untreated },
    { name: 'MH Condition (Treated)', days: ar.missedDaysTreatedMh, fill: COLORS.treated },
    { name: 'Chronic + Untreated MH', days: ar.missedDaysChronicUntreated, fill: '#b91c1c' },
    { name: 'Chronic + Treated MH', days: ar.missedDaysChronicTreated, fill: COLORS.rula },
  ];

  // Chart: per-condition productivity loss
  const conditionChartData = ar.conditionBreakdown
    .filter((c) => c.productivityLoss !== null)
    .map((c) => ({
      name: c.conditionName.length > 18 ? c.conditionName.substring(0, 16) + '...' : c.conditionName,
      fullName: c.conditionName,
      loss: Math.round(c.productivityLoss!),
      gain: Math.round(c.productivityGain ?? 0),
    }));

  return (
    <div className="space-y-6">
      <Disclaimer variant="info">{PRODUCTIVITY_DISCLAIMER}</Disclaimer>

      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Workforce Assumptions</CardTitle>
          <CardDescription>
            Configure salary and workday assumptions to quantify productivity impact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumberInput
              label="Average Annual Salary"
              value={absenteeismInputs.averageSalary}
              onChange={(v) => updateAbsenteeismInputs({ averageSalary: v ?? 75000 })}
              min={20000}
              max={500000}
              step={5000}
              prefix="$"
              helpText="Average across all covered employees"
            />
            <NumberInput
              label="Workdays per Year"
              value={absenteeismInputs.workdaysPerYear}
              onChange={(v) => updateAbsenteeismInputs({ workdaysPerYear: v ?? 250 })}
              min={200}
              max={265}
              step={1}
              helpText="Standard: 250 days"
            />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Daily Cost per Employee</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(ar.dailyCost)}</p>
              <p className="text-xs text-gray-400">Salary / workdays</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days Missed Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Workdays Missed per Year — By Mental Health Status</CardTitle>
          <CardDescription>
            Comparison of average annual workdays missed based on mental health and chronic condition status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500">No MH Condition</p>
                <p className="text-3xl font-bold text-gray-400 mt-1">{ar.missedDaysNoMh}</p>
                <p className="text-xs text-gray-400 mt-1">days / year</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm text-red-700">With MH (Untreated)</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{ar.missedDaysUntreatedMh}</p>
                <p className="text-xs text-red-400 mt-1">days / year ({((ar.missedDaysUntreatedMh / ar.missedDaysNoMh)).toFixed(1)}x baseline)</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm text-emerald-700">With MH (Treated)</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{ar.missedDaysTreatedMh}</p>
                <p className="text-xs text-emerald-400 mt-1">days / year</p>
              </div>
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-center">
                <p className="text-sm text-red-800">Chronic + Untreated MH</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{ar.missedDaysChronicUntreated}</p>
                <p className="text-xs text-red-400 mt-1">days / year ({((ar.missedDaysChronicUntreated / ar.missedDaysNoMh)).toFixed(1)}x baseline)</p>
              </div>
            </div>
            {/* Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={daysChartData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }} />
                <Tooltip formatter={(value) => [`${value} days`, 'Missed Workdays']} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                  {daysChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Treated vs Untreated Per-Person Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Treated vs. Untreated — Annual Per-Person Cost Breakdown</CardTitle>
          <CardDescription>
            Incremental annual cost for an individual with a chronic condition and co-occurring behavioral health condition, comparing untreated vs. treated with Rula.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Cost Component</th>
                  <th className="text-right py-3 px-3 font-medium text-red-600">Untreated</th>
                  <th className="text-right py-3 px-3 font-medium text-emerald-600">Treated (with Rula)</th>
                  <th className="text-right py-3 px-3 font-medium text-teal-600">Savings</th>
                </tr>
              </thead>
              <tbody>
                {treatedVsUntreatedResults.length > 0 && (() => {
                  const r = treatedVsUntreatedResults[0]; // Use first available as representative
                  return (
                    <>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-3 text-gray-700">Incremental Medical Claims</td>
                        <td className="py-3 px-3 text-right font-semibold text-red-600">{formatCurrency(r.untreatedMedicalClaims)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-600">{formatCurrency(r.treatedMedicalClaims)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-teal-600">{formatCurrency(r.untreatedMedicalClaims - r.treatedMedicalClaims)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-3 text-gray-700">Absenteeism (Lost Productivity)</td>
                        <td className="py-3 px-3 text-right font-semibold text-red-600">{formatCurrency(r.untreatedAbsenteeismCost)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-600">{formatCurrency(r.treatedAbsenteeismCost)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-teal-600">{formatCurrency(r.untreatedAbsenteeismCost - r.treatedAbsenteeismCost)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-3 text-gray-700">Short-Term Disability</td>
                        <td className="py-3 px-3 text-right font-semibold text-red-600">{formatCurrency(r.untreatedStdCost)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-600">{formatCurrency(r.treatedStdCost)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-teal-600">{formatCurrency(r.untreatedStdCost - r.treatedStdCost)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-3 text-gray-700">Rula Treatment Cost</td>
                        <td className="py-3 px-3 text-right text-gray-400">$0</td>
                        <td className="py-3 px-3 text-right font-semibold text-amber-600">{formatCurrency(r.rulaTreatmentCost)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-amber-600">({formatCurrency(r.rulaTreatmentCost)})</td>
                      </tr>
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td className="py-3 px-3 font-bold text-gray-900">Total Annual Cost Per Person</td>
                        <td className="py-3 px-3 text-right font-bold text-red-700">{formatCurrency(r.untreatedTotalCost)}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700">{formatCurrency(r.treatedTotalCost)}</td>
                        <td className="py-3 px-3 text-right font-bold text-teal-700">{formatCurrency(r.annualSavingsPerPerson)}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-2">
              <span className="text-teal-700 font-medium">Rula Cost: </span>
              <span className="font-bold text-teal-800">
                {formatCurrency(absenteeismBenchmarks.rulaCostPerSession)} x {absenteeismBenchmarks.rulaAvgSessions} sessions = {formatCurrency(rulaCostPerPerson)}/person
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Population-Level Productivity Impact */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/50 to-white">
        <CardHeader className="pb-2">
          <CardTitle>Population-Level Productivity Impact</CardTitle>
          <CardDescription className="text-xs text-amber-700">
            Combined totals include population overlap across conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Untreated Population</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(ar.totalUntreatedPopulation)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Excess Days Lost</p>
              <p className="text-2xl font-bold text-red-600">{formatNumber(ar.totalMissedDaysUntreated)}</p>
              <p className="text-xs text-gray-400">above baseline</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Productivity Loss</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(ar.totalProductivityLossUntreated)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Rula Investment</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(ar.totalRulaTreatmentCost)}</p>
              <p className="text-xs text-gray-400">{formatCurrency(rulaCostPerPerson)}/person</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Productivity Recovered</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(ar.totalProductivityGain)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Net Productivity Savings</p>
              <p className={`text-2xl font-bold ${ar.netProductivitySavings >= 0 ? 'text-teal-700' : 'text-red-600'}`}>
                {formatCurrency(ar.netProductivitySavings)}
              </p>
              <p className="text-xs text-gray-400">After Rula investment</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Days Recovered</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatNumber(ar.totalMissedDaysUntreated - ar.totalMissedDaysAfterTreatment)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Productivity ROI</p>
              <p className="text-2xl font-bold text-teal-700">
                {ar.totalRulaTreatmentCost > 0
                  ? `${((ar.totalProductivityGain / ar.totalRulaTreatmentCost)).toFixed(1)}x`
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-400">Gain / investment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Condition Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Impact by Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Condition</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Untreated</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Excess Days Lost</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Productivity Loss</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Rula Cost</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Productivity Gain</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Net Savings</th>
                </tr>
              </thead>
              <tbody>
                {ar.conditionBreakdown.map((c) => (
                  <tr key={c.conditionId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">{c.conditionName}</td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {c.untreatedCount !== null ? formatNumber(c.untreatedCount) : <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="py-3 px-3 text-right text-red-600">
                      {c.totalMissedDays !== null ? formatNumber(c.totalMissedDays) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-red-700">
                      {c.productivityLoss !== null ? formatCurrency(c.productivityLoss) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-600">
                      {c.rulaCost !== null ? formatCurrency(c.rulaCost) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600">
                      {c.productivityGain !== null ? formatCurrency(c.productivityGain) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      {c.netSavings !== null ? (
                        <span className={c.netSavings >= 0 ? 'text-teal-700' : 'text-red-600'}>
                          {formatCurrency(c.netSavings)}
                        </span>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
                {/* Totals */}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-900">
                    Combined Total
                    <span className="block text-xs font-normal text-amber-700">Includes overlap</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">{formatNumber(ar.totalUntreatedPopulation)}</td>
                  <td className="py-3 px-3 text-right font-bold text-red-600">{formatNumber(ar.totalMissedDaysUntreated)}</td>
                  <td className="py-3 px-3 text-right font-bold text-red-700">{formatCurrency(ar.totalProductivityLossUntreated)}</td>
                  <td className="py-3 px-3 text-right font-bold text-amber-600">{formatCurrency(ar.totalRulaTreatmentCost)}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">{formatCurrency(ar.totalProductivityGain)}</td>
                  <td className="py-3 px-3 text-right font-bold">
                    <span className={ar.netProductivitySavings >= 0 ? 'text-teal-700' : 'text-red-600'}>
                      {formatCurrency(ar.netProductivitySavings)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Condition productivity chart */}
      {conditionChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productivity Loss vs. Recovery by Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={conditionChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `$${(Math.abs(v) / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12, fill: '#374151' }} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}
                />
                <Legend />
                <Bar dataKey="loss" name="Productivity Loss" fill="#dc2626" radius={[0, 4, 4, 0]} />
                <Bar dataKey="gain" name="Productivity Gain (with Rula)" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Disclaimer variant="warning">{OVERLAP_DISCLAIMER}</Disclaimer>
    </div>
  );
}
