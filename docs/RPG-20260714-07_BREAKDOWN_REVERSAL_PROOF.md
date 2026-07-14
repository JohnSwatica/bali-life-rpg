# RPG-20260714-07 — Breakdown Reversal Proof

Packet: `[RPG-20260714-07]`

Branch: `feat/rpg-20260714-07-breakdown-reversal`

Map delta: none — staged on the existing street's far-end delivery stretch.

Save schema: unchanged at v11.

## Delivered beat

- The first successfully accepted board delivery after Kadek's priority flag and Made's hidden-room scene arms one persisted breakdown; no random condition or repeat path can fire it.
- After actual mounted street travel enters the deterministic dropoff-distance band, a procedural sound sting and smoke puff stop the scooter, set cargo to 0%, and switch the existing stuck-bike presentation to a dedicated slow push.
- The objective reads `TRANSMISSION GONE — push it in`; the timer cannot kill the run. The handoff completes late, pays the base fare, counts toward hustle progress, and opens an authored ruined-cargo dropoff panel.
- Driver rating is set exactly to 3.2. Kadek's priority line and all offers above 3.2 show `Locked — rating` with required/current values; the 3.2 normal tier remains reachable after repair.
- The scooter counter repairs the transmission and restores riding, but explicitly leaves the rating unchanged. Group-helper recovery cannot bypass this repair.
- Exactly one Leo message lands at the blowout. Kadek's residue reads, `The list holds. Ratings are the app's opinion, not mine.` Made's goal shows `premium rating 3.2/3.5★ ✗`.

## Automated proof

`src/__tests__/act1Breakdown.test.ts` covers:

- both-turning-point + first-accepted-board-run gating;
- deterministic distance/time trigger and one-time behavior;
- cargo 0%, forced late handoff, one-star ruined run, and global rating set to 3.2;
- idempotent single Leo text;
- honest premium locks and available normal post-repair work;
- repair restoring ride but not rating, including a zero-wallet start whose base fare funds the repair;
- Kadek and Made residue;
- a post-reversal fifth normal run reaching delivery, earnings, and rent finale preconditions while the unchanged 4.2 milestone correctly remains unresolved for Beat 5.

Full closure:

```text
npm test -- --run
47 test files passed · 306 tests passed · 0 skipped

npm run build
TypeScript + Vite production build passed
```

## Gameplay-reachable browser proof

The new `act1_both_tps` state is built by composing the real Act 0, rate-cut, Leo, Kadek delivery/scene, normal delivery, repair, and Made scene mutations. The production bundle still excludes the dev proof hook.

Command:

```text
npm run beat-proof -- act1_both_tps scripts/proofs/act1-breakdown-reversal.json
```

Result: passed in 25.01 seconds with zero browser/runtime errors.

Screenshots:

1. [Transmission blowout, smoke, zero cargo, and push objective](../tmp/beat-proof/act1-breakdown-reversal/01-transmission-blowout-t+008.5s.png)
2. [Slow push completed across the existing street](../tmp/beat-proof/act1-breakdown-reversal/02-push-objective-t+022.2s.png)
3. [Authored late/ruined dropoff and 3.2 premium lock](../tmp/beat-proof/act1-breakdown-reversal/03-ruined-late-dropoff-t+023.6s.png)
4. [3.2 HUD and counter-repair objective](../tmp/beat-proof/act1-breakdown-reversal/04-rating-and-repair-objective-t+024.3s.png)
5. [Leo's single text plus honest locked premium board lines](../tmp/beat-proof/act1-breakdown-reversal/05-leo-text-and-locked-premium-t+024.4s.png)
6. [Made goal with the failed 3.2/3.5★ condition](../tmp/beat-proof/act1-breakdown-reversal/06-made-rating-condition-fails-t+024.9s.png)

## Boundary audit

- No Act 0, tip dilemma, finale, milestone formula, race, map geometry, or economy-rescale change.
- No new minigame, game-over, random breakdown, schema field, or migration.
- The existing 5 deliveries / Rp 600 / 4.2★ milestone is intentionally untouched; RPG-20260714-09 owns the Ibu-guarantee substitution.
