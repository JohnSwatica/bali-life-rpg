# Claude Assessment Brief - Bali Life RPG

Last updated: 2026-06-30  
Project path: `/Users/z/包包/bali-life-rpg`  
Branch: `feat/act0-hustle-loop`  
Latest commits at handoff:

- `130e5a6` - `feat: surface three-act milestone spine`
- `6a3fda0` - `feat: clarify Act 1 hustle next steps`
- `7d79e76` - `docs: harden new-tab project handoff`

Verification:

- `npm test -- --run`: 53 passing, 3 intentionally skipped
- `npm run build`: passes
- Browser smoke: app loads at the local dev server, canvases render, six HUD buttons render, Phone opens, no Vite error overlay. Only known browser noise is a harmless missing `favicon.ico`.

## 1. Executive Summary

Bali Life RPG is a local single-player 2D browser life sim/social RPG built with Phaser 3, TypeScript, and Vite. The game is set in a compressed Berawa/Canggu neighborhood around Jl. Pantai Berawa and FINNS. It is not a combat RPG and not yet a multiplayer/commerce app.

The current playable direction is:

```text
hustle -> people -> build -> community
```

The project has moved from a broad neighborhood prototype into a clearer act-based progression spine:

1. Act 0 - Arrival / 新手村 tutorial
2. Act 1 - The Hustle
3. Act 2 - Finding Your People
4. Act 3 - Building Something
5. Act 4 - The Good Life
6. Act 5 - The Open World

Right now, Acts 0-2 exist as local playable systems and read models. Act 3 is designed and now has readiness hooks, but the actual business-management sim is intentionally not implemented yet. That is the main product boundary requiring CEO approval.

My recommendation: do not expand scope yet. The next steering move should be a human play-feel pass and tuning sprint for Acts 0-2, then a tightly scoped Act 3 "stock-and-serve" prototype only after the first-hour loop feels good.

## 2. Product Premise

The player lands in Bali with little money, a cheap room, and no safety net. Ibu Sari helps them survive the first day. They hustle on a beat-up scooter, build delivery reliability, find real friends through events and clubs, and eventually use that social trust to build their own warung/cafe, save for a villa, and upgrade to a real bike.

The fantasy is grounded aspiration with affectionate Canggu satire:

- No trust fund.
- No remote salary waiting.
- Every rupiah has to be earned.
- Friends become the reason to stay.
- Business ownership is the dream, not just a money sink.
- Multiplayer/community unlocks only after the solo life is built.

Locked product calls from current docs:

- Mentor: Ibu Sari.
- Tone: grounded aspiration with gentle satire.
- Romance: friendship-first for now.
- Solo win condition: all three of villa + business + bike.
- Pacing target: roughly two hours per act.
- Act 3 first implementation should be light stock-and-serve management, not a deep tycoon sim yet.

## 3. What The Game Has Today

### Core Runtime

- Phaser 3 browser game using TypeScript and Vite.
- Local single-player world state.
- Save/load through `localStorage`.
- Current save schema: `CURRENT_SCHEMA_VERSION = 11`.
- Save key: `bali-life-rpg.berawa-finns.save.v1`.
- Migration preserves older runtime data: money, quests, inventory, relationships, reputation, discovery, profile, portal, meters, clubs, arcs, opportunities, active activities, and Act 0/1 hustle state.

### Map And World

- Active playable map is an authored `32px` tile street for Jl. Pantai Berawa via `src/data/authoredStreetLayout.ts`.
- OSM/generated data remains committed for sequencing/reference only.
- Runtime does not make OSM/Nominatim/Overpass network calls.
- Active map includes:
  - Jl. Pantai Berawa vertical street.
  - Beach/sand/water terminus.
  - Shopfront signboards and props.
  - Quest-critical Raya Semat stubs for BAKED and Canggu Station.
  - Berawa Beach anchor.
  - Compact minimap.
  - Ambient scooter traffic.
  - Soft water boundary feedback.

Known map caveat: the world is one authored street only. BAKED and Canggu Station are temporary side-street stubs until a proper Raya Semat template exists.

### Player And Controls

- Keyboard controls:
  - Move: WASD/arrows
  - Interact: E
  - Phone: P
  - Bag: I
  - Bike: B
  - Save: F5
  - Clear local save: F9
  - Close panels: ESC
- Fixed DOM HUD buttons:
  - PHONE
  - SAVE
  - SOC
  - BIKE
  - BAG
  - ACT
- Touch/mobile HUD exists and has had bounds checks.

### Daily Life Systems

- Four canonical meters on `WorldState.meters`:
  - Energy
  - Wellbeing
  - Focus
  - Social
- Activities are data-driven by venue category, hours, money, energy, repeatability, time cost, meter deltas, item rewards, reputation hooks, and activity history.
- Venue interactions use an activity menu.
- Shops preserve the old buy/sell panel as `Open buy/sell`.
- Sleep exists:
  - Advances to next morning.
  - Restores Energy.
  - Improves Wellbeing/Focus.
  - Saves locally.

### Committed Activities And Minigames

- Activities and accepted opportunities can enter committed state:
  - Player is held at venue.
  - Progress overlay appears.
  - Completion routes through reward systems.
  - ESC/cancel exits early with no reward.
- Minigames are optional performance layers:
  - Work/gig/help-out: timing tap.
  - Surf/beach: balance tap.
  - Social/hangout/night-out: authored choice.
- Performance only scales positive rewards conservatively; costs and negative deltas remain.

### Phone UI

Phone tabs:

- Feed
- Map
- Contacts
- Quests
- Calendar
- Profile
- Events
- Venues
- Community

Phone currently supports:

- Live opportunity feed.
- Hustle Board.
- Delivery offer accept actions.
- Rent payment.
- Scooter repair.
- Scooter upgrade.
- Opportunity tracking.
- Contacts with relationship memory and affinity tiers.
- Quests and milestone surfaces for Acts 0-3.
- Calendar/events.
- Venue details.
- Community/club join surface.

Caveat: Phone is functional but not a polished production phone app.

## 4. Act Progression State

### Act 0 - Arrival / 新手村

Goal: teach the core verbs through a guided first day.

Implemented:

- Start at dusk near cheap kos / Canggu Station side.
- Ibu Sari first-day anchor.
- Borrowed beat-up scooter.
- First scripted BAKED delivery:
  - accept
  - pickup
  - dropoff
  - payout
  - first driver rating
- Meal/coffee step after first delivery.
- Sleep step anchored to `Cheap Kos Room`.
- Act 0 guide markers on map/minimap.
- Act 0 current objective appears in HUD and Phone > Quests.
- Phone feed/opportunity noise is gated off during Act 0 so the tutorial is not interrupted.

Current state: code complete enough for testing, but not yet proven by human first-device pacing.

### Act 1 - The Hustle

Goal: make the player survive rent, scooter upkeep, delivery work, and rating pressure until they have stable footing.

Implemented:

- Local hustle state under `world.life.hustle`.
- Delivery board in Phone > Feed.
- Repeatable delivery jobs:
  - Milk & Madu brunch bag
  - Satu-Satu invoice pouch
  - Nude cold bag run
  - Beach wristband pouch
  - FINNS linen bundle
- Delivery availability gates:
  - first-day complete
  - scooter owned
  - no active delivery
  - scooter not stuck
  - scooter condition above minimum
  - completed delivery count
  - driver rating
- Deterministic delivery conditions:
  - Villa tip
  - Rush hour
  - Clean papers
  - Rain window
  - Fragile stack
  - Service gate priority
- Conditions affect payout/time/meter/rating/scooter wear.
- Rent pressure:
  - comfortable
  - due soon
  - due today
  - overdue
- Rent is visible and non-punitive; no eviction/fail state.
- Scooter condition wears down through delivery work.
- Very low condition blocks delivery jobs.
- Phone exposes local scooter repair.
- Upgrade path from borrowed rattletrap to daily rental.
- Move-out readiness threshold:
  - 5 deliveries
  - Rp 700 delivery earnings
  - 4.2 star driver rating
- Crossing threshold advances to Act 2.
- `getHustleGoalStates()` and `getHustleNextStep()` provide player-facing guidance.
- HUD and Phone use the same Act 1 next-action read model.
- Ibu Sari daily Hustle Board nudge now uses the same next-action model.

Current state: strong systems foundation, needs balance tuning by feel.

### Act 2 - Finding Your People

Goal: social life becomes the emotional heart and a practical payoff after survival pressure eases.

Implemented:

- First-class events.
- First-class clubs/groups.
- Relationship arcs for Ari, Made, and Ibu Sari.
- Club membership stored under `world.life.joinedClubIds`.
- Recurring member-only events.
- Act 2 Ari invite after move-out if player has not joined a club.
- Guide markers:
  - Find beach crew at Berawa Beach.
  - Find focus table at Satu-Satu Coffee.
- Phone > Quests Act 2 surface:
  - join first crew
  - attend recurring club rhythm
  - complete a relationship beat
- `getAct2NextStep()` provides concrete recovery copy.
- Social trust now opens better opportunities:
  - `focus_table_client_referral`
  - `run_crew_breakfast_shift`
  - `brunch_builders_paid_intro`
  - `surf_circle_board_repair`
- Opportunity gates use club membership, reputation, and affinity.

Current state: Act 2 is functionally represented and now has real payoff hooks. It still needs human proof that the social loop feels emotionally rewarding, not like a checklist.

### Act 3 - Building Something

Goal: use hustle capital and social trust to start building the player's own warung/cafe, villa path, and real bike ambition.

Implemented:

- `ACT3_BUSINESS_DESIGN.md` defines the intended system.
- `src/systems/life/Act3Readiness.ts` now derives readiness without adding a save schema:
  - Act 2 social foundation
  - Ibu Sari mentor trust
  - first crew candidate
  - seed capital
  - trusted business lead
- Phone > Quests shows Act 3 readiness once Act 2 is active.
- HUD/Phone explicitly say CEO/product unlock is needed when readiness is complete.
- `sari_warung_seed_errand` opportunity hints at warung stock/margin basics.

Current state: hooks only. Full business-management simulation has not been implemented and should not be implemented without CEO/product approval.

## 5. What Was Done In The Past Week

The past week transformed the project from a broad life-sim/social prototype into a directed act-based game.

### June 23, 2026 - Social Layer, Opportunities, Tests, Activities

Major work:

- Added first-class events.
- Added first-class clubs/groups.
- Added relationship arcs.
- Integrated social compounding goals.
- Added Vitest test runner.
- Added deterministic test coverage for:
  - save migration
  - daily loop
  - social layer
  - quests/goals/reputation/interaction
  - layout invariants
- Added dynamic opportunity engine and templates.
- Added active Phone Feed and opportunity buzz.
- Added live opportunity markers on map/minimap.
- Added opportunity stakes, venue resolution, persistence.
- Fixed overlay/minimap/dialogue behavior.
- Added committed activity state.
- Added reusable activity minigame framework and per-type minigames.

Meaning: this created the living-world layer: events, clubs, pings, social memory, and activities.

### June 26, 2026 - Progression Spine And Act 3 Design

Major work:

- Added `STORY_ARC.md`.
- Added `ACT3_BUSINESS_DESIGN.md`.
- Updated roadmap to lock the progression:
  - hustle
  - people
  - build
  - community

Meaning: the game gained a real long-term player motivation: arrive broke, survive, find people, build a place, win solo, then open multiplayer/community.

### June 29, 2026 - Act 0/Act 1 Hustle Spine

Major work:

- Added Act 0 hustle delivery loop.
- Added repeat delivery board.
- Added rent and scooter upgrades.
- Added Act 1 HUD guidance.
- Added Act 1 goals.
- Added dev godmode shortcuts for hustle testing.
- Added daily Hustle Board phone nudge.
- Fixed Act 0 save inference for progressed saves.
- Gated phone feed during Act 0.
- Added Act 0 guide markers.
- Anchored Act 0 sleep to home kos.
- Added delivery board conditions.
- Added rent pressure.
- Added move-out readiness announcement.
- Added scooter repair pressure.
- Bridged Act 1 move-out to Act 2.
- Added mid-tier delivery jobs.
- Added Act 2 social handoff, Act 2 goals, and club-gated opportunity.

Meaning: this made the first real gameplay spine: first day -> delivery survival -> rent/scooter/rating -> move-out -> social payoff.

### June 30, 2026 - Handoff, Guidance, And Three-Act Milestone Surface

Major work:

- Hardened new-tab project handoff via `AGENTS.md`, `STATE.md`, `VISION.md`, and roadmap docs.
- Added `getHustleNextStep()` for Act 1.
- Surfaced Act 1 next steps in HUD and Phone.
- Updated Ibu Sari's daily nudge to use real next-action guidance.
- Added `getAct2NextStep()` for Act 2.
- Added more social-gated opportunities.
- Added Act 3 readiness hooks.
- Added tests for Act 1 guidance, Act 2 next steps, Act 3 readiness, and social payoff opportunities.

Meaning: the game now has clear milestone surfaces for:

- Act 1: Found Your Feet
- Act 2: Crew And A Name
- Act 3: Dream Lit

## 6. Technical Architecture Snapshot

Important files:

- `src/types.ts`: shared domain types.
- `src/systems/WorldState.ts`: world defaults.
- `src/systems/Persistence.ts`: save/load/migration.
- `src/scenes/GameScene.ts`: main Phaser scene and still-large gameplay orchestration.
- `src/ui/phone/PhoneShell.ts`: phone UI.
- `src/systems/hustle/DeliverySystem.ts`: delivery flow.
- `src/systems/hustle/HustleEconomy.ts`: rent/scooter pressure.
- `src/systems/hustle/HustleGoals.ts`: Act 1 goals/next-step read model.
- `src/systems/life/Act2Goals.ts`: Act 2 goals/next-step read model.
- `src/systems/life/Act3Readiness.ts`: Act 3 readiness hooks.
- `src/systems/opportunities/OpportunityEngine.ts`: live opportunity pool, feed, accept/resolve/expire.
- `src/data/opportunities.ts`: authored gigs/social/help/rumor/trade opportunities.
- `src/data/events.ts`: authored events.
- `src/data/groups.ts`: clubs.
- `src/data/relationshipArcs.ts`: relationship progression.
- `src/data/authoredStreetLayout.ts`: active map adapter.
- `src/data/streetTemplates.ts`: authored Jl. Pantai Berawa template.

Architecture posture:

- Local-first.
- Data-driven content.
- Runtime no backend.
- Runtime no external map/data calls.
- No real commerce.
- No real multiplayer.
- No AI calls.
- Future seams exist but are intentionally inert.

## 7. Known Caveats And Risks

### Product / Gameplay Risks

- The game has many systems, but the first 30-60 minutes still need human play-feel validation.
- Act 0 may be too linear or unclear in moment-to-moment travel.
- Act 1 delivery/rent/scooter balance may be too easy, too grindy, or too text-heavy.
- Act 2 may still read as checklist social unless the event/relationship pacing feels emotionally rewarding.
- Act 3 is now visible as a readiness surface, but building the actual management sim is a large scope jump.

### Technical Risks

- `GameScene.ts` is still very large.
- Sleep and full event attendance effects still live in private `GameScene` methods, causing intentional test skips.
- Phone UI is functional but not polished.
- The active map is only one authored street.
- Old OSM/scaled renderer code remains as dormant reference/debt.
- No configured git remote, so local commits are not backed by a PR/remote.

### Data / Content Risks

- BAKED and Canggu Station are temporary Raya Semat stubs.
- Some venue placement conflicts remain documented:
  - Bakersfield
  - BAKED
  - Da Romeo
- Eighteen curated coordinates need manual review as estimate/fallback rather than verified OSM/Nominatim matches.
- Venue ratings/reviews are data-only and not live/verified.

### Explicit Non-Features

Do not assume any of this exists:

- Real multiplayer.
- Backend/auth/database.
- Real payments.
- Real bookings.
- Real delivery APIs.
- Real coupons.
- Real check-ins.
- Google Places integration.
- Live venue verification.
- AI/LLM content generation.
- Combat systems.

## 8. My Recommendation On Where The Game Should Steer Next

### Recommendation 1 - Stop Adding New Systems For One Sprint

The game now has enough systems to prove or disprove the core fantasy. Adding more systems before playtesting will blur the signal.

Next sprint should be:

- Play Act 0 fresh from a cleared save.
- Play Act 1 until move-out.
- Play Act 2 until one club/event/relationship beat/payoff opportunity.
- Record where the player feels confused, bored, over-guided, under-rewarded, or emotionally unmoved.

Output should be tuning tickets, not new feature pitches.

### Recommendation 2 - Tune The First-Hour Spine

Most important tuning questions:

- Is the first Ibu Sari walk obvious?
- Is the borrowed scooter moment satisfying?
- Is BAKED pickup/dropoff readable at speed?
- Does the meal/coffee step feel like a real trade-off?
- Does cheap-kos sleep feel like a milestone?
- Does Act 1 feel like "small wins stack" rather than a grind?
- Is rent pressure motivating without feeling punitive?
- Does scooter wear create texture without annoyance?
- Is move-out readiness clear and rewarding?

Recommended code work after playtest:

- Adjust payouts/time limits.
- Adjust scooter wear/repair costs.
- Adjust rent due day/amount.
- Adjust delivery condition frequency/copy.
- Improve HUD wording where players get lost.
- Possibly add 1-2 more authored first-week phone texts if the loop feels lonely.

### Recommendation 3 - Make Act 2 Emotional, Not Just Useful

Act 2 already has mechanics. It needs emotional payoff.

Next Act 2 improvements should focus on:

- More authored post-event dialogue.
- Relationship beats that visibly change how NPCs talk.
- Small recurring rituals:
  - Ari beach check-in.
  - Made home-base taste advice.
  - Kadek bakery familiarity.
  - Ibu Sari practical life advice.
- One or two "inside joke" style messages after repeated attendance.

Avoid adding new social systems until existing events/clubs/arcs feel meaningful.

### Recommendation 4 - Delay Full Act 3 Until CEO/Product Unlock

The game now knows when Act 3 should begin. That is enough for now.

The full Act 3 sim should start only after:

- Act 0 first day feels good.
- Act 1 hustle loop is tuned.
- Act 2 social loop feels emotionally valuable.
- CEO confirms scope for the first business prototype.

When approved, Act 3 v1 should be narrow:

- Lease one tiny warung/cafe spot.
- Choose 2-3 menu items.
- Buy local stock.
- Run one simple service loop.
- Track daily revenue/costs.
- Let one Act 2 friend help as crew.
- Improve rating/reputation.
- Bank profit toward villa/bike/business win state.

Do not start with:

- Multi-location business.
- Deep pricing simulation.
- Complex staff scheduling.
- Random event deck.
- Real commerce.
- Remote multiplayer hosting.

### Recommendation 5 - Start Technical Decomposition Only Around Stable Behavior

`GameScene.ts` is large, but refactoring it before play-feel tuning could waste effort. Decompose only where it protects known behavior:

- Extract pure sleep/event attendance effects to make skipped tests real.
- Extract HUD milestone text/read models, not rendering.
- Extract map rendering only after no gameplay tuning depends on fast iteration inside `GameScene`.

### Recommendation 6 - Preserve The Product Boundaries

The project is at risk of trying to become too many things too early:

- life sim
- social RPG
- map product
- venue app
- multiplayer metaverse
- co-living marketplace
- business sim

The correct steering is:

```text
First make one local solo life fun.
Then make social trust meaningful.
Then make business ownership a natural payoff.
Then unlock community/multiplayer.
```

## 9. Suggested Next Three Milestones

### Milestone A - First-Hour Fun Lock

Definition of done:

- Fresh player can complete Act 0 without confusion.
- Player understands why deliveries matter.
- First three Act 1 runs feel varied.
- Rent/scooter pressure is legible but not punishing.
- Move-out readiness feels like a real chapter turn.

Recommended tests/checks:

- Manual fresh-save playthrough.
- Track time-to-first-delivery, time-to-first-sleep, time-to-first-rent-pressure.
- Add one browser smoke for `P`, `ACT`, delivery marker, and Phone > Quests.

### Milestone B - Act 2 Emotional Payoff

Definition of done:

- Player joins a club.
- Attends a recurring event.
- Completes one relationship beat.
- Receives one better opportunity because of social trust.
- NPC dialogue/Contacts/Phone makes the player feel recognized.

Recommended code work:

- Add post-event flavor messages.
- Add relationship-beat-specific phone copy.
- Add one more visible perk from a relationship arc that is not money-only.

### Milestone C - Act 3 Prototype Approval Packet

Definition of done:

- Act 3 readiness hooks are tested and visible.
- Product spec for Act 3 v1 is one page.
- CEO decides whether to unlock business sim.

Recommended Act 3 v1 scope if approved:

- One player-owned warung/cafe.
- One mentor flow with Ibu Sari.
- Two crew candidates from Act 2.
- Three menu/stock choices.
- One daily service resolution.
- One rating/reputation output.
- Profit can be banked toward villa/bike/business win state.

## 10. Questions For Claude To Assess

Please assess:

1. Is the current act spine coherent and motivating?
2. Does the game have too many systems before enough play-feel proof?
3. Is Act 1's rent/scooter/delivery loop likely to be fun or tedious?
4. Does Act 2 currently sound emotionally rewarding enough?
5. Should Act 3 remain locked, or is a small prototype justified now?
6. What should be cut, simplified, or delayed?
7. What is the highest-leverage next implementation sprint?
8. What player-facing text or UX surface sounds confusing?
9. Are the product boundaries correct: no backend, no real commerce, no multiplayer yet?
10. What would make the first 60 minutes feel like a real game rather than a systems demo?

## 11. Bottom Line

The project is no longer missing direction. It has a strong spine:

```text
Arrive broke -> survive through hustle -> find your people -> build your own spot -> win solo -> open the world
```

The main missing piece is not more ambition. It is proof of feel.

Best next move: tune and playtest Acts 0-2 until the first hour has momentum, clarity, and emotional pull. Then, and only then, unlock Act 3 as a small stock-and-serve business prototype.
