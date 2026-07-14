# RPG-20260714-04 — Dev Proof Harness Proof

Packet: `[RPG-20260714-04]`  
Map delta: none — dev-only proof infrastructure  
Branch: `feat/rpg-20260714-04-dev-proof-harness`

## Result

Beat-scoped browser proofs can now start at a gameplay-reachable Act 1 gate and reach the authored beat in seconds. The shipped states are:

- `act0_complete` — Act 1, rate cut fired, Leo encounter pending.
- `act1_leo_resolved` — Leo encounter resolved and Kadek's special offer live.
- `act1_steady_runner` — three counted deliveries, Kadek's priority scene complete, priority residue live.

Run a state directly in a dev build:

```js
window.__BALI_LIFE_DEV_PROOF__.bootState("act1_steady_runner")
```

The call builds a new world, writes it through `saveWorldState`, reloads, and resumes the normal loaded game. A booted state therefore persists and reloads exactly like a played save; schema remains v11.

## Construction validity

`src/dev/DevProofStates.ts` is a registry of one builder per named state. No serialized world fixture or hand-authored world-state object exists. Builders begin with `createInitialWorldState()` and compose gameplay mutations:

```text
createInitialWorldState
  -> startAct0FirstDelivery
  -> acceptDelivery / pickupDelivery / completeDelivery
  -> completeAct0CafeScene / completeAct0Step
  -> revealAct0Deposit / prepareAct0VillaOrder / resolveAct0Deposit
  -> sleepAtHomeUntilMorning
  -> triggerAct1RateCut
  -> completeAct1LeoEncounter
  -> Kadek delivery through accept/pickup/complete
  -> repairScooter
  -> normal counted delivery through accept/pickup/complete
```

The Act 0 opening, café resolution, villa preparation, and Leo resolution were extracted from `GameScene` into public story functions, and `GameScene` now calls those same functions. Every builder step checks its mutation result and throws immediately if a prerequisite or gameplay gate makes the path invalid. Adding a state means adding one builder and one registry entry.

## Stable interaction API

The dev-only object exposes:

- `acceptDeliveryById(id)` — delegates to the phone's delivery handler and `acceptDelivery`; unavailable jobs return the real rejection.
- `openPhoneTab(tab)` — uses `PhoneShell.open` and respects the same scene-mode restriction as the phone UI.
- `getBoardOffers()` — returns `{ id, label, available, reason }` from `getDeliveryOfferAvailability`.
- `clickDialogueOption(index)` — clicks the actual rendered choice button, invoking the same registered handler as player input.

Focused tests prove the Leo-gated Kadek rush, priority-only recurring line, and unknown IDs are rejected. No alternate acceptance or story logic exists in the API.

## Beat runner and acceptance demo

The full wave-gate smoke file is untouched. The sibling runner accepts a boot state and declarative JSON proof steps:

```bash
npm run beat-proof -- act1_leo_resolved scripts/proofs/kadek-priority-from-leo-resolved.json
```

RPG-20260714-03 was not merged into `main`, so the acceptance demo used the packet-authorized fallback: Kadek's existing priority offer from `act1_leo_resolved`.

Measured wall clock: **28.34 seconds**, including server/browser boot, authored-state construction, save/reload, offer assertion, real delivery acceptance, objective-relative dev transit, real pickup/dropoff interactions, and screenshots. There were no browser runtime errors.

Screenshots:

- Board/phone offer at 2.3 seconds: `tmp/beat-proof/kadek-priority-from-leo-resolved/01-kadek-offer-t+002.3s.png`
- Kadek priority dialogue and Focus Buffer residue at 28.2 seconds: `tmp/beat-proof/kadek-priority-from-leo-resolved/02-kadek-priority-dialogue-t+028.2s.png`

Exterior transit uses the existing dev teleport with the current `objectiveTargets[0]`, never canvas coordinates or authored locations. Pickup, interior transitions, dropoff, delivery completion, payout, rating, Kadek flags, and dialogue all run through normal player interaction handlers.

## Verification

```text
npm test -- --run
45 test files passed
290 tests passed
0 skipped / 0 failed

npm run build
PASS (Vite production build)
```

Production-bundle check:

```bash
rg "__BALI_LIFE_DEV_PROOF__|__BALI_LIFE_DEV_SENSATION__|act1_steady_runner|act1_leo_resolved|bali-life-rpg.dev-proof-resume" dist
```

Result: no matches. The install, cleanup, dynamic import, boot-state names, and session marker are all eliminated from the production output. `scripts/smokePlaythrough.mjs` has no diff and remains the unskipped wave-gate instrument.
