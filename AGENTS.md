# AGENTS.md — Bali Life RPG Operating Contract

This file is the first stop for any new AI/Codex tab working on this repo.

## Startup Checklist

1. Work in `/Users/z/包包/bali-life-rpg`.
2. Read, in this order:
   - `AGENTS.md`
   - `STATE.md`
   - `DECISIONS.md`
   - `STORY_ARC.md`
   - `STORY_BIBLE.md`
   - `GAME_DESIGN.md`
   - `ACT3_BUSINESS_DESIGN.md`
   - `docs/ROADMAP.md`
3. Run `git status --short --branch` and inspect the latest commits before editing.
4. Treat `STATE.md` as the current handoff truth and `DECISIONS.md` as the decision log.
5. Commit per small slice. After meaningful code changes, run `npm test -- --run` and `npm run build`.
6. Before stopping, update `STATE.md` and append to `DECISIONS.md` if a product/architecture decision changed.

## Canonical Direction

Bali Life RPG is a local single-player life sim/social RPG, not a combat RPG.

The fixed progression spine is:

```text
Act 0: Arrival / 新手村 tutorial
Act 1: The Hustle
Act 2: Finding Your People
Act 3: Building Something
Act 4: The Good Life
Act 5: The Open World
```

Short form:

```text
hustle -> people -> build -> community
```

Near-term priority is **Act 0 / Act 1 playability and tuning**, then making existing Act 2 social systems read as the payoff. Do not jump ahead to Act 3 business management, real multiplayer, or real commerce until Acts 0-2 are fun and proven.

## Current Technical Truth

- Current branch: `feat/act0-hustle-loop`.
- Current save schema: `CURRENT_SCHEMA_VERSION = 11` in `src/systems/Persistence.ts`.
- Save key remains `bali-life-rpg.berawa-finns.save.v1`.
- Current test command: `npm test -- --run`.
- Current build command: `npm run build`.
- Latest known automated result: 53 passing tests, 3 intentional skips; build passes.
- Active playable map: authored tile street for `Jl. Pantai Berawa` via `src/data/authoredStreetLayout.ts`.
- OSM data is retained for coordinates/sequencing/reference only. Do not make runtime map network calls.

## Hard Boundaries

Do not add these unless the user explicitly starts that phase:

- Real multiplayer, sockets, backend, auth, database, or remote account system.
- AI/LLM calls.
- Google Places integration or scraping.
- Real payments, booking APIs, delivery APIs, live coupons, or real check-ins.
- Combat systems. Traffic/bad-behavior consequences are environmental/community pressure only.
- Act 3 business-management simulation before Act 0/1/2 are play-tested and tuned.

## If The User Says "Keep Working"

Continue from `STATE.md` and current git state. Prefer small, self-verifying slices that improve the current playable spine:

1. Act 0 first-day clarity and pacing.
2. Act 1 delivery/rent/scooter/rating balance.
3. Act 2 handoff visibility and small social payoffs using existing events/clubs/arcs/opportunities.
4. Tests and docs that protect the above.

Do not infer that "keep working" means expanding the world, adding backend, building Act 3, or changing the product vision.

## Scheduling Note

Do not create automations or reminders unless the user explicitly asks again. If asked for a one-time resume, use a one-shot schedule with explicit timezone/start time and verify the rendered schedule before claiming it is correct.
