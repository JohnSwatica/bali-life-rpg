# RPG-20260713-03 — Day-1 Sensation Layer Proof

Date: 2026-07-13  
Packet: `RPG-20260713-03`  
PR tag: `[RPG-20260713-03]`  
Map delta: none — transient rendering, audio, clock, lighting, and existing-interior dressing only.

## Result

The sensation substrate for the authored first ten minutes is live without staging any story beats:

- Day 1 exposes `setTimePhaseForBeat("morning" | "noon" | "stormDusk" | "night")`. It moves the existing `world.clock.minuteOfDay`, then gets out of the way so `advanceClock()`, `getTimePhase()`, and `updateLighting()` remain the only clock/lighting pipeline. Calls are rejected outside unfinished Act 0, and ordinary play is unchanged until a beat is explicitly authored.
- `WorldWeatherController` is the canonical transient weather state. Authored scenes can start/stop rain or storm; a delivery condition can request rain only when no authored scene weather owns the state. Ride slickness now reads weather state exclusively, so visible rain, the rain bed, wet tint, and grip loss cannot disagree.
- Rain uses one pooled array and one graphics batch: 128 capped streaks at desktop width and 72 at `390x844`. Rain/storm adds a cool wet-street tint; storm adds periodic flash events and a procedural thunder sting.
- `SoundManager` now selects `morningStreet`, `cafeInterior`, `rain`, or `nightQuiet` beds from phase/weather/scene context. All are procedural WebAudio; no asset files were added. Bed switching remains behind the existing unlock and persisted mute path.
- Dusk/night reuse the existing screen tint and lantern glow, with a slightly deeper dusk, a legible night overlay, and broader warm lantern pools.
- The cheap kos now contains only a tired mattress, crate, narrow shelf, damp marks, and one exposed warm bulb. The room data, stations, collision, and upgrade/save model are unchanged.

Weather, authored-clock state, and ambient scene overrides are transient. Save schema remains `11`.

## Automated proof

- `npm test -- --run`: **42 files / 270 tests passed, 0 skipped**.
- `npm run build`: passed (`tsc` + Vite production build).
- Focused coverage proves authored beat-to-phase mapping, inert behavior outside unfinished Act 0, weather-driven slickness, delivery-condition synchronization, storm start/stop idempotence, thunder cadence, phase/weather/scene audio-bed selection, and mute preservation.
- `npm run smoke`: passed from New Game through Act 0 sleep, the Act 1 rate-cut card, Leo's pickup-rail scene, the first lower Act 1 payout, and the `390x844` touch surface. Opening-to-live-delivery remained **50.46s**; the steering run used 6 hazards; Act 1 payout remained below Act 0 (`Rp 119` vs `Rp 160`); all 6 mobile controls remained in bounds.

## Live visual proof

System Chrome + Puppeteer rendered the live scene with zero page/console errors:

| State | Runtime evidence | Screenshot |
| --- | --- | --- |
| Clear morning street | `day`, authored beat `morning`, `morningStreet`, weather `clear` | `tmp/sensation-layer/01-clear-morning-street.png` |
| Visible rain, desktop | weather `rain`, bed `rain`, 128 pooled streaks | `tmp/sensation-layer/02-visible-rain-desktop-1280x800.png` |
| Visible rain, mobile | `390x844`, weather `rain`, 72 pooled streaks | `tmp/sensation-layer/03-visible-rain-mobile-390x844.png` |
| Storm dusk | `dusk`, authored beat `stormDusk`, weather `storm`, bed `rain` | `tmp/sensation-layer/04-storm-dusk.png` |
| Lantern night | `night`, authored beat `night`, weather `clear`, bed `nightQuiet` | `tmp/sensation-layer/05-night-lantern-glow.png` |
| Bleak kos | interior mode at night; bare dressing and one-bulb light radius | `tmp/sensation-layer/06-bleak-kos-interior.png` |

The full captured debug states are in `tmp/sensation-layer/proof-run.json`.

## Frame-rate sanity

The same throttled headless session sampled `requestAnimationFrame` over approximately 2.2 seconds per state:

| View/state | Measured FPS | Delta from clear |
| --- | ---: | ---: |
| `1280x800` clear | 45.61 | baseline |
| `1280x800` rain, 128 streaks | 45.52 | -0.09 (-0.2%) |
| `390x844` rain, 72 streaks | 45.27 | -0.34 (-0.7%) |

The harness itself is capped below 60 FPS, so these are comparative rather than device claims. Rain introduced no visible hitch and less than a 1% measured drop from the clear baseline. Physical iOS/Android sensory/audio feel remains a human-device check, as before.

## Scope audit

- No Act 0 step-machine, quest, narrative, payout, rate-cut, race, or delivery-balance changes.
- No new geometry and no `docs/MAP_CHANGELOG.md` entry required.
- No audio downloads/assets, backend, network call, or save-schema bump.
- Existing Leo/race, continuous steering delivery, title/pause barriers, and normal non-Act-0 time progression remain covered by the full suite and passing browser smoke.
