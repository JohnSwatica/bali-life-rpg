# WAVE 0 GATE REVIEW — the first ten minutes (2026-07-14)

First per-wave AI playthrough gate under LAUNCH_PLAN_SEASON1_2026-07-14.md.
Instrument: fresh `npm run smoke` on merged `main` (`9b4676c`), full screenshot
review of all 21 beats, code-level pacing model. Verdict at bottom.

## Run evidence

- Fresh save → Act 1 morning hand, zero browser errors.
- New Game → first live stakes: **50.8s** (budget <3:00 ✓).
- Act 0 unskipped deterministic runtime: **229.0s**; storm fired exactly once;
  **critical-path menu opens: 0** (the menu rule holds) ✓.
- 390x844: 6 controls, all in bounds ✓.

## Pacing model (the 9–11 min target, no human tester)

The 229s machine run reads instantly and drives perfect lines. Modeled
first-read human deltas: ~420 words of critical-path authored text at 200wpm
(+~85s over machine card minimums), 1.7× navigation inefficiency on ~120s of
movement (+~85s), choice/phone deliberation (+~20s), first-time
looking-around (+~30–60s).

**Estimate: ~7:40, range 7:00–9:30.** Slightly under the 9–11 script target —
and that is the right side to miss on for a hook-or-die audience. No beat
drags; nothing needs inflating. Pacing: **pass, do not pad.**

## Rubric scores

| Pillar (benchmark) | Score /5 | Evidence |
|---|---|---|
| Opening flow (Pokémon) | 4.5 | Playing in <1 min, meaningful choice at 0:50, stakes rise beat over beat |
| Ride feel (GTA:CW) | 4 | Three escalating rides (time → storm → fragile night); hazards live. Smoke shows `driftEngaged=false` — drift feel never surfaces on the critical path (tuning note for Wave 1, not a blocker) |
| City legibility | 3.5 | Night + storm stay readable; lantern pools work |
| Mission variety / verbs | 4 | RIDE/TALK/phone all present; zero menus on path |
| Social warmth (Stardew) | 3 | Ibu's voice lands; Vance/LEO plants work. The landlord resolve is an act card in an EMPTY dark room — the one beat with no human presence where the fiction demands one |
| Presentation/readability | **2** | See misses — this is the gate's finding |

## Misses (→ RPG-20260714-01)

1. **Act-card text illegible over bright/mid scenes — 3 of 10 beats.**
   `07` Vance's card ("JULIAN VANCE · AT THE COUNTER" + his line) is pale
   text on tan floor — his one planted line cannot be read. `10` the landlord
   ultimatum — THE midpoint reversal, whose entire content is its text — is
   washed out over the bright rain-lit field. `13` "THE LANDLORD COUNTS
   TWICE" is gray-on-dark and occluded by the objective arrow. The Act 1
   letterbox cards read fine; over-world cards have no scrim. One systemic
   fix.
2. **Deposit HUD chip clips offscreen during letterbox** (`10`, `11`): the
   beat that introduces the deposit target half-hides its own number.
3. **Toast bleed into story moments** (`11`): "Map updated: Tygr Sushi…"
   renders through the villa surge phone panel mid-beat.
4. **Placeholder-looking gray pills** beside the NusaDrop leaderboard rows
   (`08`) read as unfinished UI in the game's single most app-like moment.
5. **Landlord absent from the landlord scene** (`13`): stage a figure at the
   kos door for the resolve beat (existing NPC sprite machinery; no new
   dialogue system).
6. **Payout celebration contrast at night** (`12`): "Delivered +Rp 272" is
   faint gray over the wet street at the emotional peak.

## Verdict

**Wave 0 gate: CONDITIONAL PASS.** Mechanics, pacing, structure, and the
menu rule all hold; the ten minutes are structurally the game we designed.
Blocking condition: RPG-20260714-01 (presentation polish, all six misses)
merges before Wave 1 content begins. No design changes required.
