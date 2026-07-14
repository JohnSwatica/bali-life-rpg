import type { OpportunityMessage, WorldState } from "../../types";
import { addItem, removeItem } from "../Inventory";
import { activateFocusBuffer } from "../meters/FocusBuffer";
import { ACT1_LEO_ENCOUNTER_FLAG } from "./Act1IncitingHook";

export const KADEK_RUSH_DELIVERY_ID = "act1_kadek_rush_ingredients";
export const KADEK_PRIORITY_DELIVERY_ID = "baked_priority_fragile_order";
export const KADEK_PRIORITY_FLAG = "act1_kadek_priority_driver";
export const KADEK_PRIORITY_SCENE_FLAG = "act1_kadek_priority_scene_seen";
export const KADEK_FOCUS_BUFFER_ITEM_ID = "focus_buffer_pastry";
export const KADEK_RUSH_FEED_MESSAGE_ID = "story:act1:kadek-rush-offer";

export type KadekBoardStyle = "story_special" | "priority_premium";

export interface KadekPrioritySceneResult {
  fired: boolean;
  cleanEnough?: boolean;
  dialogue?: string;
  bufferUntil?: number;
}

export function isKadekRushOfferUnlocked(world: WorldState): boolean {
  return Boolean(world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG]);
}

export function isKadekPriorityDriver(world: WorldState): boolean {
  return Boolean(world.collectedPickups[KADEK_PRIORITY_FLAG]);
}

export function shouldListKadekDelivery(world: WorldState, deliveryId: string): boolean {
  if (deliveryId === KADEK_RUSH_DELIVERY_ID) {
    return (
      isKadekRushOfferUnlocked(world) &&
      !world.life.hustle.completedDeliveryIds.includes(KADEK_RUSH_DELIVERY_ID)
    );
  }
  if (deliveryId === KADEK_PRIORITY_DELIVERY_ID) {
    return isKadekPriorityDriver(world);
  }
  return true;
}

export function getKadekDeliveryGateReason(world: WorldState, deliveryId: string): string | null {
  if (deliveryId === KADEK_RUSH_DELIVERY_ID && !isKadekRushOfferUnlocked(world)) {
    return "Resolve Leo's rate-cut encounter first.";
  }
  if (deliveryId === KADEK_PRIORITY_DELIVERY_ID && !isKadekPriorityDriver(world)) {
    return "Kadek's priority list only.";
  }
  return null;
}

export function buildKadekRushOfferMessage(world: WorldState, now: number): OpportunityMessage | undefined {
  if (
    !shouldListKadekDelivery(world, KADEK_RUSH_DELIVERY_ID) ||
    world.opportunities.messages.some((message) => message.id === KADEK_RUSH_FEED_MESSAGE_ID)
  ) {
    return undefined;
  }
  return {
    id: KADEK_RUSH_FEED_MESSAGE_ID,
    at: now,
    from: "BAKED. · SPECIAL",
    body: "RUSH HOUR INGREDIENT RUN · high fragility · tight window · priority pay. This story order stays reserved until you take it.",
    venueId: "canggu_station",
    read: false
  };
}

export function completeKadekPriorityScene(
  world: WorldState,
  cargoIntegrity: number,
  now: number
): KadekPrioritySceneResult {
  if (world.collectedPickups[KADEK_PRIORITY_SCENE_FLAG]) {
    return { fired: false };
  }

  const cleanEnough = cargoIntegrity >= 70;
  world.collectedPickups[KADEK_PRIORITY_SCENE_FLAG] = Math.max(1, now);
  world.collectedPickups[KADEK_PRIORITY_FLAG] = Math.max(1, now);

  const player = world.players[world.localPlayerId];
  addItem(player, KADEK_FOCUS_BUFFER_ITEM_ID, 1);
  removeItem(player, KADEK_FOCUS_BUFFER_ITEM_ID, 1);
  const bufferUntil = activateFocusBuffer(world, now);
  const boxLine = cleanEnough
    ? 'Kadek checks every corner of the crate, then finally exhales. "Clean enough. In rush hour, that means something."'
    : 'Kadek steadies the dented crate with both hands. "The box had a difficult journey. It is still here. So are you."';

  return {
    fired: true,
    cleanEnough,
    bufferUntil,
    dialogue:
      `${boxLine}\n\n` +
      'He writes your driver ID on a flour-dusted card. "Priority list. If my name is on an order, you see it first. Fragile, better pay, no pretending the road is gentle."\n\n' +
      '"The corporate people pay triple for these same hands. Don\'t ask why I know."\n\n' +
      'He presses a warm pastry into your hand. "Eat. Your focus should hold for three hours. Mine rarely does."\n\n' +
      'PRIORITY LIST UNLOCKED · Focus Buffer active for 3 in-game hours.'
  };
}

export function getKadekPriorityAmbientLine(world: WorldState): string | undefined {
  return isKadekPriorityDriver(world)
    ? '"Priority list is not decoration. If a fragile BAKED. order appears, I trust you with it."'
    : undefined;
}
