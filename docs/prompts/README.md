# Codex Packets — Index and Sequencing

Packets follow the cross-project format in `~/.claude/CLAUDE.md` (BEGIN/END
markers, `RPG-YYYYMMDD-NN` IDs, PR tags). Each file is copy-paste ready: one
fenced block, hand the whole thing to Codex.

These nine packets execute Phases 1–2 of `CLAUDE_PROJECT_REVIEW_2026-07-06.md`.
After 09 lands, **stop**: `docs/PHASE3_REEVALUATION_GATE.md` governs what happens
next, and it requires John, not another packet.

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
