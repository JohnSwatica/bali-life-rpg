# Test Scripts

## Act 0 smoke playthrough

Run:

```bash
npm run smoke
```

The script starts an isolated Vite server on port `4176`, launches the system Chrome through `puppeteer-core`, clears the browser save, clicks **New Game**, and drives the visible Act 0 objective chain with real keyboard input through first sleep. It is intentionally separate from `npm test`: browser availability must not make unit tests or Pages deployment flaky.

Artifacts are written to `tmp/smoke/`. Every successful beat gets a screenshot. On the first failure the process exits nonzero, names the stalled beat/state, and writes `FAIL-<beat>.png`.

The BAKED-to-villa leg logs sample count, minimum/average/maximum ride speed, whether drift engaged, maximum drift, and time to dropoff. These numbers are observation only; the script does not tune or mutate ride constants.

Environment overrides:

- `CHROME_PATH=/path/to/chrome` selects a nonstandard system Chrome.
- `SMOKE_PORT=4180` changes the isolated Vite port.
- `SMOKE_BASE_URL=http://127.0.0.1:5173/?debug=1` uses an already-running build instead of starting Vite.

## Debug snapshot contract

`window.__BALI_LIFE_DEBUG__` is an automation/read-only surface published by `GameScene`:

- `objectiveTargets`: current field-objective world coordinates after interior retargeting. The smoke runner follows index `0` exactly as the visible marker does.
- `interiorExit`: the current room's exit-mat coordinate, or `null` outside. This lets the runner distinguish an exterior objective from the door it must use first.
- `interiorTransitioning`: true during the room fade lock; automation waits instead of double-interacting.
- `ride`: `{ speed, speedRatio, leanDegrees, drift }` from the current `RideModelOutput` while mounted, otherwise `null`.

These fields are standing test infrastructure. They do not grant progression, teleport the player, alter saves, or replace player-facing guidance.
