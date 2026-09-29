import { useEffect, useRef, useState } from 'react';
import { useIssues } from '../context/IssuesContext';
import { formatDate, timeAgo } from '../lib/issues';
import { STATUSES, type Issue, type Status } from '../types';
import { Avatar } from './Avatar';
import { PriorityBadge, StatusBadge } from './Badges';
import { Icon } from './Icon';
import { Select } from './Select';

const STATUS_OPTIONS = STATUSES.map((status) => ({ value: status, label: status }));
const FOCUSABLE =
  'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function IssueDrawer() {
  const { selectedIssue, actions } = useIssues();
  if (!selectedIssue) return null;

  return (
    <DrawerPanel
      key={selectedIssue.id} // fresh local state (the "saved" message) for each issue
      issue={selectedIssue}
      onClose={() => actions.select(null)}
      onStatusChange={(status) => actions.updateStatus(selectedIssue.id, status)}
    />
  );
}

interface DrawerPanelProps {
  issue: Issue;
  onClose: () => void;
  onStatusChange: (status: Status) => void;
}

/**
 * Accessible modal drawer:
 *  - role="dialog" + aria-modal, named by the issue title
 *  - focus moves in on open, is trapped while open, and returns to the row that opened it
 *  - Escape and backdrop click close it; body scroll is locked
 */
function DrawerPanel({ issue, onClose, onStatusChange }: DrawerPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(document.activeElement);
  const [savedStatus, setSavedStatus] = useState<Status | null>(null);

  // Scroll lock + initial focus + focus restore.
  useEffect(() => {
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  // Escape to close + Tab focus trap.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') return onClose();
      if (event.key !== 'Tab' || !panelRef.current) return;

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function handleStatusChange(status: Status) {
    onStatusChange(status);
    setSavedStatus(status);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 animate-fade-in bg-deep/70 backdrop-blur-sm" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative flex h-full w-full max-w-lg animate-slide-in flex-col border-l border-white/10 bg-panel/90 shadow-2xl backdrop-blur-2xl sm:rounded-l-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div className="min-w-0">
            <p className="text-sm tabular-nums text-foam-3">{issue.id}</p>
            <h2 id="drawer-title" className="mt-1 break-words text-2xl font-semibold leading-snug">
              {issue.title}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close issue details"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-foam-2 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-foam focus-ring"
          >
            <Icon name="x" />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          <section aria-labelledby="drawer-description">
            <h3 id="drawer-description" className="text-sm font-medium text-foam-2">
              Description
            </h3>
            <p className="mt-2 max-w-prose leading-relaxed text-foam">{issue.description || 'No description was provided.'}</p>
          </section>

          <dl className="grid grid-cols-2 gap-6 text-sm">
            <div className="min-w-0">
              <dt className="text-foam-2">Assignee</dt>
              <dd className="mt-2 flex items-center gap-2.5">
                <Avatar name={issue.assignee} className="h-8 w-8 text-xs" />
                <span className="truncate font-medium">{issue.assignee}</span>
              </dd>
            </div>
            <div>
              <dt className="text-foam-2">Created</dt>
              <dd className="mt-2">
                <time dateTime={issue.createdAt} className="font-medium">
                  {formatDate(issue.createdAt)}
                </time>
                <span className="block text-foam-3">{timeAgo(issue.createdAt)}</span>
              </dd>
            </div>
          </dl>
        </div>

        <footer className="border-t border-white/10 bg-deep/40 p-6 sm:rounded-bl-3xl">
          <Select id="issue-status" label="Status" value={issue.status} options={STATUS_OPTIONS} onChange={handleStatusChange} />
          <p role="status" className="mt-3 flex min-h-5 items-center gap-1.5 text-sm text-emerald-200">
            {savedStatus && (
              <>
                <Icon name="check" className="h-4 w-4" />
                Status updated to {savedStatus}.
              </>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
