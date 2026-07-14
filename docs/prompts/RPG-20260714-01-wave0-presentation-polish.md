```
PACKET ID: RPG-20260714-01
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Terra · Medium — presentation-layer fixes across several files; no product logic, no economy, no story changes
PREREQ:    branch from main at 9b4676c or later (RPG-20260713-04 merged)
TITLE:     Wave 0 presentation polish — act-card legibility and story-moment cleanliness
MAP DELTA: none — rendering/UI-layer fixes only
PR TAG: [RPG-20260714-01]

===== BEGIN PACKET RPG-20260714-01 =====

ROLE & SCOPE
docs/WAVE0_GATE_REVIEW_2026-07-14.md is the source: the first-ten-minutes
build passed its gate EXCEPT six presentation misses, and this packet fixes
exactly those six. Screenshots cited there (tmp/smoke/*) show each defect.

THE SIX FIXES

1. ACT-CARD SCRIM (systemic — the blocking miss). Act-card cutscene steps
   rendered over a live world/interior are illegible on bright or mid-tone
   scenes (Vance card, landlord ultimatum, landlord resolve). Give the
   act-card step renderer a proper text backdrop: a dark scrim panel or band
   behind title+subtitle (consistent with the letterbox aesthetic the Act 1
   cards already benefit from), applied to EVERY act_card step — opening,
   ultimatum, resolve, rate-cut, future cards — not per-card patches.
   Acceptance: every card's title and subtitle pass obvious-contrast reading
   on their live backgrounds in fresh smoke screenshots.

2. HUD CHIP CLIPPING DURING LETTERBOX. The deposit chip (and any top-left
   objective/status chips) clip half-offscreen while letterbox is active
   (screenshots 10, 11). The chip introducing the Rp 560 target must be fully
   visible at the moment it matters. Fix the layout interaction (offset chips
   below the letterbox band or suppress-and-restore cleanly).

3. TOAST SUPPRESSION DURING STORY MOMENTS. Map-discovery and similar ambient
   toasts render through story phone moments and cutscenes (screenshot 11).
   Queue (do not drop) non-story toasts while a cutscene or authored phone
   moment is open; flush after it closes.

4. LEADERBOARD PLACEHOLDER PILLS. The NusaDrop signup leaderboard (screenshot
   08) shows two unlabeled gray pills beside the LEO/DEDE rows that read as
   unfinished UI. Remove them or replace with real content (e.g. delivery
   counts). The signup moment is the game's most app-like surface — it must
   look shipped.

5. STAGE THE LANDLORD. The deposit-resolve beat (screenshot 13) plays its
   card in an empty dark room. Place a landlord figure at the kos doorway for
   that beat using the existing NPC sprite/staging machinery (a distinct
   silhouette at the door is enough — no new dialogue system, no new NPC arc;
   an existing or minimal new npc entry with sprite+position only). The card
   text plays over the scrim from fix #1.

6. PAYOUT CELEBRATION CONTRAST AT NIGHT. "Delivered +Rp N" text is faint over
   the wet night street at the villa beat (screenshot 12) — the emotional
   peak must pop. Raise the celebration text/burst contrast so it reads on
   dark+rain backgrounds without changing payout logic.

HARD CONSTRAINTS
- Presentation only: no story logic, step machine, economy, payout math,
  weather logic, or save-schema changes (schema stays v11).
- No new UI systems — extend the existing cutscene overlay, HUD chip, toast,
  phone shell, and celebration components in place.
- Scrim must not cover the whole screen with opaque black during over-world
  cards (the world context is part of the shot); band/panel behind text only.
- Do not touch Act 1 content, deliveries, or anything outside these six.

DEFINITION OF DONE
- npm test -- --run + npm run build green; tests where the surface allows
  (toast queue behavior during cutscene/phone moments; chip layout offset
  under letterbox; leaderboard rows contain no empty placeholder elements).
- npm run smoke green with regenerated screenshots; the proof doc shows
  before/after crops for all six fixes, each legible at a glance.
- Proof doc docs/RPG-20260714-01_PRESENTATION_POLISH_PROOF.md; STATE.md
  bullet; DECISIONS.md entry (act-card scrim is now the standard for all
  future cards).

DO NOT
- Do not restyle the HUD, phone, or celebration beyond the named fixes.
- Do not add new cutscene features, camera work, or audio.
- Do not begin any Wave 1 content in this packet.

===== END PACKET RPG-20260714-01 =====
```
