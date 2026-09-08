# Service update — September 7, 2026

Updated the service list to Starlights, Ambient Lights and Rock Lights, following the user's explicit clarification. Shooting Star is an optional starlight effect. The three actual installation photos remain in the inspiration gallery.

## Changes

- `data/services.ts`: three service entries shared by the services section, footer and enquiry radios.
- `components/quote/QuoteForm.tsx`: optional Shooting Star checkbox for Starlights without an attached design; includes the choice in the local preview only when applicable. Attached designs retain their own effect selections.
- `components/designer/HeadlinerDesigner.tsx`: Shooting Star label and explicit on/off summary transferred to the quote form.
- `components/sections/Hero.tsx`, `components/layout/Navbar.tsx`, `app/layout.tsx`, `lib/site.ts`: consistent service copy and metadata.

## Verification and review

- Baseline browser observation: four old services and no Shooting Star checkbox, establishing the missing behavior before edits.
- `npm run lint`, `npm run typecheck`, `npm run build`: passed.
- `node work/qa-services.cjs`: passed at 1440, 390 and 320 pixels. Checked service/footer preselection, optional effect on/off, exclusion from Ambient Lights and Rock Lights previews, attached design on/off handoff, concept removal, gallery count and horizontal overflow. No page errors.
- Evidence: `work/qa/services-results.json`, `work/qa/services-*.png` and `work/qa/services-quote-*.png`. Desktop service and mobile quote screenshots visually inspected.
- Independent read-only reviewer `/root/service_review`: Looks good; no blockers or non-blockers. Parent verified the reviewed code paths and browser results. Physical mobile devices were not tested.

## Recovery and checkpoint

Existing user-authorized workspace retained; Git checks confirmed no repository. Scope was limited to the files above plus verification artifacts. Pre-edit backup: `work/before-services-20260907.zip`. Reference HTML and original photographs were protected and unchanged.

Implementation isolation, red, proof and checkpoint gates passed. Handoff to Change Review carried the user-confirmed scope, affected files, baseline, proof, and local-only constraints. Independent Review Gate passed. No deployment or backend changes requested or performed. Enquiries remain local previews and send nothing.

Local preview: http://localhost:3001/#services . Task-owned preview process at completion: 118540.

Next / upcoming task: none — sequence complete.
