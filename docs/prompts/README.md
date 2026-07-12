# Codex Packets — Index and Sequencing

Packets follow the cross-project format in `~/.claude/CLAUDE.md`: BEGIN/END
markers, `RPG-YYYYMMDD-NN` IDs, PR tags, a `CODEX:` model·effort routing line
(Luna/Terra/Sol · Default/Medium/High — current standard; older packets carry
the deprecated `REASONING:` form), and a `MAP DELTA:` line per the Map Growth
Rule in `AGENTS.md`. Each file is copy-paste ready: one fenced block, hand
the whole thing to Codex.

**Status 2026-07-12:** ALL sixteen prior packets are DONE (247 tests green).
The first founder playtest happened (`PLAYTEST_01.md`): bored at minute 5,
four named problems, and a CEO narrative pivot to `STORY_BIBLE.md` v4 (the
NusaDrop storyline). GATE v3 (`docs/PHASE3_REEVALUATION_GATE.md`) authorizes
feature work targeted at those findings — the RPG-20260712 queue below.

## Active queue — RPG-20260712 (playtest response, run in order)

| ID | Title | Codex routing | Depends on |
|----|-------|---------------|------------|
| [RPG-20260712-01](RPG-20260712-01-nusadrop-canon-swap.md) | v4 canon swap: NusaDrop, Leo, Vance; retire Elena thread | Terra · Medium | — |
| [RPG-20260712-02](RPG-20260712-02-cinematic-cold-open.md) | Cinematic cold-open + 3-minute hook + first choice | Sol · High | 01 |
| [RPG-20260712-03](RPG-20260712-03-steering-delivery-mode.md) | Steering delivery mode v1 (continuous obstacle-avoidance) | Sol · High | 01; ideally after 02 |
| [RPG-20260712-04](RPG-20260712-04-warung-rush.md) | Warung Rush v1 (Diner-Dash-style service) | Terra · Medium | 01 (independent of 02/03) |

## Done — RPG-20260708-04..07 (playthrough bug-fixes)

| ID | Title | Reasoning | 
|----|-------|-----------|
| [RPG-20260708-04](RPG-20260708-04-onboarding-blocker.md) | Fix broken first objective (Ibu marker + interior exit cue) | high |
| [RPG-20260708-05](RPG-20260708-05-scooter-and-interior-mechanics.md) | Foot-only interiors, staged mount/dismount, pickup seam | high |
| [RPG-20260708-06](RPG-20260708-06-street-legibility-and-layout.md) | Street legibility & layout + first map increment (paddy path) | high |
| [RPG-20260708-07](RPG-20260708-07-ride-observability-and-smoke-harness.md) | In-repo smoke-playthrough + ride telemetry | high |

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
- **`MAP DELTA:` header line is mandatory (CEO directive 2026-07-11)** — one
  sentence naming the small, contiguous map increment this packet adds, or
  `none — <reason>`. Increments follow the Map Growth Rule in `AGENTS.md`
  (≤ one small parcel, wired into bounds/collision/minimap/tests, before/after
  screenshots, one line appended to `docs/MAP_CHANGELOG.md`). Big one-off map
  dumps are banned; the world grows by drip so John can track and critique it.
- STATE.md bullet always; DECISIONS.md entry when a product/architecture call
  was made. AGENTS.md hard boundaries apply unchanged (no backend, no AI calls,
  no real commerce, no Act 3 sim, no copied assets).
- John remains sole merge authority.
