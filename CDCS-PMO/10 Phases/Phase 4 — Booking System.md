---
phase: 4
status: live
updated: 2026-10-17
---

# 📅 Phase 4 — Booking System

> [!info] At a glance
> **What:** contractors request dates from their phone; Chris approves, proposes or declines by e-mail link.
> **When:** 7 to 12 Sep 2026.
> **Status:** ✅ Live at book.cdcscontracts.com.
> **Back to:** [[00 Dashboard]]

## 👉 To do

- 💭 **Optional: WhatsApp alerts to you** aren't set up (no CallMeBot settings). E-mail alerts work.

## ✅ Done

> [!success]- Built 7 to 12 Sep 2026 (tap to open)
> - [x] **Built it on Cloudflare Pages** with a D1 database and server functions for booking, availability, review and admin (7 Sep 2026).
> - [x] **Request → review → approve, propose or decline → confirm,** with a calendar file for the contractor.
> - [x] **Added checks:** clashing dates, duplicate requests, single-use and expiring links, rate limits.
> - [x] **Added weekly days off** and blocked dates (database update 0002).
> - [x] **Added a distance check** by postcode: free within 15 miles one way.
> - [x] **Added a retry worker** that resends failed notifications every 15 minutes.
> - [x] **Notifications built in:** e-mail through Resend, WhatsApp alerts to Chris through CallMeBot (live set-up not re-checked yet).
> - [x] **Admin dashboard** behind a password, with sign-out.
> - [x] **Checked the live settings** (17 Oct 2026): password, salt, e-mail key and Turnstile are set; WhatsApp alerts are not.
> - [x] **Home location now private settings** (`HOME_LAT`, `HOME_LON`); distance check works (17 Oct 2026).
> - [x] **Fixed form errors:** only the missing field turns red, not all of them (PR #3, 17 Oct 2026).

> [!abstract]- 🧠 What this phase taught (tap to open)
> - Free tiers (Cloudflare, Resend) cover a one-person business with room to spare.
> - A booking is saved first and notified second, so a failed e-mail never loses a request.
