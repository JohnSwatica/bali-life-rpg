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
import { resolveAct1LuxuryTipChoice } from "../systems/story/Act1LuxuryTip";
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
  "act1_finale_complete"
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

export const DEV_PROOF_BOOT_STATE_BUILDERS: Readonly<Record<DevProofBootStateName, DevProofBootStateBuilder>> = {
  act0_complete: buildAct0Complete,
  act1_leo_resolved: buildAct1LeoResolved,
  act1_steady_runner: buildAct1SteadyRunner,
  act1_both_tps: buildAct1BothTurningPoints,
  act1_post_reversal: buildAct1PostReversal,
  act1_finale_ready: buildAct1FinaleReady,
  act1_finale_complete: buildAct1FinaleComplete
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

function absoluteMinute(world: WorldState): number {
  return Math.floor((Math.max(1, world.clock.day) - 1) * 1440 + world.clock.minuteOfDay);
}
