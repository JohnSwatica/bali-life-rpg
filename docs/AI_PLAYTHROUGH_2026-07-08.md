# AI-Driven Playthrough + GTA:CW Benchmark — 2026-07-08

**What this is:** a real, driven playthrough of the current build (branch
`feat/rpg-20260706-09-rio-race`, all 12 packets landed, 234 tests green),
executed by a headless Chrome harness (puppeteer-core) that sends real
WASD/E keypresses and reads the game's live debug snapshot + screenshots at
each beat. Two full runs. Artifacts under `tmp/playtest-2026-07-08/`
(`playlog.txt`, `playlog2.txt`, `00`–`10`, `A`–`G` screenshots).

**What this is NOT:** it is **not** the human playtest the Phase 3 gate
requires, and it does **not** satisfy GATE v2's "3+ real humans" exit
condition. A machine cannot feel boredom, delight, or confusion — it can only
prove reachability and catch broken seams. This work is gate-**compliant**
because it is bug-finding on existing systems (the polish/integration/bug-fix
lane GATE v2 explicitly allows), not new-system building.

**Headline:** John's "riddled with bugs and not nearly playable" is correct,
but the diagnosis matters: **there were ZERO JavaScript/console errors across
both full runs.** Nothing crashes. What's broken is the **guidance and spatial
layer that gets a new player from boot into the good systems** — and the good
systems (ride model, payout juice, audio, meter-diet) are genuinely present
and reasonably built. *The feel engine exists; the on-ramp to it is broken.*

---

## How far the harness got

- Boot → title screen (packet 08-01) → **New Game** → "Morning in Berawa"
  cold-open → walk to Canggu Station → **enter the station interior** →
  (attempt to talk to Ibu Sari). **Run 1** eventually advanced to
  `pickup_first_delivery` and received the scooter; **Run 2** could not
  complete the Ibu conversation by following the arrow and nudging, and
  stalled. Neither run cleanly reached the villa dropoff, meal, or sleep —
  **not primarily because the harness lacks eyes, but because the first
  interaction actively misdirects** (see BUG-1).

The single most important fact: **an automated agent that does exactly what
the tutorial tells it — "follow the arrow, press E" — fails at the very first
objective.** Many humans will recover by eyeballing Ibu's sprite; some won't;
all will feel the friction. This is the first 90 seconds of the game.

---

## Confirmed defects (with screenshot evidence)

### BUG-1 [CRITICAL — onboarding] The first objective marker points at the wrong thing
*Evidence: `06-at-baked.png`, `A-ibu-inside.png`.*
Inside Warung Sari (entered via the Canggu Station door), the objective arrow
(green triangle) points at the **empty meal counter**, while the toast says
*"Ibu Sari is waiting for you first — follow the arrow."* Following the arrow
lands you at the counter, where pressing E yields *"Nothing in reach here
yet."* Ibu Sari is elsewhere in the room (a seated sprite), outside the
narrow talk radius. The literal first instruction in the game misdirects the
player into a dead spot with a contradictory toast loop. **This is the worst
bug in the build because it's unavoidable and it's first.**
Likely cause: the interior objective retarget points at the venue's station
(the meal counter), not at the NPC the Act 0 step actually requires.

### BUG-2 [HIGH — flow] After Ibu, you're stranded inside the interior with an off-map objective
*Evidence: `08-at-villa.png` (run 1).*
Talking to Ibu grants the borrowed scooter + first delivery and immediately
sets the objective to *"Ride to BAKED"* — but the player is still **inside**
the Warung. The only exit is a small dark mat at the bottom edge of the room
that carries **no "leave here" cue and no objective marker**. The on-screen
objective points to a venue that is off-screen and unreachable without first
finding an unmarked door. The autopilot burned 36 seconds trapped here; a
human will feel momentarily lost at exactly the moment the game should feel
like it's opening up.

### BUG-3 [MEDIUM — convention/immersion] You ride the scooter *inside* the warung
*Evidence: `08-at-villa.png` — player is on the scooter inside the room.*
Because the scooter is granted while inside, the player mounts and drives it
around Ibu's dining room. This breaks the Pokémon "interiors are foot-only"
grammar the design doc commits to, and looks wrong.

### BUG-4 [MEDIUM — spatial clarity] Street reads cluttered; a marker floats in empty grass
*Evidence: `02-after-newgame.png`, `04-at-ibu-target.png`.*
Seven-plus venue signboards are legible on screen at once (BAKED, BUNGALOW,
SCOOTER RENTAL, BAKERSFIELD, SATU SATU, FINNS REC, CANGGU STATION), and a blue
"opportunity" disc hovers over **open grass with no venue beneath it** — the
exact "unexplained floating cue" the 2026-07-06 review flagged. The large
dashed tan blocks (building plots) are visually ambiguous with walkable
ground. Camera is zoomed far enough out that the frame is mostly empty green.

### BUG-5 [MEDIUM — unverified content] Packet-05 rice paddies were not visible where specified
The paddies/villa-gates/street-texture packet (RPG-20260706-05) was supposed
to fill the western dead zone and seed a yellowing paddy near The Corner. No
paddies appeared in any spawn/Corner screenshot; the west read as the same
flat grass as before. **Needs a targeted check** that the packet's render
actually reaches the playable frame (it may be off-camera or not wired to the
active street). Flagged, not confirmed, because the harness didn't traverse
west.

---

## Confirmed working (don't touch)

- **No crashes.** 0 console errors, 0 page errors, across both full runs.
- **Boot chain** (title → New Game → cold open) works; copy is good
  ("Morning drops you at the cheap kos with one bag…").
- **Meter diet (08-08)** works exactly as designed — only the Energy micro-bar
  shows in Act 0, not all four. Verified on-screen.
- **Street movement + collision** — no hard traps on the open street; walking
  is responsive to keypresses.
- **Interior entry** via doors works; interiors render warmly (counter,
  tables, seated diners, good palette).
- **Ibu → scooter → delivery grant** fires and advances the act (once you
  actually reach her).

---

## GTA: Chinatown Wars benchmark

GTA:CW is the stated bar. Its greatness rests on four pillars. Scored as
observed:

| Pillar | GTA:CW | Bali Life RPG today | Gap |
|---|---|---|---|
| **1. Tight driving with weight** | Responsive, weighty, drift-on-demand; the car is the toy | Ride model (`RideModel.ts`) already has acceleration curves (0.62s to top speed), coast-to-stop, per-tier top speed, drift, grip, rain-slick — a *genuinely good foundation* | **Feel infra present; unverified in play** because the tutorial blocks reaching open riding. Needs a clean ride sample + human tuning. |
| **2. Dense, legible city; navigate by landmark** | Hand-built, readable, memorable blocks | One authored street, camera zoomed out, clutter + floating markers (BUG-4), no landmark navigation, ambiguous plots | **Large gap.** The world is a diagram, not a place. |
| **3. Constant mission variety with crystal-clear objectives** | Every mission legible in 2 seconds | Objective/guidance layer is exactly where the worst bugs are (BUG-1/-2). A delivery-only loop with one setpiece (Rio race) | **Large gap**, and made worse by broken guidance. |
| **4. Juicy, instant feedback** | Money/wanted/pickups pop constantly | Payout celebration (count-up, scale-punch by run quality, rent pulse) + procedural audio exist | **Good infra;** unverified in the flow, but the closest pillar to par. |

**The honest read:** the build has, on paper, the *ingredients* for pillars 1
and 4 at roughly GTA:CW ambition, and is far from it on pillars 2 and 3. But
none of that can be judged in play until BUG-1/-2 are fixed, because a player
literally cannot get cleanly from boot to a delivery ride. **Fixing the
onboarding is the prerequisite to even measuring against the benchmark.**

The path to "on par with GTA:CW" is therefore ordered, not parallel:
1. **Unblock the on-ramp** (BUG-1/-2/-3) — you cannot tune feel you can't reach.
2. **Prove and tune the ride** against pillar 1 with a clean run + human feel.
3. **Make the street a place** (pillar 2) — density, landmarks, kill clutter.
4. **Mission variety + legible objectives** (pillar 3) — the biggest content lift.

Packets RPG-20260708-04..07 (below, in `docs/prompts/`) address steps 1–3.
Step 4 is deliberately deferred to a design pass, not auto-generated, because
mission variety is a design problem, not a bug-fix.

---

## Method notes / reusable test infrastructure

To drive the game, two fields were added to the debug snapshot
(`__BALI_LIFE_DEBUG__`) in `GameScene.ts`: `objectiveTargets` (resolved world
coords of the current objective) and `interiorExit` (active interior's exit
mat). These are cheap, always-on, and turn the game into something an
automated harness can navigate — **this project should keep and lean on them**;
repeatable automated smoke-playthroughs are exactly what a solo founder with
no time to play needs. The harness itself lives in the session scratchpad; if
it's worth keeping, it should be moved into the repo under `scripts/` in a
follow-up.
