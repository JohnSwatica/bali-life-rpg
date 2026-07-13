# Codex Packets — Index and Sequencing

Packets follow the cross-project format in `~/.claude/CLAUDE.md`: BEGIN/END
markers, `RPG-YYYYMMDD-NN` IDs, PR tags, a `CODEX:` model·effort routing line
(Luna/Terra/Sol · Default/Medium/High — current standard; older packets carry
the deprecated `REASONING:` form), and a `MAP DELTA:` line per the Map Growth
Rule in `AGENTS.md`. Each file is copy-paste ready: one fenced block, hand
the whole thing to Codex.

**Status 2026-07-13 (updated):** RPG-20260712-01..04 all DONE (258 tests
green, on `feat/rpg-20260706-09-rio-race`). John then live-tested the merged
build and hit a hard blocker: Act 0's final step ("Get onto NusaDrop") is
soft-locked for every new player by a venue-position collision (Milk & Madu
vs. a distinct curated venue "Milu by Nook" occupying the same interaction
spot — full repro in RPG-20260713-01). John also correctly called out that
RPG-20260712-01 only reskinned NAMES from STORY_BIBLE v4 — it never
implemented v4's actual STORY BEATS, which is why post-intro Act 1 still
feels like generic walk/press-E. **Active queue below fixes the blocker
first, then ships the first real story content.**

## Active queue — RPG-20260713 (blocker fix + first real story content)

| ID | Title | Codex routing | Depends on |
|----|-------|---------------|------------|
| [RPG-20260713-01](RPG-20260713-01-milk-madu-venue-collision.md) | Fix Milk & Madu / Milu by Nook collision — Act 0 fully blocked otherwise | Sol · High | — (run first, blocks everything) |
| [RPG-20260713-02](RPG-20260713-02-act1-inciting-hook.md) | Act 1 inciting hook: NusaDrop rate cut + Leo's first real encounter | Sol · High | 01 (Act 0 must be completable to reach Act 1) |

RPG-20260713-02 is scoped to ONE felt beat (v4's exact Act 1 inciting hook),
not the whole Act 1 backbone — Made's room offer, Kadek's priority-driver
moment, the midpoint scooter breakdown, and the closing milestone are
explicit follow-ups, listed in that packet's own DoD. This is deliberate:
one verified story beat beats five half-built ones.

## Active queue — RPG-20260712 (playtest response)

| ID | Title | Codex routing | Status |
|----|-------|---------------|--------|
| [RPG-20260712-01](RPG-20260712-01-nusadrop-canon-swap.md) | v4 canon swap: NusaDrop, Leo, Vance; retire Elena thread | Terra · Medium | DONE |
| [RPG-20260712-02](RPG-20260712-02-cinematic-cold-open.md) | Cinematic cold-open + 3-minute hook + first choice | Sol · High | DONE (50.97s, see proof doc) |
| [RPG-20260712-03](RPG-20260712-03-steering-delivery-mode.md) | Steering delivery mode v1 (continuous obstacle-avoidance) | Sol · High | DONE (see steering proof doc) |
| [RPG-20260712-04](RPG-20260712-04-warung-rush.md) | Warung Rush v1 (Diner-Dash-style service) | Terra · Medium | DONE (logic proven; scene-feel proof still owed) |

**On 02→03 sequencing (corrected 2026-07-12):** the original note here said
"branch 03 from `main` only after 02 is merged" — that instruction was wrong
and caused Codex to block waiting for a `main` merge that was never coming
(this project has never merged individual packets to `main` mid-stream; see
the standing rule above). The actual requirement was narrower: 03 must not
branch until 02's changes are COMMITTED on the shared branch, so its
checkpoint-tap-beat sweep can see the new hook-mission delivery. That
condition is now satisfied — 02 (and 04) are committed at `f84bfda` on
`feat/rpg-20260706-09-rio-race`. Proceed with 03 from there.

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

- **Actual practice (corrected 2026-07-12 — read this before assuming "one PR
  per packet"):** every packet since RPG-20260706-01 has landed as ONE COMMIT
  on the shared branch `feat/rpg-20260706-09-rio-race`, tagged `[<PACKET ID>]`
  in the commit message. There is ONE open PR (#1) for the whole stack; John
  merges it as a unit. **Do not wait for a packet's own PR/merge before
  starting the next one** — continue from this branch's current HEAD.
  `PR TAG:` in each packet file still matters (grep-ability, changelog), it
  just resolves to a commit message tag in practice, not a real separate PR.
- **COMMIT BEFORE STARTING THE NEXT PACKET — do not let uncommitted work from
  one packet sit while starting another**, even a packet marked "safe to run
  in parallel." (2026-07-12 incident: RPG-20260712-02 and -04 were both
  authorized to run concurrently, both finished, but neither was committed
  before the other started — they piled up as one mixed uncommitted diff
  across 30 files, including files both packets touched. It worked out this
  time because nothing conflicted, but a hard dependency check
  (RPG-20260712-03's prereq) correctly refused to proceed against that dirty
  state. "Parallel-safe" describes two packets' LOGIC not colliding — it does
  not mean skip committing. If two packets are run back-to-back, commit the
  first one's result before starting the second.)
- `npm test -- --run` and `npm run build` green before every commit.
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
