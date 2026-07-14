```
PACKET ID: RPG-DRAFT-W4-05 (assign + pin SHA at issue)
STATUS:    DRAFT — do not ferry until issued; requires John's itch.io account (~10 min, CEO action) before the upload step
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Terra · Medium — itch-compatible build packaging + embed verification
PREREQ:    merged main after W4-04 (SHA at issue)
TITLE:     Launch W4-05 — itch.io embed build + page assembly
MAP DELTA: none
PR TAG: [<assigned ID>]

===== BEGIN PACKET RPG-DRAFT-W4-05 =====

THE WORK
1. ITCH BUILD: an npm script producing the itch-ready zip (relative-path
   base — NOT the /bali-life-rpg/ Pages base; index.html at zip root;
   split chunks intact; size within itch's browser-game limits). The
   Pages build remains unchanged and canonical.
2. EMBED VERIFICATION: the game runs inside an iframe of itch's player
   dimensions — pick and record the embed size (recommend 1280x800
   windowed + fullscreen button enabled + mobile-friendly flag); audio
   unlock works under the click-to-run gate; localStorage saves persist
   under the itch domain (verify + document that itch saves are separate
   from Pages saves — expected and fine, note it in page copy).
3. PAGE ASSEMBLY (docs/ITCH_PAGE_DRAFT_2026-07-14.md is the copy source):
   Codex produces the final upload bundle + a step-by-step upload
   checklist for John (title, tagline, copy blocks, tags, pricing=free,
   assets from W4-04 in order). John performs the actual upload (account
   owner); the checklist must be paste-ready.

HARD CONSTRAINTS
- No gameplay changes; build/packaging only.
- The Pages deploy stays the canonical auto-deployed build; itch is an
  additional artifact built from the same tagged commit.

DEFINITION OF DONE
- The zip builds reproducibly from a tagged commit; a local iframe test
  page proves embed behavior (screenshots); the upload checklist is
  complete enough that John needs zero improvisation.
- Proof doc; STATE.md; DECISIONS.md (embed spec + dual-domain save note).

DO NOT
- No itch API/butler automation (manual upload for v1.0); no paid tier,
  donations config left OFF at launch (CEO can flip later).

===== END PACKET RPG-DRAFT-W4-05 =====
```
