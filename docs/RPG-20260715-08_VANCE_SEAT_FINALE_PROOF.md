# RPG-20260715-08 — Vance Offer + Sunset Seat Finale Proof

Packet: `[RPG-20260715-08]`

Branch: `feat/rpg-20260715-08-vance-seat-finale`

Stacked base: W2-07 head `cb2d131`. `origin/main` was still `71881d5` and did not contain `[RPG-20260715-07]` when this branch was created, so review and merge must preserve W2-01 → W2-02 → W2-03 → W2-04 → W2-05 → W2-06 → W2-07 → W2-08 order.

Map delta: none. Vance uses the existing Milk & Madu interior and the finale uses W2-02's existing Berawa Beach staging precedent. No venue, parcel, collision, or authored street geometry changed.

Save schema: unchanged at v11. Offer resolution, card residue, finale start/completion, and toast tone use typed accessors over established `questFlags` and stable Feed-message patterns.

## Beat 7 — Vance's offer

Completing the existing PDA reveal makes Julian Vance appear once at Milk & Madu. The full relationship-choice panel pays off his Act 0 habitat and keeps his bible voice precise: he turns around the player's live rating/pressure numbers, describes Enclave Berawa's salaried logistics badge as rescue, and reframes the old scooter "noise problem" as unmanaged street access.

The offer has exactly two consequence-free responses:

- **Decline outright:** Vance files the refusal as impatience and leaves no later message.
- **Take the card:** the player promises nothing; one stable Feed message arrives no earlier than 24 in-game hours later with Vance's passive-aggressive "for now" follow-up.

Both responses write only mutually exclusive story residue. They change no money, rating, delivery terms, reputation axis, relationship affinity, meter, access rule, or job state. Vance cannot repeat, and no Enclave mechanic, buyout, lockout, salary, or alternate branch exists.

## Beat 8 — the seat

The finale foundation requires exactly the packet's durable social state:

- Surf & Run regular;
- Kitchen Circle regular;
- the commission squeeze overheard;
- the PDA reveal completed.

The venue action additionally waits for the preceding Vance conversation to resolve, preserving Beat 7 → Beat 8 order without making either Vance answer punitive. The seat appears at Berawa Beach every Sunday from 17:00 through 19:59. Missing that window writes no failure or penalty; it simply returns the next Sunday.

Starting the beat persists a one-time in-progress marker before the cutscene. The staged wide uses the existing beach, clock, cutscene, dialogue, and `nightQuiet` paths: both crews surround one fire; Ibu's food sits beside Ari's boards; Ari's phone is zipped away; Kadek's named bread is visible; one cushion remains open for the player. Leo is not spawned. Ari's only observation is, "Somebody's still chasing surge."

The arrival copy is read directly from the save and never fabricates history:

| Existing history | Finale residue |
|---|---|
| Kadek PROTECT | Kadek says his name and the printer/own-name plant |
| Kadek EXPOSE | Kadek says "Mine—and ours" and the communal plant |
| no Kadek branch flag | neutral own-name line only |
| Luxury Tip RETURN | Ibu returns the remembered villa jar |
| Luxury Tip KEEP | the closed wallet adjustment is acknowledged |
| no tip flag | no tip line |
| No-Questions completed / missed / accepted | the matching old route-label residue only |
| no No-Questions state | no package-history line |

The final participation beat offers exactly three warm tone choices: making room, serving plates ourselves, or staying ten minutes longer. All three write the completion flag and selected toast, save immediately, and leave cash, reputation, relationships, meters, crew state, and access unchanged.

`currentAct` deliberately remains `2`. There is no `ACT 2 — COMPLETE` cutscene card, ending scene, END card, or credits. The field state says the Season 1 ending attaches at this circle; Wave 3 owns the next cut.

## Gate and persistence verification

Focused tests prove:

- the Vance scene requires the completed PDA reveal, resolves once, and has only the two specified non-mechanical actions;
- only TAKE CARD can create the delayed message, not before `choiceAt + 1440`, and its stable ID prevents duplicates;
- removing either regular flag, squeeze, PDA reveal, Vance resolution, or Sunday-sunset timing closes the seat action with the correct recovery reason;
- all 72 tip × sourdough × No-Questions × Vance branch combinations remain finale-reachable;
- arrival copy selects only flags and opportunity history actually present in that save;
- all three toast choices complete once without advancing the act or changing player/reputation/relationship mechanics;
- finale started/completed state and the chosen toast survive a schema-v11 save/load round trip;
- the older Act 2 scaffold goals no longer unlock Act 3 by themselves; the sunset-seat completion flag is now the authoritative Act 2 closure.

Final closure commands:

```text
npm test -- --run
npm run build
git diff --check
```

Result: 58 test files / 405 tests passed with zero skips; TypeScript and the Vite production build passed; whitespace validation passed. The production bundle contains none of the three W2-08 proof-state names and no `__BALI_LIFE_DEV_PROOF__` marker.

## Browser beat proof

The reusable scripts are `scripts/proofs/act2-vance-offer.json`, `scripts/proofs/act2-finale-protect.json`, and `scripts/proofs/act2-finale-expose.json`. The dev proof states are assembled through the same completed PDA, crew, Vance, W2-07 delivery, and W2-07 choice mutations used by gameplay. Browser/page-error listeners reported no errors.

Vance run:

1. [Vance knows the rating/pressure numbers and presents the real-job offer at Milk & Madu](../tmp/beat-proof/act2-vance-offer/01-vance-knows-the-numbers-t+003.3s.png).
2. [Taking the card closes as residue only, with no job branch](../tmp/beat-proof/act2-vance-offer/02-card-residue-only-t+004.2s.png).
3. [The single delayed passive-aggressive follow-up appears in Feed](../tmp/beat-proof/act2-vance-offer/03-later-vance-followup-t+005.9s.png).

PROTECT / poster run:

1. [The Sunday beach menu exposes the one finale action](../tmp/beat-proof/act2-finale-protect/01-seat-available-t+002.6s.png).
2. [The staged wide reads as the thesis poster: both circles, shared food, phone away, named bread, and room for the player](../tmp/beat-proof/act2-finale-protect/02-sunday-circle-poster-wide-t+005.3s.png).
3. [PROTECT plus Luxury Tip RETURN and completed No-Questions history surface without inventing other residue](../tmp/beat-proof/act2-finale-protect/03-protect-return-completed-history-t+005.7s.png).
4. [The final panel exposes exactly three warm toast flavors](../tmp/beat-proof/act2-finale-protect/04-three-warm-toast-flavors-t+006.1s.png).
5. [The toast saves Act 2 completion and hands off at the circle without an end card](../tmp/beat-proof/act2-finale-protect/05-act2-completion-handoff-t+006.5s.png).

EXPOSE variant:

1. [Kadek's EXPOSE branch selects the "Mine—and ours" line while the same real RETURN / completed history remains](../tmp/beat-proof/act2-finale-expose/01-expose-return-completed-history-t+005.5s.png).
2. [A different warm toast reaches the same consequence-free Wave 3 handoff](../tmp/beat-proof/act2-finale-expose/02-expose-act2-handoff-t+006.2s.png).

## Boundary audit

- No Season 1 ending content, END card, credits, Act 3 advance, or Wave 3 scene.
- No Vance/Enclave job, salary, buyout, lockout, access, economy, or reputation mechanic.
- No Leo actor or Leo scene; absence is the authored beat.
- No new venue, beach parcel, map geometry, scheduler, time system, notification channel, metric, or save schema.
- No branch combination can block the finale, and missing a Sunday window remains consequence-free.
