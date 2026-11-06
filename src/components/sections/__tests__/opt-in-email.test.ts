import { describe, it, expect } from 'vitest';
import { generateOptInEmail } from '../opt-in-email';

const base = {
  clientName: 'Acme Co',
  headcount: 10000,
  selectedChannelNames: ['Email', 'Webinar'],
  selectedAddonNames: [] as string[],
  quarterDates: [
    { quarter: 'Q1', moment: 'Winter Wellness', date: new Date(2027, 0, 20), confirmed: true },
    { quarter: 'Q2', moment: 'Spring', date: null, confirmed: false },
  ],
};

describe('generateOptInEmail', () => {
  it('confirms the opt-in with plan details', () => {
    const { subject, body } = generateOptInEmail(base);
    expect(subject).toBe('Opt-In Confirmation: Acme Co and Rula');
    expect(body).toContain('opt in to partnering with Rula');
    expect(body).toContain('10,000 benefits-eligible employees');
    expect(body).toContain('Communication channels: Email, Webinar');
    expect(body).toContain('Q1 Winter Wellness: January 20, 2027 (confirmed)');
    expect(body).toContain('Q2 Spring: date TBD');
    expect(body).not.toContain('Add-ons');
  });

  it('handles no channels and lists add-ons', () => {
    const { body } = generateOptInEmail({ ...base, selectedChannelNames: [], selectedAddonNames: ['On-Site Signage'] });
    expect(body).toContain('to be finalized with Rula');
    expect(body).toContain('Add-ons: On-Site Signage');
  });
});
