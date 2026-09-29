import { useIssues } from '../context/IssuesContext';
import { STATUSES } from '../types';
import { STATUS_STYLES } from './Badges';

/** The one "hero" element: a segmented bar that shows how the work is distributed. */
export function Summary() {
  const { stats } = useIssues();
  const resolvedPct = stats.total ? Math.round((stats.Resolved / stats.total) * 100) : 0;
  const description = STATUSES.map((status) => `${stats[status]} ${status}`).join(', ');

  return (
    <section aria-label="Issue summary" className="glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-6xl font-semibold leading-none tracking-tight tabular-nums">{stats.total}</p>
          <p className="mt-2 text-sm text-foam-2">
            issues in total, {resolvedPct}% resolved
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 sm:gap-10">
          {STATUSES.map((status) => (
            <div key={status}>
              <dt className="flex items-center gap-2 text-sm text-foam-2">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${STATUS_STYLES[status].dot}`} />
                {status}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">{stats[status]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div role="img" aria-label={`Status breakdown: ${description}`} className="mt-6 flex h-2.5 gap-1 overflow-hidden rounded-full bg-white/[0.04]">
        {STATUSES.map(
          (status) =>
            stats[status] > 0 && (
              <span
                key={status}
                style={{ flexGrow: stats[status], flexBasis: 0 }}
                className={`min-w-0 origin-left animate-grow rounded-full transition-[flex-grow] duration-500 ${STATUS_STYLES[status].dot}`}
              />
            ),
        )}
      </div>
    </section>
  );
}
