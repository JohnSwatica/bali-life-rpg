```
PACKET ID: RPG-20260708-05
PROJECT:   Bali Life RPG
TARGET:    Codex
REASONING: high — movement-mode + interior state machine (walk vs. ride, mount/dismount, interior transitions); behavior can silently break the core traversal loop while TS passes
TITLE:     Interior/scooter mechanics — foot-only interiors, staged mount/dismount, clean delivery-pickup seam
PR TAG: [RPG-20260708-05]

===== BEGIN PACKET RPG-20260708-05 =====

ROLE & SCOPE
The 2026-07-08 playthrough (BUG-3) showed the player riding the borrowed
scooter INSIDE Warung Sari — the scooter is granted while indoors and the
player mounts in Ibu's dining room. This breaks the Pokémon interior grammar
the GDD commits to (interiors are foot-only rooms) and corrupts the intended
mechanic: the scooter is a WORLD-mode vehicle, interiors are FOOT-mode scenes.
Make the walk/ride state machine correct and legible.

MECHANICS TO ENFORCE (the logic, stated precisely)
- Interiors are foot-only. `mode === "interior"` implies `onBike === false`
  and the scooter sprite is not rendered/active. Entering any interior while
  on the bike auto-dismounts (parks the scooter conceptually at the door);
  exiting returns the player to the exterior at the saved return point, still
  on foot, with the scooter available to re-mount in world mode.
- Granting the scooter (Ibu's Act 0 gift, and any future grant) sets
  ownership/availability but MUST NOT force `onBike` while indoors. The player
  physically walks out of the Warung, THEN mounts in the world — matching the
  fiction ("she lends you the scooter parked outside").
- Mount/dismount is a world-mode-only transition. Auditable single source of
  truth: no code path may set `onBike = true` while `mode === "interior"`.

DELIVERABLES
1. State-machine fix in GameScene interior enter/exit + the bike mount logic:
   enforce the invariants above. Where the scooter is currently granted
   (Ibu delivery-accept path), decouple "own/have scooter" from "on bike."
2. A small pure guard/helper (e.g. `src/systems/ride/RideMode.ts` or extend
   an existing movement helper) that answers "can the player be on the bike
   right now?" from (mode, hasBike, interiorId) so the rule is testable and
   reused by both the enter/exit transitions and the mount toggle.
3. Delivery-pickup seam check while you are in here: confirm that interior
   counter pickups (BAKED bakery counter) and the exterior delivery flow hand
   off cleanly through the corrected foot/ride transitions — picking up
   indoors on foot, then mounting outside to ride to the dropoff. Fix any
   seam where the delivery target or pickup prompt is stranded by the mode
   switch (the playthrough could not cleanly verify this leg; treat it as
   suspect and prove it).
4. Visual truth: while indoors the scooter is not shown; on exit the mount
   prompt / bike visual returns. No half-states (player sliding on a hidden
   bike, etc.).

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; new tests assert: entering an
  interior forces foot mode; no transition yields `onBike && interior`;
  scooter grant indoors leaves the player on foot; exiting restores world
  mode with the bike re-mountable; interior counter pickup completes on foot
  and the subsequent ride leg targets the dropoff.
- Automated/manual proof in PR: Act 0 first delivery played boot→dropoff with
  the corrected transitions (pairs with RPG-20260708-04's onboarding fix —
  run them together if possible).
- STATE.md bullet; DECISIONS.md entry (movement-mode invariant is
  architecture worth recording).

DO NOT
- Do not add a parked-scooter world object, animation, or new art for the
  "parked outside" fiction — a conceptual dismount is enough; keep it cheap.
- Do not change scooter economy, wear, tiers, speed, or the delivery payout
  math.
- Do not rework the interior camera/render beyond hiding the bike indoors.

===== END PACKET RPG-20260708-05 =====
```
