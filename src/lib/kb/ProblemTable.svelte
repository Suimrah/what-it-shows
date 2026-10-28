<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, PROBLEMS, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // issues: where each problem is filed now, problem → ticket URL. state: what engineering did about it.
  let {
    ticket,
    issues = {},
    state = {},
  }: { ticket: number; issues?: Partial<Record<Problem, string>>; state?: Partial<Record<Problem, string>> } = $props();

  const groups = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const moved = $derived(groups.find((g) => g.problem === 'one-day'));
  const rows = (reports as Report[]).length;
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} ({rows} rows in the export; {rows - total} are the same report twice) ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>fix</th><th>state</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br />{PROBLEMS[g.problem].title}</td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{PROBLEMS[g.problem].fix}</td>
        <td class:open={!state[g.problem]}>{state[g.problem] ?? 'open, no fix'}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>{issues[g.problem]?.replace(/^.*\/issues\//, '#')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#if moved}
  <p class="note">The {moved.reports.length} <code>one-day</code> reports are also counted where the desk files them, under their tenant's cause.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  td { vertical-align: top; }
  .open { color: var(--warn); font-weight: 600; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
