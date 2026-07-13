```
PACKET ID: RPG-20260713-04
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — full Act 0 back-half rebuild: step-machine, economy stakes, save-compat, and whether the beats FEEL right decide success, not compilation
CODEX-PREREQ: run after RPG-20260713-03 (needs the storm, clock arc, audio beds, bleak kos)
TITLE:     First-ten-minutes rebuild — Act 0 back half restaged as the bible's actual arc
MAP DELTA: none — every beat is staged at existing venues/interiors (Milk & Madu interior, existing villa dropoffs, the kos); no new geometry
PR TAG: [RPG-20260713-04]

===== BEGIN PACKET RPG-20260713-04 =====

ROLE & SCOPE
Read docs/FIRST_TEN_MINUTES.md FIRST — its script table is the contract; this
packet implements it. CEO verdict on the current build: "the game still felt
the same." Root cause (diagnosed there): after the cold open and catering
ride, minutes 2–10 collapse into walk → E → DOM activity menu → text panel.
This packet replaces Act 0's back half (everything after the catering
dropoff) with STORY_BIBLE.md v4 §D Act 0's real beats, staged on the
RPG-20260713-03 sensation layer.

THE BEATS (in order; timings are targets from the script table, not hard gates)

1. SCENE — INSIDE MILK & MADU (~2:20–4:00). After the catering dropoff the
   player is brought INTO the existing Milk & Madu interior as a staged scene,
   not an activity menu: tables occupied, cafe audio bed, a plate and coffee
   arriving as scene business (this REPLACES the buy_meal_and_coffee
   menu-click beat — meal/coffee effects apply as byproducts of the scene).
   Planted in the background, per the bible's setups: Julian Vance at the
   counter complaining to staff about scooter parking noise (2-3 ambient
   lines, existing NPC data if present or add npc entry — no arc content),
   visibly moneyed and dismissive. The player cannot miss him but need not
   interact.
2. PHONE MOMENT — NUSADROP SIGNUP (~3:30, inside the scene). The signup
   happens ON the phone shell as a diegetic moment: short install/signup flow
   (2-3 taps max), then the driver leaderboard flashes — #1: LEO (the bible's
   plant). As the player stands up to leave, the first real NusaDrop gig
   pings. No tutorial text walls; the app teaches by pinging.
3. RIDE 2 — FIRST APP RUN, STORM MID-RIDE (~4:00–6:00). A normal board-style
   delivery, except: partway through the ride the storm breaks (weather
   system ON: rain layer, slick physics, thunder, rain bed). Fail-forward:
   getting hit/wet degrades cargo/payout via existing cargo-care machinery,
   never blocks completion.
4. MIDPOINT REVERSAL — LANDLORD ULTIMATUM (at the dropoff, ~5:50). Phone
   alert from the kos landlord (Made can be the intermediary per his bible
   role if convenient, but do not build his Act 1 arc): no employment
   contract, so the deposit is doubled and due by MIDNIGHT or the room locks.
   The deposit target and current wallet must be visible from here on
   (reuse an existing HUD chip pattern — no new HUD system). This is mood
   and goal pressure, not a fail state: see fail-forward rule below.
5. SURGE PING — THE VILLA ORDER (~6:00–6:30). NusaDrop pings a high-value,
   high-fragility villa order whose payout visibly covers the deposit gap.
   One-tap accept from the phone. Night has fallen (clock arc).
6. RIDE 3 — THE VILLA RUN SETPIECE (~6:30–8:30). The longest ride yet, at
   night, rain tapering, fragile cargo, lantern-lit street. On arrival:
   the 5-star moment — biggest payout celebration in the game so far
   (existing PayoutCelebration, turned up for this beat), driver-rating
   flourish. This is the bible's closing milestone and the emotional peak
   of the first ten minutes — spend polish here.
7. RESOLVE — DEPOSIT PAID, COLLAPSE (~8:30–9:30). At the kos: short landlord
   scene. If the wallet covers the deposit: pay in full. If short (possible
   via fail-forward degradation): Ibu Sari vouches for the difference — a
   2-3 line scene variant that plants her Act 1 guarantee role. Either way
   Act 0 completes; the difference is dialogue + starting Act 1 wallet.
   Then the bleak kos room (RPG-20260713-03 dressing), collapse into bed —
   which flows into the EXISTING sleep → Act 1 card → rate cut → morning
   hand seam untouched. That seam is the golden thread: the app that just
   saved the player turns on them at Act 1 open. Do not modify the Act 1
   side (RPG-20260713-02's work).

STEP MACHINE & SAVES
- Extend the Act0Step union/NEXT_STEP for the new beats; keep existing step
  ids where beats survive (meet_ibu_sari, pickup/dropoff_first_delivery,
  sleep_first_night stay). buy_meal_and_coffee is replaced by the scene beat —
  if keeping the id with new semantics is cleaner for save-compat, do that.
- Legacy saves: a save mid-Act-0 on the old flow must still be completable —
  map removed/changed steps to the nearest surviving step on load (follow the
  RPG-20260712-02 precedent: legacy saves keep a working path; fresh saves
  get the new one). Prefer no CURRENT_SCHEMA_VERSION bump; if truly
  unavoidable, stop and flag in the PR instead of bumping unilaterally.

HARD CONSTRAINTS
- THE MENU RULE (from FIRST_TEN_MINUTES.md): nothing on Act 0's critical path
  opens an activity menu, station panel, or shop list. Scenes, rides, and
  phone moments only. (Menus stay available for optional/off-path use and
  after Act 0.)
- Fail-forward: no beat can hard-fail or soft-lock. Late/wet/damaged =
  less money + different lines. The Ibu-vouch branch guarantees completion.
- Economy: use the existing Rp scale. The storm run + villa run payouts must
  cover the deposit with a small buffer on a clean playthrough; degraded runs
  fall into the Ibu-vouch branch. State the chosen numbers in the PR and keep
  them consistent with Act 1's post-rate-cut math (RPG-20260713-02 set
  move-out earnings at Rp 600 — do not silently disturb that balance).
- Pacing: New Game → first live stakes stays under 3:00; full Act 0 unskipped
  lands in roughly 9–11 minutes; every scene skippable via the existing skip
  path, skip resolving to the default-forward branch.
- Reuse only: cutscene kit, WorldScenes/RelationshipChoiceScene patterns,
  phone shell, delivery/ride/cargo-care machinery, payout celebration,
  RPG-20260713-03 weather/clock/audio controls. No new engine systems.
- Do not touch: Act 1+ content, Leo's race, the rate-cut/Leo encounter seam,
  steering mode internals, protected balance beyond what's stated above.

DEFINITION OF DONE
- npm test -- --run + npm run build green. Tests cover: new step progression
  (including skip paths), legacy-save step mapping, deposit math both
  branches (covered vs. Ibu-vouch), storm triggers mid-ride-2 exactly once,
  villa order payout >= deposit gap on clean run, menu rule (no activity-menu
  open recorded on the Act 0 critical path — assert however the smoke/debug
  surface allows).
- Smoke: extend scripts/smokePlaythrough.mjs to drive the full new path
  fresh-save → Act 1 morning hand, with a timestamped beat table in the proof
  doc like RPG-20260712-02's, plus screenshots per beat (cafe scene w/ Vance,
  signup + LEO leaderboard, storm ride, ultimatum alert, night villa
  celebration, landlord resolve, bleak kos, Act 1 seam). Mobile 390x844
  check still passes.
- Proof doc docs/RPG-20260713-04_FIRST_TEN_MINUTES_PROOF.md; STATE.md bullet;
  DECISIONS.md entry (record: Act 0 back half replaced per
  FIRST_TEN_MINUTES.md; what was removed; the deposit economy numbers;
  explicit list of bible beats still NOT implemented).
- Total unskipped runtime of Act 0 measured and stated in the proof.

DO NOT
- Do not build Act 1 content, Surge Zone mechanics, furniture/BUILD systems,
  or Kadek/Ari/Made arcs — plants and cameos only as specified.
- Do not add difficulty/fail states to preserve "stakes" — the stakes are
  narrative + money, never a game-over.
- Do not compress by cutting the villa setpiece; if runtime overshoots, trim
  scene line counts and ride lengths, not beats.

===== END PACKET RPG-20260713-04 =====
```
