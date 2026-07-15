import { ARI_SURF_RUN_CREW_ID, KITCHEN_CIRCLE_CREW_ID } from "../../data/crews";
import type { OpportunityMessage, WorldState } from "../../types";
import { getCrewState } from "../crews/CrewSystem";
import { ACT1_LUXURY_TIP_KEEP_FLAG, ACT1_LUXURY_TIP_RETURN_FLAG } from "./Act1LuxuryTip";
import { getKadekSourdoughChoice } from "./Act2KadekSourdough";
import { hasSeenKitchenCircleSqueeze } from "./Act2KitchenCircle";
import { hasSeenPdaReveal } from "./Act2PdaReveal";

export const ACT2_VANCE_OFFER_SCENE_ID = "act2_vance_real_job_offer";
export const ACT2_VANCE_FOLLOWUP_MESSAGE_ID = "story:act2:vance-card-followup";
export const ACT2_SEAT_TOAST_SCENE_ID = "act2_sunset_seat_toast";
export const ACT2_FINALE_COMPLETION_FLAG = "act2:finale:complete";
export const ACT2_FINALE_STARTED_FLAG = "act2:finale:started";

export const ACT2_SEAT_SUNSET_START_MINUTE = 17 * 60;
export const ACT2_SEAT_SUNSET_END_MINUTE = 20 * 60;

const VANCE_RESOLVED_FLAG = "act2:vance:offerResolved";
const VANCE_DECLINED_FLAG = "act2:vance:declined";
const VANCE_CARD_TAKEN_FLAG = "act2:vance:cardTaken";
const VANCE_CHOICE_AT_FLAG = "act2:vance:choiceAt";
const FINALE_STARTED_DAY_FLAG = "act2:finale:startedDay";
const FINALE_COMPLETED_AT_FLAG = "act2:finale:completedAt";
const FINALE_COMPLETED_DAY_FLAG = "act2:finale:completedDay";
const FINALE_TOAST_FLAG = "act2:finale:toast";
const NO_QUESTIONS_TEMPLATE_ID = "no_questions_package";

export type VanceOfferChoice = "decline" | "take_card";
export type Act2FinaleToast = "make_room" | "serve_ourselves" | "stay_longer";

export interface Act2SeatGateState {
  foundationComplete: boolean;
  vanceOfferComplete: boolean;
  sundaySunset: boolean;
  available: boolean;
  missing: Array<"surf_regular" | "kitchen_regular" | "squeeze" | "pda_reveal" | "vance_offer" | "sunday_sunset">;
}

export interface Act2FinaleResolution {
  ok: boolean;
  message: string;
  toast?: Act2FinaleToast;
}

export function isVanceOfferPending(world: WorldState): boolean {
  return world.life.actProgress.currentAct === 2 && hasSeenPdaReveal(world) && !hasResolvedVanceOffer(world) && !isAct2FinaleComplete(world);
}

export function hasResolvedVanceOffer(world: WorldState): boolean {
  return world.questFlags[VANCE_RESOLVED_FLAG] === true;
}

export function getVanceOfferChoice(world: WorldState): VanceOfferChoice | undefined {
  if (world.questFlags[VANCE_CARD_TAKEN_FLAG] === true) return "take_card";
  if (world.questFlags[VANCE_DECLINED_FLAG] === true) return "decline";
  return undefined;
}

export function resolveVanceOffer(world: WorldState, choice: VanceOfferChoice, at: number): boolean {
  if (!isVanceOfferPending(world)) return false;
  world.questFlags[VANCE_RESOLVED_FLAG] = true;
  world.questFlags[choice === "take_card" ? VANCE_CARD_TAKEN_FLAG : VANCE_DECLINED_FLAG] = true;
  world.questFlags[VANCE_CHOICE_AT_FLAG] = Math.max(1, Math.floor(at));
  return true;
}

export function buildVanceCardFollowupMessage(world: WorldState, at: number): OpportunityMessage | undefined {
  if (getVanceOfferChoice(world) !== "take_card") return undefined;
  const choiceAt = world.questFlags[VANCE_CHOICE_AT_FLAG];
  if (typeof choiceAt !== "number" || at < choiceAt + 1440) return undefined;
  if (world.opportunities.messages.some((message) => message.id === ACT2_VANCE_FOLLOWUP_MESSAGE_ID)) return undefined;
  return {
    id: ACT2_VANCE_FOLLOWUP_MESSAGE_ID,
    at,
    from: "Julian Vance · Vanguard",
    body: "You kept the card. Good instincts sometimes arrive before good decisions. The Enclave logistics position remains open—for now.",
    venueId: "milk_madu_berawa",
    read: false
  };
}

export function isAct2SeatFoundationComplete(world: WorldState): boolean {
  return (
    world.life.actProgress.currentAct === 2 &&
    getCrewState(world, ARI_SURF_RUN_CREW_ID).regular &&
    getCrewState(world, KITCHEN_CIRCLE_CREW_ID).regular &&
    hasSeenKitchenCircleSqueeze(world) &&
    hasSeenPdaReveal(world)
  );
}

export function isAct2SeatSundaySunset(world: WorldState): boolean {
  return (
    world.clock.day % 7 === 0 &&
    world.clock.minuteOfDay >= ACT2_SEAT_SUNSET_START_MINUTE &&
    world.clock.minuteOfDay < ACT2_SEAT_SUNSET_END_MINUTE
  );
}

export function getAct2SeatGate(world: WorldState): Act2SeatGateState {
  const missing: Act2SeatGateState["missing"] = [];
  if (!getCrewState(world, ARI_SURF_RUN_CREW_ID).regular) missing.push("surf_regular");
  if (!getCrewState(world, KITCHEN_CIRCLE_CREW_ID).regular) missing.push("kitchen_regular");
  if (!hasSeenKitchenCircleSqueeze(world)) missing.push("squeeze");
  if (!hasSeenPdaReveal(world)) missing.push("pda_reveal");
  if (!hasResolvedVanceOffer(world)) missing.push("vance_offer");
  if (!isAct2SeatSundaySunset(world)) missing.push("sunday_sunset");
  const foundationComplete = isAct2SeatFoundationComplete(world);
  const vanceOfferComplete = hasResolvedVanceOffer(world);
  const sundaySunset = isAct2SeatSundaySunset(world);
  return {
    foundationComplete,
    vanceOfferComplete,
    sundaySunset,
    available: foundationComplete && vanceOfferComplete && sundaySunset && !isAct2FinaleComplete(world),
    missing
  };
}

export function beginAct2Finale(world: WorldState): boolean {
  if (!getAct2SeatGate(world).available || isAct2FinaleStarted(world)) return false;
  world.questFlags[ACT2_FINALE_STARTED_FLAG] = true;
  world.questFlags[FINALE_STARTED_DAY_FLAG] = world.clock.day;
  return true;
}

export function isAct2FinaleStarted(world: WorldState): boolean {
  return world.questFlags[ACT2_FINALE_STARTED_FLAG] === true;
}

export function isAct2FinaleComplete(world: WorldState): boolean {
  return world.questFlags[ACT2_FINALE_COMPLETION_FLAG] === true;
}

export function isAct2FinaleSceneStaged(world: WorldState): boolean {
  if (!isAct2FinaleStarted(world)) return false;
  if (!isAct2FinaleComplete(world)) return true;
  return world.questFlags[FINALE_COMPLETED_DAY_FLAG] === world.clock.day;
}

export function getAct2FinaleToast(world: WorldState): Act2FinaleToast | undefined {
  const value = world.questFlags[FINALE_TOAST_FLAG];
  return value === "make_room" || value === "serve_ourselves" || value === "stay_longer" ? value : undefined;
}

export function completeAct2Finale(world: WorldState, toast: Act2FinaleToast, at: number): Act2FinaleResolution {
  if (!isAct2FinaleStarted(world) || isAct2FinaleComplete(world)) {
    return { ok: false, message: "The Sunday circle has already settled." };
  }
  world.questFlags[FINALE_TOAST_FLAG] = toast;
  world.questFlags[ACT2_FINALE_COMPLETION_FLAG] = true;
  world.questFlags[FINALE_COMPLETED_AT_FLAG] = Math.max(1, Math.floor(at));
  world.questFlags[FINALE_COMPLETED_DAY_FLAG] = world.clock.day;
  return {
    ok: true,
    message: "Act 2 is complete. The Season 1 ending can attach at the sunset circle.",
    toast
  };
}

export function getAct2FinaleArrivalLines(world: WorldState): string[] {
  const lines = [
    "Sunday sunset. Warung pots sit beside surfboards. Ibu brought dinner; Ari's phone is zipped inside his bag.",
    getKadekFinaleLine(world),
    ...getTipFinaleLines(world),
    ...getNoQuestionsFinaleLines(world),
    'Ari looks once toward the empty edge of the fire. “Somebody\'s still chasing surge.”',
    "Mira shifts without asking. A dry place opens on the mat between both circles. Nobody asks whether you are staying; they pass you a plate."
  ];
  return lines;
}

export function getAct2FinaleArrivalCopy(world: WorldState): string {
  return getAct2FinaleArrivalLines(world).join("\n\n");
}

function getKadekFinaleLine(world: WorldState): string {
  const choice = getKadekSourdoughChoice(world);
  if (choice === "protect") {
    return 'Kadek sets down a loaf and taps the paper band. “Kadek. My name. I said it to the printer twice.”';
  }
  if (choice === "expose") {
    return 'Kadek sets down a loaf. “Kadek. Mine—and ours, if the circle still wants it.” Ibu tears the first piece.';
  }
  return 'Kadek sets down a loaf and reads the paper band aloud. “Kadek. My name. Start there.”';
}

function getTipFinaleLines(world: WorldState): string[] {
  if (world.collectedPickups[ACT1_LUXURY_TIP_RETURN_FLAG]) {
    return ['Ibu puts a jar beside your plate. “The villa gate sent this back with your name. They remembered.”'];
  }
  if (world.collectedPickups[ACT1_LUXURY_TIP_KEEP_FLAG]) {
    return ['Your phone flashes a closed wallet adjustment. Ari turns it face-down beside his own. “Not tonight.”'];
  }
  return [];
}

function getNoQuestionsFinaleLines(world: WorldState): string[] {
  if (world.opportunities.completedTemplateIds.includes(NO_QUESTIONS_TEMPLATE_ID)) {
    return ['A blank-manifest route label still peeks from your old bag. Ibu covers it with a plate. “Whatever that road was, you are here now.”'];
  }
  if (world.opportunities.missedTemplateIds.includes(NO_QUESTIONS_TEMPLATE_ID)) {
    return ['Ari laughs into his cup. “Leo said you pushed a cash run back at him. He complained like it cost him money.”'];
  }
  const unresolved = world.opportunities.live.some(
    (opportunity) => opportunity.templateId === NO_QUESTIONS_TEMPLATE_ID && opportunity.status === "accepted"
  );
  return unresolved
    ? ["The unnamed run is still on your phone. Kadek sees the blank manifest and says nothing; nobody invents an ending for it."]
    : [];
}
