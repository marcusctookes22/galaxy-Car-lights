# Vehicle-specific copy and centered trails — September 7, 2026

Historical note: responsive star density and glass masking were subsequently updated in [RESPONSIVE_STAR_PREVIEW.md](RESPONSIVE_STAR_PREVIEW.md).

Removed public star quantities from the highlights strip, designer caption, accessible/fallback text, configuration summary, quote handoff and PNG filename. Related service, feature, studio and FAQ copy now focuses on layouts tailored to each vehicle. The internal illustration retains its visual detail without presenting a promised installation quantity.

Standard and panoramic sunroof previews now place three shooting-star trails through the center of the canvas. The roof illustration is painted first so it cannot obscure the centered effects. Other controls and the solid-roof trajectories are preserved.

Changed production files: `components/designer/HeadlinerDesigner.tsx`, its CSS module, `components/sections/StatsStrip.tsx`, `HeadlinerSection.tsx`, `StarlightFeature.tsx`, `data/services.ts`, `data/faq.ts`.

Verification:

- Acceptance check rejected the previous running build because public count claims remained.
- `npm run build` including TypeScript and `npm run lint` passed.
- `node work/qa-centered-trails.cjs` passed 27 layout/roof/viewport combinations at 1440, 390 and 320 pixels. Checked no public count claims, no count in accessible summary/export/quote handoff, centered trail coordinates and draw order, all remaining controls, animation, and no page errors or horizontal overflow.
- Evidence: `work/qa/centered-trails-results.json`, `work/qa/centered-*.png`. Desktop standard and panoramic, plus mobile panoramic screenshots visually inspected.
- Independent read-only source review `/root/service_review` found no blockers or non-blockers; parent reconciled the source review with the passing browser/build proof. Physical mobile devices were not tested.

Backups: `work/before-centered-trails.zip`, `work/HeadlinerDesigner.before-centered-trails.tsx`, `work/HeadlinerSection.before-no-count.tsx`. Same authorized non-Git workspace; original photos, reference HTML and unrelated work retained. No backend or deployment changes.

Local preview: http://localhost:3001/#headliner . Task-owned process at completion: 110344.

Checkpoint: isolation, observed baseline, proof and independent review reconciled. Next / upcoming task: none — sequence complete.
