# RPG-20260714-09 — Act 1 Finale Proof

Packet: `[RPG-20260714-09]`

Branch: `feat/rpg-20260714-09-act1-finale`

Map delta: no street geometry; one new interior, the shared room, resolves at the existing Bungalow Living home position.

Save schema: unchanged at v11.

## Delivered beat

- Move-out readiness is now deliveries ≥ 5, delivery earnings ≥ Rp 600, first rent paid, and either driver rating ≥ 4.2 or Ibu Sari's completed guarantee scene. Goal copy and tests read those thresholds from the milestone constants.
- Once the numeric and rent conditions are met, Ibu's one-time warung scene acknowledges the app's worst-day rating and writes Made's recommendation letter. The letter is produced only by that scene.
- Made accepts Ibu's letter inside Bungalow Living, hands over the key, and starts a three-card packing/look-back/shared-room montage using the standard scrim treatment.
- Montage completion persists the home-base swap. All home, sleep, activity, marker, and guidance resolution then targets the modest shared room: two mattresses, a fan, and a bright window.
- The existing rental counter signs a weekly contract, retires the borrowed rattletrap, restores a maintained ride, and does not change rating or wallet money.
- Only the completed contract can fire the existing Act 2 intro card. The card is one-time and is the sole Act 1 → Act 2 boundary; numeric readiness alone no longer unlocks Act 2 surfaces.
- Ibu, Made, and Kadek retain move-aware ambient lines. The finale appends one Leo message for the later cadence packet to reconcile.

## Automated proof

`src/__tests__/act1Finale.test.ts` covers:

- the complete milestone truth table, including missing deliveries, earnings, rent, both rating/letter branches, and the exact 4.2★ edge when no reversal fired;
- the low-rating post-reversal path becoming ready through Ibu's letter without rating reset or grinding;
- letter provenance, Made-goal letter/key states, one-time key/montage/contract/card mutations, and ordered gating;
- home-base save/load before the key, during the montage, and after the persisted swap;
- weekly ride restoration without rating or money mutation;
- one-time Act 2 card behavior and the rule that readiness by itself does not unlock Act 2 systems;
- goal copy sourced from milestone constants and the gameplay-reachable `act1_finale_ready` boot history.

The standing first-hour, delivery, and meter-boundary tests were updated to cross the new authored finale rather than treating move-out math as an automatic act transition.

Full closure:

```text
npm test -- --run
49 test files passed · 323 tests passed · 0 skipped

npm run build
TypeScript + Vite production build passed
```

## Gameplay-reachable browser proof

`act1_finale_ready` composes the post-reversal state, completes a real eligible villa board run, resolves the Luxury Tip Dilemma through RETURN, and pays rent through the normal economy mutation. It reaches the finale with five deliveries, Rp 600 delivery earnings, rent covered, a 3.4★ post-downfall rating, and no recommendation letter.

Command:

```text
npm run beat-proof -- act1_finale_ready scripts/proofs/act1-finale.json
```

Result: passed in 38.90 seconds with zero browser/runtime errors.

1. [Ibu guarantee and recommendation letter](../tmp/beat-proof/act1-finale/01-ibu-guarantee-t+009.6s.png)
2. [Made goal: letter ✓ while rating still fails](../tmp/beat-proof/act1-finale/02-made-letter-condition-t+016.6s.png)
3. [Made accepts Ibu's paper and hands over the key](../tmp/beat-proof/act1-finale/03-made-key-t+023.9s.png)
4. [Packing the bleak kos](../tmp/beat-proof/act1-finale/04-pack-kos-t+025.0s.png)
5. [One look back](../tmp/beat-proof/act1-finale/05-look-back-t+027.0s.png)
6. [Shared-room montage card](../tmp/beat-proof/act1-finale/06-shared-room-card-t+028.8s.png)
7. [New shared-room interior and HOME marker](../tmp/beat-proof/act1-finale/07-new-shared-room-t+030.8s.png)
8. [Weekly rental contract at the existing counter](../tmp/beat-proof/act1-finale/08-weekly-contract-offer-t+036.4s.png)
9. [Contract signed: ride restored, rating unchanged](../tmp/beat-proof/act1-finale/09-contract-signed-t+036.8s.png)
10. [Existing Act 2 intro card at the authored boundary](../tmp/beat-proof/act1-finale/10-act2-card-t+038.8s.png)

## Persistence and boundary audit

- Pre-move saves still resolve the cheap kos. A key/montage-interrupted save resumes the montage, and a completed move resolves the shared room after reload.
- The swap uses existing collected-flag persistence plus a home resolver; no save field or migration was added.
- Rating remains whatever normal delivery play produced. Neither Ibu, Made, moving, nor the weekly contract resets it.
- Rent and delivery payouts are unchanged. No Act 2 system, furniture placement, street coordinate, or finale milestone beyond the packet changed.
