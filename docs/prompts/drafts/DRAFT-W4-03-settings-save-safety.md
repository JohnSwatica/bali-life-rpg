```
PACKET ID: RPG-DRAFT-W4-03 (assign + pin SHA at issue)
STATUS:    DRAFT — do not ferry until issued
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — save export/import is data-integrity surface; settings are trivial but the reset flow is destructive-adjacent
PREREQ:    merged main after W4-02 (SHA at issue)
TITLE:     Launch W4-03 — settings minimum + save export/import + reset confirm
MAP DELTA: none
PR TAG: [<assigned ID>]

===== BEGIN PACKET RPG-DRAFT-W4-03 =====

THE WORK
1. SETTINGS (minimum, one modest panel off the title + phone Profile):
   master mute (exists — surface it), volume slider (one master gain),
   touch joystick side (left/right), and nothing else.
2. SAVE EXPORT/IMPORT (no backend, hard boundary respected): export =
   versioned, checksummed string (base64 of the existing save JSON +
   schema version + checksum) via copy-to-clipboard/download; import =
   paste/upload with validation (schema version window, checksum, size
   cap), preview ("Day 9, Act 2, Rp 412 — import?"), then swap with an
   automatic pre-import backup of the current save to a secondary key.
3. RESET ("New Game" over an existing save): explicit two-step confirm
   naming what's lost ("Day 9, Act 2 — type-to-confirm or hold-to-
   confirm"); wires cleanly with W3-02's completed-save semantics.
4. Import of a FUTURE schema politely refuses; import of an older schema
   runs the existing migration path (it exists — v11 lineage).

HARD CONSTRAINTS
- No cloud/backend/URL-sharing of saves; strings stay client-side.
- Import failure can never corrupt the live save (backup-first, validate-
  before-swap; tests prove the failure paths).
- Settings persist via existing storage patterns.

DEFINITION OF DONE
- Tests: export/import round-trip byte-equivalent world state; tampered
  checksum refused; future-schema refused; older-schema migrates; failed
  import leaves live save untouched; reset requires the confirm.
- Beat proof: export → wipe → import → identical Day/Act/wallet on
  screen; the reset confirm flow; settings panel desktop + mobile.
- Proof doc; STATE.md; DECISIONS.md (save-string format of record).

DO NOT
- No multiple save slots (out of scope for v1.0); no keybinding remap; no
  graphics settings.

===== END PACKET RPG-DRAFT-W4-03 =====
```
