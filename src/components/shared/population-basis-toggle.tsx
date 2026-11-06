'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { cn } from '@/lib/utils';
import { MEMBERS_PER_EMPLOYEE } from '@/lib/population-basis';
import type { PopulationBasis } from '@/types';

const OPTIONS: { value: PopulationBasis; label: string; title: string }[] = [
  { value: 'employees', label: 'Employees', title: 'Calculate results on employees only' },
  {
    value: 'members',
    label: 'Members',
    title: `Calculate results on total membership (employees × ${MEMBERS_PER_EMPLOYEE})`,
  },
];

export function PopulationBasisToggle({ className }: { className?: string }) {
  const { state, updateClientInputs } = useCalculator();
  const basis = state.clientInputs.populationBasis;

  return (
    <div
      role="radiogroup"
      aria-label="Calculate results based on"
      className={cn('inline-flex rounded-lg border border-rula-sp2 bg-rula-sp1/60 p-0.5', className)}
    >
      {OPTIONS.map((o) => {
        const active = basis === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => updateClientInputs({ populationBasis: o.value })}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rula-mid',
              active ? 'bg-rula-purple text-white shadow-sm' : 'text-rula-purple hover:bg-white'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
