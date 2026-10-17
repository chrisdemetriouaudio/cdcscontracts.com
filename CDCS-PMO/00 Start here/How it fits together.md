---
title: How it fits together
updated: 2026-10-17
---

# 🗺️ How it fits together

> [!info] At a glance
> **What:** where each part of CDCS Contracts lives, and how it's put live.
> **One folder, one repo:** `/Volumes/01 PROJECTS/Claude/cdcscontracts.com` = GitHub `chrisdemetriouaudio/cdcscontracts.com` (public).
> **Back to:** [[00 Dashboard]]

## 🧱 The parts

| Part | Where it lives | How it goes live |
|---|---|---|
| Website (cdcscontracts.com) | `index.html`, `CNAME` | GitHub Pages, from `main`, a minute after a push |
| Booking system (book.cdcscontracts.com) | `booking/` | Cloudflare Pages project `cdcs-booking`, deployed with Wrangler |
| Retry worker | `booking/retry-worker/` | Cloudflare Worker `cdcs-booking-retry`, every 15 minutes |
| Quote Engine | `quote*.html` (6 drafts) | Not published |
| Plan and rules | `docs/` | Not published |
| This vault | `CDCS-PMO/` | Not published (kept off the website) |

## 🔒 What never goes on GitHub

- **`booking/.dev.vars`:** the local secrets (password hash, salt, e-mail key, home location).
- **`.wrangler/`** folders: local caches.
- `.gitignore` enforces both. `_config.yml` keeps everything except the landing page off the website.

## ☁️ Cloudflare

- **The booking system** lives in the Cloudflare account **Resale-regroup-fax@duck.com's Account**. It's not the same account as Genesis/Labs or R.E.A.CH.
- **Deploying it** (signed in to that account, kept separate from other logins): `cd booking && XDG_CONFIG_HOME="$HOME/.config/cdcs-cloudflare" npx wrangler pages deploy --project-name cdcs-booking --branch main`, then `npx wrangler deploy --config retry-worker/wrangler.toml`.
- **The domain's DNS** (cdcscontracts.com) is on Cloudflare; **e-mail** (Zoho) is on the root domain.
