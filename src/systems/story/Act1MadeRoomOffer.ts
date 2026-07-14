import type { OpportunityMessage, WorldState } from "../../types";
import { getRentPressureState } from "../hustle/HustleEconomy";
import { ACT1_STEADY_RUNNER_DELIVERIES } from "../hustle/HustleMilestones";

const ACT1_BREAKDOWN_FLAG = "act1_transmission_breakdown_fired";
const ACT1_BREAKDOWN_PREMIUM_RATING = 3.5;

export const MADE_ROOM_OFFER_SCENE_FLAG = "act1_made_hidden_room_offer_seen";
export const MADE_ROOM_OFFER_FEED_MESSAGE_ID = "story:act1:made-room-offer";

export interface MadeRoomGoalState {
  id: "mades_room";
  title: "Made's room";
  description: string;
  progress: "Standing offer";
  complete: false;
  rentRecordClean: boolean;
  recommendationLetterReady: false;
  ratingCondition?: boolean;
}

export interface MadeRoomOfferSceneResult {
  fired: boolean;
  dialogue?: string;
}

export function isMadeRoomOfferUnlocked(world: WorldState): boolean {
  return world.life.actProgress.currentAct >= 1 && world.life.hustle.completedDeliveryCount >= ACT1_STEADY_RUNNER_DELIVERIES;
}

export function isMadeRoomOfferPending(world: WorldState): boolean {
  return isMadeRoomOfferUnlocked(world) && !world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG];
}

export function buildMadeRoomOfferMessage(world: WorldState, now: number): OpportunityMessage | undefined {
  if (
    !isMadeRoomOfferPending(world) ||
    world.opportunities.messages.some((message) => message.id === MADE_ROOM_OFFER_FEED_MESSAGE_ID)
  ) {
    return undefined;
  }
  return {
    id: MADE_ROOM_OFFER_FEED_MESSAGE_ID,
    at: now,
    from: "Made · Bungalow Living",
    body: "You move packages on time. That is rare enough to be worth a conversation. Bungalow Living, when you have ten minutes.",
    venueId: "bungalow_living",
    read: false
  };
}

export function completeMadeRoomOfferScene(world: WorldState, now: number): MadeRoomOfferSceneResult {
  if (!isMadeRoomOfferPending(world)) {
    return { fired: false };
  }

  world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG] = Math.max(1, now);
  return {
    fired: true,
    dialogue: [
      'Made takes a key and leads you past the fabric racks. Behind a hanging storage wall: a clean, narrow shared room — mattress, fan, one window.',
      '"Not advertised. Rent is manageable; conditions are not. Rent never missed. I read due days, not excuses."',
      '"A recommendation letter from a local business owner. Original and specific." He pauses. "Everyone pays somebody. The interesting question is who I pay."',
      'He pockets the key. "Meet both. Return. The room stays on my sheet until it does not."'
    ].join("\n\n")
  };
}

export function getMadeRoomGoalState(world: WorldState): MadeRoomGoalState | undefined {
  if (!world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG]) {
    return undefined;
  }
  const rentRecordClean = getRentPressureState(world).status !== "overdue";
  const breakdownFired = Boolean(world.collectedPickups[ACT1_BREAKDOWN_FLAG]);
  const ratingCondition = world.life.hustle.driverRating >= ACT1_BREAKDOWN_PREMIUM_RATING;
  const ratingCopy = breakdownFired
    ? ` · premium rating ${world.life.hustle.driverRating.toFixed(1)}/${ACT1_BREAKDOWN_PREMIUM_RATING.toFixed(1)}★ ${ratingCondition ? "✓" : "✗"}`
    : "";
  return {
    id: "mades_room",
    title: "Made's room",
    description: `rent record clean ${rentRecordClean ? "✓" : "✗"}${ratingCopy} · recommendation letter ✗`,
    progress: "Standing offer",
    complete: false,
    rentRecordClean,
    recommendationLetterReady: false,
    ratingCondition: breakdownFired ? ratingCondition : undefined
  };
}

export function getMadeRoomOfferAmbientLine(world: WorldState): string | undefined {
  return world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG]
    ? '"The room remains available. Clean rent record. Business-owner letter. Bring both."'
    : undefined;
}
