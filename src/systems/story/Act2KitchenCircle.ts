import { KITCHEN_CIRCLE_CREW_ID, getCrewSessionSlot } from "../../data/crews";
import type { GameEvent, OpportunityMessage, WorldState } from "../../types";
import { getCrewState, inviteToCrew } from "../crews/CrewSystem";

export const KITCHEN_CIRCLE_INVITATION_LINE = "Busy night. You have hands. Come Tuesday.";
export const KITCHEN_CIRCLE_SQUEEZE_LINE = "Then I cook for the app, not for people.";
export const KITCHEN_CIRCLE_DEFLECTION_LINE = "The phone has had enough of my time. Plates first.";
export const KITCHEN_CIRCLE_RESIDUE_MESSAGE_ID = "story:act2:kitchen-circle:menu-price-residue";

const IBU_DELIVERY_COUNT_FLAG = "act2:kitchen-circle:ibuDeliveries";
const ACT2_RENT_PAID_FLAG = "act2:kitchen-circle:rentPaid";
const SQUEEZE_SEEN_FLAG = "act2:kitchen-circle:squeezeSeen";
const SQUEEZE_DAY_FLAG = "act2:kitchen-circle:squeezeDay";
const DEFLECTION_USED_FLAG = "act2:kitchen-circle:deflectionUsed";

const SERVE_LINES = [
  { speakerName: "Wayan", line: "Two plates to the stools, then watch the counter. If Ibu points, move first and ask later." },
  { speakerName: "Mira", line: "Keep the sambal with the table, not your sleeve. That is the whole technique tonight." },
  { speakerName: "Kadek", line: "Pass left, clear right. I am off shift, which apparently means I get the heavier stack." }
] as const;

export interface KitchenCircleInvitationSceneResult {
  fired: boolean;
  dialogue?: string;
}

export interface KitchenCircleSessionBeat {
  speakerName: string;
  dialogue: string;
  includesSqueeze: boolean;
  kind: "kitchen_serve";
}

export function recordAct2IbuDelivery(world: WorldState): number {
  if (world.life.actProgress.currentAct < 2) return getAct2IbuDeliveryCount(world);
  const next = getAct2IbuDeliveryCount(world) + 1;
  world.questFlags[IBU_DELIVERY_COUNT_FLAG] = next;
  return next;
}

export function getAct2IbuDeliveryCount(world: WorldState): number {
  const value = world.questFlags[IBU_DELIVERY_COUNT_FLAG];
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function recordAct2RentPaid(world: WorldState): boolean {
  if (world.life.actProgress.currentAct < 2) return false;
  world.questFlags[ACT2_RENT_PAID_FLAG] = true;
  return true;
}

export function isKitchenCircleInvitationEligible(world: WorldState): boolean {
  return getAct2IbuDeliveryCount(world) >= 2 || world.questFlags[ACT2_RENT_PAID_FLAG] === true;
}

export function isKitchenCircleInvitationPending(world: WorldState): boolean {
  const crew = getCrewState(world, KITCHEN_CIRCLE_CREW_ID);
  return world.life.actProgress.currentAct >= 2 && isKitchenCircleInvitationEligible(world) && !crew.invited;
}

export function completeKitchenCircleInvitation(world: WorldState): KitchenCircleInvitationSceneResult {
  if (!isKitchenCircleInvitationPending(world)) return { fired: false };
  const invitation = inviteToCrew(world, KITCHEN_CIRCLE_CREW_ID);
  if (!invitation.ok) return { fired: false };
  return {
    fired: true,
    dialogue: `Ibu does not soften it into a favor. She sets down a stack of bowls and looks at your hands.\n\n“${KITCHEN_CIRCLE_INVITATION_LINE}”\n\nThe Warung Kitchen Circle appears on your Calendar. The invitation does not expire.`
  };
}

export function prepareKitchenCircleSessionBeat(
  world: WorldState,
  event: GameEvent
): KitchenCircleSessionBeat | undefined {
  if (event.crewSession?.crewId !== KITCHEN_CIRCLE_CREW_ID) return undefined;
  const slot = getCrewSessionSlot(event.crewSession.crewId, event.crewSession.sessionSlotId);
  if (slot?.kind !== "kitchen_serve") return undefined;

  const attendanceCount = getCrewState(world, KITCHEN_CIRCLE_CREW_ID).attendanceCount;
  if (world.questFlags[SQUEEZE_SEEN_FLAG] !== true) {
    world.questFlags[SQUEEZE_SEEN_FLAG] = true;
    world.questFlags[SQUEEZE_DAY_FLAG] = world.clock.day;
    return {
      speakerName: "Overheard — back kitchen",
      dialogue: `You pass two plates and turn back toward the counter. Ibu is behind the steam with the phone held close.\n\n“Thirty percent?” She counts under her breath, once, then again. Her voice lands flat. “${KITCHEN_CIRCLE_SQUEEZE_LINE}”\n\nShe ends the call, squares the plates, and returns to the rush. Nothing is offered up for discussion.`,
      includesSqueeze: true,
      kind: "kitchen_serve"
    };
  }

  const beat = SERVE_LINES[attendanceCount % SERVE_LINES.length];
  return {
    speakerName: beat.speakerName,
    dialogue: `“${beat.line}”\n\nYou pass plates, clear the counter, and finish the participation beat.`,
    includesSqueeze: false,
    kind: "kitchen_serve"
  };
}

export function hasSeenKitchenCircleSqueeze(world: WorldState): boolean {
  return world.questFlags[SQUEEZE_SEEN_FLAG] === true;
}

export function isKitchenCircleDeflectionPending(world: WorldState): boolean {
  return hasSeenKitchenCircleSqueeze(world) && world.questFlags[DEFLECTION_USED_FLAG] !== true;
}

export function consumeKitchenCircleDeflection(world: WorldState): string | undefined {
  if (!isKitchenCircleDeflectionPending(world)) return undefined;
  world.questFlags[DEFLECTION_USED_FLAG] = true;
  return `You glance toward the phone. Ibu slides another plate across the counter.\n\n“${KITCHEN_CIRCLE_DEFLECTION_LINE}”`;
}

export function buildKitchenCircleResidueMessage(world: WorldState, at: number): OpportunityMessage | undefined {
  const squeezeDay = world.questFlags[SQUEEZE_DAY_FLAG];
  if (typeof squeezeDay !== "number" || world.clock.day < squeezeDay + 2) return undefined;
  if (world.opportunities.messages.some((message) => message.id === KITCHEN_CIRCLE_RESIDUE_MESSAGE_ID)) return undefined;
  return {
    id: KITCHEN_CIRCLE_RESIDUE_MESSAGE_ID,
    at,
    from: "Warung Sari",
    body: "The menu board is back out. Rice plates are Rp 2 more. One chalk number changed; Ibu says nothing about it.",
    venueId: "canggu_station",
    read: false
  };
}

export function isKadekAtKitchenCircleSession(day: number): boolean {
  const normalized = Math.max(1, Math.floor(day));
  return normalized % 7 === 2;
}

export function isKitchenCircleSessionEvent(event: GameEvent | undefined): boolean {
  return event?.crewSession?.crewId === KITCHEN_CIRCLE_CREW_ID;
}
