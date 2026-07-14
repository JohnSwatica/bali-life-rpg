import { addItem, getQuantity } from "../Inventory";
import { acceptDelivery, pickupDelivery, type DeliveryResult } from "../hustle/DeliverySystem";
import { completeAct0Step } from "../life/ActProgression";
import type { WorldState } from "../../types";

const SCOOTER_KEY_ITEM_ID = "scooter_key";
const ACT0_OPENING_DELIVERY_ID = "act0_ibu_milk_madu_catering";

export interface Act0OpeningStartResult extends DeliveryResult {
  pickedUp: boolean;
}

export function startAct0FirstDelivery(
  world: WorldState,
  negotiatedFee: boolean,
  now: number
): Act0OpeningStartResult {
  if (world.life.actProgress.act0Step !== "meet_ibu_sari") {
    return { ok: false, pickedUp: false, message: "The Act 0 opening is not ready." };
  }

  const player = world.players[world.localPlayerId];
  world.questFlags.firstRunHintSeen = true;
  world.questFlags.act0_v4_opening_complete = true;
  world.questFlags.act0_back_half_version = 2;
  world.questFlags.act0_negotiated_fee = negotiatedFee;
  player.hasBike = true;
  player.bikeStuck = false;
  player.bikeCondition = Math.min(player.bikeCondition, 48);
  player.tutorialStep = "free_roam";
  world.life.hustle.scooterTier = "borrowed_rattletrap";
  if (getQuantity(player, SCOOTER_KEY_ITEM_ID) === 0) {
    addItem(player, SCOOTER_KEY_ITEM_ID, 1);
  }

  const accepted = acceptDelivery(world, ACT0_OPENING_DELIVERY_ID, now);
  if (!accepted.ok) {
    return { ...accepted, pickedUp: false };
  }
  const pickedUp = pickupDelivery(world, now);
  if (!pickedUp.ok) {
    return { ...pickedUp, pickedUp: false };
  }
  if (world.life.hustle.activeDelivery) {
    world.life.hustle.activeDelivery.dueAt = now + 15;
  }
  completeAct0Step(world, "meet_ibu_sari");
  completeAct0Step(world, "pickup_first_delivery");
  return { ...accepted, activeDelivery: world.life.hustle.activeDelivery ?? undefined, pickedUp: true };
}
