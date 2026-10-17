# CDCS Contracts Landing Page — Build Plan

## 1. Project summary

Build a fast, mobile-first, single-page landing page for **CDCS Contracts**, the sole-trader B2B subcontract proposition of Chris Demetriou. The first release positions Chris as **Carpenter's Mate & Trade Support** for carpentry, joinery, refurbishment, and fit-out businesses around Stockport and Greater Manchester.

The central design device is a **digital contractor capability card**: a distinctive, highly scannable hero inspired by the usefulness of a CSCS card, without copying an official CSCS card or implying official endorsement.

### Primary outcome

A relevant business owner should be able to decide within seconds whether to contact Chris, then start a useful WhatsApp enquiry with minimal effort.

### Success signals

- The role, area, rate, current capabilities, and client fit are immediately understandable.
- The page does not imply that Chris is a qualified carpenter.
- The primary WhatsApp action is obvious and functional.
- The page feels credible and distinctive without looking like a generic trades website.
- The master brand can support future changes to the service descriptor.
- The page loads quickly and works cleanly across small phones, tablets, and desktops.

## 2. Scope

### In scope for version 1

- One responsive landing page
- Digital contractor-card hero
- Concise Experience section
- Concise What I Can Help With section
- Contact / availability section
- Google Reviews trust section linked to the verified CDCS Contracts Google Business Profile
- Primary WhatsApp CTA and secondary contact/availability CTA
- Responsive visual system and reusable design tokens
- Essential metadata, favicon, and social-sharing preview
- Accessibility, browser, content, and performance QA
- Static deployment and basic launch checks

### Out of scope unless separately approved

- Multi-page brochure website
- Blog or CMS
- Online booking or live availability calendar
- Customer portal
- E-commerce or payment collection
- Large project gallery
- Unverified testimonials, accreditations, client logos, or trade claims
- A new corporate identity that replaces CDCS Contracts
- Tracking, advertising pixels, or third-party widgets by default

## 3. Source-of-truth content

### Supplied working facts

| Field | Working content | Launch status |
|---|---|---|
| Brand | CDCS CONTRACTS | Confirm styling/case |
| Name | Chris Demetriou | Supplied |
| Current descriptor | Carpenter's Mate & Trade Support | Confirm final apostrophe/style |
| Area | Stockport / Greater Manchester | Confirm preferred hero wording and practical radius |
| Business model | Sole-trader B2B subcontract proposition | Supplied; confirm footer wording |
| Rate | £120/day CIS | Reconfirm immediately before launch |
| Audience | Carpentry contractors, joinery firms, refurbishment, fit-out | Supplied |
| Primary CTA | WhatsApp Chris | Number and URL are TBD |
| Secondary CTA | Check availability / contact | Final behaviour and details are TBD |
| Capability markers | CSCS, CIS, Own Transport, Tools/PPE as appropriate | Verify every marker and exact wording |
| Google Reviews | Verified CDCS Contracts Google Business Profile | Profile URL, Place ID, review-request URL, and integration setup are TBD |
| GitHub repository | `chrisdemetriouaudio/cdcscontracts.com` | Confirm it exists before first push |
| Intended local checkout | `/Volumes/01 PROJECTS/Claude/cdcscontracts.com` | Confirm the volume is mounted and folder state before setup |

### Required content before final build

- Approved WhatsApp number in international format
- Approved alternative contact method, if one will be published
- Exact wording and current status of CSCS and CIS references
- Confirmation of own transport
- Confirmation of which tools and PPE can accurately be stated
- Short, factual experience summary
- Specific tasks Chris can safely and competently support
- Any important exclusions or limits on scope
- Preferred working radius or travel wording
- Availability wording and how it will be kept current
- Verified Google Business Profile URL and ownership/access confirmation
- Google Place ID and official review-request URL
- Decision on Google Places API/component, billing, key restrictions, and privacy treatment
- Rate conditions, if any, and confirmation of VAT treatment before publishing related wording
- Approved legal/trading-name and footer details
- Privacy contact/details if a form or analytics is introduced

## 4. Proposed page structure

### A. Contractor card / hero

The hero should contain the full minimum proposition in a compact card:

1. CDCS CONTRACTS master brand
2. Carpenter's Mate & Trade Support descriptor
3. Chris Demetriou
4. Greater Manchester location
5. Verified capability chips
6. £120/day CIS rate line
7. “For carpentry contractors, joinery firms, refurbishment & fit-out”
8. Primary **WhatsApp Chris** CTA
9. Secondary **Check availability** or **Contact** CTA

The visual design may use card-like labels, ruled fields, status dots, restrained stamps, or reference-number styling. It must not reproduce official CSCS colours, layout, marks, holograms, or credential language closely enough to be mistaken for a CSCS product.

### B. Experience

Purpose: provide enough truthful context to make the proposition credible.

Required inputs:

- `[TBD: concise work-background summary]`
- `[TBD: relevant environments or project types]`
- `[TBD: verified evidence or examples, if publishable]`

Do not compensate for missing details with vague superlatives. A short factual section is better than inflated copy.

### C. What I Can Help With

Purpose: help a contractor match Chris to actual site needs.

Use a short, approved capability list. Until verified, retain placeholders such as:

- `[TBD: task/support item 1]`
- `[TBD: task/support item 2]`
- `[TBD: task/support item 3]`

Describe support rather than sole responsibility where that reflects the current level of competence. Do not list regulated, specialist, or qualified work without confirmation.

### D. Google Reviews

Purpose: add independently sourced trust without overwhelming the core B2B proposition.

Required behaviour:

- Retrieve the current aggregate rating, review count, and a small review selection from the verified CDCS Contracts Google Business Profile using an approved Google Maps Platform integration.
- Include required Google Maps attribution and visually associate each review with its returned author attribution.
- Link each displayed review to its source on Google Maps when the API provides the link.
- Include a clear **Read all reviews on Google** action.
- Include a subordinate **Leave a Google review** action using the official Business Profile review-request link.
- State how reviews are ordered or filtered; avoid editorial selection that gives a misleading impression.
- Preserve any required reporting, translation, date, or policy notices returned or mandated by the chosen integration.
- Do not hard-code copied review text as live Google data or store API content beyond current permitted limits.
- Never incentivise reviews.

Fallback behaviour:

- If API content is unavailable, retain a simple link to the verified Google Business Profile.
- Do not display a stale rating, fabricated count, blank carousel, or broken loading state.
- Hide the section entirely until the correct profile has genuine public reviews; retain the profile link only if it remains useful and verified.

Required inputs:

- `[TBD: verified Google Business Profile URL]`
- `[TBD: Google Place ID]`
- `[TBD: official Google review-request URL]`
- `[TBD: approved API/component and credentials strategy]`

### E. Contact / availability

Purpose: gather the details needed for a useful first conversation.

Include:

- WhatsApp action with a short pre-filled message
- `[TBD: phone and/or email, only if approved]`
- simple prompt for location, start date, duration, working hours, and required support
- honest availability wording that can be maintained
- response-time wording only if Chris can consistently meet it

### F. Footer

Keep the footer compact. Confirm the appropriate sole-trader/trading-name disclosure, privacy link or notice, copyright wording, and any required contact/address treatment before launch. Do not publish a private residential address without explicit approval and an appropriate need.

## 5. Content principles

- Lead with the current service level: **Carpenter's Mate & Trade Support**.
- Use plain British English and short, direct sentences.
- Speak to business buyers rather than domestic consumers.
- Prioritise evidence and logistics over marketing adjectives.
- Do not imply that Chris is a qualified carpenter.
- Treat every credential or capability chip as a factual claim requiring approval.
- Keep the rate prominent but easy to revise later.
- Make the current descriptor replaceable without reworking the brand or layout.
- Avoid testimonials, numbers, logos, and project claims until source material and permission exist.
- Keep Google review text, ratings, counts, attribution, and source links faithful to the approved integration; do not rewrite them as house copy.
- Keep Stockport available for supporting copy even if “Greater Manchester” is the cleaner hero label.

## 6. UX requirements

### Mobile-first behaviour

- Core proposition and primary CTA should appear in the first viewport where practical.
- The card should remain legible at 320 CSS pixels without horizontal scrolling.
- Long future service descriptors must wrap without breaking the design.
- Primary controls should have touch targets of at least 44 × 44 CSS pixels.
- CTA labels should be explicit; avoid icon-only actions.
- The reviews block should use a short vertical list or horizontally scrollable treatment only when fully keyboard- and screen-reader-accessible; avoid autoplay and carousel-only navigation.
- Sticky mobile CTA treatment may be tested, but it must not cover content or browser controls.

### Information and interaction

- The page should work without conventional navigation.
- If section links are used, keep them few and provide correct focus/scroll behaviour.
- Experience and capability content may use native disclosure elements if this makes the mobile page easier to scan.
- Essential qualifying information must not be hidden behind interaction.
- The WhatsApp action must make clear that it opens WhatsApp.
- The secondary action must not imply live scheduling unless a maintained system exists.

### Accessibility

- Semantic document structure and one clear primary heading
- Logical keyboard and screen-reader order
- Visible focus states
- Sufficient text and control contrast
- Status not communicated through colour alone
- Support for zoom and text resizing
- Reduced-motion support
- Descriptive link/button names
- Meaningful alternative text for informative images; empty alternative text for decoration
- Error handling and labels if a form is later added

## 7. Visual direction

### Recommended route

Use a dark or neutral field with a high-contrast contractor card, restrained accent colour, strong typography, small structured labels, and subtle material or grid details. The visual personality should come primarily from layout, typography, spacing, and information design rather than photography.

### Brand system requirements

- Master-brand treatment independent of service descriptor
- Reusable colour, spacing, type, radius, border, and elevation tokens
- Component styles for chips, details, CTAs, and section headings
- A monochrome-safe logo/wordmark treatment
- Room for later descriptors such as “Carpentry & Joinery Services”
- No visual dependence on one credential or the £120 rate

### Avoid

- Official-CSCS-card imitation
- Stock construction hero photography by default
- Hard-hat/roofline/crossed-tool clichés
- Hazard stripes as a dominant motif
- Faux-corporate scale
- Excessive animation, gradients, gloss, or texture
- Visual effects that compromise contrast or loading performance

## 8. Technical approach

### Phase-one recommendation

Use a simple static implementation—semantic HTML, modern CSS, and little or no client-side JavaScript—unless a confirmed hosting environment makes another stack materially easier. Centralise changeable content so the descriptor, rate, area, capabilities, contact details, and availability copy can be updated safely.

The intended source location is the GitHub repository `chrisdemetriouaudio/cdcscontracts.com`, with the local checkout at `/Volumes/01 PROJECTS/Claude/cdcscontracts.com`. Before setup, inspect both locations and preserve any existing files or history. Do not initialise, overwrite, force-push, or replace an existing repository without explicit confirmation.

### Technical requirements

- Responsive from 320 CSS pixels upward
- Progressive enhancement and useful behaviour if JavaScript fails
- Optimised SVG or raster assets with explicit dimensions
- No autoplaying media or large background video
- Minimal third-party requests
- Google Places data requested only when needed, with a documented loading strategy, current policy-compliant attribution, and a profile-link fallback
- API credentials restricted to the intended service, domain, and environment; no unrestricted secret committed to the repository
- Secure external links and valid WhatsApp URL construction
- Metadata for title, description, canonical URL, and social sharing
- Favicon/app-icon set
- Useful 404 page if supported by the host
- HTTPS and a single canonical hostname
- Source control and a documented deployment process
- No secrets or unnecessary personal information in the repository

### Performance targets

Treat these as project targets on a representative mid-range mobile viewport and throttled connection:

- No visible layout shift from fonts, images, or late card resizing
- Main proposition renders promptly and does not depend on JavaScript
- Keep initial page weight and request count deliberately small
- Avoid render-blocking third-party scripts
- Test with browser performance and accessibility tooling before launch

## 9. Phased delivery plan

### Phase 0 — Confirm facts and constraints

Deliverables:

- completed content questionnaire
- verified claims/credentials register
- agreed contact routes
- agreed rate wording
- verified Google Business Profile URL, Place ID, and review-request link
- agreed Google Reviews integration route, account ownership, billing, and credential handling
- confirmed access to the intended GitHub repository and local checkout
- hosting and live-domain decision
- approved definition of the current role and scope

Exit criteria:

- No critical hero fact is ambiguous.
- Unconfirmed facts are clearly excluded from launch copy.

### Phase 1 — Content and low-fidelity structure

Tasks:

- Draft hero copy and two alternative CTA labels.
- Draft Experience, What I Can Help With, and Contact content.
- Define the Google Reviews placement, fallback, and trust hierarchy without relying on unverified review data.
- Create mobile-first wireframe for the card and page flow.
- Test the five-second scan: who, what, where, rate, contact.
- Review all wording for qualification or competence overclaiming.

Exit criteria:

- Chris approves the content hierarchy and factual direction.
- Every unsupported claim has been removed or marked TBD.

### Phase 2 — Visual design system

Tasks:

- Produce one recommended visual route and one restrained variation if useful.
- Define typography, palette, spacing, border, elevation, chips, and CTA states.
- Test current and plausible future service descriptors.
- Create mobile, tablet, and desktop compositions.
- Check that the design cannot be mistaken for an official CSCS credential.

Exit criteria:

- Selected visual route is approved.
- Contrast, wrapping, focus, and small-screen behaviours are viable.

### Phase 3 — Build

Tasks:

- Create semantic page structure and central content configuration.
- Implement responsive contractor card and supporting sections.
- Implement the Google Reviews component with compliant attribution, source links, ordering disclosure, loading/error/empty states, and profile fallback.
- Add WhatsApp CTA with encoded draft message.
- Add secondary contact/availability path.
- Add icons/assets, metadata, favicon, and social-preview support.
- Add privacy or cookie handling only if chosen functionality requires it.

Exit criteria:

- Feature-complete page works locally with real approved content or explicitly tracked launch placeholders.

### Phase 4 — QA and refinement

Tasks:

- Run content, responsive, interaction, accessibility, performance, and browser checks.
- Test on at least one real iPhone-class device and one real Android-class device where available.
- Verify WhatsApp behaviour on mobile and desktop.
- Verify the Google profile, aggregate figures, review links, author attribution, ordering notice, review-request link, and failure fallback.
- Test that API keys/credentials are appropriately restricted and no secret is exposed in the repository.
- Review with the target audience perspective of a busy contractor.
- Remove unnecessary copy, code, assets, and requests.

Exit criteria:

- No launch-blocking placeholders or material defects remain.
- Final claims and contact details are approved by Chris.

### Phase 5 — Launch and observe

Tasks:

- Deploy to the approved domain/host.
- Verify HTTPS, canonical redirects, metadata, social preview, favicon, and 404 behaviour.
- Submit or configure search discovery only where appropriate.
- If analytics is approved, validate consent/privacy treatment and avoid collecting more data than needed.
- Perform a live-device CTA test.
- Record baseline enquiries and qualitative feedback without inventing success metrics.

Exit criteria:

- Live page matches the approved build.
- Contact routes work end-to-end.
- Ownership and update instructions are documented.

### Phase 6 — Post-launch review

After enough real visits or enquiries to be informative:

- Check whether prospects understand the role and rate.
- Review the quality, not just quantity, of enquiries.
- Identify questions repeatedly asked before engagement.
- Adjust content hierarchy or CTA message based on evidence.
- Reconfirm rate, availability wording, and capability markers regularly.

## 10. QA checklist

### Content and claims

- [ ] CDCS CONTRACTS spelling/case is consistent.
- [ ] “Carpenter's Mate & Trade Support” wording is approved.
- [ ] Copy does not imply Chris is a qualified carpenter.
- [ ] Experience and task claims have a source and approval.
- [ ] CSCS wording/status is exact and current.
- [ ] CIS wording is correct for the intended presentation.
- [ ] Own Transport and Tools/PPE claims are individually confirmed.
- [ ] £120/day CIS has been reconfirmed for launch.
- [ ] Area and travel wording are accurate.
- [ ] No testimonial, logo, statistic, or project claim lacks permission/evidence.
- [ ] Google rating, count, and review content come from the correct verified profile.
- [ ] Review content has not been invented, rewritten, or misleadingly selected.
- [ ] No TBD placeholder remains on the live site.

### UX and accessibility

- [ ] Who, what, where, rate, and primary action are quickly scannable.
- [ ] Page works at 320, 375, 390, 768, 1024, and wide desktop widths.
- [ ] No horizontal scroll or clipped text.
- [ ] Long descriptor and capability-chip wrapping are tested.
- [ ] Touch targets and spacing are comfortable.
- [ ] Keyboard order and focus styles are correct.
- [ ] Heading hierarchy and landmarks are meaningful.
- [ ] Text and controls pass contrast checks.
- [ ] Content works with 200% zoom/text enlargement.
- [ ] Reduced-motion preference is respected.
- [ ] Screen-reader names clearly describe all actions.
- [ ] Disclosures work with keyboard and assistive technology, if used.
- [ ] Reviews, attribution, author/source links, and controls are understandable by keyboard and screen reader.

### Functional and technical

- [ ] WhatsApp opens the correct approved number.
- [ ] Pre-filled WhatsApp message is encoded and readable.
- [ ] Secondary contact/availability action works.
- [ ] Telephone and email links are correct, if used.
- [ ] Internal links, external links, and back-button behaviour work.
- [ ] Page retains useful content if JavaScript is disabled or fails.
- [ ] Images have correct dimensions and alternative-text treatment.
- [ ] No missing files, console errors, mixed content, or broken requests.
- [ ] No secret or unintended personal data is present in source or metadata.
- [ ] Google API credentials are restricted appropriately and no unrestricted credential is exposed.
- [ ] Google review loading, empty, quota/error, and blocked-script states fall back cleanly.
- [ ] Google Maps/reviewer attribution, source links, ordering disclosure, and required notices are present.
- [ ] HTML/CSS validation issues with user impact are resolved.

### Performance and compatibility

- [ ] Initial page is tested on a throttled mobile connection.
- [ ] Fonts do not delay or destabilise the main content.
- [ ] Images/assets are appropriately compressed.
- [ ] No unnecessary third-party scripts or embeds remain.
- [ ] Layout shift and slow-loading content are investigated.
- [ ] Current Safari, Chrome, Firefox, and Edge are checked at appropriate widths.
- [ ] At least one real mobile-device test is completed where available.

## 11. Launch checklist

- [ ] Final content and claims approved by Chris
- [ ] Contact details and CTA destinations approved
- [ ] Rate and availability wording checked on launch day
- [ ] Appropriate sole-trader/trading-name disclosures reviewed
- [ ] Privacy/cookie requirements reviewed for actual site functionality
- [ ] Domain, DNS, HTTPS, and canonical hostname working
- [ ] Page title and search description checked
- [ ] Social-preview title, description, and image checked
- [ ] Favicon and device icons working
- [ ] Live WhatsApp test completed from phone and desktop
- [ ] Live secondary-contact test completed
- [ ] Correct Google Business Profile, Place ID, rating/count, review links, and review-request link confirmed
- [ ] Current Google Maps Platform attribution, storage, privacy, billing, and EEA requirements reviewed
- [ ] Google Reviews fallback tested on the live domain
- [ ] Analytics omitted or configured with appropriate privacy treatment
- [ ] Backup/source repository and deployment ownership confirmed
- [ ] Simple content-update instructions recorded
- [ ] 404 and common malformed URL behaviour checked
- [ ] Final live-page screenshot captured for reference

## 12. Known launch blockers

At the time of this plan, the following remain TBD and must not be invented:

- WhatsApp number
- alternative published contact details
- exact CSCS/CIS wording and verification
- verified Google Business Profile URL, Place ID, and official review-request URL
- Google Places integration choice, billing/account owner, and credentials strategy
- own transport, tools, and PPE details
- experience copy
- approved task/capability list
- scope exclusions
- availability wording
- working radius/travel wording
- rate conditions and any relevant tax/VAT wording
- live domain, hosting, and deployment stack (the intended GitHub repository and local checkout are already identified)
- footer/legal and privacy details

## 13. Google implementation references

Check these official sources again during implementation because API behaviour, terms, and attribution rules can change:

- [Places API policies and attribution](https://developers.google.com/maps/documentation/places/web-service/policies)
- [Place Details (New)](https://developers.google.com/maps/documentation/places/web-service/place-details)
- [Google Places review resource fields](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places)
- [Create a Google review link or QR code](https://support.google.com/business/answer/16816815)
