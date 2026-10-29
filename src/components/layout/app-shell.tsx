'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { Header } from './header';
import { Navigation } from './navigation';
import { PopulationOverview } from '@/components/sections/population-overview';
import { ComorbidityAnalysis } from '@/components/sections/comorbidity-analysis';
import { FinancialImpact } from '@/components/sections/financial-impact';
import { Absenteeism } from '@/components/sections/absenteeism';
import { ExecutiveSummary } from '@/components/sections/executive-summary';
import { Methodology } from '@/components/sections/methodology';

const sections: Record<string, React.ComponentType> = {
  population: PopulationOverview,
  comorbidity: ComorbidityAnalysis,
  financial: FinancialImpact,
  absenteeism: Absenteeism,
  summary: ExecutiveSummary,
  methodology: Methodology,
};

export function AppShell() {
  const { state } = useCalculator();
  const ActiveSection = sections[state.activeTab] ?? PopulationOverview;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <ActiveSection />
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400 text-center">
            RULA Behavioral Health Total Cost of Care Calculator. All financial estimates are modeled
            projections based on published research benchmarks and user-defined assumptions. Results
            are not guaranteed outcomes.
          </p>
        </div>
      </footer>
    </div>
  );
}
