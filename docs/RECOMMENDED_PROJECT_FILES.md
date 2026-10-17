# Recommended Next Project Files

Create these in priority order. Keep the project lean; each file should answer a distinct question needed to design, build, or launch the page.

## Priority 1 — Needed before copy and design are final

### `CONTENT_SOURCE_OF_TRUTH.md`

**Purpose:** Hold the single approved version of every public fact and line of copy: brand, descriptor, location, rate, capabilities, experience, tasks, exclusions, contact details, CTA message, availability wording, Google Business Profile links/identifiers, and footer text.

**Why now:** It prevents inconsistent wording across mockups, code, metadata, and future updates. Give each factual claim a status such as `TBD`, `verified`, or `approved for publication`.

### `CONTENT_QUESTIONNAIRE.md`

**Purpose:** Gather the missing information from Chris in one pass, including exact credentials, practical capabilities, experience, tools/PPE, transport, work radius, availability, rate conditions, preferred enquiries, and contact details.

**Why now:** The current blockers are factual rather than technical. Completing this prevents polished but unsupported copy.

### `CLAIMS_AND_CREDENTIALS_REGISTER.md`

**Purpose:** Record each public claim, its precise wording, supporting evidence, expiry/review date where relevant, and whether it is approved for the website. Include the verified Google Business Profile identity, but do not duplicate or rewrite live Google review content here.

**Why now:** The contractor-card design makes credentials visually prominent, so claim control is essential. This file is particularly important for CSCS, CIS, transport, tools/PPE, qualifications, insurance, experience, and future testimonials.

## Priority 2 — Needed to align design and implementation

### `WIREFRAME.md` or `WIREFRAME.fig`

**Purpose:** Show the mobile-first information hierarchy, card anatomy, section order, CTA placement, and responsive notes before visual styling begins.

**Why next:** The page succeeds or fails on scan speed. A low-fidelity wireframe makes that testable before time is spent on finish.

### `DESIGN_SYSTEM.md`

**Purpose:** Define master-brand usage, descriptor handling, colours, typography, spacing, card structure, chips, buttons, focus states, responsive rules, and prohibited official-CSCS imitation.

**Why next:** It keeps the design distinctive and makes future descriptor changes inexpensive.

### `TECHNICAL_DECISIONS.md`

**Purpose:** Record the chosen stack, content structure, live domain/hosting, deployment method, asset strategy, analytics decision, privacy implications, and key alternatives considered. It should also record the confirmed GitHub repository `chrisdemetriouaudio/cdcscontracts.com` and local checkout `/Volumes/01 PROJECTS/Claude/cdcscontracts.com`.

**Why next:** A short decision record prevents accidental complexity and gives future maintainers a clear rationale.

### `GOOGLE_REVIEWS_INTEGRATION.md`

**Purpose:** Record the verified Business Profile URL, Place ID, official review-request URL, chosen Google API/component, field selection, attribution rules, review-order disclosure, loading/fallback behaviour, billing owner, credential restrictions, privacy implications, and review/update procedure.

**Why next:** Google review content carries external-service, attribution, storage, privacy, and credential requirements. Keeping the decision in one file makes implementation and future policy reviews safer.

## Priority 3 — Needed before launch and handover

### `QA_TEST_MATRIX.md`

**Purpose:** Turn the plan's QA requirements into test cases with device/browser, viewport, expected result, actual result, status, and evidence.

**Why later:** It becomes useful once an interactive build exists and creates a durable launch record.

### `DEPLOYMENT_AND_HANDOVER.md`

**Purpose:** Document domain/DNS ownership, host, build and deploy steps, rollback, contact-detail updates, rate/descriptor updates, credential review cadence, and account ownership.

**Why later:** It ensures Chris can safely maintain the live page without rediscovering the implementation.

## Optional only when justified

### `PRIVACY_NOTICE.md`

Create when the actual implementation collects personal data—for example through a contact form or analytics—or when review confirms it is otherwise needed. Base it on the real data flow; do not start from a generic policy full of irrelevant processing claims.

### `ASSET_REGISTER.md`

Create if the project gains photographs, third-party icons/fonts, client logos, testimonials, or certificates. Record source, licence/permission, allowed use, attribution, and optimisation status.

### `CHANGELOG.md`

Create once the live site begins receiving meaningful content or design revisions. It is unnecessary during the earliest prototype phase if source-control history is sufficient.
