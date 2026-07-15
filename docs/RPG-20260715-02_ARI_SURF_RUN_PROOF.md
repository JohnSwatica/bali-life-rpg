# RPG-20260715-02 — Ari's Surf & Run Crew Proof

Packet: `[RPG-20260715-02]`

Branch: `feat/rpg-20260715-02-ari-surf-run`

Stacked base: W2-01 head `e8be586`. `origin/main` was still `71881d5` and did not contain `[RPG-20260715-01]` when this branch was created, so review and merge must preserve packet order.

Map delta: none. The sessions reuse the existing `berawa_beach` anchor and authored beach edge.

Save schema: unchanged at v11.

## Delivered beats

### 1. Ari's invitation

The existing delivery data now explicitly tags beach-adjacent handoffs. The first tagged delivery completed after the Act 2 card calls the normal crew invitation mutation and opens an Ari portrait scene at the dropoff:

> Stay ten minutes. The ocean doesn't take tips.

The scene leaves `berawa_surf_run_crew` invited but not joined, so Calendar lights up immediately in its invited style. Pre-Act-2 deliveries, non-beach deliveries, and every later beach delivery do not fire it. No Feed line substitutes for the scene, and the invitation never expires.

### 2. Sunset Beach Circle

The crew definition authors Wednesday and Friday 17:00–19:00 slots. Each produces a normal `GameEvent` through W2-01's generator and existing `EventScheduler`. The active world scene contains five figures including named Ari, a small fire, two boards, and a visibly closed laptop. The scene uses the normal dusk lighting and temporarily reuses the existing `nightQuiet`-adjacent ambient bed only while the TALK panel is open.

The first live session converts invitation to membership through the existing `joinCrew` mutation. Attendance is not applied by opening the venue menu: it completes only after the short TALK continuation. The attendance-derived line pools give the first three visits distinct member copy. Ari's exact plant appears only at a sunset circle and a persisted v11 flag prevents it from ever repeating:

> Client calls, man. So many client calls.

### 3. Sunday run

Sunday 06:30–08:30 generates a lighter `run` event through the same scheduler. Its world scene stages four crew figures along the beach-edge path and run markers. It uses the same TALK/attendance completion path and counts equally toward regular status; it adds no race, timer, minigame, failure, or missed-session state.

## Gating and migration seam

- An active delivery now outranks the broad Act 2 social objective, so its real pickup/dropoff marker remains actionable until completion.
- The existing Act 2 `attend_club_rhythm` goal reads generated `crewSession` event IDs as well as legacy social-group event IDs.
- Berawa Beach suppresses the two legacy Ari Run Crew/Surf Circle join rows once Act 2 begins. Their data remains load-safe, but the Act 2 venue presents only the combined Surf & Run Crew.
- Regular still fires exactly at attendance three and activates only the inert W2-01 `regularBenefit` hook. No benefit effect ships here.

## Automated verification

Focused coverage proves:

- first post-card beach-delivery invitation gating and one-time scene copy;
- invited → member transition on the first session;
- Wed/Fri sunset and Sunday morning scheduler windows;
- attendance and regular-at-three through the core;
- three distinct first-attendance TALK beats;
- one persisted Ari plant line across sunset/run visits;
- five-person circle and four-person run staging, Ari identity, and required dressing;
- new-core attendance satisfies the existing Act 2 rhythm gate;
- active Act 2 deliveries retain pickup/dropoff objective priority;
- Calendar, ping, occurrence dedupe, benefit-hook, and v11 round-trip regressions remain green.

Final closure commands:

```text
npm test -- --run
npm run build
```

Result: 52 test files / 345 tests passed with zero skips; TypeScript and the Vite production build passed. The existing large-chunk advisory is unchanged.

## Browser beat proof

The proof starts from the authored `act2_entered` builder. Because that honest post-breakdown state begins at 3.4★ and the existing beach-adjacent board offer requires 4.0★, it completes six ordinary low-tier deliveries rather than mutating rating. It then completes the real beach delivery, captures Ari's dropoff scene, opens the real Calendar, and time-warps only the existing clock to one Wednesday circle, one Sunday run, and the third circle that reaches regular.

Command:

```text
npm run beat-proof -- act2_entered scripts/proofs/act2-ari-surf-run.json
```

Captured evidence:

1. [Ari at the beach-adjacent dropoff with the invitation scene](../tmp/beat-proof/act2-ari-surf-run/01-ari-at-beach-dropoff-invitation-t+089.6s.png).
2. [Calendar showing the crew as invited](../tmp/beat-proof/act2-ari-surf-run/02-calendar-invited-t+089.9s.png).
3. [Five-person Wednesday circle staged at dusk with fire, boards, and closed laptop](../tmp/beat-proof/act2-ari-surf-run/03-wednesday-circle-staged-at-dusk-t+090.4s.png).
4. [First rotating TALK beat and Ari's one secret plant](../tmp/beat-proof/act2-ari-surf-run/04-first-rotating-talk-and-single-ari-plant-t+090.8s.png).
5. [Attendance 1/3 after the TALK continuation](../tmp/beat-proof/act2-ari-surf-run/05-attendance-one-t+091.1s.png).
6. [Sunday beach-edge run staging](../tmp/beat-proof/act2-ari-surf-run/06-sunday-run-staged-t+091.6s.png).
7. [A distinct Sunday TALK beat with no repeated plant](../tmp/beat-proof/act2-ari-surf-run/07-sunday-rotating-talk-t+091.9s.png).
8. [Attendance 2/3](../tmp/beat-proof/act2-ari-surf-run/08-attendance-two-t+092.1s.png).
9. [Attendance 3/3 · REGULAR](../tmp/beat-proof/act2-ari-surf-run/09-regular-at-three-t+092.7s.png).
10. [Calendar showing all three weekly sessions in joined bold styling](../tmp/beat-proof/act2-ari-surf-run/10-calendar-member-bold-t+093.1s.png).

Result: passed in 93.17 seconds with ten screenshots and zero browser/runtime errors.

## Boundary audit

- No map parcel, building, lighting fork, second scheduler, notification stream, minigame, crew benefit, Ari resolution, or second W2 crew.
- Missed sessions and late-within-window arrival have no downside; invitations do not expire.
- Community remains hidden. Calendar retains the W2-01 allowlist: crew sessions this week plus rent day only.
- Existing old-save group IDs remain readable; schema and save key are unchanged.
