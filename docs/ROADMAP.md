# Expansion Roadmap

## Progression Spine

The current product spine is documented in [STORY_ARC.md](../STORY_ARC.md). The game should give the player a concrete dream to chase:

```text
hustle -> people -> build -> community
```

Act milestones:

- **Act 0 — 新手村 / Arrival:** Ibu Sari guides the first day, teaches movement, phone, scooter, first delivery, money/meters, and sleep.
- **Act 1 — The Hustle:** delivery/gig app loop, star rating, scooter upkeep/upgrades, budget pressure, first recurring NPC relationships.
- **Act 2 — Finding Your People:** events, clubs, relationship arcs, social standing, and crew formation become the emotional heart.
- **Act 3 — Building Something:** the player opens a warung/café, saves for a villa, and upgrades to a real bike.
- **Act 4 — The Good Life:** solo win condition: villa + business + bike.
- **Act 5 — The Open World:** multiplayer and Nomad Nest unlock after the solo win; community becomes the endgame.

Locked direction from [ACT3_BUSINESS_DESIGN.md](../ACT3_BUSINESS_DESIGN.md):

- Mentor: **Ibu Sari**.
- Tone: grounded aspiration with affectionate/gentle Canggu satire.
- Romance: friendship-first for now.
- Solo win condition: **all three** — villa + business + bike.
- Pacing target: roughly **two hours per act**.
- Act 3 first implementation: light stock-and-serve management, deepen later.

## Current Status

- Act 0 guided first day exists in code: Ibu Sari, borrowed scooter, first BAKED delivery, meal/coffee step, cheap-kos sleep marker, HUD/Phone objective visibility.
- Act 1 hustle exists in code: delivery board, driver rating, delivery earnings, rent pressure, scooter condition/repair/upgrade, move-out threshold, and Act 1 goals.
- Act 2 social systems exist in code: events, clubs, relationship arcs, Ari handoff invite, guide markers, Act 2 goals/next-step guidance, and multiple club/reputation-gated opportunities.
- Act 3 remains design-first, but readiness hooks now exist in code for social foundation, mentor trust, crew candidates, seed capital, and trusted business leads. The management sim itself remains locked behind product approval.

## Next Gameplay Steps

- Play-feel tune the Act 0 guided 新手村 tutorial around Ibu Sari, the cheap kos, first scooter, first BAKED delivery, first meal/coffee, and sleep.
- Tune the delivery/gig loop: payout, timer pressure, driver rating progression, scooter wear/repair cost, rent reminders, condition frequency, and mid-tier job unlocks.
- Make Act 2 read clearly as the payoff after move-out: events introduce people, clubs create rhythm, relationship arcs unlock trust/perks, and social standing opens better opportunities.
- Keep Act 3 business hooks in data/state only until Act 0/1/2 are fun and proven: crew candidates from relationship arcs, venue rating/reputation compatibility, and future player-owned venue seams.
- Add interiors for Canggu Station, Milk & Madu Berawa, BAKED. Berawa, Bungalow Living Bali, and Satu-Satu Coffee Company when they directly support the tutorial/hustle/social beats.

## Future Opening Tutorial

The intended tutorial is now Act 0 / 新手村: a guided first day led by Ibu Sari. It should feel like a Pokemon-style opening walkthrough for a daily-life hustle sim, not a combat loop. The first implementation exists, but it still needs real-device pacing and clarity tuning.

Planned beats:

- Start at the cheap kos at dusk with very little money.
- Walk to Ibu Sari's warung: movement, waypoint/objective arrow, first relationship anchor.
- Borrow the beat-up scooter and sign onto the gig app: riding, phone, and the premise that hustle is the verb.
- First delivery: BAKED pickup -> villa dropoff -> payment + first star rating.
- Spend first earnings on food/coffee: money, Energy, Wellbeing, and opportunity cost.
- Ride home and sleep: day cycle, save expectations, and "first day survived" milestone.

The old first-run hint panel can remain as a temporary control reminder, but it should not replace this guided Act 0.

## Art and UX

- Replace procedural character placeholders with authored sprite sheets.
- Add walking animations and direction-specific sprites.
- Add subtle ambient sound and shop/NPC interaction sounds.
- Improve sign readability and add more environmental props.
- Add an options menu for audio, text speed, and touch-control layout.

## Technical

- Split `GameScene` into renderer, interaction, UI, and simulation controllers as content grows.
- Add unit tests for inventory, quests, persistence migration, and shop transactions.
- Add a schema validator for save files and network patches.
- Add an event bus for world interactions.
- Add server-authoritative multiplayer following `MULTIPLAYER_ROADMAP.md`.
- Back `PlayerProfile` with a shared remote account when the companion co-living app exists.
- Replace placeholder venue commerce/check-in/booking/delivery fields with real service integrations only after venue ownership and trust rules exist.
- Keep Act 3 business data compatible with existing venue/reputation/rating shapes, but do not build the management layer before the tutorial, hustle loop, and social layer are proven.
