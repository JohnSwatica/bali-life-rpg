# Claude Project Review — Bali Life RPG
**Date:** 2026-07-06
**Author:** Claude (Fable 5), full-project review requested by John
**Branch at time of review:** `feat/gameplay-stations` @ `a16b2fa`
**Verified at time of review:** `npm test -- --run` = 176 passed (25 files); `npm run build` = passed

> This is a supervisory assessment, not a decision record. It sits alongside `CLAUDE_ASSESSMENT_BRIEF.md` (Codex's brief asking Claude to assess) as the answering document. Where this review conflicts with older docs on tone/priority, defer to whatever John decides in §6 below — nothing here overrides `GAME_DESIGN.md` or `STORY_BIBLE.md` as canonical design sources.

---

## Verdict up front

In 17 days you've built an unusually deep systems foundation (253 commits, ~28K lines of hand-written code, 176 passing tests) and one genuinely world-class asset: the Story Bible. What you do **not** have is a game that *feels* like anything, a single recorded play-feel session, a playable URL anyone else can reach, or — most alarming — a git remote. The bottleneck is not ideas, content, or code velocity. It is that the project keeps converting effort into *systems* while the three things that make games real — sensation, stakes, and outside players — get zero investment.

---

## 1. What this version actually is

- **A playable vertical slice of Acts 0–2**: guided first day with Ibu Sari → delivery hustle with rent/scooter/rating pressure → clubs/events/relationship arcs, with Act 3+ as hooks. One authored tile street (Jl. Pantai Berawa) plus seven enterable interiors, a phone with nine tabs, a morning "Today's Hand," an evening Day Ledger, a moral-choice opportunity (the No-Questions Package), hidden two-axis reputation, and save migrations through schema v11.
- **Engineering health is genuinely good.** 176/176 tests, deterministic systems extracted into pure helpers, disciplined decision log. For an AI-built codebase this is well above average. Known debt: `src/scenes/GameScene.ts` is 7,464 lines.
- **Docs are the strongest part.** `STORY_BIBLE.md` v3 (Elena/Rumah mystery, Pak Bagus and the subak water-diversion method, the choice-authoring template, the hook system) is publishable-quality narrative design. `GAME_DESIGN.md` is sharp and already contains the correct self-diagnosis: *"The current build fails this test: its only verb is 'read a menu.'"*
- **Screenshots confirm that diagnosis.** Clean flat-color street, good UI copy — but the "villa dropoff" is an E-prompt in empty grass (no villa exists), the west half of the screen is a dead green void, characters are placeholder blobs, and the Milk & Madu "gameplay" is a 400-word DOM menu. The writing is good ("It rattles, but it knows the lane better than you do" is a great line); the presentation can't carry it yet.

## 2. The bottlenecks, ranked

**#0 — No git remote.** 253 commits exist on one laptop disk, `main` is 243 commits behind the working branch, and there are 24 local branches. One disk failure erases 17 days of work. Five-minute fix (`gh repo create` + push) — the only item here with existential downside.

**#1 — The playtest that never happens.** Since June 23, every state doc, the assessment brief, and the roadmap have said the same next move: *human play-feel pass before adding content*. It's been the #1 priority for 13 days, during which ~100 commits of new systems landed instead. One external bug-report pass happened July 1 — bugs, not feel. There is no record anywhere of anyone playing this game for an hour and writing down where it was boring. AI velocity makes *building* feel like progress, so the scarce resource — John's judgment as a player — never gets spent. Every system built before that playtest is inventory piling up in a warehouse nobody has walked into.

**#2 — Systems-rich, sensation-poor.** Zero audio anywhere in the source (verified by grep — no sound API calls at all). The payout moment is a text toast. Riding — the fantasy the game is named for — is "hold W, occasionally tap a timing circle." The GDD already knows this: it calls Delivery Riding "the single biggest build in the game," layer L4, not started.

**#3 — No felt stakes.** Rent is explicitly non-punitive, deliveries all fail-forward, nothing can break down mid-run, nothing can be lost. Reasonable tone decisions individually, but their sum is a survival story with no survival: Act 1's premise is "every rupiah is a fight" and mechanically no fight exists. Tension currently lives only in copy.

**#4 — Scope ratchet in the design docs.** `STORY_ARC.md` implied one street. The Bible added 8 principals + 12 named regulars. The GDD added six districts, ~40 venues, 14 interiors, 12 minigames, portraits, cutscenes, weather, Nyepi. Each doc pass raised the target faster than the build closed the gap. At honest hobby-tier velocity the full GDD is 12–24 months away. Nothing wrong with the vision — but nothing in the repo defines the minimum shippable slice of it.

**#5 — Guidance stacked on guidance.** Five separate "what do I do" systems now exist: HUD objective chip, phone quests, field markers/arrows, the morning hand, the day ledger. Guidance keeps being added because the world itself doesn't communicate. Symptom, not fix.

## 3. Gap analysis by area

**Storylines.** Not lacking ideas — lacking delivery apparatus. The Bible's beats need portraits, act cards, letterboxed scene grammar, staged setpieces (GDD layer L2) to land as story rather than toasts. Missing: the antagonist on screen (Pak Bagus, Rio's rival cadence, the Berawa 2.0 hoarding). Highest-value single narrative build: **Rio's street race** (Act 1 setpiece) — forces RIDE to become real gameplay and delivers the first rival beat in one stroke.

**Mechanics.** Delivery loop math works; delivery loop *play* doesn't exist yet. Priorities: riding feel (acceleration/lean/brake-drift/near-miss feedback) before more checkpoint minigames; one honest soft-failure channel (cold food loses the tip, mid-run breakdown event); collapse the early-game meter surface (four meters + money in Act 0–1 reads as a spreadsheet — Energy + Money should carry the first hour).

**Concepts.** Currently life sim + RPG + tycoon + mystery + platform critique with no one-sentence playable promise. Proposed demo pitch: *"You're broke in Canggu with a borrowed scooter. Rent is due in four days."* Everything in the first 20 minutes that doesn't serve that sentence should be hidden, not deleted.

**Visual design.** Flat-color language is defensible; execution reads overcast-Europe, not Bali. Fixes: saturate the palette (turquoise/gold/lush green); turn the western dead-grass void into **rice paddies** (which is literally the plot — the yellowing subak field is the antagonist's method made visible, so the biggest visual gap and biggest story gap share one fix); add actual villa gates (wall/gate/bougainvillea); add street texture (canang sari on pavement — already a story motif — parked scooters, stray dogs, laundry, cables); eight flat-color portrait busts for Ibu Sari/Kadek/Rio/etc.

**Interactions.** The interaction *stack* is well-engineered now (priority fixes, interiors, station cues). The interaction *content* is still walk-to-marker → E → read paragraphs → click button. Station menus explain risk/reward in prose that should be icons/bars at half the word count.

## 4. The potential — thinking outside the box

The honest ceiling is not "hobby RPG." It's **audience asset**: no game has touched Balinese adat/banjar/subak systems or gig-economy nomad satire, and the "moving to Bali" content economy is enormous and hyper-shareable. A 15-minute browser slice Canggu people forward to each other is a game milestone, a press-able indie story, and — per the game's own Act 5 fiction — literally the front door into the future Nomad Nest world. This reframing justifies a small shareable slice, not more scope, and the identity question (hobby vs. audience-building asset) should be decided *after* evidence, not before (see §6).

Other outside-the-box, cheap-leverage moves:
- **Distribution is one afternoon away.** Static Vite build; `dist/` can go to itch.io/Netlify without violating any no-backend boundary. Ten strangers playing Act 0 will produce more true direction than the next thousand commits.
- **Feel is cheap.** Free SFX packs + one ambient loop, money count-up + coin sound, star-rating punch, engine pitch scaling with speed. Days, not weeks — moves perceived quality more than any system shipped in the last two weeks.
- **Paddies-as-antagonist** — filling dead map space with rice terraces whose color state is act-driven turns set dressing, world-building, and the villain's mechanism into one render pass.
- **Mentor-mode (Act 5)** is the most original retention idea in the docs — protect it.

## 5. How to realize it — the sequence

**Phase 0 (this week, ~3 hours, no new features):**
1. Create the GitHub remote, push every branch.
2. Merge working branch to `main` so `main` means something again.
3. **The playtest.** Fresh save, real device, 60 minutes, voice-note everything: bored, confused, nothing-happened, felt-something moments. Write it raw into `PLAYTEST_01.md`. This document then outranks every design doc for the next month.
4. Deploy `dist/` to a URL, send to 3–5 real people. Their unprompted reactions are product truth.

**Phase 1 — the juice sprint (feel, not features):** audio layer; payout/rating celebration; riding feel v1; one soft-failure channel; paddies + villa gates + street-texture pass; portraits for Ibu Sari/Kadek/Rio only.

**Phase 2 — first-hour to Bible tone:** L2 presentation kit (act cards, letterbox cutscene grammar); Act 0 tightened to 30–45 min per the GDD; early-game meter diet; Rio's race as the Act 1 setpiece.

**Phase 3 — re-evaluate against external playtests before anything else.** Act 3 stays locked, exactly as already decided.

**Freeze list:** six-district map (freeze at one street + beach, done dense), minigames beyond ride/repair/one social, any new guidance/read-model surface (five exist; ban the sixth), crafting scaffold, OSM pipeline (done, stop touching), Act 4/5 content, further design-doc expansion until `PLAYTEST_01.md` exists.

**Cadence rule proposed:** a week ends with a build John played, or the week didn't count. Commits are not the unit of progress anymore; felt improvements are.

## 6. Three decisions only John can make

1. **Identity.** Hobby, or the audience-building front door of the NomadNest universe? Recommend deciding *after* PLAYTEST_01 + five external reactions — evidence is a week away and free.
2. **Stakes ceiling.** How much softness to trade for tension? Recommend keeping fail-forward but making failure cost something visible (tips, time, pride — never progress). Touches the locked "non-punitive" decisions, so it's John's call.
3. **Time budget vs. match.co.** match.co GTM is the stated #1 priority; this project consumed 17 consecutive days of commit history. Whatever the identity answer, put a number on weekly time budget and hold it.

**One-line summary:** the AI org has proven it can build; the next milestone must prove the game can be felt — and only John, playing it, can produce that proof.
