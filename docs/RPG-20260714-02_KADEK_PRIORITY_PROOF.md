# RPG-20260714-02 — Kadek Priority List Proof

Packet: `RPG-20260714-02`
Branch: `feat/rpg-20260714-02-kadek-priority`
Map delta: none — the run uses the existing Canggu Station pickup, BAKED. Berawa interior/counter, authored roads, and upper-lane residence drop.

## Outcome

Act 1 TP1 is live after Leo's rate-cut encounter:

- A one-time, feed-flagged `SPECIAL · Kadek's rush-hour ingredients` order appears only after `rio_act1_rate_cut_encounter` resolves. Its fixed feed message says the order stays reserved, and the board entry remains available indefinitely until accepted.
- The order uses the normal delivery state machine, Canggu Station interior pickup, steering ride, cargo-integrity chip, existing hazards/contacts, and BAKED. interior counter dropoff. No new ride mechanic or map geometry was added.
- Completion always succeeds. Kadek's full portrait dialogue branches only on cargo condition: clean cargo earns a precise acknowledgement; rough cargo gets a dented-box acknowledgement and the same story progression.
- The one-time scene sets the priority-driver and scene-seen flags, applies the automatically eaten Focus Buffer pastry for 180 in-game minutes, and never fires twice.
- Priority membership reveals the recurring `PRIORITY · BAKED. fragile order`. It has one deterministic fragile condition, uses the ordinary rate cut, and is visually distinct on both board surfaces.
- Kadek's ambient dialogue thereafter acknowledges that the player is on his priority list.
- The only secret plant in the scene is: `The corporate people pay triple for these same hands. Don't ask why I know.` No brother, burnout arc, or sourdough-lab beat is opened here.
- The carried act-card defect is fixed by placing the existing cutscene overlay at a depth above every world-sprite y-depth. The player/scooter can remain centered behind the card, but neither can cover its scrim or copy.

Schema remains v11. Story/buff state uses the existing `collectedPickups` and `questFlags` maps.

## Economy check

All figures below are deterministic terms after the existing 15% Act 1 board-rate cut:

| Line | Authored base | Fragile margin | Effective terms | Clean payout cap |
|---|---:|---:|---:|---:|
| Kadek one-time rush | Rp 130 → Rp 111 | Rp 21 | Rp 132 | Rp 142 at 4.5★ |
| BAKED. priority recurring | Rp 145 → Rp 123 | Rp 19 | Rp 142 | Rp 152 at 4.5★ |
| Highest normal line available at priority unlock | — | — | Rp 130 | — |
| Act 0 lantern-villa setpiece | Rp 110 | Rp 150 | Rp 260 | Rp 286 shipped |

The premium recurring terms are above even the strongest normal condition available when the line unlocks (`Rp 142 > Rp 141`) and far below the Act 0 villa setpiece (`Rp 142 < Rp 260`). The rate-cut multiplier applies before the care margin, exactly as it does for every board delivery. Both high-fragility lines top out at 4.5★ through the existing condition-rating modifier; cargo quality still determines how much care margin survives.

Fastest clean path from this beat is still five runs:

```text
one-time rush + 3 priority runs = 142 + (3 × 152) = Rp 598  (< Rp 600)
one-time rush + 4 priority runs = 142 + (4 × 152) = Rp 750  (5 total runs)
```

Existing delivery definitions and the Rp 600 move-out milestone were not rebalanced.

## Automated verification

- `npm test -- --run` — **44 files / 283 tests passed, 0 skipped**.
- `npm run build` — **passed** (`tsc` + Vite production build).
- New deterministic coverage in `src/__tests__/act1KadekPriority.test.ts` proves Leo-flag gating, persistent reoffer, interior staging, clean/rough fail-forward completion, one-time flags, Focus Buffer expiry, recurring unlock, rate-cut behavior, and economy bounds.
- Project-native headless Chrome packet proof — **passed**, priority/scene/buff flags persisted, Kadek portrait found, **0 page/console errors**.
- The standing full Act 0 smoke run reached and captured the z-order regression state, then hit its movement-navigation timeout on the later lantern-villa leg (`player 1565,695`, target `1552,560`). This did not affect the packet-specific headless proof; no full-smoke pass is claimed here.

## Visual evidence

- Feed/board special offer: `tmp/kadek-priority-proof/01-feed-special-offer.png`
- Steering ride with fragile cargo chip: `tmp/kadek-priority-proof/02-fragile-rush-ride.png`
- Kadek full-dialogue portrait scene: `tmp/kadek-priority-proof/03-kadek-priority-scene.png`
- Pastry / Focus Buffer feedback: `tmp/kadek-priority-proof/04-focus-buffer-pastry-feedback.png`
- Recurring premium priority line: `tmp/kadek-priority-proof/05-priority-premium-line.png`
- Act-card z-order regression with centered player/scooter behind scrim and text: `tmp/smoke/10-landlord-ultimatum-t+107.9s.png`

## Scope audit

- No map delta, engine system, minigame, save-schema bump, Act 0 content change, Leo seam/race change, Made/Bungalow Living beat, Warung Rush change, or existing-delivery rebalance.
- Beats 2–6 remain pending under `docs/ACT1_BACKBONE_2026-07-14.md`.
