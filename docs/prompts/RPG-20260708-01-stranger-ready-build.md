```
PACKET ID: RPG-20260708-01
PROJECT:   Bali Life RPG
TARGET:    Codex
REASONING: medium — UI/menu wiring and a mailto feedback channel; no product-logic, schema, or loop risk
TITLE:     Stranger-ready build — title screen, safe reset, feedback channel, version stamp
PR TAG: [RPG-20260708-01]

===== BEGIN PACKET RPG-20260708-01 =====

ROLE & SCOPE
The public URL (https://johnswatica.github.io/bali-life-rpg/) currently boots a
cold stranger straight into the game with no title, no way to restart except
the F9 keybind, and no way to tell us anything. Under GATE v2
(docs/PHASE3_REEVALUATION_GATE.md), outside players are now the primary
feedback source — this packet makes the build survivable by someone who has
never seen it and gives their reactions a path back to us.

HARD CONSTRAINTS
- No backend, no analytics service, no network calls — the feedback channel is
  a prefilled mailto: link only. Session stats included in it are computed
  locally from existing world state.
- No save-schema change. The version stamp and menu state are not persisted
  game state.
- Keep the existing F9 dev reset working; the menu reset is an addition.
- The title screen must not break existing autoload behavior for returning
  players beyond one extra click ("Continue").

DELIVERABLES
1. Title screen shown on boot (DOM overlay, following the established
   bounds-safe overlay pattern): game name, "early test build" tag, a version
   stamp, and buttons — `Continue` (only when a save exists), `New Game`
   (with a type-nothing confirm step if it would overwrite a save), and
   `Send feedback`.
2. Version stamp: inject the short git hash + build date at build time via
   Vite `define` (a small `child_process` call in vite.config.ts is fine —
   CI checkout has git available; fall back to "dev" locally if it fails).
   Show it small on the title screen and include it in feedback mail.
3. `src/systems/feedback/SessionSummary.ts` (pure): world state -> a short
   plain-text summary (build stamp, current act, day, money, driver rating,
   completed deliveries, approximate minutes played this session, last
   objective line). Unit-testable.
4. `Send feedback` (title screen + Phone > Profile): opens
   `mailto:smartjonnyz@gmail.com` with subject "Bali Life RPG feedback
   <version>" and body = session summary + three blank prompts ("Where did
   you get bored?", "Where were you confused?", "Anything you liked?").
   NOTE FOR JOHN AT MERGE TIME: this puts that email address in a public
   repo/build — swap in an alias here if you don't want that.
5. An ESC/pause-menu entry `Reset save` buried below Resume, wired to the
   same confirm step as New Game.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; tests cover SessionSummary
  output shape and the title-screen state machine (save/no-save button
  states, confirm-before-wipe).
- Numeric bounds check of the title screen at the established six viewports.
- Screenshot of title screen + a sample generated mailto body pasted in the
  PR description.
- STATE.md bullet.

DO NOT
- Do not add accounts, cloud saves, telemetry, or any network call.
- Do not gate returning players behind anything more than one Continue click.
- Do not redesign the HUD or phone beyond the single feedback entry point.

===== END PACKET RPG-20260708-01 =====
```
