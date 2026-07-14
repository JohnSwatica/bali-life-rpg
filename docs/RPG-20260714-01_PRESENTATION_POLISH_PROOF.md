# RPG-20260714-01 — Wave 0 presentation polish proof

Date: 2026-07-14  
Scope: presentation-only fixes for the six Wave 0 gate misses. No save-schema, story-step, economy, payout, or weather behavior changed.

## Verification

- `npm test -- --run` — 43 files / 278 tests passing.
- `npm run build` — passing.
- `npm run smoke` — passing fresh Act 0 → Act 1 run, 21 regenerated captures in `tmp/smoke/`.

Focused automated coverage now verifies that queued toasts pause for a cutscene and an authored phone moment, top-left HUD chrome clears the letterbox band, and every signup leaderboard row has rank, driver, rating, and delivery-count content.

## Before / after crops

The before set was preserved from the Wave 0 gate run in `tmp/RPG-20260714-01-before/`; final captures are in `tmp/smoke/`. The paired, same-size review crops below live in `tmp/RPG-20260714-01-crops/`.

| Surface | Before | After | Result |
| --- | --- | --- | --- |
| Vance act card | ![Before Vance card](../tmp/RPG-20260714-01-crops/before/07-cafe-scene-vance.png) | ![After Vance card](../tmp/RPG-20260714-01-crops/after/07-cafe-scene-vance.png) | Every `act_card` now uses one systemic dark text panel; title and subtitle hold over the bright cafe. |
| NusaDrop leaderboard | ![Before signup leaderboard](../tmp/RPG-20260714-01-crops/before/08-signup-leo-leaderboard.png) | ![After signup leaderboard](../tmp/RPG-20260714-01-crops/after/08-signup-leo-leaderboard.png) | LEO, DEDE, and the new driver all have labeled delivery counts; no empty pill-like row content remains. |
| Landlord ultimatum | ![Before ultimatum](../tmp/RPG-20260714-01-crops/before/10-landlord-ultimatum.png) | ![After ultimatum](../tmp/RPG-20260714-01-crops/after/10-landlord-ultimatum.png) | Letterbox-safe top-left HUD stack plus the shared card panel keep the Rp 560 reversal readable. |
| Villa story phone | ![Before villa phone](../tmp/RPG-20260714-01-crops/before/11-villa-surge-phone.png) | ![After villa phone](../tmp/RPG-20260714-01-crops/after/11-villa-surge-phone.png) | The compact `DEPOSIT TARGET Rp 560` chip is fully visible above the phone; ambient toasts remain queued until the authored phone closes. |
| Night payout | ![Before night payout](../tmp/RPG-20260714-01-crops/before/12-night-villa-celebration.png) | ![After night payout](../tmp/RPG-20260714-01-crops/after/12-night-villa-celebration.png) | Delivery label uses an ivory 18px face, near-opaque dark backing, longer hold, and gold burst ring for rain/night contrast. |
| Kos resolve | ![Before kos resolve](../tmp/RPG-20260714-01-crops/before/13-landlord-resolve.png) | ![After kos resolve](../tmp/RPG-20260714-01-crops/after/13-landlord-resolve.png) | A staged landlord silhouette now stands at the doorway, separate from the player; shared scrim protects the resolution card. |
| Act 1 rate cut | ![Before rate cut](../tmp/RPG-20260714-01-crops/before/15-act1-rate-cut-seam.png) | ![After rate cut](../tmp/RPG-20260714-01-crops/after/15-act1-rate-cut-seam.png) | The same systemic card treatment covers the future/Act 1 rate-cut card, not only the Act 0 fixes. |

## Implementation notes

- The text scrim is a centered, translucent panel only behind title and subtitle. It preserves the live world/interior shot and the existing letterbox bars.
- HUD chip placement derives from the active letterbox height, so status/objective chrome is below the band rather than clipped by it. Story-phone deposit context uses the same existing chip in a safe top-center position.
- Toasts are held, not discarded, while a cutscene or authored phone story moment is open; normal queue timing resumes after close.
- The landlord is a temporary cutscene actor using the existing NPC sprite/staging path. It has no routine, dialogue branch, or saved state.
