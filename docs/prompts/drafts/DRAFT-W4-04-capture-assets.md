```
PACKET ID: RPG-DRAFT-W4-04 (assign + pin SHA at issue)
STATUS:    DRAFT — do not ferry until issued
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Luna · Medium — scripted capture tooling on existing harness; no product code changes
PREREQ:    merged main after W4-03 (SHA at issue)
TITLE:     Launch W4-04 — store capture assets (screenshots + GIF clips) via the proof harness
MAP DELTA: none
PR TAG: [<assigned ID>]

===== BEGIN PACKET RPG-DRAFT-W4-04 =====

THE WORK
Extend the beat-proof harness with a capture mode (frame-sequence dumps →
assembled GIFs/WebM via ffmpeg if available locally, else frame dirs +
an assembly script) and produce the launch asset set at 1280x800 +
390x844 where noted:

SHOTS (stills): title screen; the cold-open bus moment; storm ride;
night villa celebration; Kadek's scene; the sunset circle wide (the
poster); the phone feed (post-diet); bleak kos vs shared room
side-by-side. Mobile variants: storm ride + circle.

CLIPS (5-8s, for itch): steering through storm traffic; the payout
celebration; the circle scene pan (from W3-01's sequence).

All captures from boot states — deterministic, re-runnable when visuals
change (the capture script IS the asset pipeline; assets regenerate, not
bit-rot).

HARD CONSTRAINTS
- No product-code changes beyond dev-gated capture hooks if needed.
- Output to tmp/launch-assets/ (git-ignored) + the capture scripts
  committed; the PROOF lists every asset with thumbnails.

DEFINITION OF DONE
- One command regenerates the full set; asset inventory table in the
  proof doc; STATE.md bullet.

DO NOT
- No marketing copy (docs/ITCH_PAGE_DRAFT owns it); no trailer editing
  beyond the listed clips.

===== END PACKET RPG-DRAFT-W4-04 =====
```
