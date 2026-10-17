// WhatsApp alert to the owner only. Kept behind this one function so the provider
// can be swapped later (e.g. for the official Meta Cloud API) without touching callers.
export async function sendOwnerWhatsAppAlert(env, message) {
  if (!env.CALLMEBOT_PHONE || !env.CALLMEBOT_APIKEY) {
    throw new Error('CallMeBot not configured (CALLMEBOT_PHONE / CALLMEBOT_APIKEY missing)');
  }
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.CALLMEBOT_PHONE)}` +
    `&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}`;
  const res = await fetch(url);
  const body = await res.text().catch(() => '');
  if (!res.ok || /error/i.test(body)) {
    throw new Error(`CallMeBot ${res.status}: ${body.slice(0, 200)}`);
  }
  return body;
}
