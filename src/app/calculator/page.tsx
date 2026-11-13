'use client';

import { CalculatorProvider } from '@/hooks/use-calculator';
import { ClientsProvider } from '@/hooks/use-clients';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/app-shell';

export default function Home() {
  return (
    <CalculatorProvider>
      <ClientsProvider>
        <TooltipProvider delayDuration={200}>
          <AppShell />
        </TooltipProvider>
      </ClientsProvider>
    </CalculatorProvider>
  );
}
