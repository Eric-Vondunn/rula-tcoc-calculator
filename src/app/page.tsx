'use client';

import { CalculatorProvider } from '@/hooks/use-calculator';
import { AppShell } from '@/components/layout/app-shell';

export default function Home() {
  return (
    <CalculatorProvider>
      <AppShell />
    </CalculatorProvider>
  );
}
