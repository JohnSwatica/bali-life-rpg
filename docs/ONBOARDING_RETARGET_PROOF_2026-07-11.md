# RPG-20260708-04 Onboarding Retarget Proof

Date: 2026-07-11  
Branch: `feat/rpg-20260706-09-rio-race`

## Automated regression proof

- `getFieldObjective(world)` at Act 0 step `meet_ibu_sari`, Day 1 08:00, resolves inside `warung_sari_interior` to Ibu Sari's occupied NPC slot.
- The resolved marker uses the same `INTERIOR_NPC_INTERACTION_RADIUS` as the room interaction ranker, so reaching the marker guarantees that `Talk to Ibu Sari` is selectable.
- At Act 0 step `pickup_first_delivery`, the exterior BAKED target resolves inside the Warung to the Warung exit mat.
- Full suite: 236 tests pass. Production build passes.

## Browser marker-follow proof

The live development build was driven with touch input and the existing debug snapshot:

| Beat | Resolved target | Result |
| --- | --- | --- |
| Enter Warung during `meet_ibu_sari` | Ibu slot `(20221, 1099)` | Following it produced `E - Talk to Ibu Sari`. |
| Talk to Ibu | same NPC target | Act advanced to `pickup_first_delivery`; scooter and `first_baked_villa_delivery` were granted. |
| Still inside Warung | exit mat `(20192, 1259)` | `objectiveTargets[0]` exactly matched `interiorExit`. |
| Move through exit cue | exit mat | Returned to world mode; `interiorExit` became `null`; target became exterior BAKED `(1648, 96)`. |

Screenshots (local, gitignored):

- `tmp/playtest-2026-07-11/RPG-20260708-04-ibu-marker.png`
- `tmp/playtest-2026-07-11/RPG-20260708-04-exit-retarget.png`

The browser emulator accelerates the in-game clock during control calls; the proof used the existing development time/teleport controls only to stage the morning entrance. Progression, objective resolution, interaction, and exit behavior used the normal game paths.
