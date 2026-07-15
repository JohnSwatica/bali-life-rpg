```
PACKET ID: RPG-20260715-05
STATUS:    ISSUED 2026-07-15
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — surfaces the live two-axis reputation as a story beat; read-only but thesis-critical
PREREQ:    STACKED CONTINUATION: if origin/main already contains the [RPG-20260715-04] merge, branch from origin/main; otherwise branch from the head of the RPG-20260715-04 feature branch and note the stacked base in the PR body. Claude reviews/merges the stack in order; if review changes an earlier packet, rebase before merge
TITLE:     Act 2 W2-05 — the PDA reveal: Community Trust vs Platform Efficiency
MAP DELTA: none
PR TAG: [RPG-20260715-05]

===== BEGIN PACKET RPG-20260715-05 =====

ROLE & SCOPE
ACT2 contract beat 5 — the golden thread made visible. Bible: "a hidden
metric in the PDA — a Community Trust Graph vs. Platform Efficiency Score.
Maximizing one lowers the other." The two-axis reputation ALREADY EXISTS
in the engine; this beat surfaces it as a discovery, not a tutorial.

THE BEAT
1. TRIGGER: after Sunset Circle attendance ≥1 AND the overheard squeeze.
   A NusaDrop app update pings ("Driver transparency initiative") — the
   player opens the phone and a new Profile section renders both axes,
   with history markers on choices already made (the No-Questions package,
   the tip dilemma, the catering/kindness residue — read from existing
   flags; show only what the save actually did).
2. THE DISCOVERY FRAME: the reveal is diegetic — NusaDrop shows
   "Efficiency" proudly; the "Trust" axis renders as if leaked/unlabeled
   by the app ("metric_x") with Ibu-side annotations appearing after the
   squeeze scene ("This one is what people say when the app is not
   listening."). One short scene-ified moment, then it's a permanent
   phone surface.
3. RESIDUE: the ending (Wave 3) reads which axis leads. No mechanics
   change — the axes were always being written; the beat is SEEING them.

HARD CONSTRAINTS
- Read-only surface over existing reputation state; no new tracking, no
  rebalancing of how axes accrue.
- History markers show only events whose flags exist in the save (no
  fabricated history).
- Phone-diet rules: the new section lives in Profile; no new tab.
- The trade-off copy must match reality: verify maximizing-one-lowers-the-
  other holds in the existing math before writing the line; if it doesn't
  strictly trade off, write honest copy ("what the app rewards" vs "what
  the street remembers") — do NOT change the math to match a slogan.

DEFINITION OF DONE
- Tests: trigger gating; section renders both axes from live state;
  history markers flag-gated; no writes to reputation.
- Beat proof from a state with divergent axes (boot state builder may
  complete a No-Questions accept + a tip-return via gameplay mutations to
  force divergence): the ping, the reveal moment, the Profile section —
  screenshots.
- Proof doc; STATE.md; DECISIONS.md (the axes' real relationship
  documented as found).

DO NOT
- No new metrics, no score rebalancing, no NusaDrop UI beyond this
  section, no moralizing labels.

===== END PACKET RPG-20260715-05 =====
```
