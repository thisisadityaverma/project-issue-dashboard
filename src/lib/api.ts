import { isPriority, isStatus, type Issue } from '../types';

const ISSUES_URL = `${import.meta.env.BASE_URL}issues.json`;
const MOCK_DELAY_MS = Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 900);

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

/**
 * Dev-only helper to preview the error state: open the app with `?simulateError`.
 * Only the first request fails, so the Retry button can be seen recovering.
 */
let simulatedFailureUsed = false;
function shouldSimulateFailure() {
  if (!import.meta.env.DEV || simulatedFailureUsed) return false;
  if (!new URLSearchParams(window.location.search).has('simulateError')) return false;
  simulatedFailureUsed = true;
  return true;
}

/** Validates one raw record. Returns null for anything we can't safely render. */
export function parseIssue(raw: unknown): Issue | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const id = typeof r.id === 'string' || typeof r.id === 'number' ? String(r.id).trim() : '';
  const title = typeof r.title === 'string' ? r.title.trim() : '';
  const createdAt = typeof r.createdAt === 'string' ? r.createdAt : '';

  if (!id || !title || !isStatus(r.status) || !isPriority(r.priority)) return null;
  if (Number.isNaN(Date.parse(createdAt))) return null;

  return {
    id,
    title,
    description: typeof r.description === 'string' ? r.description.trim() : '',
    status: r.status,
    priority: r.priority,
    assignee: typeof r.assignee === 'string' && r.assignee.trim() ? r.assignee.trim() : 'Unassigned',
    createdAt,
  };
}

/** Accepts `[...]` or `{ issues: [...] }`. Bad records are dropped; a bad payload throws. */
export function parseIssues(payload: unknown): Issue[] {
  const list = Array.isArray(payload) ? payload : (payload as { issues?: unknown } | null)?.issues;
  if (!Array.isArray(list)) throw new Error('The server returned data in an unexpected format.');

  const seen = new Set<string>();
  const issues: Issue[] = [];
  for (const raw of list) {
    const issue = parseIssue(raw);
    if (!issue) {
      console.warn('[issues] Skipping invalid record', raw);
      continue;
    }
    if (seen.has(issue.id)) continue;
    seen.add(issue.id);
    issues.push(issue);
  }
  return issues;
}

/** Mock API call: artificial latency + a real `fetch` against /issues.json. */
export async function fetchIssues(signal?: AbortSignal): Promise<Issue[]> {
  await sleep(MOCK_DELAY_MS, signal);
  if (shouldSimulateFailure()) throw new Error('Simulated network failure.');

  const response = await fetch(ISSUES_URL, { signal });
  if (!response.ok) throw new Error(`The server responded with status ${response.status}.`);
  return parseIssues(await response.json());
}
