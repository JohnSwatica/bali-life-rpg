# SEASON 1 LAUNCH PLAN — Bali Life RPG (2026-07-14)

CEO directive (2026-07-14): build straight to launch status. No alpha-testing
gates, no founder-playtest gates. Decisions taken the same day:

- **Scope:** Acts 0–2 shipped as "Season 1," closed by an authored ending +
  Season 2 teaser. The recorded hard boundaries stand (no multiplayer, no
  backend, no AI calls, no real commerce, no Act 3 management sim — Act 3+ is
  Season 2's problem).
- **Venue:** itch.io (browser embed) + the existing GitHub Pages URL. Free.
- **Cadence:** 2–3 packets/day steady, John ferrying to Codex.
- **Target:** launch window **2026-08-05 → 2026-08-12** (~28–32 packets at
  that cadence, with slippage buffer).

This file is the program of record. STATE.md points here; per-wave design
contracts and packets are written when each wave opens, not in advance.

## The QA model (what replaces testing)

The old GATE ("3+ humans before new systems") is retired by CEO authority.
Quality is proven per-packet and per-wave, mechanically:

1. **Per-packet (unchanged, enforced at merge):** tests + build green, browser
   smoke through the affected path, screenshot proof doc, STATE/DECISIONS
   updated. Claude reviews diffs/tests/build/proof and merges (Standing Rule 9).
2. **Per-wave gate — AI playthrough:** at each wave's close, Claude drives a
   full fresh-save headless playthrough of everything built so far, captures a
   timestamped beat table + screenshots, and scores it against the benchmark
   rubric (GTA:CW ride/city/mission pillars, Pokémon opening-flow, Stardew
   social loop) plus fun-proxies: time-to-first-input, menu-time vs play-time
   ratio, verb density per minute, dead-walking seconds between beats. Scores
   and misses go in a dated wave-review doc; misses become the next wave's
   first packets.
3. **Design contract before packets:** every content wave opens with a
   FIRST_TEN_MINUTES.md-style script/contract doc (beats, sensory targets,
   hard rules) so packets implement a design, not a vibe. That pattern is what
   fixed Act 0; it repeats for Act 1's back half and Act 2.
4. **Prereq pinning:** every packet names the merged main SHA it builds on
   (lesson from the 2026-07-13 stale-clone block).

What this model does NOT catch: taste. No human plays until launch day by
CEO instruction; first market signal arrives at launch. Mitigation is the
rubric + contracts, and honesty in wave reviews when something scores "works
but flat."

## Waves

### Wave 0 — First Ten Minutes complete (in flight; ~3 packets)
- RPG-20260713-04 (issued, pending rerun on fresh main): Act 0 back half —
  cafe scene + diegetic NusaDrop signup w/ Vance & Leo plants, storm ride,
  midnight deposit ultimatum, night villa setpiece, collapse close.
- Wave-0 gate playthrough of the full ten minutes, then one polish packet
  from its misses (expected: pacing trims, line edits, celebration tuning).

### Wave 1 — Act 1 backbone to its finale (~7 packets)
Design contract doc first (ACT1_BACKBONE script), then per-beat packets:
- Kadek's priority-driver beat (high-fragility BAKED run → priority list).
- Made's hidden room offer (clean record + recommendation-letter condition).
- Midpoint reversal: scooter transmission blows mid-delivery — push-the-bike
  sequence, ruined cargo, rating tank to 3.2, premium lockout (fail-forward:
  it's authored downfall, not fail state).
- The Luxury Tip Dilemma (bible moral choice #1).
- Act 1 finale: Ibu vouches to Made despite the tanked rating → move-out
  scene, new room, weekly rental contract, ACT 2 card.
- Leo rivalry cadence glue (leaderboard taunts between beats; race rematch
  hook) + one economy-reconciliation packet (rent/move-out/rate-cut math
  across the new beats).

### Wave 2 — Act 2 "Finding Your People" (~9 packets)
Design contract doc first (ACT2 script), then:
- Weekly calendar + crew system core (Ari's Berawa Surf & Run Crew; one more
  crew), "regular" status via repeated attendance.
- Sunset Beach Circle event (Wed/Fri) staged as scenes.
- Relationship milestone unlocks (structural, per bible §E3).
- The PDA reveal: Community Trust Graph vs Platform Efficiency Score — the
  golden thread's Act 2 beat, staged as a discovery moment.
- Ibu's commission-squeeze reveal (overheard scene) + Warung Rush recast as
  helping her warung under pressure.
- The Whistleblower Sourdough choice (bible moral choice #2, Kadek).
- Vance escalation cameo (polite "real job" offer — plants Season 2).
- Act 2 finale: a seat at the Sunday sunset circle — whole-cast scene.

### Wave 3 — Season 1 ending (~3 packets)
- Authored ending: the sunset-circle finale becomes the Season 1 close —
  community dinner beat, Community Trust payoff, Vance's shadow as teaser,
  "SEASON 1 END" card + credits.
- Post-ending free play state (world stays playable; saves survive).
- Season 2 teaser hook (one scene, no systems).

### Wave 4 — Launch wave (~6 packets + non-code work)
- Title/branding pass: final game title (CEO decision, asked when wave
  opens), title screen, favicon/OG polish.
- Performance: code-split the 2MB bundle, mobile browser pass, load-time
  budget.
- Settings minimum: audio mute/volume, joystick side, reset-save with
  confirm.
- Save safety: export/import save string (no backend).
- itch.io: account (John, ~10 min), page copy + screenshots + GIFs (Claude
  drafts, packets produce capture assets), embed build.
- Launch checklist packet: fresh-device runs (desktop Chrome/Safari, one
  Android, one iPhone via the URL), final full AI playthrough, tag `v1.0`.

## Calendar at 2–3 packets/day

| Wave | Packets | Working days | Target close |
|---|---|---|---|
| 0 | ~3 | 1–2 | Jul 15–16 |
| 1 | ~7 | 3 | Jul 20–21 |
| 2 | ~9 | 4 | Jul 26–27 |
| 3 | ~3 | 1–2 | Jul 29 |
| 4 | ~6 | 3 | Aug 3–4 |
| **Launch** | | | **Aug 5–12 window** |

**Slippage rule:** if any wave runs >3 days over, cut from the bench — second
crew, moral choice #2 variants, settings extras, Season 2 teaser scene — and
hold the date. The date moves only by CEO decision, never by drift.

## Standing risks

1. **No taste signal until launch** — accepted by directive; rubric + wave
   reviews are the stand-in. If a wave review says "flat," believe it.
2. **Codex misfires** (stale clones, scope drift): prereq SHA pinning, and
   every packet stays one-beat-sized.
3. **NomadNest contention:** this plan assumes 2–3 packets/day of John's
   ferry-time on the hobby project while NomadNest is #1. If NomadNest needs
   the time, waves stretch — flag it, don't hide it.
4. **Mobile browser reality:** physical-device feel is only truly checked in
   Wave 4; if it's bad, Wave 4 grows.

## Open CEO decisions (asked when their wave opens)
- Final game title (Wave 4).
- Ending tone: hopeful-communal vs bittersweet-with-threat (Wave 3 contract).
- Second crew identity (Wave 2 contract): run crew vs tech/coworking crew.
