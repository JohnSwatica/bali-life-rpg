# RPG-20260715-01 — Crew Core + Weekly Calendar Proof

Packet: `[RPG-20260715-01]`

Branch: `feat/rpg-20260715-01-crew-core`

Base: `main` at `71881d5` (includes Wave 1 gate commit and `b1920e2`).

Map delta: none.

Save schema: unchanged at v11.

## Delivered substrate

- `CrewDefinition` owns id, name, venue anchor, weekly day/time session slots, and a named `regularBenefit` activation hook.
- Invitation, attendance, regular status, occurrence dedupe, and benefit activation reuse the existing typed `questFlags` map. Membership reuses canonical `life.joinedClubIds`. No dedicated field or migration was needed.
- Crew session slots generate ordinary `GameEvent` records consumed by `EventScheduler`; there is no parallel clock or scheduler.
- A completed on-site participation beat increments attendance once per scheduled occurrence. Attendance three writes regular status and fires the benefit hook once; later attendances never re-fire it.
- Invitations never expire and missed sessions write no penalty state.
- Joined sessions emit one deduplicated open Feed ping per occurrence. Invited-but-unjoined sessions emit none.

The only shipped definition is `act2_test_crew`, an explicitly temporary beach-session fixture for proving the loop. W2-02 must remove or repurpose it when Ari's authored crew arrives.

## Calendar contract

Calendar returns to the visible Phone strip only when `currentAct >= 2`. Acts 0/1 remain Feed / Map / Goals / Profile, and Community remains hidden.

The Calendar read model emits only:

1. invited or joined crew sessions occurring in the current week;
2. the current week's rent day.

Joined sessions use bold type. Invited sessions use normal type plus `invited`. Generic events, opportunities, goals, and chores never enter this surface.

## Automated verification

`src/__tests__/crewSystem.test.ts` proves:

- invited → member transitions and Act 2 gating;
- occurrence-level attendance dedupe;
- regular and regular-benefit activation exactly at attendance three;
- Calendar allowlist, invited/member styling state, and rent-day inclusion;
- existing-scheduler visibility and member-only one-ping behavior;
- v11 persistence round-trip for every crew state component;
- definition anchors, slots, and generated event references.

Full closure:

```text
npm test -- --run
51 test files passed · 338 tests passed · 0 skipped

npm run build
TypeScript + Vite production build passed
```

## Browser beat proof

The `act2_entered` boot state is built by the real Act 0, Act 1, Ibu guarantee, Made key, move-out, weekly scooter, and Act 2-card mutations. The proof then uses public crew mutations, opens the real Calendar, time-warps the existing clock to three weekly occurrences, and completes each through the real Berawa Beach venue-session `Attend` action.

1. [Invited Calendar + rent day](../tmp/beat-proof/act2-crew-core/01-calendar-invited-and-rent-t+002.8s.png)
2. [Joined Calendar row in bold](../tmp/beat-proof/act2-crew-core/02-calendar-member-bold-t+003.6s.png)
3. [First scheduled session open on-site](../tmp/beat-proof/act2-crew-core/03-session-one-open-t+004.4s.png)
4. [Attendance one](../tmp/beat-proof/act2-crew-core/04-attendance-one-t+005.0s.png)
5. [Attendance two](../tmp/beat-proof/act2-crew-core/05-attendance-two-t+006.1s.png)
6. [Attendance 3/3 · REGULAR](../tmp/beat-proof/act2-crew-core/06-regular-at-three-t+007.1s.png)

Command:

```text
npm run beat-proof -- act2_entered scripts/proofs/act2-crew-core.json
```

Result: passed in 7.14 seconds with six screenshots and zero browser/runtime errors.

## Boundary audit

- No Act 0/1 gameplay, economy, rating, map, or progression changes.
- No crew dialogue, authored crew content, benefit effects, FOMO, expiry, missed-session penalty, Community tab, or notification stream.
- Schema remains v11; save key unchanged.
- Proof clock and crew adapters are development-only and eliminated from production output.
