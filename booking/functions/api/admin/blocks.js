import { listAvailabilityBlocks, insertAvailabilityBlock, deleteAvailabilityBlock } from '../../_lib/db.js';
import { isValidIsoDate, nowIso } from '../../_lib/dates.js';

export async function onRequestGet({ env }) {
  const blocks = await listAvailabilityBlocks(env.DB);
  return json({ ok: true, blocks });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  const endDate = body.end_date || body.start_date;
  if (!isValidIsoDate(body.start_date) || !isValidIsoDate(endDate)) {
    return json({ ok: false, error: 'Enter a valid date range.' }, 422);
  }
  await insertAvailabilityBlock(env.DB, {
    id: crypto.randomUUID(), start_date: body.start_date, end_date: endDate,
    reason: (body.reason || '').trim() || null, created_at: nowIso(),
  });
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ ok: false, error: 'Missing id.' }, 400);
  await deleteAvailabilityBlock(env.DB, id);
  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
