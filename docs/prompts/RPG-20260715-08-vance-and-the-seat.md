```
PACKET ID: RPG-20260715-08
STATUS:    ISSUED 2026-07-15
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — Act 2's closing milestone + the antagonist's first real scene; act-transition correctness
PREREQ:    STACKED CONTINUATION: if origin/main already contains the [RPG-20260715-07] merge, branch from origin/main; otherwise branch from the head of the RPG-20260715-07 feature branch and note the stacked base in the PR body. Claude reviews/merges the stack in order; if review changes an earlier packet, rebase before merge
TITLE:     Act 2 W2-08 — Vance's offer + the seat at the sunset circle (Act 2 finale)
MAP DELTA: none expected (beach staging per W2-02's precedent)
PR TAG: [RPG-20260715-08]

===== BEGIN PACKET RPG-20260715-08 =====

ROLE & SCOPE
ACT2 contract beats 7–8: the antagonist plants in person, then the season's
social payoff. This packet closes Act 2; Wave 3 (the ending) builds
directly on its final scene.

BEAT 7 — VANCE'S "REAL JOB" OFFER
1. TRIGGER: after the PDA reveal. At Milk & Madu (his §C habitat — the
   Act 0 cameo pays off), a staged scene: Julian Vance, polite,
   condescending, knows the player's NUMBERS ("Four-point-something under
   pressure. Enclave Berawa needs logistics people who don't break.").
   Offers "a real job" — salaried, badge, off the street.
2. CHOICE (small, non-punitive): decline outright / take his card.
   Both are residue only; taking the card yields one later feed message
   (his §C phone/PDA hook: passive-aggressive follow-up). No job system,
   no branch — Season 2 material planted either way.
3. Voice: megalomanic savior complex, never mustache-twirling; he believes
   he's helping. One mention of "the noise problem" ties back to Act 0.

BEAT 8 — THE SEAT (Act 2 finale)
1. GATE: regular in BOTH crews + the squeeze + the PDA reveal complete
   (choices 1–2 made or skipped through their defaults by now by
   construction).
2. THE SCENE: Sunday sunset, both crews overlap on the beach; Ibu brings
   food from the warung; Kadek brings bread with HIS name said out loud
   (branch-aware line from W2-07); Ari actually present, phone away.
   The beat: someone shifts to make room WITHOUT being asked — the player
   is expected. Leo is visibly absent, one line noticing it ("Somebody's
   still chasing surge." — the Season 2 door). The player's participation
   beat: one toast line choice (3 flavors, all warm — tone selection, not
   consequence).
3. CLOSE: "ACT 2 — COMPLETE" card is NOT shown — Act 2 flows directly
   into the Season 1 ending sequence (Wave 3's W3-01 attaches to this
   scene's end). Set the completion flag; save; Wave 3 owns the cut.

HARD CONSTRAINTS
- Vance gets no mechanics — no buyouts, no lockouts (Season 2 hard
  boundary); scene + residue only.
- The finale scene must render every attendee branch-aware (tip dilemma,
  sourdough branch, no-questions history — small line variants read from
  flags; only surface what the save did).
- Fail-forward: the gate is reachable from every branch combination;
  tests prove it.

DEFINITION OF DONE
- Tests: Vance trigger/one-time/card residue; finale gate truth table
  across branch combinations; branch-aware line selection; completion
  flag + save.
- Beat proof: Vance scene; the finale staged wide (screenshot must read
  as a POSTER — this is the game's thesis image); two branch-variant
  line screenshots.
- Proof doc; STATE.md; DECISIONS.md (Act 2 complete; Wave 3 attaches at
  the circle).

DO NOT
- No Season 1 ending content (Wave 3 owns the END card/credits); no
  enclave mechanics; no Leo scene (his absence IS the beat).

===== END PACKET RPG-20260715-08 =====
```
