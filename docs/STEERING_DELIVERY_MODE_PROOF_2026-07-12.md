# RPG-20260712-03 — Steering Delivery Mode Proof

## Contract shipped

- Every picked-up delivery stays in world mode: steering, traffic, pedestrians, potholes/puddles, cargo care, rain slick, and time pressure run together.
- Contacts reduce cargo integrity and multiply current speed by the authored stumble factor. They never fail, knock out, or end a delivery.
- Continuous run quality uses hazards avoided, near-misses, contacts, and elapsed time. It feeds the existing delivery rating/payout seam.
- Base payout is never reduced. Quality and cargo integrity only move bonus/upside margins.
- `jl_pantai_berawa` has one authored density knob: forgiving tutorial/catering runs (`0.55`) and full Act 1/race pressure (`1.0`). Base ride-feel constants were not retuned.
- Leo's ghost race retains its own route checkpoints and runs through the full live hazard field.

## Old-flow removal audit

The delivery checkpoint module and its unit test were deleted. The delivery-only `ride_checkpoint_*` activity definitions, committed-activity source/persistence path, modal trigger code, and world markers were removed. A repository grep outside historical prompt/state text returns no delivery checkpoint implementation references. The explicit Ibu Sari mission assertion uses `act0_ibu_milk_madu_catering` and verifies that it receives the forgiving live hazard set.

## Automated proof

- `npm test -- --run`: 40 files / 258 tests passed.
- `npm run build`: passed.
- `npm run smoke`: passed. It drove `act0_ibu_milk_madu_catering` from the fresh v4 choice through drop-off using dumb direct steering. Final run telemetry: `29.66s`, `hazards=6`, `avoided=1`, `nearMisses=0`, `contacts=0`; the delivery still completed.
- `390x844`: passed with `joystickVisible=true`, 6 DOM buttons, and every control rectangle inside the viewport.

## Visual evidence

- Live ride sequence: `tmp/smoke/05-steering-delivery-live-t+050.9s.png`, `tmp/smoke/06-ride-live-2-t+054.1s.png`, `tmp/smoke/06-ride-live-4-t+055.7s.png`, `tmp/smoke/06-ride-live-6-t+057.3s.png`, `tmp/smoke/06-milk-madu-catering-dropoff-t+081.7s.png`.
- Locked alley: before `tmp/street-legibility-2026-07-11/02-after-near-baked.png`; after `tmp/smoke/10-baked-locked-alley-t+156.2s.png`.
- Touch parity: `tmp/smoke/11-touch-390x844-t+158.7s.png`.

Physical-device iOS/Android validation remains pending; the required `390x844` browser/touch contract is automated.
