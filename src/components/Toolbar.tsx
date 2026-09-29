import { useIssues } from '../context/IssuesContext';
import { PRIORITIES, STATUSES, type Filters, type SortOrder } from '../types';
import { Icon } from './Icon';
import { Select, type Option } from './Select';
import { controlClass, secondaryButton } from './styles';

const STATUS_OPTIONS: Option<Filters['status']>[] = [
  { value: 'All', label: 'All statuses' },
  ...STATUSES.map((status) => ({ value: status, label: status })),
];
const PRIORITY_OPTIONS: Option<Filters['priority']>[] = [
  { value: 'All', label: 'All priorities' },
  ...[...PRIORITIES].reverse().map((priority) => ({ value: priority, label: priority })),
];
const SORT_OPTIONS: Option<SortOrder>[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export function Toolbar() {
  const { state, filtersActive, actions } = useIssues();
  const { filters } = state;

  return (
    <section aria-label="Search and filters" className="glass rounded-3xl p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.9fr)_repeat(3,minmax(0,1fr))_auto]">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label htmlFor="issue-search" className="mb-1.5 block text-sm font-medium text-foam-2">
            Search
          </label>
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foam-3" />
            <input
              id="issue-search"
              type="search"
              autoComplete="off"
              placeholder="Search by title"
              value={filters.query}
              onChange={(event) => actions.setQuery(event.target.value)}
              className={`${controlClass} pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden`}
            />
            {filters.query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => actions.setQuery('')}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-foam-3 transition-colors hover:bg-white/10 hover:text-foam focus-ring"
              >
                <Icon name="x" />
              </button>
            )}
          </div>
        </div>

        <Select id="filter-status" label="Status" value={filters.status} options={STATUS_OPTIONS} onChange={actions.setStatusFilter} />
        <Select id="filter-priority" label="Priority" value={filters.priority} options={PRIORITY_OPTIONS} onChange={actions.setPriorityFilter} />
        <Select id="sort-order" label="Sort by" value={filters.sort} options={SORT_OPTIONS} onChange={actions.setSort} />

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button type="button" onClick={actions.clearFilters} disabled={!filtersActive} className={`${secondaryButton} w-full whitespace-nowrap`}>
            <Icon name="reset" />
            Clear all filters
          </button>
        </div>
      </div>
    </section>
  );
}
