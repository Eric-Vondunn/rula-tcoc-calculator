'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { Separator } from '@/components/ui/separator';
import { conditionBenchmarks, sources } from '@/data/benchmarks';
import type { BenchmarkSource } from '@/types';

function SourceCard({ source }: { source: BenchmarkSource }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-900">{source.studyTitle}</h4>
        <StatusBadge status={source.approvalStatus} />
      </div>
      <p className="text-xs text-gray-500">{source.publisher} ({source.publicationYear})</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="text-gray-400">Statistic: </span>
          <span className="text-gray-700">
            {source.exactStatistic !== null
              ? source.exactStatistic < 1
                ? `${(source.exactStatistic * 100).toFixed(1)}%`
                : source.exactStatistic.toLocaleString()
              : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Age Range: </span>
          <span className="text-gray-700">{source.ageRange}</span>
        </div>
        <div>
          <span className="text-gray-400">Numerator: </span>
          <span className="text-gray-700">{source.numeratorDefinition}</span>
        </div>
        <div>
          <span className="text-gray-400">Denominator: </span>
          <span className="text-gray-700">{source.denominatorDefinition}</span>
        </div>
        <div>
          <span className="text-gray-400">Population: </span>
          <span className="text-gray-700">{source.insurancePopulation}</span>
        </div>
        <div>
          <span className="text-gray-400">Geography: </span>
          <span className="text-gray-700">{source.geographicScope}</span>
        </div>
        <div>
          <span className="text-gray-400">Period: </span>
          <span className="text-gray-700">{source.observationPeriod}</span>
        </div>
        <div>
          <span className="text-gray-400">Type: </span>
          <span className="text-gray-700">
            {source.evidenceType} / {source.causalityType}
          </span>
        </div>
      </div>
      {source.sourceUrl && (
        <p className="text-xs">
          <span className="text-gray-400">URL: </span>
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline break-all"
          >
            {source.sourceUrl}
          </a>
        </p>
      )}
      {source.doi && (
        <p className="text-xs">
          <span className="text-gray-400">DOI: </span>
          <span className="text-gray-700">{source.doi}</span>
        </p>
      )}
      <p className="text-xs text-gray-400">
        Verified: {source.dateVerified ?? 'Pending verification'}
      </p>
    </div>
  );
}

export function Methodology() {
  const uniqueSources = Object.values(sources);

  return (
    <div className="space-y-6">
      {/* Methodology Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Research & Methodology</CardTitle>
          <CardDescription>
            Detailed documentation of data sources, calculation methodology, and benchmark definitions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Calculation Methodology</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>For each chronic condition category <em>i</em>:</p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs space-y-1">
                <p>E_i = Eligible population (adult or total members based on benchmark denominator)</p>
                <p>C_i = E_i &times; P_i &nbsp;&nbsp;&nbsp;(estimated individuals with condition)</p>
                <p>M_i = C_i &times; B_i &nbsp;&nbsp;&nbsp;(estimated with BH comorbidity)</p>
                <p>T_i = M_i &times; U_i &nbsp;&nbsp;&nbsp;(estimated untreated)</p>
                <p>F_i = T_i &times; K &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(modeled annual associated spending)</p>
              </div>
              <p className="mt-2">Where:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>P_i = Condition prevalence in the eligible population</li>
                <li>B_i = Behavioral health comorbidity prevalence among those with the condition</li>
                <li>U_i = Proportion of the comorbid population with untreated BH needs</li>
                <li>K = Annual incremental medical spending assumption per untreated individual</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                All intermediate calculations use unrounded values. Rounding is applied only for display.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">ROI Scenario Model</h3>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs space-y-1">
              <p>Reached_i = T_i &times; OutreachRate</p>
              <p>Initiated_i = Reached_i &times; InitiationRate</p>
              <p>Completed_i = Initiated_i &times; CompletionRate</p>
              <p>TreatmentCost_i = Initiated_i &times; AvgVisits &times; CostPerVisit</p>
              <p>GrossSavings_i = SavingsEligible_i &times; SavingsPerMember</p>
              <p>NetSavings_i = GrossSavings_i - TreatmentCost_i - AdminCost_i</p>
              <p>NetROI_i = NetSavings_i / (TreatmentCost_i + AdminCost_i)</p>
              <p>BCR_i = GrossSavings_i / (TreatmentCost_i + AdminCost_i)</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Key Methodological Notes</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>
                <strong>Depression and anxiety are NOT summed.</strong> Each BH comorbidity rate
                represents a single defined outcome (typically depression alone) as reported in the
                source study.
              </li>
              <li>
                <strong>Population overlap.</strong> Individuals may belong to multiple condition
                categories. Category estimates must not be summed for unique counts or total costs.
              </li>
              <li>
                <strong>Adult-specific denominators.</strong> Conditions like diabetes and CVD use
                adult-only prevalence rates. These are applied to the estimated adult population, not
                total covered members.
              </li>
              <li>
                <strong>GLP-1/Specialty Rx.</strong> This is a utilization cohort, not a single diagnosis.
                No universal BH comorbidity benchmark is applied. Client-specific data is required.
              </li>
              <li>
                <strong>Untreated rate.</strong> The 57% untreated rate is a general population estimate
                (NIMH/NSDUH) applied uniformly. Condition-specific treatment gaps may differ.
              </li>
              <li>
                <strong>Associated vs. avoidable costs.</strong> Modeled spending represents an
                association, not a causal or fully avoidable cost. The recoverable percentage is a
                user-defined assumption.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Condition Benchmark Details */}
      <Card>
        <CardHeader>
          <CardTitle>Condition Benchmark Definitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditionBenchmarks.map((cb) => (
            <div key={cb.conditionId} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900">{cb.conditionName}</h4>
                {cb.prevalenceRate !== null ? (
                  <Badge variant="default">Benchmarked</Badge>
                ) : (
                  <Badge variant="destructive">Unavailable</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">{cb.clinicalDefinition}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Prevalence: </span>
                  {cb.prevalenceRate !== null
                    ? `${(cb.prevalenceRate * 100).toFixed(1)}% (${cb.prevalenceDenominator.replace('_', ' ')})`
                    : 'Unavailable'}
                </div>
                <div>
                  <span className="font-medium">BH Comorbidity: </span>
                  {cb.bhComorbidityRate !== null
                    ? `${(cb.bhComorbidityRate * 100).toFixed(1)}%`
                    : 'Unavailable'}
                </div>
              </div>
              <p className="text-xs text-gray-500">{cb.bhDefinition}</p>
              <p className="text-xs text-gray-400 italic">{cb.notes}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Source Library */}
      <Card>
        <CardHeader>
          <CardTitle>Source Library</CardTitle>
          <CardDescription>
            All research sources used in this analysis, with verification status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uniqueSources.map((source) => (
            <SourceCard key={source.sourceId} source={source} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
