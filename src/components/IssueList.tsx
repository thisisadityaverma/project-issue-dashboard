import { useIssues } from '../context/IssuesContext';
import { IssueRow } from './IssueRow';
import { NoResultsState } from './States';

export function IssueList() {
  const { visibleIssues, state, actions } = useIssues();

  return (
    <section aria-labelledby="issues-heading">
      <h2 id="issues-heading" className="sr-only">
        Issues
      </h2>
      <p aria-live="polite" className="mb-3 px-1 text-sm text-foam-2">
        Showing <span className="font-semibold text-foam tabular-nums">{visibleIssues.length}</span> of{' '}
        <span className="tabular-nums">{state.issues.length}</span> issues
      </p>

      {visibleIssues.length === 0 ? (
        <NoResultsState />
      ) : (
        <ul aria-label="Issues" className="glass divide-y divide-white/[0.07] overflow-hidden rounded-3xl">
          {visibleIssues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} onOpen={actions.select} />
          ))}
        </ul>
      )}
    </section>
  );
}
