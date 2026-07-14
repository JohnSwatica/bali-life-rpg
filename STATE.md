# AI Handoff / Project State

Last updated: 2026-07-13 (RPG-20260713-04 Act 0 back-half rebuild complete locally)

Copy/paste this into a new AI session to bring it up to speed.

## Start Here For New Tabs

If a new AI tab gets only "keep working", it must first read `AGENTS.md`, this file, `DECISIONS.md`, `STORY_ARC.md`, `STORY_BIBLE.md`, `ACT3_BUSINESS_DESIGN.md`, and `docs/ROADMAP.md`, then inspect `git status --short --branch` and recent commits.

`CLAUDE_PROJECT_REVIEW_2026-07-06.md` is Claude's full project review (bottlenecks, gap analysis, sequencing recommendation). It is a supervisory assessment, not a canonical design source — `GAME_DESIGN.md`/`STORY_BIBLE.md` still win on narrative/systems conflicts — but its top recommendation (no recorded human playtest yet; a `PLAYTEST_01.md` should exist before more systems work) should be treated as live until the user says otherwise.

Current durable truth:

- **RPG-20260713-04 complete locally on `feat/rpg-20260713-04-first-ten-minutes`:** Act 0 after the catering handoff is now scene/phone/ride only: Milk & Madu with Julian Vance, NusaDrop signup with `#1 LEO`, one-shot mid-ride storm, visible Rp 560 midnight deposit, Rp 286-clean fragile villa surge, amplified 5★ payout, Ibu-guaranteed deposit resolution, and bleak-kos collapse into the untouched Act 1 rate-cut/morning seam. Story runs do not disturb Act 1's five-run/Rp 600 math; schema stays v11; menu-rule debug count is zero. Verification: 43 files / 276 tests, production build, full browser smoke, eight requested beat captures, and 390×844 bounds pass. Proof: `docs/RPG-20260713-04_FIRST_TEN_MINUTES_PROOF.md`. Fast-path automation reaches the seam in 3:32; a human first-read timing pass is still needed before claiming the 9–11 target.

- **RPG-20260713-03 complete on `feat/rpg-20260713-03-sensation-layer`:** Day 1 now has a transient authored beat clock over the existing clock/lighting path, one canonical clear/rain/storm state that owns both visible weather and slick ride physics, capped batched rain at desktop/mobile widths, wet-street tint, storm flash/thunder, phase/weather/interior-selected procedural ambient beds, stronger dusk/night lantern treatment, and a genuinely bleak one-bulb kos. No story/Act 0 step logic, map geometry, save schema, audio assets, delivery math, rate cut, or race logic changed. Proof: `docs/RPG-20260713-03_SENSATION_LAYER_PROOF.md`. Verification: 42 files / 270 tests, production build, full Act 0→Act 1 browser smoke, six sensory screenshots, zero browser errors, and <1% comparative rain-frame delta in the throttled headless harness.

- **RPG-20260713-01/02 complete and merged:** authored venue interaction footprints are collision-safe, so Act 0's Milk & Madu objective can no longer resolve to adjacent Milu by Nook. Fresh Act 1 entry now visibly and persistently cuts NusaDrop board base pay 15%, then stages Leo's one-time pickup-rail encounter before his existing race. Fresh smoke proof covers the correct Milk & Madu panel, Act 0 completion, the rate-cut card, Leo's dialogue, and a lower first Act 1 payout. Proof: `docs/RPG-20260713-01_VENUE_COLLISION_PROOF.md` and `docs/RPG-20260713-02_ACT1_INCITING_HOOK_PROOF.md`. PR #1 (Phases 1-2 + all RPG-20260708/712/713 work) merged to `main` 2026-07-13 (`c20c527`); GitHub Pages deploy triggered automatically.

- Branch: `feat/rpg-20260713-04-first-ten-minutes`, branched cleanly from freshly pulled `main` at `80a875c` for packet -04.
- Remote: `https://github.com/JohnSwatica/bali-life-rpg` (created 2026-07-06). All branches pushed. New work should branch from `main` and open PRs. Merge authority: Claude has standing merge authority for this repo specifically (set 2026-07-13, see global CLAUDE.md Standing Rule 8) after actually reviewing a PR (diffs, tests, build, proof) — not a rubber stamp. match.co/NomadNest are unaffected; John still merges those himself.
- Public playable build: `https://johnswatica.github.io/bali-life-rpg/` — auto-deploys from `main` via `.github/workflows/deploy-pages.yml` (CI runs tests, then builds with `--base=/bali-life-rpg/`; local dev/build unchanged). Verified live 2026-07-06 with assets resolving.
- Save schema: `CURRENT_SCHEMA_VERSION = 11`; save key remains `bali-life-rpg.berawa-finns.save.v1`.
- Active map: authored `32px` tile street for `Jl. Pantai Berawa` via `src/data/authoredStreetLayout.ts`.
- OSM/generated data is sequencing/reference data only; no runtime map network calls.
- Current verification: `npm test -- --run` = 43 files / 276 passing, 0 skipped; `npm run build` and the rebuilt full-path `npm run smoke` pass. The smoke asserts one storm trigger, zero critical-path activity menus, the Act 1 rate-cut/morning seam, and the touch joystick/control surface at `390x844`. Physical iOS/Android and first-read human timing verification remain pending.
- No scheduled automation should exist from the prior failed resume attempt. Do not create reminders/automations unless the user asks again.

Packet execution status (updated 2026-07-12):

- **FIRST FOUNDER PLAYTEST HAPPENED (2026-07-12)** — John played ~5 minutes and was bored by minute 5. Verbatim feedback + four named problems in `PLAYTEST_01.md`. This is human feedback #1 and it redirected the roadmap.
- **NARRATIVE PIVOT (CEO):** `STORY_BIBLE.md` is now **v4 — "The Algorithm vs. The Street"** (single NusaDrop storyline: Leo the rival, Julian Vance/Enclave Berawa the antagonist, the hidden Trust-vs-Efficiency metric). The v3 Elena/Rumah/Pak Bagus/subak bible is retired (git history). Read v4's **code reconciliation map** before touching narrative content — internal ids stay, display surfaces change, economy numbers do NOT rescale. Supersession banners added to GAME_DESIGN.md, STORY_ARC.md, ACT3_BUSINESS_DESIGN.md.
- **GATE v3:** founder feedback authorizes feature work targeted at the four playtest findings. Queue `docs/prompts/RPG-20260712-01..04`: **01, 02, 03, 04 are DONE**. Packet 03 lives on `feat/rpg-20260712-03-steering-delivery`, branched from `1bc9a8d` as explicitly directed; proof is in `docs/STEERING_DELIVERY_MODE_PROOF_2026-07-12.md`.
- Outside players still wanted (3-5 strangers once 03 lands and PR #1 merges); three CEO decisions still open in `TODO_LIST.md`.

Prior status (2026-07-08):

- **All nine RPG-20260706 packets are DONE** — landed as sequential commits on `feat/rpg-20260706-09-rio-race` (218 tests green, build green, verified by Claude). The branch is pushed to origin with a PR open; **`main` and therefore the public URL are 9 packets behind until John merges** — merging publishes the juiced build.
- **GATE v2 (CEO override, 2026-07-08):** John has no time for the 60-min personal playtest; it and the three review decisions are parked in `TODO_LIST.md`. Outside players become the active feedback path. Until written feedback from 3+ real humans exists, Codex work is limited to polish/tuning/integration/stranger-readiness/bug fixes — NEW systems/acts/districts/minigames/content stay blocked. Full terms in `docs/PHASE3_REEVALUATION_GATE.md`.
- RPG-20260708-01/02/03 are complete (stranger readiness, mobile touch playability, cross-packet coherence/tuning consolidation). Test suite now 234 green.
- **Automated playthrough done (2026-07-08, 2nd session):** Claude drove the build headlessly (real WASD/E keypresses via puppeteer-core + system Chrome, reading the debug snapshot; screenshots in `tmp/playtest-2026-07-08/`). Write-up: `docs/AI_PLAYTHROUGH_2026-07-08.md`. Verdict — **0 console errors (nothing crashes), but Act 0 onboarding blocks a new player in the first 90 seconds:** the first objective marker points at the empty Warung counter instead of Ibu Sari (BUG-1), and after the scooter grant you're stranded inside with no exit cue (BUG-2). Ride model / payout juice / meter-diet are present and working. This is NOT a human playtest and does NOT satisfy GATE v2.
- **Test infra added:** the `__BALI_LIFE_DEBUG__` snapshot in `GameScene.ts` now exposes `objectiveTargets` and `interiorExit` (world coords) so a harness can navigate. Keep these; RPG-20260708-07 promotes the harness into `scripts/`.
- **Playthrough bug-fix queue complete:** RPG-20260708-04/05/06/07 are complete. `npm run smoke` is now the standing opt-in Act 0 browser gate and its first use caught/fixed a payout-dismissal runtime freeze. Index + dependencies remain in `docs/prompts/README.md`.
- `docs/AI_WALKTHROUGH_NOTES_2026-07-06.md` — Claude's earlier STATIC pass; superseded as a playthrough by the 2026-07-08 driven run.

Canonical act order, set in stone for near-term work:

1. Act 0 - Arrival / 新手村: Ibu Sari, cheap kos, borrowed scooter, first BAKED delivery, meal/coffee, sleep.
2. Act 1 - The Hustle: delivery board, rating, rent pressure, scooter upkeep/upgrades, move-out readiness.
3. Act 2 - Finding Your People: events, clubs, relationship arcs, social standing, club-gated opportunities.
4. Act 3 - Building Something: future warung/cafe + villa + real bike ambition layer, hooks only for now.
5. Act 4 - The Good Life: solo win state.
6. Act 5 - The Open World: multiplayer/Nomad Nest, future only.

Immediate next move (CEO directive 2026-07-13): RPG-20260713-04 is implemented locally and the previously held 3–5 outsider first-impression share is unblocked once this branch is reviewed/merged. Ask those players specifically about beat clarity and felt pacing; the deterministic fast path is 3:32, so only a first-read human run can validate the 9–11 minute target. Act 1 follow-ups (Made's room offer, Kadek's priority-driver moment, midpoint breakdown, closing milestone) remain queued behind this. Hard boundaries unchanged: no multiplayer, backend, AI calls, real commerce, Google data, or the Act 3 management sim.

## Project

- Path: `/Users/z/包包/bali-life-rpg`
- Stack: Phaser 3, TypeScript, Vite.
- Dev URL: `http://127.0.0.1:5173/`
- Current product direction: `Bali Life RPG` is a location-based life sim/social RPG, not a combat RPG.
- Setting: compressed Berawa, Canggu neighborhood around the FINNS/Jl. Pantai Berawa area.
- Current playable mode: local single-player vertical slice.
- Multiplayer: visible in UI as a locked portal only; no real networking/server/backend.
- Current branch: `main` (post 2026-07-06 merge; historical feature branches remain pushed to origin for reference).
- Public URL: `https://johnswatica.github.io/bali-life-rpg/` (GitHub Pages, deploys on push to `main`).

## What Was Added Recently

- RPG-20260712-01 is complete on `feat/rpg-20260706-09-rio-race`: STORY_BIBLE v4 is now the live presentation canon. The delivery board, Phone, guidance, HUD copy, and Act 1 summary call the gig app **NusaDrop**. Stable internal IDs remain `rio` and `pak_bagus`, while every player-facing surface presents **Leo** (the hyper-competitive NusaDrop rival) and **Julian Vance** (Vanguard Co-Living / Enclave Berawa). Leo's portrait alt text, routine copy, No-Questions scene, race prompts/outcomes, delivery guard, and ambient follow-up all use the new identity.

- [RPG-20260712-02] Fresh New Game now opens on a 48.2-second, fully skippable bus-arrival cutscene at the new Canggu Station drop-off bay: the kos scam, Ibu Sari's approach, and her late husband's scooter-for-a-15-minute-catering-run offer. The required two-way RelationshipChoiceScene writes Ibu affinity, memory, and Relational axis state; negotiating adds a completion fee with a small trust cost. The loaded Milk & Madu delivery becomes live immediately with a visible countdown, `Rp 40` on-time bonus, late fail-forward, payout celebration, and later Ibu acknowledgement. Existing mid-Act-0 saves bypass the fresh-only opening unchanged; save schema stays v11. Timed/browser/map proof: `docs/ACT0_V4_OPENING_PROOF_2026-07-12.md`.

- [RPG-20260712-04] Warung Rush is a repeatable, post-Act-0 lunch opportunity inside the existing Warung Sari interior. It reuses committed activity persistence and activity rewards, but runs in a movement-enabled service mode: pick up a pictured dish at Ibu's counter, walk it to the matching customer, and juggle patience rings across 2→4 concurrent orders. Expired customers leave without failing the round; served count and remaining patience scale tips, Ibu affinity, and Social through the normal activity path. `WARUNG_RUSH_FEEL_TUNING` owns the 75s duration, patience, spawn cadence, and repeat-play ramp; interruption restoration has no schema bump.
- The retired Elena/Rumah thread is gone from the live map and data: notebook/SIM seat pickups, their item definitions, Kadek's mystery lines, and all Elena Discovery Ledger entries were removed. Existing saves quietly drop only those two obsolete inventory IDs during normal hydration; no schema bump. The read-only Ledger now holds `NusaDrop Commission Squeeze` after three deliveries and `A Rating That Does More Than Rate` after at least one completed run with a 4.5+ visible driver rating. The latter is deliberately derived from existing aggregate rating because this save model does not retain individual delivery ratings.
- Verification: `npm test -- --run` passes 39 files / 247 tests; `npm run build` passes; and `npm run smoke` completed clean Act 0 through the Act 1 card with fresh screenshots in `tmp/smoke/`. The intentional reconciliation-map whitelist is internal IDs/keys (`rio`, `pak_bagus`, `RIO_RACE`, texture keys, relationship memory/save keys), the Indonesian ambient warning `Awas, jalan rusak`, and real `Jalan ...` street references in the authored map/venue data. No player-facing prior-canon name or Elena/Rumah collectible remains.

- RPG-20260708-07 is complete on `feat/rpg-20260706-09-rio-race`: `npm run smoke` starts an isolated Vite server, launches system Chrome, clears the save, clicks New Game, and drives the visible Act 0 target chain through Ibu, BAKED, villa payout, cafe choices, kos sleep, and the Act 1 card. It uses `objectiveTargets`, `interiorExit`, and `interiorTransitioning`, saves per-beat/failure screenshots under `tmp/smoke/`, and exits nonzero on the first progression or browser-runtime failure. The debug contract now adds mounted-only ride speed/ratio/lean/drift telemetry; the final clean ride measured 212.28/240.88/260.86 min/avg/max speed over 10.37 seconds. The harness found and fixed a real payout-dismissal crash caused by an orphaned count-up tween writing to destroyed text. Proof: `docs/SMOKE_PLAYTHROUGH_2026-07-11.md`; suite increased from 245 to 247 tests.

- RPG-20260708-06 is complete on `feat/rpg-20260706-09-rio-race`: street labels now cull to the nearest three; field/world markers require a real authored venue slot and map node; building foundations read distinctly from walkable ground; street zoom tightened from desktop/mobile `1.60/1.28` to `1.76/1.38`; and one procedural FINNS tower supplies a tall landmark. The paddy audit corrected the earlier diagnosis: the fields already rendered, but the old harness never framed them. The first Map Growth Rule increment adds a tested 10x1-tile dirt path from the sidewalk to the yellowing Corner paddy, including minimap and playable-bounds wiring. Proof and assessment: `docs/STREET_LEGIBILITY_2026-07-11.md`; suite increased from 239 to 245 tests.

- RPG-20260708-05 is complete on `feat/rpg-20260706-09-rio-race`: `RideMode.ts` now separates scooter ownership from mount eligibility. Interiors force and render foot mode; scooter grants/rentals/upgrades no longer force mounting; world-mode BIKE remains the explicit remount action after leaving. The same guard protects movement speed, sprite visibility, race/group/dev force-mount paths, and the debug snapshot exposes `interiorTransitioning` for reliable fade-aware automation. The live Act 0 run covered Ibu grant → outdoor remount → BAKED auto-dismount and pickup → outdoor remount → villa completion. Proof is in `docs/RIDE_MODE_PROOF_2026-07-11.md`; the suite increased from 236 to 239 tests.

- RPG-20260708-04 is complete on `feat/rpg-20260706-09-rio-race`: active objectives now resolve through one interior-aware target pass before rendering or debug exposure. An NPC objective in the current room targets that NPC's occupied slot using the exact room talk radius; an objective with no target in the room targets the exit mat instead. The original Act 0 failure is fixed: the Warung marker reaches Ibu Sari, talking advances and grants the first delivery, then the marker moves to the exit and returns to exterior BAKED. Browser coordinates/screenshots and the marker-follow trace are in `docs/ONBOARDING_RETARGET_PROOF_2026-07-11.md`; the suite increased from 234 to 236 tests.

- RPG-20260708-03 is complete on `feat/rpg-20260706-09-rio-race`: the cross-packet seam audit found and fixed queued toast/audio feedback running under cutscenes, payout and Act 2 chapter-card competition, hidden-meter wording in the Act 1 morning hand, cargo chrome leaking into interiors, delivery acceptance during Rio's race, and persisted race/activity timers advancing behind the title screen. Saved activity restoration now waits for Continue, and F9 clears live runtime presentation state as well as the save.
- `src/tuning/FeelTuning.ts` is the single edit point for the unchanged audio gains, payout timings, ride curves/camera lead/near-miss limits, cargo damage thresholds, and Rio ghost pacing/rubber-band caps. The suite increased from 225 to 234 tests. Full seam verdicts and bundle evidence are in `docs/COHERENCE_SWEEP_2026-07-10.md`.

- RPG-20260708-02 is complete on `feat/rpg-20260706-09-rio-race`: touch controls now use the same inverse-camera-scale pattern as other zoom-safe UI, resync to the main camera, work in interiors as well as the street, and cancel cleanly across overlays, resize, and pointer game-out. Normal dialogue has a touch-only Continue button; committed-activity instructions point to on-screen controls; and the Rio race converts ACT to an accessible QUIT/concede action on touch while leaving desktop keyboard behavior unchanged.
- Mobile layout hardening adds dynamic viewport and safe-area handling, 44px touch targets, portrait-bounded dialogue/activity surfaces, and responsive toast wrapping. At `360x800`, all six touch buttons measured in bounds with 10px right/bottom clearance; the title card measured `[18,202.41,342,597.59]`. At `390x844`, the title remained `[18,234.55,372,609.44]` and all six controls were in bounds. Browser pointer testing covered the fresh title/cold open, exterior and interior movement, Ibu Sari dialogue, BAKED pickup, ride checkpoint, villa drop-off, payout, and the Milk & Madu activity flow. The long replay's emulated clock accelerated, so sleep/Act 1 transition remains composite-tested rather than claimed as physical-device proof. Full findings and evidence paths are in `docs/MOBILE_PASS_2026-07-08.md`; real-device iOS/Android verification is pending.
- WhatsApp/link-preview presentation now includes a proper title and description, theme color, static Open Graph metadata, an original procedural favicon, and a committed 1200x630 game-street screenshot. No PWA, service worker, telemetry, native wrapper, schema, or gameplay/economy change was added.

- RPG-20260708-01 is complete on `feat/rpg-20260706-09-rio-race`: every boot now opens a bounds-safe DOM title screen with the game name, an `EARLY TEST BUILD` label, a Vite-injected `short-hash · YYYY-MM-DD` build stamp, `Continue` only when a valid local save exists, `New Game`, and `Send feedback`. Continuing is one click; starting over from an existing save requires an explicit `Start fresh` confirmation, while an empty local slot starts immediately. `New Game` restarts the scene after clearing only the existing local save, so no previous NPC/runtime scene state survives into a fresh run; F9 remains the existing dev reset path.
- ESC in world/interior mode now opens a small pause surface with `Resume` and a deliberately secondary `Reset save`, which routes through the same local-save confirmation state as title-screen New Game. No save-schema or gameplay-loop data changed.
- `src/systems/feedback/SessionSummary.ts` creates a local, plain-text play summary (build, act, day, money, driver rating, completed deliveries, approximate current-session minutes, last objective, and three feedback prompts). Title and Phone > Profile both use the same encoded `mailto:smartjonnyz@gmail.com` link; it sends no telemetry or runtime network request. The public email should be swapped for an alias before merge if desired.
- Browser acceptance: the title card measured fully in-bounds at `1280x800` `[390, 212.6, 890, 587.4]`, `1440x900` `[470, 262.6, 970, 637.4]`, `1728x1117` `[614, 371.1, 1114, 745.9]`, `2560x1440` `[1030, 532.6, 1530, 907.4]`, `1024x768` `[262, 196.6, 762, 571.4]`, and `390x844` `[18, 234.6, 372, 609.4]` (`[left, top, right, bottom]`). A title proof screenshot is at `tmp/stranger-ready-title-2026-07-10.png`. Browser checks also confirmed Continue visibility on a saved local world, New Game and pause Reset save both stop at the same confirmation, and cancel preserves the save.

- RPG-20260706-09 is implemented on `feat/rpg-20260706-09-rio-race`: Rio now has the Act 1 street-race setpiece from the GDD/Story Bible. The one-time challenge gates on Act 1, at least 3 completed deliveries, 3.5+ driver rating, scooter access, no active delivery, and no prior race result. It surfaces at Bali Family Rental Scooter as a visible `RACE` world scene and a scooter-rental activity-menu row, not as a phone ping. The challenge uses Rio's portrait-capable relationship-choice panel; "Not today" does not consume the one-time race, while "Race him" stakes Rp 25, runs a letterbox 3-2-1 countdown, then starts a route lap.
- The race reuses the ride layer instead of adding a racing framework: a pure `RivalRace.ts` model owns the authored route, ghost pacing/rubber-band caps, outcome resolution, eligibility, and outcome writes. GameScene adds a Rio ghost sprite, a race marker layer for the four route checkpoints (rental -> Canggu Station -> Bungalow -> Berawa Beach -> rental), ESC-to-concede, and finish dialogue. Win pays the side bet, nudges Relational positive, and records Rio memory `lost_to_you_clean`; loss/concede records `beat_you` with rematch-hook dialogue and never gates progression, rating, board access, or Act flow. The active race uses the existing `world.activeActivity` persistence seam with a new `rivalRace` source but no schema bump.
- Rio now has memory-driven follow-up ambient lines after the race result, so the setpiece leaves residue in the world. Automated tests/build/HTTP checks passed; manual browser acceptance for one win and one loss was not captured because the in-app browser target (`iab`) was unavailable. This is the first authored setpiece milestone and completes the current Phase 2 packet queue; the next required step is the Phase 3 human playtest gate, not more feature work.
- RPG-20260706-08 is implemented on `feat/rpg-20260706-08-meter-diet`: meter visibility is now staged by act through `src/systems/guidance/MeterVisibility.ts`. Acts 0-1 surface Energy plus money only; Wellbeing, Focus, and Social continue simulating underneath and reveal from Act 2 onward, with `moveOutReady` keeping the advanced meter UI revealed even during transition edge cases. HUD micro-bars, Phone > Profile, Bag, activity menu headers, activity/event result copy, and first-visit venue stat copy now use the same visible-meter read model. The Act 2 card adds the one-line reveal beat, "There's more to a life here than energy and rupiah." Hidden-meter audit: `StationRecovery` now routes pre-Act-2 Wellbeing/Focus nudges through generic rest/Energy language, `ActivityEngine` filters result and morning-penalty meter summaries, station preview copy is hidden before Act 2, and the old legacy social-energy activity block is relaxed until advanced meters are visible. Automated tests/build/HTTP checks passed; requested screenshots were not captured because the in-app browser target (`iab`) was unavailable.
- RPG-20260706-07 is implemented on `feat/rpg-20260706-07-presentation-kit`: the game now has a small cutscene scripting seam with a pure sequencer, reusable letterbox/act-card/camera-pan/scripted-walk step kinds, and a GameScene runner that uses the established zoom-compensated UI layer. Cutscenes are skippable with ESC/tap, have hard timeouts, do not persist state, defer autosave/manual save while active, and restore the previous scene mode on completion/skip. Productions shipped: first sleep plays `ACT 1 -- THE HUSTLE` before the existing morning-hand flow, and the Act 1 -> Act 2 transition plays a beach-direction pan plus `ACT 2 -- FINDING YOUR PEOPLE`. Automated tests/build/HTTP checks passed; requested screenshots were not captured because the in-app browser target (`iab`) was unavailable.
- RPG-20260706-06 is implemented on `feat/rpg-20260706-06-portraits`: full DOM dialogue panels now support optional procedural portrait busts for Ibu Sari, Kadek, and Rio only. Portraits are generated as original flat-color canvas data URLs, cached by NPC/variant, and selected from the existing relationship affinity tier: stranger/acquaintance use neutral, friendly/regular/trusted use warm. Ambient speech bubbles, phone rows, toasts, and NPCs without authored portraits keep their existing portrait-less layout. Automated tests/build/HTTP checks passed; requested screenshot and six-size numeric bounds proof were not captured because the in-app browser target (`iab`) was unavailable in this session.
- RPG-20260706-05 is implemented on `feat/rpg-20260706-05-paddies-villas`: the west side of the authored street now has non-interactive rice-paddy dressing driven by `paddyFieldState()`, with one visible yellowing Corner patch seeded from day one and the rest green by default. Existing villa delivery dropoff points now have procedural villa gate dressing aligned to the current delivery coordinates, and the corridor has light non-collision street texture: canang sari offerings, sleeping dogs, laundry lines, and parked scooters. No playable bounds, venue coordinates, collision rects, economy, save schema, quests, interiors, or beach terminus were changed. Automated tests/build/HTTP checks passed; requested screenshot acceptance was not captured because the in-app browser target (`iab`) was unavailable in this session.
- RPG-20260706-04 is implemented on `feat/rpg-20260706-04-cargo-care`: Act 1+ delivery conditions with a payout bonus now carry contextual cargo integrity. Traffic hits and fast hard collisions can reduce only the condition bonus/tip margin; the base delivery payout, item handoff, delivery completion, count progression, and Act 0 tutorial delivery remain fail-forward and untouched. A contextual `Cargo N%` HUD chip appears only while carrying eligible cargo, completion copy explains any tip cut plainly, and one lightweight ambient reaction covers badly rattled boxes or pristine villa runs.
- RPG-20260706-03 is implemented on `feat/rpg-20260706-03-riding-feel`: scooter riding now uses a pure `RideModel` for acceleration, coast/brake deceleration, tier/condition top-speed modulation, sharp-turn drift, and a gentle slick flag from existing rain-window delivery conditions. The scene applies the same model to keyboard and touch joystick input, feeds model lean into scooter visuals, adds subtle speed-based camera lookahead, and fires feedback-only near-miss whoosh flourishes/audio when passing close to traffic or pedestrians at speed. Delivery/economy/collision/reputation math is unchanged. Straight-line envelope proof: at a 1600px reference distance, old constant-speed time was ~2899ms and the new borrowed-rattletrap model is 3000ms (`1.035x`, inside the requested ±10%). Automated verification passed and the local dev URL returned HTTP 200; live BAKED -> villa / Ibu Sari -> BAKED manual ride acceptance could not be captured because the in-app browser target was not exposed.
- RPG-20260706-02 is implemented on `feat/rpg-20260706-02-payout-juice`: delivery completion now layers a short zoom-safe HUD celebration over the existing completion path. It counts `Rp +<payout>` up over 600ms, punches the run/driver rating line when rating moves, scales the flourish subtly for checkpoint performance tiers, and adds a rent-target beat when the payout crosses the rent threshold. `completeDelivery()` payout/rating/economy math is unchanged; the plain toast remains the durable text record. Automated verification passed, and the local dev URL returned HTTP 200. Screenshot proof could not be captured in this session because the in-app browser target was not exposed by the browser connector.
- RPG-20260706-01 is implemented on `feat/rpg-20260706-01-audio-foundation`: the game now has a procedural Web Audio sound layer with pickup, payout, UI click, toast, sleep, and soft ambient-loop cues. Audio unlocks only after user input, the ambient bed starts after that first interaction, and a mute toggle lives in Phone > Profile using `bali-life-rpg.audio-muted` outside the versioned save. No audio files, dependencies, save-schema fields, or gameplay/economy values were added.
- The No-Questions Package now resolves as a face-to-face Rio relationship choice at the scooter rental instead of a generic phone-ping Accept row. When the live package opportunity is at the rental, the venue menu shows `Face it`; Rio presents the offer through the relationship-choice panel. Taking it accepts the gig and leaves Rio memory/affinity/Relational movement, while the authored Rooted/reputation hit still lands only if the player resolves the run. Pushing it back immediately applies the existing decline reward, removes the live offer under its long cooldown, and records the Rio memory.
- Act 1 Golden Path Vertical Slice 2 is now underway on `feat/gameplay-stations`: sleeping into an Act 1 morning opens a lightweight `Today's Hand` card surface with 3-5 decisions derived from existing state. The hand can offer available board runs, rent pressure, scooter repair guidance, and the No-Questions Package when it exists. It is presentation/read-model driven, triggered by sleep, and does not add a save-schema field.
- Repeatable Act 1 board deliveries now have playable RIDE route beats instead of only the Act 0 tutorial delivery doing so. Milk & Madu, Satu-Satu, Nude, Beach Wristband, and FINNS Linen jobs each have at least one checkpoint; the Satu-Satu rain-window condition adds an extra rain-slick beat. Small blue route-beat markers appear on the field before triggering, and performance continues to feed the existing delivery payout/rating seam with fail-forward completion.
- Scooter repair at Bali Family Rental Scooter is now a committed `Wrench Repair` timing beat when started from the rental counter. Direct repair still exists as a phone/fallback action, but the richer field interaction uses the existing committed-activity/minigame overlay and persists as `source: "scooterRepair"` if interrupted. Repair quality scales the final patched condition while every result still improves the scooter.
- The Act 1 `no_questions_package` moral opportunity now has a distinct visible world scene at the scooter rental: a shady package cue with Rio staged nearby and a `CHOICE` marker, rather than a generic help-wanted gig sign. The morning hand can track it, but discovery and resolution remain at the rental counter.
- RIDE/TALK vertical slice is complete on `feat/gameplay-stations`, deliberately proving depth on one existing touchpoint before more L1 width. The Act 0 tutorial delivery `first_baked_villa_delivery` now has two route checkpoints (`traffic_gap`, `corner_lean`) that open short timing beats while riding from BAKED to the villa. Their average performance feeds the existing `completeDelivery(..., performanceScore)` seam, scaling payout/rating through the old delivery math while preserving fail-forward: every score still completes the delivery.
- Kadek's `berawa_bakery_run` turn-in now has a one-time relationship choice scene instead of only a text-box payout. The choices are symmetric story choices, not scored minigame choices: asking about his baking costs a little energy, gives affinity, and nudges Relational positive; taking the payout is efficient, gives small meter recovery, and nudges Relational negative. Ibu Sari has no relationship-choice scene, so her starter quest turn-in remains the plain existing dialogue path.
- The hidden reputation-axis system has a player-facing `AdjustReputationAxis` intent, so relationship scenes can write to Rooted/Relational axes without going through opportunities. The former persisted delivery-checkpoint activity variant was removed by RPG-20260712-03; delivery performance now persists directly on the active delivery as continuous run telemetry.
- Street road continuity repair is complete on `feat/gameplay-stations`. `paintSlotAccess()` in `StreetRenderer` now paints side-specific sidewalk access only from a building entrance to the near curb, instead of spanning through the full road band for left-side buildings. A layout invariant now asserts that authored building access strips never paint `sidewalk` over the road band across the street length, protecting the regression that made the road read like tan parking-lot gaps.
- Road/sidewalk legibility was tightened without changing venue coordinates, building geometry, props, plots, or sidewalk color. The road tile is now warm asphalt gray with darker edges and brighter lane markers, while sidewalks stay light/warm. Browser screenshot acceptance ran at `1280x800` after a fresh F9 reset in the in-app browser; screenshots are saved under `tmp/road-continuity-proof-2026-07-03/`. The dense Canggu/BAKED/Bungalow/Scooter/Satu-Satu corridor showed a continuous gray road band through consecutive venue access rows on both sides, with no tan/beige sidewalk gaps cutting across the road.
- L1 Step 1 is complete on `feat/gameplay-stations`: the first door/interior primitive exists inside the same `GameScene`, using a reserved offscreen world band rather than a separate Phaser Scene. `canggu_station` now opens `warung_sari_interior`, with fade-out/fade-in, interior camera/physics bounds, a saved exterior return point, an exit mat, and persistent player coordinates kept outside the interior so autosaves do not strand the player offscreen.
- Warung Sari is the first proven interior: it has a warm wood/cane room shell, counter, tables, two decorative diner sprites, Ibu Sari staged at an interior NPC slot when her schedule places her at Canggu Station, and a `meal_counter` station that routes back to the existing Canggu Station activity menu. Closed-interior NPCs are suppressed from exterior proximity checks so the Canggu Station door remains reachable; the Act 0 first-run gate has a narrow exception for that door because it is now the path to Ibu.
- L1 Step 2 extended that same interior primitive to the first-day cafe/bakery loop. `baked_berawa` now opens `baked_berawa_interior` with a bakery counter, oven, pastry trays, a `bakery_counter` station routed to the existing BAKED activity context, and a Kadek slot when his schedule places him there. `milk_madu_berawa` now opens `milk_madu_interior` with cafe tables, laptop/coffee props, a `cafe_table` station routed to the existing Milk & Madu activity context, and Ari/Willow/Ibu Sari slots when their routes place them there. `openExteriorVenueInteraction()` now enters any venue with an `InteriorDefinition`, not just Warung Sari.
- L1 Step 3 added the cheap-kos room as an enterable home interior. The exterior home marker now opens `cheap_kos_interior`, a cramped room shell with mattress, desk, boxes, bare-bulb props, and a `kos_room_corner` station routed to the existing `cheap_kos` home station menu for sleep, rent, planning, and snack prep. Sleep now restores the scene mode to `interior` or `world` correctly after the DOM activity panel closes.
- L1 Step 4 added `scooter_rental_interior` for Bali Family Rental Scooter. The rental now has an interior counter, helmet/service-board props, parked scooters, a `scooter_counter` station routed to the existing scooter rental activity/shop context, and a Rio slot when his routine places him at the rental. This stages Act 1 repair/upgrade and the shady-package location as a place without adding new economy or UI logic.
- L1 Step 5 added `satu_satu_interior` for Satu-Satu Coffee Company. It has a focus-table station routed to the existing `satu_satu_coffee` cafe/focus activity context, laptop/table/notice-board props, and scheduled slots for Kadek, Made, and Pak Bagus when their routines converge there. This stages the Act 2 focus-table/social bridge as an interior scene without adding new club or relationship systems.
- L1 Step 6 added `bungalow_living_interior` for Bungalow Living Bali. It has a design-counter station routed to the existing `bungalow_living` activity/shop context, textile/cushion/back-office props, and a Made slot when her routine places her at Bungalow. This covers the roadmap's current Bungalow interior target without starting the Act 3 furniture-placement or permit systems.
- L1 Step 7 bridges interiors back into the core hustle loop, on-field guidance, and street readability. Active accepted deliveries now surface at matching interior stations, so the first BAKED pickup can be taken from the bakery counter using the existing delivery handler. Venue objectives retarget to the matching room station while the player is inside that venue, so arrows/markers point to the counter/table instead of the exterior node. Enterable street venues now get a distinct door/light-spill treatment, and all interior stations draw a subtle floor cue so counters/tables read as usable without adding more HUD text.
- The interior repair follow-up is complete. Interior interactions now use a small-room priority model: delivery pickups `0`, exit mats `1`, stations `2`, NPCs `3`, with NPC talk radius reduced to `scaleDistance(40)` and data tests requiring stations, entrances, and exit mats to stay outside NPC talk range. Accepted delivery pickups for venues with authored interiors no longer appear as exterior delivery targets; BAKED pickup is staged at the bakery counter. Interior camera bounds now center rooms that are smaller than the viewport at the capped zoom, minimap stays hidden indoors, and committed activities started from interiors return to `interior` mode instead of dropping the player into world mode at room coordinates.
- Interior repair browser proof ran in the in-app browser at `1280x800` on `localhost:5173`; screenshots are saved locally under `tmp/interior-proof-2026-07-03/`. Verified: Warung Sari framed with no minimap, `E - Talk to Ibu Sari` at the counter starts the delivery, BAKED exterior enters the room instead of picking up outside, `E - Pick up sealed pastries at BAKED.` at the bakery counter advances to villa dropoff, villa dropoff increased money from Rp 60 to Rp 206, Milk & Madu entry shows `E - Use cafe table` rather than Ari dialogue, kos room is centered after the camera-bounds fix, `E - Use kos room` opens the sleep menu, and Sleep advances Act 0 to `complete` with the Act 1 rent objective. Browser input was slow, so the test clock was reset through dev godmode during the proof; the game-state transitions and prompts were verified through the hidden debug DOM snapshot and screenshots.
- Tone fixes from L1 Step 1 are also in: new saves start at `08:00` with morning cold-open copy, player-caused pedestrian bumps in Acts 0-1 no longer create wanted/bounty/reputation damage and instead produce a soft apology/stumble, while Act 2+ keeps the old flagging behavior. The large objective/reveal radius ring was reduced to a compact marker so fresh boot no longer shows a screen-dominating halo.
- L1 Step 1 designer acceptance ran in the in-app browser at `1280x800` on `localhost:5173`: fresh boot showed morning light and compact objective cue, Canggu Station entered the offscreen Warung interior, Ibu Sari appeared inside and fired her normal Act 0 first-meet dialogue, and the exit mat returned the player outside. The meal station is covered by unit/helper tests mapping it to the existing Canggu Station activity context; the early-act no-wanted bump path is covered by `recklessRiding.test.ts`.
- `GAME_DESIGN.md` is now the canonical Game Design Document for game/systems/map/verbs, read alongside `STORY_BIBLE.md` for narrative. Where prior build decisions conflict with the GDD, the GDD wins; existing substrate such as the Discovery Ledger, reputation axes, shady-package choice, opportunities, relationships, meters, saves, and phone data should be restaged into the GDD frame rather than discarded. The world is entering an L1-L8 rebuild; the first step is the L1 interior/door primitive.
- P4a UI Diet is complete on `feat/gameplay-stations`: roaming chrome was reduced to a slim status chip, a compact objective chip, contextual warning chips, a top-right minimap, and four micro meter bars. The permanent six-stat wall, desktop touch buttons, meter table money row, and bottom keybind strip are gone on desktop.
- The HUD now uses contextual chips: status shows clock/money/rating plus unread mail, objective collapses to title-only after a short detail window, wanted/scooter warnings appear only when relevant, and the bottom prompt appears only for real nearby interactions, first-run guidance, home/sleep, bike-stuck, or non-world ESC hints.
- DOM chrome is slimmer: touch controls are hidden on non-touch desktop devices, the minimap is `168px` wide and docked top-right, and Energy/Wellbeing/Focus/Social are micro-bars directly underneath it. Actual touch devices keep the mobile controls.
- Toasts now use a bounded queue with dedupe, a short gap, fade-in, and fade-out so new messages do not overwrite the current one mid-read. Ambient NPC lines now render as dark in-world speech bubbles with a small tail and no routine/debug parenthetical at the default call site.
- P4a designer acceptance ran in the in-app browser at `1280x800` against an isolated `localhost:5173/?p4a-ui-diet` save. Captured checks showed quiet roaming with no stat wall/keybind strip/touch buttons, chrome around the expected `4-5%` frame coverage, contextual `E - Talk to ...` prompts, top-right minimap/meters no longer covering left-edge world labels, visible contextual warning chips, toast fade behavior, and dark speech bubbles without routine text. One paired-toast screenshot attempt was muddied by live relationship/state events, but the queue state machine was code-reviewed and single-toast fade was observed.
- Story Phase 3 is complete on `feat/gameplay-stations`: reputation now has hidden `rootedAxis` and `relationalAxis` fields defaulting to `0`, with no save-schema bump because existing reputation migration spreads defaults before old save data. Positive Rooted means rooted vs. extractive; positive Relational means relational vs. algorithmic.
- Opportunities can now opt into `axisImpact`, `declineReward`, `maxMoney`, and `minCompletedDeliveryCount`. Existing templates without `declineReward` still expire silently; moral-choice templates can now make "let it expire" a real branch without adding a new Decline button.
- Act 1 now has the first moral-choice opportunity, `no_questions_package`, at `bali_family_rental_scooter`: it appears only when the player has at most Rp 40 and at least 3 completed deliveries. Taking it pays Rp 180 but moves Rooted -15 and reputation -3; letting it expire gives no money but moves Rooted +10 and awards the `reliable` tag.
- The Act 1 Elena/Rumah golden thread now drips after delivery progress: `elena_notebook_2` unlocks in the Discovery Ledger at 3 completed deliveries, and Kadek says `"That's Rumah's old bike."` during the 5-9 delivery window. The earlier Act 0 Kadek hesitation still only fires before 5 deliveries, so the two lines do not overlap.
- Ambient NPC line shortening now treats decimal numbers like `4.9` and `2.0` as part of the same sentence instead of splitting at the decimal point. This fixes a pre-existing presentation bug surfaced by Rio's driver-rating line and Pak Bagus's `Berawa 2.0` default line; the NPC content itself was not changed.
- Playability/onboarding fix pass is complete on `feat/gameplay-stations`: the in-canvas Phaser HUD now renders through a camera-zoom-safe HUD layer, venue-dwelling NPCs win interaction focus over their venue/shop menus, and the fresh-save Act 0 opening now funnels the player to Ibu Sari with a visible objective/arrow before other world interactions open.
- The HUD fix keeps the intentional `STREET_CAMERA.desktopZoom = 1.6` world zoom. `GameScene` anchors the HUD layer to the main camera world view and inverse-scales it like the Phone panel, so the status box, objective line, off-screen arrow, toast, and bottom prompt behave like screen UI rather than zoomed world objects.
- Follow-up to that HUD fix closed the remaining Phaser `setScrollFactor(0)` camera-zoom gap in `GameScene`. Bag, Community, Shop, and dev-only Godmode panels now use the shared zoom-compensated container helper; the night screen overlay uses a synced compensated layer; panel button hit zones are children of their panel container so clicks align with the scaled modal.
- The NPC-vs-venue interaction fix is geometric, not just priority-based: `InteractionController` uses a larger NPC radius and suppresses venue/shop candidates while a talkable NPC occupies that venue footprint, so Ibu Sari/Kadek/Made do not lose to the building menu when their routines drift around the venue.
- The first-run Act 0 gate is session-only. `openFirstRunHint()` activates it only when the premise panel is actually shown on a fresh save; existing saves that have already seen the premise do not get re-gated. While active, non-Ibu world interactions redirect with a short toast until the first Ibu Sari conversation advances `meet_ibu_sari`.
- `STORY_BIBLE.md` v3 is now the canonical narrative/design source for the dramatic spine, cast, world systems, and hook architecture. It supersedes informal story notes where they conflict. Narrative and macro story decisions in this bible and future story packets are CSO/design specs for the coding agent to implement, not open briefs to reinterpret.
- Narrative Foundation phase 1 has begun: Rio, Pak Bagus, and Willow are registered as inert NPC data with authored daily routine routes and `generic_idle` behavior only. Their sprite keys (`npc-rio`, `npc-pak-bagus`, `npc-willow`) currently use original procedural placeholder textures in `BootScene`; dedicated character art remains a later art pass. Elena is intentionally not in `npcDefinitions` because every NPC definition auto-populates the world and the Story Bible keeps her off-screen until Act 4. Rio/Pak Bagus/Willow also intentionally have no tiered dialogue or relationship arcs yet; their `defaultLine` fallback is the whole interaction surface for this phase.
- The Discovery Ledger exists as a read-only Phone `Threads` tab derived from existing state, not new save data. `src/data/discoveryLedger.ts` currently has three entries: two Elena fragments unlocked by the scooter-seat notebook/SIM pickups and one codex note unlocked by completing `meet_ibu_sari`. The two clue pickups live near Canggu Station, use new zero-value item definitions, and produce a special `Besok ya` toast when collected. Kadek now has one early ambient reaction after the notebook is found and before five deliveries are complete.
- Act 1/2 access and sequencing fixes are complete on `feat/gameplay-stations`: Ibu Sari's Act 1 field Hustle Board now takes priority over unresolved legacy starter-quest progress chatter once the board is available, so the coconut restock quest can no longer permanently block the delivery board.
- Act 2 guidance now treats `world.life.hustle.moveOutReady` as an Act 2 unlock signal even if `currentAct` and the milestone flag are briefly out of sync. A low scooter condition still blocks future board deliveries, but the immediate chapter-turn field objective stays on the social handoff (`Join a first crew`) instead of undercutting the payoff with `Repair scooter`.
- Club membership debugging is now explicit: `world.life.joinedClubIds` remains the canonical Act 2 club field, while `playerState.joinedGroupIds` remains legacy interest-group/group-travel state. `__BALI_LIFE_DEBUG__` now exposes `joinedClubIds` plus `legacyJoinedGroupIds` so real venue-menu joins do not falsely look unjoined in debug.
- Corrected world-bounds/density pass is complete on `feat/gameplay-stations`: the beach was not missing; the dev-only godmode shortcuts were stale and dropped the player into undecorated field. Teleport buttons now resolve live authored venue nodes for Canggu Station, FINNS Beach Club, and Berawa Beach instead of old base-map coordinates.
- Playable containment now comes from authored content instead of the raw `3840 x 2720` tile backing world. `src/data/playableBounds.ts` derives bounds from the active street template plus authored venues, pickups, home, spawn, NPC routine points, and ambient route points; `GameScene` uses those bounds for physics/camera setup and clamps save loads, knockback, water correction, group helpers, dev teleports, and live movement.
- Current authored play bounds are `x=914..2528`, `y=0..2720`; the ordinary north/mid street corridor clamps more tightly to `x=1091..2502`, then expands near the beach approach at `y>=1952` so the beach-club/beach terminus content stays reachable. Layout invariant tests assert the bounds are narrower than the raw world and keep all authored venue/interaction points reachable.
- Corridor density now lives in `src/systems/map/StreetRenderer.ts`: raw-world-edge trees were replaced with modest procedural benches, lanterns, planters, shade trees, palms, umbrellas, towels, and surfboards inside the authored corridor and beach approach. No venue positions, collision rects, save schema, economy, quest logic, new buildings, or new areas changed.
- First-impression polish pass is complete on `feat/gameplay-stations`: the fresh-save cold-open now leads with an in-voice Act 0 arrival beat instead of a controls dump, the Phone/PDA panel is camera-zoom-safe and no longer clips left-edge text, raw NPC idle cue labels are hidden from default play while idle animations remain, and authored street signboards prioritize real venue names over station labels.
- Phone layout now lives behind `src/ui/phone/PhoneLayout.ts` and is covered at the established viewport set (`1280x800`, `1440x900`, `1728x1117`, `2560x1440`, `1024x768`, `390x844`). The Phaser phone root is anchored to the camera world-view origin and inverse-scaled against camera zoom so it behaves like screen UI instead of world art.
- Street signage now uses `getStreetSignPrimaryText()` for primary sign copy and `getPermanentlySignedVenueIds()` prevents separate floating discovery labels from stacking on top of permanently signed venue buildings such as Canggu Station. Station identity remains in station props/palettes, not as replacement signboard text.
- Gameplay-stations follow-up is active on `feat/gameplay-stations`: the station layer is now wired into the first-hour spine instead of sitting beside it. Act 0 meal/coffee progress is satisfied by cafe station choices, low-meter Act 1 guidance points to recovery stations, rent is payable at the cheap-kos home station, Ibu Sari can open a field Hustle Board, and scooter repair/upgrade actions live at the scooter rental counter.
- The phone remains a reference/backup surface for goals, feed, and details, but the immediate loop is now mostly field/station first: choose coffee/brunch at cafe stations, ask Ibu Sari for jobs, ride jobs, recover at warung/beach/cafe/home/coworking when meters dip, pay rent at home, and service the scooter at the rental counter.
- Act 2 station menus now bridge into relevant crews through `src/systems/life/StationSocialBridge.ts`: beach stations expose beach/run circles, cafe stations expose focus/brunch groups, and coworking points toward the focus table without auto-joining or adding save fields. The Act 2 objective now also points to Milk & Madu's brunch builders alongside the beach crew and focus table.
- New station-oriented coverage in `src/__tests__/firstHourProof.test.ts`, `src/__tests__/hustleDelivery.test.ts`, `src/__tests__/fieldGuidance.test.ts`, and `src/__tests__/dailyLoop.test.ts` checks Act 0 cafe station progress, low-meter recovery guidance, rent priority, home rent copy, scooter-counter upgrade targeting, and station-to-crew bridges.
- The older Settling In goals now count station-specific work and beach reset activities (`cafe_deep_work`, `coworking_focus_sprint`, `beach_surf_session`, `beach_reflect_walk`, `beach_cleanup_chat`) instead of only the pre-station generic activity IDs.
- Two old private-scene test seams are now system helpers: `src/systems/events/EventParticipation.ts` applies event money/meter/time/item/NPC-affinity effects, and `src/systems/life/SleepCycle.ts` applies sleep recovery plus queued morning penalties. `QuestRegistry` now exports the generic objective evaluator/consumer so collect/deliver/buy/talk/visit objective behavior is covered without adding fake quest content.
- First-hour proof sprint is complete on `feat/first-hour-proof`: the playable act spine now has an executable proof path from a new save through Act 0, Act 1 hustle, first rent, Act 2 social rhythm, and one crew-opened opportunity. The guard test lives in `src/__tests__/firstHourProof.test.ts`.
- Act 1 move-out readiness is now centralized in `src/systems/hustle/HustleMilestones.ts`: Found Your Feet requires 5 deliveries, Rp 700 delivery earnings, 4.2★ driver rating, and first rent covered. Delivery completion now calls out when only rent is blocking the move-out beat; paying rent can advance the player into Act 2 if the other thresholds are already met.
- Act 1 guidance now prioritizes delivery rhythm before recommending the scooter upgrade, then points clearly at first-rent coverage when rent is the final Act 2 blocker. The field objective can target home for `Cover first rent`, so the player has an on-field destination instead of only Phone copy.
- Act 2 now has a fourth proof goal, `open_better_door`: after joining a crew, attending a recurring club rhythm, and completing one relationship beat, the next step is a club-gated opportunity opened by that social trust. `getAct2PayoffOpportunityState()` derives eligible/live/completed payoff opportunities from the existing opportunity engine; no backend, new economy layer, or Act 3 sim was added.
- Act 2 payoff templates (`focus_table_client_referral`, `run_crew_breakfast_shift`, `brunch_builders_paid_intro`, `surf_circle_board_repair`) have higher spawn weight once their trust gates are met, so the social payoff is more likely to surface as a visible world opportunity at the right venue.
- Liveliness Pass 4 is complete on `feat/world-surfaced-interactions`: opportunities, events, and clubs now surface as visible world scenes rather than primarily as Phone list entries or calendar text. `src/systems/world/WorldScenes.ts` derives these scenes from existing local opportunity/event/club data; no backend, AI, network, or new content system was added.
- Live opportunities now render type-appropriate venue scenes in `GameScene`: gigs show help-wanted/waving cues, social opportunities show 2-3 local actors converging/gathering, help-outs show a distressed waiting actor, flash deals show an animated venue signal, and rumor/trade opportunities have lightweight field scenes. Phone Feed still exists for details/acceptance/reference.
- Minor NPC dialogue now uses in-world ambient speech bubbles with the Pass 3 talk bob. `src/systems/dialogue/DialoguePresentation.ts` keeps Act 0, quest-critical interactions, and relationship arc beats in full dialogue panels, while routine low-stakes NPC touches stay in-world and do not switch the scene to modal dialogue.
- Active scheduled events and joined-club recurring events now render visible world moments: run gatherings, work-table scenes, market walks, party/music pulses, and club-circle signatures. Club visibility still respects existing joined-club gates through `EventScheduler`.
- The phone is now confirmation/reference rather than primary discovery: field scenes plus Pass 2 objective/indicators show what is happening as the player moves. `getFieldFirstDiscoveryAudit()` currently verifies live opportunities and active events have matching visible scenes, with `phoneOnlyDiscoveryCount` at 0 in covered cases.
- New coverage in `src/__tests__/worldScenes.test.ts` and `src/__tests__/dialoguePresentation.test.ts` checks opportunity scene kinds, event/club scene visibility, field-first discovery audit, and ambient-vs-panel dialogue routing.
- Liveliness Pass 3 is complete on `feat/cheap-animation`: original procedural art now has a cheap animation layer. `BootScene` generates original 4-frame walk cycles for player/NPC character textures; no Nintendo/Pokemon/Game Freak sprites or traced frames are used.
- `src/systems/animation/CharacterAnimations.ts` defines the low-frame policy: character idle = 1 frame, character walk = 4 frames per down/up/side pose, NPC idle loops = 2 frames, NPC reaction turn = 2 frames. The scene uses Phaser `anims.create` / `sprite.play` for these loops.
- Player movement now plays a walk cycle while moving on foot and returns to an idle facing frame when stopped. The player faces up/down/left/right from the existing movement vector; scooter movement stays visually owned by the scooter layer.
- Named NPCs and ambient walkers now play walk cycles while Pass 1 routine routes move them. `idleTag` behaviors now use short looped idle animations, and proximity reactions briefly play a turn/reaction animation before returning to route or idle behavior.
- The player scooter now has cosmetic lean, speed lines at higher speed, and tier/condition-aware idle motion. The borrowed rattletrap visibly wobbles more than the daily rental or proper bike; this is visual only and does not alter economy, speed, save data, or scooter wear.
- Interaction flourishes are now in place: NPC dialogue starts a brief talk bob, pickups pop with a ghost/ring beat, delivery pickup/completion gets a small pop/cash flourish, and committed activities/opportunities start with a compact activity ring flash.
- New coverage in `src/__tests__/animationPolicy.test.ts` checks frame counts, character/NPC animation key selection, scooter rattle/lean/speed-cue policy, and short interaction flourish specs. No save schema change was required.
- Liveliness Pass 2 is complete on `feat/on-field-guidance`: guidance now lives primarily on the field. `src/systems/guidance/FieldObjective.ts` consolidates Act 0, Act 1 hustle, Act 2, and Act 3-ready read models into one always-visible objective line plus target refs.
- The HUD now shows one compact `Now: ...` objective on the field instead of stacking several guidance lines. Phone > Quests remains as deeper reference, but the current next step is visible without opening a menu.
- Objective targets are generalized across NPCs, venues, home, and delivery points. `GameScene` resolves them to live coordinates, draws world markers, draws minimap markers, and shows a fixed-screen directional arrow when the target is off-screen.
- `src/systems/guidance/FieldIndicators.ts` surfaces existing state as field-level cues: ready relationship beats get NPC indicators, and live opportunities / active-or-soon events get venue indicators.
- Act 0 guidance is explicitly phone-independent: each tutorial step has field objective text plus a target marker, and tests assert no Act 0 objective requires Phone/Feed/Quests text to progress. The phone is still introduced as optional deeper detail.
- New coverage in `src/__tests__/fieldGuidance.test.ts` checks the objective readout across Act 0/1/2 state changes, generalized target refs for NPC/venue/point/home objectives, field indicators for NPCs/venues, and Act 0 no-phone progression.
- NPC liveliness pass 1 is complete on `feat/npc-life`. Named NPCs no longer stand at a single fixed point: each has `routineRoutes` in `src/data/npcs.ts`, with time-windowed route data made of waypoints shaped like `{ id, label, venueId?, x, y, pauseMs? }`. Runtime motion is handled by `src/systems/npcs/NpcRoutineRoutes.ts`.
- The live `GameScene` NPC loop now advances each named NPC through the active route, pauses at waypoints, updates `world.npcs[id].x/y`, and keeps `currentRoutineId` on the active route id. Existing `E` interaction already resolves against live sprite positions through `InteractionController`, and the new tests lock that contract down.
- NPCs now have `idleTag` data. Ibu Sari uses `tidy_counter`, Kadek uses `knead_oven`, Ari uses `laptop_sip`, Made uses `tinker_board`, and untagged NPCs fall back to `generic_idle`. `src/systems/npcs/NpcIdleBehavior.ts` turns those tags into cheap sprite bob/tilt and small waypoint cues without new sprite art.
- NPCs now react before conversation. `src/systems/npcs/NpcProximityReactions.ts` uses existing relationship affinity tiers: strangers glance, acquaintances nod, friendly NPCs smile and briefly pause, regulars wave longer, and trusted NPCs brighten. The scene turns the NPC toward the player and shows a short cue without blocking interaction.
- Optional ambient population is implemented in `src/data/ambientNpcs.ts`: four unnamed, non-interactive background walkers reuse existing character textures, follow simple loops, and idle subtly. They are not saved and do not appear as talk targets.
- New coverage lives in `src/__tests__/npcLife.test.ts`: authored multi-waypoint routes, route selection/motion/pause, live-position interaction targeting, idle tags/fallback/visual drift, proximity reaction tier scaling, and ambient walker invariants.
- Act 0 / Act 1 hustle spine is now underway on `feat/act0-hustle-loop`: new local state tracks `world.life.actProgress` and `world.life.hustle`, including Act 0 tutorial step, first-day completion, active delivery, driver rating, delivery earnings, scooter tier, rent target, and move-out readiness.
- Save schema is now v11. Older saves migrate by adding Act 0 progress and hustle defaults without wiping money, quests, inventory, relationships, reputation, discovery, profile, portal, meters, clubs, arcs, opportunities, or committed activities.
- Save migration now infers Act 0 as complete for older saves that already have life-loop/social progress (`activityHistory`, completed goals, joined clubs, relationship arcs, or settled-in state), so established local test saves are not forced back into the new first-day tutorial.
- Added `src/data/deliveries.ts` and `src/systems/hustle/DeliverySystem.ts` for deterministic local delivery flow: accept -> pickup -> dropoff -> payout -> driver rating/reputation/relationship rewards. The first scripted delivery is Ibu Sari's BAKED villa drop.
- The Phone Feed now includes a local Hustle Board. After the first day is complete and the player has a scooter, it offers repeatable delivery jobs with driver-rating and completed-delivery gates; locked jobs show the reason rather than pretending to be available.
- Current delivery jobs: first BAKED villa drop, Milk & Madu brunch bag, Satu-Satu invoice pouch, Nude cold bag run, Beach wristband pouch, and FINNS linen bundle.
- The Hustle Board now has local survival actions: pay rent (`rentAmount` / `rentDueDay`) and upgrade from the borrowed rattletrap to a proper daily rental once money, completed deliveries, and driver rating are high enough.
- The Hustle Board now previews small authored delivery conditions on board jobs (`Villa tip`, `Rush hour`, `Clean papers`, `Rain window`, `Fragile stack`, `Service gate priority`). Conditions are deterministic at accept time, persist on the active delivery as `conditionId`, and adjust the effective payout/time/meter/rating math without changing the tutorial delivery.
- Rent pressure is now visible but non-punitive: `getRentPressureState()` labels comfortable/due-soon/due-today/overdue states, the HUD and Hustle Board show the countdown, and Ibu Sari sends one local daily rent reminder only when rent is close or late. There is still no eviction/fail state.
- Crossing the Act 1 move-out threshold now produces an explicit delivery-completion message and HUD milestone copy. If the player has enough runs but is short on earnings or rating, the HUD says what is still missing instead of falling back to old generic tutorial text.
- Delivery completions now wear down scooter condition based on scooter tier and delivery condition. Very low scooter condition blocks new board deliveries with a repair reason; Phone > Feed includes a local `Repair` action that spends money, restores condition to the tier cap, clears stuck state, and saves.
- Phone > Feed now shows scooter condition and repair cost directly on the Hustle Board, and the board can render five delivery offers so the added mid-tier jobs are visible.
- When the move-out threshold is crossed, `world.life.actProgress.currentAct` advances to `2`, and the HUD reframes the next chapter as events, clubs, and friendships. This uses the existing Phase B social layer instead of adding new social systems.
- Act 2 now has a lightweight handoff instead of a new system: if the player reaches Act 2 without joining a club, Ari can send a daily local phone invite, and the guide layer points toward Berawa Beach (`Find beach crew`) and Satu-Satu Coffee (`Find focus table`) as first social targets.
- Phone > Quests now includes an Act 2 `Find Your People` goal surface once the player reaches Act 2: join a first crew, attend one recurring club rhythm, and complete a first relationship beat. `getAct2NextStep()` now gives HUD + Phone concrete recovery copy for joining a crew, attending the joined-club rhythm, and completing a relationship beat.
- Act 2 club membership now unlocks concrete better opportunities: `focus_table_client_referral`, `run_crew_breakfast_shift`, `brunch_builders_paid_intro`, and `surf_circle_board_repair` show that social trust can open better work/perks without adding a new economy system.
- Act 3 remains hooks-only but now has a visible readiness surface in `src/systems/life/Act3Readiness.ts`: Act 2 social foundation, Ibu Sari mentor trust, first crew candidate, seed capital, and a trusted business lead. When all are ready, HUD/Phone explicitly call out that opening the business-management sim is a CEO/product-scope unlock.
- Phone > Quests now shows an Act 1 Hustle goal surface derived from runtime state: first delivery, steady runner, daily scooter, cover first rent, and move-out ready. Those goals now include concrete progress text, and `getHustleNextStep()` gives HUD + Phone a single next-action read model for active deliveries, scooter repair, rent pressure, scooter upgrade, and move-out requirements.
- Dev godmode now includes Act 1 testing shortcuts: set Act 1 ready, add delivery progress, set driver rating to 4.5, pay rent, and upgrade scooter. These are development-only and still gated by `import.meta.env.DEV`.
- After Act 0, Ibu Sari can send one local daily phone nudge pointing the player back to the Hustle Board when no delivery is active. This uses the existing simulated phone-feed/message system.
- Runtime opportunity spawning, event pings, and authored phone texts are gated off during Act 0 so the first-day tutorial is not interrupted by unrelated feed noise. The pure opportunity engine remains unchanged for tests/future systems.
- Act 0 now starts at dusk near the cheap-kos/Canggu Station side. Ibu Sari gives the player a borrowed beat-up scooter, accepts the first BAKED delivery, and HUD tutorial copy points the player through pickup, dropoff, meal/coffee, and first sleep.
- Active delivery pickup/dropoff markers are drawn on the map and become `E`/`ACT` interaction targets. Delivery targets win over overlapping shop panels so BAKED pickup does not accidentally open the shop.
- Active delivery targets now also appear on the minimap, and the Act 1 tracker shows active delivery, rent target, scooter tier, driver rating, and Hustle Board guidance.
- Act 0 now draws lightweight guide markers on the map/minimap for the current tutorial target: Ibu Sari at the start, nearby meal/coffee venue options after the first delivery, and the cheap-kos/home marker for the final sleep step.
- Phone > Quests now shows the current Act 0 first-day objective while the tutorial is active, so the player has a second place to recover the next step if they miss HUD copy.
- The final Act 0 sleep step is now anchored to `src/data/homeBase.ts` (`Cheap Kos Room`) and `src/systems/life/HomeBase.ts`; the player must be at the home marker to complete the first night instead of sleeping anywhere.
- Scene absolute-minute math now matches the shared systems convention (`Day 1` starts at minute `0`), so Act 0 delivery countdowns do not show an extra day of time.
- The current automated suite is green after the Act 0/hustle additions: `npm test -- --run` reports 53 passing and 3 intentionally skipped tests; `npm run build` passes.
- Git is now initialized locally. Baseline and every sprint phase are committed.
- Added [STORY_ARC.md](STORY_ARC.md), the canonical progression spine: Act 0 新手村 tutorial, Act 1 hustle, Act 2 people/social, Act 3 build your warung/café + villa + bike, Act 4 solo win, Act 5 multiplayer/Nomad Nest open world.
- Added [ACT3_BUSINESS_DESIGN.md](ACT3_BUSINESS_DESIGN.md), the deferred Act 3 ambition-layer design. It locks Ibu Sari as mentor, friendship-first tone, gentle Canggu satire, villa + business + bike as the solo win condition, and roughly two hours per act. Act 3 should be designed for hooks now but built after the tutorial/hustle/social layers are proven.
- Updated [docs/ROADMAP.md](docs/ROADMAP.md) so near-term gameplay points toward Act 0/Act 1: guided Ibu Sari first day, scooter/gig app, first BAKED delivery, first meal/coffee, sleep, then the delivery/star-rating/upgrades economy.
- The six action buttons (`PHONE`, `SAVE`, `SOC`, `BIKE`, `BAG`, `ACT`) are now fixed DOM overlay buttons instead of Phaser game objects, so camera zoom/scale cannot push them off-screen. The minimap is now a fixed DOM canvas, also independent of world camera zoom.
- Core daily life loop added locally: `WorldState.meters` now tracks Energy, Wellbeing, Focus, and Social while Money remains on the local player. The fixed DOM HUD shows Money + all four meters.
- Phase B social layer added locally: events are first-class and host-agnostic, clubs/groups are first-class and purpose-generic, relationship arcs deepen key NPC friendships, and the Settling In goals now include event attendance, joining a crew, and completing a bond beat.
- Dynamic opportunity engine added locally: `src/data/opportunities.ts` defines dev-authored gigs, social pings, help-outs, flash deals, rumors, and trades; `src/systems/opportunities/OpportunityEngine.ts` maintains a deterministic 2-4 live pool, timers, expiry, cooldowns, rewards, chaining, and a no-dead-day fallback.
- The Phone now has a live Feed tab with newest messages, countdown opportunities, accept/track actions, event-start pings, authored NPC/club texts, and a fixed DOM unread badge/buzz on the `PHONE` button.
- Live opportunities render as world pins and minimap dots with type colors/icons. Clicking a world pin or approaching its venue can track it; accepted opportunities resolve on-site from the existing venue activity menu before the timer expires.
- Stakes are local and non-combat: missed social pings record a small `missed_opportunity` relationship memory, reputation gates unlock better pings, and flash deals are explicitly simulated/dev-authored promotion seeds with no real commerce integration.
- Opportunity layer introduced save schema v9. Current schema is v11 after committed activities and the Act 0 hustle state; V1-v10 saves migrate forward with defaults for newer state while preserving existing runtime data.
- UI overlay patch added: the fixed DOM minimap is now semi-transparent in world mode and auto-hides under overlays; dialogue moved to a fixed DOM panel that stays fully within the viewport and clear of the HUD button cluster; one shared `overlayOpen` flag now controls minimap hiding, HUD muting, and the body overlay class for dialogue/phone/inventory/community/activity/shop-style modal states.
- Added `src/data/events.ts` and `src/systems/events/EventScheduler.ts`: dev-authored events reference venues/NPCs/groups by id, appear in Calendar/Events, and can be attended on-site from the venue activity menu.
- Added `src/data/groups.ts` and `src/systems/groups/GroupRegistry.ts`: clubs can be joined from Phone > Community or at their home venue; joining unlocks membership-gated recurring events on the calendar.
- Added `src/data/relationshipArcs.ts` and `src/systems/relationships/RelationshipArcs.ts`: Ari, Made, and Ibu Sari have sequential local relationship beats gated by affinity, events, clubs, or starter-quest completion, with text/perk hooks only.
- Added `src/data/activities.ts` and `src/systems/life/ActivityEngine.ts`: venue category + hours + money + Energy + repeatability determine available activities, activity choices advance time, apply meter/money/item/reputation effects, and persist activity history.
- `E` at a shop or venue now opens a venue activity menu. Shops retain the original buy/sell panel as an explicit `Open buy/sell` option.
- Added sleep support through the existing action prompt when it is late or Energy is low: sleep advances to the next morning, restores Energy, bumps Wellbeing/Focus, and saves.
- Activities at venues with associated NPCs now bump relationship affinity and memory. Contacts shows each NPC tier plus the tier perk; existing tiered scripted dialogue reacts to those tiers.
- Added a lightweight Settling In arc in the Phone Quests tab: Find your spot, First friend, Earn your keep, Touch grass, and Plug in. Completing all five sets `world.life.settledIn`.
- HUD/minimap bounds were verified numerically, not by screenshot: `1280x800`, `1440x900`, `1728x1117`, `2560x1440`, `1024x768`, and `390x844` all PASS for button `getBoundingClientRect()` inside `window.innerWidth/innerHeight`, minimap inside canvas bounds, and one click firing per action.
- Pivoted the active playable map from the full projected OSM road tangle to an authored `32px` tile street template for `Jl. Pantai Berawa`.
- OSM/generated coordinates are still committed and used as sequencing/reference data, but runtime now imports `src/data/authoredStreetLayout.ts` instead of `src/data/scaledBerawaLayout.ts`.
- Added `src/systems/map/TileStreetScale.ts`, which defines `TILE_SIZE = 32`, a `120 x 85` tile world (`3840 x 2720` px), generated original tile art, and street camera zoom values (`1.6` desktop / `1.28` mobile).
- Added `src/systems/map/StreetTemplate.ts` and `src/systems/map/StreetRenderer.ts`: reusable street data model, Phaser tilemap terrain rendering, axis-aligned building/prop drawing, street road paths, and beach/water feature export.
- Added `src/data/streetTemplates.ts`: `jl_pantai_berawa` is a vertical street with `roadWidthTiles = 6`, `sidewalkTiles = 2`, `slotDepthTiles = 5`, clean left/right building slots, and a grass -> sand -> water terminus.
- The Pantai Berawa street now uses an explicit Google-Maps/Gemini walking order instead of coordinate-projection sorting: 29 main-strip entries from FINNS/Atlas at the beach end through Bungalow Living inland. Provisional side labels are stored per venue and rebalanced for readable left/right placement without changing order.
- Side-street venues are recorded in `pantaiBerawaCrossStreets` for future templates and removed from the main strip. `baked_berawa` and `canggu_station` remain reachable as quest-critical Raya Semat stubs; `berawa_beach` remains as a separate beach anchor marker.
- Flagged authored-order conflicts against `src/data/curatedVenues.ts`: `bakersfield_berawa` is locally marked `Jl. Raya Semat` but Gemini places it on the main strip; `baked_berawa` is locally marked `Jl. Pantai Berawa` but Gemini places it on Raya Semat; `da_romeo_restaurant` is locally marked `Jl. Pantai Berawa` but is absent from Gemini's walking order and deferred for manual placement.
- Shopfront readability pass: venue buildings now get permanent compact signboards, category-specific props, road-facing doors, entrance mats, and deterministic color variation so the street no longer reads as identical boxes.
- Storefront interaction pass: named non-shop venues on the authored street can now be checked with `E`. Visits route through `VisitVenue`, record venue relationship memory, show a short authored flavor card, and give tiny one-time focus/social/connection feedback so the street is more playable without becoming a grind.
- `layoutLookup.ts` now resolves shops, NPC routine stops, pickups, and spawn from authored street venue nodes. Offsets are literal pixels in the authored tile world rather than OSM presentation-scaled values.
- `GameScene.drawNeighborhood()` now calls `renderStreetTemplate()`; the old OSM static-map draw helpers remain dormant for fallback/debt but are no longer the active playable surface.
- Ambient traffic follows the authored street road path; minimap/discovery/water-boundary code reads the authored adapter's road and beach/water features.
- Original tile art is generated programmatically in repo code. No Nintendo/Pokémon/Game Freak assets are copied or traced.
- Berawa layout is now generated from OpenStreetMap data plus `src/data/curatedVenues.ts` by `scripts/generateLayoutFromOSM.ts`; runtime consumes static generated data from `src/data/berawaLayout.ts`.
- Curated coordinate resolution is cached at `data/osm/berawa.curated-coords.json`: 41 rendered venues, 23 OSM POI matches, 0 Nominatim matches, 15 flagged estimates, and 3 flagged fallbacks. The estimate/fallback list is the manual-check shortlist, not live truth.
- The generated bbox is now framed to the curated venue cloud and filters the larger OSM cache to 934 road paths.
- Runtime map art now renders baked roads, OSM beach/coastline/water features, greenery, and one simple blocky building per rendered curated venue through `curatedVenueNodes`. The old hand-placed market/building/decor layer and dense road-point marker layer are no longer called.
- The generated layout exports `berawaMapFeatures`: currently 5 beach polygons, 4 coastline paths, and 3 water shapes.
- Readable-ground/crisp-render presentation is complete without changing venue coordinates, `src/data/curatedVenues.ts`, `src/data/berawaLayout.ts`, or `data/osm/berawa.curated-coords.json`.
- Phaser now sizes the canvas to the viewport with device-pixel-ratio zoom, antialiasing enabled, and a DPR/zoom-aware baked static-map texture so the close map view is sharper on high-DPI screens.
- The runtime uses `src/data/scaledBerawaLayout.ts` to scale the generated OSM layout for presentation while leaving `src/data/berawaLayout.ts` untouched. `src/systems/map/WorldScale.ts` currently sets `WORLD_SCALE = 1.6`, so runtime world bounds are `3840 x 2720`.
- `src/systems/map/PlayerUnitScale.ts` is the single player-unit scale table. Current player unit is `34 x 43` after world scaling. Roads: main `3.6` units (`155 px`), secondary `2.2` (`95 px`), lane `1.6` (`69 px`). Buildings: normal `4.2 x 3.6`, wide `4.6 x 3.8`, quest-critical `5.0 x 4.0`, landmark `8.8 x 7.2`, beach landmark `9.2 x 5.8`, beach marker `5.0 x 3.8`.
- Character sprites are slightly reduced for proportion: avatars `0.84`, player/group bike `0.82`, traffic bike `0.88`. Camera zoom is now `1.86` on desktop/tablet-width viewports and `1.52` on narrow mobile viewports.
- Venue buildings are presentation-snapped beside their nearest road segment, then rendered axis-aligned for readability. De-overlap still starts with road-tangent row packing, with a final residual axis pass for dense cross-street clusters. Current automated layout check reports 41 placements, 0 overlaps, max tangent slide about 461.7 px, and max source-to-presentation displacement about 539 px.
- Roads render with higher-contrast walkable surfaces and explicit player-unit class widths; greenery recedes as a flatter base, building shadows are lighter, and venue labels show only near the player and are stack-limited.
- `src/systems/map/RoadPresentation.ts` separates rendered roads from placement roads. Runtime renders a decluttered 113-road skeleton while venue buildings can still snap to 839 non-footpath/local road segments for believable shopfront placement.
- A top-left minimap now renders on the UI layer with the simplified road skeleton, water/beach edge, camera viewport, player heading, and discovered venue dots. It respects `WorldState.mapDiscovery.revealAll` and discovered venue IDs.
- Traffic bikes now spawn on the road skeleton and follow real road polylines instead of three hardcoded straight lanes. Current traffic graph has 23 eligible main/secondary routes and 9 shared-node junctions; scooters can turn at junctions and respawn at route edges. Existing capped traffic-hit feedback remains intact.
- Coastline-aware soft water boundary feedback is now in `src/systems/map/WaterBoundary.ts`. It uses generated OSM beach/coastline/water features to nudge the player out of rendered sea/waterway areas with a toast, while leaving beach polygons walkable. The old broad rectangular `ocean-block` collision strip was removed.
- Static map geometry is generated once into a DPR/zoom-aware texture; camera zoom is tuned closer, and dynamic NPC/pickup/traffic/group/wanted sprites are culled off-camera.
- OSM/Nominatim/Overpass caches are committed under `data/osm/`, including the required raw Overpass extract at `data/osm/berawa.overpass.json`.
- The generated map is north-up with a uniform projection into the existing `2400 x 1700` world. Orientation sanity in the report confirms beach lower/SW, Nelayan north, and Tegal Sari east of the beach side.
- Map data attribution is present in README and the Phone Community tab: `Map data © OpenStreetMap contributors`.
- Map discovery hides area and venue detail until explored, with dev reveal-all support.
- Scooter/bike systems include rental, slow walking vs faster riding, stuck-bike state, group-helper requirement, capped traffic-hit consequences, hit feedback, and local-life redemption hooks. This stays environmental/community consequence, not combat.
- `WorldState.reputation` is now the canonical standing source: score, wanted level, bounty, victim flags, visible positive tags, hidden trust flags, redemption state, and history. Duplicate flat standing fields were removed from `PlayerEntityState`.
- Historical note: schema v4 introduced enlarged-world position scaling. Current saves use schema v11 at the original key `bali-life-rpg.berawa-finns.save.v1`; raw v1-v10 saves migrate forward without discarding money, quests, inventory, discovery, relationships, reputation, profile, portal, meters, clubs, arcs, opportunity feed, committed activities, or Act 0/1 hustle state.
- Phone UI has eight tabs: Map, Contacts, Quests, Calendar, Profile, Events, Venues, Community. Venues now have selectable detail pages with category, hours, discovery state, quality fields, associated NPCs/items/quests, and honest placeholder commerce/check-in status.
- `PlayerProfile.lifestyleTags` remains the local cross-app identity bridge; `remoteAccountId` stays `null`.
- New systems use `IntentDispatcher` where already introduced. Existing movement/shop/inventory/save flows remain direct.
- Starter quest branching moved into `src/systems/quests/QuestRegistry.ts` with objective handler shapes for `collect`, `deliver`, `visit`, `buy`, and `talk`.
- `GameScene` now delegates keyboard/joystick input to `InputController`, proximity resolution to `InteractionController`, and mobile/right-side HUD controls to `HudController`.
- NPC relationship memory now derives affinity tiers (`stranger`, `acquaintance`, `friendly`, `regular`, `trusted`). `ScriptedDialogueProvider` varies authored lines by tier and references memories. Contacts shows tier and known memories.
- Cooking/crafting is scaffolded only: `src/data/recipes.ts`, `src/systems/crafting/CraftingSystem.ts`, and one result item. No player-facing cooking UI/minigame yet.
- Shops, NPC routine stops, pickups, and player spawn now derive from generated venue nodes via `src/data/layoutLookup.ts` so they move with regenerated venue coordinates.

## Important Files

- Core types: `src/types.ts`
- First-hour proof: `src/systems/hustle/HustleMilestones.ts`, `src/systems/life/Act2Goals.ts`, `src/__tests__/firstHourProof.test.ts`
- On-field guidance: `src/systems/guidance/FieldObjective.ts`, `src/systems/guidance/FieldIndicators.ts`
- World-surfaced interactions: `src/systems/world/WorldScenes.ts`, `src/systems/dialogue/DialoguePresentation.ts`
- Cheap animation: `src/systems/animation/CharacterAnimations.ts`, `src/systems/animation/ScooterAnimation.ts`, `src/systems/animation/InteractionFlourishes.ts`
- NPC liveliness: `src/data/npcs.ts`, `src/data/ambientNpcs.ts`, `src/systems/npcs/NpcRoutineRoutes.ts`, `src/systems/npcs/NpcIdleBehavior.ts`, `src/systems/npcs/NpcProximityReactions.ts`
- Runtime world defaults: `src/systems/WorldState.ts`
- Save/load/migration: `src/systems/Persistence.ts`
- Network stub: `src/systems/NetworkAdapter.ts`
- Main scene and old gameplay wiring: `src/scenes/GameScene.ts`
- Quest registry: `src/systems/quests/QuestRegistry.ts`
- Controllers: `src/systems/input/InputController.ts`, `src/systems/interaction/InteractionController.ts`, `src/ui/hud/HudController.ts`
- Phone UI: `src/ui/phone/PhoneShell.ts`
- Social Phase B: `src/data/events.ts`, `src/data/groups.ts`, `src/data/relationshipArcs.ts`, `src/systems/events/EventScheduler.ts`, `src/systems/groups/GroupRegistry.ts`, `src/systems/relationships/RelationshipArcs.ts`
- Core tests: `src/__tests__/`
- Berawa layout data: `src/data/berawaLayout.ts`; runtime-scaled historical presentation copy: `src/data/scaledBerawaLayout.ts`; active authored street adapter: `src/data/authoredStreetLayout.ts`
- Active street template/data: `src/data/streetTemplates.ts`, `src/systems/map/StreetTemplate.ts`, `src/systems/map/StreetRenderer.ts`, `src/systems/map/TileStreetScale.ts`
- Map presentation/boundaries: `src/systems/map/WorldScale.ts`, `src/systems/map/PlayerUnitScale.ts`, `src/systems/map/VenuePresentation.ts`, `src/systems/map/WaterBoundary.ts`
- OSM generator: `scripts/generateLayoutFromOSM.ts`
- OSM cache/report: `data/osm/berawa.overpass.json`, `data/osm/berawa.anchors.json`, `data/osm/berawa.curated-coords.json`, `data/osm/berawa.curated-geocode.json`, `data/osm/berawa.layout-report.json`
- Curated venue catalog: `src/data/curatedVenues.ts`
- Berawa coordinate plan: `docs/BERAWA_MAP_PLAN.md`
- Decisions log: `DECISIONS.md`
- Agent operating contract: `AGENTS.md`
- North-star seams: `VISION.md`

## Phase Commits

- `2a0603a` - `feat: prove first-hour act spine`
- `c504782` - `feat: opportunities rendered as visible in-world scenes`
- `fd92608` - `feat: short in-world ambient lines replace many minor text boxes`
- `ff3b574` - `feat: events and club gatherings visible as world moments`
- `f1f2354` - `chore: reduce phone-as-primary-loop-driver, confirm field-first discovery`
- `1e31d92` - `feat: player walk cycle and facing`
- `9817dfc` - `feat: NPC walk cycle and animated idle/reaction behaviors`
- `ec415ad` - `feat: scooter lean and condition-aware idle motion`
- `eec9a9c` - `feat: talk pickup delivery activity animation flourishes`
- `29c2a0d` - `feat: consolidated always-visible objective readout`
- `dd89179` - `feat: generalized waypoint + directional cue for any objective`
- `0de4a81` - `feat: field-level indicators for NPCs and venues with something for you`
- `9cb9057` - `fix: Act 0 progressable without requiring the phone`
- `45c263d` - `feat: NPC daily routine routes`
- `07f8643` - `feat: per-NPC idle behavior at waypoints`
- `0226a4d` - `feat: NPC proximity awareness and affinity-aware reactions`
- `eb8933b` - `feat: ambient background population`
- `3dc6eaf` - `chore: baseline before consolidate+alive sprint`
- `12544ba` - `refactor: unify reputation under canonical ReputationState`
- `c704051` - `refactor: extract quest handlers and core controllers from GameScene`
- `bdc49d0` - `feat: phone venue detail pages`
- `58a707b` - `feat: tiered NPC relationships and affinity-aware dialogue`
- `b21a846` - `chore: reconcile Berawa map orientation in layout data`
- `c1ad154` - `chore: scaffold crafting data model (deferred)`
- `ba543b7` - `docs: update handoff state after consolidate sprint`
- `795e952` - `fix: harden save migration and touch HUD controls`
- `68679b2` - `feat: generate Berawa road layout from OpenStreetMap data`
- `749bbfb` - `feat: load OSM-generated Berawa layout in game`
- `ca73198` - `chore: align discovery/fog with OSM layout`
- `1219cf0` - `docs: OSM attribution and regenerated map plan`
- `2eb1f04` - `feat: resolve curated venue coordinates (osm-first cascade)`
- `b787716` - `feat: frame map bbox to curated venues and reproject`
- `f2c11a1` - `feat: render curated venues as simple buildings at real positions`
- `6b054bb` - `perf: bake static map and tune camera scale`
- `ac4dc1f` - `fix: remove dense road marker layer`
- `afd3c2a` - `feat: add OSM beach and coastline map features`
- `d0cf27b` - `feat: consistent player-anchored building scale`
- `15d4083` - `feat: snap venue buildings to roadside`
- `a805c55` - `feat: de-overlap roadside venues along the street`
- `a610964` - `feat: zoomed-in walkable camera`
- `2ea3bda` - `chore: road width-by-class and label declutter`
- `a285c9b` - `feat: add coastline-aware water boundary feedback`
- `6226928` - `feat: pokemon-standard player-unit scale`
- `98111e9` - `feat: road hierarchy and declutter for readability`
- `d7bd624` - `feat: top-left orientation minimap`
- `d38275a` - `feat: road-following traffic paths`
- `acea713` - `fix: render at device pixel ratio and crisp baked map`
- `3fa4c19` - `feat: high-contrast walkable ground layer`
- `f0769e7` - `feat: axis-align venue buildings for readability`
- `666b598` - `feat: enlarge world space for walkable spacing`
- `f3d723d` - `feat: pokemon building-to-player proportion`
- `f7eab55` - `docs: record readable ground presentation pass`
- `8c267d9` - `feat: tile grid foundation and original tileset`
- `253c478` - `feat: data-driven street template and renderer`
- `d722157` - `feat: populate Jl Pantai Berawa from real venue order`
- `014b6ae` - `feat: beach-and-water street terminus`
- `5dfe673` - `feat: wire shops npcs quests traffic discovery to street`
- `84d93a1` - `docs: record core daily life loop`
- `c7ace83` - `feat: first-class events with calendar and attendance`
- `1a1c4ea` - `feat: first-class clubs with joinable recurring events`
- `4b9bf65` - `feat: relationship arcs for key NPCs`
- `43177e9` - `feat: integrate social compounding goals`
- `98c878e` - `chore: add vitest test runner`
- `76a820c` - `test: save migration v1-v8 round trips`
- `18513f8` - `test: daily loop meters time activities sleep`
- `1d937e3` - `test: events clubs relationship arcs`
- `3147360` - `test: quests goals reputation interaction`
- `ca788f2` - `test: authored street layout invariants`
- `70a4929` - `feat: dynamic opportunity engine and templates`
- `8356528` - `feat: active phone feed and opportunity buzz`
- `7cc95d0` - `feat: live opportunity markers on map and minimap`
- `beccf37` - `feat: opportunity stakes and venue resolution`
- `997a9f2` - `feat: persist opportunities with tests`
- `241cf5d` - `fix: minimap transparency + auto-hide under overlays`
- `f8fc528` - `fix: dialogue panel fully on-screen and clear of HUD`
- `9dde308` - `refactor: unified overlay-open state for HUD/minimap visibility`
- `633a40c` - `feat: activity rewards + persistence + opportunity reuse`
- `866522c` - `feat: reusable activity minigame framework`
- `58c936d` - `feat: per-type activity minigames`
- `c4efb02` - `chore: balance activity feel`
- `6b74cb2` - `docs: add progression spine and Act 3 business design`
- `4f9c0c3` - `feat: add Act 0 hustle delivery loop`
- `623d5fb` - `feat: add repeat delivery hustle board`
- `08102c8` - `feat: add hustle rent and scooter upgrades`
- `b04901a` - `feat: surface Act 1 hustle guidance`
- `3cb1e0f` - `test: harden Act 0 progression ordering`
- `1a9771d` - `feat: add Act 1 hustle goals`
- `3c7da92` - `chore: add hustle godmode shortcuts`
- `f408704` - `feat: add daily hustle board phone nudge`
- `cd2d504` - `fix: infer Act 0 completion for progressed saves`
- `c217fe8` - `fix: gate phone feed during Act 0`
- `25e9a72` - `feat: add Act 0 guide markers`
- `677a1b5` - `fix: align scene absolute time for delivery timers`
- `916b335` - `feat: anchor Act 0 sleep at home kos`
- `4a3f23d` - `feat: add delivery board conditions`
- `924c641` - `feat: surface Act 1 rent pressure`
- `17310b9` - `docs: record Act 0 hustle refinements`
- `33fa286` - `feat: announce Act 1 move-out readiness`
- `cc4ac36` - `docs: record Act 1 milestone clarity`
- `1325898` - `feat: add scooter repair pressure to hustle loop`
- `541e02d` - `feat: bridge Act 1 hustle into Act 2 social`
- `f39c25d` - `fix: keep hustle board actions inside phone panel`
- `634f316` - `docs: record scooter maintenance and Act 2 bridge`
- `21b5cda` - `feat: show scooter condition on hustle board`
- `96cbfb3` - `feat: add mid-tier Act 1 delivery jobs`
- `def647a` - `docs: record expanded Act 1 delivery board`
- `04d3089` - `feat: guide Act 2 social handoff`
- `c916f60` - `docs: record Act 2 social handoff`
- `bad42c4` - `feat: surface Act 2 social goals`
- `93826a8` - `feat: add Act 2 club-gated opportunity`
- `efbeb9d` - `feat: mirror Act 0 objective in phone quests`

## Current Verification

- Authored tile street phases 1-5 each passed `npm run build` before commit.
- Phase B social phases 1-4 each passed `npm run build` before commit.
- Phase B smoke checks passed: Berawa Beach Run is active at Berawa Beach on the expected day/time; joining Berawa Run Crew stores `world.life.joinedClubIds` and reveals its recurring member event; Ari's first relationship beat completes from affinity and persists to `world.life.relationshipArcProgress`; `plug_in`, `find_your_crew`, and `deepen_a_bond` complete from event/club/arc state.
- Core test suite is now installed with Vitest and runs through `npm test`.
- Current suite result: 110 passing tests, 0 skipped across save migration, daily loop, sleep recovery, social event participation, social layer, opportunities, quests/goals/reputation/interaction, authored street layout invariants, Act 0 delivery/hustle state, Act 0 home sleep gating, Act 1 delivery-board gating and conditions, scooter wear/repair gating, first-rent-gated move-out readiness, local rent/scooter/rent-pressure economy actions, Act 1 hustle goals and next-step guidance, Act 2 social goals/next-step/payoff guidance, station-to-crew bridges, station-compatible Settling In goals, Act 3 readiness hooks, first-hour proof path, liveliness/world-scene read models, and the daily Hustle Board/rent/Act 2 invite phone nudges.
- Opportunity tests cover time/reputation/club/affinity eligibility gates, deterministic 2-4 live pool maintenance, expiry/missed tracking, accept/resolve rewards, chain spawning, relationship cooling from missed social pings, and v8-to-v9 persistence of live/completed/missed/feed state.
- `npm run build` passed after every core-test-suite phase.
- The test suite fixed one unambiguous data-seam bug: `finns_beach_club` is now present in `VenueRegistry` so the FINNS Sunset Social event host/location resolves.
- Current authored street geometry check reports 32 visible/interactable venue slots, 32 authored venue nodes, 0 overlaps, and no duplicate venue IDs.
- Shopfront detail build passed; signboards/props are presentation-only and do not alter venue IDs, slot placement, quests, shops, or coordinates.
- Storefront interaction build passed; shops still use shop panels, while non-shop venue interactions sit below NPC/activity/shop priority in `InteractionController`.
- Active street constants: `TILE_SIZE = 32`, world `120 x 85` tiles (`3840 x 2720` px), road width `6` tiles, sidewalks `2` tiles each side, camera zoom `1.6` desktop / `1.28` mobile.
- `src/data/curatedVenues.ts`, `src/data/berawaLayout.ts`, and `data/osm/berawa.curated-coords.json` remain intentionally unchanged by the authored-street sprint.
- Gameplay-critical authored positions resolved in local checks: player spawn near Milk & Madu, Canggu Station stub visible near the inland end, BAKED/Milk & Madu/scooter rental/beach anchors all resolve through `layoutLookup.ts`.
- `npm run build` passed after every phase above and after the final verification fixes.
- `npm run generate:layout` runs from the committed cache and rewrites `src/data/berawaLayout.ts`, `data/osm/berawa.curated-coords.json`, and `data/osm/berawa.layout-report.json`.
- Cache-only generator rerun is deterministic; SHA-256 hashes for `src/data/berawaLayout.ts` and `data/osm/berawa.layout-report.json` matched before/after rerun.
- OSM report currently shows 934 road paths, 4,346 shared OSM road nodes, 4,501 road segments, 788 POIs, and 12 terrain features after filtering the larger cache to the curated venue frame.
- Curated venue coordinate matching: 23 OSM POI matches, 0 Nominatim matches, 15 flagged estimates, and 3 flagged fallbacks. All 41 `shouldRender` venues have generated building nodes.
- Runtime source check found OSM/Nominatim/Overpass URLs and `fetch` only in `scripts/generateLayoutFromOSM.ts`, not game runtime code.
- Walkable/readable presentation source changes do not touch `src/data/curatedVenues.ts`, `src/data/berawaLayout.ts`, or `data/osm/berawa.curated-coords.json`; OSM/generated source coordinates remain unchanged.
- Automated venue presentation check after the readable-ground/crisp-render pass reports 41 venue placements, 0 overlaps, main road width `155`, secondary `95`, lane `69`, `WORLD_SCALE = 1.6`, player unit `34 x 43`, camera `1.86 / 1.52`, max tangent slide about `461.7`, and max source-to-presentation move about `539`.
- Final readable-ground/crisp-render builds passed with `npm run build` after Phase 4 and Phase 5.
- Historical in-app browser smoke for the readable-ground/crisp-render pass loaded `http://127.0.0.1:5173/`, found the Phaser canvas, reported the then-current schema v4 debug state, captured no console errors, verified `P` opens Phone and `ESC` returns to world, and verified a mobile `390 x 844` viewport shows touch controls and the on-screen `PHONE` button opens the phone. Current schema is v11.
- In-app browser smoke loaded `http://127.0.0.1:5173/?verify=walkable-presentation`, found the Phaser canvas, reported no console errors, and verified `P` opens Phone while `ESC` returns to world.
- Water-boundary geometry spot checks passed: a southwest sea sample resolves back to shore, a visible beach polygon sample stays walkable, an inland road sample is untouched, and the corrected shoreline point is stable on the next check.
- Final water-boundary build passed with `npm run build`.
- In-app browser smoke loaded `http://127.0.0.1:5173/?verify=water-boundary`, found the Phaser canvas, reported no console errors, and verified `P` opens Phone while `ESC` returns to world.
- Final Pokémon-scale/minimap/traffic build passed with `npm run build`.
- Presentation geometry check after the original Pokémon-scale pass reported 113 rendered road paths, 839 venue-snap road paths, 40 non-beach building placements, and 0 building overlaps; the current readable-ground/crisp-render pass supersedes the old size numbers with the `WORLD_SCALE = 1.6` presentation layer noted above.
- Traffic graph check reports 23 eligible traffic routes and 9 shared-node junctions from the rendered road skeleton.
- Dev server is serving `http://127.0.0.1:5173/`.
- In-app browser smoke after the minimap phase loaded the Phaser canvas at `http://127.0.0.1:5173/` with no captured console errors. During traffic verification, the in-app browser retained one stale pre-restart error log from an old Vite module timestamp; the restarted dev server serves the current `GameScene.ts` with the traffic helper present. Screenshot capture in the in-app browser timed out, so live traffic feel remains human-verification pending.
- Source grep confirms no code path reads removed flat `playerState.reputation`, `playerState.wantedLevel`, `playerState.bounty`, `playerState.flaggedByVictims`, or `playerState.lastFlagReason` fields.
- v1/v2 save migration maps old standing fields into schema v3 `WorldState.reputation` and strips legacy flat standing keys from the hydrated local player.
- Quest code compiles and both starter quests complete through `QuestRegistry` in browser automation.
- Phone venue details compile and read from `VenueRegistry` plus discovery state.
- Contacts tab compiles with relationship affinity tiers and memory summaries.
- Crafting scaffold compiles without adding persisted state.
- The in-app browser connector still fails in this environment with `codex/sandbox-state-meta: missing field sandboxPolicy`, so runtime verification used local headless Chrome DevTools fallback against `http://127.0.0.1:5173/`.
- Final fallback browser verification passed:
  - Map loads with no runtime exceptions.
  - OSM-generated spawn lands in the generated cafe/FINNS cluster.
  - `P` opens Phone and `ESC` closes it.
  - All six HUD buttons respond to mouse automation: `PHONE`, `BAG`, `SOC`, `SAVE`, `BIKE`, `ACT`.
  - All six HUD buttons respond to mobile touch emulation after the touch HUD fix: `PHONE`, `BAG`, `SOC`, `SAVE`, `BIKE`, `ACT`.
  - Raw v1 save migrates through the current schema chain, preserves money, moves legacy standing into `WorldState.reputation`, removes flat standing keys from the player, and now lands on schema v11 with runtime x/y positions scaled into the enlarged world when needed.
  - Ibu Sari and Kadek starter quests complete via `QuestRegistry`, award reputation tags/score, and record relationship memories.
  - Milk & Madu shop opens at the generated venue position.
  - Initial discovery includes cafe/FINNS cluster and excludes beach until approached.
  - No runtime HTTP requests to OSM/Nominatim/Overpass were observed; no external HTTP requests were observed.
  - F2 opens development godmode.
  - Only console error was a harmless missing-resource 404, likely favicon.

## Known Caveats

- `GameScene.ts` is still large. Rendering and broader simulation remain there for a later behavior-preserving split.
- Phone UI is functional but still a shell; it is not a polished production phone app.
- Godmode is simple and development-only.
- Core daily loop is now playable but not fully tuned by human feel; activity deltas are intentionally conservative and should be adjusted after a few real-device day runs.
- Phase B social content is dev-authored only. Players can attend events and join clubs, but cannot create/host events, create clubs, author promotions, hatch housing groups, or use real-world integrations yet.
- Relationship arc payoffs are local hooks/text plus small state changes. Discount and housing-lead payoffs are intentionally teasers, not live commerce or housing systems.
- No automated tests are currently skipped. The former sleep-recovery, event-participation, and generic quest-objective skips were resolved by extracting pure seams out of `GameScene` / `QuestRegistry`.
- Act 0 has pure delivery/progression/home-marker tests, but still needs a real-device playthrough for pacing feel: whether the first scooter, BAKED pickup, villa dropoff, meal/coffee, and ride-home-to-sleep rhythm feels clear and not too linear.
- `da_romeo_restaurant` remains absent from the authored street and unrendered; this is a known placement conflict for the repo owner to resolve later.
- Map discovery now has a compact minimap, but it is still a lightweight orientation aid rather than a full interactive map.
- The active map is one authored street only. Non-Pantai venues are deferred except for quest-critical Raya Semat stubs (`baked_berawa`, `canggu_station`) and the separate `berawa_beach` anchor.
- The older OSM/scaled renderer code still exists as dormant fallback/debt in `GameScene.ts` and map modules. It is no longer the active playable surface on `feat/authored-tile-street`.
- Historical OSM road/coastline/building presentation remains useful reference, but the active street now uses authored tile road/beach/water features. Water boundaries are still soft feedback, not full physics collision; a human should judge the beach/water feel in live play.
- Eighteen curated coordinates still need manual review because they resolved via flagged estimate/fallback rather than OSM/Nominatim. See `data/osm/berawa.curated-coords.json`.
- Venue rating/review fields are data-only. There is no Google Places API, scraping, live verification, or live venue ranking.
- Multiplayer is intentionally locked and inert.
- Venue commerce/check-in/booking/delivery fields are placeholders only.
- Offline activities are explicitly `simulated`.
- Crafting is data/system scaffold only; it is not exposed in Phone, shops, NPC interactions, or godmode.
- The repo has local commits but no configured remote, so a GitHub PR cannot be opened from this workspace until a remote/repo is provided.
- Still worth checking manually by feel: traffic-hit shake/splash timing, real Mac trackpad/mouse clicks on the DOM HUD, real-phone touch layout, and whether the authored order reads like Berawa when driving around.

## Next Move

1. Finish and tune the Act 0 / Act 1 spine:
   - Play through the guided 新手村 first day with Ibu Sari: kos start, walk to Ibu Sari, borrowed scooter, first BAKED delivery, first meal/coffee, sleep.
   - Tune the delivery/gig loop by feel: condition frequency/copy, payout/time balance, driver-rating progression, rent reminders, scooter upgrade timing, and whether the first few repeat runs feel varied enough.
   - Use the existing opportunity engine as the source of rush jobs, weather-ish curveballs, fragile-cargo runs, and better gigs unlocked by rating/reputation.

2. Reframe the existing social layer as Act 2:
   - Events, clubs, relationship arcs, and the Settling In goals should read as the payoff after the player has basic income and breathing room.
   - Use Ari's current Act 2 invite plus the Berawa Beach / Satu-Satu guide markers as the first bridge into clubs and recurring events.
   - Keep adding small club/reputation-gated opportunities that make social investment pay off without building Act 3 business yet.
   - Social standing should unlock premium gigs/perks and eventually crew support for Act 3.

3. Keep Act 3 as hooks only for now:
   - Do not build the business-management sim until Act 0/1/2 feel fun.
   - Preserve hooks for future business ownership: crew candidates from relationship arcs, player-owned venue state, rating/review compatibility, and villa/bike/business win-condition flags.

4. Do a human play-feel pass:
   - Play two or three days with the Phase B social layer: attend a public event, join a club, watch the club-only event appear, and talk to Ari/Made/Ibu Sari after building affinity.
   - Confirm the social loop compounds in a fun way: events introduce people, relationships unlock invites/perks, clubs create recurring calendar reasons, and the chores-vs-social tension remains meaningful.
   - Play one full day with the new meters: work, eat/coffee, beach, social/party, then sleep. Confirm the scarcity feels meaningful rather than punishing.
   - At several venues, press `E` and confirm the activity menu reads clearly; at shops, confirm `Open buy/sell` still opens the old shop panel.
   - Use Phone > Quests to track the Settling In goals and Phone > Contacts to inspect NPC tier/perk changes after activities.
   - Clear local save or start a fresh run, then verify the authored tile street loads instead of the projected OSM tangle.
   - Walk the full Jl. Pantai Berawa strip from inland to beach and judge whether the tile grid is readable, crisp, and comfortably scaled.
   - Confirm BAKED. Berawa and Canggu Station are acceptable as temporary Raya Semat side-street stubs and that Kadek/Ibu Sari remain easy to interact with.
   - Trigger traffic-bike collision and judge knockback/shake/splash timing.
   - Click all six fixed DOM HUD buttons with the real Mac trackpad/mouse.
   - Try the mobile HUD on an actual phone, especially tall screens.
   - Drive along the authored road and judge whether scooter travel matters at the tile scale.
   - Walk into the rendered surf/water edges and judge whether the soft boundary nudge feels natural.
   - Open Phone > Venues > Details and inspect discovery filtering plus associated NPCs/items/quests visually.
   - Build NPC affinity through memory and confirm Contacts/dialogue feel readable.

5. Continue decomposition carefully:
   - Extract world/render drawing only if behavior can stay identical.
   - Add focused tests around `QuestRegistry`, `Persistence`, `InteractionController`, and `ReputationState`.

6. Continue Berawa credibility:
   - Add a proper Raya Semat authored street template, then remove the temporary BAKED/Canggu Station stubs.
   - Use `pantaiBerawaCrossStreets` as the source for upcoming cross-street templates: Subak Sari, Pemelisan Agung, Taman Tamora, Subak Canggu, Tegal Sari, and Raya Semat.
   - Resolve flagged street-placement conflicts before treating the authored order as final truth: Bakersfield, BAKED, and Da Romeo.
   - Manually verify flagged coordinates in `data/osm/berawa.curated-coords.json` only as sequencing/reference data.
   - Tune `TileStreetScale`, traffic density/speed, and label reveal distances by phone/trackpad feel before adding more streets.
   - Curate a small verified venue file before adding more real-world-name candidates.
   - Add a compact map UI only after discovery state is stable on the authored street.

7. Expose crafting later:
   - Add a small Phone/Home/godmode action for `CraftingSystem`.
   - Keep it a routine/social system, not a combat or heavy minigame.

8. Add a remote and open PR when repository access exists.

## PR-Ready Summary

Title:

```text
Authored Jl. Pantai Berawa tile street
```

Summary:

```text
- Add an authored `32px` tile street foundation with original generated tiles, reusable `StreetTemplate` data, and `StreetRenderer`.
- Populate `Jl. Pantai Berawa` from the explicit Gemini/Google-Maps walking order while leaving curated/source coordinate files untouched.
- Add a clean grass -> sand -> water beach terminus and keep OSM/generated coordinates as sequencing/reference data, not the active playable surface.
- Switch runtime layout lookups, traffic, minimap, discovery, shops, NPC routines, pickups, and spawn to `src/data/authoredStreetLayout.ts`.
- Preserve BAKED. Berawa and Canggu Station as temporary quest-critical Raya Semat stubs until a proper Raya Semat template exists.
- Update STATE.md and DECISIONS.md.
```

Test notes:

```text
- npm run build passed after every core-daily-loop phase.
- Schema v6 smoke: fresh world has Energy 78, Wellbeing 66, Focus 42, Social 36, and Money Rp 70; legacy focus/social mirrors sync from meters.
- Activity-engine smoke: work at Milk & Madu earns money and advances time; beach activity blocks same-day repeat; venue activities persist in world.life.activityHistory.
- Balance smoke: two work sessions are possible but a third straight work session fails on Energy; a work/coffee/food/beach daytime route leaves the player short of party money.
- Settling In smoke: with recovery choices and repeated activity, all five goals complete and set settledIn true.
- npm run build passed after each authored-street phase.
- Geometry check: 29 main-strip ordered venues + BAKED/Canggu stubs + Berawa Beach anchor, 0 overlaps, no duplicate venue IDs.
- HUD bounds check: all six DOM buttons and the DOM minimap are within bounds at 1280x800, 1440x900, 1728x1117, 2560x1440, 1024x768, and 390x844; one click fired per action at each size.
- Scale check: TILE_SIZE 32, world 120 x 85 tiles / 3840 x 2720 px, road width 6 tiles, camera 1.6 desktop / 1.28 mobile.
- Diff check: no curated venue, generated coordinate, or curated-coordinate cache files changed.
- Browser smoke still pending for this branch; final visual/readability feel needs human judgment on the real device.
```

## Do Not Do Next

- Do not implement real multiplayer yet.
- Do not add backend/auth/database.
- Do not add AI/LLM calls.
- Do not claim real venue integrations, coupons, bookings, payments, delivery, or check-ins.
- Do not add runtime map network calls; OSM services are generator-only.
- Do not turn this into a combat RPG.
- Do not refactor all old gameplay flows into intents yet.

## 2026-06-23 - Activities Are Committed Moments

Branch `feat/activities-real` makes the Hybrid approach active: every venue activity now enters a committed "doing this" state instead of silently applying meter deltas while the player keeps walking. The player is placed at the venue, movement is constrained by the existing non-world mode path, an in-world-time progress overlay appears, and completion resolves through the existing activity/opportunity reward systems. `ESC` or the overlay Cancel button exits early with no reward.

Committed activity runtime state is persisted as `world.activeActivity`; save schema is now v10. Older saves migrate with `activeActivity: null`, while a current save can round-trip an in-progress committed activity or opportunity without wiping money, inventory, quests, relationships, reputation, discovery, meters, clubs, arcs, or opportunity state.

Opportunity pings no longer resolve instantly from the venue menu. Accepted venue opportunities now reuse the same committed activity flow, then call the existing `resolveOpportunity` path at completion. This gives gigs/help-outs/social pings the same legible start -> progress -> reward beat as regular venue activities.

Hybrid minigames are active on selected high-impact types:

- Work/gig/help-out: timing-window tap.
- Surf/beach: balance-window tap.
- Social/hangout/night-out: small authored choice beat.

The minigame framework is pure and tested in `src/systems/minigames/ActivityMinigames.ts`. Scores are `0..1`; no input resolves to a steady default score, and performance scales only upside rewards through a conservative `0.72x..1.28x` multiplier. Costs and negative meter consequences remain unscaled so minigames do not erase trade-offs.

Verification:

- Historical activity-real verification: `npm test -- --run` was 8 files passed, 35 tests passed, with three intentional skips at that point. Current verification is tracked at the top of this file.
- `npm run build`: passed.
- New coverage verifies timing scoring, choice scoring, activity reward scaling, opportunity reward scaling, and v10 active-activity persistence.

Still needs human feel:

- Whether the progress duration feels satisfying rather than too fast/slow.
- Whether the timing/balance targets feel fun on real phone touch.
- Whether social choices are readable enough in the committed overlay.
- Whether the reward multiplier feels noticeable without becoming exploitable.

## 2026-07-01 - Playtest Bug-Fix Pass Closed Six Confirmed Issues

Branch `fix/playtest-bugs` is a real-playtest regression pass. It preserves the hustle loop, social layer, opportunity engine, map, scooter upgrades/condition, save/load, and current tests while fixing six external feedback items before moving into the design follow-up.

Root causes found:

- Viewport clipping came from mixed UI ownership. HUD/minimap/dialogue/progress overlays were DOM/bounds-safe, but activity menus still used Phaser canvas panels and could collide with the DOM HUD or clip rows. Activity choice/detail panels now route through a shared DOM activity overlay with `data-ui-surface="activity-panel"`, scrollable content, and overlay-open HUD hiding.
- The bike-stuck-in-sand mechanic was mechanically intact but too punitive for this stage. It is feature-flagged off with `BIKE_TERRAIN_STUCK_ENABLED = false`; scooter condition, upgrades, delivery gating, traffic damage, and recovery hooks remain.
- Pickup interactions fell through to the same priority bucket as venues. `InteractionController` now puts NPCs, pickups, deliveries, and offenders in the high-specificity group before activities, shops, and broad venues, with a regression test for a coconut near Berawa Beach.
- The unexplained avatar/TIP pop-up was a world-scene rumor cue from `WorldScenes`. Rumor cues now say `RUMOR`, and opportunity scene labels are clickable/tappable to track the opportunity instead of being inert mystery objects.

Viewport proof was collected in a throwaway real Chrome/CDP session against the local Vite app. A temporary dev-only game handle was used only during measurement and removed before committing. All visible measured surfaces were inside `window.innerWidth/innerHeight`:

```text
1280x800:
  HUD/minimap: minimap 16,170-298,370; meters 1094,14-1266,122; buttons 1126,570-1266,786.
  Dialogue: 260,437-1020,544.
  Venue activity panel: 260,280-1020,520.
  Legacy activity detail panel: 260,180-1020,620.

1440x900:
  HUD/minimap: minimap 16,170-298,370; meters 1254,14-1426,122; buttons 1286,670-1426,886.
  Dialogue: 340,513-1100,620.
  Venue activity panel: 340,330-1100,570.
  Legacy activity detail panel: 340,230-1100,670.

1728x1117:
  HUD/minimap: minimap 16,170-298,370; meters 1542,14-1714,122; buttons 1574,887-1714,1103.
  Dialogue: 484,730-1244,837.
  Venue activity panel: 484,438-1244,679.
  Legacy activity detail panel: 484,339-1244,778.

2560x1440:
  HUD/minimap: minimap 16,170-298,370; meters 2374,14-2546,122; buttons 2406,1210-2546,1426.
  Dialogue: 900,1053-1660,1160.
  Venue activity panel: 900,600-1660,840.
  Legacy activity detail panel: 900,500-1660,940.

1024x768:
  HUD/minimap: minimap 16,170-254,339; meters 838,14-1010,122; buttons 870,538-1010,754.
  Dialogue: 132,415-892,522.
  Venue activity panel: 132,264-892,504.
  Legacy activity detail panel: 132,164-892,604.

390x844:
  HUD/minimap: minimap 16,170-122,246; meters 236,10-380,108; buttons 250,634-380,834.
  Dialogue: 10,499-380,618.
  Venue activity panel: 10,267-380,577.
  Legacy activity detail panel: 10,124-380,720.
```

Verification:

- `npm run build`: passed.
- `npm test`: 15 files passed; 96 tests passed, with three intentional skips at that point. Current verification is tracked at the top of this file.
- Browser/CDP bounds checks above: passed for HUD, minimap, dialogue, venue activity panel, and legacy activity detail panel at all six requested viewport sizes.
- Human-only still worth checking on the device: ride near beach/sand in a normal save; pick up coconuts near Berawa Beach; walk up to a rumor/opportunity scene and confirm `RUMOR`/tracking reads clearly.

## 2026-07-01 - Gameplay Stations Make Existing Locations Mechanically Distinct

Branch `feat/gameplay-stations` turns six existing anchors into data-driven gameplay stations instead of generic activity menus:

- Cafe focus table: Satu-Satu Coffee, Milk & Madu, Nude Cafe, and BAKED.
- Beach reset: Berawa Beach.
- Beach club night: FINNS Beach Club.
- Warung meal: Ulekan Berawa.
- Coworking sprint: Tropical Nomad Coworking Space and Outpost Canggu Coworking.
- Cheap kos room: the existing `cheap_kos` home base.

The implementation reuses the existing activity engine, committed-activity flow, minigame hooks, meters, clock, reputation, affinity bumps, inventory rewards, and save/load. No buildings, backend, AI/network, combat, real commerce, or large stat system were added.

Station authoring is now split across:

- `src/data/stationLoops.ts` for station fantasy, venue IDs, reward shape, risk/tradeoff, and best time of day.
- `src/data/activities.ts` for station activity rows using `stationId`, exact `venueIds`, preview/action copy, time-of-day modifiers, and optional next-morning effects.
- `src/data/stationVisuals.ts` for distinct station signage, palette, and prop cues.

Runtime behavior:

- Exact station activities sort before generic category fallback activities.
- Menus show station choices first, then everyday fallback rows where useful.
- Main station actions use the existing minigame overlay where appropriate.
- Time-of-day rhythm is visible in the station menu and affects positive meter/money outcomes.
- FINNS big-night fallout queues `world.life.pendingMorningPenalties`, applied on sleep at the kos.
- The old sleep-anywhere fallback is tightened so normal sleep belongs to the home station.

Verification:

- `npm run build`: passed during the station phases.
- Focused tests passed for station choice surfacing, station minigames, time-of-day rhythm, and next-morning penalties.
- Full-suite verification should remain the closure gate after any final balance adjustment.
