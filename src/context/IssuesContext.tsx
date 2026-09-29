/**
 * STATE MANAGEMENT: React Context + useReducer (no external library).
 *
 * Why this and not Redux Toolkit / Zustand?
 *  - The app is a single screen with one small domain (issues + filters + the open drawer), so a
 *    store library would add a dependency without solving a problem we actually have.
 *  - One reducer keeps every transition explicit and unit-testable (load → success/error, filter
 *    changes, status updates), which is the main benefit Redux would give us anyway.
 *  - Context is split from presentation: components only call `useIssues()`, so swapping in
 *    Zustand later would touch this file and nothing else.
 *  - Derived data (visible list, stats, selected issue) is computed with useMemo instead of being
 *    stored, so it can never drift out of sync with the source of truth.
 */
import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { fetchIssues } from '../lib/api';
import { countByStatus, filterAndSortIssues, hasActiveFilters } from '../lib/issues';
import { loadOverrides, saveOverrides } from '../lib/storage';
import type { Filters, Issue, SortOrder, Status } from '../types';

type LoadState = 'loading' | 'success' | 'error';

interface State {
  load: LoadState;
  issues: Issue[];
  error: string | null;
  overrides: Record<string, Status>; // user-made status changes, mirrored to localStorage
  filters: Filters;
  selectedId: string | null;
}

type Action =
  | { type: 'load/start' }
  | { type: 'load/success'; issues: Issue[] }
  | { type: 'load/error'; message: string }
  | { type: 'filters/query'; value: string }
  | { type: 'filters/status'; value: Filters['status'] }
  | { type: 'filters/priority'; value: Filters['priority'] }
  | { type: 'filters/sort'; value: SortOrder }
  | { type: 'filters/clear' }
  | { type: 'issue/select'; id: string | null }
  | { type: 'issue/updateStatus'; id: string; status: Status };

const DEFAULT_FILTERS: Filters = { query: '', status: 'All', priority: 'All', sort: 'newest' };

const init = (): State => ({
  load: 'loading',
  issues: [],
  error: null,
  overrides: loadOverrides(),
  filters: DEFAULT_FILTERS,
  selectedId: null,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load/start':
      return { ...state, load: 'loading', error: null };
    case 'load/success':
      return {
        ...state,
        load: 'success',
        // Re-apply the user's saved status changes on top of the server data.
        issues: action.issues.map((issue) =>
          state.overrides[issue.id] ? { ...issue, status: state.overrides[issue.id] } : issue,
        ),
      };
    case 'load/error':
      return { ...state, load: 'error', error: action.message };
    case 'filters/query':
      return { ...state, filters: { ...state.filters, query: action.value } };
    case 'filters/status':
      return { ...state, filters: { ...state.filters, status: action.value } };
    case 'filters/priority':
      return { ...state, filters: { ...state.filters, priority: action.value } };
    case 'filters/sort':
      return { ...state, filters: { ...state.filters, sort: action.value } };
    case 'filters/clear':
      return { ...state, filters: { ...DEFAULT_FILTERS, sort: state.filters.sort } };
    case 'issue/select':
      return { ...state, selectedId: action.id };
    case 'issue/updateStatus':
      return {
        ...state,
        issues: state.issues.map((issue) => (issue.id === action.id ? { ...issue, status: action.status } : issue)),
        overrides: { ...state.overrides, [action.id]: action.status },
      };
  }
}

interface IssuesContextValue {
  state: State;
  visibleIssues: Issue[];
  stats: ReturnType<typeof countByStatus>;
  selectedIssue: Issue | null;
  filtersActive: boolean;
  actions: {
    setQuery: (value: string) => void;
    setStatusFilter: (value: Filters['status']) => void;
    setPriorityFilter: (value: Filters['priority']) => void;
    setSort: (value: SortOrder) => void;
    clearFilters: () => void;
    select: (id: string | null) => void;
    updateStatus: (id: string, status: Status) => void;
    retry: () => void;
  };
}

const IssuesContext = createContext<IssuesContextValue | null>(null);

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const [attempt, setAttempt] = useState(0); // bump to re-run the fetch (Retry / Refresh)

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'load/start' });

    fetchIssues(controller.signal)
      .then((issues) => {
        if (!controller.signal.aborted) dispatch({ type: 'load/success', issues });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return; // unmounted or superseded by a newer request
        dispatch({ type: 'load/error', message: error instanceof Error ? error.message : 'Unknown error.' });
      });

    return () => controller.abort();
  }, [attempt]);

  useEffect(() => saveOverrides(state.overrides), [state.overrides]);

  const visibleIssues = useMemo(() => filterAndSortIssues(state.issues, state.filters), [state.issues, state.filters]);
  const stats = useMemo(() => countByStatus(state.issues), [state.issues]);
  const selectedIssue = useMemo(
    () => state.issues.find((issue) => issue.id === state.selectedId) ?? null,
    [state.issues, state.selectedId],
  );

  const actions = useMemo<IssuesContextValue['actions']>(
    () => ({
      setQuery: (value) => dispatch({ type: 'filters/query', value }),
      setStatusFilter: (value) => dispatch({ type: 'filters/status', value }),
      setPriorityFilter: (value) => dispatch({ type: 'filters/priority', value }),
      setSort: (value) => dispatch({ type: 'filters/sort', value }),
      clearFilters: () => dispatch({ type: 'filters/clear' }),
      select: (id) => dispatch({ type: 'issue/select', id }),
      updateStatus: (id, status) => dispatch({ type: 'issue/updateStatus', id, status }),
      retry: () => setAttempt((n) => n + 1),
    }),
    [],
  );

  const value = useMemo<IssuesContextValue>(
    () => ({ state, visibleIssues, stats, selectedIssue, filtersActive: hasActiveFilters(state.filters), actions }),
    [state, visibleIssues, stats, selectedIssue, actions],
  );

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (!context) throw new Error('useIssues must be used inside <IssuesProvider>');
  return context;
}
