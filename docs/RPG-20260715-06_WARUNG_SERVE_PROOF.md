# RPG-20260715-06 — Warung Rush SERVE Restage Proof

Packet: `[RPG-20260715-06]`

Branch: `feat/rpg-20260715-06-warung-rush-serve`

Stacked base: W2-05 head `8f4cf4b`. `origin/main` was still `71881d5` and did not contain `[RPG-20260715-05]` when this branch was created, so review and merge must preserve W2-01 → W2-02 → W2-03 → W2-04 → W2-05 → W2-06 order.

Map delta: none.

Save schema: unchanged at v11. New rounds persist an optional context on the existing `warungRush` active-activity variant; an already-active pre-W2-06 v11 lunch-rush save with no context remains loadable and may finish once through a compatibility resolver.

## Delivered restage

Warung Rush is no longer a generic daytime Canggu Station activity. Its definition was removed from the activity registry, so venue-purpose rows and the standard activity engine cannot launch it. The existing minigame now begins only through two authored Ibu paths:

- a live Tuesday/Saturday Warung Kitchen Circle event, where the W2-03 framing and first-session squeeze run before the dinner round;
- Ibu's member-only Thursday 18:00–21:00 busy-night Feed ping, with one stable message and one completion per in-game week.

Both paths enter the existing warung interior and call the same Warung Rush state, movement, order, dish, patience, and scoring functions. A Kitchen session does not count when the framing dialogue opens. It counts only after the rush resolves through the existing event-participation, `AttendEvent`, and crew-attendance mutations. Even a zero-score round counts; missing the session still writes nothing.

A strong session round (score at least `0.72`) adds one line from a three-line Mira/Wayan/Kadek pool. The line is selected from prior attendance, so the first three strong attendance positions do not repeat. Busy-night rounds never alter crew attendance.

## Stakes and economy

Performance is clamped to `0..1`; no result can remove money or affinity:

| Result | Tip | Ibu affinity |
|---|---:|---:|
| Weak (`< 0.50`) | Rp 12–19 | +1 |
| Steady (`0.50..<0.72`) | Rp 20–23 | +2 |
| Strong (`>= 0.72`) | Rp 24–28 | +3 |

The exact tip is `round(12 + 16 × score)`. Weak feedback explicitly says Ibu is teasing, not docking the player. A standalone busy night also uses the existing meter/time machinery for Energy `-5`, Wellbeing `+2`, Social `+6`, and 25 in-game minutes. Kitchen sessions retain their existing event-defined meter effects and duration.

After the one-time commission squeeze flag, both entry framing and the running toast use Ibu's authored line: “Every plate we serve ourselves is a plate the app doesn't tax.” Before that flag they use neutral people-first copy.

No Wave-1 delivery payout, rating, rent, repair, tip-dilemma, finale, shop, or meal number changed.

## No mechanics or tuning change

`WARUNG_RUSH_FEEL_TUNING` remains byte-for-byte at:

```text
roundDurationMs:        75000
patienceMs:             18000
orderIntervalMs:         6200
maxSimultaneousOrders:      4
playsPerDifficultyStep:     2
```

The existing counter pickup, matching-table service, order expiry, score calculation, and every-two-plays difficulty step are unchanged. The retained internal activity/history ID is intentionally `warung_lunch_rush` for v11 save compatibility; it is no longer a player-facing lunch launch surface.

## Automated verification

Coverage proves:

- the generic activity definition and Canggu ActivityEngine launch are absent;
- non-members, other days, and out-of-window clocks cannot receive or launch a busy night;
- the Thursday member ping has one stable ID per week and a later week gets a distinct ID;
- busy-night access exists only while its live ping/window is valid and closes after completion;
- weak and strong tips/affinity stay within the exact positive bounds;
- weak Kitchen play counts attendance and regular still activates at exactly three;
- attendance is absent before rush resolution and occurrence dedupe still applies;
- strong session lines rotate without repeats;
- busy-night play does not count attendance;
- post-squeeze copy is flag-gated;
- session `serveContext` survives a schema-v11 save/load round trip, while a legacy context-free active rush still hydrates;
- the proof boot is a real Kitchen member/regular state assembled through gameplay mutations;
- unread story pings outrank read story history on the Phone's limited Feed surface;
- all Wave-1 reconciliation assertions remain green.

Final closure commands:

```text
npm test
npm run build
```

Result: 56 test files / 381 tests passed with zero skips; TypeScript and the Vite production build passed. The existing large-chunk advisory is unchanged.

## Browser beat proof

All proof runs start from `act2_kitchen_serve_ready`, which composes the existing both-crews-regular boot through gameplay mutations and lands on a live Tuesday 18:15 Kitchen session. Authored clock control moves the separate busy-night run to Thursday 18:15.

Desktop session proof:

1. [The only live session row launches “Serve & attend”](../tmp/beat-proof/act2-warung-serve-session/01-session-entry-t+004.5s.png).
2. [Wayan frames the round as Ibu's real dinner rush](../tmp/beat-proof/act2-warung-serve-session/02-session-framing-t+006.1s.png).
3. [The unchanged movement-based round runs inside the warung](../tmp/beat-proof/act2-warung-serve-session/03-rush-running-t+007.7s.png).
4. [A weak hands-off round gives a positive Rp 18 tip, +1 affinity, and explicit no-docking feedback](../tmp/beat-proof/act2-warung-serve/04-session-fail-forward-feedback.png).
5. [Only then does Kitchen attendance increment](../tmp/beat-proof/act2-warung-serve/05-session-attendance-four.png).

Busy-night proof:

1. [The unread member-only Ibu ping wins the limited Feed surface](../tmp/beat-proof/act2-warung-serve-busy-night/01-member-busy-night-ping-t+004.9s.png).
2. [The venue exposes one member-only SERVE row with the post-squeeze line and no generic rush row](../tmp/beat-proof/act2-warung-serve-busy-night/02-member-busy-night-entry-t+005.6s.png).

Mobile proof at an actual touch-capable `390×844` viewport:

1. [The Kitchen event and full-width Serve button remain in bounds](../tmp/beat-proof/act2-warung-serve-mobile/01-mobile-session-entry-t+003.4s.png).
2. [The scene continuation becomes a touch button](../tmp/beat-proof/act2-warung-serve-mobile/02-mobile-session-framing-t+004.9s.png).
3. [The live rush shows the shipped joystick and ACT control without rebuilding input](../tmp/beat-proof/act2-warung-serve-mobile/03-mobile-rush-running-t+006.5s.png).

The three reusable proof scripts live in `scripts/proofs/act2-warung-serve-*.json`. Browser console and page-error listeners reported no errors.

## Boundary audit

- No new minigame, mode, scheduler, notification channel, meter, difficulty ladder, map parcel, or schema migration.
- No rush launch at another venue, no player-café rush, and no shop restructuring.
- No Warung Rush timing, patience, order cadence, maximum-order, serving, input, or scoring change.
- Busy nights are member-only, capped at one stable ping/completion per week, and carry no missed-session or expiry penalty.
- New performance residue is always positive and bounded; Wave-1 economy remains untouched.
