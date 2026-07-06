```
PACKET ID: RPG-20260706-06
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     Flat-color portrait busts for Ibu Sari, Kadek, Rio — dialogue becomes people
PR TAG: [RPG-20260706-06]

===== BEGIN PACKET RPG-20260706-06 =====

ROLE & SCOPE
GAME_DESIGN.md §5 specifies "portrait bust (flat-color, 8 needed) + name +
text" for dialogue. Zero exist; dialogue panels are name + text only. This
packet ships THREE portraits — Ibu Sari, Kadek, Rio — the Act 0-1 cast, not
all eight. Phase 1 packet 6 (final) of the 2026-07-06 review.

HARD CONSTRAINTS
- Original procedural art generated in code, same rule as all character
  textures in `BootScene.ts`. A portrait here means a larger, more
  deliberate composition than the walk sprites: head-and-shoulders bust,
  ~96-128px, flat color shapes, distinct silhouette/palette per character,
  consistent with each NPC's existing sprite palette so they read as the
  same person.
- Portraits appear ONLY in the full dialogue panel path (the modal panels
  routed by `src/systems/dialogue/DialoguePresentation.ts`), never on
  ambient speech bubbles.
- The dialogue panel is a fixed DOM surface (per DECISIONS.md 2026-07-01
  overlay rules) — render the portrait into it as a canvas/dataURL image or
  equivalent, keeping the panel inside the established viewport bounds set
  (1280x800 down to 390x844). Rerun the numeric bounds checks.
- NPCs without a portrait yet (Ari, Made, Willow, Pak Bagus, Elena) keep the
  current portrait-less layout — the panel must degrade gracefully, since
  those five arrive in later packets.
- No save-schema change, no new dependency.

DELIVERABLES
1. `src/systems/dialogue/PortraitArt.ts` (or BootScene extension —
   implementer's call, log it): procedural bust generation for `ibu_sari`,
   `kadek`, `rio`, keyed by NPC id, with a registry lookup that returns
   null for NPCs without portraits.
2. Dialogue panel layout update: portrait left, name + text right; text
   width adjusts when no portrait exists.
3. Two expression variants per character (neutral + warm/smiling), selected
   by the existing relationship affinity tier at render time (stranger/
   acquaintance -> neutral; friendly+ -> warm). Reuse the tier read model
   NPC reactions already use.
4. Viewport bounds proof at the established six sizes, numeric (element
   rects inside window), matching this repo's HUD-verification convention.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; tests cover the portrait
  registry (three ids resolve, unknown ids null, tier -> variant mapping).
- Screenshot at 1280x800 of Ibu Sari's Act 0 first-meet dialogue with
  portrait, saved under `tmp/`.
- STATE.md bullet.

DO NOT
- Do not attempt all 8 principals — three, done well, with clean fallback.
- Do not add portraits to toasts, ambient bubbles, phone contact rows, or
  anywhere outside the modal dialogue panel in this packet.
- Do not redesign the dialogue panel beyond adding the portrait slot.

===== END PACKET RPG-20260706-06 =====
```
