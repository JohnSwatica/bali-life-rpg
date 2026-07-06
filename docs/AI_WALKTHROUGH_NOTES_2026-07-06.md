# AI Structural Walkthrough Notes — 2026-07-06

**This is NOT the human playtest (`PLAYTEST_01.md`) that `CLAUDE_PROJECT_REVIEW_2026-07-06.md` calls for.** It is a code/asset/screenshot-based structural pass by Claude — no hands, no eyes, no felt boredom or delight. It exists to front-load objective, checkable observations (timers, copy, HUD surface, missing assets) so the eventual human playtest can spend its 60 minutes on *feel*, not on re-discovering things a static read already shows. Treat every claim below as "verified from source/screenshots," not "verified by playing." **The real playtest is still outstanding and still requires John.**

## What was checked

- `src/systems/life/ActProgression.ts` (Act 0 step copy and cold-open text, verbatim).
- `src/data/deliveries.ts` (tutorial delivery timing/payout/meter deltas).
- `src/ui/hud/HudController.ts` (what's on screen from frame one).
- Existing screenshots under `tmp/road-continuity-proof-2026-07-03/` and `tmp/interior-proof-2026-07-03/` (most recent visual proof set in the repo).
- `npm test -- --run` and `npm run build` on `main` post-merge (176/176 passing, build green — this confirms the game *runs*, not that it *plays well*).

## Confirmed good

- Act 0 is genuinely tight: 5 steps (`meet_ibu_sari → pickup_first_delivery → dropoff_first_delivery → buy_meal_and_coffee → sleep_first_night → complete`), cold-open copy is ~50 words before the player is moving. This matches the GDD's 30–45 minute target structurally — the *copy* isn't the bloat risk here.
- The tutorial delivery (`first_baked_villa_delivery`) has a genuinely generous 90-in-game-minute window for a single pickup/dropoff — not a stress-inducing tutorial timer.
- Rent due day is hardcoded to Day 4 (`ACT1_INITIAL_RENT_DUE_DAY = 4`), matching the Story Bible's "Rp 450, Day 4" beat exactly. Design docs and code agree here — good sign the docs are being read, not just written.

## Confirmed gaps (objective, not a matter of taste)

1. **All four meters (E/W/F/S) render in the HUD from the very first frame** (`HudController.ts:197-200`), even though Act 0/1 only narratively need Energy + Money. This is the meter-clutter finding from the main review, now pinned to an exact line.
2. **Zero audio calls anywhere in `src/`** (confirmed again post-merge). Payout, pickup, and delivery-complete are silent by construction, not by an missed asset — there is no code path that would play a sound even if a file existed.
3. **The villa dropoff has no villa.** Screenshot `tmp/interior-proof-2026-07-03/12-villa-dropoff-at-gate.png` shows the delivery target resolved in open grass with no gate/wall/structure — the game's most-repeated destination (every tutorial + early board delivery ends here conceptually) currently has zero set dressing.
4. **The map's western half is undecorated grass** (visible in `tmp/road-continuity-proof-2026-07-03/01-fresh-boot.png`) — this is the space the review recommended filling with rice paddies, which would double as the antagonist's water-diversion plot made visible.
5. **Station menus are prose-first.** `tmp/interior-proof-2026-07-03/17-milk-madu-activity-menu.png` shows each of 3 choices carrying a full risk/reward paragraph; at a glance this reads as a form to fill out, not a scene to react to.

## Explicitly not assessed here (needs a human)

- Whether riding the scooter feels good moment-to-moment.
- Whether 90 minutes of in-game delivery time *feels* long or short at the keyboard.
- Emotional read of Ibu Sari's dialogue, Act 2 relationship beats, or any NPC voice.
- Whether the HUD's information density feels calm or busy in motion (static screenshots undersell/oversell this both ways).
- Any bug that only shows up through real input timing (the repo's own STATE.md already notes browser automation in this environment has historically been slow/unreliable for this reason).

**Bottom line for whoever reads this next:** this narrows *where* to look during the real playtest, it doesn't replace it. Write `PLAYTEST_01.md` from an actual 60-minute session before treating Act 0/1 pacing as tuned.
