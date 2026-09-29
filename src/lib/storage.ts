import { isStatus, type Status } from '../types';

const STORAGE_KEY = 'issue-dashboard:status-overrides:v1';

/**
 * We persist only the user's status changes ({ [issueId]: status }) instead of a full copy of
 * the issues. Fresh server data therefore still wins for everything else, and the overrides are
 * re-applied on top after every load.
 */
export function loadOverrides(): Record<string, Status> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => isStatus(value))) as Record<string, Status>;
  } catch {
    return {}; // corrupt JSON or storage blocked: start clean instead of crashing
  }
}

export function saveOverrides(overrides: Record<string, Status>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    /* quota exceeded / private mode: the UI keeps working, changes just won't persist */
  }
}
