'use client';

import { CalculatorProvider } from '@/hooks/use-calculator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/app-shell';

export default function Home() {
  return (
    <CalculatorProvider>
      <TooltipProvider delayDuration={200}>
        <AppShell />
      </TooltipProvider>
    </CalculatorProvider>
  );
}
