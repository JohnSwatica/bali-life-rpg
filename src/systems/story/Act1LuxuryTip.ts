import { getDeliveryDefinition } from "../../data/deliveries";
import type { OpportunityMessage, WorldState } from "../../types";
import { appendOpportunityMessage } from "../opportunities/OpportunityEngine";
import { addHiddenTrustFlag, adjustReputationAxis } from "../reputation/ReputationState";
import { ACT1_BREAKDOWN_FLAG } from "./Act1Breakdown";

export const ACT1_LUXURY_TIP_SCENE_ID = "act1_luxury_tip_dilemma";
export const ACT1_LUXURY_TIP_PENDING_FLAG = "act1_luxury_tip_pending";
export const ACT1_LUXURY_TIP_RESOLVED_FLAG = "act1_luxury_tip_resolved";
export const ACT1_LUXURY_TIP_KEEP_FLAG = "act1_luxury_tip_kept";
export const ACT1_LUXURY_TIP_RETURN_FLAG = "act1_luxury_tip_returned";
export const ACT1_VILLA_REGULAR_FLAG = "act1_villa_regular_remembers_you";
export const ACT1_LUXURY_TIP_KEEP_AMOUNT = 500;
export const ACT1_LUXURY_TIP_RETURN_AMOUNT = 50;
export const ACT1_LUXURY_TIP_KEEP_MESSAGE_ID = "story:act1:luxury-tip-kept";
export const ACT1_LUXURY_TIP_RETURN_MESSAGE_ID = "story:act1:luxury-tip-returned";

export type Act1LuxuryTipChoice = "keep" | "return";

export interface Act1LuxuryTipTriggerResult {
  fired: boolean;
  sceneId?: string;
}

export interface Act1LuxuryTipResolution {
  ok: boolean;
  choice?: Act1LuxuryTipChoice;
  walletDelta?: number;
}

export function isVillaDropoffDelivery(deliveryId: string): boolean {
  const delivery = getDeliveryDefinition(deliveryId);
  return Boolean(delivery?.boardAvailable && delivery.villaDropoff);
}

export function triggerAct1LuxuryTipDilemma(
  world: WorldState,
  deliveryId: string,
  wasBreakdownRun = false
): Act1LuxuryTipTriggerResult {
  if (
    world.life.actProgress.currentAct !== 1 ||
    wasBreakdownRun ||
    !world.collectedPickups[ACT1_BREAKDOWN_FLAG] ||
    !isVillaDropoffDelivery(deliveryId) ||
    world.collectedPickups[ACT1_LUXURY_TIP_RESOLVED_FLAG] ||
    world.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG]
  ) {
    return { fired: false };
  }
  world.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG] = deliveryId;
  return { fired: true, sceneId: ACT1_LUXURY_TIP_SCENE_ID };
}

export function resolveAct1LuxuryTipChoice(
  world: WorldState,
  choice: Act1LuxuryTipChoice,
  now: number
): Act1LuxuryTipResolution {
  if (
    !world.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG] ||
    world.collectedPickups[ACT1_LUXURY_TIP_RESOLVED_FLAG]
  ) {
    return { ok: false };
  }

  const player = world.players[world.localPlayerId];
  const keep = choice === "keep";
  const amount = keep ? ACT1_LUXURY_TIP_KEEP_AMOUNT : ACT1_LUXURY_TIP_RETURN_AMOUNT;
  player.money += amount;
  world.collectedPickups[ACT1_LUXURY_TIP_RESOLVED_FLAG] = Math.max(1, now);
  world.collectedPickups[keep ? ACT1_LUXURY_TIP_KEEP_FLAG : ACT1_LUXURY_TIP_RETURN_FLAG] = Math.max(1, now);
  if (!keep) {
    world.collectedPickups[ACT1_VILLA_REGULAR_FLAG] = Math.max(1, now);
  }
  delete world.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG];

  const axisDelta = keep ? -8 : 8;
  const reason = keep
    ? "Kept the villa guest's mistaken transfer"
    : "Returned the villa guest's mistaken transfer";
  adjustReputationAxis(world.reputation, "relational", axisDelta, reason, now);
  addHiddenTrustFlag(
    world.reputation,
    {
      type: keep ? "red" : "green",
      reason,
      source: ACT1_LUXURY_TIP_SCENE_ID
    },
    now
  );
  appendOpportunityMessage(world.opportunities, buildLuxuryTipEchoMessage(choice, now + 1));
  return { ok: true, choice, walletDelta: amount };
}

export function getVillaRegularAmbientLine(world: WorldState, deliveryId: string): string | undefined {
  return world.collectedPickups[ACT1_VILLA_REGULAR_FLAG] && isVillaDropoffDelivery(deliveryId)
    ? 'Villa regular: "You again. I remembered your name this time."'
    : undefined;
}

function buildLuxuryTipEchoMessage(choice: Act1LuxuryTipChoice, now: number): OpportunityMessage {
  return choice === "keep"
    ? {
        id: ACT1_LUXURY_TIP_KEEP_MESSAGE_ID,
        at: now,
        from: "NusaDrop · Wallet",
        body: "Rp 500 adjustment closed. No customer dispute filed. The app rounds in silence.",
        read: false
      }
    : {
        id: ACT1_LUXURY_TIP_RETURN_MESSAGE_ID,
        at: now,
        from: "Villa regular",
        body: "You came back over Rp 450 when you looked like you needed it. I remember your name now.",
        read: false
      };
}
