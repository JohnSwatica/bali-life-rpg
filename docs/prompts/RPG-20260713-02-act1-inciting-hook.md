```
PACKET ID: RPG-20260713-02
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — first real Act 1 story content since the v4 pivot; behavioral correctness (does the beat actually land, does it gate correctly) matters more than compile success
CODEX-PREREQ: run after RPG-20260713-01 (Act 0 must actually be completable to reach Act 1)
TITLE:     Act 1 inciting hook — the NusaDrop rate cut + Leo's first real encounter
MAP DELTA: none — this beat is staged at existing venues (scooter rental / a pickup hub already on the street), no new geometry
PR TAG: [RPG-20260713-02]

===== BEGIN PACKET RPG-20260713-02 =====

ROLE & SCOPE
John's exact words: "after the intro the game is still the fucking same,
going from point A to point B just to press E again and again... Did you not
take the gemini script I sent you earlier and translate that into a packet
for codex?" — a fair callout. RPG-20260712-01 only reskinned NAMES (Rio→Leo,
Jalan→NusaDrop, Pak Bagus→Julian Vance) onto existing generic systems. It did
NOT implement any of STORY_BIBLE.md v4's actual Act 1 story beats. This
packet builds the first one: v4 §D Act 1's inciting hook, verbatim —

  "A major software update to NusaDrop lowers the base pay per delivery by
  15% while introducing 'Surge Zones.' Leo mocks your low-tier scooter
  performance at a pickup hub."

This must be a FELT narrative beat, not a stat tweak buried in patch notes —
the player should clearly experience "the app just screwed me" and "that guy
is talking trash to my face," back to back, near the start of Act 1.

THE BEAT (design contract — reuse existing systems, no new engine work)
1. TRIGGER: the first time the player reaches Act 1 (currentAct becomes 1),
   queue this as the very next thing that happens — before or interleaved
   with the existing morning hand, not buried after several deliveries.
2. THE RATE CUT (visible, not silent): a phone/feed notification or an
   in-world NusaDrop app-update moment (reuse the existing toast/phone-feed
   pattern — this does not need a new UI surface) explicitly states the app
   just cut base delivery pay ~15% and introduced "Surge Zones." Wire this as
   a REAL, MEASURABLE change: reduce base delivery payout by ~15% from this
   point forward (apply to the existing payout constant/multiplier, not a
   cosmetic-only message — the player's very next delivery should visibly
   pay less than Act 0's, and the payout celebration/HUD should make that
   legible, not confusing). "Surge Zones" can be the visual/copy seed for
   a future mechanic — do not build surge-zone gameplay logic in this packet.
3. LEO'S ENCOUNTER (the felt moment): staged as a visible world scene at the
   scooter rental or a pickup hub (reuse the WorldScenes/RelationshipChoiceScene
   pattern already proven for Leo's race challenge and the No-Questions
   scene) — Leo is physically present, delivers 2-3 authored lines mocking
   the player's scooter tier/rating, in his established voice (transactional,
   sharp, weirdly likeable, per STORY_BIBLE.md v4 §C — never cartoon-hostile).
   This is a SHORT one-time authored scene, not a new dialogue system: full
   dialogue panel (not ambient bubble) per this project's existing rule for
   quest-critical/character beats. End on a hook line that sets up the
   existing Leo race as something to look forward to, if the race hasn't
   fired yet, or references the race result if it already has.
4. Both parts (rate cut + Leo encounter) should land within the player's
   first few minutes of Act 1 — reuse existing gating/priority patterns
   (similar to how Act 0's phone-feed noise is suppressed until relevant)
   so this doesn't get lost behind unrelated opportunity-feed noise.

HARD CONSTRAINTS
- Reuse only: phone/feed or toast system, WorldScenes staging pattern,
  RelationshipChoiceScene/full-dialogue-panel pattern, existing Leo NPC
  data/portrait/voice, existing delivery payout constants. No new engine
  systems, no new minigame, no new map area.
- The payout reduction is real and persistent (not just flavor text) but
  must not break existing Act 1 milestone math (`HustleMilestones.ts`
  thresholds, rent amounts) — check those still make sense post-cut, and
  adjust ONLY if the packet's own math requires it; state any such
  adjustment explicitly in the PR rather than silently drifting balance.
- Fail-forward/no-punitive tone rules still apply: this is a mood/stakes
  beat, not a new failure channel. Leo's mockery has no mechanical penalty
  beyond the already-real rate cut.
- No save-schema bump if avoidable (a one-time-fired flag likely fits
  existing patterns like other one-time beats); if truly unavoidable, stop
  and flag in the PR instead of bumping unilaterally.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` green; tests cover: the rate cut
  fires exactly once on first Act 1 entry, the payout reduction is measurable
  in delivery math, Leo's scene is reachable and one-time, dialogue matches
  his established voice constraints.
- Live/smoke proof in the PR: fresh save driven from New Game through Act 0
  completion into Act 1, showing the rate-cut notice firing and a delivery
  payout visibly lower than Act 0's, then Leo's encounter triggering with
  screenshots of his lines.
- STATE.md bullet; DECISIONS.md entry (first real Act 1 narrative content
  post-v4-pivot — record what's still missing: Made's room offer, Kadek's
  priority-driver moment, the midpoint scooter-breakdown reversal, and the
  closing milestone are NOT in this packet and need their own follow-ups).

DO NOT
- Do not implement the rest of Act 1's backbone (Made's offer, Kadek's list,
  the midpoint breakdown, the closing milestone) — one felt beat, done well,
  per packet. List them as explicit follow-ups in the PR instead.
- Do not build Surge Zones as a real mechanic — name-drop only in this packet.
- Do not touch Act 0, Act 2+, or any packet from the RPG-20260712 batch.

===== END PACKET RPG-20260713-02 =====
```
