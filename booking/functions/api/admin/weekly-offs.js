import { listWeeklyOffs, setWeeklyOff, removeWeeklyOff } from '../../_lib/db.js';

export async function onRequestGet({ env }) {
  const offs = await listWeeklyOffs(env.DB);
  return json({ ok: true, offs });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }
  const weekday = Number(body.weekday);
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return json({ ok: false, error: 'weekday must be 0 (Sunday) to 6 (Saturday).' }, 422);
  }
  await setWeeklyOff(env.DB, weekday, (body.reason || '').trim() || null);
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const weekday = Number(url.searchParams.get('weekday'));
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return json({ ok: false, error: 'weekday must be 0 (Sunday) to 6 (Saturday).' }, 422);
  }
  await removeWeeklyOff(env.DB, weekday);
  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
