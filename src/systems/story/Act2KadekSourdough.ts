import { KITCHEN_CIRCLE_CREW_ID } from "../../data/crews";
import type { WorldState } from "../../types";
import { getCrewState } from "../crews/CrewSystem";
import { bumpRelationshipAffinity, getAffinityTier, getRelationship } from "../relationships/RelationshipMemory";
import { adjustReputationAxis } from "../reputation/ReputationState";
import { KADEK_PRIORITY_DELIVERY_ID } from "./Act1KadekPriority";

export const ACT2_KADEK_SOURDOUGH_DELIVERY_ID = "act2_kadek_wrong_address_pastries";
export const ACT2_KADEK_SOURDOUGH_SCENE_ID = "act2_kadek_whistleblower_sourdough";
export const ACT2_KADEK_SOURDOUGH_AFTER_HOURS_MINUTE = 20 * 60;
export const ACT2_KADEK_PROTECT_ROOTED_DELTA = 5;
export const ACT2_KADEK_EXPOSE_ROOTED_DELTA = -3;

export type KadekSourdoughChoice = "protect" | "expose";

const EVIDENCE_IN_HAND_FLAG = "act2:kadek:sourdough:evidenceInHand";
const CHOICE_PENDING_FLAG = "act2:kadek:sourdough:choicePending";
const CHOICE_RESOLVED_FLAG = "act2:kadek:sourdough:choiceResolved";
const PROTECT_FLAG = "act2:kadek:sourdough:protect";
const EXPOSE_FLAG = "act2:kadek:sourdough:expose";
const END_PENDING_FLAG = "act2:kadek:sourdough:moonlightingEndPending";
const ENDED_FLAG = "act2:kadek:sourdough:moonlightingEnded";
const ENDED_DAY_FLAG = "act2:kadek:sourdough:moonlightingEndedDay";

export interface KadekSourdoughTriggerResult {
  fired: boolean;
  sceneId?: typeof ACT2_KADEK_SOURDOUGH_SCENE_ID;
}

export interface KadekSourdoughChoiceResult {
  ok: boolean;
  message: string;
  choice?: KadekSourdoughChoice;
  rootedDelta?: number;
}

export interface KadekSourdoughEndingResidue {
  choice: KadekSourdoughChoice;
  summary: string;
  endingReference: string;
}

export function isKadekSourdoughEligible(world: WorldState): boolean {
  const tier = getAffinityTier(getRelationship(world, "npc", "kadek"));
  return (
    world.life.actProgress.currentAct >= 2 &&
    (tier === "friendly" || tier === "regular" || tier === "trusted") &&
    getCrewState(world, KITCHEN_CIRCLE_CREW_ID).regular
  );
}

export function isKadekSourdoughAfterHours(world: WorldState): boolean {
  return world.clock.minuteOfDay >= ACT2_KADEK_SOURDOUGH_AFTER_HOURS_MINUTE;
}

export function shouldListKadekSourdoughDelivery(world: WorldState, deliveryId: string): boolean {
  if (deliveryId === ACT2_KADEK_SOURDOUGH_DELIVERY_ID) {
    return (
      isKadekSourdoughEligible(world) &&
      !world.life.hustle.completedDeliveryIds.includes(ACT2_KADEK_SOURDOUGH_DELIVERY_ID) &&
      !hasResolvedKadekSourdoughChoice(world)
    );
  }
  if (
    deliveryId === KADEK_PRIORITY_DELIVERY_ID &&
    isKadekSourdoughEligible(world) &&
    !hasResolvedKadekSourdoughChoice(world)
  ) {
    return false;
  }
  return true;
}

export function getKadekSourdoughDeliveryGateReason(world: WorldState, deliveryId: string): string | null {
  if (deliveryId !== ACT2_KADEK_SOURDOUGH_DELIVERY_ID) return null;
  return isKadekSourdoughAfterHours(world) ? null : "Kadek's wrong-address return opens after BAKED. closes at 20:00.";
}

export function hasKadekSourdoughEvidence(world: WorldState): boolean {
  return world.questFlags[EVIDENCE_IN_HAND_FLAG] === true;
}

export function isKadekSourdoughChoicePending(world: WorldState): boolean {
  return world.questFlags[CHOICE_PENDING_FLAG] === true && !hasResolvedKadekSourdoughChoice(world);
}

export function hasResolvedKadekSourdoughChoice(world: WorldState): boolean {
  return world.questFlags[CHOICE_RESOLVED_FLAG] === true;
}

export function getKadekSourdoughChoice(world: WorldState): KadekSourdoughChoice | undefined {
  if (world.questFlags[PROTECT_FLAG] === true) return "protect";
  if (world.questFlags[EXPOSE_FLAG] === true) return "expose";
  return undefined;
}

export function getKadekSourdoughEndingResidue(world: WorldState): KadekSourdoughEndingResidue | undefined {
  const choice = getKadekSourdoughChoice(world);
  if (!choice || !hasResolvedKadekSourdoughChoice(world)) return undefined;
  return choice === "protect"
    ? {
        choice,
        summary: "You protected Kadek's confidence and let him end the anonymous work himself.",
        endingReference: "Kadek remembers that you carried the label without turning it into gossip."
      }
    : {
        choice,
        summary: "You brought the hidden work to the circle as a consequence of the squeeze, not a personal scandal.",
        endingReference: "Kadek remembers the hurt; the circle remembers that it closed around him instead of casting him out."
      };
}

export function isKadekMoonlightingEndPending(world: WorldState): boolean {
  return world.questFlags[END_PENDING_FLAG] === true && world.questFlags[ENDED_FLAG] !== true;
}

export function didKadekEndMoonlightingOnDay(world: WorldState, day = world.clock.day): boolean {
  return world.questFlags[ENDED_FLAG] === true && world.questFlags[ENDED_DAY_FLAG] === Math.max(1, Math.floor(day));
}

export function recordKadekSourdoughBoxPickup(world: WorldState): boolean {
  if (!isKadekSourdoughEligible(world) || hasResolvedKadekSourdoughChoice(world)) return false;
  if (world.questFlags[EVIDENCE_IN_HAND_FLAG] === true) return false;
  world.questFlags[EVIDENCE_IN_HAND_FLAG] = true;
  return true;
}

export function triggerKadekSourdoughChoice(world: WorldState): KadekSourdoughTriggerResult {
  if (
    !isKadekSourdoughEligible(world) ||
    !hasKadekSourdoughEvidence(world) ||
    isKadekSourdoughChoicePending(world) ||
    hasResolvedKadekSourdoughChoice(world)
  ) {
    return { fired: false };
  }
  world.questFlags[CHOICE_PENDING_FLAG] = true;
  return { fired: true, sceneId: ACT2_KADEK_SOURDOUGH_SCENE_ID };
}

export function resolveKadekSourdoughChoice(
  world: WorldState,
  choice: KadekSourdoughChoice,
  at: number
): KadekSourdoughChoiceResult {
  if (!isKadekSourdoughChoicePending(world)) {
    return { ok: false, message: "Kadek's sourdough choice has already been settled." };
  }
  const rootedDelta = choice === "protect" ? ACT2_KADEK_PROTECT_ROOTED_DELTA : ACT2_KADEK_EXPOSE_ROOTED_DELTA;
  delete world.questFlags[CHOICE_PENDING_FLAG];
  world.questFlags[CHOICE_RESOLVED_FLAG] = true;
  world.questFlags[choice === "protect" ? PROTECT_FLAG : EXPOSE_FLAG] = true;
  world.questFlags[END_PENDING_FLAG] = true;
  adjustReputationAxis(
    world.reputation,
    "rooted",
    rootedDelta,
    choice === "protect"
      ? "Protected Kadek's confidence while he ended the corporate work himself"
      : "Brought Kadek's hidden corporate work to the Kitchen Circle",
    at
  );
  bumpRelationshipAffinity(
    world,
    "npc",
    "kadek",
    0,
    choice === "protect"
      ? "Kept Kadek's wrong-address pastry label private"
      : "Told the Kitchen Circle why Kadek had hidden the corporate work",
    at
  );
  return {
    ok: true,
    message: choice === "protect" ? "Kadek's confidence is protected." : "The circle now carries the truth with Kadek.",
    choice,
    rootedDelta
  };
}

export function consumeKadekMoonlightingEndLine(world: WorldState): string | undefined {
  if (!isKadekMoonlightingEndPending(world)) return undefined;
  const choice = getKadekSourdoughChoice(world);
  if (!choice) return undefined;
  delete world.questFlags[END_PENDING_FLAG];
  world.questFlags[ENDED_FLAG] = true;
  world.questFlags[ENDED_DAY_FLAG] = world.clock.day;
  return choice === "protect"
    ? 'Kadek sets down a tray. “The night work is finished. When I bake under my own name again, you eat first.”'
    : 'Kadek sets down a tray. “The other kitchen is finished. We bake it here. Together.”';
}
