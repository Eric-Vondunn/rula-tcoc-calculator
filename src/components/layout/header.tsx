'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function Header() {
  const { state, updateClientInputs, resetDefaults } = useCalculator();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-teal-700 tracking-tight">RULA</span>
              <span className="hidden sm:inline text-sm text-gray-400">|</span>
              <span className="hidden sm:inline text-sm font-medium text-gray-600">
                Behavioral Health Total Cost of Care Calculator
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="client-name-header" className="text-xs text-gray-500 hidden md:inline">
                Client:
              </label>
              <Input
                id="client-name-header"
                value={state.clientInputs.clientName}
                onChange={(e) => updateClientInputs({ clientName: e.target.value })}
                placeholder="Client name"
                className="h-8 w-40 text-sm"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={resetDefaults} title="Reset to defaults">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
