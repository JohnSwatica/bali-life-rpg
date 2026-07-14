```
PACKET ID: RPG-20260714-04
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — test infrastructure whose failure mode is silent false proofs; state-construction validity is the whole point
PREREQ:    branch from main at 5be114e or later; RPG-20260714-03's branch (feat/rpg-20260714-03-made-room-offer) exists and finalizes after this merges
TITLE:     Dev proof harness — authored boot states and a stable interaction API for beat-scoped proofs
MAP DELTA: none — dev-only tooling, no player-facing changes
PR TAG: [RPG-20260714-04]

===== BEGIN PACKET RPG-20260714-04 =====

ROLE & SCOPE
The RPG-20260714-03 proof stalled because the only way to prove an Act 1
beat was replaying the full ~4-minute unskippable opening per retry, then
canvas-clicking a phone board whose layout shifts with feed content. Every
remaining Season 1 packet gates DEEPER into the game, so this gets worse
each beat. Build the proof infrastructure once (the proof standard in
docs/ACT1_BACKBONE_2026-07-14.md is now beat-scoped proofs per packet; full
smoke only at wave gates):

1. AUTHORED BOOT STATES. A dev-only mechanism (gated behind the existing
   isDevBuild() pattern, like __BALI_LIFE_DEV_SENSATION__) to boot the game
   directly into a named mid-game state, e.g.
   window.__BALI_LIFE_DEV_PROOF__.bootState("act1_steady_runner").
   VALIDITY IS THE HARD REQUIREMENT: states must be constructed by running
   the SAME mutation functions gameplay runs (createInitialWorldState →
   completeAct0Step sequence / act-0 completion path → triggerAct1RateCut →
   completing real delivery definitions via the delivery system → setting
   story flags via their own modules' functions) — never by hand-writing a
   world-state JSON. A state that gameplay could not reach must be
   impossible to author by construction. Ship these named states now:
   - "act0_complete" — fresh Act 1 entry, rate cut fired, Leo pending
   - "act1_leo_resolved" — Leo encounter done (Kadek offer live)
   - "act1_steady_runner" — 3 counted deliveries done, Kadek beat complete
     (what -03's proof needs)
   Adding future states must be a small, obvious extension (one authored
   builder function per state, registered in one place).
2. STABLE INTERACTION API. Dev-only window functions for the interactions
   proofs keep tripping on, so harness scripts stop depending on canvas
   coordinates: at minimum acceptDeliveryById(id), openPhoneTab(tab),
   getBoardOffers() (returns ids/labels/availability), plus a generic
   clickDialogueOption(index). These call the same internal handlers the
   real UI calls — no logic duplication, no bypassing of gates (an
   unavailable delivery stays unavailable through the API).
3. HARNESS SUPPORT. scripts/smokePlaythrough.mjs (or a sibling
   scripts/beatProof.mjs if cleaner) accepts a boot-state name + a small
   script of proof steps, so a beat proof is: boot state → run beat →
   screenshots, in seconds not minutes. The full unskipped smoke path stays
   untouched and remains the wave-gate instrument.
4. PROVE IT ON -03: as this packet's acceptance demo, run the Made-offer
   beat proof from "act1_steady_runner" (check out the -03 branch content
   locally if needed for the demo, or demo on any built beat — e.g. the
   Kadek offer from "act1_leo_resolved" — if -03 isn't merged yet; state
   clearly which was used).

HARD CONSTRAINTS
- All of it dev-gated: none of these hooks may exist in a production build
  (same guard as __BALI_LIFE_DEV_SENSATION__; verify in the built output).
- No gameplay, story, economy, or schema changes (v11). No new player-facing
  surfaces.
- Boot states must persist through the normal save path after boot (a booted
  state saves/loads like a played one).
- The interaction API must not create interactions the UI can't — same
  handlers, same gating, same side effects.

DEFINITION OF DONE
- npm test -- --run + npm run build green. Tests: each shipped boot state
  satisfies invariants asserted through PUBLIC game functions (e.g.
  act1_steady_runner: currentAct=1, completedDeliveryCount=3, Kadek priority
  flag set, rate-cut flag set, wallet/rating within sane gameplay bounds);
  API calls on gated/unavailable targets are rejected.
- Proof: a beat proof driven end-to-end from a boot state in well under a
  minute, with screenshots; note the wall-clock time in the proof doc.
- Verify (and state in the PR) that dev hooks are absent from the production
  bundle.
- Proof doc docs/RPG-20260714-04_DEV_PROOF_HARNESS_PROOF.md; STATE.md
  bullet; DECISIONS.md entry (beat-scoped proof standard now tooled; boot
  states are constructed through gameplay mutations by design).

DO NOT
- Do not implement Beat 3+ content or touch the -03 branch's feature code.
- Do not add cheat/debug UI for players — window-level dev API only.
- Do not rewrite the existing full smoke flow.

===== END PACKET RPG-20260714-04 =====
```
