# Phase 3 — Re-evaluation Gate (do not build past this line)

Created 2026-07-06 as part of executing `CLAUDE_PROJECT_REVIEW_2026-07-06.md` §5.
This document is deliberately **not** a packet. Phase 3 is a stop-and-look, not a build.

> ## GATE v2 — CEO override, 2026-07-08
>
> All nine RPG-20260706 packets landed (218 tests green, verified). Codex
> correctly stopped here. John then overrode the personal-playtest requirement:
> he has no time to play and instructed development to continue.
>
> **What changed:** requirement #1 (John's 60-minute `PLAYTEST_01.md`) and
> requirement #3 (the three decisions) are moved to the project `TODO_LIST.md`
> as parked-not-cancelled items. Requirement #2 (3-5 outside players) becomes
> the ACTIVE path to feedback and is being pursued without John's play time via
> the RPG-20260708 packet batch (stranger-ready build, mobile pass, coherence
> sweep) plus a two-minute share action from John.
>
> **What did NOT change:** the freeze list below stays fully in force, and the
> distinction it protects gets sharper — until real human feedback exists (from
> ANYONE, John or strangers), Codex work is limited to **polish, tuning,
> integration, stranger-readiness, and bug fixes on existing systems**. New
> systems, new acts, new map districts, new minigames, and new narrative content
> remain blocked. A CEO instruction to "keep developing" authorizes the former
> category, not the latter — that reading is deliberate, because building new
> systems against zero feedback is the exact failure mode this gate exists to
> stop, and no override changes the epistemics, only the schedule.
>
> **Gate v2 exit condition:** feedback from 3+ real humans (any mix of John and
> strangers) is written down in `PLAYTEST_01.md` or a sibling file. Then the
> "After the gate" section below applies unchanged.

## What Phase 3 is

After the Phase 1 packets (RPG-20260706-01 … 06) and Phase 2 packets
(RPG-20260706-07 … 09) have landed, **no further feature packets get written until
the evidence below exists.** The point of the whole sequence was to make the game
*feelable* and *reachable*; Phase 3 is where John actually feels it and outsiders
actually reach it.

## The gate — all four required

1. **`PLAYTEST_01.md` exists.** John (not an AI, not a screenshot pass) plays a
   fresh save for ~60 minutes on a real device and voice-notes/writes raw
   reactions: where bored, where confused, where nothing happened, where
   something landed. Rawness is the value — no tidying into tickets during play.
   `docs/AI_WALKTHROUGH_NOTES_2026-07-06.md` lists what NOT to spend that hour on
   (things already verified statically).
2. **The public build has been played by 3–5 outside people.** The deploy URL is
   `https://johnswatica.github.io/bali-life-rpg/` (auto-deploys from `main` via
   `.github/workflows/deploy-pages.yml`). Canggu friends are the ideal testers —
   they'll judge the *Bali* of it, not just the game of it. Collect unprompted
   reactions; a WhatsApp voice note is a valid artifact. Log them (even as quotes)
   in `PLAYTEST_01.md` or a sibling file.
3. **The three review decisions get answered by John** (from
   `CLAUDE_PROJECT_REVIEW_2026-07-06.md` §6), *after* seeing the evidence:
   - Identity: hobby vs. audience-building front door for the NomadNest universe.
   - Stakes ceiling: did the cargo-care channel (RPG-20260706-04) feel right?
     More teeth, fewer, or as-is?
   - Weekly time budget for this project vs. match.co GTM — a number, held.
4. **A tuning-ticket list, not a feature list, comes out of it.** Per the
   review and the older `CLAUDE_ASSESSMENT_BRIEF.md` recommendation 1: the output
   of playtesting is adjustments to what exists (payouts, timers, copy, pacing,
   camera, audio mix), not pitches for new systems.

## What stays frozen until the gate opens

Unchanged from the review's freeze list: the six-district map **as a one-shot
build**, minigames beyond ride/repair/one social, any sixth guidance surface,
crafting, the OSM pipeline, Act 3 business sim (still CEO-locked per
`AGENTS.md`), Act 4/5 content, and any further design-doc scope expansion.

> **CEO amendment, 2026-07-11 — incremental map growth is authorized.** Per
> the Map Growth Rule in `AGENTS.md`, packets now grow the map in small,
> contiguous, reviewable increments (one parcel per packet, logged in
> `docs/MAP_CHANGELOG.md`). This replaces the blanket map freeze: what remains
> banned is the big-bang expansion — multi-district dumps, detached areas, or
> any single packet exceeding the small-parcel bound. Rationale: John can
> track and critique growth per-increment; he cannot review a 2-3x map dump.

## After the gate

Whatever the evidence says, wins. Expected shapes (not commitments):
- If feel is good but Act 2 is flat → an Act 2 emotional-payoff packet series
  (post-event dialogue, ritual beats — see assessment brief Milestone B).
- If feel is still weak → a second juice/tuning pass; no new content.
- If outsiders bounce in the first 5 minutes → Act 0 pacing surgery before
  anything else.
- If John answers "audience asset" on identity → a small shareable-slice/
  distribution packet (itch.io page, share copy, a clean 15-minute demo cut)
  *before* deeper story work.

## Sequencing note for AI tabs

Under GATE v2 (see top): after RPG-20260706-09, the authorized work queue is the
RPG-20260708 batch (stranger-readiness/mobile/coherence) and, beyond it, only
polish/tuning/integration/bug-fix packets on existing systems. If you are asked
to write or build a NEW system, act, district, minigame, or narrative content
before written feedback from 3+ real humans exists, point at this gate and ask
John to override it explicitly for that specific packet — a general "keep
developing" does not cover it. Building new systems past this line without any
human feedback reproduces the exact failure mode the 2026-07-06 review
identified (13 days of systems while the playtest stayed undone). Do not be the
tab that does that.
