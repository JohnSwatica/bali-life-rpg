# Gameplay Stations

This pass turns six existing Berawa anchors from generic venue menus into distinct gameplay stations. The goal is not more buildings; it is clearer place fantasy, meaningful tradeoffs, and daily rhythm using the existing activity, meter, time, and committed-activity/minigame flow.

## Phase 0 Station Set

| Station | Existing anchor(s) | Fantasy | Primary loop |
| --- | --- | --- | --- |
| Cafe focus table | Satu-Satu Coffee Company, Milk & Madu Berawa, Nude Cafe Berawa, BAKED. Berawa | Laptop, coffee, small-talk gravity | Trade money/time/energy for focus, coffee recovery, or light social presence. |
| Beach reset | Berawa Beach | Saltwater recovery and surf confidence | Spend energy for wellbeing, reputation, or a calmer focus reset. |
| Beach club night | FINNS Beach Club | Expensive social acceleration | Big social gains with money, focus, and next-morning consequences. |
| Warung meal | Ulekan Berawa | Cheap food, local rhythm | Restore energy/wellbeing cheaply or trade time for neighborhood warmth. |
| Coworking sprint | Tropical Nomad Coworking Space, Outpost Canggu Coworking | Deliberate productivity and accountable strangers | Earn/work/focus with fees, energy cost, and networking alternatives. |
| Cheap kos room | Cheap Kos Room | Home base, recovery, planning | Sleep, prep, or reset meters without leaving the field loop. |

## Data Direction

Station authoring should stay data-driven:

- `stationLoops` define the station fantasy, existing venue IDs, reward shape, risk, and best time of day.
- Activity rows opt into a station with `stationId`, `venueIds`, visible preview copy, action copy, and optional time-of-day modifiers or next-morning effects.
- Runtime resolution still flows through `getActivityAvailability()` and `applyActivity()` so future stations can add data without new scene code.
