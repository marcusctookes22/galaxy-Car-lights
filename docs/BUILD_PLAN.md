# Galaxy Car Lights production build plan

## Scope and reference lock

The production site is a direct rebuild of the supplied single-file mockup in Next.js, TypeScript, and Tailwind CSS. Visual parity comes before redesign.

The attachment exposed by the referenced conversation is named `galaxy-car-lights-v7.html`, while the conversation calls it V17 and the HTML title says “V5.” To avoid silently choosing a version label, this plan identifies the immutable source by its contents:

- SHA-256: `0BD13EB589F7D9798DA31062978E882AFA813290DC433AFB37E571E9260A274D`
- Size: 5,307,304 bytes
- Role: immutable visual and structural reference; do not edit it in place

Its section order is: navigation, hero, stats, services, signature starlight feature, headliner designer, selected work, process, testimonials, quote form, FAQ, closing CTA, footer, and mobile CTA.

## Architecture

```text
Visitor
  -> Next.js site on Vercel
  -> POST /api/contact
       -> request-size guard
       -> Zod validation and normalization
       -> honeypot and consent checks
       -> Cloudflare Turnstile verification
       -> Cloudflare/Vercel rate-limit rule
       -> Resend delivery from an authenticated domain
  -> Galaxy Car Lights inbox (visitor address is Reply-To)
```

There is no database in the initial release. If the client later requires a submission history, the route can additionally write to Supabase/PostgreSQL after a retention and access policy is agreed.

## Phases

### Phase 0 — reference lock and decisions

- Inventory the source structure, content, interactions, breakpoints, remote images, demo values, and embedded assets.
- Record the reference hash and protect it from edits.
- Establish the lightest production architecture and unresolved business inputs.
- Define acceptance criteria and the launch checklist.

Exit: the source can be identified unambiguously and the team knows what is intentionally deferred.

### Phase 1 — application foundation and section shell

- Scaffold Next.js App Router, strict TypeScript, Tailwind CSS, linting, and reproducible scripts.
- Establish source-derived color, spacing, typography, border, and responsive tokens.
- Convert each page region into a focused reusable component.
- Move repeated services, projects, process steps, reviews, and FAQs into typed data modules.
- Preserve the source order, copy, dark/gold visual language, responsive behavior, and semantic landmarks.

Exit: the application builds, every V17 region is present in the same order, and the page is usable at desktop and mobile widths.

### Phase 2 — visual parity and prototype interactions

- Replace the temporary text brand with the approved optimized logo asset.
- Download, license-check, optimize, and localize approved photography.
- Match desktop and mobile layouts against reference screenshots at 1440×900, 980×900, and 390×844.
- Port reveal motion, hero star field, FAQ behavior, service preselection, and the complete headliner canvas designer.
- Confirm reduced-motion behavior, focus visibility, keyboard use, and touch targets.

Exit: agreed visual-diff tolerances pass and the prototype interactions work without console errors.

### Phase 3 — secure quote delivery

- Define and test the request/response contract before implementing it.
- Add the `/api/contact` route, Zod validation, input normalization, control-character stripping, explicit limits, honeypot, consent, Turnstile verification, and a small request body ceiling.
- Configure rate limiting at Cloudflare or Vercel so limits are shared across serverless instances; do not rely on in-memory counters.
- Send with Resend from an authenticated Galaxy address and set the visitor as Reply-To.
- Add accessible pending, success, field-error, rate-limit, CAPTCHA, and delivery-failure states.
- Log request IDs and coarse outcomes only; do not log full customer messages.

Exit: valid submissions reach the client, abuse paths fail safely, secrets remain server-only, and reply behavior is verified.

### Phase 4 — launch content, legal, and discovery

- Replace demo phone, social links, photography labels, and placeholder testimonials with client-approved content.
- Publish client/legal-reviewed privacy language and terms only if applicable.
- Add canonical URL, sitemap, robots, favicon/app icons, Open Graph image, local-business structured data, and a useful 404 page.
- Add consent-aware analytics only if requested.

Exit: no placeholder or prototype language remains and every public claim is approved.

### Phase 5 — verification, deployment, and handoff

- Run lint, typecheck, production build, automated route tests, keyboard checks, responsive browser checks, Lighthouse, and security-header verification.
- Deploy to Vercel preview, then production after client review.
- Put Cloudflare in front for DNS/security, configure HTTPS, WAF/rate limits, and Turnstile.
- Authenticate email with SPF, DKIM, and DMARC; test delivery and Reply-To.
- Document access ownership, environment variables, rollback, and recovery.

Exit: the production checklist is complete and the client owns the required accounts and access.

### Optional Phase 6 — submission history

Only after an explicit client requirement: add Supabase/PostgreSQL, a retention schedule, access controls, deletion/export procedures, and migration/backup verification. Do not add an admin portal implicitly.

## Acceptance criteria

### Visual and responsive

- The source section order and content hierarchy are unchanged until parity is approved.
- At 1440 px, 980 px, and 390 px widths there is no horizontal overflow, clipped text, overlapping fixed UI, or unreadable contrast.
- The near-black surfaces, restrained gold accent, light display type, serif emphasis, borders, image treatment, and spacing rhythm are visibly consistent with the reference.
- Mobile navigation traps no content, closes after selection, exposes its state to assistive technology, and does not hide focused controls.

### Functional

- Navigation targets, FAQ disclosure, service-to-quote selection, designer controls, preview download, and “use this design” work with keyboard, pointer, and touch where applicable.
- The quote form communicates pending, success, validation, anti-bot, rate-limit, and delivery-failure states without losing the visitor’s input.
- A valid submission produces one email with an authenticated From address and the visitor’s validated address as Reply-To.

### Security and privacy

- Zod validates on the server; browser validation is convenience only.
- Input lengths and request size are bounded; control characters and header-injection attempts are rejected or normalized.
- Honeypot, explicit consent, Turnstile, and shared edge/platform rate limiting are enforced before email delivery.
- API keys never enter browser bundles, repository history, logs, or error responses.
- CORS remains same-origin, security headers are enabled, and customer message bodies are not logged.

### Quality

- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- Automated tests cover valid input, missing/invalid fields, consent, honeypot, oversized values, CAPTCHA rejection, rate limiting, provider failure, and successful delivery.
- There are no known critical accessibility issues or browser-console errors in the supported viewport checks.

## Production checklist

### Client inputs

- [ ] Confirm business phone, email inbox, service area, hours, and appointment policy.
- [ ] Supply approved logo files and real project photography with usage rights.
- [ ] Replace demo testimonials with verified, approved reviews.
- [ ] Choose Resend or Postmark; this plan defaults to Resend.
- [ ] Decide whether analytics are required.
- [ ] Obtain legal review for privacy/consent wording and applicable terms.
- [ ] Confirm that submission history is not required for v1.

### Application

- [ ] Visual parity approved at desktop, tablet, and mobile checkpoints.
- [ ] Navigation, FAQ, designer, quote preselection, and mobile CTA tested.
- [ ] Empty, invalid, long, Unicode, and special-character form values tested.
- [ ] Pending, success, and all error states tested.
- [ ] Keyboard, screen-reader labels, focus order, contrast, and reduced motion checked.
- [ ] Images are approved, local/optimized, correctly sized, and have useful alt text.
- [ ] Metadata, structured data, favicon, sitemap, robots, canonical URL, and 404 are complete.
- [ ] No demo values, placeholder links, or prototype notices remain.

### Backend and security

- [ ] Zod validation and input normalization run server-side.
- [ ] Honeypot, consent, Turnstile, body-size guard, and shared rate limiting are active.
- [ ] Abuse, CAPTCHA bypass, repeated submission, header injection, and provider failure tests pass.
- [ ] Logs exclude customer message contents and unnecessary personal data.
- [ ] Environment secrets exist only in approved local/Vercel stores.
- [ ] Security headers and same-origin behavior are verified.

### Email, infrastructure, and handoff

- [ ] Domain is connected to Vercel through Cloudflare DNS.
- [ ] HTTPS is active and redirect/canonical behavior is correct.
- [ ] SPF, DKIM, and DMARC are configured and passing.
- [ ] Production delivery, spam placement, and Reply-To are tested.
- [ ] Turnstile production keys and rate-limit/WAF rules are active.
- [ ] Production environment variables are complete and preview values are isolated.
- [ ] Lighthouse/Core Web Vitals and mobile network behavior meet the agreed target.
- [ ] Client owns or has access to domain, Cloudflare, Vercel, and email-provider accounts.
- [ ] Rollback, recovery, and credential-rotation steps are documented.

## Phase 0/1 known gaps

- The attachment version labels conflict; the content hash is authoritative until the user supplies a differently hashed V17 file.
- The supplied logo is an embedded multi-megabyte PNG; it remains untouched and will be replaced by an approved optimized asset in Phase 2.
- Photography and testimonials are explicitly demo content and cannot ship without client approval.
- Real phone, inbox, domain ownership, social URLs, legal copy, and email-provider credentials are not yet available.
- Contact submission remains a later behavior slice so its security contract can be tested before implementation.
