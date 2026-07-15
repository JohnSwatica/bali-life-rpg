# RPG-20260715-04 — Relationship Milestone Structural Unlocks Proof

Packet: `[RPG-20260715-04]`

Branch: `feat/rpg-20260715-04-structural-unlocks`

Stacked base: W2-03 head `9f6e099`. `origin/main` was still `71881d5` and did not contain `[RPG-20260715-03]` when this branch was created, so review and merge must preserve W2-01 → W2-02 → W2-03 → W2-04 order.

Map delta: none.

Save schema: unchanged at v11. Unlock state is derived from the existing crew hook, affinity records, Kadek priority flag, and stable Feed IDs; the pastry's daily purchase marker uses the existing `questFlags` pattern.

## Delivered structural unlocks

### Surf & Run regular

The existing Surf & Run `regularBenefit` hook now modifies only the crew's authored Sunday morning-run participation result. It adds a flat `+4 Energy / +4 Wellbeing` through the canonical meter adjustment path. The event therefore previews and applies `Energy -4 / Wellbeing +12` instead of its base `-8 / +8`; this is additive, clamped by the existing meter machinery, and never a multiplier or persistent stat. Other runs and sunset circles are unchanged.

Surf regular status also selects one beach ambient Ari line. Ari affinity independently extends sunset-circle dialogue with one +1 organizer line; it does not alter attendance, crew access, or meters.

### Kitchen Circle regular

Ibu's existing Nasi Bungkus loop keeps its Rp 35 base price. A Kitchen regular sees a crew bulk price of **Rp 30**, an exact Rp 5 / 14.3% reduction. No other item price changes.

Act 2 public warung access is 07:00–18:00. An invited/member Kitchen participant can enter during the existing Tue/Sat 18:00–20:00 session window. A Kitchen regular extends the same side-door access to 22:00 on those evenings. Active delivery access remains fail-forward, and all Act 0/1 warung entry behavior remains unchanged.

### Existing affinity tiers

All three gates read the existing relationship tier function at `friendly` or above; there is no new ladder or counter.

- Ibu: a three-line warmer pool, plus `You eat first` shop priority expressed by moving Nasi Bungkus to the first row and labeling the held-stool treatment. It grants no free item or stat.
- Kadek: existing friendly affinity **and** the existing priority-driver flag expose the existing Focus Buffer Pastry at BAKED. for **Rp 18**, once per in-game day. Purchase consumes the pastry immediately and calls the same 180-minute Focus Buffer used by his Act 1 scene.
- Ari: sunset-circle dialogue gains the pure-copy +1 invitation acknowledging that the player can bring someone else.

### Feed and Profile

Each earned structural unlock appends one stable-ID story message through the existing opportunity Feed and cannot append again. Profile derives five readable rows from current crew/affinity state, so it remains correct after reload without duplicating save state.

## Automated verification

Focused coverage proves:

- Surf recovery is absent before regular, applies only to the crew morning run, and produces the exact effective deltas;
- Kitchen bulk price is Rp 35 before regular and Rp 30 after regular;
- invitation/session access, regular-only 20:00–22:00 access, wrong-day denial, and the exact 22:00 close;
- Ibu's gate is false at affinity 7 and true at the existing friendly threshold of 8;
- Kadek requires both friendly affinity and priority, costs Rp 18, locks after one daily purchase, expires at exactly 180 minutes, and reopens next day;
- Ari's affinity +1 and crew-regular ambient dialogue are separate gates;
- all five Feed IDs append once and all five Profile rows derive correctly;
- the `act2_both_crews_regular` proof builder reaches both regular states through six real `applyEventParticipation` + crew-completion paths and satisfies all three affinity gates;
- every proof boot state still persists and reloads through schema v11;
- the untouched Wave-1 reconciliation assertions remain green.

Final closure commands:

```text
npm test
npm run build
```

Result: 54 test files / 364 tests passed with zero skips; TypeScript and the Vite production build passed. The existing large-chunk advisory is unchanged.

## Browser beat proof

The proof starts from `act2_both_crews_regular`. Its executable history begins with the real Act 0/1/finale mutations, then attends all six crew beats through the same participation and crew-completion functions as gameplay. The dev-only proof URL can supply an authored clock and initial real venue panel; those parameters are stripped before reload and all resulting interaction paths remain the normal `PhoneShell`, venue, shop, dialogue, event, and interior methods. Production builds omit the proof surface.

Captured evidence:

1. [Profile displays all five structural unlock rows without clipping](../tmp/beat-proof/act2-structural-unlocks/01-profile-structural-unlocks.png).
2. [Kitchen regular enters the existing warung at 20:57 through the side door, open until 22:00](../tmp/beat-proof/act2-structural-unlocks/03-kitchen-regular-after-hours-entry.png).
3. [Ibu's held-stool priority and Nasi Bungkus bulk price: Rp 30, base Rp 35](../tmp/beat-proof/act2-structural-unlocks/04-ibu-bulk-price-and-priority.png).
4. [Kadek's Focus Buffer Pastry at BAKED.: Rp 18, once daily, three hours](../tmp/beat-proof/act2-structural-unlocks/05-kadek-focus-buffer-offer.png).
5. [After purchase: wallet down Rp 18, Focus Buffer active, and the daily tray locked](../tmp/beat-proof/act2-structural-unlocks/06-kadek-focus-buffer-purchased.png).
6. [Sunday regular run preview shows the effective Energy -4 / Wellbeing +12 and REGULAR status](../tmp/beat-proof/act2-structural-unlocks/07-sunday-regular-recovery-preview.png).
7. [Ari's friendly-tier +1 organizer copy inside the real sunset-circle participation dialogue](../tmp/beat-proof/act2-structural-unlocks/10-ari-plus-one-line.png).

Result: all seven target surfaces rendered at 1280×720 with no browser console warnings or errors.

## Boundary audit

- No new meter, stat multiplier, XP curve, affinity ladder, benefit registry, shop restructuring, map parcel, notification system, or schema migration.
- No Wave-1 payout, delivery, rent, tip, rating, milestone, or reconciliation value changed.
- Exact economy delta is confined to two authored offers: Nasi Bungkus Rp 35 → Rp 30 for Kitchen regulars; Focus Buffer Pastry Rp 18 for friendly priority-driver Kadek relationships.
- No free meal, free pastry, passive recovery, generic run bonus, or effect stacking was introduced.
- Community remains hidden. Missed crew sessions still write no penalty and invitations still do not expire.
