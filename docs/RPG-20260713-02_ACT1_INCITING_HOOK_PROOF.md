# RPG-20260713-02 — Act 1 NusaDrop rate cut + Leo proof

## Shipped beat

- First Act 1 entry sets one existing generic one-time flag, adds a persistent unread NusaDrop feed item, and shows a pre-morning-hand update card: base pay `-15%`, Surge Zones introduced.
- Board-delivery base pay is multiplied by `0.85` from that point onward. Act 0/tutorial payouts and condition bonuses are not cut.
- Leo appears visibly at the existing scooter-rental pickup rail until the player faces him. His full portrait dialogue is a one-time authored encounter; both response branches are non-punitive and end on the existing race hook (or acknowledge its result).
- No save-schema bump and no Surge Zone mechanic were added.

## Balance

The five current unique Act 1 board bases total Rp 716 before the cut and Rp 609 after it. The move-out earnings threshold was therefore adjusted from Rp 700 to Rp 600 so the existing five-run milestone remains internally achievable without silently extending the one-hour Act 1 pacing target. Rent, rent timing, rating, delivery-count, scooter, and all other economy values are unchanged.

## Live proof

Fresh save through Act 0 into Act 1:

- Rate-cut card before the morning hand: `tmp/smoke/09-nusadrop-rate-cut-t+115.7s.png`.
- Leo encounter: `tmp/smoke/10-leo-rate-cut-encounter-t+142.0s.png`.
- Leo hook response: `tmp/smoke/11-leo-rate-cut-hook-t+143.0s.png`.
- First Act 1 completion/payout: `tmp/smoke/12-first-act1-lower-payout-t+224.8s.png`. HUD money moves from Rp 74 at Leo's scene to Rp 183 after the run: Rp 109, lower than the fresh Act 0 catering payout of Rp 160.

Automated coverage proves the rate cut fires exactly once, board base pay changes measurably while Act 0 pay does not, Leo's world scene is reachable and disappears after resolution, and the authored dialogue includes the 15% cut, scooter-tier mockery, and race hook.

## Explicit follow-ups

Still not implemented here: Made's room offer, Kadek's priority-driver moment, the midpoint scooter-breakdown reversal, and the Act 1 closing milestone. Surge Zones remain copy/visual seed only.
