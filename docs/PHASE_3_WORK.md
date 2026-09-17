# Phase 3 — secure quote delivery

Authorized scope: `/api/contact`, server validation/sanitization, consent, honeypot, Turnstile, shared rate limiting, email delivery and the quote form integration. No deployment, submission-history database, marketing emails or Git push is included.

Completion-pass baseline: clean `main` at `0f5f563`. No imagery, designer behavior, service definitions, Pages workflow, or unrelated sections changed. Work is limited to contact configuration, form API path, tests, setup tooling and documentation.

Acceptance: invalid/oversized/cross-origin/unconsented/spam submissions never send; Turnstile checks signature via Siteverify plus hostname/action; shared counters reject excess attempts; failures preserve user input; success follows provider acceptance only; retries use an idempotency key; sender/recipient are server-owned; no secrets or customer contents in logs/responses.

## Status

The contact API and review/consent/Turnstile/send flow are implemented. Live activation is pending provider setup and inbox verification. Success means Resend accepted the message; it does not prove inbox delivery. Failed requests retain form entries. There is no submission-history database.

The static-preview configuration regression was observed failing with complete fixture credentials, then passed after adding the unconditional static guard. All 51 handler tests, lint and the normal Next.js production build passed. Independent read-only review by `contact_review` on 2026-09-09 found no P0/P1 code defects; real Redis execution, enabled browser interaction and live inbox confirmation remain activation gates. Mocked tests do not establish these outcomes.

Final local checks also passed: standalone TypeScript check, static export, checker acceptance/rejection with synthetic configuration, and inspection of 21 exported text assets for configured server secrets. The export displays delivery as unavailable. Browser verification was attempted but the tool reported no available browser.

Actual Next.js HTTP smoke check on temporary port 3006: disabled POST returned 503 with no-store; unsupported GET returned 405. No email was sent. The temporary server was stopped afterward.

## Configuration

Use Node.js 24; tests and the checker run TypeScript directly. Copy `.env.example` to `.env.local` if it does not already exist. Never commit `.env.local`. The selected recipient is saved locally; the checked-in example stays generic.

| Variable | Value |
| --- | --- |
| `CONTACT_DELIVERY_ENABLED` | Keep `false` until setup is complete; `true` enables server delivery. |
| `CONTACT_EMAIL` | The inbox receiving quotes. |
| `CONTACT_FROM_EMAIL` | A sender on a domain verified in Resend, optionally `Galaxy Car Lights <quotes@your-domain.com>`. |
| `RESEND_API_KEY` | Server-only API key permitted to send from that domain. |
| `CONTACT_ALLOWED_ORIGINS` | Exact comma-separated origins, no paths or trailing slashes. Local example: `http://localhost:3000`; match the actual port. Production: the final HTTPS origin. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public key from a widget allowing the actual site hostname. |
| `TURNSTILE_SECRET_KEY` | Server-only secret from the same widget. |
| `UPSTASH_REDIS_REST_URL` | HTTPS REST endpoint of an Upstash Redis database. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only token permitting EVAL and the script's GET, TTL, INCR and EXPIRE commands. |
| `CONTACT_HASH_SECRET` | Random secret, at least 32 characters, stable across instances. |

Generate the hash secret locally if needed:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Run `npm run check:contact`. It prints missing variable names, never secret values. A passing result validates configuration format only; it makes no provider requests and sends no email.

Restart development after configuration changes. Configure settings before a server production build, and rebuild when they change: the homepage's enabled state and public Turnstile key are built into the page. Disabling server configuration also blocks the API even if an older built form is still visible.

## Provider setup

1. Verify a domain you control in Resend using its DNS records; create a send-capable API key. An Outlook address can receive quotes, but use your verified domain for the sender. See [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email).
2. Create a Cloudflare Turnstile widget for the real hostname. The client sets action `contact`; the server verifies that action and hostname. Tokens expire after five minutes and are single-use, so retries request a fresh check. Public test keys are rejected in production. Use a real widget for this app's strict hostname/action smoke check. See [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
3. Create Upstash Redis and copy its REST URL/token. Use a separate database for staging to avoid consuming customer limits. See [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

Vercel is the intended server host. Only its overwritten `x-vercel-forwarded-for` header is trusted when `VERCEL=1`; do not manually set that flag on another host. Other hosts use a shared fallback client bucket until a trusted-proxy adapter is implemented. See [Vercel request headers](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for).

Rate limits are five attempts per client bucket per ten minutes and 60 attempts globally per hour. Attempts include requests rejected later by validation/CAPTCHA. The Lua script updates counters atomically across instances. IPv6 clients share a /64 bucket. Redis stores only HMAC-derived identifiers and expiring counters, not raw IPs or quote contents. Avoid routine hash-secret rotation: it resets client buckets and changes retry keys.

Retries reuse a deterministic Resend idempotency key for the same submission ID and normalized email contents, even with a refreshed CAPTCHA. This is duplicate protection within Resend's idempotency window, not permanent deduplication. Reloading loses the in-memory submission ID and entries.

## Verification and activation

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run check:contact
```

Automated tests inject provider responses and cover valid submissions, services, normalization, strict validation, honeypot/consent, origins, body limits, CAPTCHA rejection, rate-limit/provider failures, sanitized errors, retries, trusted-IP bucketing, and disabled/incomplete/static configuration.

Before enabling customer submissions, verify on a server build with real credentials:

1. Review and send an authorized synthetic quote after consent/CAPTCHA; confirm inbox contents and Reply-To. Check the designer attachment and required-field errors too.
2. Edit after review and confirm consent/security verification renews. Exercise expired CAPTCHA and failed provider/network requests; confirm details remain and a fresh check permits retry without duplicate email.
3. In isolated staging Redis, confirm the sixth client attempt returns 429 with Retry-After, independent clients share the global limit, counters are shared across instances, concurrent attempts respect limits, and expiry permits later requests. Confirm Redis failure blocks sends.
4. Check mobile/desktop browser interaction and inspect network/client assets for errors or leaked server secrets.

## Static preview boundary

`npm run build:static` sets `STATIC_EXPORT=true`, which always disables delivery even with complete provider credentials. GitHub Pages supports reviewing details only. Actual delivery requires the normal Next.js server build. The form's API URL respects `NEXT_PUBLIC_BASE_PATH`.

Production hosting/domain deployment belongs to Phase 5. Provider setup and the live smoke checks above are the next event required to close Phase 3 fully.

Checkpoint: implementation and independent code review complete; local proof passed, live proof pending. No shipping action requested for this completion pass. Next / upcoming task: supply verified sender/provider configuration, run `npm run check:contact`, then perform the authorized live browser, Redis and inbox checks. Delivery stays disabled until these activation gates are satisfied.
