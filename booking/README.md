# CDCS Contracts — booking system

Booking-request system for cdcscontracts.com: contractors request dates from their phone,
Chris reviews and approves/proposes/declines by email link, contractor gets a confirmation
with a calendar file. Runs entirely on Cloudflare's free tier plus a free Resend account.

## What's live already

- **Cloudflare Pages project** `cdcs-booking` — deployed, serving the booking form and
  dashboard at `https://cdcs-booking.pages.dev` (add the custom domain — see below).
- **D1 database** `cdcs-booking-db` (`56bc9cc6-9d87-40c8-9434-51b2eaf55f52`) — schema applied.
- **Retry worker** `cdcs-booking-retry` — cron job every 15 minutes, retries failed
  notification sends in the background.
- Full request → review → approve/propose/decline → confirm flow, tested locally end to end
  (conflict detection, duplicate submission, single-use/expired links, rate limiting).

## What still needs your account setup (all free, no card required)

### 1. Custom domain
Cloudflare dashboard → Pages → **cdcs-booking** → Custom domains → Add `book.cdcscontracts.com`.
Since the zone is already on your Cloudflare account, this adds the DNS record for you.

### 2. Resend (email — free: 3,000/month, 100/day, no card)
1. Sign up at resend.com with `chris@cdcscontracts.com`.
2. Add domain `mail.cdcscontracts.com` (a subdomain, so it never touches your existing
   Zoho mail setup on the root domain — Zoho's MX/SPF on `cdcscontracts.com` are untouched).
3. Resend gives you 2–3 DNS records (SPF/DKIM as TXT/CNAME on `mail.cdcscontracts.com`,
   plus a return-path CNAME). Add them in Cloudflare DNS → wait for Resend to show "Verified".
4. Create an API key, then set it:
   ```
   npx wrangler pages secret put RESEND_API_KEY --project-name cdcs-booking
   ```
   Also set it on the retry worker:
   ```
   npx wrangler secret put RESEND_API_KEY --config retry-worker/wrangler.toml
   ```

**At the quota limit:** Resend queues/rejects further sends (HTTP 429) — nothing is ever
auto-upgraded to a paid plan. A rejected send is logged as `failed` and retried automatically
(every 15 min, plus whenever you open the dashboard) — the booking itself is never lost.

### 3. Cloudflare Turnstile (spam protection — free, unlimited, no card)
Dashboard → Turnstile → Add widget → domain `book.cdcscontracts.com` → Managed.
```
# put the Site Key straight in wrangler.toml (it's public by design):
#   TURNSTILE_SITE_KEY = "0x4AAA..."
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name cdcs-booking
```
Until this is set, the form works but spam-checking is skipped (fails open) — fine for
testing, set it before sharing the link widely.

### 4. WhatsApp alert to you (CallMeBot — free, personal use)
1. Save `+34 644 71 81 99` to your phone contacts (verify this is still current at
   callmebot.com/whatsapp before using — third-party numbers can change).
2. WhatsApp that number: `I allow callmebot to send me messages`.
3. You'll get an API key back by reply. Then:
   ```
   npx wrangler pages secret put CALLMEBOT_PHONE   # your number, e.g. +447356003438
   npx wrangler pages secret put CALLMEBOT_APIKEY
   npx wrangler secret put CALLMEBOT_PHONE --config retry-worker/wrangler.toml
   npx wrangler secret put CALLMEBOT_APIKEY --config retry-worker/wrangler.toml
   ```
This is a free third-party service built for exactly this (personal self-alerts), not an
official Meta product — reliable in practice, but not guaranteed by Meta. Email
notifications to you work regardless of whether this is set up. Swapping it for the
official Meta WhatsApp Cloud API later only means editing `functions/_lib/whatsapp.js`.

### 5. Dashboard password
```
node scripts/hash-password.js "choose a real password"
npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name cdcs-booking
# paste the printed value when prompted
```

### 6a. Home location for the distance check (private)
The distance check needs your home coordinates, kept as secrets so the public code never shows them
(they're also in the local `.dev.vars` for testing). Set them before the next deploy:
```
npx wrangler pages secret put HOME_LAT --project-name cdcs-booking
npx wrangler pages secret put HOME_LON --project-name cdcs-booking
```
Without them the distance check answers "not set up" (the rest of the booking form still works).

### 6. Two more required secrets
```
npx wrangler pages secret put IP_HASH_SALT --project-name cdcs-booking
# any random string, e.g. output of: openssl rand -hex 16
```

After setting secrets, redeploy so they take effect:
```
npx wrangler pages deploy public --project-name cdcs-booking
```

## Day-to-day use

- Contractors book at **book.cdcscontracts.com** (linked from the main site's "Request
  dates" button) or message WhatsApp directly (secondary option, unchanged).
- You get an email + WhatsApp ping per request, with a review link — no login needed to
  action it.
- **book.cdcscontracts.com/admin/** — password-protected dashboard: pending requests,
  a small calendar, search, block dates, retry failed sends.

## What was tested

Submit → owner review page → approve (with day-rate/date entry) → contractor confirmation
+ ICS; propose → contractor accept page → recheck-on-accept → confirmation; decline;
dashboard-native cancel; double-booking conflict rejected on both approve and accept;
single-use review/accept links (second attempt shows "already actioned"); duplicate
submission via idempotency key returns the original reference instead of creating a new
row; rate limiting (429 after repeated submissions from one connection); failed-send
logging and both manual and automatic retry; admin session cookie and 401 gating.

**Not yet tested:** real email delivery (needs Resend domain verification), real Turnstile
challenge (needs a live site key), real WhatsApp delivery (needs CallMeBot opt-in) — all
three are stubbed/fail gracefully until the account setup above is done.

## Project layout

- `public/` — the booking form (`index.html`) and dashboard (`admin/index.html`).
- `functions/` — Cloudflare Pages Functions (the API + review/accept pages).
- `functions/_lib/` — shared logic: db queries, email templates, WhatsApp, tokens, dates.
- `migrations/0001_init.sql` — D1 schema.
- `retry-worker/` — standalone cron Worker for background notification retries.
- `scripts/hash-password.js` — generates the dashboard password hash.
