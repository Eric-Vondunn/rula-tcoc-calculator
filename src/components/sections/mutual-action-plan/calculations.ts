import {
  BM, A, CARE, E_CONST, COMMITTED, TAC, ADDONS, CH, MOM, MONTHS, MS,
  MN, MF, WD,
} from './constants';
import type {
  MapState, ModelResult, PlanResult, MomentResult, ExtrasResult, ScheduleEntry, ClashInfo,
} from './types';

/* ---- model: workforce statistics from headcount ---- */
export function computeModel(h: number): ModelResult {
  const never = h * BM.never;
  const nondisc = h * BM.nondisc;
  const cost = h * BM.cost;
  const unsure = h * BM.unsure;
  const fit = h * BM.fitbar;
  const inCare = h * A.util;
  const unaware = h * A.unaware;
  const matters = h * BM.important;
  const affected = nondisc * A.affected;
  const miss6 = affected * (BM.hide_miss6 - BM.nohide_miss6);
  const quitters = affected * (BM.hide_quit - BM.nohide_quit);
  const days = Math.round(miss6) * 6;
  const total = affected * A.cost_pp;
  const perEmp = h ? total / h : 0;
  const literal = h * A.cost_pp;
  return { h, never, nondisc, cost, unsure, fit, inCare, unaware, matters,
    affected, miss6, quitters, days, total, perEmp, literal };
}

/* ---- multiplier math ---- */
export function multFor(n: number): number {
  let add = 0;
  let st = E_CONST.step;
  for (let i = 0; i < n; i++) { add += st; st *= E_CONST.decay; }
  return E_CONST.freq + add;
}

export function multMin(): number {
  let add = 0;
  let st = E_CONST.step;
  for (let i = 0; i < COMMITTED; i++) { add += st; st *= E_CONST.decay; }
  return 1 + add;
}

function planMax(addonCount: number): number {
  let d = 0, o = 0;
  TAC.forEach((x) => { if (x.g === 'd') d++; else if (x.g === 'o') o++; });
  const a = addonCount;
  return multFor((d + o - 2) + a + COMMITTED);
}

let _maxMult = 0;
export function maxMult(): number {
  if (!_maxMult) _maxMult = planMax(ADDONS.length);
  return _maxMult;
}

export function progOf(mult: number): number {
  const lo = multMin();
  const hi = maxMult();
  if (hi <= lo) return 0;
  const p = (mult - lo) / (hi - lo);
  return p < 0 ? 0 : (p > 1 ? 1 : p);
}

/* Geometric interpolation between maps-alone and full rate */
export function rateOf(mult: number): number {
  return CARE.maps * Math.pow(CARE.full / CARE.maps, progOf(mult));
}

export function careMult(mult: number): number {
  return rateOf(mult) / CARE.maps;
}

/* ---- plan: channel selection projections ---- */
export function computePlan(state: MapState): PlanResult {
  const sel: string[] = [];
  let d = 0, o = 0, a = 0;
  TAC.forEach((x) => {
    if (state.channelSelections[x.id]) { sel.push(x.id); if (x.g === 'd') d++; else if (x.g === 'o') o++; else a++; }
  });
  ADDONS.forEach((x) => {
    if (state.addonSelections[x.id]) a++;
  });
  const chan = d + o;
  const both = d > 0 && o > 0;
  let base: number;
  if (chan <= 1) { base = 1; }
  else if (both) { base = E_CONST.freq; }
  else { base = E_CONST.part; }
  let add = 0;
  const n = COMMITTED + a + (base > 1 ? Math.max(0, chan - 2) : 0);
  let st = E_CONST.step;
  for (let i = 0; i < n; i++) { add += st; st *= E_CONST.decay; }
  const mult = base + add;
  const kitonly = chan <= 1;
  return { sel, d, o, a, chan, both, base, add, mult, kitonly };
}

/* ---- moment: which channels serve each quarter ---- */
export function computeMoment(quarterIndex: number, plan: PlanResult): MomentResult {
  const sel: string[] = [];
  const std: string[] = [];
  const amp: string[] = [];
  let lead: string | null = null;
  plan.sel.forEach((id) => {
    const c = CH[id];
    if (!c) return;
    if (c.std) std.push(c.s);
    else if (c.amp) amp.push(c.s);
    else if (c.mm && c.mm.includes(quarterIndex)) sel.push(id);
  });
  const pri = MOM[quarterIndex].pri;
  for (const k of pri) { if (sel.includes(k)) { lead = k; break; } }
  if (!lead && sel.length) lead = sel[0];
  return { sel, std, amp, lead, tp: sel.length, live: true };
}

/* ---- extras: monthly moments and add-ons for a quarter ---- */
export function computeExtras(quarterIndex: number, state: MapState): ExtrasResult {
  const topics: string[] = [];
  const addons: string[] = [];
  let core = 0;
  MONTHS.forEach((mo, mi) => {
    if (mo.q !== quarterIndex) return;
    mo.items.forEach((it, ii) => {
      const key = `mo_${mi}_${ii}`;
      if (state.monthSelections[key]) {
        topics.push(`${mo.m}, ${it.t}`);
        if (it.core) core++;
      }
    });
  });
  ADDONS.forEach((ao) => {
    if (!ao.mm.includes(quarterIndex)) return;
    if (state.addonSelections[ao.id]) addons.push(ao.t);
  });
  return { topics, addons, core };
}

export function extraCount(state: MapState): number {
  let n = 0;
  MONTHS.forEach((mo, mi) => {
    mo.items.forEach((_, ii) => {
      if (state.monthSelections[`mo_${mi}_${ii}`]) n++;
    });
  });
  return n;
}

export function addonCount(state: MapState): number {
  let n = 0;
  ADDONS.forEach((a) => { if (state.addonSelections[a.id]) n++; });
  return n;
}

export function ampSel(state: MapState): number {
  let n = 0;
  TAC.forEach((x) => {
    if ((x.dg || x.g) !== 'amp') return;
    if (state.channelSelections[x.id]) n++;
  });
  ADDONS.forEach((a) => {
    if (state.addonSelections[a.id]) n++;
  });
  return n;
}

/* ---- date and scheduling math ---- */
export function parseYmd(v: string): Date | null {
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
  if (!p) return null;
  const d = new Date(+p[1], +p[2] - 1, +p[3]);
  return isNaN(d.getTime()) ? null : d;
}

export function plausibleYear(v: string): boolean {
  const m = /^(\d{4})-\d{2}-\d{2}$/.exec(v || '');
  if (!m) return false;
  const y = +m[1];
  return y >= 2024 && y <= 2100;
}

function nthDow(y: number, mo: number, dow: number, n: number): Date {
  const d = new Date(y, mo, 1);
  d.setDate(1 + ((dow - d.getDay() + 7) % 7) + 7 * (n - 1));
  return d;
}

function lastDow(y: number, mo: number, dow: number): Date {
  const d = new Date(y, mo + 1, 0);
  d.setDate(d.getDate() - ((d.getDay() - dow + 7) % 7));
  return d;
}

function dkey(d: Date): string { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

function holidays(y: number): Record<string, string> {
  const h: Record<string, string> = {};
  function put(d: Date, t: string) { h[dkey(d)] = t; }
  function fixed(mo: number, day: number, t: string) {
    const d = new Date(y, mo, day);
    put(d, t);
    if (d.getDay() === 6) put(new Date(y, mo, day - 1), `${t} observed`);
    if (d.getDay() === 0) put(new Date(y, mo, day + 1), `${t} observed`);
  }
  fixed(0, 1, "New Year's Day");
  put(nthDow(y, 0, 1, 3), 'Martin Luther King Jr. Day');
  put(nthDow(y, 1, 1, 3), "Presidents Day");
  put(lastDow(y, 4, 1), 'Memorial Day');
  fixed(5, 19, 'Juneteenth');
  fixed(6, 4, 'Independence Day');
  put(nthDow(y, 8, 1, 1), 'Labor Day');
  const tg = nthDow(y, 10, 4, 4);
  put(tg, 'Thanksgiving');
  put(new Date(y, 10, tg.getDate() + 1), 'the day after Thanksgiving');
  fixed(11, 24, "Christmas Eve");
  fixed(11, 25, 'Christmas Day');
  fixed(11, 31, "New Year's Eve");
  return h;
}

const HOLC: Record<number, Record<string, string>> = {};
function holName(d: Date): string {
  const y = d.getFullYear();
  if (!HOLC[y]) HOLC[y] = holidays(y);
  return HOLC[y][dkey(d)] || '';
}

export function offName(d: Date): string {
  const w = d.getDay();
  if (w === 6) return 'a Saturday';
  if (w === 0) return 'a Sunday';
  const h = holName(d);
  return h || '';
}

function workday(d: Date, dir: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  let n = 0;
  while (offName(x) && n < 14) { x.setDate(x.getDate() + dir); n++; }
  return x;
}

function shift(d: Date, k: number): Date {
  if (k === 0) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return workday(new Date(d.getFullYear(), d.getMonth(), d.getDate() + k), k > 0 ? 1 : -1);
}

export function schedule(L: Date): ScheduleEntry[] {
  const out: ScheduleEntry[] = MS.map((x) => ({ m: x, d: shift(L, x.k) }));
  // Walk backward from launch to keep preparation milestones in order
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i].m.k >= 0) continue;
    let g = 0;
    while (out[i + 1] && out[i].d >= out[i + 1].d && g < 40) {
      out[i].d = workday(new Date(out[i].d.getFullYear(), out[i].d.getMonth(), out[i].d.getDate() - 1), -1);
      g++;
    }
  }
  // Walk forward for post-launch milestones
  for (let i = 0; i < out.length; i++) {
    if (out[i].m.k <= 0) continue;
    let g = 0;
    while (out[i - 1] && out[i].d <= out[i - 1].d && g < 40) {
      out[i].d = workday(new Date(out[i].d.getFullYear(), out[i].d.getMonth(), out[i].d.getDate() + 1), 1);
      g++;
    }
  }
  return out;
}

export function sugDate(i: number): Date | null {
  const g = MOM[i]?.sug;
  if (!g) return null;
  const now = new Date();
  const y = now.getFullYear();
  let d = new Date(y, g[0], g[1]);
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) d = new Date(y + 1, g[0], g[1]);
  return workday(d, 1);
}

export function computeClashes(dates: [string, string, string, string]): ClashInfo[] {
  const spans: { i: number; q: string; from: Date; to: Date }[] = [];
  MOM.forEach((q, i) => {
    const L = parseYmd(dates[i]);
    if (!L) return;
    const sc = schedule(L);
    spans.push({ i, q: q.q, from: sc[0].d, to: sc[sc.length - 1].d });
  });
  const clashes: ClashInfo[] = [];
  for (let si = 1; si < spans.length; si++) {
    const a = spans[si - 1], b = spans[si];
    if (b.from <= a.to) {
      clashes.push({ a, b, days: Math.round((a.to.getTime() - b.from.getTime()) / 86400000) + 1 });
    }
  }
  return clashes;
}

/* ---- formatting helpers ---- */
export function usd(x: number): string { return '$' + Math.ceil(x).toLocaleString('en-US'); }
export function pct(x: number, d = 0): string { return (x * 100).toFixed(d) + '%'; }
export function ppl(x: number): string { return (x <= 0 ? 0 : Math.ceil(x)).toLocaleString('en-US'); }
export function n0(x: number): string { return Math.ceil(x).toLocaleString('en-US'); }
export function word(x: number): string { return Math.ceil(x) === 1 ? 'person' : 'people'; }
export function human(d: Date): string { return MN[d.getMonth()] + ' ' + d.getDate(); }
export function longDate(d: Date): string {
  return WD[d.getDay()] + ', ' + MF[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}
export function iso(d: Date): string {
  const p = (n: number) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
export function andList(a: string[]): string {
  if (!a.length) return '';
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
}

/* Priority answer text generation (ported from HTML PRO[].a functions) */
export function priorityAnswer(k: string, plan: PlanResult, state: MapState): string {
  switch (k) {
    case 'aware':
      return 'The launch kit and the Rula-managed email series carry this from day one, and the four moments repeat it through the year. ' +
        (plan.chan > 1
          ? `The ${plan.chan} channels selected below are what put it in more than one place.`
          : 'Selecting a second channel is what puts it in more than one place.');
    case 'mgr': {
      const on = state.channelSelections['t_mgr'];
      return 'The manager training kit ships with the partnership. ' +
        (on
          ? 'Rula manager emails are selected, so we write and send the reinforcement too.'
          : 'Rula manager emails are not selected yet, and they are the item that turns the kit into something managers actually use.');
    }
    case 'cost':
      return 'Q1 Winter Wellness leads on the in-network message, because cost is the barrier named most often and the benefit already answers it.';
    case 'fit':
      return 'Q3 Back to School leads on matching. People using Rula meet 1.5 therapists before a good fit, against an industry standard of 4.';
    case 'desk': {
      const n = ampSel(state);
      return n > 0
        ? `${n} amplifier${n > 1 ? 's' : ''} selected, which is what reaches people who do not work from an inbox. Printed materials and mail are the two that carry a moment on their own.`
        : 'No amplifiers selected yet. Printed materials in the workplace and mail to the home are the two that reach people who never open a work inbox.';
    }
    case 'stigma':
      return 'Q2 Mental Health Awareness Month leads on peer openness, which 47% name as what would move them to seek care, ahead of family and friends.';
    case 'util':
      return 'This is what the whole plan is aimed at. ' +
        (plan.both
          ? 'Digital paired with offline is unlocked, which is the pairing behind the published lift.'
          : 'Pairing a digital channel with an offline one is the single highest-value change still available on this page.');
    case 'exec':
      return 'Every moment ends with a results review two weeks after launch, and each quarter carries a named target we report against rather than open rates.';
    case 'time':
      return 'We write, design, print and ship. What we need from you is a roster, an approval and one executive sentence.';
    default:
      return 'Select the closest match and the plan will show what answers it.';
  }
}
