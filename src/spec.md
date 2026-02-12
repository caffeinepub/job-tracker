# Specification

## Summary
**Goal:** Provide a job board and personal job application tracker for open Accounting and Analytics roles at Big 4 and mid-size accounting firms, with per-user data saved via Internet Identity.

**Planned changes:**
- Add Internet Identity sign-in/out and ensure tracker data (saved jobs, status, notes) is scoped to the signed-in user’s principal; allow unauthenticated browsing only.
- Implement a Motoko backend data model and API for firms, job postings, and user-specific tracking fields, including persistent storage across upgrades.
- Seed an initial firm directory with Deloitte, PwC, EY, and KPMG, plus an in-app UI to add/edit mid-size firms.
- Build the core Job Board UI with search and filters (firm, category, keyword across title/location), plus a job details view with posting link and tracking controls when signed in.
- Add a “My Tracker” view (signed-in only) showing saved jobs, filterable/grouped by application status, with quick status and notes updates.
- Provide authorized job maintenance tools: create/edit/close job postings and a bulk CSV paste import with row-level validation feedback.
- Add lightweight dashboards showing open job counts (by firm/category), user saved-job counts (by application status), and a simple trend view when datePosted exists.
- Apply a consistent warm-neutral visual theme (sand/cream/charcoal) with data-dense, readable tables/cards and a restrained non-blue/non-purple accent color.
- Generate and include static frontend-served visual assets (logo and empty-state illustration) and render them in the UI.

**User-visible outcome:** Users can browse and filter open jobs, sign in with Internet Identity to save jobs and track application status/notes, manage their saved-job tracker, view simple dashboards, and (when authorized) maintain job postings and bulk import via CSV, all within a cohesive themed UI.
