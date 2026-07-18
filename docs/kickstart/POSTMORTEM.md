# POSTMORTEM — what went wrong, as rules for the next game

John's own framing (2026-07-18): *"I set the tones wrong and it didn't
scale."* This file turns that into specific, checkable rules. Evidence lines
cite what actually happened in this repo.

## R1. Playtest by day 2, not day 13

**What happened:** 16 packets and roughly two weeks of systems work landed
before the first recorded human session — which lasted 5 minutes and ended in
boredom (`PLAYTEST_01.md`, 2026-07-12). The 2026-07-06 supervisory review had
flagged the missing playtest as the #1 risk; a gate was even written for it;
the treadmill won anyway.

**Rule:** the first founder playtest is a calendar event in week one. Nothing
with the word "system" in it gets built after day 3 until a human has played
and been bored *at* the build. Boredom feedback on a small build is cheap;
on a big build it invalidates weeks.

## R2. Hook in 3 minutes is milestone #1 — build the opening first

**What happened:** the first ten minutes were walk/click/read/errand. The
founder's verdict: "this is the death sentence." The cinematic cold-open,
timed stakes, and first meaningful choice were retrofitted in RPG-20260712-02
and a full first-ten-minutes rebuild (RPG-20260713-04).

**Rule:** the opening *is* the vertical slice. Cutscene kit, first plot beat,
first choice, first timed stakes — before any breadth. Target: a stranger
feels the hook inside 3 minutes of a fresh boot, measured on a real run.

## R3. The core verb is the biggest build — do it in week 1

**What happened:** every interaction resolved as the same multi-hit timing
tap. The founder had been "picturing continuous obstacle-avoidance steering…
Diner-Dash-style service." The game's own design doc already ranked delivery
riding as "the single biggest build in the game" — it still got built *after*
the playtest complaint (steering mode, Warung Rush; drift-feel tuning was
still owed at Wave 4).

**Rule:** identify the verb the player performs 200 times (riding, serving,
whatever the next game's is) and make *that* feel good first. Minigame
variety is not polish; it is the hook.

## R4. One storyline, one antagonist — and no bible before the slice

**What happened:** tone was set as cozy three-thread breadth (v3 bible:
Elena mystery + Rumah + subak). It read as "pointless conversations" in
play. The pivot to v4 — single NusaDrop storyline, Leo as rival, Vance as
antagonist, one hidden metric — is what made the story land, and it cost a
full canon swap plus supersession banners across four design docs.

**Rule:** story docs stay one page until the opening slice is fun. Then write
the bible around what played well — one thread, one antagonist with a human
face, one mystery. Also: a canon *swap* is not story *content*; beats must be
felt in the browser (the reskin-only packet had to be caught and redone).

## R5. Build the diet version first

**What happened, repeatedly:** 8 phone tabs → dieted to 4; a six-stat HUD
wall → dieted to chips + micro-bars; ~20 opportunity templates → 6 protected
ones; five guidance surfaces → one field objective line. Every breadth
build was later paid for twice — once to build, once to diet.

**Rule:** when scoping any surface, write down the diet version (the fewest
elements that serve the current act) and build only that. Expansion is a
future packet with evidence behind it.

## R6. Don't build a map pipeline — author one street

**What happened:** an OSM → projection → de-overlap pipeline (900+ road
paths, geocoding caches, layout reports) was built, then abandoned for one
authored 32px tile street, which is the map the whole game shipped on. The
real-world data mattered only as *ordering reference* for venue placement.

**Rule:** for any world-based game: one authored, readable space first;
real-world data as reference JSON at most; no generation pipeline until a
second street is actually needed and the first one is proven fun.

## R7. Cap the meta-docs

**What happened:** STATE.md grew past 700 lines with a 15-entry packet
history inline; startup reading order reached 8 documents. Every session
paid the reading tax, and truth drifted between docs (test counts, branch
truth) until reconciliation passes were needed.

**Rule:** STATE.md keeps the newest ~5 entries plus durable truth; history
moves to an archive file. One place per fact: test count lives in STATE.md
only; other docs point to it.

## R8. "Landed" means pushed, merged, and deployed

**What happened:** on 2026-07-08, nine finished packets existed only on a
local machine while the public URL — the thing outside playtesters would be
sent to — served a build nine packets old. Caught in supervision, but only
because the claim was checked against origin.

**Rule:** done = on origin `main` = live on the public URL. The proof doc
records the deployed check, not the local one.

---

## What scaled well (keep without changes)

- **The process absorbed a total narrative pivot in days.** v3 → v4 canon
  swap, four response packets, and the roadmap re-issued within 48 hours of
  the playtest. Packets + data-first architecture made the game steerable.
- **Schema stability**: v11 held across two act builds; no player save was
  ever invalidated.
- **The verification stack**: 53 → 405 tests, scripted browser proofs, dev
  boot states — regressions were caught by CI and harnesses, not by John.
- **Soft failure / fail-forward design**: no dead ends ever blocked a
  playtest or a proof run.
- **Locked CEO decisions**: recorded decisions ("tone = hopeful-communal with
  one sting") ended re-litigation and let three agents stay aligned.

The short version for the next project: **process and architecture were
right; sequencing and tone-setting were wrong.** Keep the machine, point it
at a 3-minute hook and a fun core verb from day one, and put a human in
front of it before the first week ends.
