import type { Issue } from '../types';
import { formatDate } from '../lib/issues';
import { Avatar } from './Avatar';
import { PriorityBadge, StatusBadge } from './Badges';

interface IssueRowProps {
  issue: Issue;
  onOpen: (id: string) => void;
}

/**
 * Semantic row: an <article> whose heading contains the only button. The button is stretched
 * over the whole row with ::after, so the entire row is clickable but keyboard and screen-reader
 * users meet exactly one clean control named after the issue title.
 */
export function IssueRow({ issue, onOpen }: IssueRowProps) {
  return (
    <li>
      <article className="group relative flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.045] has-[:focus-visible]:bg-white/[0.045] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-sky-300 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="flex min-w-0 items-baseline gap-2.5">
            <span className="shrink-0 text-xs tabular-nums text-foam-3">{issue.id}</span>
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.focus(); // Safari doesn't focus buttons on click; needed to restore focus later
                onOpen(issue.id);
              }}
              className="min-w-0 text-left text-base font-medium text-foam line-clamp-2 after:absolute after:inset-0 after:content-[''] focus:outline-none lg:line-clamp-1"
            >
              {issue.title}
            </button>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-foam-2 lg:line-clamp-1">{issue.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:shrink-0 lg:flex-nowrap lg:gap-4">
          <div className="lg:w-[5.5rem]">
            <PriorityBadge priority={issue.priority} />
          </div>
          <div className="lg:w-[7.5rem]">
            <StatusBadge status={issue.status} />
          </div>
          <div className="flex min-w-0 items-center gap-2 text-sm text-foam-2 lg:w-8 xl:w-40">
            <Avatar name={issue.assignee} />
            <span className="truncate lg:sr-only xl:not-sr-only">{issue.assignee}</span>
          </div>
          <time dateTime={issue.createdAt} className="text-sm tabular-nums text-foam-3 lg:w-24 lg:text-right">
            {formatDate(issue.createdAt)}
          </time>
        </div>
      </article>
    </li>
  );
}
