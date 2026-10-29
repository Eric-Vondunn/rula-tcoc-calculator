'use client';

import React, { createContext, useContext, useCallback, useMemo, useReducer } from 'react';
import type {
  ClientInputs,
  ScenarioSet,
  ScenarioType,
  ScenarioAssumptions,
  AbsenteeismInputs,
  ConditionPopulationResult,
  ConditionFinancialResult,
  ScenarioResult,
  AbsenteeismResult,
  TreatedVsUntreatedCost,
} from '@/types';
import { defaultClientInputs, defaultScenarios, defaultAbsenteeismInputs, absenteeismBenchmarks } from '@/data/defaults';
import { conditionBenchmarks, costBenchmarks, getCostBenchmark } from '@/data/benchmarks';
import { calculateAllConditions } from '@/lib/engine/population';
import { calculateFinancialBurden, calculateScenario } from '@/lib/engine/financial';
import { calculateAbsenteeism, calculateTreatedVsUntreated } from '@/lib/engine/absenteeism';

// ============================================================
// State & Actions
// ============================================================

interface CalculatorState {
  clientInputs: ClientInputs;
  scenarios: ScenarioSet;
  absenteeismInputs: AbsenteeismInputs;
  activeTab: string;
}

type Action =
  | { type: 'UPDATE_CLIENT_INPUTS'; payload: Partial<ClientInputs> }
  | { type: 'UPDATE_SCENARIO'; scenarioType: ScenarioType; payload: Partial<ScenarioAssumptions> }
  | { type: 'UPDATE_ABSENTEEISM_INPUTS'; payload: Partial<AbsenteeismInputs> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'RESET_DEFAULTS' };

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'UPDATE_CLIENT_INPUTS':
      return {
        ...state,
        clientInputs: { ...state.clientInputs, ...action.payload },
      };
    case 'UPDATE_SCENARIO':
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          [action.scenarioType]: {
            ...state.scenarios[action.scenarioType],
            ...action.payload,
          },
        },
      };
    case 'UPDATE_ABSENTEEISM_INPUTS':
      return {
        ...state,
        absenteeismInputs: { ...state.absenteeismInputs, ...action.payload },
      };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'RESET_DEFAULTS':
      return {
        clientInputs: { ...defaultClientInputs },
        scenarios: {
          conservative: { ...defaultScenarios.conservative },
          base: { ...defaultScenarios.base },
          optimistic: { ...defaultScenarios.optimistic },
        },
        absenteeismInputs: { ...defaultAbsenteeismInputs },
        activeTab: state.activeTab,
      };
    default:
      return state;
  }
}

// ============================================================
// Derived Calculations
// ============================================================

interface DerivedData {
  populationResults: ConditionPopulationResult[];
  financialResults: ConditionFinancialResult[];
  scenarioResults: Record<ScenarioType, ScenarioResult[]>;
  absenteeismResult: AbsenteeismResult;
  treatedVsUntreatedResults: TreatedVsUntreatedCost[];
  adultMembers: number;
}

function computeDerived(state: CalculatorState): DerivedData {
  const { clientInputs, scenarios, absenteeismInputs } = state;
  const adultMembers = clientInputs.totalCoveredMembers * clientInputs.adultPercentage;

  const populationResults = calculateAllConditions(conditionBenchmarks, clientInputs);

  const costBenchmark = getCostBenchmark(clientInputs.selectedCostBenchmarkId) ?? costBenchmarks[0];

  const financialResults = populationResults.map((pr) =>
    calculateFinancialBurden(
      pr,
      costBenchmark,
      clientInputs.recoverableCostPercentage,
      clientInputs.employerPaidShare
    )
  );

  const scenarioTypes: ScenarioType[] = ['conservative', 'base', 'optimistic'];
  const scenarioResults = {} as Record<ScenarioType, ScenarioResult[]>;

  for (const st of scenarioTypes) {
    scenarioResults[st] = populationResults.map((pr) =>
      calculateScenario(pr, scenarios[st], st, clientInputs.employerPaidShare)
    );
  }

  // Absenteeism & productivity
  const absenteeismResult = calculateAbsenteeism(
    populationResults, absenteeismInputs, absenteeismBenchmarks
  );

  const treatedVsUntreatedResults = populationResults.map((pr) =>
    calculateTreatedVsUntreated(pr, absenteeismInputs, absenteeismBenchmarks)
  );

  return {
    populationResults, financialResults, scenarioResults,
    absenteeismResult, treatedVsUntreatedResults, adultMembers,
  };
}

// ============================================================
// Context
// ============================================================

interface CalculatorContextValue {
  state: CalculatorState;
  derived: DerivedData;
  updateClientInputs: (inputs: Partial<ClientInputs>) => void;
  updateScenario: (scenarioType: ScenarioType, assumptions: Partial<ScenarioAssumptions>) => void;
  updateAbsenteeismInputs: (inputs: Partial<AbsenteeismInputs>) => void;
  setActiveTab: (tab: string) => void;
  resetDefaults: () => void;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    clientInputs: { ...defaultClientInputs },
    scenarios: {
      conservative: { ...defaultScenarios.conservative },
      base: { ...defaultScenarios.base },
      optimistic: { ...defaultScenarios.optimistic },
    },
    absenteeismInputs: { ...defaultAbsenteeismInputs },
    activeTab: 'population',
  });

  const derived = useMemo(() => computeDerived(state), [state]);

  const updateClientInputs = useCallback(
    (inputs: Partial<ClientInputs>) => dispatch({ type: 'UPDATE_CLIENT_INPUTS', payload: inputs }),
    []
  );

  const updateScenario = useCallback(
    (scenarioType: ScenarioType, payload: Partial<ScenarioAssumptions>) =>
      dispatch({ type: 'UPDATE_SCENARIO', scenarioType, payload }),
    []
  );

  const updateAbsenteeismInputs = useCallback(
    (inputs: Partial<AbsenteeismInputs>) =>
      dispatch({ type: 'UPDATE_ABSENTEEISM_INPUTS', payload: inputs }),
    []
  );

  const setActiveTab = useCallback(
    (tab: string) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    []
  );

  const resetDefaults = useCallback(
    () => dispatch({ type: 'RESET_DEFAULTS' }),
    []
  );

  const value = useMemo(
    () => ({
      state, derived, updateClientInputs, updateScenario,
      updateAbsenteeismInputs, setActiveTab, resetDefaults,
    }),
    [state, derived, updateClientInputs, updateScenario, updateAbsenteeismInputs, setActiveTab, resetDefaults]
  );

  return (
    <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>
  );
}

export function useCalculator(): CalculatorContextValue {
  const ctx = useContext(CalculatorContext);
  if (!ctx) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return ctx;
}
