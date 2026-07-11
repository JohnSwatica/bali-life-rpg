```
PACKET ID: RPG-20260708-07
PROJECT:   Bali Life RPG
TARGET:    Codex
REASONING: high — test infrastructure that drives real input through the whole core loop and touches the debug-snapshot surface; must be robust across interiors/mode-switches or it gives false confidence
TITLE:     Automated smoke-playthrough harness in-repo + make the ride leg observable (no retuning)
MAP DELTA: none — pure test infrastructure; no world geometry touched (ledger unaffected)
PR TAG: [RPG-20260708-07]

===== BEGIN PACKET RPG-20260708-07 =====

ROLE & SCOPE
The 2026-07-08 playthrough proved a headless harness can drive this game with
real keypresses and catch the bugs a static read misses — but it lived in a
scratchpad and got stuck in interiors. John has no time to hand-play; this
project NEEDS a repeatable automated smoke-playthrough that walks Act 0 end to
end and fails loudly when a beat regresses. Build it into the repo. Also make
the riding leg observable (speed/lean/drift readable) so ride FEEL can be
tuned later against GTA:CW pillar 1 — this packet makes riding measurable, it
does NOT retune it (tuning waits for human feedback per GATE v2).

CONTEXT / EXISTING SEAMS
- The debug snapshot `window.__BALI_LIFE_DEBUG__` already exposes player x/y,
  mode, act0Step, activeDelivery, prompt, fieldObjectiveLine, and (added
  2026-07-08) `objectiveTargets` and `interiorExit`. Reference harness logic
  lives in the session notes; DEV-only.
- System Chrome is available; use puppeteer-core against it (no bundled
  Chromium download) OR Playwright if already justified — implementer's call,
  keep it a devDependency, keep CI green without it (the smoke run is opt-in,
  not part of `npm test`).

DELIVERABLES
1. `scripts/smokePlaythrough.mjs` (or .ts): launches the dev/preview build
   headless, clicks New Game, and drives Act 0 boot→sleep by walking to
   `objectiveTargets[0]` each beat, entering/exiting interiors via
   `interiorExit`, and pressing E to interact. It asserts each beat advances
   (act0Step transitions in order) within a time budget and EXITS NONZERO with
   a clear message + screenshot on the first beat that fails to advance. Saves
   a screenshot per beat to `tmp/smoke/`.
2. Expose ride telemetry in the debug snapshot for observability: add the
   current `RideModelOutput`-derived values (speed, speedRatio, leanDegrees,
   drift) under a `ride` key when on bike, null otherwise. This is the same
   cheap DEV-friendly pattern as objectiveTargets/interiorExit.
3. The smoke script logs a short ride-telemetry summary across the BAKED→villa
   leg (min/avg/max speed, whether drift ever engaged, time-to-dropoff) so a
   human can later judge feel from real numbers instead of guessing.
4. An `npm run smoke` script and a short `scripts/README.md` explaining how to
   run it and read the output. Keep it OUT of `npm test` (it needs a browser +
   running server); it is a manual/CI-optional gate.
5. Fold the two 2026-07-08 debug fields (`objectiveTargets`, `interiorExit`)
   and the new `ride` field into the documented debug contract so they're
   understood as test infrastructure, not stray additions.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` still pass and are unchanged in
  spirit (the smoke run is separate).
- `npm run smoke` on a clean save drives Act 0 to `complete` (this REQUIRES
  RPG-20260708-04/05 to have fixed the onboarding + interior/scooter bugs —
  sequence this packet AFTER them; if run before, it should fail loudly at
  BUG-1, which is itself the correct regression signal).
- The PR includes one smoke-run log showing the beat-by-beat advance and the
  ride-telemetry summary for the first delivery.
- STATE.md bullet; DECISIONS.md entry establishing the smoke-playthrough as a
  standing regression tool.

DO NOT
- Do not change any ride constant in FeelTuning.ts — observe only; tuning is a
  separate, post-human-feedback packet.
- Do not add the smoke run to the default `npm test` or the Pages deploy
  workflow's required steps (it must not block deploys on browser flakiness).
- Do not build a general E2E framework — one focused Act 0 smoke path plus the
  telemetry, nothing more.

===== END PACKET RPG-20260708-07 =====
```
