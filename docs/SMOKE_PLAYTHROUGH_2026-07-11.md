# RPG-20260708-07 Act 0 Smoke Playthrough

Date: 2026-07-11  
Command: `npm run smoke`  
Browser: system Google Chrome through `puppeteer-core`, headless, 1280x800  
Save: isolated and cleared before New Game

## Successful Run

```text
[BEAT] 01-meet-ibu-sari: meet_ibu_sari | Now: Find Ibu Sari - Walk to Ibu Sari near Canggu Station and press E / ACT.
[OK]   01-meet-ibu-sari: pickup_first_delivery | mode=interior
[BEAT] 02-baked-pickup: pickup_first_delivery | Now: First delivery pickup - Ride to BAKED. Berawa and pick up the sealed pastry box.
[OK]   02-baked-pickup: dropoff_first_delivery | mode=interior
[BEAT] 03-villa-dropoff: dropoff_first_delivery | Now: Villa dropoff - Take the pastry box to the marked villa gate before the timer slips.
[OK]   03-villa-dropoff: buy_meal_and_coffee | mode=world
[RIDE] samples=7 speed min/avg/max=212.28/240.88/260.86 driftEngaged=false maxDrift=0.000 time-to-dropoff=10.37s
[BEAT] 04-cafe-coffee-and-meal: buy_meal_and_coffee | Now: Spend your first earnings - Use cafe station choices for quick coffee and a proper brunch plate.
[OK]   04-cafe-coffee-and-meal: sleep_first_night | mode=interior
[BEAT] 05-sleep-first-night: sleep_first_night | Now: Sleep it off - Ride back to your cheap kos marker and sleep until morning.
[OK]   05-sleep-first-night: complete | mode=cutscene
[PASS] Act 0 complete at Day 2 08:02; Now: Build delivery rhythm - Take 2 more Hustle Board runs to become a steady runner.
```

The short first-delivery leg is mostly straight, so `driftEngaged=false` is expected observation, not a tuning verdict. The telemetry now makes later human ride-feel review quantitative without changing `FeelTuning.ts`.

## Regression Found By The Harness

The first integrated run exposed a real post-delivery freeze. Any keyboard input dismisses the payout celebration. `finishPayoutCelebration()` destroyed its text/container and killed tweens targeting those objects, but the rupiah count-up tween targeted a separate plain counter object. Its next `onUpdate` called `setText()` on the destroyed Phaser text, throwing from Phaser's `drawImage` path and stopping the game loop.

The payout runtime now retains its counter tween and stops it before finalizing/destroying the text. The final smoke run crossed the same payout-to-movement seam with no page or console errors.

## Artifacts

`tmp/smoke/` contains one screenshot for each successful beat:

- `00-cold-open.png`
- `01-meet-ibu-sari.png`
- `02-baked-pickup.png`
- `03-villa-dropoff.png`
- `04-cafe-coffee-and-meal.png`
- `05-sleep-first-night.png`
- `06-act0-complete.png`

On a future failure the runner exits nonzero and writes `FAIL-<beat>.png` before cleanup.

## Verification

- `npm run smoke`: passed through `act0Step=complete`.
- `npm test -- --run`: 39 files, 247 tests passed.
- `npm run build`: passed.
- Smoke remains opt-in and is not part of the default test or Pages workflow.
