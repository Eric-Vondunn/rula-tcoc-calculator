'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MetricCard } from '@/components/shared/metric-card';
import { NumberInput } from '@/components/shared/number-input';
import { Disclaimer } from '@/components/shared/disclaimer';
import { formatNumber } from '@/lib/utils';
import { Users, UserCheck, Heart } from 'lucide-react';
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

export function PopulationOverview() {
  const { state, derived, updateClientInputs } = useCalculator();
  const { clientInputs } = state;
  const { populationResults, adultMembers } = derived;

  const chartData = populationResults
    .filter((r) => r.estimatedWithCondition !== null)
    .map((r) => ({
      name: r.conditionName.length > 20
        ? r.conditionName.substring(0, 18) + '...'
        : r.conditionName,
      fullName: r.conditionName,
      members: Math.round(r.estimatedWithCondition!),
    }));

  // Aggregate totals (with overlap caveat)
  const totalWithCondition = populationResults.reduce(
    (sum, r) => sum + (r.estimatedWithCondition ?? 0), 0
  );
  const totalWithBhComorbidity = populationResults.reduce(
    (sum, r) => sum + (r.estimatedWithBhComorbidity ?? 0), 0
  );
  const totalUntreated = populationResults.reduce(
    (sum, r) => sum + (r.estimatedUntreated ?? 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Client Population Inputs</CardTitle>
          <CardDescription>
            Configure the covered population parameters for this analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumberInput
              label="Total Covered Members"
              value={clientInputs.totalCoveredMembers}
              onChange={(v) => updateClientInputs({ totalCoveredMembers: v ?? 1 })}
              min={1}
              max={10000000}
              step={1000}
              helpText="Employees and covered dependents"
            />
            <NumberInput
              label="Adult Members (%)"
              value={clientInputs.adultPercentage}
              onChange={(v) => updateClientInputs({ adultPercentage: v ?? 0.78 })}
              min={0}
              max={1}
              step={0.01}
              formatAsPercent
              suffix="%"
              helpText="Percentage of members age 18+"
              sourceLabel="Industry benchmark: ~78%"
            />
            <NumberInput
              label="Analysis Year"
              value={clientInputs.analysisYear}
              onChange={(v) => updateClientInputs({ analysisYear: v ?? new Date().getFullYear() })}
              min={2020}
              max={2030}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Covered Members"
          value={formatNumber(clientInputs.totalCoveredMembers)}
          icon={Users}
          iconColor="text-teal-600"
        />
        <MetricCard
          label="Estimated Adult Members"
          value={formatNumber(adultMembers)}
          subtitle={`${(clientInputs.adultPercentage * 100).toFixed(0)}% of total`}
          icon={UserCheck}
          iconColor="text-cyan-600"
        />
        <MetricCard
          label="Conditions Evaluated"
          value={populationResults.filter((r) => r.dataAvailable).length.toString()}
          subtitle={`of ${populationResults.length} categories`}
          icon={Heart}
          iconColor="text-indigo-600"
        />
      </div>

      {/* Aggregate Totals */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aggregate Totals Across All Conditions</CardTitle>
          <CardDescription className="text-xs text-amber-700">
            Individuals may appear in multiple condition categories. These totals include overlap and do not represent unique individuals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Est. With Chronic Conditions</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatNumber(totalWithCondition)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Est. With BH Comorbidity</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatNumber(totalWithBhComorbidity)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Est. Untreated BH</p>
              <p className="text-2xl font-bold text-teal-700 tracking-tight">{formatNumber(totalUntreated)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Population Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Members by Chronic Condition</CardTitle>
          <CardDescription>
            Based on national prevalence benchmarks applied to the eligible population.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => formatNumber(v)}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={180}
                  tick={{ fontSize: 12, fill: '#374151' }}
                />
                <Tooltip
                  formatter={(value) => [formatNumber(Number(value)), 'Est. Members']}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.name === String(label));
                    return item?.fullName ?? String(label);
                  }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="members" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 italic py-8 text-center">
              No condition benchmarks available for the current population.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Condition Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Condition Prevalence Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Condition</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Prevalence</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Eligible Pop.</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Est. Members</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Denominator</th>
                </tr>
              </thead>
              <tbody>
                {populationResults.map((r) => (
                  <tr key={r.conditionId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{r.conditionName}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {r.prevalenceRate !== null
                        ? `${(r.prevalenceRate * 100).toFixed(1)}%`
                        : <span className="text-gray-400 italic">Unavailable</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatNumber(r.eligiblePopulation)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {r.estimatedWithCondition !== null
                        ? formatNumber(r.estimatedWithCondition)
                        : <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {r.conditionId === 'specialty_rx_glp1'
                        ? 'Client data required'
                        : r.prevalenceRate !== null
                          ? (populationResults.find(p => p.conditionId === r.conditionId)?.eligiblePopulation === adultMembers ? 'Adult members' : 'Total members')
                          : '—'}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Combined Total
                    <span className="block text-xs font-normal text-amber-700">Includes overlap</span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">—</td>
                  <td className="py-3 px-4 text-right text-gray-400">—</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatNumber(totalWithCondition)}
                  </td>
                  <td className="py-3 px-4 text-xs text-amber-700 italic">Not deduplicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Disclaimer variant="info">
        Population estimates are based on national prevalence benchmarks and may not reflect the
        specific demographics or health profile of any individual employer population. Actual
        prevalence may vary based on industry, geography, age mix, and plan design.
      </Disclaimer>
    </div>
  );
}
