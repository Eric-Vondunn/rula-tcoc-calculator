'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { Disclaimer } from '@/components/shared/disclaimer';
import { formatNumber, formatPercent } from '@/lib/utils';
import { OVERLAP_DISCLAIMER } from '@/data/defaults';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function ComorbidityAnalysis() {
  const { derived } = useCalculator();
  const { populationResults } = derived;

  const chartData = populationResults
    .filter((r) => r.estimatedWithCondition !== null && r.estimatedWithBhComorbidity !== null)
    .map((r) => ({
      name: r.conditionName.length > 15
        ? r.conditionName.substring(0, 13) + '...'
        : r.conditionName,
      fullName: r.conditionName,
      withCondition: Math.round(r.estimatedWithCondition!),
      withBhComorbidity: Math.round(r.estimatedWithBhComorbidity!),
      untreated: r.estimatedUntreated !== null ? Math.round(r.estimatedUntreated) : null,
    }));

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

  return (
    <div className="space-y-6">
      {/* Aggregate Summary */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comorbidity Totals Across All Conditions</CardTitle>
          <CardDescription className="text-xs text-amber-700">
            Individuals may appear in multiple categories. These totals include overlap and do not represent unique individuals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total With Chronic Conditions</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatNumber(totalWithCondition)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total With BH Comorbidity</p>
              <p className="text-2xl font-bold text-indigo-700 tracking-tight">{formatNumber(totalWithBhComorbidity)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Est. Untreated</p>
              <p className="text-2xl font-bold text-teal-700 tracking-tight">{formatNumber(totalUntreated)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chronic Condition vs. Behavioral Health Comorbidity</CardTitle>
          <CardDescription>
            Estimated members with each chronic condition and the subset with co-occurring behavioral health conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ left: 20, right: 30, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  angle={-25}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickFormatter={(v: number) => formatNumber(v)}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatNumber(Number(value)),
                    name === 'withCondition'
                      ? 'With Condition'
                      : name === 'withBhComorbidity'
                        ? 'With BH Comorbidity'
                        : 'Untreated BH',
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  formatter={(value: string) =>
                    value === 'withCondition'
                      ? 'Chronic Condition'
                      : value === 'withBhComorbidity'
                        ? 'BH Comorbidity'
                        : 'Untreated BH'
                  }
                />
                <Bar dataKey="withCondition" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withBhComorbidity" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 italic py-8 text-center">
              Insufficient benchmark data for visualization.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Condition Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {populationResults.map((r) => (
          <Card key={r.conditionId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{r.conditionName}</CardTitle>
                {r.dataAvailable ? (
                  <Badge variant="default">Data Available</Badge>
                ) : (
                  <Badge variant="destructive">Benchmark Unavailable</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Condition Prevalence</p>
                    <p className="font-semibold text-gray-900">
                      {r.prevalenceRate !== null
                        ? formatPercent(r.prevalenceRate)
                        : 'Unavailable'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Est. With Condition</p>
                    <p className="font-semibold text-gray-900">
                      {r.estimatedWithCondition !== null
                        ? formatNumber(r.estimatedWithCondition)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">BH Comorbidity Rate</p>
                    <p className="font-semibold text-gray-900">
                      {r.bhComorbidityRate !== null
                        ? formatPercent(r.bhComorbidityRate)
                        : 'Unavailable'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Est. With BH Comorbidity</p>
                    <p className="font-semibold text-gray-900">
                      {r.estimatedWithBhComorbidity !== null
                        ? formatNumber(r.estimatedWithBhComorbidity)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Untreated Rate</p>
                    <p className="font-semibold text-gray-900">
                      {r.untreatedRate !== null
                        ? formatPercent(r.untreatedRate)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Est. Untreated</p>
                    <p className="font-semibold text-teal-700">
                      {r.estimatedUntreated !== null
                        ? formatNumber(r.estimatedUntreated)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {r.notes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {r.notes.map((note, i) => (
                      <p key={i} className="text-xs text-gray-400 mt-1">{note}</p>
                    ))}
                  </div>
                )}

                {/* Source info */}
                {r.bhComorbidityRate !== null && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                    <StatusBadge
                      status={r.dataAvailable ? 'pending_verification' : 'unavailable'}
                    />
                    <span className="text-xs text-gray-400">Pending source verification</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Disclaimer variant="warning">{OVERLAP_DISCLAIMER}</Disclaimer>
    </div>
  );
}
