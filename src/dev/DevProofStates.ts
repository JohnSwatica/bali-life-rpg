import {
  appendOpportunityMessage,
  markOpportunityMessagesRead
} from "../systems/opportunities/OpportunityEngine";
import { createInitialWorldState } from "../systems/WorldState";
import { applyAct0NegotiatedCompletionFee, completeAct0Step } from "../systems/life/ActProgression";
import { sleepAtHomeUntilMorning } from "../systems/life/SleepCycle";
import { payHustleRent, repairScooter } from "../systems/hustle/HustleEconomy";
import { acceptDelivery, completeDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import {
  ACT0_STORM_DELIVERY_ID,
  ACT0_VILLA_DELIVERY_ID,
  completeAct0CafeScene,
  prepareAct0VillaOrder,
  resolveAct0Deposit,
  revealAct0Deposit
} from "../systems/story/Act0BackHalf";
import { startAct0FirstDelivery } from "../systems/story/Act0Opening";
import {
  completeAct1LeoEncounter,
  triggerAct1RateCut
} from "../systems/story/Act1IncitingHook";
import {
  buildKadekRushOfferMessage,
  KADEK_PRIORITY_DELIVERY_ID,
  KADEK_RUSH_DELIVERY_ID
} from "../systems/story/Act1KadekPriority";
import { completeMadeRoomOfferScene } from "../systems/story/Act1MadeRoomOffer";
import {
  ACT1_BREAKDOWN_MIN_RIDE_MS,
  triggerAct1Breakdown
} from "../systems/story/Act1Breakdown";
import { getDeliveryDefinition } from "../data/deliveries";
import { ARI_SURF_RUN_CREW_ID, KITCHEN_CIRCLE_CREW_ID } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { opportunityTemplates } from "../data/opportunities";
import { completeCrewSession, inviteToCrew, joinCrew } from "../systems/crews/CrewSystem";
import { prepareAriCrewSessionBeat } from "../systems/story/Act2AriCrew";
import { prepareKitchenCircleSessionBeat } from "../systems/story/Act2KitchenCircle";
import { applyEventParticipation } from "../systems/events/EventParticipation";
import {
  bumpRelationshipAffinity,
  getAffinityTier,
  getRelationship
} from "../systems/relationships/RelationshipMemory";
import { resolveAct1LuxuryTipChoice } from "../systems/story/Act1LuxuryTip";
import {
  acceptOpportunity,
  resolveOpportunity,
  spawnOpportunity
} from "../systems/opportunities/OpportunityEngine";
import {
  acceptMadeFinale,
  completeAct1MoveOut,
  completeIbuGuaranteeScene,
  markMoveOutMontageStarted,
  signWeeklyScooterContract,
  startAct2AfterFinale
} from "../systems/story/Act1Finale";
import type { WorldState } from "../types";

export const DEV_PROOF_BOOT_STATE_NAMES = [
  "act0_complete",
  "act1_leo_resolved",
  "act1_steady_runner",
  "act1_both_tps",
  "act1_post_reversal",
  "act1_finale_ready",
  "act1_finale_complete",
  "act2_entered",
  "act2_ari_crew_complete",
  "act2_both_crews_regular",
  "act2_pda_reveal_ready",
  "act2_kitchen_serve_ready"
] as const;

export type DevProofBootStateName = (typeof DEV_PROOF_BOOT_STATE_NAMES)[number];
export type DevProofBootStateBuilder = () => WorldState;

function buildAct0Complete(): WorldState {
  const world = createInitialWorldState();
  let now = 8 * 60;

  requireOk(startAct0FirstDelivery(world, true, now), "start Act 0 first delivery");
  requireOk(completeDelivery(world, now + 14, 1), "complete Act 0 catering delivery");
  applyAct0NegotiatedCompletionFee(world, "act0_ibu_milk_madu_catering");
  requireStep(world, "dropoff_first_delivery");
  requireMutation(completeAct0CafeScene(world), "complete Act 0 cafe scene");

  now += 40;
  requireOk(acceptDelivery(world, ACT0_STORM_DELIVERY_ID, now), "accept Act 0 storm delivery");
  requireOk(pickupDelivery(world, now), "pick up Act 0 storm delivery");
  requireStep(world, "nusadrop_signup");
  requireOk(completeDelivery(world, now + 22, 1), "complete Act 0 storm delivery");
  requireStep(world, "dropoff_storm_delivery");

  revealAct0Deposit(world);
  requireStep(world, "landlord_ultimatum");
  prepareAct0VillaOrder(world);
  now += 24;
  requireOk(acceptDelivery(world, ACT0_VILLA_DELIVERY_ID, now), "accept Act 0 villa delivery");
  requireStep(world, "villa_order_ping");
  requireOk(pickupDelivery(world, now + 8), "pick up Act 0 villa delivery");
  requireStep(world, "pickup_villa_delivery");
  requireOk(completeDelivery(world, now + 31, 1), "complete Act 0 villa delivery");
  requireStep(world, "dropoff_villa_delivery");

  resolveAct0Deposit(world);
  requireStep(world, "pay_kos_deposit");
  sleepAtHomeUntilMorning(world);
  requireStep(world, "sleep_first_night");
  const rateCut = triggerAct1RateCut(world, absoluteMinute(world));
  requireMutation(rateCut.fired, "trigger Act 1 rate cut");
  if (rateCut.message) appendOpportunityMessage(world.opportunities, rateCut.message);
  return world;
}

function buildAct1LeoResolved(): WorldState {
  const world = buildAct0Complete();
  const now = absoluteMinute(world) + 1;
  requireMutation(completeAct1LeoEncounter(world, now), "complete Leo rate-cut encounter");
  const message = buildKadekRushOfferMessage(world, now + 1);
  if (message) appendOpportunityMessage(world.opportunities, message);
  return world;
}

function buildAct1SteadyRunner(): WorldState {
  const world = buildAct1LeoResolved();
  let now = absoluteMinute(world) + 10;
  requireOk(acceptDelivery(world, KADEK_RUSH_DELIVERY_ID, now), "accept Kadek rush delivery");
  requireOk(pickupDelivery(world, now + 8), "pick up Kadek rush delivery");
  requireOk(completeDelivery(world, now + 30, 1), "complete Kadek rush delivery");

  now += 36;
  requireOk(repairScooter(world, now, 1), "repair scooter after Kadek rush");
  now += 4;
  completeCountedDelivery(world, "milk_madu_brunch_bag", now);
  completeCountedDelivery(world, KADEK_PRIORITY_DELIVERY_ID, now + 36);
  return world;
}

function buildAct1BothTurningPoints(): WorldState {
  const world = buildAct1SteadyRunner();
  markOpportunityMessagesRead(world.opportunities);
  const roomOffer = completeMadeRoomOfferScene(world, absoluteMinute(world) + 1);
  requireMutation(roomOffer.fired, "complete Made hidden-room scene");
  return world;
}

function buildAct1PostReversal(): WorldState {
  const world = buildAct1BothTurningPoints();
  const deliveryId = "satu_satu_invoice_pouch";
  const now = absoluteMinute(world) + 10;
  requireOk(acceptDelivery(world, deliveryId, now), "accept reversal delivery");
  requireOk(pickupDelivery(world, now + 8), "pick up reversal delivery");
  world.players[world.localPlayerId].onBike = true;
  world.life.hustle.activeDelivery!.rideRun!.elapsedMs = ACT1_BREAKDOWN_MIN_RIDE_MS;
  const dropoff = getDeliveryDefinition(deliveryId)!.dropoffPoint;
  const breakdown = triggerAct1Breakdown(world, {
    x: dropoff.x + 300,
    y: dropoff.y,
    now: now + 18
  });
  requireMutation(breakdown.fired, "trigger authored reversal");
  requireOk(completeDelivery(world, now + 30, 1), "complete reversal delivery");
  requireOk(repairScooter(world, now + 36, 1), "repair scooter after reversal");
  return world;
}

function buildAct1FinaleReady(): WorldState {
  const world = buildAct1PostReversal();
  markOpportunityMessagesRead(world.opportunities);
  let now = absoluteMinute(world) + 44;
  completeCountedDelivery(world, "milk_madu_brunch_bag", now);
  requireMutation(resolveAct1LuxuryTipChoice(world, "return", now + 31).ok, "resolve Luxury Tip return branch");
  now += 36;
  requireOk(payHustleRent(world, now), "cover first rent");
  return world;
}

function buildAct1FinaleComplete(): WorldState {
  const world = buildAct1FinaleReady();
  const now = absoluteMinute(world) + 1;
  requireMutation(completeIbuGuaranteeScene(world, now).ok, "complete Ibu guarantee");
  requireMutation(acceptMadeFinale(world, now + 1).ok, "accept Made finale");
  requireMutation(markMoveOutMontageStarted(world, now + 2), "start move-out montage");
  requireMutation(completeAct1MoveOut(world, now + 3), "complete move-out montage");
  requireMutation(signWeeklyScooterContract(world, now + 4).ok, "sign weekly scooter contract");
  requireMutation(startAct2AfterFinale(world, now + 5), "start Act 2 card");
  return world;
}

function buildAct2AriCrewComplete(): WorldState {
  const world = buildAct1FinaleComplete();
  requireOk(inviteToCrew(world, ARI_SURF_RUN_CREW_ID), "invite Ari crew");
  requireOk(joinCrew(world, ARI_SURF_RUN_CREW_ID), "join Ari crew");
  const sessions = [
    { slotId: "wednesday_sunset_circle", day: 3 },
    { slotId: "friday_sunset_circle", day: 5 },
    { slotId: "sunday_morning_run", day: 7 }
  ];
  for (const [index, session] of sessions.entries()) {
    const event = gameEventDefinitions.find(
      (candidate) => candidate.crewSession?.crewId === ARI_SURF_RUN_CREW_ID &&
        candidate.crewSession.sessionSlotId === session.slotId
    );
    if (!event) throw new Error(`Could not find Ari crew session ${session.slotId}.`);
    world.clock.day = session.day;
    world.clock.minuteOfDay = session.slotId === "sunday_morning_run" ? 7 * 60 : 17 * 60 + 15;
    prepareAriCrewSessionBeat(world, event);
    const startedAt = absoluteMinute(world);
    requireOk(applyEventParticipation(world, event, startedAt), `participate in ${session.slotId}`);
    requireOk(completeCrewSession(world, event, session.day, startedAt + index), `attend ${session.slotId}`);
    if (!world.runtimeEvents.attendedEventIds.includes(event.id)) {
      world.runtimeEvents.attendedEventIds.push(event.id);
    }
  }
  world.clock.day = 8;
  world.clock.minuteOfDay = 10 * 60;
  return world;
}

function buildAct2BothCrewsRegular(): WorldState {
  const world = buildAct2AriCrewComplete();
  requireOk(inviteToCrew(world, KITCHEN_CIRCLE_CREW_ID), "invite Kitchen Circle");
  requireOk(joinCrew(world, KITCHEN_CIRCLE_CREW_ID), "join Kitchen Circle");

  const sessions = [
    { slotId: "tuesday_evening_kitchen", day: 9 },
    { slotId: "saturday_evening_kitchen", day: 13 },
    { slotId: "tuesday_evening_kitchen", day: 16 }
  ];
  for (const [index, session] of sessions.entries()) {
    const event = gameEventDefinitions.find(
      (candidate) => candidate.crewSession?.crewId === KITCHEN_CIRCLE_CREW_ID &&
        candidate.crewSession.sessionSlotId === session.slotId
    );
    if (!event) throw new Error(`Could not find Kitchen Circle session ${session.slotId}.`);
    world.clock.day = session.day;
    world.clock.minuteOfDay = 18 * 60 + 15;
    prepareKitchenCircleSessionBeat(world, event);
    const startedAt = absoluteMinute(world);
    requireOk(applyEventParticipation(world, event, startedAt), `participate in ${session.slotId}`);
    requireOk(completeCrewSession(world, event, session.day, startedAt + index), `attend ${session.slotId}`);
    if (!world.runtimeEvents.attendedEventIds.includes(event.id)) {
      world.runtimeEvents.attendedEventIds.push(event.id);
    }
  }

  ensureFriendlyAffinity(world, "ibu_sari");
  ensureFriendlyAffinity(world, "kadek");
  ensureFriendlyAffinity(world, "ari");
  world.clock.day = 23;
  world.clock.minuteOfDay = 10 * 60;
  return world;
}

function buildAct2PdaRevealReady(): WorldState {
  const world = buildAct2BothCrewsRegular();
  const template = opportunityTemplates.find((candidate) => candidate.id === "no_questions_package");
  if (!template) throw new Error("Could not find the No-Questions Package opportunity.");
  const now = absoluteMinute(world);
  const live = spawnOpportunity(world.opportunities, template, now);
  requireOk(acceptOpportunity(world.opportunities, live.id, now), "accept the No-Questions Package");
  requireOk(resolveOpportunity(world.opportunities, world, live.id, now + 1), "complete the No-Questions Package");
  return world;
}

function buildAct2KitchenServeReady(): WorldState {
  const world = buildAct2BothCrewsRegular();
  world.clock.day = 23;
  world.clock.minuteOfDay = 18 * 60 + 15;
  return world;
}

export const DEV_PROOF_BOOT_STATE_BUILDERS: Readonly<Record<DevProofBootStateName, DevProofBootStateBuilder>> = {
  act0_complete: buildAct0Complete,
  act1_leo_resolved: buildAct1LeoResolved,
  act1_steady_runner: buildAct1SteadyRunner,
  act1_both_tps: buildAct1BothTurningPoints,
  act1_post_reversal: buildAct1PostReversal,
  act1_finale_ready: buildAct1FinaleReady,
  act1_finale_complete: buildAct1FinaleComplete,
  act2_entered: buildAct1FinaleComplete,
  act2_ari_crew_complete: buildAct2AriCrewComplete,
  act2_both_crews_regular: buildAct2BothCrewsRegular,
  act2_pda_reveal_ready: buildAct2PdaRevealReady,
  act2_kitchen_serve_ready: buildAct2KitchenServeReady
};

export function buildDevProofBootState(name: DevProofBootStateName): WorldState {
  return DEV_PROOF_BOOT_STATE_BUILDERS[name]();
}

export function isDevProofBootStateName(value: string): value is DevProofBootStateName {
  return Object.prototype.hasOwnProperty.call(DEV_PROOF_BOOT_STATE_BUILDERS, value);
}

function completeCountedDelivery(world: WorldState, deliveryId: string, now: number): void {
  requireOk(acceptDelivery(world, deliveryId, now), `accept ${deliveryId}`);
  requireOk(pickupDelivery(world, now + 8), `pick up ${deliveryId}`);
  requireOk(completeDelivery(world, now + 30, 1), `complete ${deliveryId}`);
}

function requireStep(world: WorldState, step: Parameters<typeof completeAct0Step>[1]): void {
  requireMutation(completeAct0Step(world, step), `complete Act 0 step ${step}`);
}

function requireOk(result: { ok: boolean; message: string }, label: string): void {
  if (!result.ok) throw new Error(`Could not ${label}: ${result.message}`);
}

function requireMutation(ok: boolean, label: string): void {
  if (!ok) throw new Error(`Could not ${label}.`);
}

function ensureFriendlyAffinity(world: WorldState, npcId: string): void {
  const relationship = getRelationship(world, "npc", npcId);
  const tier = getAffinityTier(relationship);
  if (tier === "friendly" || tier === "regular" || tier === "trusted") return;
  const affinity = relationship?.affinity ?? 0;
  bumpRelationshipAffinity(
    world,
    "npc",
    npcId,
    Math.max(1, 8 - affinity),
    "Act 2 structural-unlock proof setup",
    absoluteMinute(world)
  );
}

function absoluteMinute(world: WorldState): number {
  return Math.floor((Math.max(1, world.clock.day) - 1) * 1440 + world.clock.minuteOfDay);
}
