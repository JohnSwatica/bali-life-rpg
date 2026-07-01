# BALI LIFE RPG — STORY BIBLE
**Narrative design document · v3 (fully merged + meta-review-hardened, build-facing)**

> **How to read this doc.** This is the single canonical dramatic spine, cast, world, and hook architecture for the game — merged from three independently-drafted backbones (which converged, unprompted, on the same core tension: a gentrification antagonist, a gig-economy squeeze, a mirror-rival, and a community-vs-cashout theme) plus a new layer of authentic local systems and a varied mini-game roster. It supersedes all prior drafts. Every beat is written to hook into a system that already works in the codebase (delivery loop, four meters, relationship arcs, clubs, events, opportunity feed, stations, reputation/flags, phone, sleep, the villa/business/bike goals). Anything needing new tech is tagged **[NEW MECHANIC]** or **[NEW MODE]** and kept as cheap as the story allows. Nothing here requires multiplayer, real payments, real maps, or a backend — it all runs solo and offline. Act 5 is written as a *door*, never a dependency.

> **v3 changelog — CSO-locked after a three-way meta-review.** Each of the three source AIs was then asked to read the codebase and advise on *how* to merge the arcs; all three independently converged on this document's architecture (Elena/Rumah as emotional spine, real-Bali systems as texture, a daily hook engine as the retention OS, a persuasive non-cartoon antagonist). Treated as validation, not new direction. Six refinements were surfaced and are now locked into this version: **(1)** the antagonist's offers must be mechanically good deals (already §C — reinforced); **(2)** a hard tone guardrail against "money = bad / poverty = authentic" (new, §A); **(3)** the legal/institutional layer is dialed to *light-touch texture*, with the immigration-thriller elements explicitly ruled out (new non-goals, §H); **(4)** a canonical **Choice Authoring Template** — every moral fork rewards *both* branches, sets a reputation flag either way, and never dead-ends (new, §G); **(5)** the hidden reputation graph gets an explicit dual-axis frame (Rooted↔Extractive, Relational↔Algorithmic) (new, §E-8); **(6)** Rio and Made are redeemable mirrors, not obstacles (already §C — confirmed). Open decisions the review settles are marked **[LOCKED v3]** in §K.

---

## Glossary of invented nouns (keep the codebase consistent — these are canonical; do not reuse dropped names below)

- **Elena** — the previous owner of your borrowed scooter. Ran a beloved café called **Rumah**. Lost it to an engineered land squeeze and disappeared. The ghost at the center of the whole story. *Never appears in person until Act 4.*
- **Rumah** ("Home") — Elena's demolished café; now a hoarded-off construction lot. The location-ghost of the game, and the name the player can optionally revive.
- **Rio** — recurring rival. Fellow gig driver → app enforcer ("Jalan Captain") → owner of a slick rival café → potentially an ally. Human, not a cartoon.
- **Pak Bagus** — the human antagonist. Berawa-born returnee who made money abroad and came home to "develop" it. Charming, generous, half-convinced he's helping. Runs **Berawa 2.0**.
- **Berawa 2.0** — Pak Bagus's flagship "conscious luxury community" development. Ate Rumah. Now creeping toward **The Corner**.
- **The Corner** — shorthand for Ibu Sari's block: Canggu Station and the huddle of stalls/venues around it. The next thing Berawa 2.0 wants.
- **Jalan** — the gig-delivery super-app you drive for ("Jalan" = go/road). The economic force of Act 1.
- **Subak Tirta Berawa** — the ~1,000-year-old rice-farmers' water cooperative whose paddies border the strip. Pak Bagus's actual *method*: divert the subak's water upstream to kill the fields downstream, force a distress sale, get the land reclassified out of the protected green zone. This is exactly what happened to Rumah's land, and it's the tool now aimed at The Corner.
- **Banjar Adat Pantai Berawa** — the traditional customary neighborhood council. Runs in parallel to formal government. Belonging here means obligations (communal work, ceremony, showing up), and its goodwill is what actually gates local business legitimacy.
- **Willow** (@WillowWanders) — recurring satirical wellness influencer. Comic texture; becomes Berawa 2.0's friendly face-for-hire. Human underneath.
- **The Co-op** — the drivers' collective the player seeds in Act 3. The community's answer to Jalan, and the built-to-accept-players template for Act 5.
- **The Discovery Ledger** ("Threads" tab on the phone) — a read-only journal that surfaces two kinds of unlockable entries on a schedule: Elena/Rumah lore fragments (the mystery drip) and "how Bali actually works" codex notes (the subtle-teaching layer). One mechanic, two jobs.
- **"besok ya"** — recurring motif: *tomorrow, yeah.* The supplier/landlord/permit-office stall. Comic at first; a weapon Pak Bagus uses later.

**Dropped duplicate names (do not use):** TideRise, Bima Adnyana, Nila Prabasari, Raka Wijaya, Vadim Volkov, Dylan, CepatGo, Kilat (as the app name). Their strongest traits were folded into the canonical cast below.

---

## A) LOGLINE & SPINE

**Logline.** You land in Bali broke, on a borrowed scooter that once belonged to someone who chased this exact dream and vanished. Hustling gig deliveries from a cramped kos toward a café and a villa of your own, you're slowly adopted by a neighborhood that's being quietly bought out from under itself — and you discover the only way to win the life you came for is to become the person who keeps that life alive for the next arrival.

**Central dramatic question (spans all six acts).** *Can you build the dream in paradise without becoming the person who sells it out — the way the one before you did?*

**Theme (one sentence).** Paradise isn't a place you buy, it's a community you belong to; the money was never the point, the people were.

**Tone guardrail — success is celebrated, not moralized (locked v3).** The theme is *how* you win, never *whether*. This game is not anti-ambition and not anti-money: the villa, the business, and the proper bike are real, earned, celebrated victories, and the player should feel great buying each one. The moral axis is **Rooted vs. Extractive** — did you build your success into the place or extract it out — not rich-vs-poor and never "staying broke is more authentic." Two rules enforce this: (1) the material win milestones (villa/business/bike) always land as genuine triumphs, with no scolding attached; (2) the *meaning* of those wins is set by the community you built, not by refusing them — the villa feels hollow if you neglected people and warm if you didn't, but it is always yours to enjoy. The antagonist is not "wanting money"; he's a mirror of *extracting it from a place that trusted you.* Writers: never let an NPC frame wealth itself as the sin.

**Pacing note (uneven by design, argued not assumed).** **Act 0 ≈ 30–45 min** — tight tutorial, not a padded two hours. **Act 1 ≈ 90 min**, run slightly hot — survival tension lands hardest when it doesn't overstay; the relief of a real room should arrive before the grind turns numb. **Acts 2–3 ≈ 2–2.5 hrs each** — this is where the social web and the build live, and where the benchmark hooks (ritual, goal ladder, social attachment, authored payoffs) overlap hardest; retention is won here. **Act 4 ≈ 1.5–2 hrs.** **Act 5** is an epilogue/door, not a timed act.

---

## B) THE GOLDEN THREAD

The thread is a mystery that becomes a mission: ***What happened to Elena, and can you break the pattern that broke her?*** It is simultaneously a mystery, a moral test, a rivalry escalator, and an ambition engine — which is why it can carry the whole game on its own.

**The human story.** Elena arrived exactly as you do — broke, mentored by Ibu Sari, riding the scooter you now ride. She built Rumah, a tiny café everyone loved. Then a family medical emergency back home collided with a "generous," suspiciously well-timed offer brokered by Made and engineered by Pak Bagus. She sold under pressure she didn't choose, Rumah was demolished for Berawa 2.0, the scene quietly branded her a sellout, and she disappeared. Ibu Sari kept her scooter, waiting for her to come back. Nobody will talk about her.

**The mechanism behind the human story (this is where the land/water fight fuses in).** Elena didn't just get a good offer — she got cornered. Pak Bagus's people quietly worked with Berawa 2.0's engineers to divert **Subak Tirta Berawa**'s water upstream of Rumah's landlord's rice plot, killing the yield, triggering a "green zone" reclassification review, and manufacturing exactly the kind of financial and legal panic that makes a "generous" buyout look like rescue. **This is the same playbook now aimed at The Corner.** The golden thread is therefore one fight wearing two faces: a personal wound (Elena) and a living, present-tense threat (the subak feeding The Corner). Solving one is how you solve the other.

**Every existing character is secretly tied to it:**
- **Ibu Sari** kept the scooter and carries guilt for not protecting Elena; mentoring you is partly about getting it right the second time.
- **Kadek** was Elena's baker. His guardedness with new nomads is grief. Completing your café completes Elena's unfinished dream through him.
- **Made** brokered the buyout (for a cut, telling himself he was helping her escape with cash in hand). His ambiguity toward the developer is guilt.
- **Ari** is the live, present-tense version of the nomad who *might* become Elena — a mirror you can influence.
- **Rio** is choosing Elena's exit (cashing out) from ambition, not desperation — the temptation in front of you instead of behind you.
- **Pak Bagus** is the force that cornered Elena and is now circling The Corner next.

**Where it lives across the acts:**
- **Act 0 — Seed.** Under the scooter seat: Elena's water-damaged notebook and an old SIM. Ibu Sari flinches: *"besok ya."*
- **Acts 1–2 — Drip.** Regulars mistake you for "Rumah's driver." Notebook pages and codex fragments surface as milestone rewards. You reconstruct what happened — and start to understand *how* it happened (the subak).
- **Act 3 — Near-payoff.** You track Elena down and learn the full truth. You build your café as the community's counter-move, and the literal mechanism of your business (see the local-partner requirement, §H) is designed specifically not to repeat her mistake.
- **Act 4 — Payoff.** You bring Elena back and reconcile her with Ibu Sari; the community defeats Pak Bagus's play for The Corner non-violently, partly by exposing and repairing the subak diversion. You get everything you came for — and feel *why the people are the point.*
- **Act 5 — Hook.** The scooter's lineage passes on: a new backpacker steps off at Canggu Station, and now **you're** the mentor who lends the bike.

---

## C) CAST BIBLE

> Format per character: **Role · Wants · Flaw · Secret · Arc (0→5) · Friction/Help · Interaction hooks (tied to existing mechanics).**

### Ibu Sari — the mentor (emotional anchor of Acts 0–1)
- **Role.** Warung auntie at Canggu Station. Lends your first scooter, gives your first gig, dispenses practical wisdom.
- **Wants.** To keep her corner and its soul alive, and to see the nomads she adopts not lose themselves.
- **Flaw.** Gives too much, never asks for help, too proud to be seen needing rescue.
- **Secret.** She's quietly behind on a Pak Bagus–engineered "lease review," and she blames herself for Elena — she pushed Elena toward the café dream and couldn't protect her from the fallout.
- **Arc.** Your protector (0–1) → your teacher and the neighborhood's memory (2) → someone *you* protect (3) → saved by the community she built, reconciled with Elena (4) → hands you her role: you become the one who lends the scooter (5).
- **Friction/Help.** Nearly all help early: bailouts, advice, warm meals. Friction is emotional — she deflects the Elena question, and her refusal to accept help becomes the Act 3 obstacle you must route around.
- **Hooks.** (1) **Station/warung meal** — a reliable Wellbeing + advice node; gates her relationship arc. (2) **Relationship arc** — tier beats slowly open the Elena story and, later, her own trouble. (3) **Opportunity feed** — recurring gig-giver; her gigs teach mechanics in Act 0–1. (4) **Reputation** — being reliable for her is the game's first green-flag source. (5) **Discovery Ledger** — she's the one who eventually explains what a lease review/green-zone review even means (see §H).

### Kadek — the craftsman (future co-founder)
- **Role.** Baker at BAKED. Berawa. Kitchen skill and quiet standards.
- **Wants.** Creative freedom — to bake *his* recipes in *his* place.
- **Flaw.** Risk-averse; terrified of disappointing his family; hides behind a stable job.
- **Secret.** He's been developing recipes in private for years, and he was Elena's baker at Rumah. His guardedness is grief.
- **Arc.** Cool and testing you (1) → warms as you prove you're not a flake (2) → joins your warung as head baker, his dream realized through yours, Elena's kitchen legacy continuing (3) → co-owner and anchor of the café's success, fiercely loyal if you protect him from Rio's poaching (4) → the café's steady hand as the world opens (5).
- **Friction/Help.** Early friction: won't give you the good gigs/intel until earned; may test you with his own "besok ya." Later: pure help — his skill is what makes the café *good*.
- **Hooks.** (1) **Delivery** — early gigs pick up/drop at BAKED; reliability raises affinity. (2) **Relationship arc** — tiers unlock his recipes and the Rumah backstory. (3) **Business layer (Act 3)** — mechanical source of premium menu items and quality. (4) **Rival hook** — Rio tries to poach him in Act 3; protecting Kadek is a moral choice point. (5) **Mini-game** — Café Service Rush and dawn pastry crunch runs (see §I) are staged with him.

### Ari — the peer / the live mirror (your first friend)
- **Role.** Fellow nomad and surfer; hangs at the coworking space; your bridge into the run crew and the sunset circle.
- **Wants.** To belong — to be "authentic Bali," not just another tourist.
- **Flaw.** FOMO and flakiness; chases the next shiny thing; allergic to commitment.
- **Secret.** Far more precarious than the vibe suggests — visa about to lapse, funding the lifestyle on fumes, and he's quietly taken a Willow-style brand deal from Berawa 2.0 that he's ashamed of.
- **Arc.** Golden-boy welcome-wagon (2) → revealed as precarious and compromised (2, midpoint) → the player's influence tips him toward growing up *or* drifting toward becoming the next Elena (3) → depending on player, grounds himself in the community or leaves — a visible echo of the central question (4) → if grounded, a fellow "regular" who helps mentor newcomers (5).
- **Friction/Help.** Help: opens the whole social layer. Friction: flakes on plans, over-promises, and his compromise with the developer creates a trust test.
- **Hooks.** (1) **Clubs** — your entry to run/surf crews and the sunset event. (2) **Events** — pulls you into scheduled beach nights (the "one more day" social lure). (3) **Relationship arc** — tiers reveal his precarity; helping or judging him sets a flag. (4) **Visa clock** — his lapsing visa is the first lived introduction to the real immigration-pressure system (see §H). (5) Optional romance seed (studio decision), friendship-first, gated on high affinity.

### Made — the fixer and the bridge to the local systems (the compromised friend)
- **Role.** Local who "knows everyone." Works at Bungalow Living. Smooths landlords, permits, bureaucracy — and is the player's actual bridge into the **Banjar Adat Pantai Berawa** and any legitimate local business partnership.
- **Wants.** To be the indispensable connector — and, underneath, to protect his community while never being cut out of a deal.
- **Flaw.** Plays every side; physically cannot say no to a transaction.
- **Secret.** He brokered Elena's buyout to Pak Bagus — took a cut, told himself he was getting her out with money in her pocket. It's why he goes quiet whenever Berawa 2.0 comes up.
- **Arc.** Charming universal helper (1–2) → his role in Elena's exit surfaces (2) → the player forces a reckoning; he can be pushed to choose a side (3) → if redeemed, uses his connections to help save The Corner, and to broker the player's *real*, banjar-blessed business partnership — turning his greatest sin into the tool that fixes it (4) → the neighborhood's honest fixer (5).
- **Friction/Help.** Help: solves landlord/permit problems (a mechanical "get out of bureaucracy" button — at a price). Friction: his fee, his divided loyalty, and the moment you learn what he did.
- **Hooks.** (1) **Opportunity feed** — spawns "fixer" opportunities (smooth a landlord, skip a permit line) for money/favors. (2) **Reputation** — using Made can set hidden flags depending on how you use him. (3) **Relationship arc** — his redemption is a full arc gated on a moral choice. (4) **Station** — Bungalow Living is where you furnish/upgrade rooms and later the café. (5) **Local-partner mechanic** — he is the literal route to the PT PMA/leasehold path and banjar introductions your Act 3 café legally needs (see §H — this is a NEW but light mechanic riding his existing opportunity/relationship hooks).

### Rio — the recurring rival (the temptation in front of you)
- **Role.** Arrived the same season as you. Tops the Jalan driver leaderboard. Cocky, sharp, weirdly likeable.
- **Wants.** To *win* — to prove the dream is just a game you optimize, and to never be poor again.
- **Flaw.** Believes everything is a transaction; mistakes leverage for respect; can't tell when he's the one being used.
- **Secret.** He came for the exact reasons you did and buried it; he privately admires you for taking the harder road, which is why he needles you.
- **Arc.** Rival driver, always one rung up/down the leaderboard (1) → promoted to **Jalan Captain**, now the human face enforcing the app's rate cuts on your friends (2) → opens a slick, Pak Bagus–funded rival café next to yours (3) → **redeemable**: when he realizes the app used him too, he can defect and help seed the Co-op — or, if the player burned him, he doubles down (4) → if redeemed, a co-founder of the driver Co-op and a possible mentor himself (5).
- **Friction/Help.** Friction the whole way: leaderboard pressure, poaching Kadek, undercutting the café, taunts. Help only if earned: his defection is a major Act 4 win.
- **Cadence (recurring, not constant).** Rio surfaces on a **minimum one authored touch every 2–3 in-game days across Acts 1–4**, rotating through three modes so he never goes mechanically flat:
  - **Race mode** — he's visibly ahead of you on a ladder you can see: driver rating, a room upgrade, crowd recognition, launch timing, bike tier, investor attention.
  - **Flex mode** — he shows the seductive, shinier version of your own fantasy.
  - **Truth mode** — he briefly reveals the cost of his path, complicating the rivalry emotionally instead of leaving it purely mechanical.
  The player should always know what rung Rio is standing on that they haven't reached yet.
- **Hooks.** (1) **Delivery/leaderboard** — recurring rival races and rating duels (Pokémon-rival cadence). (2) **Reputation** — how you compete (clean vs. dirty) sets flags and gates his redeemability. (3) **Business layer** — his café is the direct Act 3 competitor. (4) **Event** — a public race/showdown milestone in Act 1 and a "collab or war" beat in Act 3.

### Pak Bagus — the human antagonist (the force)
- **Role.** Berawa-born, went abroad, made a fortune, came home to "develop" it. Runs Berawa 2.0. Charming, generous, sponsors the run club, funds a temple restoration, remembers your name.
- **Wants.** To build a "world-class, conscious" Bali he can be proud of — and, under it, to be respected at home by the community that once saw him as the kid who left.
- **Flaw.** Genuinely can't see the difference between improving a place and erasing it; confuses generosity with absolution.
- **Secret.** He knows exactly what he did to Elena, and it eats at him; he half-wants someone to stop him. That crack is how the community wins in Act 4 — not by defeating him, but by giving him a way to be the hero of his own story instead.
- **Method (concrete, not abstract).** His real tool is the **Subak Tirta Berawa** diversion-and-reclassification playbook described in §B — an "administration" pressure that looks like paperwork and water-rights technicalities from the outside, and looks like a slow-motion siege from the inside.
- **Arc.** Ambient billboard presence (0) → charming benefactor who's everywhere (1–2) → makes his move on The Corner and offers *you* the golden ticket (2–3) → escalates via permits, "besok ya," and buyouts (3) → the community's stand, the exposed subak diversion, and Elena's return force his hand; he can be made to relent and even fund the neighborhood's survival to save face (4).
- **Friction/Help.** Almost pure friction, but *seductive* — his offers are real, generous, and would genuinely make your life easier. That's the point.
- **Hooks.** (1) **Opportunity feed** — sponsorship offers and buyout pitches arrive as tempting opportunities. (2) **[NEW MECHANIC] Permit/administration obstacle** (§H) — a soft, non-combat pressure applied to The Corner and your café. (3) **Event** — Berawa 2.0 launch parties and permit hearings are scheduled events you can attend/oppose. (4) **Moral choice points** — his offer is the central fork of the game.

### Elena — the ghost (never seen until Act 4)
- **Role.** The absence at the center. Your scooter's former owner; founder of Rumah; the cautionary tale.
- **Wants (in the past).** The same thing you want. She almost had it.
- **Flaw.** Trusted the wrong "help" at the worst moment; too proud to ask the community to fight for her.
- **Secret.** She never wanted to sell — a parent's medical emergency back home forced a fast decision, and Pak Bagus/Made engineered the timing (and, unknown to her at the time, the subak diversion). She isn't a villain; she was cornered.
- **Arc.** Rumor and notebook pages (1–2) → located and understood (3) → returns for your café's moment and reconciles with Ibu Sari; her blessing reframes your victory and closes the loop (4) → her legend rides on with the scooter (5).
- **Friction/Help.** Neither, directly — she's a mystery that resolves into grace. **Not a romance.**
- **Hooks.** (1) **Discovery Ledger** — her notebook pages/voice memos, dripped as milestone rewards. (2) **Relationship arc (late)** — a short authored arc in Act 4 when you find her. (3) **Business layer** — reviving "Rumah" as your café name is an optional payoff.

### Willow (@WillowWanders) — satirical color (recurring, human underneath)
- **Role.** Wellness/travel influencer. Wants free smoothie bowls "for exposure," runs a "digital detox retreat" while doomscrolling, asks if the açaí is ethically sourced while ordering the €14 oat-milk everything.
- **Wants.** To keep the brand — and the free life — afloat.
- **Flaw.** Has confused an audience for a community.
- **Secret.** The brand is a house of cards; she's one bad month from broke, which is why she takes Pak Bagus's money to promote Berawa 2.0.
- **Arc.** Pure comedy (1–2) → revealed as Berawa 2.0's paid smiling face (2–3) → a beat that humanizes her precarity; she can become a small ally (feature your café authentically) if treated with grace (4).
- **Hooks.** (1) **Opportunity feed** — "collab" opportunities that are traps (unpaid "exposure" gigs) or genuine boosts. (2) **Event** — she hosts/ruins scheduled events. (3) **Reputation** — how you handle her sets minor social flags; a real feature from her can boost the café.

---

## D) ACT-BY-ACT BACKBONE

Each act now also names which real-world local systems it teaches (via the Discovery Ledger, see §H) and which mini-games it introduces (see §I), so richness compounds instead of front-loading.

### ACT 0 — Arrival / Tutorial
- **Emotional premise.** *I made it here. Now what?* Wonder tightening into "how do I not starve."
- **Concrete goal.** Survive day one: movement/phone/scooter, first delivery, energy management, sleep.
- **Inciting hook.** Ibu Sari lends you a scooter. Under the seat: Elena's water-damaged notebook and an old SIM. Ask whose it was and she deflects: *"besok ya."* The Berawa 2.0 hoarding looms on the corner, unexplained.
- **Turning points.** (1) First paid delivery via Ibu Sari teaches the delivery loop and money/energy. (2) The scooter sputters — scooter-condition as a system, and Elena's bike as a fragile inheritance. (3) A regular reacts to the bike ("hey, that's—") then stops themselves.
- **Midpoint complication.** You run out of energy far from home: push on and tank Wellbeing, or accept a stranger's favor (first tiny reputation beat).
- **Closing milestone.** First night's sleep in the kos; first star rating banked; the phone lights up with tomorrow's rent countdown and a fresh Feed. *You've landed.*
- **World-systems seed.** First Discovery Ledger codex note: *"kos vs. a lease vs. a villa"* — the building/rent taxonomy, explained the moment the player asks why their room is so bad for the money.
- **Mini-games.** None new — keep the tutorial clean. The first delivery reuses the existing timing-tap framework.
- **Planted:** Elena mystery; developer presence; scooter fragility; rent pressure. **Resolved:** none (tutorial).

### ACT 1 — The Hustle
- **Emotional premise.** *Every rupiah is a fight, and the city doesn't care if I make it.*
- **Concrete goal.** Make rent, build your driver rating to the next tier, move from the kos to a real room.
- **Inciting hook.** Rent due date lands; Jalan pushes a "new driver bonus" that quietly resets to a lower base rate a week in — your first taste of the app's squeeze.
- **Turning points.** (1) Meet **Rio** topping the leaderboard; a public streak-duel event sets the rivalry (Race mode). (2) A brutal week — a rate cut *and* a costly scooter repair — puts you underwater; **Ibu Sari bails you out**, but you glimpse a lease-notice on her stall. (3) A regular or Kadek lets slip your bike was "Rumah's," and Rumah is gone — first solid Elena fragment (notebook page #1 readable).
- **Midpoint reversal.** The scooter dies at the worst possible moment (rush-hour, rainy, fragile-cargo gig, a big villa tip on the line) — this is the **Rainy-Night Delivery Run [NEW MODE]** mini-game (see §I). You either limp home broke or take a shady "no-questions" package to cover the gap — a **flag-setting** choice. Ibu Sari helps again; you realize *she can't keep doing this.*
- **Closing milestone.** You make rent, hit the rating tier that unlocks better gigs, and move into a real room (visible progression). You resolve to find out what happened to Elena and to the neighborhood.
- **World-systems seed.** Codex note on Jalan's opaque rating/commission system (grounded in the real gig-economy pressures Indonesian drivers actually face) — the game's first lesson that the app is a system, not a villain with a face yet.
- **Mini-games introduced.** **Rainy-Night Delivery Run [NEW MODE]** (weather-triggered, occasional, high-value gigs only). **Market Haggle [REUSE dialogue-choice]** at a produce stall — a light negotiation exchange for cheaper ingredients/parts.
- **Planted:** Ibu Sari's trouble; Rio's ambition; Berawa 2.0's plan; the Co-op idea (drivers grumbling about rates). **Resolved:** immediate survival; kos → room.

### ACT 2 — Finding Your People
- **Emotional premise.** *I don't just live here — I'm becoming one of them.* Belonging, shadowed by a scene wound nobody names.
- **Concrete goal.** Join crews (run/surf/coworking/food), become a regular, go from "that delivery guy" to "one of us."
- **Inciting hook.** Ari drags you into the run crew and the sunset beach circle; acceptance is suddenly on the table — and so is the scene's memory.
- **Turning points.** (1) Inducted into a crew (belonging milestone), a seat at the sunset circle. (2) As a regular, people finally talk: you assemble Elena's buyout story and learn **Made brokered it.** (3) **Pak Bagus makes his move** on The Corner (a "lease review," a permit snag) and reveals himself as the Rumah developer.
- **Midpoint reversal.** The temptation goes personal: **Pak Bagus offers *you* a prime, subsidized retail spot in Berawa 2.0** (or a lucrative sponsorship). Simultaneously you discover **Ari is quietly on the developer's payroll**, ashamed. A friend is compromised, the villain is generous, and turning your back on The Corner would genuinely be *easier.*
- **Closing milestone.** You're fully "one of us" — real friends, a found family — and the neighborhood's fight becomes yours. You decide the answer is to **build your own place**: an anchor The Corner can't lose. Rio is promoted to **Jalan Captain** and starts enforcing the app on your friends (Flex mode curdling toward Race mode with teeth).
- **World-systems seed.** Codex notes on **green-zone** land ("jalur hijau") and what "reclassification" actually threatens; a first, still-oblique mention of **Subak Tirta Berawa** as the thing whose water is "having problems" near The Corner. Crew induction is where the player first hears about **Banjar Adat Pantai Berawa** and what showing up for it means (gotong royong, ceremony obligations).
- **Mini-games introduced.** **Surf Balance Session [REUSE balance-tap]** with Ari's crew, narratively staged as a beach-reset ritual, not a generic activity. **Coworking Focus Sprint [REUSE timing-tap]** at Satu-Satu with Dewi/the crew, dressed as real planning work, not filler.
- **Planted:** the café as the community's counter-move; Made's redemption; Rio-as-enforcer; the developer's offer looming. **Resolved:** "am I welcome here" (yes); the shape of the Elena mystery.

### ACT 3 — Building Something
- **Emotional premise.** *I'm not hustling for someone else's app anymore — I'm building the thing that holds this place together.*
- **Concrete goal.** Turn a warung into a café (business layer), while saving toward the villa and a proper bike, while defending The Corner.
- **Inciting hook.** You open your warung — huge, hard-won — right as Pak Bagus's pressure on The Corner intensifies.
- **Turning points.** (1) The warung opens and lives or dies day to day against **Rio's slick VC-backed café** next door. (2) Pak Bagus escalates via the **"besok ya" administration game** — permit trouble, a "noise complaint," a buyout pitch for *your* spot. (3) You **track down Elena** — the mystery's near-payoff — and learn she was cornered, not corrupt, and exactly how (the subak).
- **The local-partner requirement (this is the literal legal mechanism of opening the café, not flavor text).** Foreigners cannot hold freehold land title (Hak Milik) in Indonesia. To open the café *legally*, the player must choose: **(a) the slow, real path** — a genuine local partnership (naturally Made brokering it, or Ibu Sari/Kadek as co-founder) via leasehold (Hak Sewa) or a proper foreign-investment company (PT PMA), earning **Banjar Adat Pantai Berawa** goodwill along the way; or **(b) the fast, fragile path** — a grey-market **nominee** arrangement (a local holds title on your behalf, legally unenforceable) or direct Berawa 2.0 capital, which is faster and slicker but is *literally Elena's mistake, mechanically reenacted.* This fuses directly into the central moral fork (§G, Choice 3).
- **Midpoint reversal.** The café nearly collapses: an engineered health-permit shutdown, a supplier who bails *"besok ya"* at the worst time, **Rio poaching Kadek** or undercutting you, or an old red flag resurfacing. You can't out-hustle this alone — you rally the community (crews, regulars, grumbling drivers). **The Co-op is born here.**
- **Closing milestone.** The café survives and becomes a genuine community anchor (optionally renamed **Rumah**); the villa and bike are within reach; you've made contact with Elena and set up her return.
- **World-systems seed.** Codex notes on **PT PMA / Hak Sewa / nominee ownership** (triggered by the actual choice above, not a lecture beforehand); on **Nyepi** — the island-wide Day of Silence lands mid-act as a forced, no-work, no-lights rest beat the player must plan the business around (a natural pacing gift, not an obstacle to route around); on the **visa run / KITAS** system, now urgent since a KITAS becomes available *through* the legitimate business path — legitimacy buys stability.
- **Mini-games introduced.** **Café Service Rush [NEW MODE]** — a light multi-order juggle during a busy service window (occasional, milestone-triggered, not every day). **Permit-Office Gauntlet [NEW MODE or REUSE dialogue-choice chain]** — a "besok ya" bureaucracy sequence where reading the room (patience vs. pushing vs. calling in a favor) determines the outcome.
- **Planted:** the final stand for The Corner; Elena's homecoming; Rio's crossroads. **Resolved:** "can I build something real" (yes); the truth about Elena.

### ACT 4 — The Good Life
- **Emotional premise.** *I got everything I came for. Why does it only mean something because of them?*
- **Concrete goal (solo win).** Own all three — villa + business + bike — and win the fight for The Corner without ever throwing a punch.
- **Inciting hook.** The villa and the bike are finally affordable — the same week Pak Bagus forces the endgame on The Corner (a final deadline/hearing).
- **Turning points.** (1) Villa and bike purchased (material milestones fire). (2) **The community's stand** — the crews, the Co-op, the café, and exposing/repairing the **Subak Tirta Berawa** diversion (a public, non-combat accountability play) make the takeover untenable, aided by Pak Bagus's own crack of conscience and, if redeemed, **Made's connections** and **Rio's defection.** (3) **Elena returns** for the café's big moment and reconciles with Ibu Sari — the emotional climax.
- **Midpoint reversal.** The win has a price: choose between **taking Pak Bagus's final, life-changing offer** (secure your future, abandon The Corner) **or spending your savings/leverage to save it** (delay the villa, risk your gains). The theme, made mechanical.
- **Closing milestone.** The solo victory is achieved *and reframed*: villa, business, bike — and the moment that lands is the family gathered and The Corner saved, the subak running clean again. *The money was never the point.*
- **World-systems payoff.** The subak restoration is the literal non-combat climax mechanic (see §I collective-action content), not a metaphor — repairing/reopening the water channel is a concrete, playable act the community does together.
- **Mini-games introduced.** **Subak Channel Repair [NEW MODE]** — a simple physical/timing puzzle (clearing a blocked channel, resetting a shared gate) done communally. **Offering-Making [REUSE dialogue/timing]** for the reconciliation ceremony with Elena and Ibu Sari.
- **Planted (Act 5 hook):** a new backpacker steps off a scooter at Canggu Station, lost, exactly like you were. Ibu Sari looks at you. **Resolved:** the central dramatic question; the Elena thread; the fate of the neighborhood.

### ACT 5 — The Open World (future door; single-player-safe now)
- **Emotional premise.** *It's my turn to be the one who catches someone.*
- **Concrete goal.** Become the mentor.
- **Inciting hook.** Multiplayer unlocks (future); *now*, an epilogue **"Mentor mode / New Game+"** lets you guide an AI newcomer through the Act 0 beats while the Co-op and café keep running as living systems.
- **How it works solo today.** You lend Elena's now-legendary scooter to the next arrival; the café runs as an ongoing station; the Co-op persists as a club; reputation and relationships carry forward. Every structure that would later hold real players (mentor role, Co-op, shared venues, events) is built to *accept* them — nothing here needs them yet.
- **Planted / Resolved.** The lineage motif pays off and re-opens: the story is designed to keep going, with or without other people in it yet.

---

## E) THE HOOK SYSTEM *(the most important section — why the player starts the next session)*

**1. The Daily Ritual — "one more day."** Every in-game morning the phone Feed assembles a fresh hand: 2–3 stand-out gigs (with conditions/tips), one social invite, one help-out, a flash deal, a rumor, and — when scheduled — one golden-thread breadcrumb. Sleep advances the day and rerolls the hand. Meter and rent pressure give the day a soft goal. *Delivered by: opportunity feed + sleep + phone + meters.*

**2. The Objective Ladder — always a visible next rung (Pokémon).** The Quests screen always shows the immediate next objective, and three persistent goal bars — **Villa / Business / Bike** — sit on the Profile as the north star. *Delivered by: quests + the three goal trackers.*

**3. Seeded mysteries with scheduled payoffs.** **Main (Elena/Rumah):** one readable Discovery Ledger entry unlocks per act-milestone or rating tier, so a question is always open. **Minor recurring mysteries, each with a scheduled reveal:** *Who keeps leaving fresh canang sari at Rumah's ruin?* (payoff: Ibu Sari, late). *Why does one driver always pull the best gigs?* (payoff: Rio's Captain status). *What is Berawa 2.0's real footprint?* (payoff: the map of who's next). *Why is the rice going yellow near The Corner?* (payoff: the subak diversion, the concrete villain mechanism). *Delivered by: quests + opportunity feed + relationship arcs + the Discovery Ledger.*

**4. Between-session cliffhangers.** A gig pre-accepted for tomorrow, an NPC text promising news "besok," a Calendar appointment (a race, a beach night, a café opening, a hearing, Nyepi), the rent due date, a Berawa 2.0 deadline ticking, a visa-run clock. *Delivered by: calendar + events + opportunity feed + rent timer + visa timer.*

**5. Time-gated & recurring events — the weekly rhythm.** Club-recurring slots and scheduled specials give the player a week they can learn and look forward to:
  - **Monday dawn** — Ari's run crew.
  - **Tuesday evening** — Milk & Madu pizza-night social aggregator (anyone-can-show-up energy).
  - **Wednesday dawn** — pastry/supply crunch at BAKED with Kadek.
  - **Thursday afternoon** — Satu-Satu coworking sprint and planning block.
  - **Friday night** — FINNS/Atlas service surge; loud economy spikes, not home.
  - **Sunday sunset** — beach circle / neighborhood service event, the emotional spine of the week.
  Plus irregular antagonist deadlines (permit hearings, launch parties) and the ceremonial calendar (Nyepi, Galungan, odalan) layered on top. Missing any of it costs *softly* (affinity, a missed opportunity) — never a game-over. *Delivered by: events (scheduled + club-recurring) + clubs + calendar.*

**6. Relationship milestones — earned intimacy (Stardew).** Per-NPC affinity tiers unlock authored arc beats, paced so the next beat is always one or two good interactions away, each ending on a small hook. The memory system has NPCs reference your past choices, compounding the sense of a life. *Delivered by: relationship system (affinity + memory + arcs).*

**7. Escalating stakes.** Antagonist pressure climbs act to act — app rate cuts → developer circling → permit war → final stand — so as the player's capability grows, what's at risk grows with it. *Delivered by: opportunity feed + events + the permit obstacle + reputation.*

**8. Reputation feedback loops & redemption hooks.** The hidden reputation graph tracks the player on **two axes**, so the game can read *character* rather than just tallying good/bad points: **Rooted ↔ Extractive** (did you build into the place or pull value out of it — the theme's axis) and **Relational ↔ Algorithmic** (did you move through people and trust or through ratings and optimization — the Rio axis). Every consequential action nudges a position on these axes; the axes, not a single score, are what NPCs, endings, and Rio's/Made's redeemability read. On top of the axes sit visible positive tags you want to grow and a fuller hidden flag taxonomy with guaranteed redemption paths: **Reliable, Rooted, Scene-Chaser, Opportunist, No-Show, Calm-in-Chaos, Extractive, Loyal, Performs-Caring.** No red flag is a dead end:
  - *No-Show* → redeemed by showing up unpaid at a bad hour.
  - *Opportunist* → redeemed by taking a loss for a friend or customer.
  - *Extractive* (the shady-package flag, §G Choice 1) → redeemed by refusing an equally tempting shortcut later and being seen doing it.
  - *Performs-Caring* → redeemed by consistent, unglamorous, boring reliability over time.
  *Delivered by: reputation/trust graph.*

**9. Collection / completion pull (Pokémon).** A filling-in Berawa map (~40 venues), a "regular" status meter per venue, crew memberships, a growing Contacts book, Kadek's recipe collection, the reputation-tag set, and the Discovery Ledger's completion count (codex notes + lore fragments). *Delivered by: stations/venues + clubs + business layer + reputation + phone.*

**10. The café/business engine (Act 3+ retention spine).** Once open, the café is its own daily/weekly loop — restock, daily specials, host events, beat Rio's numbers — a reason to log in *after* the story beats and the seed of the endgame. *Delivered by: business layer (designed) + events + stations.*

**11. Streaks & compounding rhythms.** Delivery streaks, rating momentum, crew-attendance streaks, café daily-special chains. *Delivered by: delivery loop + clubs + business layer.*

---

## F) TENSION & ANTAGONISTS (per act, escalating, in-tone)

- **Act 0.** *Environmental/self:* energy, unfamiliarity, a failing borrowed bike. Ambient: the Berawa 2.0 hoarding, a shadow on the wall.
- **Act 1.** *Economic:* Jalan — rate cuts, rating risk, predatory conditions; rent; scooter decay. Impersonal and grinding. Rio arrives as *competitive*, not hostile, pressure.
- **Act 2.** *Social + moral:* the scene's politics and its buried Elena wound; Made's compromise; Pak Bagus steps from shadow to charming benefactor and makes his first move on The Corner; his personal offer tempts you; Rio becomes the human enforcer of the app.
- **Act 3.** *Institutional + competitive:* the "besok ya" administration game (permits, complaints, buyout pressure on your café); Rio's rival café and poaching; a supplier who stalls; an old flag resurfacing; the local-partner choice forces the theme into a literal legal decision.
- **Act 4.** *Existential + collective:* the final play for The Corner, and the internal antagonist — the temptation to take the money and leave (become Elena/Rio). Resolved *collectively and humanely*: the community, the exposed subak diversion, Pak Bagus's own conscience, and redeemed allies.
- **Act 5.** Tension deliberately releases into stewardship; new low-stakes friction (a struggling newcomer to help) mirrors Act 0 — the escalation ladder resets for the next person.

**Tone rule enforced throughout:** every antagonist is someone the player *half-understands.* Pak Bagus thinks he's saving Bali. Rio is a scared kid who chose armor. Jalan is a faceless algorithm with a friendly local recruiter. Willow confused an audience for a family. No cartoon villains; no combat; conflict is social, economic, environmental, and emotional.

---

## G) MORAL / THEMATIC CHOICE POINTS (interacting with the hidden reputation graph, §E-8)

**Choice Authoring Template (locked v3 — every fork below is built to this shape).** The single biggest craft note from the meta-review: a moral choice is only good if *both* branches are genuinely tempting. Never a right answer and a punishment. Every choice point in this game must satisfy all four:
1. **Both branches pay something real.** Each side gives a concrete, wanted reward — the Rooted branch is never "the correct choice with no cost," and the Extractive branch is never "obviously bad." (Reference shape — the Act 1 rain gig: *push through* = cash + rating boost, damaged cargo, `Opportunist`; *pull over and protect it* = trust unlock + a recipe/relationship gain, algorithmic penalty + a smaller payout, `Rooted`.)
2. **Both branches cost something real.** The tempting path always has teeth; the principled path always has a price. If a branch is free, it isn't a choice.
3. **Each branch writes to the two-axis graph (§E-8) and is remembered.** No cosmetic choices. NPCs reference it later.
4. **No branch is a dead end.** Every flag has a redemption path (§E-8); the story bends around the choice, it never locks the player out of content permanently.

The seven forks below are all instances of this template — read each as "both sides are real."

1. **The shady package (Act 1).** Broke and behind, take a "no-questions, no-contact" gig to cover the gap? *Green:* refuse, eat the loss, earn driver-community trust. *Red:* take it, plant the *Extractive* flag, which resurfaces in Act 3. *Interacts with:* driver reputation, the Act 3 permit callback.
2. **Made's reckoning (Act 2).** On learning Made brokered Elena's buyout: expose him publicly, confront him privately, or shield him and steer him toward making it right. *Shapes:* Made's redemption arc and whether his connections help save The Corner and broker your legitimate business path in Act 4.
3. **The developer's golden ticket vs. the local-partner path (Act 2→3) — the central fork, now mechanically real.** Accept Pak Bagus's subsidized Berawa 2.0 spot/sponsorship or grey-market nominee shortcut (easier, faster, betrays The Corner, mechanically reenacts Elena's mistake) — **or** commit to the slow, real local partnership via Made/the banjar (harder, slower, earns lasting trust and a KITAS through legitimate means). *Shapes:* the entire endgame texture, a large red/green swing, whether the community trusts your café, and whether Elena's story repeats or breaks.
4. **Competing with Rio (Act 3).** He poaches Kadek / undercuts you. Retaliate dirty (sabotage, poach his staff, spread rumors) or compete clean and try to reach the person under the armor. *Gates:* Rio's redeemability and his Act 4 defection.
5. **How the subak fight resolves (Act 3→4).** Quietly pay to repair the diversion yourself (fast, private, lets Pak Bagus save face early) or rally the banjar publicly to force accountability (slower, louder, more just, riskier for you socially in the short term). *Shapes:* how public Pak Bagus's reckoning is, and the collective-action meter's late-game texture.
6. **Elena's homecoming (Act 4).** Side with the scene's grudge and blame her, or extend grace and bring her back. *Heals or reopens* the community wound; a defining green-flag beat that colors the ending.
7. **The final cost (Act 4).** Saving The Corner demands real sacrifice — delay the villa, spend the savings, burn every favor — versus securing your own solo win first. *The theme as a button.*

*(All seven are consequential to standing and story; none are cosmetic. Each writes to the trust graph and is remembered by NPCs.)*

---

## H) WORLD-SYSTEMS & SUBTLE-TEACHING APPENDIX

Every system below must enter the game as a **lived micro-event first**, get explained **diegetically by an NPC**, and only then become a system the player consciously uses — never a tutorial dump. The Discovery Ledger's "codex note" entries are the optional deeper-read version for players who want it; the game must be fully legible without ever opening them.

| Real system | First lived micro-event | Who explains it | Becomes | Ledger codex note |
|---|---|---|---|---|
| Land/ownership (no foreign freehold; Hak Sewa / Hak Pakai / PT PMA; nominee risk) | Player jokes about "just buying a place someday"; Made laughs, a little too hard | Made | The literal Act 3 business-opening choice (§G Choice 3) | *"Why you can't just buy a villa"* |
| Zoning / green zone (jalur hijau) | The rice near The Corner starts going yellow; nobody wants to talk about it | Ibu Sari, reluctantly | The stakes of the subak thread becoming visible | *"What 'green zone' actually protects"* |
| Building/rent taxonomy (kos vs. rented room vs. leased house vs. villa) | Player's kos is a single bad room; asks why it's so expensive for so little | Ibu Sari, Act 0 | The housing ladder the player climbs | *"Kos, kontrakan, villa: the ladder"* |
| Subak (Subak Tirta Berawa) | A farmer NPC blocks the road arguing about water allocation | A subak-member regular, or Ibu Sari | The Act 4 climax mechanic (channel repair) | *"The thousand-year-old spreadsheet: how a subak shares water"* |
| Banjar/adat (Banjar Adat Pantai Berawa) | Player is asked to help set up for a ceremony and doesn't understand why it's mandatory-feeling | Made, at crew induction (Act 2) | The gate on local business legitimacy | *"The other government: what a banjar actually does"* |
| Ceremonial calendar (Nyepi, Galungan, odalan, canang sari) | Nyepi lands mid-Act-3: the whole island goes dark, no work, no lights | Ibu Sari / Kadek | A forced rest beat the player must plan the business around | *"A day the whole island goes quiet"* |
| Visa/immigration (visa runs, overstay fines, KITAS) | Ari mentions his visa is "about to be a problem" a little too casually | Ari | A recurring soft clock; KITAS becomes reachable via the legitimate business path | *"Why Ari keeps disappearing for a weekend"* |
| Gig economy (opaque algorithm, ratings, commissions) | First rate cut lands without warning | felt directly, then confirmed by other drivers grumbling | The Act 1 economic antagonist and the seed of the Co-op | *"How Jalan actually decides what you get paid"* |

**Design rule:** never use the incorrect "confiscated passport / fast-travel locked" framing for visa pressure (an earlier draft's error) — it is legally inaccurate and punishes the player by removing a convenience. Visa pressure is a *clock and a cost* (a fine, a visa-run trip), never a lockout.

**Depth dial — light-touch texture, not a legal thriller (locked v3).** The meta-review's sharpest warning: this layer makes the game feel *specifically Bali*, but if it goes heavy it turns a warm life-sim into an immigration/legal simulator and breaks the tone. Ceiling of detail: teach the *shape* of each system (enough that the player understands why a choice matters), never the fine print. **Ruled out entirely** (these appeared in source drafts and are non-goals): deportation sweeps, passport confiscation, visa fraud, fake-contract crime plots, crypto/money-laundering subplots, government crackdowns, or any courtroom/legal-victory climax. The antagonist's method stays *administrative pressure* (water rights, zoning review, permits, "besok ya") — a slow social/economic siege the community answers socially, never a crime the state prosecutes. When in doubt, cut toward warmth.

---

## I) MINI-GAME ROSTER APPENDIX

The GTA: Chinatown Wars lesson: many small, distinct, tactile mini-games keep moment-to-moment play fresh — but only if they stay **occasional**, tied to specific narrative contexts, never demanded on every repetition of a loop.

| Mini-game | Trigger context & frequency | Core interaction | Stakes / fail-forward | Tag |
|---|---|---|---|---|
| **Rainy-Night Delivery Run** | Weather (rain) + a high-value/fragile-cargo gig; occasional | Dodge obstacles/traffic/potholes on wet roads while gassing it for a speed bonus | Protects cargo quality + scooter condition; failing costs some payout/condition, never the delivery outright | **[NEW MODE]** |
| **Market Haggle** | Buying ingredients/parts from a stall NPC; occasional | A short dialogue-choice negotiation (push, charm, walk away) | Better price vs. a small relationship cost if too aggressive | [REUSE dialogue-choice] |
| **Surf Balance Session** | Ari's dawn surf crew; occasional, capped per week | Balance-tap timing, narratively staged as a real surf attempt | Wellbeing/Social boost scaled by performance; wiping out is just funny, not punishing | [REUSE balance-tap] |
| **Coworking Focus Sprint** | Satu-Satu planning blocks with the crew; occasional | Timing-tap dressed as "getting in the zone" | Focus boost + planning progress toward the business | [REUSE timing-tap] |
| **Café Service Rush** | A busy service window at your own café, milestone-triggered (grand opening, a big event), not daily | Juggle a few simultaneous simple orders under a light timer | Reputation/tips scale with performance; a bad rush costs a little standing, never closes the café | **[NEW MODE]** |
| **Permit-Office Gauntlet** | A "besok ya" bureaucracy beat (Act 3 permit trouble); milestone-only | A short branching dialogue-choice sequence (patience / push / call in a favor) | Outcome shapes timeline and cost of the permit; a bad run costs time/money, never a hard block | [REUSE dialogue-choice chain] |
| **Subak Channel Repair** | The Act 4 community climax; once, communal | A simple physical/timing puzzle (clear debris, reset a shared gate) done alongside NPCs | The literal non-combat resolution of the antagonist's method | **[NEW MODE]** |
| **Offering-Making** | Ceremony beats (Nyepi prep, the Act 4 reconciliation) | A short timing/dialogue sequence assembling a canang sari or similar | Social/Wellbeing + banjar standing; a rushed offering is a light miss, not a fail | [REUSE timing-tap/dialogue-choice] |
| **Night-Market Foraging** | An evening opportunity-feed event, occasional | A light collect/avoid pattern moving through a crowded market | Small item/money reward; a bump-into-someone miss just costs a little time | [REUSE existing pickup pattern] |
| **Rival Showdown (public race)** | Rio's Act 1 streak-duel and Act 3 "collab or war" beat; milestone-only, twice total | A head-to-head delivery race against Rio, existing delivery loop under a shared timer | Reputation + rivalry-arc branching; losing doesn't end the rivalry, it colors it | [REUSE delivery loop, new framing] |

**Sequencing rule:** each act introduces 1–2 fresh entries (see §D per-act "Mini-games introduced" lines); nothing repeats often enough to feel like a chore. `[NEW MODE]` entries are real engineering — sequence one at a time in later implementation phases, never all at once.

---

## J) BEAT-TO-MECHANIC MAP

| # | Story beat | Existing mechanic that delivers it | New tech? |
|---|---|---|---|
| 1 | Ibu Sari lends the scooter; first gig | Opportunity feed (gig-giver) + delivery loop + scooter-condition | — |
| 2 | Find Elena's notebook/SIM under the seat | Discovery Ledger entry surfaced on first ride | **[NEW MECHANIC]** (Ledger) |
| 3 | Rent looms; land in the kos; sleep | Rent timer + home-base station + sleep/day cycle | — |
| 4 | Jalan's rate cut / bad-rating risk | Delivery loop conditions + star rating + meters (Money) | — |
| 5 | Meet Rio; streak-duel showdown | Delivery leaderboard + scheduled event | — |
| 6 | Ibu Sari bails you out; glimpse her lease notice | Relationship arc beat (Ibu Sari) + opportunity feed | — |
| 7 | "That's Rumah's bike" — Elena drip | Relationship arcs (regulars/Kadek) + Ledger entry | uses #2 |
| 8 | The shady-package choice | Opportunity feed (special gig) + reputation flags | — |
| 9 | Scooter dies at the worst moment | Scooter-condition + weather/rush/fragile conditions | — |
| 10 | kos → real room (progression) | Home-base upgrade + Money goal | — |
| 11 | Join run/surf/coworking/food crews | Clubs/crews + club-recurring events | — |
| 12 | Become a "regular" | Station/venue affinity + regular-status meter | Light: per-venue regular meter |
| 13 | Learn Made brokered Elena's buyout | Relationship arc (Made) + Ledger payoff | uses #2 |
| 14 | Pak Bagus's move on The Corner | Opportunity feed + permit/administration obstacle | **[NEW MECHANIC]** (permit obstacle) |
| 15 | Pak Bagus offers YOU the golden spot | Opportunity feed (buyout/sponsorship) + moral choice + flags | — |
| 16 | Ari revealed as compromised/precarious | Relationship arc (Ari) + optional romance gate | — |
| 17 | Rio promoted to Jalan Captain (enforcer) | Delivery-system role change + events + reputation | Light: app-status flag on Rio |
| 18 | Green-zone / subak texture surfaces | Discovery Ledger codex notes + ambient dialogue | uses #2 |
| 19 | The local-partner/PT PMA business choice | Relationship arc (Made) + moral choice + business layer | Light: choice flags feeding the business layer |
| 20 | Nyepi lands mid-Act-3 | Calendar/event system, a scheduled full-stop day | Light: a "forced rest day" event type |
| 21 | Open the warung | Business layer (designed) + station | Designed, not yet built |
| 22 | Rio's rival café opens next door | Business layer competitor + event | Designed |
| 23 | "besok ya" permit shutdown / supplier stall | Permit obstacle (#14) + opportunity feed (supplier) | uses #14 |
| 24 | Rally community to save the café; Co-op is born | Clubs (a driver Co-op club) + collective-action meter | **[NEW MECHANIC]** (light support/petition meter, reuses clubs) |
| 25 | Track down Elena; learn the truth | Short late relationship arc + final Ledger entries | uses #2 |
| 26 | Buy villa + bike (solo win) | Villa/Business/Bike goal trackers + Money | — |
| 27 | Community stand + subak repair vs. Pak Bagus (non-combat) | Collective-action meter (#24) + Subak Channel Repair mini-game + events (hearing) + reputation | uses #24, §I |
| 28 | Made's connections / Rio's defection help win | Relationship arcs (Made, Rio) gated on prior flags | — |
| 29 | Elena returns; reconciles with Ibu Sari | Event (café opening) + relationship arc payoff + Offering-Making mini-game | uses §I |
| 30 | Optionally rename café "Rumah" | Business layer (name field) + narrative flag | Designed |
| 31 | New backpacker arrives; you become mentor | Epilogue "Mentor mode"/New Game+ + lend-scooter beat | **[NEW MECHANIC]** (epilogue mode, future MP door) |
| 32 | Mini-game roster (§I) | Mix of existing timing/balance/dialogue-choice framework + a handful of new modes | Several **[NEW MODE]**, sequenced one at a time |

**Kept intentionally minimal.** The only genuinely new mechanics/modes this story asks for are: the **Discovery Ledger** (a phone tab surfacing scheduled read-only entries — cheap), the **permit/administration obstacle** (a soft pressure object, non-combat), the **collective-action/support meter** (reuses the existing clubs system), the **Act 5 mentor epilogue**, and the handful of `[NEW MODE]` mini-games in §I (sequenced one at a time in later phases, never all at once). Everything else — including the entire local-systems/subak/banjar layer — rides existing systems as authored content.

---

## K) OPEN DECISIONS (handed back to the studio to lock)

1. **How dark does the developer subplot go?** **[LOCKED v3]** Pak Bagus is a *seducer with a conscience* who can be turned, never a crook who gets punished. Ceiling: he only ever does "just business" — administrative pressure that's plausibly deniable and even well-intentioned in his own head. No openly cruel act, no crime. His offers are genuinely good deals (§C, §A tone guardrail). The community "wins" by giving him a way to be the hero of his own story, not by destroying him.
2. **Does Rio become a friend?** **[LOCKED v3]** Redeemable but player-gated. His Act 4 defection is a top-tier payoff, available only if the player competed with some grace (the Relational axis + the "compete clean" flag from §G Choice 4). A fully-burned Rio does **not** hard-fail into a cartoon villain — he gets a "grudging respect" off-ramp: he stays a rival, keeps his café, and tips his hat to the road you took. No clean-villain ending for him; he's a mirror to the end.
3. **Is romance in?** Recommended: seed it, friendship-first, optional, non-blocking — most naturally with Ari or Kadek, gated on high affinity. Elena is explicitly not a romance. Confirm ship-in-v1 vs. stub-for-later.
4. **Does the player revive the name "Rumah"?** Recommended: offer as an optional, emotionally loaded café-naming choice rather than forcing it.
5. **Elena's fate/backstory specifics.** Locked as "cornered by a family emergency + engineered timing, not a sellout." Confirm whether she left Bali entirely or is hiding nearby (affects Act 3 "find her" staging: online vs. in-world travel).
6. **Ibu Sari's peril ceiling.** She's behind on an engineered lease review. Confirm we never threaten her with anything the community can't undo — she must be saveable, and the win must be collective, not a solo rescue.
7. **The Co-op as Act 5 bridge.** Confirm it's the intended fiction-hook for future multiplayer, built to accept real players later.
8. **Pacing sign-off.** Confirm the uneven pacing argument (§A) versus a flat ~2 hrs/act.
9. **Willow's weight.** Confirm whether she stays pure comic texture or gets the small humanizing arc (recommended: give her one beat so the satire has a heart).
10. **How deep/accurate should the real-legal-systems layer go?** **[LOCKED v3]** Accurate but light-touch — teach the *shape* of PT PMA/Hak Sewa/nominee risk and zoning without turning the game into a legal simulator. Immigration-thriller elements ruled out (see §H depth-dial non-goals). When in doubt, cut toward warmth.
11. **Is Made the sole bridge to the banjar/subak world, or does that need a dedicated new elder character?** **[LOCKED v3]** Made stays the sole bridge — it deepens his redemption arc and avoids cast bloat. No new elder character.
12. **Mini-game build order.** Recommended sequencing: Rainy-Night Delivery Run first (Act 1, highest narrative leverage), then Café Service Rush and Permit-Office Gauntlet (Act 3, tied to the business layer build anyway), then Subak Channel Repair last (Act 4, one-time use). Confirm or reorder.

---

*End of Story Bible v3. Every beat above is designed to be authored into existing systems; the flagged new mechanics/modes are small, sequenced, and optional-friendly. All macro/narrative decisions in this document are made by design (the CSO), not the coding agent — hand the coding agent fully-specified, per-phase packets derived from this bible (exact NPC data, exact seed beats, exact copy), never the bible itself as a "build what you see fit" brief. One implementation phase at a time — never all at once.*
