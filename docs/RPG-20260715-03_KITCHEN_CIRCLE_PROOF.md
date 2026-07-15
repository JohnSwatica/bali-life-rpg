# RPG-20260715-03 — Warung Kitchen Circle Proof

Packet: `[RPG-20260715-03]`

Branch: `feat/rpg-20260715-03-kitchen-circle`

Stacked base: W2-02 head `7e9fcb0`. `origin/main` was still `71881d5` and did not contain `[RPG-20260715-02]` when this branch was created, so review and merge must preserve W2-01 → W2-02 → W2-03 order.

Map delta: none. Every beat reuses the existing `canggu_station` / `warung_sari_interior` venue, station, collision, camera, and minimap geometry.

Save schema: unchanged at v11.

## Delivered beats

### 1. Ibu's summons

Every successful Act 2 delivery completed from Ibu's existing NusaDrop board increments a typed quest-flag counter. A successful Act 2 rent payment writes an alternative eligibility flag. At two deliveries or the first rent payment, the existing field objective points to Ibu inside the warung; her normal board interaction yields to a portrait scene:

> Busy night. You have hands. Come Tuesday.

The scene calls the core invitation mutation and leaves `warung_kitchen_circle` invited but not joined. Calendar immediately lists its Tue/Sat promises in invited styling. Neither eligibility path auto-joins, neither expires, and pre-Act-2 deliveries/rent do not count.

### 2. Tue/Sat kitchen sessions

The crew definition authors Tuesday and Saturday 18:00–20:00 slots at Canggu Station. Both become normal events through `buildCrewSessionEvents` and the existing `EventScheduler`. The exterior cue shows plates and steam at the warung door; the participation scene itself stays inside the existing warung.

Workstream D's counter, pans, stools, caddy, and seated diners provide the room base. During a live session, the scene adds steam and a row of plates; Ibu occupies the back counter and Kadek is present on every other occurrence. The first menu action says `Join & serve`, uses the normal crew membership mutation, then opens one staged SERVE exchange. Later visits say `Serve & attend`. There is no minigame, race, failure, price system, or missed-session state. Attendance is applied only after the exchange closes, and the core still makes the player regular exactly at three.

### 3. The overheard squeeze

The first Kitchen participation beat in any actual session is the one-time squeeze. Ibu is staged at the back counter with the phone visible through the steam. The player hears her check the platform's new commission and do the math without addressing them:

> Thirty percent?

> Then I cook for the app, not for people.

The persisted flag is global to the crew, so a missed Tuesday simply moves the scene to Saturday or the next session. Subsequent sessions select distinct small SERVE exchanges from the attendance-indexed pool; the squeeze cannot repeat.

Approaching Ibu afterward produces one proud deflection—“The phone has had enough of my time. Plates first.”—then returns her normal interaction surface on later approaches. Two in-game days after the overheard call, one stable story Feed row quietly reports that rice plates are Rp 2 more. This is narrative residue only: no commission field, payout modifier, menu price state, or warung simulation exists.

## Automated verification

Focused coverage proves:

- both invitation gates independently: two completed Ibu-board deliveries or one successful Act 2 rent payment;
- no pre-Act-2 gate accumulation;
- summons copy, invited-not-member state, and one-time invitation behavior;
- Tue/Sat 18:00–20:00 scheduler windows and no off-window crew event;
- first-session squeeze regardless of occurrence, exactly once;
- attendance completion and regular/benefit-hook activation exactly at three;
- one-time deflection and residue delay/deduplication;
- existing warung staging, Ibu placement, deterministic every-other-session Kadek presence, and exterior door cue;
- v11 round-trip for gate, invitation, membership, attendance, squeeze, and deflection state;
- the new `act2_ari_crew_complete` proof state has Ari regular at three while Crew B remains uninvited.

Final closure commands:

```text
npm test
npm run build
```

Result: 53 test files / 355 tests passed with zero skips; TypeScript and the Vite production build passed. The existing large-chunk advisory is unchanged.

## Browser beat proof

The proof starts from `act2_ari_crew_complete`, constructed by the real Act 0/1/finale mutations plus W2-02's public crew mutations. Ari is already regular and Crew B is untouched. The proof then completes two ordinary board deliveries through their real pickup/dropoff loop, follows the new Ibu objective, and time-warps only the authored clock to Tuesday evening and the residue day.

Command:

```text
npm run beat-proof -- act2_ari_crew_complete scripts/proofs/act2-warung-kitchen-circle.json
```

Captured evidence:

1. [Ibu's Kitchen Circle summons inside the existing warung](../tmp/beat-proof/act2-warung-kitchen-circle/01-ibu-kitchen-circle-summons-t+032.5s.png).
2. [Calendar showing Tue/Sat Kitchen Circle promises as invited](../tmp/beat-proof/act2-warung-kitchen-circle/02-calendar-kitchen-circle-invited-t+040.1s.png).
3. [Tuesday evening interior staging with steam, plates, stools, diners, Ibu, and Kadek](../tmp/beat-proof/act2-warung-kitchen-circle/03-tuesday-kitchen-circle-staging-t+040.9s.png).
4. [The first SERVE beat overhearing the 30% squeeze, with Ibu's back-counter phone visible](../tmp/beat-proof/act2-warung-kitchen-circle/04-overheard-thirty-percent-squeeze-t+041.3s.png).
5. [Attendance 1/3 after the participation continuation](../tmp/beat-proof/act2-warung-kitchen-circle/05-kitchen-attendance-one-t+041.6s.png).
6. [Ibu's one proud deflection on the next approach](../tmp/beat-proof/act2-warung-kitchen-circle/06-ibu-proud-deflection-t+048.3s.png).
7. [The delayed Feed residue showing the Rp 2 menu-board increase](../tmp/beat-proof/act2-warung-kitchen-circle/07-menu-price-residue-t+055.7s.png).

Result: passed in 55.80 seconds with seven screenshots and zero browser/runtime errors.

## Boundary audit

- No map parcel, second scheduler, save field, schema migration, notification stream, commission mechanic, warung economy simulation, Kadek choice, real SERVE minigame, or Warung Rush wiring.
- No Act 0/1 content or balance change: delivery/rent hooks record eligibility only when `currentAct >= 2`.
- Missed sessions and late-within-window arrival have no downside; invitations do not expire.
- Community remains hidden. Calendar retains the W2-01 allowlist: known crew sessions this week plus rent day only.
- Regular activates only the inert structural hook; W2-04 owns benefits and W2-06 owns the real SERVE minigame.
