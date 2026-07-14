```
PACKET ID: RPG-20260714-11
STATUS:    ISSUED 2026-07-14
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Luna · Medium — scripted capture tooling on existing harness; no product code changes
PREREQ:    branch from main at 3954d33 or later. PARALLEL-SAFE: touches only scripts/ and dev-gated hooks — run it in a SEPARATE Codex cloud task/clone concurrently with the story queue, or in the shared local worktree only while no story packet is mid-flight
TITLE:     Launch W4-04 — store capture assets (screenshots + GIF clips) via the proof harness
MAP DELTA: none
PR TAG: [RPG-20260714-11]

===== BEGIN PACKET RPG-20260714-11 =====

THE WORK
Extend the beat-proof harness with a capture mode (frame-sequence dumps →
assembled GIFs/WebM via ffmpeg if available locally, else frame dirs +
an assembly script) and produce the launch asset set at 1280x800 +
390x844 where noted:

SHOTS (stills): title screen; the cold-open bus moment; storm ride;
night villa celebration; Kadek's scene; the phone feed (post-diet);
the bleak kos; the densified street (station end). Mobile variants:
storm ride + street. (Sunset-circle poster + shared-room shots join
the set when their content exists.)

CLIPS (5-8s, for itch): steering through storm traffic; the payout
celebration; a Leo race stretch. (The sunset-circle pan and poster shot
are captured by re-running this pipeline after W2-08/W3-01 land — the
pipeline re-runs by design; capture what exists today.)

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

===== END PACKET RPG-20260714-11 =====
```
