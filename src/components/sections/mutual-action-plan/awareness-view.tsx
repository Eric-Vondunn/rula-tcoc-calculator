'use client';

import { Card, CardContent } from '@/components/ui/card';
import { InfoTip } from '@/components/shared/info-tip';
import { BM, A, CARE, BAR_DATA, MONEY_CARDS } from './constants';
import { computePlan, rateOf, maxMult, ppl, pct, n0, usd, word, progOf } from './calculations';
import type { ModelResult, MapState, MapAction, PlanResult } from './types';

interface Props {
  model: ModelResult;
  plan: PlanResult;
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
}

export function AwarenessView({ model: m, plan: P, state, dispatch }: Props) {
  const newRate = rateOf(P.mult);
  const maxRate = rateOf(maxMult());
  const newPeople = m.h * newRate;
  const maxPeople = m.h * maxRate;
  const newDollars = newPeople * m.perEmp;
  const progress = progOf(P.mult);
  const careMultVal = newRate / CARE.maps;

  return (
    <div className="space-y-8">
      {/* When access isn't enough */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">When access isn&rsquo;t enough</h2>
        <div className="text-gray-600 mb-4 space-y-2">
          <p><strong className="text-gray-900">81% of Americans say mental health matters. Too often, we still wait.</strong> Making care available is the first step. Getting people to take it is the work.</p>
        </div>

        <h3 className="text-base font-semibold text-rula-purple mt-6 mb-2">What this could mean for your workforce</h3>
        <p className="text-sm text-gray-500 mb-3">
          National findings from Rula&rsquo;s 2026 State of Mental Health Report, applied to your {n0(m.h)} employees.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { num: ppl(m.matters), label: 'say mental health matters at work', rate: '81%', tip: 'Headcount × 81%. Source: Rula 2026 State of Mental Health Report.' },
            { num: ppl(m.nondisc), label: 'keep their struggles private', rate: '43%', tip: 'Headcount × 43%. Source: Rula 2026 State of Mental Health Report.' },
            { num: ppl(m.cost), label: 'are blocked by cost, up from 25%', rate: '41%', tip: 'Headcount × 41%. Source: Rula 2026 State of Mental Health Report.' },
            { num: ppl(m.unsure), label: 'cannot name what kind of therapy they need', rate: '37%', tip: 'Headcount × 37%. Source: Rula 2026 State of Mental Health Report.' },
          ].map((card) => (
            <Card key={card.rate} className="border-gray-200">
              <CardContent className="flex items-center gap-4 p-4">
                <div>
                  <div className="text-2xl font-semibold text-rula-purple">{card.num}</div>
                  <div className="text-sm text-gray-700 mt-1">{card.label}<InfoTip>{card.tip}</InfoTip></div>
                  <div className="text-xs text-gray-400 mt-1">{card.rate} of workforce</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          That&rsquo;s {ppl(m.inCare)} who reach care in a year, {ppl(m.unaware)} who don&rsquo;t know where to start, and a workforce where silence is still the norm.
        </p>
        <p className="text-lg text-gray-700 mt-4 italic">
          Because the moment someone realizes they need help shouldn&rsquo;t be the beginning of another struggle to find it.
        </p>
      </section>

      {/* The cost of silence */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">The cost of silence</h2>
        <div className="text-gray-600 mb-4">
          <p><strong className="text-gray-900">What employees carry privately shows up in missed work and intent to leave.</strong></p>
        </div>

        <Card className="border-l-4 border-l-rula-sp3 mb-4">
          <CardContent className="p-5">
            <div className="text-4xl font-semibold text-rula-purple">{ppl(m.affected)}<InfoTip>43% non-disclosure × 60% with work impact × headcount.</InfoTip></div>
            <div className="text-base text-gray-700 mt-2">
              employees who keep their struggles private <strong className="text-gray-900">and</strong> whose work is affected. That&rsquo;s <strong className="text-gray-900">{ppl(m.miss6)}</strong> missing 6+ workdays a year, and <strong className="text-gray-900">{ppl(m.quitters)}</strong> who have considered quitting.
            </div>
          </CardContent>
        </Card>

        {/* Bar chart */}
        <div className="space-y-4">
          <div className="flex gap-5 text-xs text-gray-500 ml-48">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-rula-sp3" /> Keep struggles private</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-rula-light" /> Open about mental health</span>
          </div>
          {BAR_DATA.map((bar) => {
            const maxVal = Math.max(bar.hideVal, bar.openVal);
            return (
              <div key={bar.label} className="grid grid-cols-[200px_1fr] gap-4 items-center text-sm">
                <span className="text-gray-700">{bar.label}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 rounded bg-rula-sp3" style={{ width: `${(bar.hideVal / maxVal) * 100}%`, minWidth: 3 }} />
                    <span className="text-xs text-gray-500">{pct(bar.hideVal)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 rounded bg-rula-light" style={{ width: `${(bar.openVal / maxVal) * 100}%`, minWidth: 3 }} />
                    <span className="text-xs text-gray-500">{pct(bar.openVal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Money cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {[
            { num: ppl(m.affected), label: 'employees affected', sub: '43% non-disclosure × 60% affected', tip: '43% non-disclosure × 60% with work impact × headcount.' },
            { num: n0(m.days), label: 'incremental workdays missed', sub: '6+ days each, the report threshold', tip: 'Affected employees × (28% hide & miss 6+ days − 4% open & miss 6+ days) × 6 days.' },
            { num: usd(m.total), label: 'in annual cost exposure', sub: '$9,450 per affected employee', tip: 'Affected employees × $9,450 per person.' },
          ].map((card) => (
            <Card key={card.label} className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-xl font-semibold text-gray-900">{card.num}</div>
                <div className="text-xs text-gray-500 mt-2">{card.label}<InfoTip>{card.tip}</InfoTip></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-lg text-gray-700 mt-4 italic">
          What employees carry alone does not stay separate from how they show up at work.
        </p>
      </section>

      {/* More awareness. Greater access. */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">More awareness. Greater access. More people in care.</h2>
        <p className="text-sm text-gray-500 mb-2">
          {pct(A.util)} of your workforce reaches mental health care in a given year through any route their benefits allow. That&rsquo;s {ppl(m.inCare)}. A structured awareness plan with Rula has been observed to lift initial visits from {pct(CARE.maps, 2)} to {pct(CARE.full, 2)} of the workforce, depending on the mix of channels and consistency of execution.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          These rates are from Rula account performance data: {pct(CARE.maps, 2)} where the action plan runs on the employer&rsquo;s own communications alone, and {pct(CARE.full, 2)} where the Rula-managed email program and a full channel mix run alongside it. Both measure employees who actually began care, not leads or enquiries.
        </p>
        <p className="text-lg text-gray-700 mt-4 italic">
          The opportunity in front of us is clear: reach more people, help them take action sooner, and connect more of your employees to care when they need it most.
        </p>
      </section>

      {/* Readout panel */}
      <section>
        <div className="rounded-2xl bg-rula-spruce text-white p-6 grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-6">
          <div>
            <div className="text-xs font-medium tracking-wider uppercase text-rula-yellow mb-2">
              Over one plan year, all four quarters running
            </div>
            <div className="text-5xl font-semibold">{ppl(newPeople)}<InfoTip>Headcount × engagement rate for selected channel mix.</InfoTip></div>
            <div className="text-sm text-gray-300 mt-2 max-w-[34ch]">
              <strong className="text-white">{word(newPeople)}</strong> projected to start care with Rula, addressing <strong className="text-white">{usd(newDollars)}</strong> of annual cost exposure.
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-3 border-b border-white/10 pb-3">
              <span className="text-2xl font-semibold text-rula-yellow min-w-[104px] text-right tabular-nums">
                {careMultVal.toFixed(1)}×
              </span>
              <span className="text-xs text-gray-300">
                more employees starting care vs. employer communications alone
              </span>
            </div>
            <div className="flex items-baseline gap-3 border-b border-white/10 pb-3">
              <span className="text-2xl font-semibold text-rula-yellow min-w-[104px] text-right tabular-nums">
                {usd(newDollars)}
              </span>
              <span className="text-xs text-gray-300">of annual cost exposure now being addressed</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-rula-yellow min-w-[104px] text-right tabular-nums">
                {ppl(newPeople)}
              </span>
              <span className="text-xs text-gray-300">
                {P.mult >= maxMult() - 0.001
                  ? 'the fullest version of this plan'
                  : `of a possible ${ppl(maxPeople)} with the full plan`}
              </span>
            </div>
          </div>
          {/* Progress meter */}
          <div className="md:col-span-2 mt-1">
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rula-mid to-rula-light transition-all duration-300"
                style={{ width: `${Math.max(progress * 100, 2)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Partnership alone: {ppl(m.h * CARE.maps)}</span>
              <span>Full plan: {ppl(maxPeople)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          {P.mult >= maxMult() - 0.001
            ? 'This is the fullest version of the plan, and the one we would put our own name against. Thank you.'
            : <>Together we could reach <strong>{ppl(Math.max(0, maxPeople - newPeople))} more {word(maxPeople - newPeople)}</strong> in care, and lift a further {usd(Math.max(0, (maxPeople - newPeople) * m.perEmp))} of cost exposure, if we build on this across the year.</>}
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', value: 'v2' })}
            className="inline-flex items-center gap-2 rounded-full border border-rula-sp2 bg-rula-sp1 px-4 py-2.5 text-sm font-medium text-rula-purple hover:bg-rula-sp2 transition-colors"
          >
            Build the plan behind these numbers &rarr;
          </button>
        </div>
      </section>

      {/* Closing */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Let&rsquo;s close the distance to care</h2>
        <p className="text-lg text-gray-700">
          {!m.h
            ? 'Add your employee count above and we can put a number on this plan together, starting with what ships with the partnership before a single channel is selected.'
            : P.chan === 0
            ? <>Before a single channel is selected, what ships with the partnership already reaches <strong>{ppl(newPeople)} {word(newPeople)}</strong> starting care with us. Select how we reach your people and the fullest version of this plan reaches <strong>{ppl(maxPeople)} {word(maxPeople)}</strong>.</>
            : P.mult >= maxMult() - 0.001
            ? <>If together we run all four anchor moments through every channel here, <strong>{ppl(newPeople)} {word(newPeople)}</strong> start care with us, and we address <strong>{usd(newDollars)}</strong> of annual cost exposure over the year. This is the fullest version of the plan, and the one we would put our own name against.</>
            : <>If together we run all four anchor moments through {P.chan} channel{P.chan === 1 ? '' : 's'}, <strong>{ppl(newPeople)} {word(newPeople)}</strong> start care with us and address <strong>{usd(newDollars)}</strong> of cost exposure. Commit to the full plan and that becomes <strong>{ppl(maxPeople)} {word(maxPeople)}</strong> and {usd(maxPeople * m.perEmp)}, built quarter by quarter rather than all at once.</>}
        </p>
        <p className="text-lg text-gray-700 italic mt-4">
          Awareness creates the opportunity. Consistent execution turns it into access.
        </p>
      </section>
    </div>
  );
}
