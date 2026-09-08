# Galaxy Car Lights

Production rebuild of the supplied Galaxy Car Lights HTML mockup using Next.js, TypeScript, and Tailwind CSS.

The immutable mockup is the visual reference. Do not redesign or replace source content until the parity checkpoint is approved. See [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) for phases, acceptance criteria, known gaps, and the production checklist.

## Local development

```bash
npm install
npm run dev
```

Before enabling contact delivery, copy `.env.example` to `.env.local` and provide the approved business and provider values. Never commit `.env.local`.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```
