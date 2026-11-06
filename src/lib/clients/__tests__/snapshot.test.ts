import { describe, it, expect } from 'vitest';
import { applySnapshot, toSnapshot, type CalculatorState } from '@/hooks/use-calculator';
import { defaultClientInputs, defaultScenarios, defaultAbsenteeismInputs } from '@/data/defaults';
import type { ClientSnapshot } from '../repository';

const baseState = (): CalculatorState => ({
  clientInputs: { ...defaultClientInputs },
  scenarios: structuredClone(defaultScenarios),
  absenteeismInputs: { ...defaultAbsenteeismInputs },
  activeTab: 'summary',
  mapState: {
    employerName: 'Acme', headcount: 4500, activeView: 'v2',
    channelSelections: { t_email: true, t_web: true }, monthSelections: {}, addonSelections: { a_sign: true },
    dates: ['2027-01-20', '', '', ''], confirmed: [true, false, false, false],
    priorities: [{ k: 'x', n: 'note' }, { k: '', n: '' }, { k: '', n: '' }],
    openQuarter: 2, otherText: '',
  },
});

describe('client snapshots', () => {
  it('round-trips everything a client needs', () => {
    const s = baseState();
    s.clientInputs = { ...s.clientInputs, clientName: 'Acme', employeeCount: 4500, populationBasis: 'employees' };
    s.absenteeismInputs.averageSalary = 91000;
    const snap = toSnapshot(s);
    expect(snap.mapState.openQuarter).toBeNull();

    const restored = applySnapshot({ ...baseState(), clientInputs: { ...defaultClientInputs } }, JSON.parse(JSON.stringify(snap)));
    expect(restored.clientInputs).toEqual(s.clientInputs);
    expect(restored.absenteeismInputs.averageSalary).toBe(91000);
    expect(restored.mapState.addonSelections).toEqual({ a_sign: true });
    expect(restored.activeTab).toBe('summary'); // loading doesn't change the current tab
  });

  it('fills fields missing from older snapshots with defaults', () => {
    const old = { version: 1, clientInputs: { clientName: 'Old Co' }, scenarios: {}, absenteeismInputs: {}, mapState: {} } as unknown as ClientSnapshot;
    const restored = applySnapshot(baseState(), old);
    expect(restored.clientInputs.clientName).toBe('Old Co');
    expect(restored.clientInputs.populationBasis).toBe(defaultClientInputs.populationBasis);
    expect(restored.scenarios.base).toEqual(defaultScenarios.base);
    expect(restored.mapState.headcount).toBe(defaultClientInputs.employeeCount);
  });
});
