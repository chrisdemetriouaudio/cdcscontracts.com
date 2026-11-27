# CDCS Contracts (demo)

A demo trade-support business. A building firm requests dates online, the owner approves by e-mail, and the firm pays an invoice by card.

**Live demo:** https://cdcscontracts.com

Everything here is a demo. Payments run in Stripe's test mode, and every page carries a THIS IS A DEMO watermark.

## The problem

A one-person trade business takes bookings by phone and text. Dates clash, requests get lost, and invoices go out late.

## What I built

- **A one-page site.** What the business does, with one button: Request dates.
- **A booking form.** The firm picks dates, gives the site postcode and describes the job.
- **A distance check.** A postcode look-up works out the travel distance and whether mileage applies.
- **Review by e-mail.** The owner gets single-use links to approve, propose other dates or decline.
- **A calendar file.** The firm gets an `.ics` file when dates are agreed.
- **Invoice and pay.** A private invoice link, with card payment through Stripe Checkout in test mode.
- **A safety net.** A small worker runs every 15 minutes and resends any notification that failed.

## How it works

| Where | What runs there |
|---|---|
| **GitHub Pages** | The one-page site (`index.html`) |
| **Cloudflare Pages Functions** | Booking, availability, review, admin and invoice APIs |
| **Cloudflare D1** | Bookings, payments, blocked dates and days off |
| **Cloudflare Worker** | The retry job, every 15 minutes |
| **Resend and Stripe** | E-mail, and test-mode card payments checked before a booking is marked paid |

## Where things are

| Folder | What |
|---|---|
| `index.html` | The one-page site |
| `booking/` | The booking system. Its own [README](booking/README.md) covers set-up. |
| `booking/functions/` | The APIs |
| `booking/migrations/` | The database tables |
| `booking/retry-worker/` | The retry job |
| `quote.html` | A draft quote calculator. `quote_1.html` to `quote_5.html` are earlier drafts. |
| `CDCS-PMO/` | Project notes: plan, decisions and changelog (an Obsidian vault) |
| `docs/` | The original plan |

No secrets are kept in this repo. Keys and the owner's location are private settings on Cloudflare.

## How this was built

I design the solution and direct AI coding tools to build it. I test it, and nothing ships until I sign it off.
