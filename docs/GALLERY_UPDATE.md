# Completed-installation gallery update

Preview: http://localhost:3001/#work

Replaced the three concept gallery photographs with three actual installation photographs identified and authorized by the user:

- `53ed956b-d615-4d16-99f6-ae7b5eb30bbf.jpg` — blue stars with warm gold roof accents.
- `3b84f357-55f6-4023-be3d-5514328041d8.jpg` — violet starlight and illuminated roof panels.
- `d99a1490-0253-46ea-bab3-0b045edca664.jpg` — electric blue ambient door and footwell lighting.

Exactly three photos appear in a clean three-column desktop layout, stacking on phones. Captions sit below the photographs; concept badges were removed and the section copy now identifies completed work. Quote links are preserved. The video and other supplied images are not used. Original files are unchanged; optimized WebP copies live under `public/images/install-*.webp`.

Changed: `data/projects.ts`, `components/sections/Gallery.tsx`, three new WebP assets and the asset documentation. Recovery snapshot: `work/before-real-gallery-20260907-215718.zip`.

Verification: lint, TypeScript and production build passed. Headless Edge checks passed at 1440 × 900, 980 × 900, 390 × 844 and 320 × 844: three loaded installation images, no gallery concept labels, no horizontal overflow, working quote destinations, zero console/page errors. Desktop and mobile crops were visually inspected.

Evidence: [desktop](../work/qa/real-gallery-desktop.png), [tablet](../work/qa/real-gallery-tablet.png), [mobile](../work/qa/real-gallery-mobile.png), [narrow](../work/qa/real-gallery-narrow.png), [check results](../work/qa/real-gallery-results.json).
