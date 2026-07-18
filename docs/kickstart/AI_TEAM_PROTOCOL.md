# AI TEAM PROTOCOL — the process that scaled

Bali Life RPG was built by a three-role AI team. The *game's* early direction
had problems (see `POSTMORTEM.md`), but the *process* absorbed a full
narrative pivot mid-project and then shipped ~30 verified packets across four
waves in under two weeks. This file generalizes that process into templates
for the next project.

## 1. Roles

| Role | Who | Owns |
|------|-----|------|
| CEO | John | Vision, tone, scope decisions, playtests, final say. Decisions get *locked and recorded* (e.g. "ending tone = hopeful-communal with one sting, 2026-07-15"), which stops re-litigation. |
| Supervisor (Claude) | review AI | Project reviews, gap analysis, packet authoring, gate reviews, PR review + merge **after actually reviewing** (diffs, tests, build, proof — never a rubber stamp). |
| Developer (Codex) | build AI | Executes packets exactly as scoped, ships proof docs, updates STATE/DECISIONS. |

The separation matters: the builder never grades its own work, and the
supervisor never merges unreviewed work. Merge authority for the CEO's other
projects is never inherited — grant it per-repo, explicitly.

## 2. The doc trio (create on day one of any project)

1. **`AGENTS.md` — the operating contract.** Startup reading order, test/build
   commands, current technical truth (branch, schema version, save key, test
   count), hard boundaries ("do not build X unless the CEO starts that
   phase"), and what "keep working" means. Every new AI session reads it
   first.
2. **`STATE.md` — the handoff truth.** "Copy/paste this into a new session."
   Updated before every stop. *Postmortem amendment:* cap it — newest N
   entries inline, older history archived to `docs/state-archive/`. Bali's
   grew past 700 lines and became a tax on every session start.
3. **`DECISIONS.md` — append-only decision log.** Product/architecture
   decisions with dates. This is what makes CEO decisions durable across
   sessions.

Supporting docs when the project earns them: `VISION.md` (future seams, not
permission), a design doc, a story bible (LATE — see postmortem), and
`docs/ROADMAP.md`.

## 3. The packet system

Work is issued as **packets**: one fenced, copy-paste-ready prompt file per
task in `docs/prompts/`, indexed by a README with a dependency table.

Packet skeleton (proven format):

```
# <PROJECT>-YYYYMMDD-NN — <title>

CODEX: <model> · <effort>          # routing line
DEPENDS ON: <packet id or —>
MAP DELTA: none | <explicit scope>  # any world-growth rule you enforce
SCHEMA: expected to stay at vN      # the no-bump rule, stated per packet

## Context        — why this exists, pointers into canon docs
## Task           — the ONE felt beat/system, tightly scoped
## Out of scope   — explicit non-goals (the follow-ups by name)
## Definition of Done
  - tests added + full suite green (`npm test -- --run`)
  - build green
  - proof doc `docs/<ID>_PROOF.md` with browser screenshots
  - STATE.md + DECISIONS.md updated
```

Rules that earned their place:

- **One verified beat beats five half-built ones.** Scope packets to a single
  felt outcome; name the follow-ups instead of including them.
- **Blocker-first queueing.** When the founder hit a soft-lock, the fix packet
  ran before all story packets.
- **"Landed" means on origin `main`.** A packet is not done at local commit;
  the 2026-07-08 near-miss (nine packets invisible to GitHub while the public
  URL served a stale build) is the standing reason.
- **Stacked branches need explicit base commits.** Every Wave-2 packet stated
  "stacked on W2-0N at `<sha>`". Ambiguity here once deadlocked the builder
  for a session.
- **Reskin ≠ implementation.** A packet that renames things has not shipped
  the story beats; scope "canon swap" and "first felt beat" as separate
  packets and verify the second one in the browser.

## 4. Waves and gates

Packets batch into **waves** (Wave 0 polish → Wave 1 Act 1 spine → Wave 2
Act 2 → Wave 3 ending). Between waves sits a **gate**: a written review
(`docs/WAVEn_GATE_REVIEW_<date>.md`) that checks the wave's promises against
evidence before the next wave is issued.

Gate design lessons:

- Gates that require **human evidence** (a founder playtest, outside players)
  are the only defense against the systems-treadmill failure mode. Bali's
  Phase-3 gate was written for exactly this — and the project still built 13
  days before the first 5-minute human session. Put the first human gate at
  **day 2–3**, not week 2.
- Gates can be **overridden by the CEO, in writing** (GATE v2: "no time for
  the 60-min playtest; outside players become the feedback path; new systems
  stay blocked until 3+ humans respond"). An overridden gate that constrains
  scope is still doing its job.
- The gate output is a **tuning-ticket list, not a feature list**.

## 5. The proof convention

Every packet ships `docs/<ID>_PROOF.md`: test file/case counts, build result,
the browser-proof recipe (boot state + steps), screenshot paths, and
zero-console-error status. The supervisor's review starts from the proof doc
and re-runs what it doubts. Playtests get their own convention: verbatim,
untidied founder feedback in `PLAYTEST_NN.md`, with derived actions living in
DECISIONS.md — rawness is the value.

## 6. Startup template for the next project (condensed AGENTS.md)

```
# AGENTS.md — <project>
1. Read AGENTS.md → STATE.md → DECISIONS.md → <design doc> in that order.
2. Run `git status --short --branch` + inspect recent commits before editing.
3. Commit per small slice. After code changes: <test cmd> and <build cmd>.
4. Before stopping: update STATE.md; append to DECISIONS.md if a decision
   changed. "Done" = pushed to origin with a green proof.
5. Hard boundaries: <the things this project must not build yet>.
6. "Keep working" means: <the current smallest verified-slice priority>.
```
