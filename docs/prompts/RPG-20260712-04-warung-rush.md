```
PACKET ID: RPG-20260712-04
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Terra · Medium — self-contained new minigame wired through the existing committed-activity/minigame framework; multi-file state work but a clear contract
CODEX-PREREQ: run after RPG-20260712-01 (v4 names) — independent of 02/03
TITLE:     Warung Rush v1 — a Diner-Dash-style service minigame at Ibu Sari's warung
MAP DELTA: none — plays inside the existing Warung Sari interior; no world geometry
PR TAG: [RPG-20260712-04]

===== BEGIN PACKET RPG-20260712-04 =====

ROLE & SCOPE
PLAYTEST_01 problem 3, second mandate: a Diner-Dash-style flow game for
restaurant missions. This is also the future Café Service Rush (GDD Tier 1,
Act 3 endgame) — so build it now at Ibu's warung as a repeatable Act 1
opportunity, and the Act 3 café inherits a proven mode later. It must be a
genuinely DIFFERENT play pattern: spatial multitasking under time pressure,
not a timing bar.

THE MODE (design contract)
- Trigger: an authored opportunity/activity at Warung Sari ("Ibu needs a
  hand — lunch rush"), 1-2x per day availability, entered like other
  committed activities.
- Play (~60-90s round, inside the existing interior): 2-4 customer sprites
  arrive at tables/counter with pictured orders (existing item icons); the
  player physically WALKS between counter and tables — pick up the right
  dish at the counter, deliver to the right customer before their patience
  ring empties. Orders overlap; the juggle is the game.
- Scoring: served-in-time count + patience remaining → tips (money) +
  Ibu affinity + Social meter, through the existing activity-reward path.
  Fail-forward: an expired customer just leaves (small Ibu sigh line), the
  round never hard-fails.
- Difficulty ramps gently with repeat plays (max simultaneous orders 2→4).
  All values in FeelTuning.

HARD CONSTRAINTS
- Wire through the EXISTING committed-activity + minigame framework and
  interior station at Warung Sari — no parallel activity system, no new
  scene class, no schema bump (persist interruption like scooterRepair does).
- Movement-based, not tap-prompt-based: reuse player movement + E-interact
  inside the room; patience rings render like existing marker/ring art.
- Touch parity verified at 390x844; note in PR.
- Customer sprites reuse/recolor existing procedural character art.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` green; tests cover order assignment,
  patience decay, serve matching (right dish/right customer), reward math,
  ramp, and interruption persistence.
- Screenshot sequence of one full round in the PR + a 1-paragraph self-
  assessment: does this feel like a distinct game from riding? (If honest
  answer is no, say why — that's a finding, not a failure.)
- The round is reachable in normal play (visible at the warung after Act 0)
  and `npm run smoke` is unaffected.
- STATE.md bullet; DECISIONS.md entry (new core mode).

DO NOT
- No cooking simulation, ingredient inventory, or menu management — that's
  the Act 3 business layer, still CEO-locked. This is serve-flow only.
- No new interior rooms or map changes.
- Do not make it mandatory for progression — it's a hook, not a gate.

===== END PACKET RPG-20260712-04 =====
```
