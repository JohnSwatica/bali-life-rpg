# THE FIRST TEN MINUTES — director's script (2026-07-13)

CEO directive (verbatim intent): *"focus on developing the first 10 minutes of
game play, make it so that it's impossible for first time player to not fall
in love with the experience. Make it as immersive as possible."*

This document is the design contract for RPG-20260713-03 and RPG-20260713-04.
It supersedes the current Act 0 back half. Sources: `PLAYTEST_01.md` (the four
problems), `STORY_BIBLE.md` v4 §D Act 0 (the beats — this script implements
them nearly verbatim), `GAME_DESIGN.md` §1 (five verbs, rebuild rule) and its
Act 0 sketch (morning light opening, night as end-of-day payoff, bleak kos as
BUILD motivator).

## The diagnosis (why it "still feels the same")

The current Act 0 front-loads its only two good minutes: a 51-second cinematic
cold open, then one steering catering ride. Everything after collapses back
into the pre-pivot grammar — walk to marker, press E, click a row in a DOM
activity menu ("Quick caffeine reset"), walk home, press E, sleep panel, text
cards. Minutes 2–10 contain zero played beats, zero weather, one flat daylight
palette, and none of the bible's actual Act 0 arc (downpour deliveries, the
midnight deposit ultimatum, the 5-star villa run, the collapse into bed).
The benchmarks' first-10 grammar — Pokémon, GTA:CW, Stardew — is escalating
playable beats with rising stakes and an emotional close. We have one beat and
no stakes after minute 2.

## Hard rules for minutes 0–10

1. **No activity menu, no station panel, no shop list.** Every interaction in
   the first ten minutes is a scene, a ride, or a phone moment. Menus may
   exist in the world but nothing in Act 0's critical path opens one.
2. **Every meter/money change is a byproduct of something the player did.**
   Nothing says "+Energy" from a list row.
3. **Rising stakes:** each beat must raise pressure over the previous one
   (credit debt → app signup → storm → midnight ultimatum → highest-value run
   → deposit paid). The player should always know the next thing they *want*.
4. **Fail-forward everywhere.** Late/wet/damaged = less money and different
   dialogue, never a retry wall. The Ibu-vouch branch guarantees Act 0 always
   completes.
5. **Skippable, never stuck:** every scene skips (existing ESC/tap path);
   skip resolves to the default-forward branch. New Game → first live stakes
   stays under 3:00 (the RPG-20260712-02 budget, already met — do not regress).
6. **Sensory arc across the day:** morning gold → high harsh noon → storm dusk
   → lantern night → exhausted collapse. Day 1's clock is authored, jumping at
   beat boundaries so the arc lands on schedule.

## The script

| Time | Beat | Verb | What the player feels | Sensory targets |
|---|---|---|---|---|
| 0:00–0:50 | **Cold open** (exists — keep) | watch/choose | dumped, broke, one lifeline | morning gold; bus idle; phone buzz |
| 0:50–2:20 | **RIDE 1 — the catering box** (exists — keep) | RIDE | first taste of the scooter; a clock and a debt | engine note, countdown, payout sting |
| 2:20–4:00 | **SCENE — inside Milk & Madu** (rebuild) | TALK | you're a nobody in someone else's paradise | interior chatter bed; espresso hiss; Vance cameo complaining at the counter; laptop nomads |
| ~3:30 | **Phone moment — NusaDrop signup** (diegetic, in-scene) | phone | the app feels like a lifesaver | signup flow on the phone shell; leaderboard flash: #1 LEO; first gig pings as you stand up |
| 4:00–6:00 | **RIDE 2 — first app run, storm breaks mid-ride** | RIDE | chaos; the sky opens on you | visible rain layer, slick physics ON, thunder, rain audio bed, wet-street tint |
| ~5:50 | **Midpoint reversal — landlord ultimatum** (at dropoff) | read/feel | double deposit by midnight or locked out | phone alert; deposit target vs. wallet visible in HUD chip |
| 6:00–6:30 | **Surge ping — the villa order** | phone | "this one run covers it" | high-value fragile order card, one-tap accept |
| 6:30–8:30 | **RIDE 3 — the villa run (setpiece)** | RIDE | night, rain tapering, everything on the line | night lighting + lantern glow, fragile-cargo chip, near-miss stingers, longest route yet |
| 8:30–9:30 | **RESOLVE — deposit paid, collapse** | TALK/BUILD | earned it; the room is grim; tomorrow matters | 5-star celebration at the gate; landlord scene at the kos (pay in full / Ibu vouches if short); genuinely bleak room; collapse into bed |
| 9:30–10:00 | **Day 2** (exists — keep) | watch | the app that saved you turns on you | Act 1 card → NusaDrop rate-cut card → morning hand; Leo waits at the rail |

Total: three ridden deliveries (catering, storm run, villa finale) — the
bible's "three chaotic deliveries" compressed to fit the 10-minute budget,
each one introducing a new pressure (time → weather → fragility+night).

The Act 0→1 seam is the golden thread working as written: the player has just
FELT NusaDrop as a lifesaver when Act 1 opens with the rate cut. Betrayal only
lands if the rescue did.

## Split of work

- **RPG-20260713-03 — the sensation layer** (systems): authored Day-1 clock
  compression, visible rain/storm with audio + existing slick-physics wiring,
  per-phase ambient beds, night/lantern enhancement, kos bleakness dressing.
  No story logic.
- **RPG-20260713-04 — the beats** (narrative restaging, prereq -03): the
  script above, staged on the sensation layer; Act 0 step-machine extension;
  diegetic signup; Vance/Leo plants; landlord ultimatum + deposit economy;
  villa setpiece; collapse close. Legacy mid-Act-0 saves keep working.
