# RPG-20260713-04 — First Ten Minutes Proof

Date: 2026-07-13  
Branch: `feat/rpg-20260713-04-first-ten-minutes`  
Map delta: none  
Save schema: v11 unchanged

## Outcome

Act 0 after the catering handoff is no longer a venue-menu tutorial. The critical path is now:

`Milk & Madu scene → NusaDrop phone signup → storm delivery → deposit ultimatum → villa surge phone ping → fragile night villa run → deposit resolve/Ibu guarantee → bleak kos collapse → existing Act 1 rate-cut seam`.

The old critical-path Milk & Madu activity-menu clicks and kos sleep-menu click are removed. Optional venue/shop menus still exist off-path and after Act 0.

## Economy contract

| Item | Rp |
| --- | ---: |
| Starting wallet | 70 |
| Clean catering payout | 160 |
| Cafe plate + coffee scene cost | -30 |
| Storm run | 80 base + 60 care margin; 154 clean at 5★ |
| Deposit target | 560 |
| Villa run | 110 base + 150 fragile-surge margin; 286 clean at forced 5★ |
| Fully clean wallet before deposit | 640 |
| Fully clean Act 1 opening wallet | 80 |

The villa's advertised clean Rp 286 covers the observed pre-villa smoke gap (Rp 271). Cargo hits remove only care/surge margin. The proof run landed at Rp 557 after a degraded villa run, so Ibu Sari guaranteed the final Rp 3 and Act 0 completed. Both authored story deliveries set `countsTowardHustleProgress: false`; the catering run remains the only Act 0 contribution to Act 1's five-run/Rp 600 move-out math. The Act 1 rate-cut multiplier and threshold are unchanged.

## Timestamped browser proof

The standing smoke harness used real keyboard/pointer input for the three delivery legs. It used the existing dev teleport once to reach the BAKED pickup approach after the storm drop because the generic straight-line harness cannot route around the authored locked alley; it did not grant cargo, money, steps, or a delivery result.

| Wall time | Beat | Proof |
| ---: | --- | --- |
| 0:50.5 | First live catering stakes | `tmp/smoke/05-steering-delivery-live-t+050.5s.png` |
| 1:08.8 | Milk & Madu interior, plate/coffee, Julian Vance visible | `tmp/smoke/07-cafe-scene-vance-t+068.8s.png` |
| 1:29.7 | NusaDrop signup, leaderboard `#1 LEO` | `tmp/smoke/08-signup-leo-leaderboard-t+089.7s.png` |
| 1:35.2 | Storm active mid-ride | `tmp/smoke/09-storm-mid-ride-t+095.2s.png` |
| 1:44.2 | Landlord deposit ultimatum | `tmp/smoke/10-landlord-ultimatum-t+104.2s.png` |
| 1:56.4 | Villa surge order; clean payout and gap visible | `tmp/smoke/11-villa-surge-phone-t+116.4s.png` |
| 2:26.6 | Night villa payout / 5★ run | `tmp/smoke/12-night-villa-celebration-t+146.6s.png` |
| 3:07.0 | Landlord count and Ibu-guarantee branch | `tmp/smoke/13-landlord-resolve-t+187.0s.png` |
| 3:19.4 | Bleak kos collapse | `tmp/smoke/14-bleak-kos-collapse-t+199.4s.png` |
| 3:32.1 | Existing Act 1 NusaDrop rate-cut card | `tmp/smoke/15-act1-rate-cut-seam-t+212.1s.png` |
| 3:35.1 | Existing morning hand | `tmp/smoke/16-act1-morning-hand-t+215.1s.png` |
| 3:37.0 | 390×844 controls in bounds | `tmp/smoke/14-touch-390x844-t+217.0s.png` |

New Game to first live stakes is 50.5 seconds. The deterministic direct-input fast path reaches the Act 1 seam in 3:32.1. That is an honest lower-bound automation measurement, not the 9–11 minute first-player target: the harness reads instantly, takes direct lines, and skips the offscreen pickup approach. No artificial wait or delivery-completion gate was added merely to inflate the number, because packet timing targets are not hard gates and every ride must remain fail-forward. A human first-read pacing check remains necessary before claiming the 9–11 target is met.

## Fail-forward and save proof

- Storm activation is recorded once at 4.5 seconds of ride-run time; repeat checks are no-ops.
- Delivery hazards, ambient traffic, and mud reduce cargo/payout or cause a speed stumble. During the authored transit windows they cannot immobilize the scooter and demand helper recovery.
- Deposit resolution is idempotent. Covered wallets pay Rp 560; short wallets pay what they have and Ibu guarantees the exact difference.
- ESC/tap skips every cutscene to its normal callback. Closing either authored phone moment also resolves the default-forward action.
- Legacy `buy_meal_and_coffee` and `sleep_first_night` saves remain valid. Removed prototype ids map to the nearest surviving new beat. Schema v11 and the save key are unchanged.
- Debug proof reported `act0StormTriggerCount=1` and `act0CriticalPathMenuOpens=0` at the Act 1 seam.

## Verification

- `npm test -- --run`: 43 files, 276 tests passed.
- `npm run build`: passed (`tsc` + Vite production build); only the existing large-chunk warning remains.
- `npm run smoke`: passed through fresh save → Act 1 morning hand; no browser/page errors.
- Mobile `390×844`: six visible controls, all inside viewport bounds.

## Bible beats intentionally not implemented

- Act 1 Made room offer / Made arc.
- Kadek priority-driver moment or Kadek arc.
- Leo escalation beyond the existing rate-cut encounter and existing race.
- Act 1 midpoint breakdown and closing milestone.
- Julian Vance pressure campaign beyond this Milk & Madu plant.
- Surge Zone mechanics (the villa order uses authored payout copy only).
- Hidden-metric/Trust Graph reveal, Act 2 story content, furniture/BUILD systems, and any Act 3+ management layer.
