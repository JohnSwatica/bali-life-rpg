# RPG-20260715-07 — Whistleblower Sourdough Proof

Packet: `[RPG-20260715-07]`

Branch: `feat/rpg-20260715-07-whistleblower-sourdough`

Stacked base: W2-06 head `2af6764`. `origin/main` was still `71881d5` and did not contain `[RPG-20260715-06]` when this branch was created, so review and merge must preserve W2-01 → W2-02 → W2-03 → W2-04 → W2-05 → W2-06 → W2-07 order.

Map delta: none. The scripted route uses the existing FINNS Recreation Club pickup area and BAKED. interior; no corporate café or brother NPC was added.

Save schema: unchanged at v11. Eligibility, evidence, pending/resolved choice, branch, and next-session closure use typed accessors over the existing `questFlags` pattern.

## Delivered beat

The beat requires all of the authored state below:

- Act 2 entered;
- Kadek at the existing `friendly` affinity tier or higher;
- Warung Kitchen Circle regular status (three attendances).

At that exact gate, Kadek's ordinary recurring priority row is temporarily replaced by one authored `PRIORITY · wrong-address pastry return` row. It cannot be accepted before 20:00. The pickup is a scripted rejected box, not a random-delivery rule: the player receives Kadek's unmistakable pastries carrying a corporate-café label and another supplier name, then returns the evidence to BAKED. after hours.

The BAKED. handoff opens one full relationship-choice panel. Kadek states the brother's scooter debt, the anonymous rival work, and his shame without denying the evidence or adding a brother/corporate-café simulation. There are exactly two choices:

- **PROTECT:** keep the label private and give Kadek one night to end the work himself;
- **EXPOSE:** tell the circle because the squeeze economy is making people hide work, never to shame Kadek.

The relationship-scene skip option is explicitly index `0`, so ESC/skip resolves to PROTECT. Pending choice state reopens through the existing resume path after a save/load interruption.

## Choice residue map

| Branch | Community Trust / `rootedAxis` | Platform Efficiency / `relationalAxis` | Kadek affinity | Ending-readable residue |
|---|---:|---:|---:|---|
| PROTECT | `+5` | `0` | `0` | private trust; Kadek's own-name / eat-first plant |
| EXPOSE | `-3` | `0` | `0` | visible trust dent; Ibu's circle-closes-around-him response; communal baking plant |

The delivery's authored base payout is Rp 80, is identical for both branches, and does not count toward hustle/finale progress. Existing Act 1 rate-cut and delivery payout calculation remain authoritative, so the proof save receives Rp 73. No branch changes cash, delivery earnings, rating, affinity, crew status, meters, access, or prices. Platform Efficiency is neutral in both branches.

The branch writes one pending closure. At the next Kitchen Circle session actually attended, Kadek appears even if that occurrence falls outside his ordinary every-other-session ambient cadence and says exactly one branch-specific line:

- PROTECT: the night work is finished, followed by the own-name / eat-first Season 2 plant;
- EXPOSE: the other kitchen is finished, followed by “We bake it here. Together.”

Consuming the line marks moonlighting ended and records that session day. A missed session writes nothing, the line cannot repeat, and neither branch destroys a relationship.

## Automated verification

Focused and regression coverage proves:

- all three gate components are required;
- the one-time row replaces Kadek's recurring row only while unresolved;
- the 20:00 after-hours acceptance gate is exact;
- pickup persists the evidence-in-hand state and completion opens one pending scene;
- resolution is one-time and branch flags are mutually exclusive;
- PROTECT and EXPOSE apply the exact trust deltas above while leaving Platform Efficiency and Kadek affinity unchanged;
- the scene has exactly two choices and its skip default is PROTECT;
- both branch states and the pending next-session closure survive a schema-v11 save/load round trip;
- the first later attended Kitchen session consumes the correct line once and records moonlighting ended;
- the gameplay-reachable proof state is assembled from the existing both-crews-regular mutations;
- all prior Wave-1 and W2 reconciliation assertions remain green.

Final closure commands:

```text
npm test
npm run build
git diff --check
```

Result: 57 test files / 391 tests passed with zero skips; TypeScript and the Vite production build passed; whitespace validation passed. The production bundle contains neither the dev proof-state name nor proof-hook markers.

## Browser beat proof

Both proof scripts start from the same `act2_kadek_sourdough_ready` gameplay-built state at Day 24, 20:15, then use authored clock control to reach the next Saturday Kitchen session. Browser console and page-error listeners reported no errors.

Shared evidence:

1. [The warm rejected box puts Kadek's pastries and the false corporate supplier label in the player's hands](../tmp/beat-proof/act2-kadek-sourdough-protect/01-wrong-address-box-t+004.2s.png).
2. [The after-hours BAKED. scene presents Kadek's evidence and exactly PROTECT / EXPOSE](../tmp/beat-proof/act2-kadek-sourdough-protect/02-kadek-evidence-choice-t+013.0s.png).

PROTECT run:

1. [Kadek accepts one night to end it himself and plants the own-name promise](../tmp/beat-proof/act2-kadek-sourdough-protect/03-protect-result-t+013.5s.png).
2. [The next Kitchen session closes the moonlighting once with the private branch line](../tmp/beat-proof/act2-kadek-sourdough-protect/04-protect-next-session-t+023.2s.png).

EXPOSE run:

1. [The circle responds without shaming Kadek, including Ibu's debts-and-secrets line](../tmp/beat-proof/act2-kadek-sourdough-expose/03-expose-result-t+013.9s.png).
2. [The next Kitchen session closes the moonlighting once with the communal Season 2 plant](../tmp/beat-proof/act2-kadek-sourdough-expose/04-expose-next-session-t+023.2s.png).

The reusable scripts live in `scripts/proofs/act2-kadek-sourdough-protect.json` and `scripts/proofs/act2-kadek-sourdough-expose.json`.

## Boundary audit

- No third option, brother NPC, corporate café venue, debt system, random misdelivery mechanic, new delivery mode, or new scheduler.
- No mechanical punishment: both paths complete the delivery and preserve Kadek affinity, cash terms, crew membership, and access.
- No Act 0/1 story or map change; the special row cannot appear before Act 2 and the exact relationship/crew gate.
- No new reputation metric or rebalancing; branch residue writes the existing Community Trust axis only.
- No schema migration; state remains within established v11 save patterns.
