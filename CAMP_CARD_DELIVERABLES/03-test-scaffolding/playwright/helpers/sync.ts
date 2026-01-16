// helpers/sync.ts (template)
// Replace with your real sync-wait logic (poll read models, status endpoints, etc.)
export async function waitForSync(opts: {
  fetchFn: () => Promise<{ ok: boolean; payload?: any }>;
  timeoutMs?: number;
  intervalMs?: number;
}) {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 1_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const res = await opts.fetchFn();
    if (res.ok) return res.payload;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Sync not completed within ${timeoutMs}ms`);
}
