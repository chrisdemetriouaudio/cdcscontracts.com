// Home base: kept private. HOME_LAT / HOME_LON are Cloudflare secrets (and in the local,
// never-committed .dev.vars), so this public code never shows where Chris lives.
// Only the computed distance is ever sent to the client.
const FREE_RADIUS_MILES = 15; // one-way; beyond this, Chris may add a small travel contribution

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function onRequestGet({ request, env }) {
  const HOME_LAT = Number(env.HOME_LAT);
  const HOME_LON = Number(env.HOME_LON);
  if (!Number.isFinite(HOME_LAT) || !Number.isFinite(HOME_LON)) {
    return json({ ok: false, error: 'Distance check is not set up.' }, 503);
  }
  const url = new URL(request.url);
  const postcode = (url.searchParams.get('postcode') || '').trim();
  if (!postcode) return json({ ok: false, error: 'Missing postcode.' }, 400);

  const encoded = encodeURIComponent(postcode.replace(/\s+/g, ''));
  let res;
  try {
    res = await fetch(`https://api.postcodes.io/postcodes/${encoded}`);
  } catch {
    return json({ ok: false, error: 'Lookup unavailable.' }, 502);
  }
  if (!res.ok) return json({ ok: false, error: 'Postcode not found.' }, 404);

  const data = await res.json();
  const r = data.result;
  if (!r) return json({ ok: false, error: 'Postcode not found.' }, 404);

  const oneWay = haversineMiles(HOME_LAT, HOME_LON, r.latitude, r.longitude);
  const town = r.admin_district || r.parish || r.region || null;

  return json({
    ok: true,
    town,
    milesOneWay: Math.round(oneWay * 10) / 10,
    milesReturn: Math.round(oneWay * 2 * 10) / 10,
    withinFreeRadius: oneWay <= FREE_RADIUS_MILES,
    freeRadiusMiles: FREE_RADIUS_MILES,
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
