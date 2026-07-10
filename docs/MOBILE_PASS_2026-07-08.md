# RPG-20260708-02 Mobile Playability Pass

Browser audit date: 2026-07-10 (Asia/Makassar)

This is the PR-description-ready handoff for the touch audit. It used the in-app browser at `390x844` and `360x800` in portrait, with the development-only `?touch=1` pointer-emulation seam. A human pass on physical iOS and Android devices is still pending.

## Findings

| Surface | Before | Result / fix |
| --- | --- | --- |
| Title, continue, and safe reset | Working from RPG-20260708-01, but not yet mobile-audited | Title card is in bounds at both target sizes. Continue remains one tap; New Game still confirms before replacing a save. |
| Cold-open dialogue | Broken: only `E / ESC`; touch HUD is intentionally hidden behind overlays | Touch sessions now get a 44px-minimum `Continue` button and `Tap Continue`. Desktop copy remains `E / ESC`. |
| Exterior joystick | Broken under camera zoom: the fixed-scroll container still inherited main-camera zoom | Touch controls now use the established world-view plus inverse-camera-scale pattern and resync every frame. |
| Interior movement | Broken: joystick pointer-down accepted `world` mode only | Touch movement now accepts `world` and `interior`, while overlays still reject and hide joystick input. |
| Overlay / resize transitions | Unreliable: a held joystick vector could survive an overlay, game-out, or resize | Opening an overlay, leaving the game surface, or resizing cancels the pointer id and zeroes movement. |
| Ibu Sari dialogue and Act 0 delivery acceptance | Broken at the first dialogue because no touch advance existed | Pointer-only run entered Warung Sari, approached Ibu Sari, advanced dialogue, and accepted the first delivery. |
| BAKED pickup and interior exit | Interior movement was unavailable | Pointer-only run entered BAKED, moved to the counter, picked up the package, and exited. |
| Ride checkpoint | Existing timing button was touch-capable but not re-audited | Checkpoint panel and `Go` control rendered in bounds; its fail-forward timeout completed without keyboard input. Ride math is unchanged. |
| Villa drop-off and payout | Existing ACT and pointer dismissal paths | Pointer-only run completed the villa delivery and dismissed the `Rp +145` payout celebration. |
| Milk & Madu activity menu | Existing DOM controls worked; interior movement prevented reaching them | Pointer-only run reached the café table, opened the activity menu, and started meal and coffee actions. Activity prompts now say to use on-screen controls on touch instead of `ESC`. |
| First sleep / Act 1 card | State transition already covered by `firstHourProof`; browser-emulated clock advanced much faster than real time during the long route replay | No state-machine or economy change. Cutscenes remain skippable by any pointer, and the morning hand/day-ledger surfaces are DOM buttons. Composite test coverage is green; physical-device end-to-end confirmation remains pending. |
| Committed activities | Buttons worked, but mobile prompt/toast still advertised `ESC` | Touch copy now points to on-screen controls. Desktop text is unchanged. |
| Rio race concede | Broken: only the separate ESC handler could concede | During a touch-active race, ACT becomes `QUIT` / `Concede race` and resolves through the existing concede outcome. Keyboard behavior is unchanged. |
| Portrait toast | Broken at `360x800`: fixed 520px wrap clipped both sides | Toast width now follows `min(520, viewport - 48)` and uses 14px type below 420px. |
| Browser viewport and safe areas | Missing `viewport-fit`, dynamic viewport sizing, and focused safe-area constraints | Added `viewport-fit=cover`, `interactive-widget=resizes-content`, `100dvh`, safe-area-aware mobile panels, 44px touch targets, and retained `touch-action: none` / `overscroll-behavior: none` over the game. |
| Link preview | No OG card or favicon | Added title/description/theme metadata, static OG metadata, an original procedural SVG favicon, and a committed 1200x630 screenshot at `public/og-bali-life-rpg.jpg`. |

## Numeric Proof

- Title at `390x844`: `[18, 234.55, 372, 609.44]` (`left, top, right, bottom`).
- Title at `360x800`: `[18, 202.41, 342, 597.59]`.
- Touch controls at `360x800`: PHONE `[220,590,280,650]`, SAVE `[290,590,350,650]`, SOC `[220,660,280,720]`, BIKE `[290,660,350,720]`, BAG `[220,730,280,790]`, ACT `[290,730,350,790]`; every rect is in bounds.
- Touch controls at `390x844`: PHONE `[250,634,310,694]`, SAVE `[320,634,380,694]`, SOC `[250,704,310,764]`, BIKE `[320,704,380,764]`, BAG `[250,774,310,834]`, ACT `[320,774,380,834]`; every rect is in bounds.

## Evidence

Ignored local evidence lives under `tmp/mobile-pass-2026-07-08/`:

- `390x844-touch-title-after.jpg`
- `390x844-touch-world-after.jpg`
- `360x800-touch-world-after.jpg`
- `360x800-touch-toast-after.jpg`

The browser emulator's game clock accelerated during repeated CUA operations. That behavior was not reproduced as a game-logic failure, so no clock, activity, delivery, or ride values were changed to accommodate the harness.

## Verification

- `npm test -- --run`
- `npm run build`
- Real iOS/Android hardware: pending repo-owner verification.
