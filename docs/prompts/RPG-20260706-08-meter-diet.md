```
PACKET ID: RPG-20260706-08
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     Early-game meter diet — surface Energy + Money only until Act 2 introduces Social/Focus/Wellbeing
PR TAG: [RPG-20260706-08]

===== BEGIN PACKET RPG-20260706-08 =====

ROLE & SCOPE
Phase 2 packet 2. All four meters (E/W/F/S) render from the first frame
(`HudController.ts:197-200` at review time) while Act 0-1 only narratively
needs Energy + Money — the review called this "spreadsheet before story."
This packet stages meter VISIBILITY by act. Presentation only: all four
meters keep simulating underneath at all times.

HARD CONSTRAINTS
- Simulation unchanged: `WorldState.meters` keeps all four values live from
  minute zero; activity deltas, sleep recovery, morning penalties all still
  apply. ONLY HUD/phone visibility is staged. No save-schema change.
- Act staging: Acts 0-1 -> Energy micro-bar only (money already lives in the
  status chip). Act 2+ -> all four, permanently (once revealed, never
  re-hidden — a returning player must not lose UI).
- Reveal moment: when Act 2 begins, introduce the three new bars with a
  one-time beat — e.g. one line in the Act 2 card if RPG-20260706-07 landed
  ("There's more to a life here than energy and rupiah"), else a single
  toast. One sentence, no tutorial modal.
- Guardrail for hidden-meter effects: while Wellbeing/Focus/Social are
  hidden, low values must not produce visible consequences the player can't
  diagnose. Audit Act 0-1 read models (`HustleGoals`, `StationRecovery`,
  activity gating): where a hidden meter drives copy or a block during Acts
  0-1, either route the message through Energy/rest framing ("You're running
  on fumes — take a proper break") or relax the gate until Act 2. List every
  such site in the PR description.
- Phone > Profile/meter table applies the same staging.

DELIVERABLES
1. `src/systems/guidance/MeterVisibility.ts` (pure read model):
   world state -> which meters are surfaced. Single source of truth consumed
   by HUD micro-bars and Phone surfaces.
2. HudController + PhoneShell wired through it.
3. The one-time Act 2 reveal beat.
4. The Act 0-1 hidden-meter message audit + rewordings.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; tests cover the read model
  (act boundaries, never re-hide) and at least one reworded guidance path.
- firstHourProof path passes unchanged.
- Screenshots at 1280x800: Act 0 HUD (one bar) and Act 2 HUD (four bars)
  under `tmp/`.
- STATE.md bullet + DECISIONS.md entry — this adjusts a long-standing HUD
  decision, so the rationale (review finding, simulation untouched,
  visibility-only) must be logged.

DO NOT
- Do not remove/alter meter simulation, activity deltas, or sleep effects.
- Do not hide the money readout at any point.
- Do not add a settings toggle for meter visibility — act-staged, not
  user-configured.

===== END PACKET RPG-20260706-08 =====
```
