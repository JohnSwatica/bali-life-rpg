import type { OpportunityMessage, WorldState } from "../../types";
import { getRentPressureState } from "../hustle/HustleEconomy";
import { ACT1_STEADY_RUNNER_DELIVERIES } from "../hustle/HustleMilestones";

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
      'Made closes the showroom ledger, takes a key from beneath it, and leads you past the fabric racks. Behind a hanging storage wall is a narrow shared room: clean mattress, fan, one window, no display tag.',
      '"It is not advertised. That keeps the conversation short." He checks the room once, then you. "The rent is manageable. The conditions are not negotiable."',
      '"First: a clean financial track record. Rent never missed. I read the due day, not excuses."',
      '"Second: a recommendation letter from a local business owner. Original, specific, and written by someone whose name answers calls."',
      '"Everyone pays somebody. The interesting question is who I pay." He does not explain.',
      'He puts the key away. "Meet both conditions. Return here. The room stays on my sheet until it does not."',
      "MADE'S ROOM TRACKED · Keep rent current · Secure a business-owner recommendation"
    ].join("\n\n")
  };
}

export function getMadeRoomGoalState(world: WorldState): MadeRoomGoalState | undefined {
  if (!world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG]) {
    return undefined;
  }
  const rentRecordClean = getRentPressureState(world).status !== "overdue";
  return {
    id: "mades_room",
    title: "Made's room",
    description: `rent record clean ${rentRecordClean ? "✓" : "✗"} · recommendation letter ✗`,
    progress: "Standing offer",
    complete: false,
    rentRecordClean,
    recommendationLetterReady: false
  };
}

export function getMadeRoomOfferAmbientLine(world: WorldState): string | undefined {
  return world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG]
    ? '"The room remains available. Clean rent record. Business-owner letter. Bring both."'
    : undefined;
}
