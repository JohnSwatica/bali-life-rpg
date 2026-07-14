```
PACKET ID: RPG-DRAFT-W1-B4 (assign RPG-YYYYMMDD-NN + pin PREREQ SHA at issue)
STATUS:    DRAFT — do not ferry until issued
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — one choice scene, but it writes to the reputation axes the ending reads; behavioral correctness
PREREQ:    merged main after Beat 3 (SHA at issue)
TITLE:     Act 1 Beat 4 — the Luxury Tip Dilemma (bible moral choice #1)
MAP DELTA: none — attaches to an existing villa-dropoff board delivery
PR TAG: [<assigned ID>]

===== BEGIN PACKET RPG-DRAFT-W1-B4 =====

ROLE & SCOPE
docs/ACT1_BACKBONE_2026-07-14.md Beat 4; STORY_BIBLE §G choice 1. Timing is
the design: it fires on the first villa-type dropoff AFTER the breakdown —
the player is post-downfall, rating-tanked, money-hungry. Maximum
temptation, zero mechanical punishment either way.

THE BEAT
1. TRIGGER: first completion of a villa-dropoff board delivery after the
   reversal flag. One-time.
2. THE SCENE: at the gate, a RelationshipChoiceScene: the villa guest
   transfers a tip that is obviously a mistake — Rp 500 (roughly a rent
   payment; big enough to matter, small enough to be believable), with a
   distracted line making clear they think it's Rp 50. Choice:
   - KEEP IT: +Rp 500; Platform-Efficiency-aligned reputation residue;
     a private line ("The app rounds in silence. So can you.").
   - RETURN IT: +Rp 50 (the intended tip); Community-Trust-aligned
     residue; the guest actually LOOKS at you — one warm line, and a
     "villa regular" plant (they remember you in later ambient copy).
3. RESIDUE (both branches): a flag the Season 1 ending reads (the sunset
   circle references who you were when broke); one later feed line echoing
   the choice. No rating change, no lock, no punishment — the difference
   is money now vs. person later, exactly the golden thread in miniature.

HARD CONSTRAINTS
- Reuse RelationshipChoiceScene + the existing two-axis reputation residue
  patterns (the same machinery the No-Questions choice uses). No new
  systems.
- ESC/skip resolves to RETURN (default-forward = the kinder read; skip
  never picks the compromising branch silently).
- No economy changes beyond the one-time tip amounts; no schema bump.
- Do not touch the finale, milestones, or Act 2 surfaces.

DEFINITION OF DONE
- Tests: gates on reversal + villa dropoff; fires once; both branches set
  their residue flags and pay correctly; skip = return.
- Beat proof from a post-reversal boot state: the scene, both branch
  outcomes (two runs), the later feed echo — screenshots.
- Proof doc; STATE.md bullet; DECISIONS.md entry (choice residue feeds the
  ending).

DO NOT
- No moralizing UI (no "good/bad" labels, no karma meter surfacing).
- No second dilemma, no villa-guest arc beyond the plant.

===== END PACKET RPG-DRAFT-W1-B4 =====
```
