import type { DeliveryDefinition } from "../../data/deliveries";
import type { OpportunityMessage, WorldState } from "../../types";
import { RIO_RACE_LOST_FLAG, RIO_RACE_WON_FLAG } from "../ride/RivalRace";

export const ACT1_RATE_CUT_FLAG = "act1_nusadrop_rate_cut_fired";
export const ACT1_LEO_ENCOUNTER_FLAG = "rio_act1_rate_cut_encounter";
export const ACT1_BASE_PAY_MULTIPLIER = 0.85;

export interface Act1RateCutTriggerResult {
  fired: boolean;
  message?: OpportunityMessage;
}

export function triggerAct1RateCut(world: WorldState, now: number): Act1RateCutTriggerResult {
  if (world.life.actProgress.currentAct < 1 || world.collectedPickups[ACT1_RATE_CUT_FLAG]) {
    return { fired: false };
  }
  world.collectedPickups[ACT1_RATE_CUT_FLAG] = Math.max(1, now);
  return {
    fired: true,
    message: {
      id: "story:act1:nusadrop-rate-cut",
      at: now,
      from: "NusaDrop Update",
      body: "Base delivery pay has been reduced by 15%. Surge Zones are now live. Watch the map for future rollout details.",
      venueId: "bali_family_rental_scooter",
      read: false
    }
  };
}

export function getDeliveryBasePayoutAfterAct1Cut(world: WorldState, delivery: DeliveryDefinition): number {
  if (!delivery.boardAvailable || !world.collectedPickups[ACT1_RATE_CUT_FLAG]) {
    return delivery.payout;
  }
  return Math.round(delivery.payout * ACT1_BASE_PAY_MULTIPLIER);
}

export function isAct1LeoEncounterPending(world: WorldState): boolean {
  return Boolean(world.collectedPickups[ACT1_RATE_CUT_FLAG]) && !world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG];
}

export function completeAct1LeoEncounter(world: WorldState, now: number): boolean {
  if (!isAct1LeoEncounterPending(world)) {
    return false;
  }
  world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG] = Math.max(1, now);
  return true;
}

export function getAct1LeoEncounterHookLine(world: WorldState): string {
  if (world.collectedPickups[RIO_RACE_WON_FLAG]) {
    return '"You beat my line once. Do it when every run pays less, then I will be impressed."';
  }
  if (world.collectedPickups[RIO_RACE_LOST_FLAG]) {
    return '"The race already priced your scooter correctly. New rates just make the lesson cheaper."';
  }
  return '"Put three clean runs on that scooter. Then come back and race me before the leaderboard forgets your name."';
}
