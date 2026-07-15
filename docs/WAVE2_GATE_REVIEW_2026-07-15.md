# WAVE 2 GATE REVIEW — Act 2 "Finding Your People" (2026-07-15)

Per LAUNCH_PLAN_SEASON1_2026-07-14.md. Instruments: full stack review of
RPG-20260715-01…08 (merged in order, PRs #15–#22, main at `35220c2`),
405/405 tests + build on merged main, fresh full smoke (Act 0 unskipped
220.0s, storm once, menu opens 0, mobile in bounds), and the finale beat
proof re-run on merged main (PROTECT branch, 7.2s to the completed circle).
Production bundle audited clean of dev hooks.

## What Wave 2 shipped

The one new system (crews = existing scheduler events + membership
semantics, regular at exactly 3 attendances, v11 saves) and seven content
packets on top of it: Ari's Surf & Run crew, the Kitchen Circle with the
overheard 30% squeeze, structural-only unlocks, the read-only PDA reveal
(with honest axis copy — the axes are independent, not strict inverses,
and the copy says so rather than lying for the slogan), Warung Rush
anchored as Ibu's SERVE beat, the Whistleblower Sourdough choice, and the
Vance offer + sunset-seat finale with branch-aware staging tested across
all 72 tip × sourdough × No-Questions × Vance combinations.

Design addition reviewed and APPROVED: the finale gate additionally
requires Vance's offer resolved (beyond the packet's written gate). It is
never missable (the pending scene persists), it collapses the ending's
residue space (no third "never met Vance" state for Wave 3 to write), and
it enforces the thematic order — his badge before their seat.

## Rubric

| Pillar | Score /5 | Evidence |
|---|---|---|
| Social loop (Stardew — this wave's focus) | 4.5 | Real weekly rhythm, rotating no-repeat session lines, structural (never stat) rewards, and a finale where the payoff is a seat, not a number |
| Opening flow (Pokémon) | 4.5 | Unchanged |
| Ride feel (GTA:CW) | 4 | Unchanged; drift note carried a fourth wave — now assigned to Wave 4 polish definitively |
| City legibility | 4 | Beach staging clean; poster shot reads at a glance |
| Mission variety / verbs | 4.5 | SERVE now anchored at Ibu's; all five verbs except BUILD have real play |
| Presentation | 4 | Scrim/label standards held throughout the finale staging |

## Carried notes

1. **Drift feel on the critical path** → Wave 4 polish, final assignment.
2. **Calendar-time pacing:** the finale proof world sits at Day 28 (boot
   builder warps to a clean Sunday). Real-play Act 2 duration is
   session-calendar-bound (~1.5–2 in-game weeks minimum for both regulars);
   human-time pacing against the ~90-min contract target must be read at
   the Wave 3 full-run gate before launch copy claims a total playtime.
3. Vance's Sunday window (17:00–19:59, day%7==0) is generous but implicit —
   the Goals surface names it; watch for confusion in Wave 3's full run.

## Verdict

**Wave 2 gate: PASS.** Act 2 is a complete social arc: two crews, a
turning reveal, a moral choice, an antagonist plant, and a finale that
stages the season's thesis. `currentAct` remains 2; the world state ends
exactly where the Season 1 ending attaches. Wave 3 opens with the CEO tone
decision locked (2026-07-15): **hopeful-communal with one sting.**
