import { describe, expect, it } from "vitest";
import { getDeliveryDefinition } from "../data/deliveries";
import { buildDevProofBootState } from "../dev/DevProofStates";
import {
  acceptDelivery,
  calculateDeliveryPayout,
  completeDelivery,
  getDeliveryOfferAvailability,
  getEffectiveDeliveryTerms,
  pickupDelivery
} from "../systems/hustle/DeliverySystem";
import {
  ACT1_MOVE_OUT_DELIVERIES,
  ACT1_MOVE_OUT_DELIVERY_EARNINGS,
  ACT1_MOVE_OUT_DRIVER_RATING,
  getAct1MoveOutReadiness
} from "../systems/hustle/HustleMilestones";
import { markOpportunityMessagesRead } from "../systems/opportunities/OpportunityEngine";
import {
  RIO_RACE_COMPLETED_FLAG,
  RIO_RACE_LOST_FLAG,
  RIO_RACE_WON_FLAG
} from "../systems/ride/RivalRace";
import {
  KADEK_PRIORITY_DELIVERY_ID,
  KADEK_PRIORITY_FLAG,
  KADEK_RUSH_DELIVERY_ID
} from "../systems/story/Act1KadekPriority";
import {
  ACT1_BREAKDOWN_LEO_MESSAGE_ID,
  ACT1_FINALE_LEO_MESSAGE_ID,
  ACT1_PRIORITY_LEO_MESSAGE_ID,
  flushAct1LeoCadence,
  getUnreadLeoMessageCount,
  queueAct1LeoCadenceMilestone
} from "../systems/story/Act1LeoCadence";
import {
  ACT1_LUXURY_TIP_KEEP_AMOUNT,
  resolveAct1LuxuryTipChoice
} from "../systems/story/Act1LuxuryTip";
import { createInitialWorldState } from "../systems/WorldState";

describe("Wave 1 Leo cadence and economy reconciliation", () => {
  it("posts priority → breakdown → finale once and never leaves two unread Leo texts", () => {
    const world = createInitialWorldState();
    world.opportunities.messages.push({
      id: "story:test:leo-existing",
      at: 99,
      from: "Leo",
      body: "Existing unread text.",
      read: false
    });

    expect(queueAct1LeoCadenceMilestone(world, "priority", 100)).toBe(false);
    expect(queueAct1LeoCadenceMilestone(world, "breakdown", 101)).toBe(false);
    expect(queueAct1LeoCadenceMilestone(world, "finale", 102)).toBe(false);
    expect(getUnreadLeoMessageCount(world)).toBe(1);

    markOpportunityMessagesRead(world.opportunities);
    expect(flushAct1LeoCadence(world, 103)).toBe(true);
    expect(getUnreadLeoMessageCount(world)).toBe(1);
    expect(world.opportunities.messages.at(-1)?.id).toBe(ACT1_PRIORITY_LEO_MESSAGE_ID);

    markOpportunityMessagesRead(world.opportunities);
    expect(flushAct1LeoCadence(world, 104)).toBe(true);
    expect(getUnreadLeoMessageCount(world)).toBe(1);
    expect(world.opportunities.messages.at(-1)?.id).toBe(ACT1_BREAKDOWN_LEO_MESSAGE_ID);

    markOpportunityMessagesRead(world.opportunities);
    expect(flushAct1LeoCadence(world, 105)).toBe(true);
    expect(getUnreadLeoMessageCount(world)).toBe(1);
    expect(world.opportunities.messages.at(-1)?.id).toBe(ACT1_FINALE_LEO_MESSAGE_ID);

    expect(queueAct1LeoCadenceMilestone(world, "priority", 106)).toBe(false);
    expect(queueAct1LeoCadenceMilestone(world, "breakdown", 106)).toBe(false);
    expect(queueAct1LeoCadenceMilestone(world, "finale", 106)).toBe(false);
    expect(
      world.opportunities.messages
        .filter((message) => message.id.startsWith("story:act1:leo-"))
        .map((message) => message.id)
    ).toEqual([
      ACT1_PRIORITY_LEO_MESSAGE_ID,
      ACT1_BREAKDOWN_LEO_MESSAGE_ID,
      ACT1_FINALE_LEO_MESSAGE_ID
    ]);
  });

  it("makes the finale text point to an unplayed race, demand a rematch after Leo loses, or defend his win", () => {
    const variants = [
      { flags: [], copy: "streak lap is still waiting" },
      { flags: [RIO_RACE_COMPLETED_FLAG, RIO_RACE_WON_FLAG], copy: "I want the rematch" },
      { flags: [RIO_RACE_COMPLETED_FLAG, RIO_RACE_LOST_FLAG], copy: "do not erase my win" }
    ] as const;

    for (const [index, variant] of variants.entries()) {
      const world = createInitialWorldState();
      for (const flag of variant.flags) world.collectedPickups[flag] = 200 + index;
      expect(queueAct1LeoCadenceMilestone(world, "finale", 210 + index)).toBe(true);
      expect(world.opportunities.messages.at(-1)).toMatchObject({
        id: ACT1_FINALE_LEO_MESSAGE_ID,
        body: expect.stringContaining(variant.copy)
      });
    }
  });

  it("keeps the clean Act 1 path at five runs with Act 0 catering excluded", () => {
    const world = buildDevProofBootState("act1_leo_resolved");
    const rush = getDeliveryDefinition(KADEK_RUSH_DELIVERY_ID)!;
    const premium = getDeliveryDefinition(KADEK_PRIORITY_DELIVERY_ID)!;
    const rushTerms = getEffectiveDeliveryTerms(rush, rush.conditions![0], world);
    world.collectedPickups[KADEK_PRIORITY_FLAG] = 300;
    world.life.hustle.completedDeliveryCount = 2;
    world.life.hustle.driverRating = 3.8;
    const premiumTerms = getEffectiveDeliveryTerms(premium, premium.conditions![0], world);
    const rushCap = calculateDeliveryPayout(rushTerms.payout, 4.5);
    const premiumCap = calculateDeliveryPayout(premiumTerms.payout, 4.5);

    expect(buildDevProofBootState("act1_leo_resolved").life.hustle.completedDeliveryCount).toBe(0);
    expect(rushCap).toBe(142);
    expect(premiumCap).toBe(152);

    world.life.hustle.rentDueDay = 7;
    world.life.hustle.driverRating = ACT1_MOVE_OUT_DRIVER_RATING;
    world.life.hustle.completedDeliveryCount = ACT1_MOVE_OUT_DELIVERIES - 1;
    world.life.hustle.deliveryEarnings = rushCap + premiumCap * 3;
    expect(world.life.hustle.deliveryEarnings).toBe(598);
    expect(getAct1MoveOutReadiness(world)).toMatchObject({
      deliveriesComplete: false,
      earningsComplete: false,
      complete: false
    });

    world.life.hustle.completedDeliveryCount += 1;
    world.life.hustle.deliveryEarnings += premiumCap;
    expect(world.life.hustle.completedDeliveryCount).toBe(5);
    expect(world.life.hustle.deliveryEarnings).toBeGreaterThanOrEqual(ACT1_MOVE_OUT_DELIVERY_EARNINGS);
    expect(getAct1MoveOutReadiness(world).complete).toBe(true);
  });

  it("preserves the -02 post-cut table: premium 142 exceeds the best normal 141 at unlock", () => {
    const world = buildDevProofBootState("act1_leo_resolved");
    world.collectedPickups[KADEK_PRIORITY_FLAG] = 400;
    world.life.hustle.completedDeliveryCount = 2;
    world.life.hustle.driverRating = 3.8;
    const rush = getDeliveryDefinition(KADEK_RUSH_DELIVERY_ID)!;
    const premium = getDeliveryDefinition(KADEK_PRIORITY_DELIVERY_ID)!;
    const villa = getDeliveryDefinition("act0_nusadrop_villa_finale")!;
    const rushTerms = getEffectiveDeliveryTerms(rush, rush.conditions![0], world);
    const premiumTerms = getEffectiveDeliveryTerms(premium, premium.conditions![0], world);
    const villaTerms = getEffectiveDeliveryTerms(villa, villa.conditions![0], world);
    const bestNormal = Math.max(
      ...getDeliveryOfferAvailability(world)
        .filter((offer) => offer.available && !offer.delivery.boardStyle)
        .flatMap((offer) =>
          (offer.delivery.conditions ?? [undefined]).map(
            (condition) => getEffectiveDeliveryTerms(offer.delivery, condition, world).payout
          )
        )
    );

    expect(rushTerms.payout).toBe(132);
    expect(premiumTerms.payout).toBe(142);
    expect(bestNormal).toBe(141);
    expect(premiumTerms.payout).toBeGreaterThan(bestNormal);
    expect(villaTerms.payout).toBe(260);
  });

  it("proves the Rp 500 KEEP tip cannot enter delivery earnings or substitute for a run", () => {
    const world = buildDevProofBootState("act1_post_reversal");
    const now = 4_000;
    expect(acceptDelivery(world, "milk_madu_brunch_bag", now)).toMatchObject({ ok: true });
    expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
    expect(completeDelivery(world, now + 30, 1)).toMatchObject({
      ok: true,
      luxuryTipScene: { fired: true }
    });
    const earningsAfterRun = world.life.hustle.deliveryEarnings;
    const countAfterRun = world.life.hustle.completedDeliveryCount;
    const walletBeforeTip = world.players[world.localPlayerId].money;

    expect(resolveAct1LuxuryTipChoice(world, "keep", now + 31)).toMatchObject({
      ok: true,
      walletDelta: ACT1_LUXURY_TIP_KEEP_AMOUNT
    });
    expect(world.players[world.localPlayerId].money).toBe(walletBeforeTip + ACT1_LUXURY_TIP_KEEP_AMOUNT);
    expect(world.life.hustle.deliveryEarnings).toBe(earningsAfterRun);
    expect(world.life.hustle.completedDeliveryCount).toBe(countAfterRun);
  });
});
