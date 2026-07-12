# RPG-20260712-02 — Act 0 v4 Opening Proof

## Result

The standing browser smoke ran the complete opening unskipped at `1280x800` and measured **New Game → live timed delivery in 50.97 seconds**, comfortably inside the `<3:00` product budget. The same run continued through the Milk & Madu handoff, compressed NusaDrop signup/meal beat, kos sleep, and Act 1 card without a browser/runtime error.

## Timestamped opening trace

| Wall-clock timestamp (UTC) | Elapsed | Beat | Screenshot |
|---|---:|---|---|
| `2026-07-12T08:30:50.121Z` | `2.10s` | Bus pulls away from the new Canggu Station pocket; player is left on the backpack | `tmp/smoke/00-bus-departure-t+002.1s.png` |
| `2026-07-12T08:30:54.718Z` | `6.69s` | Phone card reveals the kos reservation scam | `tmp/smoke/01-kos-scam-message-t+006.7s.png` |
| `2026-07-12T08:31:10.885Z` | `22.86s` | Ibu Sari crosses from the station/warung | `tmp/smoke/02-ibu-crosses-street-t+022.9s.png` |
| `2026-07-12T08:31:23.523Z` | `35.50s` | Ibu offers her late husband's scooter on credit for the 15-minute catering run | `tmp/smoke/03-scooter-offer-t+035.5s.png` |
| — | `49.9s` | Relationship choice: accept humbly or negotiate a fee; neither path declines the scooter | `tmp/smoke/04-first-choice-t+049.9s.png` |
| `2026-07-12T08:31:38.994Z` | **`50.97s`** | Catering box loaded, scooter granted, visible countdown live to Milk & Madu | `tmp/smoke/05-timed-delivery-live-t+051.0s.png` |

The authored cutscene itself is `48.2s` unskipped. ESC, keyboard ACT, and canvas tap use the existing cutscene skip path. ESC on the required choice resolves the humble branch, so skipping never creates a decline or soft-lock. Save requests continue to defer while a cutscene is active; the first new durable write occurs only after choice resolution with the live delivery state.

## Choice and fail-forward proof

- Humble acceptance: `+3` Ibu affinity, `+3` Relational/Community-Trust direction, and an Ibu memory.
- Negotiated fee: `-1` Ibu affinity, `-2` Relational direction, a distinct Ibu memory, and `Rp 25` added when the delivery completes.
- The catering definition uses the existing delivery state, cargo-integrity chip/damage path, payout celebration, and completion machinery. On time earns a `Rp 40` cargo-care bonus; rough riding can reduce it, and late delivery loses it, still completes, and produces Ibu's late-specific response.
- Ibu's later normal dialogue reads the selected branch (and whether the window was made), so the opening choice leaves visible residue beyond the choice panel.
- Existing mid-Act-0 saves never enter the fresh-session cutscene path. Their persisted `act0Step`, active tutorial delivery, scooter state, and legacy first-run flow remain intact; no schema bump was made (`CURRENT_SCHEMA_VERSION = 11`).

## Map delta proof

The new `canggu_station_bus_dropoff` parcel is a contiguous `6x3`-tile street-edge bay beside Canggu Station. It is included in authored playable-point/bounds derivation, drawn by the shared street renderer, drawn on the minimap through `walkableStreetParcels`, and covered by a no-slot/no-collision invariant test.

- Before: `tmp/act0-v4-proof/00-before-bus-pocket.png`
- After: `tmp/smoke/04-first-choice-t+049.9s.png`
- In use: `tmp/smoke/00-bus-departure-t+002.1s.png`

## Verification

```text
npm test -- --run
npm run build
npm run smoke
```

Final combined-tree result: **40 test files / 259 tests passed**, build passed, and smoke passed through Act 1 at `Day 2 08:00`. Warung Rush work appeared concurrently in the shared workspace and was preserved during this packet.
