# RPG-20260714-08 — Luxury Tip Dilemma Proof

Packet: `[RPG-20260714-08]`

Branch: `feat/rpg-20260714-08-luxury-tip-dilemma`

Map delta: none — the choice attaches to an existing upper-lane villa gate.

Save schema: unchanged at v11.

## Delivered beat

- The first completed villa-gate board delivery after the authored transmission reversal opens one `RelationshipChoiceScene`. The breakdown run itself cannot trigger the dilemma, even when its destination is a villa, and the resolved flag prevents repeats.
- The distracted guest says they sent Rp 50 while the receipt visibly says Rp 500. KEEP pays Rp 500 and leaves Platform-Efficiency residue; RETURN pays the intended Rp 50, leaves Community-Trust residue, and plants a villa regular who remembers the player on a later villa handoff.
- Both outcomes write a persisted ending-readable branch flag, one hidden red/green trust flag, and the existing relational/algorithmic reputation axis. Neither outcome changes driver rating or delivery earnings.
- Each branch adds exactly one later Feed echo. RETURN is the explicit ESC/skip default, so skipping cannot silently choose KEEP.
- The choice UI uses descriptive action copy only: no good/bad label, karma meter, rating change, lock, or mechanical punishment.

## Automated proof

`src/__tests__/act1LuxuryTip.test.ts` covers:

- reversal + villa-board completion gating, including non-villa and same-breakdown-run exclusions;
- one-time triggering and one-time payment;
- pending-choice save/load persistence and subsequent resolution;
- KEEP paying Rp 500 and writing Platform-Efficiency/red-flag residue;
- RETURN paying Rp 50 and writing Community-Trust/green-flag plus villa-regular residue;
- delivery earnings and driver rating remaining unchanged on both paths;
- one branch-specific Feed echo;
- the existing relationship-choice scene shape and ESC/skip resolving to RETURN.

`src/__tests__/devProofHarness.test.ts` additionally proves that `act1_post_reversal` reaches the Beat 4 gate through the real breakdown and repair mutations, retains the authored 3.2 rating, and restores a rideable scooter.

Full closure:

```text
npm test -- --run
48 test files passed · 316 tests passed · 0 skipped

npm run build
TypeScript + Vite production build passed
```

## Gameplay-reachable browser proof

The new `act1_post_reversal` boot state composes `act1_both_tps`, accepts and picks up an eligible board run, fires the deterministic transmission reversal through its public story mutation, completes the ruined delivery, and repairs the scooter at the existing counter mutation. It is not a hand-authored save fixture.

Commands:

```text
npm run beat-proof -- act1_post_reversal scripts/proofs/luxury-tip-keep.json
npm run beat-proof -- act1_post_reversal scripts/proofs/luxury-tip-return.json
```

Results: KEEP passed in 10.12 seconds; RETURN passed in 9.70 seconds. Both runs reported zero browser/runtime errors.

KEEP path:

1. [Mistaken Rp 500 transfer and neutral two-option scene](../tmp/beat-proof/luxury-tip-keep/01-tip-dilemma-t+009.3s.png)
2. [KEEP outcome with Rp 500 posted](../tmp/beat-proof/luxury-tip-keep/02-keep-rp500-t+009.5s.png)
3. [Platform-Efficiency Feed echo](../tmp/beat-proof/luxury-tip-keep/03-keep-feed-echo-t+010.0s.png)

RETURN path:

1. [Mistaken Rp 500 transfer and neutral two-option scene](../tmp/beat-proof/luxury-tip-return/01-tip-dilemma-t+008.9s.png)
2. [RETURN outcome with the intended Rp 50 posted and warm villa-regular plant](../tmp/beat-proof/luxury-tip-return/02-return-rp50-t+009.1s.png)
3. [Community-Trust Feed echo](../tmp/beat-proof/luxury-tip-return/03-return-feed-echo-t+009.6s.png)

## Boundary audit

- No finale, milestone, Act 2, race, street geometry, delivery-payout, rating, or lock change.
- The one-time tips affect wallet money only; they do not enter `deliveryEarnings`.
- No new choice, reputation, feed, or save system. Existing v11 flag maps, `RelationshipChoiceScene`, reputation-axis/hidden-flag helpers, and Feed messages carry the beat.
