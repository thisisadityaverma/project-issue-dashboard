import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import data from '../public/issues.json';

/** Replace `fetch` with a stub that serves `payload` as the mock API response. */
function mockFetch(payload: unknown) {
  const stub = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => payload });
  vi.stubGlobal('fetch', stub);
  return stub;
}

const findList = () => screen.findByRole('list', { name: 'Issues' });
const rows = (list: HTMLElement) => within(list).getAllByRole('listitem');
const rowFor = (title: string) => screen.getByRole('button', { name: title }).closest('li') as HTMLElement;

describe('Project issue dashboard', () => {
  it('shows a loading state first, then all 12 issues', async () => {
    mockFetch(data);
    render(<App />);

    expect(screen.getByText(/loading issues/i)).toBeInTheDocument();

    const list = await findList();
    expect(rows(list)).toHaveLength(12);
    expect(screen.queryByText(/loading issues/i)).not.toBeInTheDocument();
  });

  it('searches titles case-insensitively while typing and shows a no-results state', async () => {
    const user = userEvent.setup();
    mockFetch(data);
    render(<App />);
    await findList();

    const search = screen.getByRole('searchbox', { name: 'Search' });
    await user.type(search, 'LoGiN');

    const list = screen.getByRole('list', { name: 'Issues' });
    expect(rows(list)).toHaveLength(1);
    expect(within(list).getByRole('button', { name: /login fails on safari/i })).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzzz');
    expect(screen.getByRole('heading', { name: /no issues match your filters/i })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Issues' })).not.toBeInTheDocument();
  });

  it('combines status and priority filters, and clears them all at once', async () => {
    const user = userEvent.setup();
    mockFetch(data);
    render(<App />);
    await findList();

    const expected = data.issues.filter((i) => i.status === 'In Progress' && i.priority === 'High');
    expect(expected.length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText('Status'), 'In Progress');
    await user.selectOptions(screen.getByLabelText('Priority'), 'High');

    const list = screen.getByRole('list', { name: 'Issues' });
    expect(rows(list)).toHaveLength(expected.length);
    for (const issue of expected) {
      expect(within(list).getByRole('button', { name: issue.title })).toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: /clear all filters/i }));
    expect(rows(screen.getByRole('list', { name: 'Issues' }))).toHaveLength(12);
    expect(screen.getByLabelText('Status')).toHaveValue('All');
    expect(screen.getByLabelText('Priority')).toHaveValue('All');
  });

  it('sorts by creation date, newest or oldest first', async () => {
    const user = userEvent.setup();
    mockFetch(data);
    render(<App />);
    const list = await findList();

    const byDate = [...data.issues].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    const newest = byDate[byDate.length - 1];
    const oldest = byDate[0];

    expect(within(rows(list)[0]).getByRole('button', { name: newest.title })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Oldest first');
    expect(within(rows(screen.getByRole('list', { name: 'Issues' }))[0]).getByRole('button', { name: oldest.title })).toBeInTheDocument();
  });

  it('updates an issue status in the drawer and keeps it after a reload', async () => {
    const user = userEvent.setup();
    mockFetch(data);
    const target = data.issues.find((i) => i.status === 'Open')!;

    const firstVisit = render(<App />);
    await findList();
    expect(within(rowFor(target.title)).getByText('Open')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: target.title }));
    const dialog = await screen.findByRole('dialog', { name: target.title });
    await user.selectOptions(within(dialog).getByLabelText('Status'), 'Resolved');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Status updated to Resolved');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(rowFor(target.title)).getByText('Resolved')).toBeInTheDocument();

    // Simulate a browser refresh: tear everything down and mount a brand-new app.
    firstVisit.unmount();
    mockFetch(data);
    render(<App />);
    await findList();
    expect(within(rowFor(target.title)).getByText('Resolved')).toBeInTheDocument();
  });

  it('skips invalid records instead of crashing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const [good, other] = data.issues;
    mockFetch({
      issues: [
        good,
        null,
        42,
        'oops',
        { ...good, id: 'BAD-1', title: '   ' },
        { ...good, id: 'BAD-2', status: 'Blocked' },
        { ...good, id: 'BAD-3', createdAt: 'not-a-date' },
        { ...good }, // duplicate id
        other,
      ],
    });
    render(<App />);

    const list = await findList();
    expect(rows(list)).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error state and recovers when Retry is clicked', async () => {
    const user = userEvent.setup();
    const stub = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValue({ ok: true, status: 200, json: async () => data });
    vi.stubGlobal('fetch', stub);
    render(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/network down/i);

    await user.click(within(alert).getByRole('button', { name: /retry/i }));
    expect(rows(await findList())).toHaveLength(12);
    expect(stub).toHaveBeenCalledTimes(2);
  });

  it('shows an empty state when the API returns no issues', async () => {
    mockFetch({ issues: [] });
    render(<App />);
    expect(await screen.findByRole('heading', { name: /no issues yet/i })).toBeInTheDocument();
  });
});
