---
title: Changelog
updated: 2026-10-17
---

# 📜 Changelog

> [!info] At a glance
> **What:** everything that went live, newest first.
> **How to read:** tap a date to open it. Only the newest is open.
> **Back to:** [[00 Dashboard]]

> [!success]+ 🚀 17 Oct 2026 · Booking form errors fixed · live
> - **What changed:** when a field is missing, only that field turns red with its own message (it used to turn every field red). The red clears as you type.
> - **Released:** pull request #3 (`69c0af6`); Pages deployment `55d00e3e`.

> [!success]- 🚀 17 Oct 2026 · Booking system redeployed · live
> - **What changed:** book.cdcscontracts.com has the demo watermark and new wording, with no name, WhatsApp link or number.
> - **Private home location:** the distance check now reads `HOME_LAT`/`HOME_LON` settings (checked: Manchester M1 = 9.1 miles).
> - **Released:** Pages deployment `3970a843`; retry worker version `4fd5e6c7`.
> - **Rollback:** Cloudflare dashboard → Pages → cdcs-booking → Deployments → `f5d07d48` → Rollback.

> [!success]- 🚀 17 Oct 2026 · Demo brand and watermark · live
> - **Landing page:** C D Construction Services, CD monogram, "WhatsApp me" with no link, THIS IS A DEMO watermark (`340f641`).
> - **Booking pages:** same changes in the code; live after the next booking deploy.
> - **Labs:** the CDCS card is labelled Demo with the new screenshot.

> [!success]- 🔗 17 Oct 2026 · Everything on GitHub; this vault
> - **Synced:** the booking system, Quote Engine drafts and plan are now in the repo (`7f126ec`). Secrets stay local.
> - **Privacy:** the home location is no longer in the code.
> - **Website:** unchanged; nothing new published.

> [!success]- 🚀 7 to 12 Sep 2026 · Booking system · live
> - **book.cdcscontracts.com:** request dates, approve by e-mail link, calendar file, retries.

> [!success]- 🚀 8 Sep 2026 · Hero card reworked · live

> [!success]- 🚀 7 Sep 2026 · "Request dates" becomes the main button · live

> [!success]- 🚀 1 Sep 2026 · cdcscontracts.com goes live
> - **First page** and the custom domain on GitHub Pages.
