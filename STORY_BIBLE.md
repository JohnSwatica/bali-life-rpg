# BALI LIFE RPG — STORY BIBLE
**Narrative design document · v4 ("The Algorithm vs. The Street") · canonical**

> **v4 supersession note (2026-07-12).** The CEO pivoted the narrative after
> the first founder playtest (`PLAYTEST_01.md`): the v3 three-thread merged
> bible (Elena/Rumah mystery, Pak Bagus, subak/banjar layer) is **retired**.
> This v4 document — the single NusaDrop storyline — is now the sole canonical
> narrative source. v3 lives in git history if ever needed. Narrative
> references in `GAME_DESIGN.md`, `STORY_ARC.md`, and `ACT3_BUSINESS_DESIGN.md`
> resolve to THIS document where they conflict. The act skeleton
> (hustle → people → build → community, Acts 0–5) is unchanged; what changes
> is the dramatic engine, antagonist, and rival.

## Code reconciliation map (read before implementing anything)

Existing substrate is RESTAGED, not discarded — same rule the GDD set. No
save-schema migration is needed for any of this; internal IDs stay, display
surfaces change.

| v3 / in-code today | v4 canonical | Implementation rule |
|---|---|---|
| "Jalan" gig app (name only in docs; board is generic in code) | **NusaDrop** | All player-facing app/board copy adopts NusaDrop. |
| Rio (npc id `rio`, race setpiece, No-Questions scene, memories) | **Leo** — European expat, top NusaDrop driver | Keep internal id `rio`; change display name/portrait/lines to Leo. Race + No-Questions scenes survive reskinned as NusaDrop leaderboard rivalry. |
| Pak Bagus (npc id `pak_bagus`, inert routine NPC) | **Julian Vance** — Vanguard Co-Living; "Enclave Berawa" | Keep internal id; swap display name, lines, characterization (Western VC, not Balinese returnee). |
| Berawa 2.0 | **Enclave Berawa** (Vanguard Co-Living & Wellness Corp) | Copy swap wherever surfaced. |
| Elena/Rumah thread (notebook/SIM pickups, 3 Discovery Ledger entries, Kadek "Rumah's bike" line) | **Retired.** The mystery is now the NusaDrop hidden metric ("Community Trust Graph vs. Platform Efficiency Score") | Remove/replace Elena content; Discovery Ledger is repurposed to surface the algorithm-investigation thread. |
| Hidden axes `rootedAxis` / `relationalAxis` | **Community Trust Graph vs. Platform Efficiency Score** | Internal fields keep their names; player-facing framing (Act 2 reveal) uses v4 terms. |
| Willow (ambient satire NPC) | Not in v4 cast | Keep as minor ambient texture; no arcs, no narrative-critical references. |
| Subak/banjar/land-certificate machinery (v3 §H) | Replaced by zoning/injunction/permit pressure + Ibu Sari's land certificate beat | The "besok ya" bureaucracy texture survives; the water-politics layer does not. |
| STORY_ARC.md draft spine | Same act skeleton | STORY_ARC.md remains a historical draft; this doc wins. |

**Economy caveat:** v4 quotes realistic IDR figures (50,000 IDR arrival,
500,000 goal, 200,000 tips). The in-game economy currently runs on compressed
toy numbers (Rp 60 deliveries, Rp 450 rent). Treat v4's figures as narrative
flavor targets — do NOT rescale the live economy chasing them until a
dedicated, CEO-approved economy-rescale packet exists.

**Craft rule carried forward from v3 (still binding):** every moral fork
rewards both branches, sets a reputation flag either way, and never
dead-ends. v4's §G choices already follow this shape; keep it for any new
authored choice.

---

## A) LOGLINE & SPINE

### Logline

Arriving in the humid, chaotic, and neon-tinged streets of Berawa with nothing but a backpack and a failing rented scooter, a broke digital outsider must climb the ranks of a predatory gig-delivery app, navigate a hyper-fictionalized subculture of wellness influencers and tech expats, and rally a local community to build an authentic business before a venture-backed co-living developer buys out the neighborhood.

### Central Dramatic Question

Can an outsider achieve the dream of "paradise" by playing a hyper-competitive hustle game, or does true survival require trading personal ambition for community leverage?

### Theme

True autonomy is not bought with a luxury villa; it is built through the trust and mutual reliance of the community you choose to protect.

---

## B) THE GOLDEN THREAD: "THE ALGORITHM VS. THE STREET"

The driving throughline is the player’s relationship with **"NusaDrop"**, the omnipresent gig-delivery app, and its hidden "Optimal Path" rating system.

* **Act 0:** The player registers for NusaDrop out of pure desperation. It feels like a lifesaver, providing instant cash.
* **Act 1:** The app introduces dynamic pricing and localized driver leaderboards, pitting the player against a ruthless rival. The player discovers that local warungs (including Ibu Sari’s) are being squeezed by a sudden 30% platform commission fee.
* **Act 2:** The player uncovers a hidden metric in their PDA—a "Community Trust Graph" vs. "Platform Efficiency Score." Maximizing one lowers the other.
* **Act 3:** The player uses their hard-earned delivery capital to open a physical warung/café, explicitly pulling drivers and suppliers off the NusaDrop network to create a localized, independent trade loop.
* **Act 4:** NusaDrop’s corporate parent attempts to buy out or legally shut down the player's independent café network. The player must leverage all their social crews (surf, run, tech) to execute a district-wide platform boycott, breaking the app's monopoly in Berawa.
* **Act 5 Hook:** The player transforms their independent network into an open-source, peer-to-peer cooperative app protocol, leaving the door wide open for multi-player node operations where new players join the cooperative network.

---

## C) CAST BIBLE

### 1. Ibu Sari (The Anchor)

* **Role:** Warung owner at Canggu Station; mentor.
* **What They Want:** To preserve the neighborhood's culinary identity and protect her family’s land from tax assessments.
* **Flaw:** Stubbornly proud; refuses to accept financial charity or update her traditional bookkeeping.
* **Secret:** She holds the original land certificate for a prime beachfront lot that tech developers are currently trying to claim as "abandoned public domain."
* **Arc:** Moves from a protective maternal guardian to an equal business partner who trusts the player to modernize her legacy.
* **Friction/Help:** Provides emergency meal safety nets when Energy is 0; refuses to sell ingredients to the player if their "Community Trust" flag drops too low.
* **Mechanical Hooks:**
* *Station:* Canggu Station Warung meal loop (High Energy/Low Cost).
* *Opportunity Feed:* Spawns exclusive "Catering Delivery" gigs with fragile cargo conditions.
* *Relationship Arc:* Unlocks access to the secret bulk ingredient market at Tier 3 Affinity.

### 2. Kadek (The Craftsman)

* **Role:** Head baker at BAKED. Berawa.
* **What They Want:** To open an artisanal sourdough laboratory that blends traditional Balinese fermentation techniques with Western pastry design.
* **Flaw:** Chronic perfectionist; suffers from severe burnout and analysis paralysis.
* **Secret:** He secretly bakes all the high-priced pastries for a rival, luxury corporate café under a pseudonym to pay off his brother's scooter repair debts.
* **Arc:** Gains the confidence to quit his corporate moonlighting and becomes the head chef of the player's Act 3 café venture.
* **Friction/Help:** Supplies premium, high-Focus items; requires the player to source rare ingredients during heavy traffic hours.
* **Mechanical Hooks:**
* *Gig Delivery:* Requests raw ingredient imports under tight "Rush Hour" constraints.
* *Meter Modulation:* His pastries give a temporary "Focus Buffer" that freezes the Focus meter decay for 3 in-game hours.

### 3. Ari (The Bridge)

* **Role:** Local surfer, coworking regular, and social node.
* **What They Want:** To maintain a balance between a high-paying remote copywriting job and an uncompromised ocean lifestyle.
* **Flaw:** Flaky, conflict-averse, easily distracted by the next social trend.
* **Secret:** His remote contract expired three months ago; he is currently surviving entirely on credit cards while pretending to work at Satu-Satu Coffee.
* **Arc:** Transitions from a superficial lifestyle-chaser to a grounded community organizer who manages the marketing for the player’s resistance movement.
* **Friction/Help:** Invites the player to social events that drain Money but massively boost the Wellbeing and Social meters.
* **Mechanical Hooks:**
* *Clubs/Crews:* Leader of the "Berawa Surf & Run Crew."
* *Event:* Hosts the "Sunset Beach Circle" every Wednesday and Friday night.

### 4. Made (The Fixer)

* **Role:** Property manager and homewares expert at Bungalow Living.
* **What They Want:** To build sustainable local wealth by managing villa rentals exclusively for expats who reinvest in the community.
* **Flaw:** Highly transactional; views every personal interaction as a future favor or negotiation point.
* **Secret:** He receives kickbacks from major landlords but uses the money to quietly subsidize the rent of elderly residents in the back alleys of Berawa.
* **Arc:** Realizes the corporate developers are playing a game too large for him to fix alone; aligns fully with the player to lock down local real estate.
* **Friction/Help:** Speeds up or slows down the player’s villa acquisition processing times based on reputation flags.
* **Mechanical Hooks:**
* *Rent Pressure:* Intermediary for the player's Kos landlord.
* *Station:* Bungalow Living (unlocks furniture tier upgrades for Wellbeing recovery bonuses).

### 5. Leo (The Rival)

* **Role:** Hyper-competitive European expat; top-ranked NusaDrop driver.
* **What They Want:** To secure a permanent corporate sponsorship from NusaDrop and fund his own drop-shipping empire.
* **Flaw:** Completely transactional, lacks empathy, obsessed with optimization metrics.
* **Secret:** He is one bad review away from account deactivation due to aggressive behavior toward local drivers.
* **Arc:** Serves as a constant performance benchmark. In Act 4, when NusaDrop cuts driver pay by 40%, he suffers a breakdown and can be recruited to the player's independent network.
* **Friction/Help:** Snatches high-paying delivery gigs off the Opportunity Feed if the player doesn't accept them within a 10-second window.
* **Mechanical Hooks:**
* *Opportunity Feed:* Appears as a dynamic leaderboard entity on the player's Phone App.
* *Dialogue Choice:* Triggers high-stakes verbal confrontations at delivery drop-off zones that affect the player's Social vs. Focus meters.

### 6. Julian Vance (The Antagonist)

* **Role:** Managing Partner of "Vanguard Co-Living & Wellness Corp."
* **What They Want:** To consolidate the entire street corridor into a single, gated tech-nomad sanctuary called "Enclave Berawa."
* **Flaw:** Megalomanic savior complex; genuinely believes he is "improving" Bali by pricing out traditional systems.
* **Secret:** His venture fund is heavily leveraged; if three key local properties (including Ibu Sari's) refuse to sell by the end of the dry season, his corporate entity faces total liquidation.
* **Arc:** Escalates from a polite, condescending café customer offering the player a "real job" to a ruthless economic bully using predatory legal filings.
* **Friction/Help:** Locks out venues from the player’s delivery loop by purchasing them or forcing exclusive delivery contracts.
* **Mechanical Hooks:**
* *Phone/PDA:* Sends intimidating, passive-aggressive buyout offers and policy alerts via the Feed.
* *Reputation Graph:* Acts as the negative anchor; high affinity with Julian completely zeroes out the player's local "Street Cred" reputation tag.

---

## D) ACT-BY-ACT BACKBONE

### Act 0: Arrival / Tutorial

* **Emotional Premise:** Overwhelmed displacement turning into raw survival.
* **Player Goal:** Secure shelter, fix the baseline transportation, and earn the first 500,000 IDR.
* **Inciting Hook:** You step off an overnight bus at Canggu Station with a cracked phone screen, 50,000 IDR ($3 USD) in your pocket, and a reservation for a Kos that turned out to be a scam. Ibu Sari finds you sitting on your backpack outside her warung.
* **Turning Points:**
* *Turning Point 1:* Ibu Sari lets you rent her late husband’s old, smoke-belching 110cc scooter on credit if you deliver a catering box to Milk & Madu within 15 minutes.
* *Turning Point 2:* You install the NusaDrop driver app and successfully complete three chaotic deliveries through a tropical downpour condition.
* **Midpoint Reversal:** The Kos landlord demands a double security deposit upfront due to your lack of a formal employment contract, threatening to lock you out by midnight.
* **Closing Milestone:** You hit your first 5-star driver rating bonus on a high-stakes delivery to a luxury villa, hand over the deposit money to the landlord, and collapse into your tiny Kos bed. The Phone calendar ticks to Day 2, unlocking the daily rent counter.
* **Setups/Payoffs:**
* *Planted:* Leo is introduced via the app leaderboard; Julian Vance is seen briefly in the background at Milk & Madu, complaining to management about scooter parking noise.

### Act 1: The Hustle (Pacing Justification: 1 Hour)

> *Design Note: Act 1 is compressed to 1 hour (down from the standard 2 hours) to avoid early-game grind fatigue. The goal is to rapidly transition the player from repetitive fetch-tasks to deep social systems before they disengage.*

* **Emotional Premise:** The exhausting, grinding reality of the gig economy beneath the glamorous surface of paradise.
* **Player Goal:** Upgrade from the unstable rattle-trap scooter to a reliable daily rental and move out of the cramped Kos into an actual shared room.
* **Inciting Hook:** A major software update to NusaDrop lowers the base pay per delivery by 15% while introducing "Surge Zones." Leo mocks your low-tier scooter performance at a pickup hub.
* **Turning Points:**
* *Turning Point 1:* You accept a high-fragility delivery from BAKED. Berawa, where Kadek notices your dedication and adds you to his priority driver list.
* *Turning Point 2:* Made offers you a hidden rental deal on a decent shared room, but it requires a clean financial track record and a recommendation letter from a local business owner.
* **Midpoint Reversal:** Your scooter's transmission blows out mid-delivery near Atlas Beach Fest. You must push the bike 2 kilometers in the heat, ruining the cargo, tanking your app rating to 3.2 stars, and locking you out of premium tiers.
* **Closing Milestone:** Ibu Sari guarantees your character to Made despite your tanked app score. You move into your new room and sign a sustainable weekly scooter rental contract with Bali Family Rental.
* **Setups/Payoffs:**
* *Resolved:* Rattle-trap scooter retired. Kos upgraded to a real room.
* *Planted:* Ibu Sari’s financial strain from NusaDrop's commissions is revealed via a conversation overheard at Canggu Station.

### Act 2: Finding Your People

* **Emotional Premise:** Finding grounding, camaraderie, and shared identity beyond the economic grind.
* **Player Goal:** Join two distinct local social crews, hit Affinity Tier 2 with Ari and Kadek, and clear your app account restrictions.
* **Inciting Hook:** Ari spots you taking a break on the curb outside Satu-Satu Coffee and forces you to join the Berawa Run Crew's morning 5K sprint to clear your mind.
* **Turning Points:**
* *Turning Point 1:* During a run, you assist an injured member, earning the highly sought-after "Reliable" positive reputation tag on your public profile.
* *Turning Point 2:* Kadek invites you to a late-night recipe testing session at BAKED., exposing his secret corporate moonlighting work to you.
* **Midpoint Reversal:** Julian Vance's corporation sponsors the Surf Crew's weekly beach bonfire event, handing out free premium gear. Ari wants to accept the sponsorship; you discover the contract requires the crew to endorse the eviction of the local beach warungs.
* **Closing Milestone:** You convince Ari to reject the corporate sponsorship by organizing a community-funded sunset beach circle event instead. Your Social and Wellbeing meters lock at maximum capacity for the first time.
* **Setups/Payoffs:**
* *Resolved:* App restrictions cleared; player integrates into the local lifestyle.
* *Planted:* Julian Vance’s systematic buyout of local business debts becomes public knowledge on the PDA Feed.

### Act 3: Building Something

* **Emotional Premise:** Transitioning from an exploited gig-worker to an independent community stakeholder.
* **Player Goal:** Fund and open an independent warung-café concept, source 3 local suppliers, and completely stop using the NusaDrop app.
* **Inciting Hook:** NusaDrop permanently bans Ibu Sari's warung from the platform after she refuses to pay an expedited marketing fee. You help her pack up her delivery packaging counter.
* **Turning Points:**
* *Turning Point 1:* Made locates an empty, semi-abandoned commercial structure along the Berawa corridor that is zoned for commercial development.
* *Turning Point 2:* You pitch a partnership to Ibu Sari and Kadek: a joint establishment combining her traditional recipes with his artisan baking, utilizing your network of delivery drivers as a private, fair-wage courier loop.
* **Midpoint Reversal:** Julian Vance files a zoning injunction against your building, claiming the structure fails municipal parking codes, freezing construction unless you pay an astronomical regulatory fee within 48 hours.
* **Closing Milestone:** You leverage your Coworking Sprint station loop to locate a legal loophole regarding historical structures. The café opens its doors for a soft launch. The "Café Business Management" layer officially unlocks.
* **Setups/Payoffs:**
* *Resolved:* Player leaves the gig-app economy; establishes a sustainable physical asset.
* *Planted:* Leo begins losing his top ranking as drivers desert NusaDrop to join the player's fair-wage delivery pool.

### Act 4: The Good Life

* **Emotional Premise:** The superficiality of material wealth vs. the profound responsibility of community leadership.
* **Player Goal:** Acquire the premium custom motorbike, secure the long-term lease on the private villa, and bankrupt Julian Vance's local expansion fund.
* **Inciting Hook:** Your café hits peak profitability, netting you enough capital to buy the high-end motorbike you've eyed since Act 0. Julian Vance visits your villa, offering you a multi-million rupiah acquisition buyout to walk away.
* **Turning Points:**
* *Turning Point 1:* You refuse Vance's offer. In retaliation, his firm pulls a political string to cut the electrical grid grid-lines to your block during a Friday night rush.
* *Turning Point 2:* Leo’s scooter is repossessed by his platform corporate agency after an accident. You find him stranded outside Nude Café and offer him a shift in your independent network.
* **Midpoint Reversal:** Vance attempts to leverage Ibu Sari’s unrecorded beachfront land certificate to seize the property via an eminent domain filing.
* **Closing Milestone:** You coordinate a total digital and physical boycott of all Vance-owned developments. Leo provides the internal data logs proving NusaDrop's price-fixing schemes. The tech fund pulls out, forcing Vance to liquidate his assets and leave Berawa. You stand on the beach with the deed secured.
* **Setups/Payoffs:**
* *Resolved:* The core antagonist is defeated; the villa, business, and bike are fully owned.
* *Planted:* The infrastructure of the independent local courier app is ready for open-source scaling.

### Act 5: The Open World

* **Emotional Premise:** Passing the torch and shifting from individual survival to institutional stability.
* **Player Goal:** Transition your business into a self-sustaining cooperative and become a registered community mentor.
* **Inciting Hook:** A notification pops up on your PDA Feed: a fresh expat has just stepped off the bus at Canggu Station with 50,000 IDR and a broken phone screen.
* **Turning Points:**
* *Turning Point 1:* You walk down to Canggu Station to hand them the keys to your original daily-rental scooter, assuming the exact mentor role Ibu Sari played for you.
* **Midpoint Reversal:** None. The single-player narrative loop smoothly flattens into an expansive, sandbox life-sim loop.
* **Closing Milestone:** You sit at your beachside café, watching your business run without your direct input, while new newcomers navigate the corridor map.
* **Setups/Payoffs:**
* *Resolved:* The single-player story engine safely terminates, unlocking the system architecture for future multiplayer integration hooks.

---

## E) THE HOOK SYSTEM: "WHY COME BACK?"

### 1. The Daily Rhythm Loop ("One More Day")

* **The Meter / Sleep Interlock:** Going to sleep resets Energy, but the efficiency of the recovery is determined by the Wellbeing meter. If a player goes to sleep with a high Social meter, they wake up with a temporary "Inspiration" buff that speeds up Focus acquisition at café stations. This encourages players to balance grinding with socializing before ending a session.
* **The Rent Pressure Engine:** Rent is deducted automatically every Sunday at midnight. The PDA displays a persistent countdown timer. This creates short-term financial targets that prevent players from idling.

### 2. Time-Gated Opportunity Calendars

* **The Secret Bulk Market (Tuesdays/Thursdays, 4:00 AM – 6:00 AM):** An in-game event window where raw baking and coffee supplies cost 50% less. Players must intentionally manage their sleep schedules to catch this window, altering their standard daily loops.
* **The Weekend Surge:** Friday and Saturday nights activate the "Beach Club Rush" condition on the app/opportunity feed. Delivery tips quadruple, but traffic congestion causes scooter handling to become highly unstable.

### 3. Relationship Milestones with Structural Unlocks

* Instead of purely narrative rewards, leveling up NPC relationships unlocks physical short-cuts on the map:
* **Kadek Tier 2:** Unlocks a back-alley shortcut through the BAKED. kitchen, allowing the player to completely bypass the heavily congested main intersection of Jl. Pantai Berawa during delivery runs.
* **Made Tier 3:** Unlocks the "Lease Modification" perk, permanently reducing weekly villa maintenance costs by 15%.

---

## F) TENSION & ANTAGONISTS

| Act | Opposing Force / Antagonist | Tactical Manifestation in Gameplay | Tone / Satirical Bite |
| --- | --- | --- | --- |
| **0** | The Physical Elements & Poverty | Scooter breaking down; low energy meters; steep cost of food vs. low pay. | Raw survival; unvarnished look at arriving unprepared. |
| **1** | Leo & The NusaDrop Algorithm | Dynamic rating penalties; high-value gigs disappearing instantly if player hesitates. | The "Min-Maxing Tech Bro" who treats human life like an optimization spreadsheet. |
| **2** | Corporate Social Greenwashing | Social crews being fractured by corporate lifestyle sponsorships and nondisclosure agreements. | Satire of wellness influencers selling out their favorite local spots for free merchandise. |
| **3** | Municipal Bureaucracy & Zoning | Threat of construction shutdowns; sudden parking code fines issued via the PDA. | The "Besok Ya" systemic runaround where permits are perpetually delayed. |
| **4** | Julian Vance & Capital Aggression | Physical blackouts; targeted legal filings against local suppliers; localized delivery lockouts. | The corporate neo-colonialist who claims he is "saving" the culture he is pricing out. |

---

## G) MORAL / THEMATIC CHOICE POINTS

### Choice 1: The Luxury Tip Dilemma (Act 1)

* **Context:** You are carrying an urgent order for an elite villa expat. En route, you witness a local delivery driver spill their cargo across the road due to a deep pothole.
* **Option A:** Stop and help the driver clear the road.
* *Mechanic Impact:* Tank your delivery timer; lose the premium tip; gain **+15 Green Flag (Street Trust)** and unlock a future free vehicle repair voucher.
* **Option B:** Ride past to secure your 5-star rating and the large tip.
* *Mechanic Impact:* Secure 200,000 IDR; gain **+15 Red Flag (Ruthless Hustler)**; the spilled driver remembers your face, increasing your future parts repair costs at local shops.

### Choice 2: The Whistleblower Sourdough (Act 2)

* **Context:** You discover Kadek is using industrial, low-grade imported flour for his secret corporate moonlighting pastries while marketing them as "100% locally organic."
* **Option A:** Keep his secret to protect his financial stability.
* *Mechanic Impact:* Gain maximum Affinity progress with Kadek; permanently lock out the "Organic Certification" marketing tag for your future Act 3 café.
* **Option B:** Force him to switch suppliers or expose the truth to the local food crew.
* *Mechanic Impact:* Freeze Kadek's affinity loop for 5 days; gain **+20 Green Flag (Authenticity)**; unlocks a permanent 10% discount on local organic flour markets.

### Choice 3: The Enclave Compromise (Act 3)

* **Context:** Julian Vance offers to clear your café's municipal parking fines instantly if you agree to remove Ibu Sari’s traditional menu items from your front display signage to appeal to a "cleaner aesthetic."
* **Option A:** Accept the terms to guarantee the building opens on schedule.
* *Mechanic Impact:* Save 1,500,000 IDR; zero out parking fines; **-30 Affinity with Ibu Sari**; café opens immediately with a 10% revenue bonus from tech expats.
* **Option B:** Reject the terms and crowd-source the fine via social events.
* *Mechanic Impact:* Delays opening by 3 days; triggers a mandatory "Fundraising Night" event loop; **Maxes out Affinity with Ibu Sari**; earns the permanent **"Community Bastion"** public tag.

---

## H) BEAT-TO-MECHANIC MAP

| Story Beat | Existing Core System Used | Exact Mechanical Function |
| --- | --- | --- |
| **Act 0: The Rain Delivery** | Gig Delivery Loop + Weather Condition | High-fragility food cargo; screen overlay shifts to heavy rain; traction handling modifier reduced by 40%. |
| **Act 1: The Breakdown** | Scooter Condition Meter | Bike condition hit 0%; speed caps at 5km/h; triggers an automated repair bill sub-quest via the Phone PDA. |
| **Act 2: Bonfire Rejection** | Clubs/Crews + Event System | Event: "Sunset Beach Circle" is triggered manually by the player spending 300,000 IDR on supplies instead of accepting the corporate sponsor. |
| **Act 3: The Loophole Hunt** | Coworking Station Loop | The player spends 4 continuous game hours at the Satu-Satu Focus Station, converting 100% of their Focus meter into a "Zoning Exemption Document" item. |
| **Act 4: The Blackout** | Café Business Layer + Meter | `[NEW MECHANIC]: Emergency Infrastructure Management` — The café's power grid fails. The player must manually source an emergency generator unit from Made within 3 minutes of real-time play or lose 50% of their stored fresh ingredient inventory. |
| **Act 4: Recruiting Leo** | Dialogue Choice + Relationship Arc | Leo appears as an interactive NPC outside Nude Café with 0 financial resources. Selecting the "Offer Shift" dialogue path transitions him from the Leaderboard App system to your internal business employee roster. |
| **Act 5: Passing Key** | Phone/PDA + Multiplayer Hook | Triggering the "Mentor" option on the Profile menu converts your original scooter asset into a static tutorial item placed at the Canggu Station spawn coordinates. |
