import { IssuesProvider, useIssues } from './context/IssuesContext';
import { Icon } from './components/Icon';
import { IssueDrawer } from './components/IssueDrawer';
import { IssueList } from './components/IssueList';
import { LoadingState } from './components/Skeletons';
import { EmptyState, ErrorState } from './components/States';
import { Summary } from './components/Summary';
import { Toolbar } from './components/Toolbar';

function Dashboard() {
  const { state, actions } = useIssues();
  const { load, issues } = state;

  return (
    <>
      <a
        href="#issues"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-foam focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-deep"
      >
        Skip to issues
      </a>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Project issues</h1>
            <p className="mt-3 max-w-md text-base text-foam-2">Everything the team is tracking for the 4.2 release.</p>
          </div>
          <p className="flex items-center gap-2 text-sm text-foam-3">
            <Icon name="check" className="h-4 w-4 text-emerald-300" />
            Status changes save automatically in this browser.
          </p>
        </header>

        <main id="issues" tabIndex={-1} className="space-y-6 focus:outline-none">
          {load === 'loading' && <LoadingState />}
          {load === 'error' && <ErrorState message={state.error} onRetry={actions.retry} />}
          {load === 'success' && issues.length === 0 && <EmptyState onRefresh={actions.retry} />}
          {load === 'success' && issues.length > 0 && (
            <div className="animate-fade-in space-y-6">
              <Summary />
              <Toolbar />
              <IssueList />
            </div>
          )}
        </main>
      </div>

      <IssueDrawer />
    </>
  );
}

export default function App() {
  return (
    <IssuesProvider>
      <Dashboard />
    </IssuesProvider>
  );
}
