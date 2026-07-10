# RPG-20260708-03 Coherence Sweep

Audit date: 2026-07-10 (Asia/Makassar)

This audit covers the seams between RPG-20260706-01..09 and the stranger-readiness/mobile packets RPG-20260708-01..02. It changes no economy, save schema, narrative content, or tuned value.

## Findings

| Seam | Expected | Actual before sweep | Fix / decision |
| --- | --- | --- | --- |
| Audio cues during cutscenes / letterbox | One deliberate act-card entry cue; queued world feedback waits | The toast queue continued under a cutscene and could play a second notification cue during the letterbox | Queued toast presentation now pauses while a cutscene is active and resumes afterward. The authored cutscene-entry cue remains. |
| Payout celebration vs. Act 2 card | Delivery payoff lands, then chapter payoff lands | Both began from the same delivery-completion frame | Act 2 card waits the unchanged `1180ms` payout lifetime. If pause/title opens in that gap, the card waits for resume. |
| Hidden meters vs. morning hand / day ledger / station copy | Act 0-1 names Energy only; Act 2 reveals all four | Day ledger and station preview paths were correct; the morning recovery fallback still said “meters” | Morning recovery copy now says `Energy` before reveal and `meters` after reveal. Existing visibility filtering remains unchanged. |
| Cargo-care chip vs. race and interiors | Cargo condition is ride context, not room/race chrome | Chip appeared immediately after an interior pickup and had no explicit race suppression | Chip now appears only in world mode with no active rival race. Cargo simulation and payout math are unchanged. |
| Race eligibility vs. active delivery, both directions | A delivery blocks race start and a race blocks delivery acceptance | Delivery already blocked race start; phone/board delivery acceptance did not check an active race | Delivery offers and direct acceptance now reject while `rivalRace` is the active activity. Regression test covers both directions. |
| Ride-model drift vs. checkpoint radii and pickup/dropoff stopping | Acceleration/coast cannot tunnel through route beats; handoffs remain immediate in their interaction radius | Checkpoint radii remained safely larger than two 30fps top-speed steps; pickup/dropoff resolves on action and does not require zero velocity | No behavior change. Added an invariant covering every authored delivery checkpoint. |
| Near-miss flourish spam in dense traffic | Feedback is speed-gated and rate-limited | Already correct: `0.72` minimum speed ratio plus one cue per `900ms`, with direct-hit inner exclusion | No behavior change. Values moved unchanged to `FeelTuning.ts` and locked by tests. |
| Portraits beside cutscene-adjacent dialogue | Dialogue overlay is gone before countdown; outcome portrait appears only after race runtime ends | Already correct: Rio choice destroys its overlay before the countdown, and result dialogue opens after race cleanup | No behavior change. Existing portrait and race tests remain green. |
| Title/reset vs. mid-activity and mid-race saves | Saved runtime remains frozen behind title; Continue restores it; New Game wipes cleanly | Persisted activity/race runtime resumed before title opened, so timers could advance behind the menu; Continue then forced ordinary world mode | Runtime restoration now happens only after Continue. Race/activity/checkpoint updates freeze behind title/pause. F9 fresh reset also clears live cutscene/activity/race presentation state. |
| Touch fixes vs. desktop parity | Touch gains missing controls without changing desktop paths or copy | Already correct after RPG-20260708-02; development query override is ignored in production and desktop strings stay on keyboard branches | No behavior change. Touch policy and title/menu regression tests remain green. |

## Feel Tuning Consolidation

`src/tuning/FeelTuning.ts` is now the one edit point for the requested feel values:

- Procedural audio gains.
- Payout count-up, pulse, and fade timings.
- Ride acceleration, coast, speed/grip/lean curves, camera lead, and near-miss limits.
- Cargo integrity thresholds, damage, and collision limits.
- Rio ghost target time, step cap, lead/trail caps, checkpoint radius, and race timeout.

Every value moved without retuning. `src/__tests__/feelTuning.test.ts` locks the shipped values.

## Bundle Sanity

- Before: JS `2,010,659` bytes; gzip `488,793` bytes (`2,010.66 kB`, Vite gzip `491.17 kB`).
- After: JS `2,015,252` bytes; gzip `490,241` bytes (`2,015.25 kB`, Vite gzip `492.67 kB`).
- CSS: `15,094` bytes before; no CSS change in this packet.

The JS delta is `+4,593` raw bytes (`+0.23%`) and `+1,448` gzip bytes (`+0.30%`). It is the tuning registry, policy branches, and regression-facing exports. No runtime network dependency or dynamic asset was added.

## Verification

- `npm test -- --run`: 37 files, 234 tests.
- `npm run build`: green.
- Pages-equivalent commands: `npx vitest run`, `npx tsc`, and `npx vite build --base=/bali-life-rpg/` are run in closeout.
- `.github/workflows/deploy-pages.yml` still checks out, installs, tests, builds with `/bali-life-rpg/`, uploads `dist`, and deploys Pages; the workflow file is unchanged.
