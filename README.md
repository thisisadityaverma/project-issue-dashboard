# Project Issue Dashboard

**Candidate Name:** Aditya Verma  

**Candidate ID / Email:** av550730@gmail.com 

Submission Date: 29 September 2026

A responsive issue tracker built with React 18, TypeScript, Vite and Tailwind CSS.
Search, filter and sort issues, open any one in an accessible side drawer, and change its status.
Status changes persist in `localStorage`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

|Command|What it does|
|-|-|
|`npm run dev`|Start the dev server|
|`npm test`|Run the Vitest + React Testing Library suite once|
|`npm run test:watch`|Re-run tests on change|
|`npm run build`|Type-check, then produce a production build in `dist/`|
|`npm run preview`|Serve the production build locally|

Requires Node 18 or newer.

## Try the states

* **Loading:** a \~900 ms mock delay shows the skeletons on every load.
* **Error + Retry:** open `http://localhost:5173/?simulateError`. The first request fails, and Retry succeeds.
* **Empty:** change `public/issues.json` to `{ "issues": \[] }`.
* **No results:** search for something that doesn't exist, e.g. `zzzz`.
* **Invalid records:** add a record with a bad `status` or a missing `title`. It is skipped and the rest still render.
* **Reset saved changes:** clear the `issue-dashboard:status-overrides:v1` key in DevTools > Application > Local Storage.

## Structure

```
public/
  issues.json              Mock API response (12 records), fetched at runtime
src/
  App.tsx                  Layout + which state to show (loading / error / empty / data)
  types.ts                 Issue, Status, Priority, Filters + type guards
  context/IssuesContext    Reducer + provider: the single source of truth
  lib/api.ts               fetchIssues (mock delay + fetch) and record validation
  lib/storage.ts           localStorage persistence of status changes
  lib/issues.ts            Pure filter/sort/count/format helpers
  components/
    Summary, Toolbar, IssueList, IssueRow, IssueDrawer
    Badges, Avatar, Select, Icon, Skeletons, States, styles
  App.test.tsx             8 behaviour tests
```

## Decisions worth knowing

* **State:** React Context + `useReducer`. The app is one screen with one small domain, so a store library
wouldn't earn its weight. Derived data is computed, never stored. Rationale is in the header comment of
`IssuesContext.tsx`.
* **Persistence:** only `{ issueId: status }` overrides are stored, and re-applied over fresh server data after each load.
* **Validation:** every record is checked in `parseIssue`. Bad records are dropped with a `console.warn`,
duplicates are ignored, and a malformed payload shows the error state.
* **Accessibility:** visible labels on every control, one real button per row (stretched over the row),
modal drawer with focus trap, Escape to close and focus return, a live region for results count and status
updates, a skip link, and `prefers-reduced-motion` support.
* **Tests:** they run the real `App` against a stubbed `fetch` and assert on what a user sees: loading, search,
combined filters plus clear, sorting, status update + persistence across a remount, invalid data, error + retry, empty state.

## AI Tools Used

- **Claude AI**: Used for generating initial component layout, Tailwind CSS styling, React Context API setup, and writing Vitest test cases.