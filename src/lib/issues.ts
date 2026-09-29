import type { Filters, Issue, Status } from '../types';

export function filterAndSortIssues(issues: Issue[], filters: Filters): Issue[] {
  const query = filters.query.trim().toLowerCase();

  return issues
    .filter(
      (issue) =>
        (!query || issue.title.toLowerCase().includes(query)) &&
        (filters.status === 'All' || issue.status === filters.status) &&
        (filters.priority === 'All' || issue.priority === filters.priority),
    )
    .sort((a, b) => {
      const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id);
      return filters.sort === 'newest' ? -diff : diff;
    });
}

export function countByStatus(issues: Issue[]): Record<'total' | Status, number> {
  const counts = { total: issues.length, Open: 0, 'In Progress': 0, Resolved: 0 };
  for (const issue of issues) counts[issue.status] += 1;
  return counts;
}

export function hasActiveFilters(filters: Filters) {
  return filters.query.trim() !== '' || filters.status !== 'All' || filters.priority !== 'All';
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Date.parse(iso) - now;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['week', 604_800_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
