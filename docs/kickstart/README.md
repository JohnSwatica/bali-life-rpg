# Kickstart Package — what to carry from Bali Life RPG into the next game

Created 2026-07-18 at John's request: "if I were to take away some foundations,
concepts and builds I laid for this game so that it could help scaffolding my
future games, what are those?"

This folder is the answer, packaged to be fed to a future project. It is
deliberately honest: it contains what *earned* reuse, and a postmortem of what
did not, so the next game doesn't re-pay this game's tuition.

## Contents

| File | What it is |
|------|-----------|
| `FOUNDATIONS.md` | The portable technical + design foundations: architecture patterns, systems worth lifting (with exact source paths in this repo), the verification stack, and design concepts that survived contact with a real playtest. |
| `AI_TEAM_PROTOCOL.md` | The AI-team operating system that actually scaled: the AGENTS/STATE/DECISIONS doc trio, the packet format, waves and gates, proof conventions, and role split — written as copy-ready templates. |
| `POSTMORTEM.md` | What went wrong (tone, scale, sequencing), distilled into rules for the next project. Read this first when starting something new. |

## How to use this in a future project

Two modes, use either or both:

1. **As a project brief.** At the very start of a new game project, paste
   `POSTMORTEM.md` + `FOUNDATIONS.md` + `AI_TEAM_PROTOCOL.md` into the first
   AI session (or commit this folder as `/kickstart` in the new repo and make
   it required startup reading in the new AGENTS.md). It sets the build order,
   the process, and the anti-patterns before any code exists.
2. **As a code quarry.** Give the new project read access to this repo
   (`JohnSwatica/bali-life-rpg`). `FOUNDATIONS.md` names the exact files that
   are engine-portable or Phaser-portable; most of the pure systems have zero
   Phaser imports and lift out with their tests.

## The one-paragraph summary

The durable asset from Bali Life RPG is not the Bali content — it is (a) a
data-first, deterministic-systems architecture where all game logic is
headlessly testable and the save schema migrates forward forever, (b) a
verification stack (unit suite + debug snapshot + composable dev boot states +
scripted browser proofs) that let AI agents ship ~30 verified feature packets
in two weeks, (c) an AI-team process (packets, waves, gates, proof docs) that
survived a full mid-project narrative pivot, and (d) a set of hard-won design
rules — hook in 3 minutes, core verb first, one storyline, diet-first UI,
playtest by day 2 — that this project learned the expensive way.
