```
PACKET ID: RPG-DRAFT-W1-B3 (assign RPG-YYYYMMDD-NN + pin PREREQ SHA at issue)
STATUS:    DRAFT — do not ferry until issued
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — authored downfall touching rating, premium gating, and ride state; behavioral correctness throughout
PREREQ:    merged main after RPG-20260714-06 + Wave 1.5 gate (SHA at issue)
TITLE:     Act 1 Beat 3 — the breakdown reversal (transmission blowout, push the bike)
MAP DELTA: none — staged on the existing street's far end
PR TAG: [<assigned ID>]

===== BEGIN PACKET RPG-DRAFT-W1-B3 =====

ROLE & SCOPE
docs/ACT1_BACKBONE_2026-07-14.md Beat 3. Bible: "Your scooter's
transmission blows out mid-delivery… push the bike… ruining the cargo,
tanking your app rating to 3.2 stars, locking you out of premium tiers."
This is AUTHORED downfall — scripted once, dramatic, fail-forward — never a
random failure.

THE BEAT
1. TRIGGER: the first board delivery ACCEPTED after both TP flags
   (Kadek priority + Made scene) are set. Mid-ride, at a scripted distance
   from the dropoff (far-end stretch of the street), the transmission
   blows: sound sting, smoke puff (existing effects language), scooter
   stops. One-time flag; never re-fires.
2. THE PUSH: reuse the existing bikeStuck/push machinery — player walks
   the bike at push speed to the dropoff. No timer death: the delivery
   completes LATE with cargo ruined (existing cargo-integrity path to ~0),
   authored dropoff lines acknowledging the state. HUD communicates
   "TRANSMISSION GONE — push it in" via the objective chip.
3. THE DAMAGE (authored, explicit): driver rating SET to 3.2 (not
   decremented — authored value per bible); premium lines lock (Kadek's
   priority line + any minDriverRating>3.2 offer shows "Locked — rating"
   with honest copy); scooter enters a "blown" state that the existing
   repair counter fixes for riding (repair restores RIDE, NOT the rating).
4. RESIDUE: one Leo text lands within a minute (his cadence packet owns
   the rest — exactly one here): mocking, on-voice, not cruel beyond his
   §C profile. Kadek's ambient line acknowledges the lockout without
   removing his respect ("The list holds. Ratings are the app's opinion,
   not mine."). The Made goal card shows the rating condition now failing —
   which is the point: Beat 5 resolves it through Ibu, not grinding.
5. FAIL-FORWARD GUARANTEE: normal (non-premium) board runs stay available;
   money can still be earned; nothing soft-locks. Tests must prove the
   post-reversal world can still reach the finale gate.

HARD CONSTRAINTS
- One-time, scripted, deterministic trigger; no randomness.
- No schema bump if the existing flag/rating/scooter state fields suffice
  (they should); stop-and-flag otherwise.
- Rating 3.2 is authored: subsequent good runs move it by existing rules,
  but the finale gate must NOT require grinding back to 4.2 (Beat 5's
  milestone adjustment; do not implement it here — just don't block it).
- Do not touch Act 0, the tip dilemma, the finale, milestone math, or
  Leo's race.

DEFINITION OF DONE
- Tests: trigger gates on both TP flags + first accepted board run; fires
  once; rating set to 3.2; premium lock honest; repair restores ride not
  rating; post-reversal world reaches finale-gate preconditions.
- Beat proof from a boot state (add "act1_both_tps" builder via gameplay
  mutations): trigger mid-ride, push sequence, ruined dropoff, rating/HUD,
  Leo text, locked premium line — screenshots.
- Proof doc; STATE.md bullet; DECISIONS.md entry (authored-downfall
  pattern).

DO NOT
- No new minigame for the push; no game-over; no randomized breakdowns
  ever (this is a story beat, not a mechanic).

===== END PACKET RPG-DRAFT-W1-B3 =====
```
