# Codex Packets — Index and Sequencing

Packets follow the cross-project format in `~/.claude/CLAUDE.md` (BEGIN/END
markers, `RPG-YYYYMMDD-NN` IDs, PR tags, and — since 2026-07-08 — a
`REASONING:` level per the global Codex routing rule). Each file is copy-paste
ready: one fenced block, hand the whole thing to Codex.

**Status 2026-07-08:** all nine RPG-20260706 packets are DONE (landed on
`feat/rpg-20260706-09-rio-race`, 218 tests green). The Phase 3 gate was
CEO-overridden to GATE v2 — see `docs/PHASE3_REEVALUATION_GATE.md` — and the
active queue is now the RPG-20260708 batch below. After 08-03 lands, only
polish/tuning/integration/bug-fix packets are authorized until written feedback
from 3+ real humans exists.

## Active queue — RPG-20260708 (stranger-readiness, run in order)

| ID | Title | Reasoning | Depends on |
|----|-------|-----------|------------|
| [RPG-20260708-01](RPG-20260708-01-stranger-ready-build.md) | Title screen, safe reset, feedback mailto, version stamp | medium | — |
| [RPG-20260708-02](RPG-20260708-02-mobile-playability.md) | Mobile/touch playability pass + link-preview polish | high | 01 soft |
| [RPG-20260708-03](RPG-20260708-03-coherence-sweep.md) | Seam audit of packets 01-09 + tuning consolidation | high | 01, 02 |

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
