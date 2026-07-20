# NEW PROJECT KICKOFF — Bali RPG, clean-slate rebuild (drafted 2026-07-15)

Status: CEO decision. `bali-life-rpg` is superseded as of this date — its
foundation (art pipeline + monolithic architecture) is a dead end per direct
founder verdict ("the world isn't too much to look at," after four separate
overhaul passes failed to fix it). This file is the onboarding prompt for a
**brand-new session in a brand-new repository.** Paste everything below the
line into that new session's first message.

Why this exists: this project shipped 22 merged PRs, a working economy, and
four narrative acts' worth of character beats — and still landed at "not
much to look at," because every visual in the game is a Phaser `Graphics`
primitive drawn in code (rectangles for buildings, circles for people).
No amount of dressing fixes a world with no real art in it. That is the one
mistake this document exists to prevent from repeating. Everything else
that worked is carried forward deliberately, named below, so a fresh start
doesn't also throw away ten days of hard-won process and narrative lessons.

---

## PASTE BELOW THIS LINE INTO THE NEW SESSION

You are kicking off a brand-new game project: a working title of **Bali
RPG** (final title TBD later — do not bikeshed it now), a life-sim/delivery
RPG set in Canggu/Berawa, Bali. This is a full restart of an earlier
attempt (`bali-life-rpg`) that shipped real, working content but hit a
visual dead end. You have that project's lessons below — both what to keep
and what to never repeat. Read this whole brief before writing any code.

### The concept (carried forward — proven narrative DNA)

**Logline:** A broke outsider arrives in Berawa with nothing but a
backpack and a failing rented scooter, climbs the ranks of a predatory
gig-delivery app ("NusaDrop"), navigates a subculture of wellness
influencers and tech expats, and rallies a local community to build
something real before a venture-backed developer buys out the
neighborhood.

**Central dramatic question:** Can you win by playing the app's
hyper-competitive game, or does survival require trading ambition for
community leverage?

**Theme:** Autonomy isn't bought with a villa; it's built through the
trust of the people you choose to protect.

**The golden thread — "The Algorithm vs. The Street":** NusaDrop is the
recurring antagonist force, not a person. It rescues the player in the
opening, then turns on them (a rate cut) once they're dependent on it. A
hidden two-axis score — Community Trust vs. Platform Efficiency — tracks
every choice the player makes; maximizing one visibly costs the other.
This mechanic, once it existed, is what every later moral choice in the
old project hung on. Keep it.

**Cast function map** (keep the *functions*, feel free to rewrite names/
specifics): a proud, protective warung-owner mentor with a land secret; a
perfectionist craftsman with a moonlighting secret to pay a debt; a
flaky, financially-precarious social bridge into the community; a
transactional-but-fair fixer with quiet generosity underneath; a sharp,
likeable rival on the same app (never a cartoon villain); a polite,
sincerely-self-justifying corporate antagonist developer.

**Act structure that worked:** Act 0 (arrival, ~10 min, escalating stakes
— time pressure → weather → a deadline → the biggest run yet, closing on
a felt collapse into bed); Act 1 (the grind, two turning points, one
scripted downfall reversal, one moral choice, a finale where a
relationship — not a stat — resolves the crisis); Act 2 (two social
"crews" on a real weekly rhythm, a reveal that turns the golden thread, a
second moral choice, the antagonist's first real scene, a finale that is a
seat at a table, not a cutscene). Acts 3+ (owning a business, an open
economic war, eventual multiplayer) were deferred as future scope last
time — re-derive that scoping fresh; don't assume it's still right, but
don't assume it's wrong either.

### The design thesis to re-adopt immediately

**The verb test:** every interactable in the game must serve at least one
of RIDE / TALK / SERVE / UNCOVER / BUILD, or it gets cut before it's ever
built. This single rule, applied retroactively, is what turned the old
project's biggest complaint ("overwhelming with bullshit tasks") into a
fixable problem. Apply it at design time, not as a later cleanup pass.

**The menu rule:** character beats resolve as staged scenes with full
dialogue panels and named NPCs. They never resolve as a row in a generic
activity menu. The old project's worst content was always the generic,
systems-first menu filler; its best content was always a specific,
authored scene with a person in it.

**Fail-forward:** no hard failure states, ever. Late, damaged, or
imperfect play degrades outcomes (less money, a different line of
dialogue) but never blocks progress or forces a retry. This produced a
genuinely low-frustration game and should not be relitigated.

### THE FOUNDATION — decided before any code, non-negotiable

1. **Engine: Phaser 3 + TypeScript + Vite.** This stack was never the
   problem last time — ride mechanics, dialogue, save/load, and the test
   harness all worked well on it. Keep it; don't relitigate engine choice.

2. **Art: real sprite and tileset assets from day one. No procedural
   `Graphics`-drawn primitives for anything the player looks at
   repeatedly** — no code-drawn rectangles for buildings, no code-drawn
   circles for people, no code-drawn ellipses for shadows. Source a
   CC0/free top-down tileset + character sprite pack (search itch.io and
   similar CC0 asset sources for tropical/village/top-down RPG packs),
   and **recolor/retexture it toward a warm tropical Bali palette**
   (terracotta roofs, deep greens, warm dusk lighting) so it reads as
   *this* place, not a generic asset-pack demo. This was a CEO decision
   made specifically to solve "the world isn't much to look at" — it is
   not up for re-litigation without a new explicit decision.

3. **Map: hand-authored, small, and simple.** The old project generated
   its street layout from real-world OSM coordinates, which were
   approximate enough to cause an actual venue-collision bug. Build a
   small number of hand-placed, hand-tuned blocks instead. A tighter,
   authored space that's fully art-directed beats a larger generated one
   that isn't.

4. **Architecture: modular from the start.** The old project's single
   `GameScene.ts` grew across dozens of feature packets into one file
   responsible for rendering, input, dialogue, cutscenes, weather,
   economy, and every story flag — every change touched it, which is both
   a review-risk and (very likely) part of why the world never cohered
   visually. Split by responsibility from the first commit: a scene layer,
   a systems layer (economy/story/delivery), a UI layer, a rendering/
   dressing layer. Set an explicit soft budget (e.g., flag any file that
   crosses ~500 lines for a split) and actually enforce it in review.

5. **Phase 0 gate — do this before any game system exists.** Build ONE
   fully art-directed reference: a single street corner with the chosen
   tileset, one interior with the chosen tileset, and one character
   sprite walking/animated. Screenshot it and get explicit human
   (founder) sign-off that it looks good — not "acceptable," good —
   before writing a single delivery, dialogue, or economy system. The old
   project's fatal process error was building 20+ systems on an unproven
   visual foundation and only discovering the foundation didn't work
   after months of content sat on top of it. Do not repeat that
   ordering.

### Process to re-adopt (this part worked well — keep it)

- **Packet-based spec-driven development:** every unit of work is a
  written contract with a scope, hard constraints, a definition of done,
  and an explicit "do not" list, handed to an execution agent (human or
  AI) as a self-contained brief.
- **Boot-state proof harness:** construct any test/demo game state by
  running the actual gameplay mutation functions in sequence (accept →
  pickup → complete, etc.), never by hand-authoring a fake save file. A
  state gameplay couldn't reach should be impossible to construct.
- **Wave-based delivery with a design contract before packets:** group
  related work into a themed wave, write the beat-by-beat script/contract
  first, then issue packets against it — don't improvise structure
  packet-by-packet.
- **Gate reviews with real screenshots scored against real benchmarks:**
  at the end of each wave, actually look at what was built (not just
  green tests) and score it against concrete reference points (what does
  a good top-down RPG opening look like, what does a good social loop
  feel like) — this caught real problems unit tests never would.
- **Economy/pacing as an explicit, tested contract:** whenever a mission
  count, price, or milestone number matters, assert it in a test, not
  just in prose — this prevented silent balance drift across a long
  project.

### What to never repeat (the actual post-mortem)

- Do not build generic content-generation systems and expect templates to
  fill them with meaningful play. Author specific scenes with specific
  people first; only generalize a pattern after 2–3 authored instances
  prove it's worth generalizing.
- Do not let visual/UX polish be a bolt-on pass applied after systems are
  built. Visual direction is a *foundation* decision, made and proven
  before systems, not a wave inserted later to fix a feeling something is
  wrong.
- Do not generate map/world geometry from real-world data unless you also
  build real validation for it — approximate coordinates caused a real,
  player-blocking bug last time.
- Do not let any one file become the place every feature touches. If a
  packet's diff keeps landing in the same file, that's a signal to split
  it, not a sign the file is doing its job.
- Do not wait until launch for the first real human aesthetic judgment.
  The founder's "this isn't much to look at" verdict arrived after months
  of AI-only screenshot review. Get a real human gut-check on visual
  direction in the first days, not the final ones.

### Reference resource (mine it, don't inherit it)

The old project lives at `~/包包/bali-life-rpg` (or wherever it's since
been archived) and is a legitimate resource for **content and tuning
values**, even though its code and art approach are being discarded
wholesale: dialogue voice for the cast archetypes, ride-feel tuning
constants, economy numbers that were play-tested into shape (delivery
payouts, rent/milestone thresholds), and the full design-contract
documents (`docs/FIRST_TEN_MINUTES.md`, `docs/ACT1_BACKBONE_2026-07-14.md`,
`docs/ACT2_FINDING_YOUR_PEOPLE_2026-07-14.md`, `STORY_BIBLE.md`,
`GAME_DESIGN.md`) are worth reading for the beats and pacing math even
though the implementation is being replaced. Read for ideas and numbers;
do not import code or art.

### Your first deliverables, in order

1. Set up the new repo: Vite + Phaser 3 + TypeScript scaffold, git
   initialized, basic CI (test + build) from the first commit.
2. Research and shortlist 2–3 concrete CC0/free top-down tileset + sprite
   packs suited to a tropical/Southeast-Asian village aesthetic, with
   direct sources and license terms, and recommend one with reasoning.
3. Write the foundation docs, mirroring what worked last time:
   `AGENTS.md` (operating contract), `STATE.md` (source of truth),
   `DECISIONS.md` (append-only decision log), `TODO_LIST.md` (open items
   parking lot), `GAME_DESIGN.md` (the verb-test thesis + carried
   narrative DNA above, written as this project's own design bible, not
   a copy of the old one), `ARCHITECTURE.md` (the modular file-structure
   rule from Foundation §4, made concrete for this codebase).
4. Produce the Phase 0 plan concretely: what the one reference
   scene/interior/character will be, using the recommended asset pack,
   and what "looks good, ship it" vs. "doesn't land, try another pack"
   will be judged against.
5. Stop and ask the founder any clarifying questions you have before
   writing game code — especially anything in this brief that reads as
   assumed rather than decided.
