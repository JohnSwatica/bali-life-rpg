# RPG-20260714-10 — Leo Cadence + Wave 1 Reconciliation Proof

Packet: `[RPG-20260714-10]`

Branch: `feat/rpg-20260714-10-leo-glue-economy`

Stacked base: `[RPG-20260714-09]` commit `33cd990`.

Map delta: none.

Save schema: unchanged at v11.

## Delivered cadence

Three one-time Feed texts now follow the authored Act 1 milestones:

1. Kadek priority: Leo needles the player's “artisan detour.”
2. Breakdown: the existing Beat 3 text occupies this slot; no duplicate replacement text is added.
3. Finale: Leo gives grudging respect, then points to the unplayed streak lap, demands a rematch if the player beat him, or defends his win if he won.

Reached milestones enter one ordered pending queue carried by the existing `questFlags` map. A text posts only when no unread message from Leo exists. Reading the Feed releases at most the next pending text, so priority → breakdown → finale remains ordered and no save can accumulate more than one unread Leo text. Message IDs make each slot idempotent.

No scene, race rule, race result, phone hierarchy, or message system was added or changed.

## Economy reconciliation

The audit found one one-line data drift: the Act 0 catering definition lacked `countsTowardHustleProgress: false`, even though the delivery data contract and prior Wave 1 proofs say authored Act 0 runs do not enter Act 1's run milestone. The flag is now explicit. The gameplay-reachable proof histories consequently perform a real fifth Act 1 run. No payout, rent, rating, milestone value, or economy constant changed.

The Luxury Tip path was already correct: KEEP adds Rp 500 to wallet money and adds zero to both `deliveryEarnings` and completed delivery count. No tip behavior fix was required.

| Number of record | Reconciled result |
|---|---:|
| Move-out delivery floor | 5 Act 1 runs |
| Delivery-earnings gate | Rp 600 |
| Kadek one-time effective terms / clean cap | Rp 132 / Rp 142 |
| Kadek recurring premium effective terms / clean cap | Rp 142 / Rp 152 |
| Best normal effective terms at priority unlock | Rp 141 |
| Four-run fastest clean total | Rp 598 — not ready |
| Five-run fastest clean total | Rp 750 — earnings/count ready |
| KEEP tip contribution to delivery earnings | Rp 0 |

The recurring premium remains honestly premium at unlock (`142 > 141`) and four clean runs remain two rupiah short of the earnings gate as well as one run short of the count gate.

## Timing audit

The deterministic `wave1-fast-path` proof boots immediately after Leo's rate-cut encounter and uses the same gameplay mutations as the player path. It completes five Act 1 deliveries, two counter repairs, Made's room offer, the authored breakdown/push/dropoff, RETURN, rent, Ibu's letter, Made's key, the montage/home swap, weekly contract, and the Act 2 card.

Measured automation lower bound: **136.74 seconds (2.28 minutes)**. The harness navigates interiors but uses proof teleports for street routing, addresses deliveries directly, and reads instantly, so this is deliberately not presented as human duration.

| Human first-read model component | Assumption | Minutes |
|---|---|---:|
| Five pickup/ride/drop loops | 5 × 5.5 min: route reading, steering, cargo care, handoff | 27.5 |
| Venue/interior traversal + two repairs + rent | First-use navigation and counter comprehension | 9.0 |
| Story, board, goal, and Feed reading | ~1,300 surfaced words at 180 wpm | 7.2 |
| Choice/phone/goal comprehension dwell | Pauses before actions rather than instant automation | 9.0 |
| First-read route learning/recovery | Wrong turns, reorientation, no game-over penalty | 7.0 |
| **Modeled total** |  | **59.7** |

The bible target is ~60 minutes; its ±25% audit band is 45–75 minutes. The 59.7-minute model is inside the band, so no pacing constant was changed and no follow-up drift is flagged. A real human first-read timing pass is still required before replacing the model with observed duration.

## Automated verification

`src/__tests__/wave1Reconciliation.test.ts` proves:

- priority → breakdown → finale order, one-time IDs, deferred release, and at most one unread Leo text;
- all three race-state finale variants;
- Act 0 catering excluded from the five-run count;
- four-run Rp 598 / five-run Rp 750 boundaries;
- post-cut `premium 142 > best normal 141` terms;
- KEEP's Rp 500 wallet delta with zero delivery-earnings/count delta.

Full closure:

```text
npm test -- --run
50 test files passed · 329 tests passed · 0 skipped

npm run build
TypeScript + Vite production build passed
```

## Browser proof

Cadence captures, all from gameplay-reachable boot histories:

1. [Priority-list artisan-detour text](../tmp/beat-proof/leo-cadence-priority/01-artisan-detour-t+002.7s.png) — `act1_steady_runner`, passed in 2.82s.
2. [Single breakdown text after the prior slot was read](../tmp/beat-proof/leo-cadence-breakdown/02-breakdown-t+002.4s.png) — `act1_post_reversal`, passed in 2.49s.
3. [Finale respect + unplayed-race pointer](../tmp/beat-proof/leo-cadence-finale/03-finale-rematch-t+002.4s.png) — `act1_finale_complete`, passed in 2.46s.

Commands:

```text
npm run beat-proof -- act1_steady_runner scripts/proofs/leo-cadence-priority.json
npm run beat-proof -- act1_post_reversal scripts/proofs/leo-cadence-breakdown.json
npm run beat-proof -- act1_finale_complete scripts/proofs/leo-cadence-finale.json
npm run beat-proof -- act1_leo_resolved scripts/proofs/wave1-fast-path.json
```

The full fast path passed in 136.74s with zero browser/runtime errors and ended at [the Act 2 boundary with the new home active](../tmp/beat-proof/wave1-fast-path/01-act1-fast-path-complete-t+136.6s.png).

## Boundary audit

- No new system, scene, race behavior, map geometry, schema field, payout, rating, rent amount, or milestone value.
- The only product-data correction is the missing one-line Act 0 catering progress-exclusion flag found by the mandated audit.
- Proof hooks remain development-only and are absent from production output.
- Wave 1's numbers of record are now asserted together in one reconciliation suite.
