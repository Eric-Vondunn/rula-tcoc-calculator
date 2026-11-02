'use client';

import { useReducer, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCalculator } from '@/hooks/use-calculator';
import { AwarenessView } from './awareness-view';
import { ActionPlanView } from './action-plan-view';
import { computeModel, computePlan } from './calculations';
import type { MapState, MapAction } from './types';

const initialState: MapState = {
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

function mapReducer(state: MapState, action: MapAction): MapState {
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
      return { ...initialState };
    default:
      return state;
  }
}

export function MutualActionPlan() {
  const { state: calcState } = useCalculator();
  const [state, dispatch] = useReducer(mapReducer, {
    ...initialState,
    headcount: Math.round(calcState.clientInputs.totalCoveredMembers * calcState.clientInputs.adultPercentage),
  });

  const model = useMemo(() => computeModel(state.headcount), [state.headcount]);
  const plan = useMemo(() => computePlan(state), [state]);

  const handleHeadcountChange = useCallback((raw: string) => {
    const val = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    dispatch({ type: 'SET_HEADCOUNT', value: isFinite(val) ? val : 0 });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="text-xs font-bold tracking-wider uppercase text-teal-700 mb-2">Mutual Action Plan</div>
          <input
            type="text"
            value={state.employerName}
            onChange={(e) => dispatch({ type: 'SET_EMPLOYER_NAME', value: e.target.value })}
            className="block w-full border-0 border-b-2 border-dashed border-gray-200 bg-transparent text-2xl font-semibold text-gray-900 py-1 focus:outline-none focus:border-teal-500"
            aria-label="Employer name"
          />

          {/* Internal navigation */}
          <div className="flex gap-1.5 bg-gray-100 rounded-full p-1 mt-5">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', value: 'v1' })}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                state.activeView === 'v1'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-gray-200 text-gray-700" style={state.activeView === 'v1' ? { background: 'rgba(255,255,255,0.26)', color: '#fff' } : {}}>1</span>
              Awareness to care
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', value: 'v2' })}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                state.activeView === 'v2'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-gray-200 text-gray-700" style={state.activeView === 'v2' ? { background: 'rgba(255,255,255,0.26)', color: '#fff' } : {}}>2</span>
              Our Mutual Action Plan
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Employee count input */}
      <Card className="border-gray-200">
        <CardContent className="flex items-center gap-6 flex-wrap p-4">
          <div>
            <label htmlFor="map-heads" className="block text-sm text-gray-500 mb-1.5">Benefits-eligible employees</label>
            <div className="border border-gray-200 rounded-lg bg-gray-50 px-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white">
              <input
                id="map-heads"
                value={state.headcount.toLocaleString('en-US')}
                onChange={(e) => handleHeadcountChange(e.target.value)}
                inputMode="numeric"
                className="border-0 bg-transparent text-xl font-semibold text-teal-700 py-2.5 w-40 text-right focus:outline-none"
              />
            </div>
          </div>
          <p className="flex-1 min-w-[300px] text-xs text-gray-500 leading-relaxed">
            Your total benefits-eligible employee population is used to translate national findings from Rula&rsquo;s 2026 State of Mental Health Report into a personalized view of how these trends may impact your workforce.
          </p>
        </CardContent>
      </Card>

      {/* Active view */}
      {state.activeView === 'v1' ? (
        <AwarenessView model={model} plan={plan} state={state} dispatch={dispatch} />
      ) : (
        <ActionPlanView model={model} plan={plan} state={state} dispatch={dispatch} />
      )}

      {/* Footer buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href="https://www.rula.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-teal-600 text-white font-bold px-5 py-2.5 text-sm hover:bg-teal-700 transition-colors"
        >
          www.rula.com
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center rounded-full bg-teal-700 text-white px-5 py-2.5 text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center rounded-full bg-white border border-teal-200 text-teal-700 px-5 py-2.5 text-sm font-medium hover:bg-teal-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
