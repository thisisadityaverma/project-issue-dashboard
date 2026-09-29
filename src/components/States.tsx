import type { ReactNode } from 'react';
import { useIssues } from '../context/IssuesContext';
import { Icon, type IconName } from './Icon';
import { primaryButton } from './styles';

interface StateCardProps {
  icon: IconName;
  title: string;
  children: ReactNode;
  action: ReactNode;
  tone?: 'neutral' | 'danger';
  role?: 'alert';
}

function StateCard({ icon, title, children, action, tone = 'neutral', role }: StateCardProps) {
  const iconTone = tone === 'danger' ? 'bg-rose-400/10 text-rose-200 ring-rose-300/30' : 'bg-white/[0.06] text-foam-2 ring-white/10';
  return (
    <div role={role} className="glass mx-auto flex max-w-xl flex-col items-center rounded-3xl px-6 py-14 text-center sm:px-10">
      <span className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ring-1 ring-inset ${iconTone}`}>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2 max-w-sm space-y-1 text-sm leading-relaxed text-foam-2">{children}</div>
      <div className="mt-6">{action}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <StateCard
      role="alert"
      tone="danger"
      icon="alert"
      title="We couldn't load the issues"
      action={
        <button type="button" onClick={onRetry} className={primaryButton}>
          <Icon name="refresh" />
          Retry
        </button>
      }
    >
      {message && <p>{message}</p>}
      <p>Check your connection, then try again.</p>
    </StateCard>
  );
}

export function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <StateCard
      icon="inbox"
      title="No issues yet"
      action={
        <button type="button" onClick={onRefresh} className={primaryButton}>
          <Icon name="refresh" />
          Refresh
        </button>
      }
    >
      <p>Issues reported for this project will show up here.</p>
    </StateCard>
  );
}

export function NoResultsState() {
  const { actions } = useIssues();
  return (
    <StateCard
      icon="searchX"
      title="No issues match your filters"
      action={
        <button type="button" onClick={actions.clearFilters} className={primaryButton}>
          <Icon name="reset" />
          Clear all filters
        </button>
      }
    >
      <p>Try a different title, or remove a filter.</p>
    </StateCard>
  );
}
