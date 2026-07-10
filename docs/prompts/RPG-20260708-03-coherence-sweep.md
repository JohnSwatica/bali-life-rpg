```
PACKET ID: RPG-20260708-03
PROJECT:   Bali Life RPG
TARGET:    Codex
REASONING: high — cross-system integration audit of nine sequentially-built packets; the bugs it hunts are exactly the TS-passes-but-behavior-wrong class
TITLE:     Coherence sweep — audit the seams between packets 01-09, consolidate tuning constants
PR TAG: [RPG-20260708-03]

===== BEGIN PACKET RPG-20260708-03 =====

ROLE & SCOPE
Packets RPG-20260706-01..09 were built as nine sequential slices, each tested
in isolation. Nobody has audited how they behave TOGETHER. Before strangers
see the build, hunt the seam bugs and pull the now-scattered feel-tuning
constants into one place so post-feedback tuning is a one-file edit, not an
archaeology dig. Run AFTER RPG-20260708-01/02 to catch their seams too.

HARD CONSTRAINTS
- This packet fixes integration bugs and refactors constants WITHOUT changing
  any tuned value or intended behavior. If an audit finding is a design
  question rather than a bug (e.g. "should the payout celebration play during
  a cutscene at all?"), pick the least-surprising behavior, implement it, and
  log it in the findings table for John's review — do not expand scope.
- Constant consolidation is move-only: values stay identical, imports update,
  tests keep passing unchanged.
- No save-schema change. No new systems, content, or UI beyond what fixing a
  found bug strictly requires (GATE v2 restriction applies in full).

DELIVERABLES
1. A seam audit with a findings table (seam, expected, actual, fix/decision)
   covering at least: audio cues firing during cutscenes/letterbox; payout
   celebration vs. act-card collision at the move-out threshold; meter-diet
   hidden meters vs. morning hand / day ledger / station copy that references
   them; cargo-care chip vs. race state and vs. interior mode; race
   eligibility vs. active delivery in BOTH directions; ride-model drift vs.
   checkpoint trigger radii and pickup/dropoff stopping; near-miss flourish
   spam limits in dense traffic; portraits inside cutscene-adjacent dialogue;
   title-screen/reset (08-01) vs. mid-activity and mid-race saves; touch
   fixes (08-02) vs. desktop parity.
2. Fixes for every real bug found, each with a regression test.
3. `src/tuning/FeelTuning.ts`: the feel constants from packets 01-04 and 09
   (audio gains, celebration timings, ride-model curve values, cargo decay
   rates, race ghost pacing/rubber-band caps) re-exported from one module,
   values unchanged, old sites importing from it. Document each constant with
   one line on what changing it does.
4. A bundle-size sanity check (build output size before/after noted in PR)
   and confirmation the Pages workflow stays green.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; test count strictly increases
  (regression tests for found bugs).
- Findings table in the PR with every seam listed above given a verdict, even
  when the verdict is "already correct."
- STATE.md bullet; DECISIONS.md entry listing any least-surprising-behavior
  calls made under constraint #1 so John can veto them cheaply.

DO NOT
- Do not retune any value "while you're in there" — tuning happens after
  human feedback exists, in one place, on purpose.
- Do not refactor GameScene or anything beyond the constant moves.
- Do not add new minigames, systems, content, or guidance surfaces.

===== END PACKET RPG-20260708-03 =====
```
