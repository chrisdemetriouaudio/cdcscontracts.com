---
phase: 7
status: live
updated: 2026-10-17
---

# 💳 Phase 7 — Invoice & Card Payment

> [!info] At a glance
> **What:** every booking gets a private invoice link. It shows labour, the 20% CIS deduction and the amount to pay, with a card payment through Stripe **in test mode only**.
> **When:** 17 Oct 2026.
> **Status:** ✅ Live on book.cdcscontracts.com (17 Oct 2026). The live payment test is waiting for one tick from you.
> **Back to:** [[00 Dashboard]]

## 👉 To do

- [ ] 👉 **Tick "Verify you are human"** on the live booking form, then send it.
- [ ] 🛠️ **Pay the live test invoice** with test card 4242, then tick it here.
- [ ] 👉 **Check the business name** Stripe shows on the checkout page (Stripe → Settings → Public details).

## ✅ Done

> [!success]- Done 17 Oct 2026 (tap to open)
> - [x] **Built the invoice page:** a demo day rate of £150, CIS 20% taken off, and the amount to pay.
> - [x] **Added Stripe Checkout:** the code refuses any key that isn't a test key, so no real money can move.
> - [x] **Marked paid only after Stripe confirms it:** checked when the payer comes back, and by an optional signed webhook.
> - [x] **Linked the invoice** from the "request sent" screen and the confirmation e-mail.
> - [x] **Tested locally:** one week = £750, minus £150 CIS = £600; the 4242 test card paid it.
> - [x] **Saved the Stripe test key** as a private setting, never in GitHub.
> - [x] **Merged** pull request #4 (`d3296bf`).
> - [x] **Backed up the live database**, then added the payment columns (migration 0003).
> - [x] **Deployed** to Pages (`a5a4525e`). Checked: a fake invoice link is refused, an unsigned webhook is rejected.
> - [x] **Updated the Labs card:** Stripe tag and the invoice step (Labs `81efc43`).
