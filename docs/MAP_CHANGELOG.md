# Map Changelog — the CEO's per-packet growth ledger

One line per map increment, appended by the packet that ships it, per the Map
Growth Rule in `AGENTS.md` (CEO directive 2026-07-11). The map grows by small
contiguous parcels — never big dumps — so every change is individually
reviewable. Packets with `MAP DELTA: none` do not append here (their "none" is
recorded in the packet file itself).

Format:

```
- YYYY-MM-DD · [PACKET-ID] · <what grew, one sentence> · proof: <screenshot path>
```

## Baseline (pre-rule, for diffing)

As of 2026-07-11 the playable world is: the authored Jl. Pantai Berawa tile
street (32px grid, ~29 venues on the strip), quest-critical Raya Semat stubs
(BAKED, Canggu Station), the beach terminus (Berawa Beach + FINNS area), seven
enterable interiors, and authored playable bounds `x=914..2528, y=0..2720`
(street corridor clamps tighter at `x=1091..2502`, widening at `y>=1952` for
the beach approach). Rice paddies west of the strip are visual-only (not
walkable) pending RPG-20260708-06 verification.

## Increments

- 2026-07-11 · RPG-20260708-06 · Added the 10x1-tile Corner paddy-edge dirt path between the existing sidewalk and yellowing field. · proof: `tmp/street-legibility-2026-07-11/04-after-paddy-path-desktop.png`
