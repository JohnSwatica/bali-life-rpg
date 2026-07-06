```
PACKET ID: RPG-20260706-01
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     Add a procedural audio foundation — the game currently has zero sound
PR TAG: [RPG-20260706-01]

===== BEGIN PACKET RPG-20260706-01 =====

ROLE & SCOPE
Bali Life RPG has no audio anywhere in `src/` — verified by grep, no sound API is
called at all. This is Phase 1 ("juice sprint") packet 1 of Claude's
2026-07-06 project review (see `CLAUDE_PROJECT_REVIEW_2026-07-06.md` §2/§5).
Add a minimal procedural sound layer and wire it to the moments that already
matter mechanically: pickup, delivery payout, UI clicks, toasts, sleep/day
transition, plus one soft ambient bed.

HARD CONSTRAINTS
- Follow this repo's existing "no copied/traced assets" discipline for audio
  too: do NOT bundle licensed/CC/royalty-free sound-pack files. Generate all
  SFX procedurally at runtime via Web Audio oscillators/noise (the same spirit
  as `BootScene.ts` generating original procedural character art in code).
  Phaser 3's built-in `this.sound` system can wrap Web Audio nodes; no new
  npm dependency is needed or wanted.
- Respect browser autoplay policy: do not attempt to play audio before a user
  gesture. The game already requires a keypress/click to start moving, so
  unlock the audio context on first input, not on load.
- Do not add a save-schema field for a mute preference. Use a separate plain
  `localStorage` key (e.g. `bali-life-rpg.audio-muted`) outside the versioned
  save so this stays out of `Persistence.ts` migration entirely.
- Do not touch gameplay math, delivery payout values, meter deltas, or any
  existing test's asserted behavior — this is a sound layer bolted onto
  existing trigger points, not a new system.
- No AI/LLM calls, no network calls, no backend — matches existing
  `AGENTS.md` hard boundaries (this was never in question for audio, stated
  for completeness).

DELIVERABLES
1. `src/systems/audio/SoundManager.ts` — a small system exposing named cues
   (e.g. `pickup`, `payout`, `uiClick`, `toast`, `sleep`, `ambientLoop`) built
   from simple oscillator/noise synthesis, a `muted` boolean backed by the
   localStorage key above, and a `play(cue)` method that no-ops safely if
   muted or if the audio context isn't unlocked yet.
2. Wire `play("pickup")` alongside the existing pickup pop/ghost-ring tween in
   `src/systems/animation/InteractionFlourishes.ts`.
3. Wire `play("payout")` at delivery completion in
   `src/systems/hustle/DeliverySystem.ts`'s completion path.
4. Wire `play("uiClick")` on the existing fixed DOM HUD buttons in
   `src/ui/hud/HudController.ts`.
5. Wire `play("toast")` in the existing toast queue (find the toast
   show/dedupe logic referenced in STATE.md's "Toasts now use a bounded
   queue" entry) on toast appear.
6. Wire `play("sleep")` in `src/systems/life/SleepCycle.ts` on sleep
   completion.
7. One soft looped ambient bed (low-volume, procedurally generated, gamelan-
   or rain-stick-adjacent tone — simple is fine) started once on first
   interaction, on by default, respecting `muted`.
8. A minimal mute toggle exposed somewhere reachable (Phone > Profile tab is
   the natural existing home — see `src/ui/phone/PhoneShell.ts`).

DEFINITION OF DONE
- `npm test -- --run` and `npm run build` both pass.
- New unit test(s) covering `SoundManager`: cue keys resolve, `muted` toggles
  and persists across a manager re-instantiation reading the same
  localStorage key, and `play()` doesn't throw when called before the audio
  context is unlocked (headless/test environment has no real audio output —
  test the state machine, not actual sound).
- No existing test's behavior changes.
- `STATE.md` gets one new bullet describing what shipped; `DECISIONS.md` gets
  one entry if any non-obvious call was made (e.g. exact synthesis approach
  chosen).

DO NOT
- Do not add a settings/options full-screen system beyond the single mute
  toggle — that's out of scope for this packet.
- Do not touch delivery/opportunity/meter/reputation math.
- Do not add real audio asset files (mp3/ogg/wav) to the repo.

===== END PACKET RPG-20260706-01 =====
```
