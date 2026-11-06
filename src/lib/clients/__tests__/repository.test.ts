import { describe, it, expect, vi, beforeEach } from 'vitest';

// Minimal chainable fake of the Supabase query builder.
const result: { data: unknown; error: unknown } = { data: [], error: null };
const calls: string[] = [];
const builder: Record<string, unknown> = {};
for (const m of ['from', 'select', 'insert', 'update', 'delete', 'eq', 'order', 'single']) {
  builder[m] = vi.fn((...args: unknown[]) => { calls.push(`${m}(${args.map((a) => JSON.stringify(a)).join(',')})`); return builder; });
}
builder.then = (resolve: (v: unknown) => void) => resolve(result);
vi.mock('../supabase', () => ({ getSupabase: () => builder }));

const { updateClient, ClientConflictError } = await import('../repository');
const snap = { version: 1 } as never;
const details = { name: ' Acme ', contactName: '', contactEmail: '', notes: '' };

beforeEach(() => { calls.length = 0; result.error = null; });

describe('updateClient', () => {
  it('only overwrites the version that was loaded', async () => {
    result.data = [{ id: 'c1', name: 'Acme', contact_name: '', contact_email: '', notes: '', updated_at: 't2', updated_by_email: 'a@rula.com' }];
    const saved = await updateClient('c1', details, snap, 't1');
    expect(calls).toContain('eq("updated_at","t1")');
    expect(calls.some((c) => c.startsWith('update(') && c.includes('"name":"Acme"'))).toBe(true);
    expect(saved.updatedAt).toBe('t2');
  });

  it('reports a conflict when a teammate saved first', async () => {
    result.data = [];
    await expect(updateClient('c1', details, snap, 'stale')).rejects.toBeInstanceOf(ClientConflictError);
  });
});
