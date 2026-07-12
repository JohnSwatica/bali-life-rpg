```
PACKET ID: RPG-20260712-03
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — a new core gameplay mode replacing checkpoint taps across the delivery loop; cross-system (ride model, traffic, cargo, delivery math) and pure product-behavior risk
TITLE:     Steering delivery mode v1 — continuous obstacle-avoidance riding replaces timing-tap checkpoints
MAP DELTA: BAKED back-alley shortcut parcel, built but visibly gated (locked fence + "someone could open this" cue) — geometry now, Kadek-tier unlock later; MAP_CHANGELOG entry
PR TAG: [RPG-20260712-03]

===== BEGIN PACKET RPG-20260712-03 =====

ROLE & SCOPE
PLAYTEST_01 problem 3: every minigame resolves as a timing-tap variant. The
CEO mandate (now in the GDD banner): Delivery Riding is a CONTINUOUS
obstacle-avoidance steering game — the GTA:CW-pillar-1 toy — not tap prompts
layered on autopilot travel. The ride model (acceleration/drift/grip/slick in
`RideModel.ts` + `FeelTuning.ts`) already exists; this packet makes the ride
BE the minigame.

THE MODE (design contract)
- While a delivery is active and the player is on the bike, riding is live
  play: dodge ambient traffic, pedestrians, potholes/puddles (new cheap
  hazard props on the road band), oncoming scooters in the wrong lane.
- Contact costs cargo integrity (existing CargoCare seam) and a speed stumble
  — never a hard fail, never a knockout. Rain (existing slick flag) reduces
  grip; night reduces hazard-visibility distance slightly.
- Clean riding is rewarded through the EXISTING payout/performance seam:
  replace ride-checkpoint scoring with a continuous run score (hazards
  avoided, near-misses, time). Delete or repurpose the old checkpoint
  timing-tap beats — they must no longer interrupt riding with modal taps.
- Traffic density scales with a per-street authored knob so the tutorial
  catering run is forgiving and Act 1 board runs get denser (data-driven, in
  FeelTuning or street data — one obvious edit point).

HARD CONSTRAINTS
- Keep fail-forward economics: base payout untouched; only bonus margins move
  with run quality (same rule cargo-care follows).
- Touch parity: the mode must be playable with the existing joystick; verify
  at 390x844 and note results in the PR.
- `npm run smoke` updated: the autopilot must still complete deliveries
  (dumb straight-line riding should survive with degraded score, proving
  fail-forward); ride telemetry summary should now include hazards/near-miss
  counts.
- Ghost-race compatibility: the Leo race must still function on top of the
  new mode (racing through live hazards is GOOD — verify, don't redesign).
- All hazard art procedural, matching the street palette.

DEFINITION OF DONE
- `npm test -- --run`, `npm run build`, updated `npm run smoke` green; unit
  tests cover run-score math, hazard-contact → cargo/stumble wiring, density
  knob, and "base payout never reduced."
- A 30-second desktop capture (or dense screenshot sequence) of one full
  delivery ridden as live play, in the PR.
- Old checkpoint tap-beats confirmed gone from the riding flow (grep + test).
- MAP_CHANGELOG line + screenshots for the gated alley parcel.
- STATE.md bullet; DECISIONS.md entry (core-verb change).

DO NOT
- No police/wanted systems, no crash animations, no damage economy beyond
  cargo/bonus — tone stays warm, consequences stay soft.
- Do not retune base ride-feel constants while adding hazards (separate
  concern; change only what the mode strictly needs, list any touched value).
- Do not unlock the alley — locked is the point this packet.

===== END PACKET RPG-20260712-03 =====
```
