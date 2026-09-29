import type { Priority, Status } from '../types';
import { Icon, type IconName } from './Icon';

// Status and priority use different hue families AND different shapes (dot vs. icon)
// so they stay distinguishable even for people who can't tell the colours apart.
export const STATUS_STYLES: Record<Status, { badge: string; dot: string }> = {
  Open: { badge: 'bg-sky-400/10 text-sky-200 ring-sky-300/30', dot: 'bg-sky-300' },
  'In Progress': { badge: 'bg-amber-400/10 text-amber-200 ring-amber-300/30', dot: 'bg-amber-300' },
  Resolved: { badge: 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/30', dot: 'bg-emerald-300' },
};

const PRIORITY_STYLES: Record<Priority, { badge: string; icon: IconName }> = {
  High: { badge: 'bg-rose-400/10 text-rose-200 ring-rose-300/30', icon: 'arrowUp' },
  Medium: { badge: 'bg-violet-400/10 text-violet-200 ring-violet-300/30', icon: 'minus' },
  Low: { badge: 'bg-white/5 text-foam-2 ring-white/15', icon: 'arrowDown' },
};

const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset';

export function StatusBadge({ status }: { status: Status }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`${base} ${style.badge}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.dot} ${status === 'In Progress' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const style = PRIORITY_STYLES[priority];
  return (
    <span className={`${base} ${style.badge}`}>
      <Icon name={style.icon} className="h-3 w-3" />
      <span className="sr-only">Priority: </span>
      {priority}
    </span>
  );
}
