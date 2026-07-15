import { KITCHEN_CIRCLE_CREW_ID, getCrewSessionSlot } from "../../data/crews";
import type { GameEvent, OpportunityMessage, WorldState } from "../../types";
import { getCrewState, inviteToCrew } from "../crews/CrewSystem";

export const KITCHEN_CIRCLE_INVITATION_LINE = "Busy night. You have hands. Come Tuesday.";
export const KITCHEN_CIRCLE_SQUEEZE_LINE = "Then I cook for the app, not for people.";
export const KITCHEN_CIRCLE_DEFLECTION_LINE = "The phone has had enough of my time. Plates first.";
export const KITCHEN_CIRCLE_RESIDUE_MESSAGE_ID = "story:act2:kitchen-circle:menu-price-residue";
export const KITCHEN_BUSY_NIGHT_MESSAGE_PREFIX = "story:act2:kitchen-circle:busy-night";
export const KITCHEN_BUSY_NIGHT_START_MINUTE = 18 * 60;
export const KITCHEN_BUSY_NIGHT_END_MINUTE = 21 * 60;

const IBU_DELIVERY_COUNT_FLAG = "act2:kitchen-circle:ibuDeliveries";
const ACT2_RENT_PAID_FLAG = "act2:kitchen-circle:rentPaid";
const SQUEEZE_SEEN_FLAG = "act2:kitchen-circle:squeezeSeen";
const SQUEEZE_DAY_FLAG = "act2:kitchen-circle:squeezeDay";
const DEFLECTION_USED_FLAG = "act2:kitchen-circle:deflectionUsed";
const BUSY_NIGHT_COMPLETED_PREFIX = "act2:kitchen-circle:busyNightCompleted";

const SESSION_START_LINES = [
  { speakerName: "Wayan", line: "Apron on. Ibu calls the plate; you find the table." },
  { speakerName: "Mira", line: "Counter, stools, back again. Find the rhythm before the room finds it for you." },
  { speakerName: "Kadek", line: "I am off shift. Apparently that makes me qualified to point at the table you missed." }
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

  const beat = SESSION_START_LINES[attendanceCount % SESSION_START_LINES.length];
  return {
    speakerName: beat.speakerName,
    dialogue: `“${beat.line}”\n\nThe dinner rush opens around you. Take the counter, carry the right plates, and stay with it until the room settles.`,
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

export function getKitchenBusyNightWeekStart(day: number): number {
  const safeDay = Math.max(1, Math.floor(day));
  return safeDay - ((safeDay - 1) % 7);
}

export function isKitchenBusyNightWindow(world: WorldState): boolean {
  return world.clock.day % 7 === 4 &&
    world.clock.minuteOfDay >= KITCHEN_BUSY_NIGHT_START_MINUTE &&
    world.clock.minuteOfDay < KITCHEN_BUSY_NIGHT_END_MINUTE;
}

export function getKitchenBusyNightMessageId(day: number): string {
  return `${KITCHEN_BUSY_NIGHT_MESSAGE_PREFIX}:week-${getKitchenBusyNightWeekStart(day)}`;
}

export function buildKitchenBusyNightMessage(world: WorldState, at: number): OpportunityMessage | undefined {
  if (world.life.actProgress.currentAct < 2 || !getCrewState(world, KITCHEN_CIRCLE_CREW_ID).member) return undefined;
  if (!isKitchenBusyNightWindow(world)) return undefined;
  const id = getKitchenBusyNightMessageId(world.clock.day);
  if (world.opportunities.messages.some((message) => message.id === id)) return undefined;
  return {
    id,
    at,
    from: "Ibu Sari",
    body: "Busy night. Crew hands only. The dinner rush is open at the warung until 21:00 — come SERVE if you are nearby.",
    venueId: "canggu_station",
    read: false
  };
}

export function isKitchenBusyNightServeAvailable(world: WorldState, weekStartDay = getKitchenBusyNightWeekStart(world.clock.day)): boolean {
  if (!getCrewState(world, KITCHEN_CIRCLE_CREW_ID).member || !isKitchenBusyNightWindow(world)) return false;
  if (world.questFlags[`${BUSY_NIGHT_COMPLETED_PREFIX}:week-${weekStartDay}`] === true) return false;
  return world.opportunities.messages.some((message) => message.id === `${KITCHEN_BUSY_NIGHT_MESSAGE_PREFIX}:week-${weekStartDay}`);
}

export function completeKitchenBusyNightServe(world: WorldState, weekStartDay: number): boolean {
  const normalized = getKitchenBusyNightWeekStart(weekStartDay);
  const key = `${BUSY_NIGHT_COMPLETED_PREFIX}:week-${normalized}`;
  if (world.questFlags[key] === true) return false;
  world.questFlags[key] = true;
  return true;
}
