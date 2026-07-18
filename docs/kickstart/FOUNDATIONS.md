# FOUNDATIONS — portable builds and concepts from Bali Life RPG

Everything here is graded by how it actually performed over ~30 shipped
packets, a narrative pivot, and 405 green tests. Source paths refer to
`JohnSwatica/bali-life-rpg@main`.

---

## 1. Architecture patterns (engine-agnostic — reuse in any game)

### 1.1 Data / systems split — the single most load-bearing decision
All content is typed data modules (`src/data/*`: venues, NPCs, activities,
opportunities, events, groups/crews, relationship arcs, deliveries,
interiors, street templates). All logic is pure-ish system modules
(`src/systems/*`) that take state in and return state/effects out, with **no
renderer imports**. The Phaser scene is a thin presenter.

Why it scaled: 405 tests run headlessly in seconds; AI agents could add a
whole story beat by writing data + one system + tests without touching the
scene; the v4 narrative pivot swapped display surfaces while internal IDs and
economy math stayed put.

Lift: the *convention*, plus `src/types.ts` as an example of a single
canonical state shape (`WorldState`).

### 1.2 Versioned save schema with forward-only migration
`src/systems/Persistence.ts`: one `CURRENT_SCHEMA_VERSION`, one save key
forever, migrations that spread defaults over old saves and **never wipe**.
Two refinements that proved out:

- **Infer progress for old saves** — when adding a tutorial after the fact,
  saves showing later-stage evidence are marked tutorial-complete rather than
  re-gated.
- **The no-bump rule** — new features must first try to live inside existing
  extensible containers (`questFlags` map, `joinedClubIds`, an
  `activeActivity.source` string) before adding schema fields. Schema stayed
  at v11 across ~30 packets *including two entire act builds*. This is the
  reason old saves never broke.

Lift: the whole file pattern + `src/__tests__/persistence.test.ts`.

### 1.3 Intent dispatch
`src/systems/intents/IntentDispatcher.ts` — UI dispatches typed intents
(`AdjustReputationAxis`, `VisitVenue`, …); systems own mutation. Introduced
gradually (new systems only) which was the right cost/benefit: don't retrofit,
just require it for new surfaces.

### 1.4 Read models: derive, don't store
Every guidance/UI surface that worked was a *derivation over canonical state*,
never new save data: the one-line field objective
(`src/systems/guidance/FieldObjective.ts`), field indicators, the Discovery
Ledger (`src/systems/discovery/DiscoveryLedger.ts`), Act-readiness surfaces
(`src/systems/life/Act3Readiness.ts`), and the late-game PDA reveal that
renders two long-hidden moral axes as a 0..100 projection without ever
writing reputation. Rule of thumb: **if a panel needs a new save field, the
panel is designed wrong.**

### 1.5 Deterministic opportunity engine
`src/systems/opportunities/OpportunityEngine.ts` + `src/data/opportunities.ts`:
a bounded live pool (2–4), timers, expiry, cooldowns, spawn weights, gating by
player state, reward chaining, and a no-dead-day fallback. Two additions worth
keeping forever:

- `declineReward` — letting an offer expire is a *real authored branch*, not
  a null path. This powered every moral choice in the game.
- Trust-gated spawn weight — social standing makes better offers *visible in
  the world*, which is how "relationships open doors" became mechanical.

Caveat from the postmortem: author ~6 protected, goal-wired templates, not 20
filler ones (the phone-diet packet had to cut 14).

### 1.6 Relationship memory → tiers → surfaces
NPC interactions append memories; memories derive affinity tiers (stranger →
trusted); tiers vary authored dialogue, unlock one-time relationship-choice
scenes, and gate structural perks (prices, access hours, priority work) —
`src/systems/relationships/*`, `src/systems/life/StationSocialBridge.ts`,
structural unlocks in Wave 2. The full ladder
*memory → tier → dialogue → choice scene → structural benefit* is a complete,
reusable social-RPG spine.

### 1.7 Two hidden moral axes + late reveal
Hidden `rootedAxis` / `relationalAxis` written as side effects of choices
(`axisImpact` on opportunities, choice scenes), never shown early, revealed
diegetically mid-game (the PDA "driver transparency" beat). Keep the audit
lesson: the axes must be **independent**, not inverses — "the app's score of
you" vs "the street's memory of you" being separately true is what made the
theme land.

### 1.8 Events first-class and host-agnostic; crews as a substrate
`src/data/events.ts` + `EventScheduler` + the Wave-2 crew core
(`RPG-20260715-01`): data-defined venue-anchored weekly session slots →
ordinary scheduler events → invitation / member / attendance / regular states
persisted in existing containers, attendance deduped per occurrence,
"regular" firing at exactly N attendances, benefit hooks separate from the
attendance mechanics. This is a general club/faction substrate for any life
sim.

### 1.9 Meters + activity engine + fail-forward minigames
Four meters (Energy/Wellbeing/Focus/Social) + money; venue activities advance
time and apply effects (`src/systems/life/ActivityEngine.ts`). Minigames
(ride checkpoints, steering, Warung Rush serve) always **fail forward**:
performance scales payout/rating through one seam
(`completeDelivery(..., performanceScore)`) but never blocks completion. Weak
rounds count. This kept every playtest path unblockable.

### 1.10 One authored street, not a generated map
The OSM→projection→de-overlap pipeline (`scripts/generateLayoutFromOSM.ts`,
~900 road paths) was largely sunk cost; the game got good the day it pivoted
to one authored 32px tile street (`src/data/streetTemplates.ts`,
`src/systems/map/StreetTemplate.ts`, `StreetRenderer.ts`,
`TileStreetScale.ts`) with real-world venue *ordering* as reference data only.
Companion patterns worth lifting: playable bounds derived from authored
content (`src/data/playableBounds.ts`) and **layout invariant tests**
(`src/__tests__/layoutInvariants.test.ts`) that assert reachability and
render-sanity so map regressions fail CI instead of playtests.

### 1.11 Interiors as an offscreen band in the same scene
`src/data/interiors.ts` + `src/systems/interiors/*`: rooms live in a reserved
offscreen region of the same scene (no scene switch), with saved exterior
return points, exit mats, and a small-room interaction **priority model**
(delivery pickup 0 → exit 1 → station 2 → NPC 3, with radius rules enforced
by data tests). Cheapest possible door primitive that still feels like a door.

### 1.12 Presentation cheapness that read as quality
- Camera-zoom-safe UI: one shared helper that anchors DOM/Phaser UI layers to
  the camera view and inverse-scales them (the source of a whole class of
  early bugs, solved once).
- Cheap animation policy (`src/systems/animation/CharacterAnimations.ts`):
  1-frame idles, 4-frame procedural walks, 2-frame reactions — enforced by
  tests (`animationPolicy.test.ts`).
- Procedural audio beds, procedural placeholder portraits/textures in
  `BootScene` — zero asset pipeline until the game deserved one.
- Contextual-chip HUD after the "meter diet": status chip, one objective
  line, warnings only when relevant. Build this version *first* next time.
- The sensation layer (`RPG-20260713-03`): one canonical
  clear/rain/storm state owning both visuals and physics, day-phase ambient
  beds, authored beat clock. Small system, outsized feel.

---

## 2. The verification stack (the #1 thing to copy)

This is what let AI agents ship ~30 packets in two weeks without a QA team:

1. **Headless unit suite** (Vitest) over the pure systems — grew 53 → 405
   tests; every packet added tests as part of its Definition of Done.
2. **Debug snapshot**: the scene exposes `__BALI_LIFE_DEBUG__` (objective
   targets, interior exit coords, board availability…) so a harness can *see*
   game state without OCR (`src/scenes/GameScene.ts`).
3. **Composable dev boot states** (`RPG-20260714-04`): named starting points
   (`act0_complete`, `act1_steady_runner`, `act2_pda_reveal_ready`, …) built
   **only by composing the same public mutations gameplay uses** — never by
   poking raw state. This one rule keeps proof states honest forever.
4. **Scripted browser proofs**: `scripts/beatProof.mjs` (boot state + JSON
   steps through real handlers), `npm run smoke` (full Act 0 browser gate),
   `npm run capture:launch` (marketing stills/clips) — all puppeteer over the
   real build, screenshots to `tmp/`, zero-console-error assertions.
5. **Proof docs**: every packet ends with `docs/<PACKET>_PROOF.md` recording
   test counts, build status, and screenshot evidence. "Done" always meant
   *demonstrated*, and (post-7/8 lesson) *pushed to origin* — local-only work
   is not landed.

Lift all of it. This stack is genre-independent.

---

## 3. Design concepts that survived the playtest (portable to any game)

- **The act spine**: hustle → people → build → community. Scarcity first,
  belonging as the payoff, ownership as the endgame. It's a life-sim-shaped
  dramatic arc and it's reusable as-is.
- **One antagonist, one storyline** (v4 lesson): a platform/algorithm as
  antagonist, a human rival (Leo) as its face, a hidden metric as the
  mystery. Three interleaved threads died; one thread with residue lived.
- **Residue over mechanics**: story choices write cheap flags that later
  scenes *read back* (branch-aware lines at the beach fire, a Rp 2 menu-price
  echo two days later, ending-readable flags). Enormous felt-consequence per
  line of code.
- **ESC-default = the humane choice**: every choice scene's skip path
  resolves to the kind/community option. Players who don't engage still get a
  coherent moral read, and no one is punished for closing a dialog.
- **The phone as diegetic UI** — but *dieted*: Feed/Map/Goals/Profile only.
- **One-time authored beats over repeatable content**: the breakdown
  reversal, the luxury-tip dilemma, the sourdough choice — single, heavily
  proven scenes carried the game; generic repeatables never did.
- **Soft failure everywhere**: rent pressure without eviction, rating locks
  instead of game-overs, cargo ruined but delivery still counts. Matches the
  cozy-stakes register and keeps testing simple.

---

## 4. Future-facing seams that cost nothing to keep (from VISION.md)

- `PlayerProfile.lifestyleTags` as a cross-app identity bridge;
  `remoteAccountId: null` until a real account system exists.
- `src/systems/NetworkAdapter.ts` stub — world state shaped so multiplayer is
  an adapter swap, never built early.
- Events/groups host-agnostic (`hostId` can be venue/NPC/group/future player).
- Honest placeholder commerce fields on venues — no fake integrations.

These four seams were carried for the whole project at ~zero cost. Keep the
habit: name the seam, stub it typed, refuse to build behind it.
