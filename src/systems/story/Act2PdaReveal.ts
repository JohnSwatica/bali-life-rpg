import { ARI_SURF_RUN_CREW_ID } from "../../data/crews";
import type { OpportunityMessage, WorldState } from "../../types";
import { ACT1_LUXURY_TIP_KEEP_FLAG, ACT1_LUXURY_TIP_RETURN_FLAG } from "./Act1LuxuryTip";
import { hasSeenKitchenCircleSqueeze } from "./Act2KitchenCircle";

export const PDA_REVEAL_MESSAGE_ID = "story:act2:pda-reveal-update";
export const PDA_REVEAL_SEEN_FLAG = "act2:pdaReveal:seen";
export const PDA_REVEAL_RELATIONSHIP_COPY =
  "Not a strict seesaw: Efficiency reflects what the app rewards; metric_x reflects what the street remembers. A choice may move one, both, or neither.";
export const PDA_REVEAL_IBU_ANNOTATION =
  "This one is what people say when the app is not listening.";

const NO_QUESTIONS_TEMPLATE_ID = "no_questions_package";
const ACT0_CATERING_DELIVERY_ID = "act0_ibu_milk_madu_catering";
const SUNSET_CIRCLE_EVENT_IDS = [
  `crew-session:${ARI_SURF_RUN_CREW_ID}:wednesday_sunset_circle`,
  `crew-session:${ARI_SURF_RUN_CREW_ID}:friday_sunset_circle`
] as const;

export interface PdaRevealHistoryMarker {
  id: string;
  label: string;
}

export interface PdaReputationReadModel {
  communityTrustScore: number;
  platformEfficiencyScore: number;
  rootedAxis: number;
  relationalAxis: number;
  historyMarkers: PdaRevealHistoryMarker[];
  relationshipCopy: string;
  ibuAnnotation: string;
}

export function hasAttendedSunsetCircle(world: WorldState): boolean {
  return SUNSET_CIRCLE_EVENT_IDS.some((eventId) => world.runtimeEvents.attendedEventIds.includes(eventId));
}

export function isPdaRevealEligible(world: WorldState): boolean {
  return world.life.actProgress.currentAct >= 2 && hasAttendedSunsetCircle(world) && hasSeenKitchenCircleSqueeze(world);
}

export function hasSeenPdaReveal(world: WorldState): boolean {
  return world.questFlags[PDA_REVEAL_SEEN_FLAG] === true;
}

export function isPdaRevealPending(world: WorldState): boolean {
  return isPdaRevealEligible(world) && !hasSeenPdaReveal(world);
}

export function buildPdaRevealMessage(world: WorldState, at: number): OpportunityMessage | undefined {
  if (!isPdaRevealPending(world)) return undefined;
  if (world.opportunities.messages.some((message) => message.id === PDA_REVEAL_MESSAGE_ID)) return undefined;
  return {
    id: PDA_REVEAL_MESSAGE_ID,
    at,
    from: "NusaDrop Update",
    body: "Driver transparency initiative: a new performance field is waiting in Profile.",
    read: false
  };
}

export function completePdaReveal(world: WorldState): boolean {
  if (!isPdaRevealPending(world)) return false;
  world.questFlags[PDA_REVEAL_SEEN_FLAG] = true;
  return true;
}

export function getPdaReputationReadModel(world: WorldState): PdaReputationReadModel {
  const rootedAxis = clampAxis(world.reputation.rootedAxis);
  const relationalAxis = clampAxis(world.reputation.relationalAxis);
  return {
    // These are presentation-only 0..100 projections over the two existing -100..100 fields.
    communityTrustScore: Math.round((rootedAxis + 100) / 2),
    platformEfficiencyScore: Math.round((100 - relationalAxis) / 2),
    rootedAxis,
    relationalAxis,
    historyMarkers: getPdaRevealHistoryMarkers(world),
    relationshipCopy: PDA_REVEAL_RELATIONSHIP_COPY,
    ibuAnnotation: PDA_REVEAL_IBU_ANNOTATION
  };
}

export function getPdaRevealHistoryMarkers(world: WorldState): PdaRevealHistoryMarker[] {
  const markers: PdaRevealHistoryMarker[] = [];
  const noQuestionsCompleted = world.opportunities.completedTemplateIds.includes(NO_QUESTIONS_TEMPLATE_ID);
  const noQuestionsDeclined = world.opportunities.missedTemplateIds.includes(NO_QUESTIONS_TEMPLATE_ID);
  const noQuestionsAccepted = world.opportunities.live.some(
    (opportunity) => opportunity.templateId === NO_QUESTIONS_TEMPLATE_ID && opportunity.status === "accepted"
  );
  if (noQuestionsCompleted) {
    markers.push({ id: "no-questions-completed", label: "No-Questions Package · completed" });
  } else if (noQuestionsDeclined) {
    markers.push({ id: "no-questions-declined", label: "No-Questions Package · turned down" });
  } else if (noQuestionsAccepted) {
    markers.push({ id: "no-questions-accepted", label: "No-Questions Package · accepted, unresolved" });
  }

  if (world.collectedPickups[ACT1_LUXURY_TIP_KEEP_FLAG]) {
    markers.push({ id: "luxury-tip-kept", label: "Villa transfer · kept" });
  } else if (world.collectedPickups[ACT1_LUXURY_TIP_RETURN_FLAG]) {
    markers.push({ id: "luxury-tip-returned", label: "Villa transfer · returned" });
  }

  if (world.questFlags.act0_v4_opening_complete === true) {
    markers.push({
      id: world.questFlags.act0_negotiated_fee === true ? "ibu-deal-negotiated" : "ibu-deal-gratitude",
      label: world.questFlags.act0_negotiated_fee === true
        ? "Ibu's scooter offer · fee negotiated"
        : "Ibu's scooter offer · accepted with gratitude"
    });
  }

  if (world.life.hustle.completedDeliveryIds.includes(ACT0_CATERING_DELIVERY_ID)) {
    const onTime = world.questFlags.act0_catering_on_time;
    markers.push({
      id: onTime === true ? "ibu-catering-on-time" : onTime === false ? "ibu-catering-late" : "ibu-catering-delivered",
      label: onTime === true
        ? "Ibu's catering box · on time"
        : onTime === false
          ? "Ibu's catering box · late, completed"
          : "Ibu's catering box · delivered"
    });
  }
  return markers;
}

export function getPdaProfileLines(world: WorldState): string[] {
  if (!hasSeenPdaReveal(world)) return [];
  const model = getPdaReputationReadModel(world);
  const markerLines = model.historyMarkers.length
    ? chunkMarkers(model.historyMarkers.map((marker) => marker.label), 2).map((line) => `History: ${line}`)
    : ["History: no marked choices in this save"];
  return [
    "NusaDrop · Driver Transparency",
    `Efficiency ${model.platformEfficiencyScore}/100 · live signal ${formatSigned(-model.relationalAxis)}`,
    `metric_x ${model.communityTrustScore}/100 · live signal ${formatSigned(model.rootedAxis)}`,
    `Ibu note: “${model.ibuAnnotation}”`,
    ...markerLines,
    model.relationshipCopy
  ];
}

function chunkMarkers(markers: string[], count: number): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < markers.length; index += count) {
    chunks.push(markers.slice(index, index + count).join(" | "));
  }
  return chunks;
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function clampAxis(value: number): number {
  return Math.max(-100, Math.min(100, Math.round(value)));
}
