# RPG-20260708-05 Ride Mode Proof

Date: 2026-07-11  
Branch: `feat/rpg-20260706-09-rio-race`

## Invariant

- Scooter ownership (`hasBike`) and riding (`onBike`) are separate state.
- An active interior always rejects riding state and hides the scooter visual.
- Mounting starts only from world mode; entering and leaving a room leave the player on foot.
- Scooter grants, rentals, and upgrades confer ownership without forcing a mount.

`src/systems/ride/RideMode.ts` is the pure policy shared by scene movement, sprite visibility, mount toggles, race setup, group riding, and developer setup. The debug snapshot now also exposes `interiorTransitioning` so automation can wait for a room fade instead of mistaking it for an ignored action.

## Browser Act 0 proof

The development build was driven with touch input through the first delivery:

| Beat | Mode / state | Result |
| --- | --- | --- |
| Enter Warung | `interior`, `hasBike=false`, `onBike=false` | Player walked to Ibu. |
| Ibu grants scooter | `interior`, `hasBike=true`, `onBike=false` | Scooter owned but not rendered or active indoors. |
| Leave Warung | `world`, `onBike=false` | BIKE control remained available; player mounted outside. |
| Enter BAKED while riding | `interior`, `onBike=false` | Automatic dismount; no scooter visual. |
| Pick up at bakery counter | `interior`, `onBike=false` | Delivery advanced to `dropoff_first_delivery`; objective retargeted to the exit. |
| Leave BAKED and mount | `world`, `onBike=true` | Objective remained the villa dropoff. |
| Villa handoff | `world`, `onBike=true` | Delivery cleared and Act 0 advanced to `buy_meal_and_coffee`. |

The browser-emulated clock accelerated during control calls, so the run completed late for Rp 145 (`money: 215`) rather than the ideal Rp 160. No timing, payout, rating, wear, or speed values were changed.

Screenshots (local, gitignored):

- `tmp/ride-mode-2026-07-11/01-warung-grant-on-foot.png`
- `tmp/ride-mode-2026-07-11/02-mounted-outside-warung.png`
- `tmp/ride-mode-2026-07-11/03-baked-pickup-on-foot.png`
- `tmp/ride-mode-2026-07-11/04-first-delivery-complete.png`

Automated result: 239 tests pass; production build passes.
