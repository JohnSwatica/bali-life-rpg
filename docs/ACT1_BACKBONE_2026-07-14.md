# ACT 1 BACKBONE — Wave 1 design contract (2026-07-14)

Wave 1 of LAUNCH_PLAN_SEASON1_2026-07-14.md. Implements STORY_BIBLE.md v4 §D
Act 1's turning points, reversal, choice point, and closing milestone — the
beats RPG-20260713-02 explicitly deferred. Same contract style as
docs/FIRST_TEN_MINUTES.md: beats are scenes, rides, and phone moments;
packets implement this script, not a vibe.

## Where Act 1 stands

Built: the rate-cut inciting hook + Leo's pickup-rail encounter, morning
hand, board deliveries with steering mode, Leo's race, move-out milestone
math (5 runs / Rp 600 / 4.2★). Missing: everything between the inciting hook
and move-out is generic grinding — no Kadek, no Made, no reversal, no moral
choice, no authored finale. Act 1 is economically complete and narratively
empty. Wave 1 fills exactly that.

## Hard rules

1. Character beats use the full dialogue panel (project rule); each NPC's
   voice follows STORY_BIBLE §C exactly (Kadek: perfectionist, burnt out,
   warm under pressure; Made: transactional but never villainous; Leo:
   sharp, weirdly likeable).
2. Fail-forward everywhere. The midpoint reversal is AUTHORED downfall —
   scripted, one-time, dramatic — never a random failure state.
3. Every beat leaves visible residue (dialogue references, feed messages,
   changed offers) — no beat exists only in the moment it plays.
4. One beat per packet. Plants for Act 2+ (Kadek's secret, Ibu's strain,
   Vance) are single lines, never arcs.
5. Act 0's menu rule does not extend here (menus are legal in Act 1), but
   no NEW beat may resolve through an activity menu — scenes/rides/phone.

## The beats (play order and gating)

| # | Beat | Gate | Pressure it adds |
|---|---|---|---|
| 1 | **Kadek's priority list** (TP1): a feed-flagged high-fragility BAKED "rush hour" run; clean completion triggers Kadek's scene — priority list membership, Focus-Buffer pastry, one line hinting his moonlighting | After Leo's rate-cut encounter | A named human now expects things of you |
| 2 | **Made's hidden room** (TP2): staged at Bungalow Living — the room exists, but needs a clean financial record + a business owner's recommendation letter | After Steady Runner (3 deliveries) | The way out is visible and conditional |
| 3 | **Midpoint reversal — the breakdown**: transmission blows mid-delivery; push-the-bike sequence (slow trudge, no timer death), ruined cargo, rating tanks to 3.2, premium orders lock | First delivery after beats 1 AND 2, scripted once | Everything beat 2 required just collapsed |
| 4 | **The Luxury Tip Dilemma** (bible choice #1): a villa customer "mistakenly" overpays 10×; return it or keep it — Community-Trust vs Efficiency residue, no mechanical punishment either way | First villa delivery after the reversal (broke = maximum temptation) | Who are you when you're down |
| 5 | **Finale — Ibu vouches**: rent-day scene → Ibu writes the recommendation despite the 3.2★ → Made hands over the room → move-out montage, weekly scooter contract, ACT 2 card | Adjusted milestone (below) | The theme lands: relationships beat ratings |
| 6 | **Leo cadence glue**: 3-4 milestone-triggered taunt texts + race rematch pointer | Fires off beats 1/3/5 | The rival never disappears |

## The milestone adjustment (the one design change to existing math)

The bible's finale requires Ibu vouching DESPITE a tanked rating — so after
the reversal fires, move-out readiness must not hard-require 4.2★. New
contract: deliveries (5) + earnings (Rp 600) unchanged; the rating
requirement is satisfied by EITHER ≥4.2★ (reversal not yet fired — edge
case) OR completing the Ibu-guarantee scene (the normal path). The finale
packet owns this change; it must be explicit in DECISIONS.md, and Act 2
gating must key off move-out completion, not rating.

## Proof standard (amended 2026-07-14, after the -03 proof stall)

Per-packet DoD proofs are BEAT-SCOPED: boot an authored dev proof state at
the beat's gate (RPG-20260714-04's harness), exercise the beat, screenshot
it. The full unskipped smoke runs at WAVE GATES only — never as a per-packet
requirement. (The original -03 DoD's "drive to Steady Runner + full smoke
green" forced ~4-minute cinematic replays per proof retry; that standard was
wrong and is retired.)

## Packet map (issued sequentially, one at a time)

- RPG-20260714-02 — Beat 1, Kadek (+ z-order rider) — MERGED (PR #5)
- RPG-20260714-03 — Beat 2, Made's room offer — feature+tests done on its
  branch; proof finalizes after -04 merges
- RPG-20260714-04 — dev proof harness (authored boot states + stable
  interaction API) — inserted after the -03 stall; pays for itself across
  every remaining Season 1 packet
- RPG-20260714-07 — Beat 3, the breakdown reversal (ISSUED)
- RPG-20260714-08 — Beat 4, tip dilemma (ISSUED, chained on -07)
- RPG-20260714-09 — Beat 5, finale + milestone adjustment + Act 2 card (ISSUED, chained on -08)
- RPG-20260714-10 — Beat 6, Leo glue + economy reconciliation (ISSUED, chained on -09)

Wave 1 gate: full AI playthrough Act 0 → Act 2 card, rubric-scored, before
Wave 2 opens. Target close: Jul 20–21 (one-day slip risk absorbed by the
harness investment).
