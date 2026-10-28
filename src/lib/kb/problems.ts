// What #4471 actually holds: one problem per fix. causes.ts places a report by its tenant; a report
// the desk read as a one-day move (desk-notes.json) is not a month/day flip at all, whatever its tenant.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export const PROBLEMS: Record<Problem, { title: string; fix: string }> = {
  parser: {
    title: 'The shared parser reads day-first dates month first',
    fix: 'Parse with the tenant locale, not a fixed month-first order.',
  },
  hint: {
    title: "booking-v3's date hint says MM/DD/YYYY, then the form reads the date day first",
    fix: "Print the hint in the tenant's own order (DD/MM/YYYY for day-first tenants).",
  },
  'one-day': {
    title: 'Bookings move by one day: a time-zone shift, not a month/day flip',
    fix: 'Store and send the booking with its time zone; render it in the reader’s zone.',
  },
  unplaced: {
    title: 'No tenant on file',
    fix: 'Find the tenant first.',
  },
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const byProblem = new Map<Problem, Report[]>();
  for (const r of uniqueById(reports).filter((r) => r.mergedInto === ticket)) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
