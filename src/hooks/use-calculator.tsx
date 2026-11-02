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
import type { MapState, MapAction } from '@/components/sections/mutual-action-plan/types';
import { defaultClientInputs, defaultScenarios, defaultAbsenteeismInputs, absenteeismBenchmarks } from '@/data/defaults';
import { conditionBenchmarks, costBenchmarks, getCostBenchmark } from '@/data/benchmarks';
import { calculateAllConditions } from '@/lib/engine/population';
import { calculateFinancialBurden, calculateScenario } from '@/lib/engine/financial';
import { calculateAbsenteeism, calculateTreatedVsUntreated } from '@/lib/engine/absenteeism';

// ============================================================
// State & Actions
// ============================================================

const defaultMapState: MapState = {
  employerName: '[Employer Name]',
  headcount: 1000,
  activeView: 'v1',
  channelSelections: { t_email: true },
  monthSelections: {},
  addonSelections: {},
  dates: ['', '', '', ''],
  confirmed: [false, false, false, false],
  priorities: [{ k: '', n: '' }, { k: '', n: '' }, { k: '', n: '' }],
  openQuarter: null,
  otherText: '',
};

interface CalculatorState {
  clientInputs: ClientInputs;
  scenarios: ScenarioSet;
  absenteeismInputs: AbsenteeismInputs;
  activeTab: string;
  mapState: MapState;
}

type Action =
  | { type: 'UPDATE_CLIENT_INPUTS'; payload: Partial<ClientInputs> }
  | { type: 'UPDATE_SCENARIO'; scenarioType: ScenarioType; payload: Partial<ScenarioAssumptions> }
  | { type: 'UPDATE_ABSENTEEISM_INPUTS'; payload: Partial<AbsenteeismInputs> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'MAP_ACTION'; payload: MapAction }
  | { type: 'RESET_DEFAULTS' };

function reduceMapAction(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_EMPLOYER_NAME':
      return { ...state, employerName: action.value };
    case 'SET_HEADCOUNT':
      return { ...state, headcount: action.value };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.value };
    case 'TOGGLE_CHANNEL':
      return { ...state, channelSelections: { ...state.channelSelections, [action.id]: !state.channelSelections[action.id] } };
    case 'TOGGLE_MONTH':
      return { ...state, monthSelections: { ...state.monthSelections, [action.id]: !state.monthSelections[action.id] } };
    case 'TOGGLE_ADDON':
      return { ...state, addonSelections: { ...state.addonSelections, [action.id]: !state.addonSelections[action.id] } };
    case 'SET_DATE': {
      const dates = [...state.dates] as [string, string, string, string];
      dates[action.quarter] = action.value;
      return { ...state, dates, openQuarter: action.quarter };
    }
    case 'SET_ALL_DATES':
      return { ...state, dates: action.dates };
    case 'TOGGLE_CONFIRMED': {
      const confirmed = [...state.confirmed] as [boolean, boolean, boolean, boolean];
      confirmed[action.quarter] = !confirmed[action.quarter];
      return { ...state, confirmed };
    }
    case 'SET_PRIORITY_KEY': {
      const priorities = [...state.priorities] as [typeof state.priorities[0], typeof state.priorities[1], typeof state.priorities[2]];
      priorities[action.index] = { ...priorities[action.index], k: action.value };
      return { ...state, priorities };
    }
    case 'SET_PRIORITY_NOTE': {
      const priorities = [...state.priorities] as [typeof state.priorities[0], typeof state.priorities[1], typeof state.priorities[2]];
      priorities[action.index] = { ...priorities[action.index], n: action.value };
      return { ...state, priorities };
    }
    case 'SET_OPEN_QUARTER':
      return { ...state, openQuarter: action.value };
    case 'SET_OTHER_TEXT':
      return { ...state, otherText: action.value };
    case 'RESET':
      return { ...defaultMapState };
    default:
      return state;
  }
}

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
    case 'MAP_ACTION':
      return { ...state, mapState: reduceMapAction(state.mapState, action.payload) };
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
        mapState: state.mapState,
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
  mapDispatch: (action: MapAction) => void;
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
    mapState: { ...defaultMapState },
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

  const mapDispatch = useCallback(
    (action: MapAction) => dispatch({ type: 'MAP_ACTION', payload: action }),
    []
  );

  const resetDefaults = useCallback(
    () => dispatch({ type: 'RESET_DEFAULTS' }),
    []
  );

  const value = useMemo(
    () => ({
      state, derived, updateClientInputs, updateScenario,
      updateAbsenteeismInputs, setActiveTab, mapDispatch, resetDefaults,
    }),
    [state, derived, updateClientInputs, updateScenario, updateAbsenteeismInputs, setActiveTab, mapDispatch, resetDefaults]
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
