# Offline preview readiness

This checkpoint finishes the client-review version of Galaxy Car Lights while external services remain disconnected.

## Ready for review

- The V17 section order, responsive layout, gallery, designer, FAQ and mobile CTA remain in place.
- The enquiry form keeps vehicle, service, contact, notes and designer details, but only creates a local review while delivery is disabled.
- Preview validation shares the server's detail rules for year, phone, service, controls and add-on compatibility.
- Search indexing is disabled by default. A domain, approved copy and explicit `SITE_INDEXING_ENABLED=true` are required before indexing is enabled.
- A branded 404 page, robots route, sitemap route and social-card asset are included.
- The signature video respects reduced motion, pauses when hidden/offscreen, and has an accessible play/pause control.
- The static preview server returns real 404s, supports `HEAD`, byte ranges for video, and optional base paths.

## Verification

```text
node --test --test-isolation=none tests/contact.test.ts tests/site.test.ts tests/static-server.test.mjs
```

Result: **58 passing tests**.

```text
npm run typecheck
npm run lint
npm run build:static
```

All three checks pass. The normal server build was also compiled successfully in the prior Phase 3 verification; this environment may block Next's child-process type-validation worker during a repeated build.

## Still intentionally deferred

- Final domain, phone, Instagram, service area, hours and client-approved testimonials.
- Privacy/legal review and final social metadata approval.
- Resend/Postmark, Turnstile, shared rate limiting and real inbox delivery.
- Production hosting, DNS, HTTPS, security rules and deployment.
- Optional submission history in Supabase/PostgreSQL.

## Launch switch

Keep `CONTACT_DELIVERY_ENABLED=false` and `SITE_INDEXING_ENABLED=false` until the client supplies the values above. The static build always disables delivery, even if local server credentials exist.
