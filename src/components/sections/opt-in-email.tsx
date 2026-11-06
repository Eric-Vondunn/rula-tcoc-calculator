'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyableEmail } from '@/components/shared/copyable-email';
import { formatNumber } from '@/lib/utils';
import type { QuarterDate } from '@/components/sections/follow-up-email';

export interface OptInEmailProps {
  clientName: string;
  /** Benefits-eligible employees from the Rula Engagement Plan. */
  headcount: number;
  selectedChannelNames: string[];
  selectedAddonNames: string[];
  quarterDates: QuarterDate[];
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Approval email the client sends to Rula confirming they opt in to the
 * engagement plan. Written in the client's voice, ready to copy.
 */
export function generateOptInEmail(p: OptInEmailProps): { subject: string; body: string } {
  const subject = `Opt-In Confirmation: ${p.clientName} and Rula`;
  const lines: string[] = [];

  lines.push('Hi [Rula contact name],');
  lines.push('');
  lines.push(
    `On behalf of ${p.clientName}, I'm confirming that we approve and opt in to partnering with Rula to bring behavioral health care to our ${formatNumber(p.headcount)} benefits-eligible employees.`
  );
  lines.push('');

  lines.push('APPROVED ENGAGEMENT PLAN');
  lines.push('---');
  lines.push(
    p.selectedChannelNames.length > 0
      ? `  • Communication channels: ${p.selectedChannelNames.join(', ')}`
      : '  • Communication channels: to be finalized with Rula'
  );
  if (p.selectedAddonNames.length > 0) {
    lines.push(`  • Add-ons: ${p.selectedAddonNames.join(', ')}`);
  }
  lines.push('  • Campaign calendar:');
  for (const q of p.quarterDates) {
    const when = q.date ? fmtDate(q.date) : 'date TBD';
    lines.push(`      – ${q.quarter} ${q.moment}: ${when}${q.confirmed ? ' (confirmed)' : ''}`);
  }
  lines.push('');

  lines.push('AUTHORIZATION');
  lines.push('---');
  lines.push(`With this email, ${p.clientName} authorizes Rula to:`);
  lines.push('  1. Prepare employee communications for the channels listed above');
  lines.push('  2. Coordinate final content, timing, and send dates with our benefits team');
  lines.push('  3. Launch the campaigns on the dates above once materials are approved');
  lines.push('');
  lines.push('We understand that all employee-facing materials will be shared with us for review and approval before distribution.');
  lines.push('');

  lines.push('POINT OF CONTACT');
  lines.push('---');
  lines.push('[Name], [Title]');
  lines.push('[Email] | [Phone]');
  lines.push('');

  lines.push('Please confirm receipt and let us know the next steps for implementation.');
  lines.push('');
  lines.push('Thank you,');
  lines.push('[Your name]');
  lines.push('[Your title]');
  lines.push(p.clientName);

  return { subject, body: lines.join('\n') };
}

export function OptInEmail(props: OptInEmailProps) {
  const email = useMemo(() => generateOptInEmail(props), [props]);

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Opt-In Email</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          An approval email for the client to send to Rula, confirming they opt in to the engagement plan.
          Filled in from the Rula Engagement Plan; copy it and share with your client contact.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <CopyableEmail subject={email.subject} body={email.body} />
      </CardContent>
    </Card>
  );
}
