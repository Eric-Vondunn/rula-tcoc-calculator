export interface MapState {
  employerName: string;
  headcount: number;
  activeView: 'v1' | 'v2';
  channelSelections: Record<string, boolean>;
  monthSelections: Record<string, boolean>;
  addonSelections: Record<string, boolean>;
  dates: [string, string, string, string];
  confirmed: [boolean, boolean, boolean, boolean];
  priorities: [Priority, Priority, Priority];
  openQuarter: number | null;
  otherText: string;
}

export interface Priority {
  k: string;
  n: string;
}

export interface ModelResult {
  h: number;
  never: number;
  nondisc: number;
  cost: number;
  unsure: number;
  fit: number;
  inCare: number;
  unaware: number;
  matters: number;
  affected: number;
  miss6: number;
  quitters: number;
  days: number;
  total: number;
  perEmp: number;
  literal: number;
}

export interface PlanResult {
  sel: string[];
  d: number;
  o: number;
  a: number;
  chan: number;
  both: boolean;
  base: number;
  add: number;
  mult: number;
  kitonly: boolean;
}

export interface MomentResult {
  sel: string[];
  std: string[];
  amp: string[];
  lead: string | null;
  tp: number;
  live: boolean;
}

export interface ExtrasResult {
  topics: string[];
  addons: string[];
  core: number;
}

export interface ScheduleEntry {
  m: typeof import('./constants').MS[number];
  d: Date;
}

export interface ClashInfo {
  a: { i: number; q: string; from: Date; to: Date };
  b: { i: number; q: string; from: Date; to: Date };
  days: number;
}

export type MapAction =
  | { type: 'SET_EMPLOYER_NAME'; value: string }
  | { type: 'SET_HEADCOUNT'; value: number }
  | { type: 'SET_ACTIVE_VIEW'; value: 'v1' | 'v2' }
  | { type: 'TOGGLE_CHANNEL'; id: string }
  | { type: 'TOGGLE_MONTH'; id: string }
  | { type: 'TOGGLE_ADDON'; id: string }
  | { type: 'SET_DATE'; quarter: number; value: string }
  | { type: 'SET_ALL_DATES'; dates: [string, string, string, string] }
  | { type: 'TOGGLE_CONFIRMED'; quarter: number }
  | { type: 'SET_PRIORITY_KEY'; index: number; value: string }
  | { type: 'SET_PRIORITY_NOTE'; index: number; value: string }
  | { type: 'SET_OPEN_QUARTER'; value: number | null }
  | { type: 'SET_OTHER_TEXT'; value: string }
  | { type: 'RESET' };
