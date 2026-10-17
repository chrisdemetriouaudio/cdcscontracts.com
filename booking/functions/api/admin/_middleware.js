import { requireAdmin } from '../../_lib/auth.js';

const PUBLIC_PATHS = ['/api/admin/login'];

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (PUBLIC_PATHS.includes(url.pathname)) return next();

  const ok = await requireAdmin(request, env, env.DB);
  if (!ok) {
    return new Response(JSON.stringify({ ok: false, error: 'Not authenticated.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  return next();
}
