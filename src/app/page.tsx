import type { Metadata } from 'next';
import Link from 'next/link';
import { conditionBenchmarks, costBenchmarks, sources, isCostBenchmarkVerified } from '@/data/benchmarks';
import { absenteeismBenchmarks as ab, defaultAbsenteeismInputs, defaultClientInputs } from '@/data/defaults';
import { MEMBERS_PER_EMPLOYEE } from '@/lib/population-basis';
import { A, CARE } from '@/components/sections/mutual-action-plan/constants';

export const metadata: Metadata = {
  title: 'Rula | Behavioral Health Total Cost of Care Calculator',
  description:
    'What the Rula TCOC Calculator is for, how to use it, and every assumption and caveat behind its numbers.',
};

// All figures below are read from the same data files the calculator uses,
// so this page stays in step with the model.

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const pct = (n: number, digits = 1) => `${Number((n * 100).toFixed(digits))}%`;

const incrementalCost = costBenchmarks[0].annualIncrementalCost;
const costVerified = isCostBenchmarkVerified();
const pendingSourceCount = Object.values(sources).filter((s) => s.approvalStatus === 'pending_verification').length;
const untreatedRate = conditionBenchmarks.find((c) => c.untreatedRate !== null)?.untreatedRate ?? 0;
const dailyCost = defaultAbsenteeismInputs.averageSalary / defaultAbsenteeismInputs.workdaysPerYear;
const rulaPerPerson = ab.rulaCostPerSession * ab.rulaAvgSessions;
const daysRecovered = ab.missedDaysChronicPlusUntreatedMh - ab.missedDaysChronicPlusTreatedMh;
const perPerson = {
  medical: ab.incrementalMedicalClaimsUntreated - ab.incrementalMedicalClaimsTreated,
  absenteeism: daysRecovered * dailyCost,
  std: ab.annualStdBaselineCost * (ab.stdCostMultiplierUntreated - ab.stdCostMultiplierTreated),
};
const perPersonNet = perPerson.medical + perPerson.absenteeism + perPerson.std - rulaPerPerson;

const PURPOSES = [
  {
    title: 'Size the population',
    body: 'Estimates how many of an employer’s people live with a chronic physical condition and a co-occurring behavioral health condition, and how many of them are untreated.',
  },
  {
    title: 'Quantify the cost',
    body: 'Models what that untreated population costs each year in medical claims, missed workdays, and short-term disability, and what treatment with Rula could save.',
  },
  {
    title: 'Plan engagement',
    body: 'Builds a Rula Engagement Plan of channels and campaign dates, projects care starts, and packages everything into a leave-behind and ready-to-send emails.',
  },
];

const STEPS = [
  {
    tab: 'Sign in (optional)',
    body: 'Sign in with your @rula.com email to save clients and reopen them later. The calculator itself works without signing in.',
  },
  {
    tab: 'Population Overview',
    body: `Enter the client’s name and number of employees. Choose whether results are based on Employees or total Members (employees × ${MEMBERS_PER_EMPLOYEE}). Adjust the adult share of members if you have client data.`,
  },
  {
    tab: 'Comorbidity Analysis',
    body: 'Review the estimated number of people with each chronic condition who also have a behavioral health condition, and how many are untreated.',
  },
  {
    tab: 'Financial Impact',
    body: 'See modeled annual spending for the untreated population and the projected savings from treatment, by component and by condition.',
  },
  {
    tab: 'Absenteeism & Productivity',
    body: 'Enter the client’s average salary and workdays per year to tailor the productivity figures to their workforce.',
  },
  {
    tab: 'Rula Engagement Plan',
    body: 'Pick communication channels and add-ons, set dates for the four quarterly campaign moments, and see projected care starts.',
  },
  {
    tab: 'Executive Summary',
    body: 'Print a PDF leave-behind and copy the follow-up email or the client opt-in email, all filled in from your inputs.',
  },
  {
    tab: 'Save the client',
    body: 'Click Save to store everything, including contact details and notes, in the shared client list for your team.',
  },
];

const CAVEATS: { title: string; body: string }[] = [
  {
    title: 'Projections, not guarantees',
    body: 'Every figure is a modeled estimate built from national benchmarks and the inputs entered. Actual results depend on the client’s population, engagement, and clinical outcomes.',
  },
  {
    title: 'Most benchmarks are pending verification',
    body: costVerified
      ? `The ${usd(incrementalCost)} annual incremental cost figure has been verified against a recent IBI study. ${pendingSourceCount} of the ${Object.keys(sources).length} research sources below are still pending formal verification.`
      : `All research sources below are marked pending verification. The ${usd(incrementalCost)} annual incremental cost figure has not been independently verified against its cited source.`,
  },
  {
    title: 'National data, not client data',
    body: 'Prevalence, comorbidity, and treatment rates are national averages applied to the client’s headcount. A client’s real claims data will differ.',
  },
  {
    title: 'Condition groups overlap',
    body: 'One person can appear in several condition categories. Totals that add categories together include that overlap and overstate the number of unique people and their total cost.',
  },
  {
    title: 'Association, not causation',
    body: 'The research shows behavioral health conditions are associated with higher costs. It does not prove all of that cost is caused by them or would be avoided with treatment.',
  },
  {
    title: 'One national untreated rate',
    body: `The ${pct(untreatedRate, 0)} untreated rate (NIMH/NSDUH) is applied to every condition. Treatment gaps for specific conditions may be higher or lower.`,
  },
  {
    title: 'Depression-focused comorbidity',
    body: 'Most comorbidity rates measure depression alone. Anxiety and other conditions are generally not included, which likely understates the behavioral health population.',
  },
  {
    title: 'GLP-1 / specialty Rx needs client data',
    body: 'There is no approved benchmark for GLP-1 utilizers, so that category shows no estimate unless the client provides pharmacy claims data.',
  },
  {
    title: 'Absenteeism only, not presenteeism',
    body: 'Productivity figures count missed workdays only. Reduced productivity while at work is not included.',
  },
  {
    title: 'Members mode includes dependents',
    body: 'When results are based on total Members, absenteeism and disability costs are applied to everyone counted, including dependents who are not employed.',
  },
  {
    title: 'Engagement projections are directional',
    body: 'Care-start projections come from observed Rula account performance and survey benchmarks. They indicate what similar programs achieved, not a commitment.',
  },
  {
    title: 'Rounded figures',
    body: 'Calculated dollar amounts are rounded down to the nearest $100 for display, so line items may not add exactly to totals.',
  },
];

function Section({
  id, eyebrow, title, intro, children,
}: { id: string; eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 py-16 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rula-mid">{eyebrow}</p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-rula-purple">{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-base leading-relaxed text-rula-grey/80">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function AssumptionTable({ caption, rows }: { caption: string; rows: [string, string, string?][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-rula-sp2 bg-white">
      <table className="w-full text-sm">
        <caption className="border-b border-rula-sp2 bg-rula-sp1/50 px-4 py-3 text-left font-semibold text-rula-purple">
          {caption}
        </caption>
        <tbody className="divide-y divide-rula-sp1">
          {rows.map(([label, value, note]) => (
            <tr key={label} className="align-top">
              <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-rula-grey">{label}</th>
              <td className="px-4 py-3 text-rula-grey">
                <span className="font-semibold tabular-nums text-rula-purple">{value}</span>
                {note && <span className="mt-0.5 block text-xs text-gray-500">{note}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LandingPage() {
  const allSources = Object.values(sources).sort((a, b) => a.publisher.localeCompare(b.publisher));

  return (
    <div className="flex-1 bg-rula-sand text-rula-grey">
      {/* Top bar */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 sm:px-8 pt-6">
        <span className="text-xl font-bold tracking-tight text-rula-purple">RULA</span>
        <nav className="flex items-center gap-5 text-sm">
          <a href="#how-to-use" className="hidden sm:inline text-rula-grey/70 hover:text-rula-purple">How to use</a>
          <a href="#assumptions" className="hidden sm:inline text-rula-grey/70 hover:text-rula-purple">Assumptions</a>
          <a href="#caveats" className="hidden sm:inline text-rula-grey/70 hover:text-rula-purple">Caveats</a>
          <Link
            href="/calculator"
            prefetch={false}
            className="rounded-full bg-rula-sp3 px-4 py-2 font-medium text-rula-sand hover:bg-rula-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rula-mid focus-visible:ring-offset-2"
          >
            Open calculator
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Hero */}
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16">
          <p className="inline-flex items-center rounded-full border border-rula-sp2 bg-white/70 px-3 py-1 text-xs font-medium text-rula-sp3">
            Internal tool for Rula teams
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight text-rula-purple">
            Behavioral Health Total Cost of Care Calculator
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-rula-grey/80">
            Show an employer what untreated behavioral health conditions are likely costing them, and what
            treatment with Rula could save, in a few minutes and with a single number: their headcount.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/calculator"
            prefetch={false}
              className="rounded-full bg-rula-sp3 px-6 py-3 text-base font-medium text-rula-sand shadow-sm hover:bg-rula-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rula-mid focus-visible:ring-offset-2"
            >
              Open the calculator
            </Link>
            <a href="#how-to-use" className="rounded-full px-5 py-3 text-base font-medium text-rula-sp3 hover:bg-rula-sp1">
              How it works ↓
            </a>
          </div>

          {/* Per-person snapshot */}
          <div className="mt-14 rounded-2xl border border-rula-sp2 bg-white p-6 sm:p-8">
            <p className="text-sm font-medium text-rula-grey/70">
              Modeled annual savings per treated person, at default assumptions
            </p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5">
              {[
                ['Medical claims', usd(perPerson.medical)],
                ['Absenteeism', usd(perPerson.absenteeism)],
                ['Short-term disability', usd(perPerson.std)],
                ['Rula treatment', `−${usd(rulaPerPerson)}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-rula-purple">{value}</p>
                </div>
              ))}
              <div className="col-span-2 sm:col-span-1 rounded-xl bg-rula-sp1 px-4 py-3">
                <p className="text-xs text-rula-sp3">Net savings</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-rula-sp3">{usd(perPersonNet)}</p>
              </div>
            </div>
            <p className="mt-5 text-xs text-gray-500">
              Based on a {usd(defaultAbsenteeismInputs.averageSalary)} average salary. Illustrative only; see the
              assumptions and caveats below.
            </p>
          </div>
        </section>

        {/* What it's for */}
        <Section
          id="what-its-for"
          eyebrow="What it’s for"
          title="A cost-of-care story for benefits conversations"
          intro="Built for Rula teams working with employer benefits leaders and consultants. It turns national research into an estimate sized to one employer, then turns that estimate into a plan."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {PURPOSES.map((p, i) => (
              <div key={p.title} className="rounded-2xl border border-rula-sp2 bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rula-sp1 text-sm font-semibold text-rula-sp3">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-rula-purple">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-rula-grey/80">{p.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* How to use */}
        <Section
          id="how-to-use"
          eyebrow="How to use it"
          title="Work left to right across the tabs"
          intro="Only the employee count is required. Everything else has a sensible default you can override with client data."
        >
          <ol className="relative space-y-6 border-l-2 border-rula-sp2 pl-8">
            {STEPS.map((s, i) => (
              <li key={s.tab} className="relative">
                <span className="absolute -left-[2.85rem] flex h-7 w-7 items-center justify-center rounded-full border-2 border-rula-sp2 bg-rula-sand text-xs font-semibold text-rula-sp3">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-rula-purple">{s.tab}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-rula-grey/80">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* How the numbers work */}
        <Section
          id="method"
          eyebrow="How the numbers work"
          title="From headcount to cost, in four multiplications"
        >
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Population', `Employees, or employees × ${MEMBERS_PER_EMPLOYEE} for members`],
              ['× Condition prevalence', 'National rate for each chronic condition'],
              ['× Behavioral health comorbidity', 'Share with a co-occurring condition'],
              [`× ${pct(untreatedRate, 0)} untreated`, 'Share not receiving treatment'],
            ].map(([h, b], i) => (
              <div key={h} className="relative rounded-2xl border border-rula-sp2 bg-white p-5">
                <p className="text-xs font-medium text-rula-mid">Step {i + 1}</p>
                <p className="mt-1 font-semibold text-rula-purple">{h}</p>
                <p className="mt-1 text-sm text-rula-grey/70">{b}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-rula-grey/80">
            The result is the estimated <strong className="text-rula-purple">untreated population</strong> for each
            condition. Costs are then modeled per person: an incremental {usd(incrementalCost)} per year for modeled
            spending, and a treated-versus-untreated comparison of medical claims, missed workdays, and short-term
            disability, net of the cost of Rula care.
          </p>
        </Section>

        {/* Assumptions */}
        <Section
          id="assumptions"
          eyebrow="Assumptions"
          title="Every number the model relies on"
          intro="Defaults marked “input” can be changed in the calculator. The rest are fixed research benchmarks."
        >
          <div className="space-y-6">
            <AssumptionTable
              caption="Population"
              rows={[
                ['Members per employee', `${MEMBERS_PER_EMPLOYEE}×`, 'Used when results are based on total Members.'],
                ['Adult share of members', pct(defaultClientInputs.adultPercentage, 0), 'Input. Industry benchmark; applies in Members mode only. Employees are all treated as adults.'],
                ['Untreated rate', pct(untreatedRate, 0), 'NIMH/NSDUH share of adults with a behavioral health condition not receiving treatment, applied to every condition.'],
              ]}
            />

            <div className="overflow-x-auto rounded-xl border border-rula-sp2 bg-white">
              <table className="w-full min-w-[36rem] text-sm">
                <caption className="border-b border-rula-sp2 bg-rula-sp1/50 px-4 py-3 text-left font-semibold text-rula-purple">
                  Chronic condition benchmarks
                </caption>
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th scope="col" className="px-4 py-2 font-medium">Condition</th>
                    <th scope="col" className="px-4 py-2 font-medium">Prevalence</th>
                    <th scope="col" className="px-4 py-2 font-medium">Applied to</th>
                    <th scope="col" className="px-4 py-2 font-medium">BH comorbidity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rula-sp1">
                  {conditionBenchmarks.map((c) => (
                    <tr key={c.conditionId} className="align-top">
                      <th scope="row" className="px-4 py-3 text-left font-medium text-rula-grey">
                        {c.conditionName}
                        <span className="mt-0.5 block text-xs font-normal text-gray-500">{c.notes}</span>
                      </th>
                      <td className="px-4 py-3 font-semibold tabular-nums text-rula-purple">
                        {c.prevalenceRate !== null ? pct(c.prevalenceRate) : '—'}
                      </td>
                      <td className="px-4 py-3 text-rula-grey/80">
                        {c.prevalenceRate === null ? 'Client data required' : c.prevalenceDenominator === 'adult_members' ? 'Adults' : 'Everyone'}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-rula-purple">
                        {c.bhComorbidityRate !== null ? pct(c.bhComorbidityRate) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AssumptionTable
                caption="Costs per untreated person, per year"
                rows={[
                  ['Modeled incremental cost', usd(incrementalCost), `IBI figure, ${costVerified ? 'verified against a recent IBI study' : 'unverified'}. Drives “modeled annual spending.”`],
                  ['Medical claims', `${usd(ab.incrementalMedicalClaimsUntreated)} → ${usd(ab.incrementalMedicalClaimsTreated)}`, 'Incremental claims, untreated → treated.'],
                  ['Short-term disability', `${usd(ab.annualStdBaselineCost)} × ${ab.stdCostMultiplierUntreated} → × ${ab.stdCostMultiplierTreated}`, 'Baseline cost × multiplier, untreated → treated.'],
                  ['Rula treatment', `${usd(ab.rulaCostPerSession)} × ${ab.rulaAvgSessions} sessions = ${usd(rulaPerPerson)}`, 'Average cost per session and sessions per person.'],
                ]}
              />
              <AssumptionTable
                caption="Absenteeism"
                rows={[
                  ['Average salary', usd(defaultAbsenteeismInputs.averageSalary), 'Input.'],
                  ['Workdays per year', String(defaultAbsenteeismInputs.workdaysPerYear), `Input. Daily cost = salary ÷ workdays (${usd(dailyCost)} at defaults).`],
                  ['Missed days, no MH condition', `${ab.missedDaysNoMh} days`, 'BLS baseline.'],
                  ['Chronic + untreated MH', `${ab.missedDaysChronicPlusUntreatedMh} days`, 'Loeppke et al.'],
                  ['Chronic + treated MH', `${ab.missedDaysChronicPlusTreatedMh} days`, `Modeled. Treatment recovers ${daysRecovered} days per person.`],
                ]}
              />
            </div>

            <AssumptionTable
              caption="Rula Engagement Plan"
              rows={[
                ['Initial-visit rate, employer comms alone', pct(CARE.maps, 2), 'Share of headcount starting care. Observed Rula account performance.'],
                ['Initial-visit rate, full Rula plan', pct(CARE.full, 2), 'With Rula-managed email and the full channel mix. Selected channels fall between the two.'],
                ['Annual cost exposure per affected employee', usd(A.cost_pp), 'Multiplied by projected care starts to show cost exposure addressed.'],
                ['Survey benchmarks', '2026', 'Workforce statistics come from Rula’s 2026 State of Mental Health Report.'],
              ]}
            />
          </div>
        </Section>

        {/* Caveats */}
        <Section
          id="caveats"
          eyebrow="Caveats"
          title="Read before sharing numbers with a client"
          intro="Use these figures to open a conversation about cost, not to promise an outcome."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {CAVEATS.map((c) => (
              <div key={c.title} className="rounded-xl border border-rula-sp2 bg-white p-5">
                <h3 className="font-semibold text-rula-purple">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-rula-grey/80">{c.body}</p>
              </div>
            ))}
          </div>

          <details className="group mt-8 rounded-xl border border-rula-sp2 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-rula-purple">
              Research sources ({allSources.length})
              <span className="text-sm font-normal text-rula-mid group-open:hidden">Show</span>
              <span className="hidden text-sm font-normal text-rula-mid group-open:inline">Hide</span>
            </summary>
            <ul className="divide-y divide-rula-sp1 border-t border-rula-sp2">
              {allSources.map((s) => (
                <li key={s.sourceId} className="px-5 py-3 text-sm">
                  <p className="text-rula-grey">
                    {s.sourceUrl ? (
                      <a href={s.sourceUrl} className="text-rula-sp3 underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                        {s.studyTitle}
                      </a>
                    ) : (
                      s.studyTitle
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {s.publisher}, {s.publicationYear}
                    {s.approvalStatus === 'pending_verification' && ' · Pending verification'}
                    {s.approvalStatus === 'approved' && ' · Verified'}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        </Section>

        {/* Closing CTA */}
        <section className="mb-16 rounded-2xl bg-rula-purple px-6 py-10 sm:px-10 text-center">
          <h2 className="text-2xl font-semibold text-rula-sand">Ready to build a client’s estimate?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-rula-sp2">
            Start with their employee count. You can refine every assumption as you learn more.
          </p>
          <Link
            href="/calculator"
            prefetch={false}
            className="mt-6 inline-flex rounded-full bg-rula-yellow px-6 py-3 font-medium text-rula-purple hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rula-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-rula-purple"
          >
            Open the calculator
          </Link>
        </section>
      </main>

      <footer className="border-t border-rula-sp2 py-6">
        <p className="mx-auto max-w-5xl px-5 sm:px-8 text-xs text-gray-500">
          Rula Behavioral Health Total Cost of Care Calculator. Financial estimates are modeled projections based on
          published research benchmarks and user-defined assumptions. Results are not guaranteed outcomes.
        </p>
      </footer>
    </div>
  );
}
