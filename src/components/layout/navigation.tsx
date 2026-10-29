'use client';

import { useCalculator } from '@/hooks/use-calculator';
import { cn } from '@/lib/utils';
import {
  Users,
  Activity,
  DollarSign,
  FileText,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { id: 'population', label: 'Population Overview', icon: Users },
  { id: 'comorbidity', label: 'Comorbidity Analysis', icon: Activity },
  { id: 'financial', label: 'Financial Impact', icon: DollarSign },
  { id: 'summary', label: 'Executive Summary', icon: FileText },
  { id: 'methodology', label: 'Research & Methodology', icon: BookOpen },
];

export function Navigation() {
  const { state, setActiveTab } = useCalculator();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto pb-px">
          {navItems.map((item) => {
            const isActive = state.activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
