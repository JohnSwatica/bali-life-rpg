# RPG-20260714-05 — Phone Diet Proof

Packet: `[RPG-20260714-05]`  
Branch: `feat/rpg-20260714-05-phone-diet`  
Map delta: none — UI and content-generation changes only

## Result

The phone now answers three questions in order: what am I doing, what pays,
and what else happened. Feed groups the active goal and authored story/status
messages first, NusaDrop board work and other positive-pay opportunities next,
and remaining live/history content last. Ordering within those groups may use
time or expiry, but timestamps never move ambient content ahead of story or
paid work.

The visible tab strip is exactly `Feed / Map / Goals / Profile`. `Goals`
renders the former Quests material and moves incomplete tracked goals ahead of
completed milestones, with Made's standing room offer first. `Profile` keeps
driver-visible rating/reputation information. The multiplayer-locked portal
chrome is unchanged.

## Complete opportunity-template classification

`KEEP` means the template still participates in automatic opportunity-pool
generation. `CUT` means generation is disabled; the definition remains in
place for save compatibility and possible scene-led revival.

| Template id | Current title | Verb / behavioral consumer | Decision |
| --- | --- | --- | --- |
| `milk_madu_lunch_rush_shift` | Lunch rush barista @ Milk & Madu | Generic timing-card service; no authored scene/quest consumer | CUT |
| `milk_madu_after_shift_intro` | After-shift founder intro | Generic social-choice card; chained filler only | CUT |
| `satu_satu_receipt_sort` | Receipt sort sprint @ Satu-Satu | No verb beyond menu timing | CUT |
| `finns_trusted_runner` | Trusted errand @ FINNS | Generic paid menu errand; no story/goal consumer | CUT |
| `ari_sunset_ping` | Ari: sunset beach check? | Generic social-choice card, not an authored Ari scene | CUT |
| `run_crew_open_slot` | Run crew open slot | Generic social-choice card; crew events remain on-site | CUT |
| `canggu_station_dropped_cart` | Dropped grocery cart | Generic help timing despite Ibu affinity; no authored scene | CUT |
| `lost_scooter_key_help` | Lost scooter key panic | No named story NPC, scene, or quest consumer | CUT |
| `no_questions_package` | The No-Questions Package | TALK/UNCOVER; manual Leo choice scene and morning-hand tracking | KEEP |
| `baked_croissant_flash` | Flash tray @ BAKED | Simulated deal/menu purchase, no playable story beat | CUT |
| `finns_coconut_cooldown` | Simulated coconut cooldown | Simulated deal/menu purchase, no playable story beat | CUT |
| `bungalow_room_whisper` | Home lead whisper | Generic rumor that duplicates the authored Made room beat | CUT |
| `beach_tide_tip` | Tide tip on the sand | Generic rumor/menu resolution | CUT |
| `swap_coconut_for_coffee` | Trade coconut for coffee | Generic menu trade, no named scene | CUT |
| `surf_wax_intro_trade` | Surf wax for an intro | Generic menu trade; no authored scene/goal consumer | CUT |
| `focus_table_client_referral` | Warm client intro @ Satu-Satu | BUILD setup; Act 2 payoff and Act 3 business-lead consumer | KEEP |
| `run_crew_breakfast_shift` | Run crew breakfast shift | SERVE; Act 2 `open_better_door` consumer | KEEP |
| `brunch_builders_paid_intro` | Paid founder intro @ Milk & Madu | TALK/BUILD setup; Act 2 payoff and Act 3 lead consumer | KEEP |
| `surf_circle_board_repair` | Surf circle board patch | BUILD/help; Act 2 `open_better_door` consumer | KEEP |
| `sari_warung_seed_errand` | Ibu Sari's warung numbers | BUILD; current Act 3 business-readiness consumer | KEEP |

The generated set is therefore 6 templates; the culled set is 14 templates.
`OpportunityEngine` infrastructure, resolution, rewards, world scenes, and data
definitions remain intact.

## Revival candidates

These CUT templates may return only after being restaged as named scenes or
real RIDE/TALK/SERVE/UNCOVER/BUILD play. None may return as a menu errand:

- `milk_madu_lunch_rush_shift`
- `milk_madu_after_shift_intro`
- `satu_satu_receipt_sort`
- `finns_trusted_runner`
- `ari_sunset_ping`
- `run_crew_open_slot`
- `canggu_station_dropped_cart`
- `lost_scooter_key_help`
- `baked_croissant_flash`
- `finns_coconut_cooldown`
- `bungalow_room_whisper`
- `beach_tide_tip`
- `swap_coconut_for_coffee`
- `surf_wax_intro_trade`

## Hard keep-list proof

| Required survivor | Protection |
| --- | --- |
| Kadek rush offer + priority line | `act1KadekPriority.test.ts` covers the persistent story message, board availability, full ride/scene completion, and recurring priority offer. |
| Made invitation + tracked room goal | `act1MadeRoomOffer.test.ts` covers the persistent message/scene; `phoneShell.test.ts` proves `Goals` renders the tracked conditions. |
| Leo taunt / NusaDrop update | `act1IncitingHook.test.ts` covers the one-time update message and Leo world/choice scene; `cutsceneSequencer.test.ts` protects its Act 1 placement. |
| Landlord/NusaDrop Act 0 beats | `act0BackHalf.test.ts`, `fieldGuidance.test.ts`, and `firstHourProof.test.ts` protect the landlord step and app story sequence. |
| Board delivery offers | `hustleDelivery.test.ts` and `act1KadekPriority.test.ts` exercise availability, acceptance, pickup, ride, payout, and story-special board entries. |
| No-Questions Package | `opportunities.test.ts` proves generation eligibility; `noQuestionsChoice.test.ts` protects both manual choice branches. |
| Any goal-wired opportunity | `opportunities.test.ts` asserts the exact six-item generation allowlist; `coreSystems.test.ts`/`firstHourProof.test.ts` cover Act 2 payoff consumers and readiness. |
| Ibu catering gig | `hustleDelivery.test.ts` runs `act0_ibu_milk_madu_catering` on-time and late fail-forward paths. |
| Rent/goal status | `opportunities.test.ts` protects daily board/rent messages; `phoneShell.test.ts` protects Goals and feed hierarchy. |

## Hidden-tab reachability audit

All hidden tab render branches and legacy `Quests` parsing remain compiled.
Current live features are either re-homed or already world-first:

| Hidden tab | Current path after collapse |
| --- | --- |
| Contacts | NPC affinity/arc progression remains through world dialogue; active bond work is summarized in Goals. No Act 0/1 critical action depended on the tab. |
| Threads | Discovery Ledger is read-only and unused by the current Act 0/1 critical path. Its code remains for the later investigation-board return. |
| Quests | Re-homed as visible `Goals`; legacy internal/proof calls still render the same content. |
| Calendar | Active event pings remain in Feed; event windows and markers remain in the world. |
| Events | Participation remains on-site through venue `E` actions and world scenes. |
| Venues | Discovery state and discovered venue names remain in Map; venue activity remains on-site. |
| Community | Reputation is in Profile; clubs can still be joined at their authored home venues, which is the Act 2 field-first path. |

No venue activity panel was changed by this packet.

## Save compatibility

`CURRENT_SCHEMA_VERSION` remains `11`. Culled template definitions are retained.
A v8/v11 save with an accepted culled opportunity continues to load and can
resolve or expire normally; its tracked id remains valid. Old feed messages
remain inert, readable history. The generator cannot create another cut card.
The existing persistence migration test carries exactly this legacy shape.

## Beat-scoped browser proof

```bash
node scripts/beatProof.mjs act1_steady_runner scripts/proofs/phone-diet-steady-runner.json
```

The proof boots the gameplay-reachable Steady Runner state, opens Feed, takes
Made's normal interior scene so his goal exists, opens Goals, then repeats the
phone proof at `390x844`. The runner's new `setViewport` step changes only the
browser viewport; it does not mutate game state.

Final screenshots are under:

```text
tmp/beat-proof/phone-diet-steady-runner/
  01-desktop-feed-hierarchy-*.png
  02-desktop-goals-*.png
  03-mobile-feed-hierarchy-*.png
  04-mobile-goals-*.png
```

The captures show story/goal before jobs, no generic filler, Made's room at the
top of Act 1 Goals, the four-tab strip, preserved multiplayer lock chrome, and
an in-bounds `390x844` layout. The phone resynchronizes to camera movement so
opening it directly after an interior transition remains screen-anchored.

## Automated verification

- `npm test -- --run` — **46 files / 297 tests passed, 0 skipped**.
- `npm run build` — **passed** (`tsc` + Vite production build).
- Save schema remains **v11**.
- `scripts/smokePlaythrough.mjs` is unchanged; the existing full smoke remains
  the Wave-gate check rather than a per-packet proof.
