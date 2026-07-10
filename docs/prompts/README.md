# Codex Packets — Index and Sequencing

Packets follow the cross-project format in `~/.claude/CLAUDE.md` (BEGIN/END
markers, `RPG-YYYYMMDD-NN` IDs, PR tags, and — since 2026-07-08 — a
`REASONING:` level per the global Codex routing rule). Each file is copy-paste
ready: one fenced block, hand the whole thing to Codex.

**Status 2026-07-08:** all nine RPG-20260706 packets AND the RPG-20260708-01..03
stranger-readiness batch are DONE (landed on `feat/rpg-20260706-09-rio-race`,
234 tests green). An automated headless playthrough was then run
(`docs/AI_PLAYTHROUGH_2026-07-08.md`) — it found the game does not crash (0
console errors) but the Act 0 onboarding is broken enough to block a new
player in the first 90 seconds. That produced the RPG-20260708-04..07 bug-fix
batch below. GATE v2 (`docs/PHASE3_REEVALUATION_GATE.md`) still holds: this is
all bug-fix/polish/layout/test-infra on existing systems (allowed); no new
systems/acts/content until written feedback from 3+ real humans exists.

## Active queue — RPG-20260708-04..07 (playthrough bug-fixes, run in order)

Derived from real defects in `docs/AI_PLAYTHROUGH_2026-07-08.md`. Ordered so
the on-ramp is unblocked before anything downstream.

| ID | Title | Reasoning | Depends on |
|----|-------|-----------|------------|
| [RPG-20260708-04](RPG-20260708-04-onboarding-blocker.md) | Fix broken first objective (Ibu marker + interior exit cue) | high | — |
| [RPG-20260708-05](RPG-20260708-05-scooter-and-interior-mechanics.md) | Foot-only interiors, staged mount/dismount, pickup seam | high | 04 soft |
| [RPG-20260708-06](RPG-20260708-06-street-legibility-and-layout.md) | Declutter labels, kill orphan markers, walkable/building legibility, paddies, camera, landmark | high | — |
| [RPG-20260708-07](RPG-20260708-07-ride-observability-and-smoke-harness.md) | In-repo smoke-playthrough + ride telemetry (no retuning) | high | 04, 05 |

## Done — RPG-20260708-01..03 (stranger-readiness)

| ID | Title | Reasoning |
|----|-------|-----------|
| [RPG-20260708-01](RPG-20260708-01-stranger-ready-build.md) | Title screen, safe reset, feedback mailto, version stamp | medium |
| [RPG-20260708-02](RPG-20260708-02-mobile-playability.md) | Mobile/touch playability pass + link-preview polish | high |
| [RPG-20260708-03](RPG-20260708-03-coherence-sweep.md) | Seam audit of packets 01-09 + tuning consolidation | high |

## Done — RPG-20260706 (Phases 1–2 of the project review)

## Phase 1 — Juice sprint (feel, not features)

| ID | Title | Depends on |
|----|-------|------------|
| [RPG-20260706-01](RPG-20260706-01-audio-foundation.md) | Procedural audio foundation | — |
| [RPG-20260706-02](RPG-20260706-02-payout-juice.md) | Payout celebration (count-up, star punch) | 01 soft |
| [RPG-20260706-03](RPG-20260706-03-riding-feel.md) | Riding feel v1 (accel/lean/drift/near-miss) | — |
| [RPG-20260706-04](RPG-20260706-04-soft-failure.md) | Cargo-care soft-failure channel | 03 soft |
| [RPG-20260706-05](RPG-20260706-05-paddies-and-villas.md) | Rice paddies, villa gates, street texture | — |
| [RPG-20260706-06](RPG-20260706-06-portraits.md) | Portraits: Ibu Sari, Kadek, Rio | — |

"Soft" dependency = packet includes a fallback if the dependency hasn't landed;
prefer running them in order anyway. 01, 03, 05, 06 can run in parallel tabs if
desired (disjoint files, separate branches).

## Phase 2 — First hour to Story-Bible tone

| ID | Title | Depends on |
|----|-------|------------|
| [RPG-20260706-07](RPG-20260706-07-presentation-kit.md) | L2 presentation kit (letterbox, act cards, scripted walk) | 01, 02 |
| [RPG-20260706-08](RPG-20260706-08-meter-diet.md) | Early-game meter diet (Energy+Money until Act 2) | 07 soft |
| [RPG-20260706-09](RPG-20260706-09-rio-race.md) | Rio's street race — Act 1 setpiece | **03 + 07 hard** |

## Standing rules for every packet

- One branch + one PR per packet, PR tagged `[<PACKET ID>]`.
- `npm test -- --run` and `npm run build` green before the PR.
- STATE.md bullet always; DECISIONS.md entry when a product/architecture call
  was made. AGENTS.md hard boundaries apply unchanged (no backend, no AI calls,
  no real commerce, no Act 3 sim, no copied assets).
- John remains sole merge authority.
