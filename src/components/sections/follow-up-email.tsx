'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { CopyableEmail } from '@/components/shared/copyable-email';

// ============================================================
// Types
// ============================================================

export interface QuarterDate {
  quarter: string;
  moment: string;
  date: Date | null;
  confirmed: boolean;
}

export interface FollowUpEmailProps {
  clientName: string;
  /** Employees, or total covered members, depending on the selected basis. */
  analysisPopulation: number;
  /** "employees" | "covered members" */
  populationLabel: string;
  analysisYear: number;
  adultMembers: number;
  totalWithCondition: number;
  totalWithBhComorbidity: number;
  totalUntreated: number;
  totalModeledSpending: number;
  totalNetSavingsAllComponents: number;
  totalMedicalSavings: number;
  totalAbsenteeismSavings: number;
  totalStdSavings: number;
  totalGrossSavingsAllComponents: number;
  totalRulaCost: number;
  totalUntreatedPopulation: number;
  missedDaysChronicUntreated: number;
  annualSavingsPerPerson: number;
  headcount: number;
  projectedCareStarts: number;
  projectedCostAddressed: number;
  engagementMultiplier: number;
  selectedChannelCount: number;
  selectedChannelNames: string[];
  quarterDates: QuarterDate[];
}

type EmailVersion = 'consultant' | 'employer';

// ============================================================
// Email generation
// ============================================================

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function generateConsultantEmail(p: FollowUpEmailProps): { subject: string; body: string } {
  const subject = `Behavioral Health Total Cost of Care Analysis — ${p.clientName}`;

  const lines: string[] = [];

  lines.push(`Hi [first name],`);
  lines.push('');
  lines.push(`Following our review of ${p.clientName}'s behavioral health data, I wanted to share a summary of the key findings from our Total Cost of Care analysis.`);
  lines.push('');

  // Population overview
  lines.push('POPULATION OVERVIEW');
  lines.push('---');
  lines.push(`Across your ${formatNumber(p.analysisPopulation)} ${p.populationLabel}, our analysis identified an estimated ${formatNumber(p.totalWithBhComorbidity)} individuals with co-occurring chronic physical and behavioral health conditions, of whom approximately ${formatNumber(p.totalUntreated)} may not be receiving adequate behavioral health treatment.`);
  lines.push('');
  lines.push(`This untreated population is associated with ${formatCurrency(p.totalModeledSpending)} in combined modeled annual spending.`);
  lines.push('');

  // Financial impact
  lines.push('FINANCIAL IMPACT');
  lines.push('---');
  lines.push('If this untreated population were to receive evidence-based behavioral health care, the projected savings across all cost components are:');
  lines.push('');
  lines.push(`  • Medical claims savings: ${formatCurrency(p.totalMedicalSavings)}`);
  lines.push(`  • Absenteeism / productivity savings: ${formatCurrency(p.totalAbsenteeismSavings)}`);
  lines.push(`  • Short-term disability savings: ${formatCurrency(p.totalStdSavings)}`);
  lines.push(`  • Gross savings (all components): ${formatCurrency(p.totalGrossSavingsAllComponents)}`);
  lines.push(`  • Rula treatment investment: ${formatCurrency(p.totalRulaCost)}`);
  lines.push(`  • Net savings (after treatment cost): ${formatCurrency(p.totalNetSavingsAllComponents)}`);
  lines.push('');
  lines.push(`On a per-person basis, treated individuals show an estimated ${formatCurrency(p.annualSavingsPerPerson)} in annual savings compared to untreated peers.`);
  lines.push('');

  // Productivity
  lines.push('PRODUCTIVITY NOTE');
  lines.push('---');
  lines.push(`Individuals with untreated behavioral health conditions combined with a chronic condition miss approximately ${p.missedDaysChronicUntreated} workdays per year. The ${formatNumber(p.totalUntreatedPopulation)} untreated individuals in this analysis represent a significant productivity exposure for ${p.clientName}.`);
  lines.push('');

  // Engagement plan
  if (p.selectedChannelCount > 0) {
    lines.push('PROPOSED ENGAGEMENT PLAN');
    lines.push('---');
    lines.push(`Based on our engagement modeling for ${formatNumber(p.headcount)} benefits-eligible employees, a ${p.selectedChannelCount}-channel approach is projected to generate ${formatNumber(p.projectedCareStarts)} care starts, addressing approximately ${formatCurrency(p.projectedCostAddressed)} in annual cost exposure (${p.engagementMultiplier.toFixed(1)}x multiplier vs employer communications alone).`);
    lines.push('');
    lines.push(`Selected channels: ${p.selectedChannelNames.join(', ')}.`);
    lines.push('');

    const datesSet = p.quarterDates.filter((q) => q.date);
    if (datesSet.length > 0) {
      lines.push('Proposed quarterly campaign plan:');
      for (const q of p.quarterDates) {
        if (q.date) {
          lines.push(`  • ${q.quarter} ${q.moment} — ${fmtDate(q.date)}${q.confirmed ? ' (confirmed)' : ''}`);
        } else {
          lines.push(`  • ${q.quarter} ${q.moment} — date TBD`);
        }
      }
      lines.push('');
    }
  } else {
    lines.push('ENGAGEMENT PLAN');
    lines.push('---');
    lines.push('I recommend we discuss a structured engagement plan as a next step to translate these findings into improved utilization and measurable cost savings.');
    lines.push('');
  }

  // Next steps
  lines.push('NEXT STEPS');
  lines.push('---');
  lines.push("I'd recommend we schedule a follow-up to:");
  lines.push('  1. Review these findings with your benefits team');
  lines.push('  2. Finalize the engagement channel selection');
  lines.push('  3. Confirm the quarterly campaign calendar');
  lines.push('  4. Align on implementation timeline');
  lines.push('');
  lines.push("Please let me know your availability and I'm happy to set something up.");
  lines.push('');
  lines.push('Best regards,');
  lines.push('[Your name]');
  lines.push('');
  lines.push('---');
  lines.push('Note: All estimates are modeled projections based on national population health benchmarks and should not be interpreted as guaranteed results. Combined totals include population overlap across condition categories.');

  return { subject, body: lines.join('\n') };
}

function generateEmployerEmail(p: FollowUpEmailProps): { subject: string; body: string } {
  const subject = `Behavioral Health Cost Analysis & Recommended Next Steps — ${p.clientName}`;

  const lines: string[] = [];

  lines.push(`Hi [name],`);
  lines.push('');
  lines.push(`I wanted to share findings from our recent behavioral health total cost of care analysis. This analysis examines how untreated behavioral health conditions among our employees with chronic physical conditions are impacting our medical spend, productivity, and disability costs.`);
  lines.push('');

  // Key findings
  lines.push('KEY FINDINGS');
  lines.push('---');
  lines.push(`Across our ${formatNumber(p.analysisPopulation)} ${p.populationLabel} (${p.analysisYear} analysis):`);
  lines.push('');
  lines.push(`  • Estimated employees with co-occurring BH conditions: ${formatNumber(p.totalWithBhComorbidity)}`);
  lines.push(`  • Estimated currently untreated: ${formatNumber(p.totalUntreated)}`);
  lines.push(`  • Combined modeled annual spending impact: ${formatCurrency(p.totalModeledSpending)}`);
  lines.push('');

  // Business case
  lines.push('BUSINESS CASE');
  lines.push('---');
  lines.push('By improving access to behavioral health treatment for this population, the analysis projects the following annual savings:');
  lines.push('');
  lines.push(`  • Medical claims: ${formatCurrency(p.totalMedicalSavings)}`);
  lines.push(`  • Absenteeism / productivity: ${formatCurrency(p.totalAbsenteeismSavings)}`);
  lines.push(`  • Short-term disability: ${formatCurrency(p.totalStdSavings)}`);
  lines.push(`  • Total gross savings: ${formatCurrency(p.totalGrossSavingsAllComponents)}`);
  lines.push('');
  lines.push(`After accounting for a treatment investment of ${formatCurrency(p.totalRulaCost)}, the projected net savings are ${formatCurrency(p.totalNetSavingsAllComponents)}.`);
  lines.push('');
  lines.push(`Per-person annual savings: ${formatCurrency(p.annualSavingsPerPerson)}`);
  lines.push('');

  // Why it matters
  lines.push('WHY THIS MATTERS');
  lines.push('---');
  lines.push(`Employees with untreated behavioral health conditions combined with a chronic condition miss approximately ${p.missedDaysChronicUntreated} workdays per year. With an estimated ${formatNumber(p.totalUntreatedPopulation)} affected employees, this represents a meaningful productivity and retention risk.`);
  lines.push('');

  // Recommended action
  lines.push('RECOMMENDED ACTION');
  lines.push('---');
  if (p.selectedChannelCount > 0) {
    lines.push(`We have been working with Rula on an engagement plan targeting ${formatNumber(p.headcount)} benefits-eligible employees. Their ${p.selectedChannelCount}-channel approach is projected to generate ${formatNumber(p.projectedCareStarts)} care starts in year one, addressing ${formatCurrency(p.projectedCostAddressed)} in annual cost exposure.`);
    lines.push('');

    const datesSet = p.quarterDates.filter((q) => q.date);
    if (datesSet.length > 0) {
      lines.push('Proposed quarterly campaign plan:');
      for (const q of p.quarterDates) {
        if (q.date) {
          lines.push(`  • ${q.quarter} ${q.moment} — ${fmtDate(q.date)}${q.confirmed ? ' (confirmed)' : ''}`);
        } else {
          lines.push(`  • ${q.quarter} ${q.moment} — date TBD`);
        }
      }
      lines.push('');
    }

    lines.push('I recommend we move forward with finalizing the engagement plan and confirming the quarterly campaign calendar.');
  } else {
    lines.push('I recommend we explore a structured behavioral health engagement plan to translate these findings into improved utilization and measurable cost savings.');
  }
  lines.push('');
  lines.push("I'm happy to walk through the full analysis at your convenience.");
  lines.push('');
  lines.push('Best,');
  lines.push('[Your name]');
  lines.push('');
  lines.push('---');
  lines.push('Note: All estimates are modeled projections based on national population health benchmarks. Combined totals include population overlap across condition categories.');

  return { subject, body: lines.join('\n') };
}

// ============================================================
// Component
// ============================================================

export function FollowUpEmail(props: FollowUpEmailProps) {
  const [version, setVersion] = useState<EmailVersion>('consultant');
  const consultantEmail = useMemo(() => generateConsultantEmail(props), [props]);
  const employerEmail = useMemo(() => generateEmployerEmail(props), [props]);

  const email = version === 'consultant' ? consultantEmail : employerEmail;

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Follow-Up Email</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Auto-generated from your analysis data. Select a version, then copy to your email client.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version toggle */}
        <div className="flex gap-1.5 bg-gray-100 rounded-full p-1 max-w-md">
          <button
            type="button"
            onClick={() => setVersion('consultant')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              version === 'consultant'
                ? 'bg-rula-sp3 text-rula-sand shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white'
            }`}
          >
            Consultant
          </button>
          <button
            type="button"
            onClick={() => setVersion('employer')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              version === 'employer'
                ? 'bg-rula-sp3 text-rula-sand shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white'
            }`}
          >
            Employer
          </button>
        </div>

        <CopyableEmail subject={email.subject} body={email.body} />
      </CardContent>
    </Card>
  );
}
