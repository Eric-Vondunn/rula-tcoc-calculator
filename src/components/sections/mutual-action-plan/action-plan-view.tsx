'use client';

import { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BM, TAC, GRP, CH, MOM, MONTHS, ADDONS, PRO } from './constants';
import {
  computeMoment, computeExtras, extraCount, addonCount,
  rateOf, maxMult, ppl, pct, n0, usd, word,
  parseYmd, sugDate, schedule, offName, human, longDate, iso, andList,
  computeClashes, priorityAnswer,
} from './calculations';
import type { ModelResult, MapState, MapAction, PlanResult } from './types';

interface Props {
  model: ModelResult;
  plan: PlanResult;
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
}

export function ActionPlanView({ model: m, plan: P, state, dispatch }: Props) {
  const exN = extraCount(state);
  const aoN = addonCount(state);
  const clashes = useMemo(() => computeClashes(state.dates), [state.dates]);

  const maxRate = rateOf(maxMult());
  const maxPeople = m.h * maxRate;

  const handleSuggestAll = useCallback(() => {
    const newDates: [string, string, string, string] = ['', '', '', ''];
    MOM.forEach((_, i) => {
      const d = sugDate(i);
      if (d) newDates[i] = iso(d);
    });
    dispatch({ type: 'SET_ALL_DATES', dates: newDates });
  }, [dispatch]);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div className="-mt-2 mb-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', value: 'v1' })}
          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
        >
          &larr; See awareness turn into care
        </button>
      </div>

      {/* Launch kit */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Rula launch kit</h2>
        <p className="text-sm text-gray-500 mb-4">Every employer who partners with Rula gets all of this from day one, and everything below builds on it.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { t: 'ERG activation kit', n: 'Ready-to-use resources for employee communities to introduce and reinforce Rula.' },
            { t: 'Manager training kit', n: 'Tools for people leaders. 43% of employees have avoided raising a mental health concern with a manager, so this is the biggest unlock.' },
            { t: 'Life event kit', n: 'Ready-to-use resources that introduce Rula during the life moments when employees may need support most.' },
            { t: 'Executive testimonial', n: 'We ghostwrite it. One executive gives us a single line, so it costs them a sentence rather than a project.' },
          ].map((item) => (
            <Card key={item.t} className="border-gray-200">
              <CardContent className="p-4">
                <div className="font-medium text-gray-900">{item.t}</div>
                <div className="text-xs text-gray-500 mt-2 leading-relaxed">{item.n}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Anchor moments */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Moments that keep care top of mind</h2>
        <p className="text-sm text-gray-500 mb-4">
          This is what working with Rula gives you: the launch kit, and four engagements across the year, one a quarter. Our data shows these are the moments that matter most, and together they create the minimum rhythm required to keep mental health visible all year.
        </p>
        <div className="rounded-2xl bg-slate-800 text-white p-5">
          {MOM.map((q, i) => (
            <div key={i} className="flex items-baseline gap-3 py-2 border-b border-white/10 last:border-b-0">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-300 min-w-[28px]">{q.q}</span>
              <div>
                <span className="font-medium">{q.t}</span>
                <span className="text-xs text-gray-400 ml-2">{q.win.split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Year-round plan: quarterly milestones */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">A year-round plan, established from the start</h2>

        <div className="flex items-center justify-between flex-wrap gap-3 mt-4 mb-3">
          <span className="text-xs font-bold tracking-wider uppercase text-teal-700">The year at a glance</span>
          {MOM.some((_, i) => !!sugDate(i)) && (
            <button
              type="button"
              onClick={handleSuggestAll}
              className="text-xs font-medium border border-teal-200 bg-white text-teal-700 rounded-full px-3 py-2 hover:bg-teal-50 transition-colors"
            >
              Use the recommended dates for all four
            </button>
          )}
        </div>

        <div className="space-y-2">
          {MOM.map((q, i) => {
            const moment = computeMoment(i, P);
            const L = parseYmd(state.dates[i]);
            const isOpen = state.openQuarter === i;
            const sd = sugDate(i);
            const lead = moment.tp > 0
              ? `${moment.tp} touchpoint${moment.tp === 1 ? '' : 's'}, led by ${CH[moment.lead!]?.s || ''}`
              : 'No channel reaching this moment yet';

            return (
              <div key={i}>
                {/* Strip row */}
                <button
                  type="button"
                  className={`w-full grid grid-cols-[40px_1fr_auto_auto] gap-3 items-center text-left border rounded-xl px-4 py-3 transition-colors ${
                    isOpen ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 hover:border-teal-300 hover:bg-white'
                  } ${isOpen ? 'rounded-b-none' : ''}`}
                  onClick={() => dispatch({ type: 'SET_OPEN_QUARTER', value: isOpen ? null : i })}
                >
                  <span className="text-base font-semibold text-teal-700">{q.q}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{q.t}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{lead}</div>
                  </div>
                  {L ? (
                    <span className="text-xs font-bold text-teal-700 whitespace-nowrap">{human(L)}, {L.getFullYear()}</span>
                  ) : (
                    <span className="text-xs text-gray-400 whitespace-nowrap">Date not set</span>
                  )}
                  {state.confirmed[i] && <span className="text-xs font-bold tracking-wider uppercase text-emerald-600">Confirmed</span>}
                </button>

                {/* Detail block */}
                {isOpen && (
                  <QuarterDetail
                    quarterIndex={i}
                    moment={moment}
                    plan={P}
                    model={m}
                    state={state}
                    dispatch={dispatch}
                    launchDate={L}
                    suggestedDate={sd}
                  />
                )}
              </div>
            );
          })}
        </div>

        {clashes.map((c, ci) => (
          <div key={ci} className="mt-3 rounded-xl bg-teal-50 border-l-4 border-l-teal-500 p-3 text-sm text-gray-700">
            <strong>{c.a.q} and {c.b.q} overlap by {c.days} day{c.days === 1 ? '' : 's'}.</strong>{' '}
            {c.b.q} preparation opens on {human(c.b.from)}, before {c.a.q} closes on {human(c.a.to)}.
            Moving either launch by a fortnight clears it.
          </div>
        ))}
      </section>

      {/* Jump back */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', value: 'v1' })}
          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
        >
          See awareness turn into care
        </button>
      </div>

      {/* Monthly moments */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Moments that matter for your workforce</h2>
        <p className="text-sm text-gray-500 mb-4">
          Beyond the four, choose the topics that matter most to your people.{' '}
          {exN > 0 ? <><strong>{exN} selected.</strong>{aoN > 0 ? ` ${aoN} amplifier${aoN === 1 ? '' : 's'} selected further down.` : ''}</> : 'Nothing selected yet, so the plan runs on the four moments alone.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MONTHS.map((mo, mi) => (
            <Card key={mo.m} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-teal-700">{mo.m}</h4>
                  <span className="text-xs text-gray-400">Q{mo.q + 1}</span>
                </div>
                {mo.items.map((it, ii) => {
                  const key = `mo_${mi}_${ii}`;
                  return (
                    <label key={key} className="flex items-start gap-2 py-1 cursor-pointer hover:text-teal-700">
                      <input
                        type="checkbox"
                        checked={!!state.monthSelections[key]}
                        onChange={() => dispatch({ type: 'TOGGLE_MONTH', id: key })}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className={`text-xs leading-snug ${state.monthSelections[key] ? 'text-teal-700 font-medium' : 'text-gray-700'}`}>
                        {it.t}{it.core && <span className="text-teal-600 font-bold ml-1">*</span>}
                      </span>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Starred moments have expanded assets ready to use.</p>
      </section>

      {/* Jump back */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', value: 'v1' })}
          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
        >
          See awareness turn into care
        </button>
      </div>

      {/* Channels */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Channels that amplify each moment</h2>
        <p className="text-sm text-gray-500 mb-4">
          {P.chan === 0
            ? 'Select one digital channel, then add mail or printed materials under Amplifiers.'
            : P.both
            ? `Multi-channel unlocked. ${P.chan} channels reaching people both on screen and away from it.`
            : P.d > 0
            ? 'You have digital covered. Add mail or printed materials under Amplifiers to unlock the published lift.'
            : 'You have something reaching people away from the inbox. Add one digital channel to unlock the published lift.'}
        </p>

        <div className="space-y-4">
          {GRP.map((grp) => (
            <ChannelGroup
              key={grp.k}
              group={grp}
              state={state}
              dispatch={dispatch}
            />
          ))}
        </div>
      </section>

      {/* Jump back */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', value: 'v1' })}
          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
        >
          See awareness turn into care
        </button>
      </div>

      {/* Add-ons summary */}
      {(() => {
        const picked = ADDONS.filter(a => state.addonSelections[a.id]).map(a => a.t);
        const other = state.otherText.trim();
        if (!picked.length && !other) return null;
        return (
          <section>
            {picked.length > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  {picked.length} selected to extend that reach, counted in the projection.
                </p>
                <div className="flex flex-wrap gap-2">
                  {picked.map(t => (
                    <span key={t} className="inline-flex items-center rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-medium text-teal-700">{t}</span>
                  ))}
                </div>
              </>
            )}
            {other && (
              <Card className="mt-3 border-gray-200">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-500">Your idea:</div>
                  <div className="text-sm text-gray-700 mt-1">{other}</div>
                </CardContent>
              </Card>
            )}
          </section>
        );
      })()}
    </div>
  );
}

/* ---- Quarter detail panel ---- */

function QuarterDetail({
  quarterIndex: i, moment: M, plan: P, model: m, state, dispatch, launchDate: L, suggestedDate: sd,
}: {
  quarterIndex: number;
  moment: ReturnType<typeof computeMoment>;
  plan: PlanResult;
  model: ModelResult;
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
  launchDate: Date | null;
  suggestedDate: Date | null;
}) {
  const q = MOM[i];
  const X = computeExtras(i, state);

  return (
    <div className="border border-t-0 border-teal-200 rounded-b-xl bg-white p-5 space-y-4">
      <div className="text-xs font-bold tracking-wider uppercase text-teal-700">
        {q.q}{state.confirmed[i] ? ', confirmed' : ''}
      </div>
      <h3 className="text-lg font-medium text-gray-900">{q.t}</h3>
      {q.win && <p className="text-xs text-gray-500 leading-relaxed">{q.win}</p>}

      {/* Touchpoints */}
      {M.tp === 0 ? (
        <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-500">
          <strong>No channel reaching this moment yet.</strong>
        </div>
      ) : (
        <>
          <div className="rounded-lg bg-teal-50 p-3 text-sm text-gray-700">
            <strong>{M.tp} touchpoint{M.tp === 1 ? '' : 's'}, led by {CH[M.lead!]?.s}.</strong>
            {M.tp === 1 && <em className="ml-1">One is the case the evidence says underperforms.</em>}
          </div>
          <div className="flex flex-wrap gap-2">
            {M.sel.map(id => (
              <span key={id} className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                id === M.lead ? 'bg-teal-700 text-white' : 'border border-teal-200 text-teal-700'
              }`}>{CH[id]?.s}</span>
            ))}
          </div>
          {(M.std.length > 0 || M.amp.length > 0) && (
            <p className="text-xs text-gray-500">Plus {andList([...M.std, ...M.amp])}.</p>
          )}
        </>
      )}

      {X.topics.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <strong className="text-teal-700">Also this quarter:</strong> {andList(X.topics)}.
        </div>
      )}

      {/* Date input */}
      <div>
        <label className="block text-xs font-bold tracking-wider uppercase text-teal-700 mb-1">
          Employee launch date
        </label>
        <input
          type="date"
          value={state.dates[i]}
          onChange={(e) => dispatch({ type: 'SET_DATE', quarter: i, value: e.target.value })}
          className="w-full max-w-xs border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {sd && !L && (
        <p className="text-xs text-gray-500">
          Nothing set yet. Recommended: <strong>{longDate(sd)}</strong>.{' '}
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'SET_DATE', quarter: i, value: iso(sd) });
              dispatch({ type: 'SET_OPEN_QUARTER', value: i });
            }}
            className="text-teal-600 font-medium hover:underline"
          >
            Use this date
          </button>
        </p>
      )}

      {!L && (
        <p className="text-xs text-gray-500">
          Set a date and the six milestones fill in behind it, skipping weekends and public holidays.
        </p>
      )}

      {/* Milestone schedule */}
      {L && <MilestoneTable launchDate={L} quarterIndex={i} state={state} dispatch={dispatch} />}
    </div>
  );
}

/* ---- Milestone table ---- */

function MilestoneTable({
  launchDate: L, quarterIndex: i, state, dispatch,
}: {
  launchDate: Date;
  quarterIndex: number;
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
}) {
  const sch = useMemo(() => schedule(L), [L]);
  const off = offName(L);
  const meetings = sch.filter(x => x.m.mt);
  const holdDates = sch.filter(x => x.m.yd);
  const approvalDates = sch.filter(x => !x.m.yd);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Launching <strong>{longDate(L)}</strong>. Everything else is worked backward from it.
      </p>
      {off && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          <strong>{human(L)} is {off}.</strong> Employees are unlikely to see it. We have left the date as you set it, and the preparation dates below already avoid closures.
        </div>
      )}
      {meetings.length > 0 && (
        <div className="rounded-lg bg-teal-50 border border-teal-200 p-3 text-xs text-teal-700">
          <strong>{meetings.length} meeting{meetings.length === 1 ? '' : 's'} to put in the calendar:</strong>{' '}
          {andList(meetings.map(x => `${x.m.t.toLowerCase()} on ${human(x.d)}`))}
        </div>
      )}

      {/* Milestone grid */}
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-[1.05fr_0.62fr_1fr_1fr] gap-2 py-2 text-[10px] font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200">
          <span>Milestone</span><span>Target</span><span>Rula owns</span><span>You own</span>
        </div>
        {sch.map((x, si) => (
          <div key={si} className={`grid grid-cols-[1.05fr_0.62fr_1fr_1fr] gap-2 py-2 items-baseline text-xs border-b border-gray-100 ${
            x.m.mt ? 'bg-teal-50 rounded-lg px-2 -mx-2 my-0.5' : ''
          } ${x.m.k === 0 ? 'font-semibold' : ''}`}>
            <span className={`font-semibold ${x.m.yd ? 'text-gray-900' : 'text-gray-500'}`}>
              {x.m.t}{x.m.mt ? <span className="ml-1 text-[9px] font-bold tracking-wider uppercase bg-teal-600 text-white rounded-full px-1.5 py-0.5">Meeting</span> : ''}
            </span>
            <span className="font-bold text-teal-700 whitespace-nowrap">{human(x.d)}</span>
            <span className="text-gray-500">{x.m.r}</span>
            <span className="text-gray-500">{x.m.e}</span>
          </div>
        ))}
      </div>

      {/* Dates to hold */}
      <div className="pt-2">
        <div className="text-xs font-bold tracking-wider uppercase text-teal-700 mb-2">
          Dates to hold, {holdDates.length} this quarter
        </div>
        {holdDates.map((x, hi) => (
          <div key={hi} className="flex items-baseline gap-3 py-1 text-xs">
            <strong className="text-gray-900 min-w-[52px]">{human(x.d)}</strong>
            <span className="text-gray-600">{x.m.e}{x.m.mt ? ` (attend the ${x.m.t.toLowerCase()})` : ''}</span>
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2">
          Everything else is ours to run. We will come to you for{' '}
          {andList(approvalDates.map(x => x.m.ask || x.m.e.toLowerCase()))}, and those are replies rather than dates to protect.
        </p>
      </div>

      {/* Confirm */}
      <label className="flex items-center gap-2 pt-2 border-t border-gray-200 cursor-pointer">
        <input
          type="checkbox"
          checked={state.confirmed[i]}
          onChange={() => dispatch({ type: 'TOGGLE_CONFIRMED', quarter: i })}
          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <span className="text-xs font-medium text-gray-700">Dates and owners confirmed for {MOM[i].t}</span>
      </label>
    </div>
  );
}

/* ---- Channel group ---- */

function ChannelGroup({
  group, state, dispatch,
}: {
  group: typeof GRP[number];
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
}) {
  const items = TAC.filter(t => {
    if (group.k === 'std') return false; // Always-on is informational only
    if (group.k === 'm') return t.id === 't_mgr';
    if (group.k === 'd') return t.g === 'd' && t.id !== 't_mgr';
    if (group.k === 'amp') return (t.dg || t.g) === 'amp' && t.id !== 't_mgr';
    return false;
  });

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{group.h}</h3>
        {group.n && <p className="text-xs text-gray-500 mb-3">{group.n}</p>}

        {group.fixed ? (
          <div className="rounded-lg bg-teal-50 border border-teal-200 p-3">
            <div className="text-xs font-bold tracking-wider uppercase text-teal-700 mb-1">Always included</div>
            <div className="text-xs text-gray-500">Rula-managed email series, executive testimonial, and the four anchor moments.</div>
          </div>
        ) : (
          <div className={`${group.addons ? '' : 'space-y-1'}`}>
            {items.map(tac => (
              <label key={tac.id} className="flex items-start gap-3 py-2 border-t border-gray-100 first:border-t-0 cursor-pointer hover:bg-gray-50 rounded-lg px-1">
                <input
                  type="checkbox"
                  checked={!!state.channelSelections[tac.id]}
                  onChange={() => dispatch({ type: 'TOGGLE_CHANNEL', id: tac.id })}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="min-w-0">
                  <span className={`text-sm ${state.channelSelections[tac.id] ? 'text-teal-700 font-medium' : 'text-gray-700'}`}>{tac.t}</span>
                  <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{tac.n}</span>
                </div>
              </label>
            ))}

            {/* Add-ons within the Amplifiers group */}
            {group.addons && (
              <>
                {ADDONS.map(ao => (
                  <label key={ao.id} className="flex items-start gap-3 py-2 border-t border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg px-1">
                    <input
                      type="checkbox"
                      checked={!!state.addonSelections[ao.id]}
                      onChange={() => dispatch({ type: 'TOGGLE_ADDON', id: ao.id })}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="min-w-0">
                      <span className={`text-sm ${state.addonSelections[ao.id] ? 'text-teal-700 font-medium' : 'text-gray-700'}`}>{ao.t}</span>
                      <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{ao.n}{ao.q ? ` ${ao.q}.` : ''}</span>
                    </div>
                  </label>
                ))}

                {/* Other ideas textarea */}
                <div className="border-t border-dashed border-teal-200 pt-3 mt-2">
                  <label className="block text-xs font-bold tracking-wider uppercase text-teal-700 mb-1">
                    Something else?
                  </label>
                  <textarea
                    value={state.otherText}
                    onChange={(e) => dispatch({ type: 'SET_OTHER_TEXT', value: e.target.value })}
                    placeholder="Your idea..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-y"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
