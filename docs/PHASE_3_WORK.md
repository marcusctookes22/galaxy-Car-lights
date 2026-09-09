# Phase 3 — secure quote delivery

Authorized scope: `/api/contact`, server validation/sanitization, consent, honeypot, Turnstile, shared rate limiting, email delivery and the quote form integration. No deployment, submission-history database, marketing emails or Git push is included.

Isolation baseline: clean `main` at `400bd65`, tracking `origin/main`; one worktree. Existing imagery, designer behavior, service definitions and unrelated sections are protected. Planned changes: `app/api/contact/`, `lib/contact/`, `components/quote/`, `components/sections/QuoteSection.tsx`, `.env.example`, test tooling, focused tests and Phase 3 documentation.

Acceptance: invalid/oversized/cross-origin/unconsented/spam submissions never send; Turnstile checks signature via Siteverify plus hostname/action; shared counters reject excess attempts; failures preserve user input; success follows provider acceptance only; retries use an idempotency key; sender/recipient are server-owned; no secrets or customer contents in logs/responses.

Baseline: no API contact route exists, and current form only constructs a local preview. Automated checks will exercise the real handler with controlled external HTTP responses and browser form flows. Real provider credentials/domain verification are required for live delivery testing.

Next / upcoming task: implement and verify the Phase 3 delivery path, then independent security review.
