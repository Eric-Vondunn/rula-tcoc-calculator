/* Benchmark data from Rula 2026 State of Mental Health Report */
export const BM = {
  never: 0.526, ever: 0.474, ever25: 0.50, nondisc: 0.43, cost: 0.41,
  unsure: 0.37, fitbar: 0.19, hide_miss: 0.81, nohide_miss: 0.20,
  hide_miss6: 0.28, nohide_miss6: 0.04, hide_quit: 0.79, nohide_quit: 0.17,
  impr_track: 0.71, impr_notrack: 0.52, track_none: 0.48, peers: 0.47,
  important: 0.81, rula_fit: 1.5, std_fit: 4, sla: 48,
} as const;

export const A = { util: 0.05, affected: 0.60, unaware: 0.40, cost_pp: 9450 } as const;

/* Observed initial-visit rates from Rula account performance data.
   maps = action plan on employer's own comms alone.
   full = action plan + Rula-managed email + channel mix.
   base = no action plan at all. */
export const CARE = { base: 0.0014, maps: 0.0015, full: 0.0081 } as const;

export const E_CONST = { mix: 1.18, freq: 2.42, part: Math.sqrt(2.42), step: 0.20, decay: 0.72 } as const;

/* Three elements that ship with the partnership before any channel is chosen. */
export const COMMITTED = 3;

export interface TacItem {
  g: 'd' | 'o' | 'a';
  dg?: string;
  id: string;
  t: string;
  n: string;
  p: string[];
}

export const TAC: TacItem[] = [
  { g: 'd', id: 't_email', t: 'Employee email, every campaign moment',
    n: 'Creates a consistent opportunity to put care directly in front of employees at each campaign moment. On its own it is a single touchpoint.', p: ['rhs'] },
  { g: 'd', id: 't_mgr', t: 'Include manager emails in every moment',
    n: 'Equips people leaders to reinforce available support directly with their teams. With 43% of employees having avoided sharing a mental health concern with a manager, managers can be a powerful unlock.', p: ['ncf'] },
  { g: 'd', id: 't_intra', t: 'Intranet or SharePoint resource hub',
    n: 'Gives Rula a permanent home, so employees can find support when they need it and not only when a campaign is running.', p: ['ncf'] },
  { g: 'd', id: 't_portal', t: 'Wellness portal integration',
    n: 'Places Rula inside a destination employees already use for benefits and wellness support, creating a more direct path to care.', p: ['lip'] },
  { g: 'd', id: 't_web', t: 'Live or pre-recorded webinars',
    n: 'Helps employees move from knowing support exists to understanding what kind of care may be right for them and how to get started. 37% cannot name what they need.', p: ['rhs', 'ncf'] },
  { g: 'd', id: 't_news', t: 'Monthly newsletter placement',
    n: 'Keeps Rula visible year-round, creating repeated opportunities for employees to engage when the timing is right.', p: ['lip'] },
  { g: 'o', dg: 'amp', id: 't_mail', t: 'Quarterly direct mail to the home',
    n: 'Brings Rula directly into the home, reaching employees, spouses and dependents where conversations about seeking care often happen.', p: ['rhs', 'lip'] },
  { g: 'o', dg: 'amp', id: 't_print', t: 'Printed materials in the workplace',
    n: 'Makes support visible to employees who may not regularly engage with workplace email, including break rooms, clinical areas, worksites and depots.', p: [] },
  { g: 'a', dg: 'amp', id: 't_incent', t: 'Wellness credits or engagement incentives',
    n: 'Converts passive awareness into a reason to click today rather than at some point.', p: ['lip'] },
];

export interface GrpItem {
  k: string;
  h: string;
  n?: string;
  fixed?: number;
  off?: number;
  addons?: number;
}

export const GRP: GrpItem[] = [
  { k: 'std', h: 'Always-on Rula communications',
    n: 'Included with the partnership rather than selected. This runs whether or not anything else is added.',
    fixed: 1, off: 1 },
  { k: 'm', h: 'Rula manager emails',
    n: 'We write and send these, so people leaders can reinforce support with their teams without building anything.',
    off: 1 },
  { k: 'd', h: 'Digital channels' },
  { k: 'amp', h: 'Amplifiers', addons: 1 },
];

export interface ChannelInfo {
  s: string;
  mm?: number[];
  std?: boolean;
  amp?: boolean;
}

export const CH: Record<string, ChannelInfo> = {
  t_email: { s: 'email', mm: [0, 1, 2, 3] },
  t_mgr: { s: 'manager conversations', mm: [0, 1, 3] },
  t_web: { s: 'a live webinar', mm: [0, 1, 2, 3] },
  t_mail: { s: 'a direct mailer', mm: [0, 1, 2, 3] },
  t_print: { s: 'printed materials on site', mm: [0, 1, 2, 3] },
  t_intra: { s: 'the intranet hub', std: true },
  t_portal: { s: 'your wellness portal', std: true },
  t_news: { s: 'the monthly newsletter', std: true },
  t_incent: { s: 'wellness credits', amp: true },
};

export interface MomItem {
  q: string;
  t: string;
  sug: [number, number];
  win: string;
  pri: string[];
  why: Record<string, string>;
}

export const MOM: MomItem[] = [
  { q: 'Q1', t: 'Winter Wellness', sug: [0, 20],
    win: 'The second half of January, so preparation falls in the first week back rather than over the holidays, and the moment still lands while the winter slump is ahead of people rather than behind them.',
    pri: ['t_web', 't_email', 't_mail', 't_print', 't_mgr'],
    why: { t_web: 'a live session is where someone can ask what kind of therapy would actually help them, and that is the question 37% cannot answer',
           t_email: 'it is the fastest way to put the in-network message in front of everyone at once',
           t_mail: 'it reaches the household, which is where the decision to get help usually gets made',
           t_print: 'it reaches the people who never open a work inbox',
           t_mgr: 'a manager raising it first removes the risk of going first' } },
  { q: 'Q2', t: 'Mental Health Awareness Month', sug: [4, 5],
    win: 'The first full week of May, so the month is framed from the start rather than remembered at the end.',
    pri: ['t_mgr', 't_print', 't_email', 't_web', 't_mail'],
    why: { t_mgr: '43% have avoided telling a manager, so the manager is both the blockage and the unlock',
           t_print: 'it puts the message where people are standing rather than where they are logged in',
           t_email: 'it puts the month in front of everyone at once',
           t_web: 'a shared session makes openness a group act rather than an individual risk',
           t_mail: 'it lands away from the audience of colleagues' } },
  { q: 'Q3', t: 'Back to School', sug: [7, 18],
    win: 'The two weeks after schools go back, the calmest stretch of the year to ask someone to start something for themselves.',
    pri: ['t_mail', 't_web', 't_email', 't_print'],
    why: { t_mail: 'it lands at the kitchen table in the weeks the household is rebuilding its routine, which is where the decision to get help actually gets made',
           t_web: 'a live session lets a parent ask what support exists for the whole family, not just for them',
           t_email: 'it carries the under-48-hours promise into the stretch of the year when calendars tighten and good intentions get postponed',
           t_print: 'it reaches the people running a household and a shift without ever opening a work inbox' } },
  { q: 'Q4', t: 'Holiday stress + World Mental Health Day', sug: [9, 8],
    win: 'On or just before World Mental Health Day, October 10, and ahead of the December drop-off.',
    pri: ['t_email', 't_web', 't_mail', 't_mgr', 't_print'],
    why: { t_email: 'it puts a direct nudge in front of people at the point in the year they quietly drop out of care',
           t_web: 'a live session on staying in care lands hardest in the weeks when attendance slips',
           t_mail: 'it reaches people who stopped opening work mail in December',
           t_mgr: 'managers see the drop-off before any report does',
           t_print: 'it works for the people on shift over the holidays' } },
];

export interface MonthItem {
  t: string;
  core?: boolean;
}

export interface MonthGroup {
  m: string;
  q: number;
  items: MonthItem[];
}

export const MONTHS: MonthGroup[] = [
  { m: 'January', q: 0, items: [{ t: 'Seasonal Affective Disorder and Winter Wellness', core: true }, { t: 'Self-care and New Year\'s resolutions' }, { t: 'Financial Wellness Month', core: true }] },
  { m: 'February', q: 0, items: [{ t: 'Black History Month' }, { t: 'Eating Disorder Awareness Month' }] },
  { m: 'March', q: 0, items: [{ t: 'Sleep Awareness Month' }] },
  { m: 'April', q: 1, items: [{ t: 'Stress Awareness Month' }, { t: 'Counseling Awareness Month' }] },
  { m: 'May', q: 1, items: [{ t: 'Mental Health Awareness Month', core: true }, { t: 'Maternal Mental Health Month' }] },
  { m: 'June', q: 1, items: [{ t: 'Pride Month', core: true }, { t: 'Men\'s Mental Health Month' }, { t: 'PTSD Awareness Month' }, { t: 'Juneteenth, June 19' }] },
  { m: 'July', q: 2, items: [{ t: 'Summer Wellness', core: true }, { t: 'Attachment styles' }] },
  { m: 'August', q: 2, items: [{ t: 'Finding the right therapist' }] },
  { m: 'September', q: 2, items: [{ t: 'National Suicide Prevention Month', core: true }, { t: 'Open Enrollment' }] },
  { m: 'October', q: 3, items: [{ t: 'Depression and Mental Health Screening Month' }, { t: 'World Mental Health Day, October 10' }] },
  { m: 'November', q: 3, items: [{ t: 'Family Caregivers Month', core: true }, { t: 'Holiday stress', core: true }] },
  { m: 'December', q: 3, items: [{ t: 'Holiday stress, continued', core: true }] },
];

export interface AddonItem {
  id: string;
  t: string;
  mm: number[];
  n: string;
  q?: string;
}

export const ADDONS: AddonItem[] = [
  { id: 'a_sign', t: 'On-Site Signage', mm: [0, 1, 2, 3],
    n: 'Digital and physical signage that meets employees where they already are: posters, screens, break room displays.' },
  { id: 'a_events', t: 'On-Site Activations and Events', mm: [1, 2],
    n: 'In-person moments that create buzz, from coffee cart activations to benefit fairs and wellness pop-ups.',
    q: 'Discussion and approval required' },
  { id: 'a_swag', t: 'Swag Giveaways and Mailers', mm: [0, 3],
    n: 'Branded magnets and other giveaways to create awareness and boost participation.',
    q: 'Ships direct to homes, or as a bundle to your office' },
];

export interface MilestoneTemplate {
  k: number;
  t: string;
  r: string;
  e: string;
  mt?: number;
  yd?: number;
  ask?: string;
}

export const MS: MilestoneTemplate[] = [
  { k: -16, t: 'Planning meeting', r: 'Agenda and recommendations', e: 'Confirm stakeholders', mt: 1, yd: 1 },
  { k: -14, t: 'Roster delivered', r: 'Secure specifications', e: 'Provide approved roster', ask: 'the approved roster' },
  { k: -9, t: 'Assets approved', r: 'Create final materials', e: 'Review and approve', ask: 'sign-off on the assets' },
  { k: -8, t: 'Production starts', r: 'Coordinate production', e: 'Final confirmation', ask: 'a final go-ahead' },
  { k: 0, t: 'Employee launch', r: 'Track execution', e: 'Support employee questions', yd: 1 },
  { k: 14, t: 'Results review', r: 'Report results', e: 'Review and adjust', mt: 1, yd: 1 },
];

export interface ProItem {
  k: string;
  t: string;
}

export const PRO: ProItem[] = [
  { k: 'aware', t: 'Employees do not know the benefit exists' },
  { k: 'mgr', t: 'Managers do not know how to have the conversation' },
  { k: 'cost', t: 'Employees assume care is unaffordable' },
  { k: 'fit', t: 'Employees doubt they will find the right therapist' },
  { k: 'desk', t: 'Frontline and non-desk employees never see the email' },
  { k: 'stigma', t: 'People will not raise mental health at work' },
  { k: 'util', t: 'Utilization is lower than we expected' },
  { k: 'exec', t: 'Leadership needs proof it is working' },
  { k: 'time', t: 'My team has no bandwidth to run this' },
];

export const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export const MF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
export const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/* People card data for awareness view */
export interface PeopleCardDef {
  key: string;
  label: (h: number) => string;
  rate: string;
  calc: (h: number) => number;
}

export const PEOPLE_CARDS: PeopleCardDef[] = [
  { key: 'matters', label: () => 'say mental health matters at work', rate: '81%',
    calc: (h) => h * BM.important },
  { key: 'nondisc', label: () => 'keep their struggles private', rate: '43%',
    calc: (h) => h * BM.nondisc },
  { key: 'cost', label: () => 'are blocked by cost, up from 25%', rate: '41%',
    calc: (h) => h * BM.cost },
  { key: 'unsure', label: () => 'cannot name what kind of therapy they need', rate: '37%',
    calc: (h) => h * BM.unsure },
];

export const BAR_DATA = [
  { label: 'Missed 6+ workdays in the past year',
    hideVal: BM.hide_miss6, openVal: BM.nohide_miss6 },
  { label: 'Considered quitting over mental health',
    hideVal: BM.hide_quit, openVal: BM.nohide_quit },
  { label: 'Missed any work due to mental health',
    hideVal: BM.hide_miss, openVal: BM.nohide_miss },
];

export const MONEY_CARDS = [
  { key: 'affected', label: 'employees affected', calcLabel: '43% non-disclosure × 60% affected' },
  { key: 'days', label: 'incremental workdays missed', calcLabel: '6+ days each, the report threshold' },
  { key: 'total', label: 'in annual cost exposure', calcLabel: '$9,450 per affected employee' },
];
