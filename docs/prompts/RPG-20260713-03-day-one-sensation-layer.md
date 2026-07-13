```
PACKET ID: RPG-20260713-03
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — cross-system engine/feel work (weather, authored clock, audio, lighting); correctness is sensory and behavioral, not compile-time
TITLE:     Day-1 sensation layer — visible storm, authored time-of-day arc, ambient audio beds, bleak kos
MAP DELTA: none — no new geometry; rendering/audio/lighting layers over the existing street and interiors
PR TAG: [RPG-20260713-03]

===== BEGIN PACKET RPG-20260713-03 =====

ROLE & SCOPE
Read docs/FIRST_TEN_MINUTES.md first — it is the design contract this packet
serves. This packet builds ONLY the sensation systems (no story logic, no Act 0
step changes — that is RPG-20260713-04, which depends on this landing first):

1. AUTHORED DAY-1 CLOCK ARC. Act 0 needs the day to progress morning → noon →
   storm dusk → night across ~10 real minutes. Build a small control that
   story code can call to jump/compress the world clock at beat boundaries
   (e.g. setTimePhaseForBeat(...) or equivalent), driving the EXISTING
   getTimePhase/updateLighting pipeline. It must not fight the normal clock:
   outside Act 0 nothing changes. No new lighting system — reuse the existing
   phase tints/lantern glow; you may tune dusk/night values so the night ride
   reads dramatic but the street stays legible (street legibility rules from
   RPG-20260708-06 still apply).

2. VISIBLE RAIN/STORM. Currently "rain" exists only as a delivery-condition
   flag with slick physics (FeelTuning slick* values, isRideSurfaceSlick).
   Build the visible weather state: a start/stop-controllable rain layer
   (streak particles or equivalent procedural rendering consistent with the
   flat-color art style), wet-street tint, and a storm variant with occasional
   thunder flash + sting. When weather rain is active, the EXISTING slick ride
   physics and any rain condition logic must be driven by it (one source of
   truth — the world's weather state — not two parallel flags). Rain must
   render in world mode and read on mobile 390x844 without tanking frame rate.

3. AMBIENT AUDIO BEDS. SoundManager currently has 7 synth cues and one
   ambient loop. Extend it (same procedural WebAudio approach — no audio
   assets/downloads) with distinct beds selected by phase/weather: morning
   street (current loop is fine as base), cafe interior chatter/espresso
   texture, rain bed + distant thunder, night crickets/quiet. Story/scene
   code picks beds via a simple API. Respect the existing mute/settings path.

4. BLEAK KOS DRESSING. The kos interior must read as the BUILD motivator
   (GAME_DESIGN.md: "genuinely bleak"): single warm bulb radius in an
   otherwise dim room, minimal furniture, a visual state that can later be
   upgraded. Dressing/lighting only — no furniture system in this packet.

HARD CONSTRAINTS
- No story logic, no Act 0 step machine changes, no new quest content.
- No save-schema bump: weather/clock-arc state must be derivable or
  transient (weather does not need to persist across reloads; if a save
  loads mid-Act-0, defaulting to clear weather is acceptable).
- No new map geometry (MAP DELTA: none). No audio asset files — procedural
  WebAudio only, consistent with the existing SoundManager.
- Performance: rain layer must be object-pooled/capped; verify no visible
  frame drops in the browser smoke at 1280x800 and 390x844.
- Do not regress Leo's race, steering delivery mode, or existing lighting
  phases outside Act 0 usage.

DEFINITION OF DONE
- npm test -- --run + npm run build green; tests cover: weather state drives
  slick physics (single source of truth), clock-arc control sets expected
  phases and is inert outside its use, audio bed selection per phase/weather,
  storm start/stop idempotence.
- Live proof (screenshots via the smoke harness or headless method): clear
  morning street; visible rain over the street; storm at dusk; night with
  lantern glow; bleak kos interior. Short note on frame-rate sanity.
- Proof doc docs/RPG-20260713-03_SENSATION_LAYER_PROOF.md; STATE.md bullet;
  DECISIONS.md entry.

DO NOT
- Do not stage any narrative beats with these systems (no landlord, no villa
  run, no signup scene) — RPG-20260713-04 does that on top of this.
- Do not add a weather forecast/seasons system; one controllable rain/storm
  state is the whole scope.
- Do not touch delivery payout math or the Act 1 rate cut.

===== END PACKET RPG-20260713-03 =====
```
