# RPG-20260714-11 — Launch Asset Capture Proof

Packet: `[RPG-20260714-11]`  
Branch: `feat/rpg-20260714-11-launch-assets`  
Map delta: none — capture tooling only

## Result

The launch asset pipeline is one command:

```bash
npm run capture:launch
```

It runs the existing `npm run smoke` journey for the authored cold-open,
storm, villa, and kos moments, then boots the existing dev proof states for
the phone feed, Kadek, street, payout, and Leo race captures. The script
keeps deterministic PNG frame directories and assembles GIF + WebM clips with
`ffmpeg` when it is installed. If `ffmpeg` is unavailable, each frame
directory contains an `ASSEMBLE.txt` fallback.

All generated output is under ignored `tmp/launch-assets/`; rerunning replaces
the set instead of committing bit-rotting binaries. The verification run used
the canonical smoke path (229.9 seconds, zero browser errors) and a second
capture pass against the local dev server (all assets regenerated, clean exit).

## Still inventory

All desktop stills are 1280×800. The two mobile variants are 390×844.

| Asset | Boot/source | Thumbnail |
| --- | --- | --- |
| `stills/title-screen.png` | fresh title screen | ![Title screen](../tmp/launch-assets/stills/title-screen.png) |
| `stills/cold-open-bus.png` | fresh Act 0 bus cutscene | ![Cold open](../tmp/launch-assets/stills/cold-open-bus.png) |
| `stills/storm-ride.png` | `act1_steady_runner` + dev storm hook | ![Storm ride](../tmp/launch-assets/stills/storm-ride.png) |
| `stills/night-villa-celebration.png` | canonical smoke villa dropoff | ![Villa celebration](../tmp/launch-assets/stills/night-villa-celebration.png) |
| `stills/kadek-scene.png` | `act1_leo_resolved` + Kadek delivery | ![Kadek scene](../tmp/launch-assets/stills/kadek-scene.png) |
| `stills/phone-feed.png` | `act1_steady_runner` + Feed | ![Phone feed](../tmp/launch-assets/stills/phone-feed.png) |
| `stills/bleak-kos.png` | `act0_complete` + kos interior | ![Bleak kos](../tmp/launch-assets/stills/bleak-kos.png) |
| `stills/street-station.png` | `act1_steady_runner`, station end | ![Station street](../tmp/launch-assets/stills/street-station.png) |
| `stills/storm-ride-mobile.png` | storm hook at 390×844 | ![Mobile storm ride](../tmp/launch-assets/stills/storm-ride-mobile.png) |
| `stills/street-station-mobile.png` | station end at 390×844 | ![Mobile station street](../tmp/launch-assets/stills/street-station-mobile.png) |

The sunset-circle poster and shared-room stills are intentionally not emitted
on this baseline: those content surfaces do not exist yet. Rerunning the same
command after they land is the intended pipeline update.

## Clip inventory

Each clip is 5–8 seconds at 12 fps and has a matching frame directory.

| Clip | Outputs | Capture |
| --- | --- | --- |
| Steering through storm traffic | `clips/storm-traffic.gif`, `clips/storm-traffic.webm` | `act1_steady_runner` + storm hook + mounted steering |
| Payout celebration | `clips/payout-celebration.gif`, `clips/payout-celebration.webm` | `act1_steady_runner` + normal board delivery completion |
| Leo race stretch | `clips/leo-race.gif`, `clips/leo-race.webm` | `act1_steady_runner` + existing Leo streak duel |

## Scope check

- Product code, save schema, map geometry, and story state are untouched.
- The only committed changes are the capture script, its npm entry point,
  script documentation, this proof, and the handoff bullet in `STATE.md`.
- Dev-only browser hooks remain guarded by the existing `import.meta.env.DEV`
  path and are not part of the capture change.
