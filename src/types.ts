export const STATUSES = ['Open', 'In Progress', 'Resolved'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High'] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type SortOrder = 'newest' | 'oldest';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  createdAt: string; // ISO-8601
}

export interface Filters {
  query: string;
  status: Status | 'All';
  priority: Priority | 'All';
  sort: SortOrder;
}

export const isStatus = (value: unknown): value is Status =>
  typeof value === 'string' && (STATUSES as readonly string[]).includes(value);

export const isPriority = (value: unknown): value is Priority =>
  typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
