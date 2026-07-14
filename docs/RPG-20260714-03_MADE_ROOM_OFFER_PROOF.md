# RPG-20260714-03 — Made's Hidden Room Offer Proof

Packet: `[RPG-20260714-03]`
Branch: `feat/rpg-20260714-03-made-room-offer`
Map delta: none — the beat is staged in the existing Bungalow Living exterior/interior.

## Result

Act 1 TP2 now starts at the existing Steady Runner threshold (three completed
deliveries). Made sends one persistent Feed invitation, a `MADE` scene cue
appears at Bungalow Living, and Made is held in Bungalow Living's existing
interior slot until the player acts.

Talking to him opens a one-time full portrait dialogue scene. The described
reveal uses the existing interior: Made leads the player behind the fabric
racks to an unadvertised shared room. He states the two non-negotiable
conditions directly:

- Rent must never have been missed, using the existing rent due-day pressure
  state; no credit or financial-reputation system was added.
- The player needs a recommendation letter from a local business owner.

The scene makes one oblique kickback-subsidy plant and adds no letter path,
finale, or other Made arc. It writes only the existing `collectedPickups` flag
map, so schema remains v11. Once shown, the world cue and scene cannot recur.

The Phone > Quests surface then shows the standing goal:

```text
Made's room — rent record clean ✓/✗ · recommendation letter ✗
```

The rent condition reads the current existing rent state; the letter remains
intentionally unmet in this packet. Made's regular ambient dialogue repeats
the standing-offer conditions afterward.

## Beat-scoped browser proof

```bash
npm run beat-proof -- act1_steady_runner scripts/proofs/made-room-offer-steady-runner.json
```

Result: **passed in 17.45 seconds**. The authored `act1_steady_runner` state
contains exactly three counted deliveries and the existing Kadek residue. The
proof opens the real Feed, enters Bungalow Living through its normal door,
walks to Made's existing interior slot, triggers the normal NPC interaction,
and opens the normal Quests surface.

Screenshots written by the successful run:

- Feed invitation: `tmp/beat-proof/made-room-offer-steady-runner/01-made-invitation-t+002.2s.png`
- Bungalow Living world cue: `tmp/beat-proof/made-room-offer-steady-runner/02-bungalow-living-cue-t+003.1s.png`
- Made portrait dialogue/reveal: `tmp/beat-proof/made-room-offer-steady-runner/03-made-hidden-room-dialogue-t+010.2s.png`
- Tracked room goal and condition states: `tmp/beat-proof/made-room-offer-steady-runner/04-made-room-goal-t+017.4s.png`

## Automated verification

- `npm test -- --run` — **46 files / 293 tests passed, 0 skipped**.
- `npm run build` — **passed** (`tsc` + Vite production build).
- `src/__tests__/act1MadeRoomOffer.test.ts` covers the Steady Runner gate,
  persistent invitation/cue, one-time scene flag, Made's staged interior
  presence, rent condition states, permanently unmet letter state, ambient
  acknowledgement, and unchanged Act 1 milestone constants.

## Scope audit

- No map geometry, economy, rent amount, payout, deposit, delivery definition,
  move-out milestone, Act 0 flow, Kadek beat, Leo seam/race, Warung Rush, or
  breakdown-reversal code changed.
- `scripts/smokePlaythrough.mjs` remains unchanged from `main`; full smoke is
  correctly reserved for the Wave 1 gate.
- Beats 3–6 remain pending under `docs/ACT1_BACKBONE_2026-07-14.md`.
