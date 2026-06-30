# VISION.md — Bali Life RPG

North star: Bali Life RPG is a location-based life sim and social RPG. It uses a playable, fictionalized Berawa to let players build a daily life, meet people, join groups, grow reputation, and eventually bridge into a wider Nomad Nest / real-world social layer.

This file records the future-facing seams. It is not permission to build the whole future now.

## Product Shape

The game is not a combat RPG. It is a daily-life/social map:

- Explore a readable Berawa-inspired neighborhood.
- Build routines around cafes, beach, groceries, gyms, coworking, clubs, events, and errands.
- Balance money, Energy, Wellbeing, Focus, and Social.
- Grow relationships and reputation through repeated local actions.
- Use the phone as the stimulation surface: opportunities, messages, events, clubs, goals.

## Progression Spine

The fixed act order is:

```text
Act 0: Arrival / 新手村
Act 1: The Hustle
Act 2: Finding Your People
Act 3: Building Something
Act 4: The Good Life
Act 5: The Open World
```

The emotional arc is:

```text
hustle -> people -> build -> community
```

## Cheap Doors To Keep Open

These are architectural seams to preserve:

1. **Shared identity:** `PlayerProfile.lifestyleTags` is the cross-app bridge. `remoteAccountId` remains `null` until a real account system exists.
2. **Trust-compatible reputation:** visible positive tags plus hidden red/green flags and redemption hooks. Do not build moderation prematurely.
3. **Venue commerce seam:** venue promotion/check-in/booking/delivery fields are placeholders only. No fake live integrations.
4. **Events first-class and host-agnostic:** events can be hosted by venue/NPC/group/future player id. Current content is dev-authored and local.
5. **Groups first-class and purpose-generic:** groups cover run/coworking/surf/food/social and reserve `housing` for future Nomad Nest hatches.
6. **Content data first:** activities, opportunities, events, groups, relationships, venues, and quests should stay data-driven where reasonable.
7. **Network later:** keep world/player state and network adapter seams, but do not build real multiplayer before the solo loop works.

## Build Order Guardrail

Current priority:

1. Make Act 0 and Act 1 fun, clear, and testable.
2. Make Act 2 feel like the payoff from finding breathing room.
3. Keep Act 3 hooks but do not build the business sim yet.
4. Multiplayer/Nomad Nest remains the far-future unlock after the solo win.

## Non-Goals For Current Work

- No backend/auth/database.
- No real multiplayer.
- No AI/LLM calls.
- No Google Places scraping/integration.
- No real coupons, payments, bookings, deliveries, or check-ins.
- No combat.
- No large new map before the first authored street and core loop are proven.
