```
PACKET ID: RPG-20260715-04
STATUS:    ISSUED 2026-07-15
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Terra · Medium — structural unlocks on existing relationship/crew state; data + gating, no new systems
PREREQ:    STACKED CONTINUATION: if origin/main already contains the [RPG-20260715-03] merge, branch from origin/main; otherwise branch from the head of the RPG-20260715-03 feature branch and note the stacked base in the PR body. Claude reviews/merges the stack in order; if review changes an earlier packet, rebase before merge
TITLE:     Act 2 W2-04 — relationship milestone structural unlocks
MAP DELTA: none
PR TAG: [RPG-20260715-04]

===== BEGIN PACKET RPG-20260715-04 =====

ROLE & SCOPE
ACT2 contract "structural unlocks" (bible §E3): milestones unlock ACCESS,
DIALOGUE, and PRICES — never stat inflation. Fill the regularBenefit hooks
from W2-01 and the affinity-tier unlocks that Season 1 needs.

THE UNLOCKS
1. Surf & Run regular: morning-run recovery bump on run days (a modest
   energy/wellbeing bonus applied by attending, via existing meter
   machinery) + beach ambient dialogue tier for crew members.
2. Kitchen Circle regular: Ibu's bulk meal pricing (her existing meal loop,
   modest discount) + after-hours warung access (the interior open during
   session evenings for members).
3. Affinity tiers (existing relationship arcs): Ibu tier — one warmer
   dialogue pool + the finale's letter beat already consumed this thread
   in Act 1; here it adds her "you eat first" priority at the warung.
   Kadek tier — Focus Buffer pastry becomes purchasable at BAKED once per
   day post-priority (small price, same 3h effect). Ari tier — circle
   invites extend to a +1 line acknowledging the player brings others
   (pure copy; the Season 2 organizer plant).
4. Every unlock surfaces ONCE in the feed when earned ("Ibu holds a stool
   for you now.") and is visible in Profile.

HARD CONSTRAINTS
- Structural only: access/dialogue/price. No stat multipliers, no XP-like
  curves, no new meters.
- Prices touch economy: state exact numbers in the PR; nothing may disturb
  Wave-1 reconciliation assertions (they must still pass untouched).
- All state via existing patterns; no schema bump expected.

DEFINITION OF DONE
- Tests: each unlock gates on its exact condition; benefits apply/expire
  correctly; economy assertions from W1-B6 still green; feed announcements
  fire once.
- Beat proof from regular-in-both boot state: each unlock exercised on
  screen (bulk price visible, after-hours entry, run buff feedback,
  pastry purchase) — screenshots.
- Proof doc; STATE.md; DECISIONS.md (structural-not-stats doctrine).

DO NOT
- No new benefits beyond the four listed; no tier ladders beyond what
  existing relationship arcs already define; no shop restructuring.

===== END PACKET RPG-20260715-04 =====
```
