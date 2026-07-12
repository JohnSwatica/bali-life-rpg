# RPG-20260713-01 — Milk & Madu venue collision proof

## Root cause

Milk & Madu (`milk_madu_berawa`, curated id `milk_and_madu_berawa`) and Milu by Nook (`milu_by_nook`) are distinct real venues. Both coordinates resolved from separate OSM nodes and neither is an estimated/fallback pin. The collision came from the authored-street compression layer: adjacent storefront centers are 128px apart, but legacy OSM-era interaction radii could total more than that distance. Milu could therefore compete at Milk & Madu's exact quest point.

The fix retains both venues and caps every authored storefront interaction footprint against its nearest neighbour with an 8px gap. Shop radii now use the same authored footprint source instead of larger legacy radii.

## Sibling audit

The audit found the underlying radius mismatch was systemic across tightly packed same-side storefronts, not unique to Milk & Madu/Milu. No authored venue interaction-footprint overlaps remain after the cap. Slot geometry and venue positions are unchanged.

## Proof

- Automated interaction proof resolves Milk & Madu's authored objective point to `shop:milk_madu_berawa` with label `Enter Milk & Madu Berawa`.
- The layout invariant checks every distinct authored venue pair and reports zero overlapping interaction footprints.
- Fresh-save smoke trace at the objective: `nearest=Enter Milk & Madu Berawa player=2160,773`.
- Correct activity panel title: `tmp/smoke/07a-milk-madu-activity-panel-t+071.7s.png`.
- The same smoke run completes coffee, meal, kos sleep, and Act 0.
- The dedicated catering dropoff remains unchanged and completes before the cafe interaction.

Verification: `npm test -- --run` and `npm run build` pass; `npm run smoke` completes the fresh Act 0 route and mobile check.
