# ACT 2 — "FINDING YOUR PEOPLE" — Wave 2 design contract (DRAFT 2026-07-14)

Status: DRAFT — finalized when Wave 2 opens (post Wave-1 gate). Implements
STORY_BIBLE.md v4 §D Act 2 within Season 1 scope. Same contract discipline
as FIRST_TEN_MINUTES.md / ACT1_BACKBONE: beats are scenes, rides, phone
moments, and now RECURRING SOCIAL RHYTHMS; packets implement this script.

## Emotional premise and player goal

Grounding and camaraderie beyond the grind. Player goal (bible): join two
crews, become a "regular," earn a seat at the Sunday sunset circle. Act 2
is where the game's answer ("community leverage") starts outweighing the
app's answer ("optimize alone") — mechanically, not just in dialogue.

## Pacing

Target ~90 minutes of human play (compressed from the bible's 2–2.5h for
Season 1 scope), spanning in-game Days ~5–9. Act 2 must introduce its
rhythm within 5 minutes of the ACT 2 card: the first crew invitation
arrives before the first post-card delivery completes.

## The one new system: crews on a weekly calendar

Everything else reuses existing machinery (events scheduler, relationship
arcs, reputation axes, feed, scenes). The crew system is: membership +
attendance count + "regular" status per crew, driven by day-of-week events
the existing scheduler already supports. No resource management, no crew
inventory, no simulation.

- **Crew A — Ari's Berawa Surf & Run Crew** (beach; Wed/Fri sunset,
  Sun morning run). Bible §C3: Ari the flaky bridge; his secret (expired
  contract, credit-card surfing) plants here, pays off Season 2.
- **Crew B (RECOMMENDED; CEO may swap) — the Warung Kitchen Circle**
  (Ibu's warung, Tue/Sat evenings): locals + Kadek after hours. Chosen
  over a coworking crew because it feeds everything downstream — the
  commission-squeeze reveal, Warung Rush as SERVE play, the sourdough
  choice, and the Season 2 café destiny all live at this table.
- "Regular" = attend 3 sessions of a crew; unlocks that crew's structural
  benefit (below) and its members' deeper dialogue tiers.

## The beats (order and gating)

| # | Beat | Gate | What it does |
|---|---|---|---|
| 1 | Ari's invitation — a delivery TO the beach ends in "stay ten minutes" (scene) | First beach-adjacent delivery post-ACT-2-card | Introduces crew rhythm; calendar surfaces on the phone (Calendar tab returns, per -05's re-open plan) |
| 2 | Sunset Beach Circle #1 (staged scene, whole-crew) | Attend Wed/Fri | The social loop's first taste; Ari's plant line |
| 3 | Kitchen Circle invitation — Ibu asks for hands on a busy night | 2 deliveries for Ibu OR first rent of Act 2 paid | Opens Crew B; Warung Rush recast fires here as SERVE play (real stakes: Ibu's rush, not an abstract minigame) |
| 4 | The overheard squeeze — commission reveal (scene at the warung, player overhears Ibu on the phone: 30% platform fee) | Kitchen Circle attendance ≥1 | The golden thread turns: the app that cut YOUR pay is squeezing HER |
| 5 | The PDA reveal — Community Trust Graph vs Platform Efficiency Score surfaces on the phone (a hidden metrics screen unlocks, reading the existing two-axis reputation) | After beats 2 AND 4 | The thesis made visible: the axes were always being written; now the player sees them, and sees they trade off |
| 6 | The Whistleblower Sourdough (bible choice #2): Kadek's moonlighting surfaces; expose/protect choice | Kadek affinity tier + Kitchen Circle regular | Moral choice #2; residue read by the ending |
| 7 | Vance's "real job" offer — polite cameo scene at Milk & Madu; he knows your numbers | After beat 5 | Season 2 antagonist plants in person; declining/accepting-a-meeting are both non-punitive residue |
| 8 | The seat — Sunday sunset circle finale: both crews overlap, Ibu brings food, the player is asked to STAY, not deliver | Regular in both crews + beats 4–5 done | Act 2's closing milestone; flows into Season 1's ending (Wave 3) |

## Structural unlocks (bible §E3, scoped)

- Surf & Run regular: morning-run buff (energy/wellbeing recovery bump on
  run days) + beach ambient dialogue tier.
- Kitchen Circle regular: Ibu's bulk meal pricing (her §C hook, modest) +
  after-hours warung access.
- Relationship milestone unlocks stay STRUCTURAL (access/dialogue/price),
  never stat-inflation.

## Hard rules (inherited + Act 2 specific)

1. Scenes/rides/phone/rhythms — no beat resolves through an activity menu.
2. Fail-forward: missing a session never punishes; the calendar just
   offers the next one. No FOMO mechanics beyond the calendar's honesty.
3. Every crew session attended must contain at least one authored line
   that is new (rotating small pools; no verbatim repeats in the first
   three attendances of each crew).
4. Voice discipline per §C for Ari, Ibu, Kadek, Vance.
5. One plant per secret; no arc resolution in Act 2 for Ari/Kadek/Made
   secrets (Season 2 material) except the sourdough choice, which is
   Kadek's Act-2-sized resolution per the bible.
6. MAP: beach staging uses the existing berawa_beach area; if the circle
   needs a small authored beach parcel, it follows the map-growth rule
   (MAP DELTA line + docs/MAP_CHANGELOG.md entry) in its packet.

## Packet map (drafts in docs/prompts/drafts/, sequential at issue)

W2-01 crew core + weekly calendar + regular status (Sol·High — the one new
system) · W2-02 Ari + Surf & Run + Sunset Circle sessions (Sol·Medium) ·
W2-03 Kitchen Circle + the overheard squeeze (Sol·Medium) · W2-04
relationship milestone structural unlocks (Terra·Medium) · W2-05 PDA
reveal (Sol·Medium — reads live reputation axes) · W2-06 Warung Rush
recast as Ibu's rush SERVE beat (Terra·High — minigame restage) · W2-07
Whistleblower Sourdough choice (Sol·Medium) · W2-08 Vance cameo + the
seat finale (Sol·High — act-closing milestone).

Wave 2 gate: full AI playthrough Act 0 → Act 2 finale, rubric-scored, with
special attention to the Stardew pillar (does the social loop pull?).
