```
PACKET ID: RPG-20260706-04
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     One honest soft-failure channel — deliveries can visibly lose the tip, never the delivery
PR TAG: [RPG-20260706-04]

===== BEGIN PACKET RPG-20260706-04 =====

ROLE & SCOPE
The 2026-07-06 review (§2 bottleneck #3) found the game has no felt stakes:
rent is non-punitive, everything fail-forwards, nothing can be lost. Act 1's
premise is survival tension; mechanically no tension exists. This packet adds
exactly ONE soft-failure channel — cargo care — inside the existing
fail-forward tone rules. The player can lose the BONUS, never the delivery,
never progress.

HARD CONSTRAINTS
- Fail-forward stays law (existing tone decision, DECISIONS.md 2026-06-29 /
  2026-07-01): every delivery still completes, base payout is always paid,
  rating can dip slightly but never below the existing floor behavior.
- What becomes lose-able is the delivery's bonus margin: the tip/condition
  bonus that already exists in the delivery-condition math (`Villa tip`,
  `Fragile stack`, etc. in `src/data/deliveries.ts` + `DeliverySystem.ts`).
  Reuse that seam; do not invent a parallel bonus system.
- The loss must be LEGIBLE IN THE MOMENT, not discovered in end-of-day math:
  a cargo-state chip appears in the HUD warning-chip slot (the contextual
  chip system from the P4a UI diet) only while carrying active cargo.
- No save-schema change: cargo state lives on the existing
  `activeDelivery` runtime object's transient fields, or is derived. If a
  persisted field is truly unavoidable, stop and flag in the PR description
  instead of bumping the schema unilaterally.
- Tuning must be gentle: a normal careful ride should keep 100% of the bonus.
  Only genuinely careless play (multiple hard traffic hits, repeated
  full-speed collisions) should drain it.

DELIVERABLES
1. `src/systems/ride/CargoCare.ts` (pure helper): cargo integrity 100 -> 0,
   decremented by existing traffic-hit events and hard collisions while a
   fragile/tip-carrying delivery is active; returns bonus multiplier at
   completion (integrity >= 70 keeps full bonus; scale down linearly below;
   base payout untouched at any integrity).
2. HUD: cargo chip while carrying (e.g. "Cargo 92%"), color-shifting as it
   drops, using the existing contextual warning-chip mechanism in
   `HudController.ts`.
3. Completion copy: when bonus was lost, the payout message says why, plainly
   ("Box took some hits — tip cut to Rp X."). When RPG-20260706-02 (payout
   juice) exists, the celebration reflects the reduced bonus without
   moralizing.
4. NPC texture (one line each, reuse ambient-bubble system): Kadek reacts
   once to a badly-rattled pastry box; the villa recipient reacts once to a
   pristine fragile run. Authored lines, existing dialogue presentation
   rules (ambient bubble, not modal panel).

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; tests cover integrity math,
  bonus multiplier tiers, "base payout never reduced," and "delivery always
  completes at 0 integrity."
- The existing `firstHourProof.test.ts` path still passes unchanged —
  if it needs edits, the tuning is too harsh; retune instead.
- STATE.md bullet + DECISIONS.md entry (this touches the locked
  "non-punitive" stance: log explicitly that base payout/progress remain
  untouchable and only bonus margin is at risk).

DO NOT
- Do not add cargo failure to Act 0's tutorial delivery — the first delivery
  stays a guaranteed clean win. Gate the channel on Act >= 1.
- Do not add eviction, scooter destruction, item loss, or any second failure
  channel. One channel, this packet, then wait for playtest evidence.
- Do not surface integrity as another permanent meter — chip appears only
  while cargo is active.

===== END PACKET RPG-20260706-04 =====
```
