# Galaxy Car Lights

Production rebuild of the supplied Galaxy Car Lights HTML mockup using Next.js, TypeScript, and Tailwind CSS.

The immutable mockup is the visual reference. Do not redesign or replace source content until the parity checkpoint is approved. See [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) for phases, acceptance criteria, known gaps, and the production checklist.

## Local development

```bash
npm install
npm run dev
```

To create and inspect a client-only static preview:

```bash
npm run build:static
npm run preview:static
```

The generated files are written to `out/`. Static mode keeps quote delivery disabled; use the normal Next.js server build when the secure `/api/contact` endpoint is configured.

## GitHub Pages preview

The `Deploy static client preview` workflow publishes the static export at `https://marcusctookes22.github.io/galaxy-lights-demo/` after a push to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** once. This preview is intentionally client-only; quote delivery remains disabled until the server-backed production deployment is configured.

Before enabling contact delivery, copy `.env.example` to `.env.local` and provide the approved business and provider values. Never commit `.env.local`.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```
