import {
  deliveryDefinitions,
  getDeliveryCondition,
  getDeliveryDefinition,
  type DeliveryCondition,
  type DeliveryDefinition
} from "../../data/deliveries";
import { addItem, getQuantity, removeItem } from "../Inventory";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { bumpRelationshipAffinity } from "../relationships/RelationshipMemory";
import { adjustReputation, awardReputationTag } from "../reputation/ReputationState";
import { advanceWorldMinutes } from "../time/DailyClock";
import type { ActiveDeliveryState, WorldState } from "../../types";

export interface DeliveryResult {
  ok: boolean;
  message: string;
  activeDelivery?: ActiveDeliveryState;
  starRating?: number;
  payout?: number;
}

export interface DeliveryOfferAvailability {
  delivery: DeliveryDefinition;
  available: boolean;
  reason: string | null;
}

export interface EffectiveDeliveryTerms {
  payout: number;
  timeLimitMin: number;
  meterDeltas: DeliveryDefinition["meterDeltas"];
}

export function getDeliveryOfferAvailability(world: WorldState): DeliveryOfferAvailability[] {
  return deliveryDefinitions
    .filter((delivery) => delivery.boardAvailable)
    .map((delivery) => evaluateDeliveryOffer(world, delivery));
}

export function getAvailableDeliveryOffers(world: WorldState): DeliveryDefinition[] {
  return getDeliveryOfferAvailability(world)
    .filter((offer) => offer.available)
    .map((offer) => offer.delivery);
}

export function acceptDelivery(world: WorldState, deliveryId: string, now: number): DeliveryResult {
  const definition = getDeliveryDefinition(deliveryId);
  if (!definition) {
    return { ok: false, message: "That delivery is missing." };
  }
  if (world.life.hustle.activeDelivery) {
    return { ok: false, message: "Finish your current delivery first." };
  }
  if (definition.boardAvailable) {
    const eligibility = evaluateDeliveryOffer(world, definition);
    if (!eligibility.available) {
      return { ok: false, message: eligibility.reason ?? "That delivery is not available yet." };
    }
  }
  const condition = selectDeliveryCondition(world, definition, now);
  const terms = getEffectiveDeliveryTerms(definition, condition);
  const activeDelivery: ActiveDeliveryState = {
    deliveryId,
    stage: "accepted",
    acceptedAt: now,
    dueAt: now + terms.timeLimitMin,
    conditionId: condition?.id
  };
  world.life.hustle.activeDelivery = activeDelivery;
  const conditionCopy = condition ? ` (${condition.label})` : "";
  return { ok: true, message: `${definition.title}${conditionCopy} accepted. Go to ${definition.pickupVenueId.replace(/_/g, " ")}.`, activeDelivery };
}

export function pickupDelivery(world: WorldState, now: number): DeliveryResult {
  const active = world.life.hustle.activeDelivery;
  if (!active) {
    return { ok: false, message: "No active delivery." };
  }
  if (active.stage !== "accepted") {
    return { ok: false, message: "Delivery already picked up." };
  }
  const definition = getDeliveryDefinition(active.deliveryId);
  if (!definition) {
    return { ok: false, message: "That delivery is missing." };
  }
  if (getQuantity(world.players[world.localPlayerId], definition.itemId) === 0) {
    addItem(world.players[world.localPlayerId], definition.itemId, 1);
  }
  active.stage = "picked_up";
  active.pickedUpAt = now;
  advanceWorldMinutes(world, 8);
  return { ok: true, message: `${definition.pickupLabel} Now ride to ${definition.dropoffName}.`, activeDelivery: active };
}

export function completeDelivery(world: WorldState, now: number, performanceScore?: number): DeliveryResult {
  const active = world.life.hustle.activeDelivery;
  if (!active) {
    return { ok: false, message: "No active delivery." };
  }
  if (active.stage !== "picked_up") {
    return { ok: false, message: "Pick up the order first." };
  }
  const definition = getDeliveryDefinition(active.deliveryId);
  if (!definition) {
    return { ok: false, message: "That delivery is missing." };
  }
  const player = world.players[world.localPlayerId];
  if (!removeItem(player, definition.itemId, 1)) {
    return { ok: false, message: `The ${definition.itemId.replace(/_/g, " ")} is missing from your bag.` };
  }

  const condition = getDeliveryCondition(definition, active.conditionId);
  const terms = getEffectiveDeliveryTerms(definition, condition);
  const starRating = calculateDeliveryStarRating(active, now, performanceScore, condition);
  const payout = calculateDeliveryPayout(terms.payout, starRating);
  player.money += payout;
  adjustPlayerMeters(world, terms.meterDeltas);
  advanceWorldMinutes(world, 12);

  for (const bump of definition.affinityBumps ?? []) {
    bumpRelationshipAffinity(world, "npc", bump.npcId, bump.amount, `Delivery: ${definition.title}`, now);
  }
  if (definition.reputation?.delta) {
    adjustReputation(world.reputation, definition.reputation.delta, definition.reputation.reason, now);
  }
  if (definition.reputation?.tag) {
    awardReputationTag(world.reputation, definition.reputation.tag, definition.reputation.reason, now);
  }

  active.stage = "picked_up";
  active.completedAt = now;
  active.starRating = starRating;
  world.life.hustle.activeDelivery = null;
  if (!world.life.hustle.completedDeliveryIds.includes(definition.id)) {
    world.life.hustle.completedDeliveryIds.push(definition.id);
  }
  world.life.hustle.completedDeliveryCount += 1;
  world.life.hustle.deliveryEarnings += payout;
  world.life.hustle.driverRating = updateDriverRating(world.life.hustle.driverRating, starRating, definition.ratingWeight);
  world.life.hustle.moveOutReady =
    world.life.hustle.completedDeliveryCount >= 5 &&
    world.life.hustle.deliveryEarnings >= 700 &&
    world.life.hustle.driverRating >= 4.2;

  return {
    ok: true,
    message: `Delivered ${definition.title}${condition ? ` (${condition.label})` : ""}. Rp +${payout}. Driver rating ${starRating.toFixed(1)}★.`,
    starRating,
    payout
  };
}

export function calculateDeliveryStarRating(
  active: ActiveDeliveryState,
  now: number,
  performanceScore?: number,
  condition?: DeliveryCondition
): number {
  const minutesLate = Math.max(0, now - active.dueAt);
  const timingScore = minutesLate === 0 ? 1 : Math.max(0, 1 - minutesLate / 45);
  const skillScore = performanceScore ?? 0.72;
  return roundRating(2.6 + timingScore * 1.45 + skillScore * 0.95 + (condition?.ratingModifier ?? 0));
}

export function calculateDeliveryPayout(basePayout: number, starRating: number): number {
  const multiplier = 0.82 + (Math.max(1, Math.min(5, starRating)) / 5) * 0.28;
  return Math.round(basePayout * multiplier);
}

function updateDriverRating(current: number, latest: number, weight: number): number {
  const totalWeight = Math.max(1, weight + 4);
  return roundRating((current * (totalWeight - weight) + latest * weight) / totalWeight);
}

function evaluateDeliveryOffer(world: WorldState, delivery: DeliveryDefinition): DeliveryOfferAvailability {
  const player = world.players[world.localPlayerId];
  if (world.life.hustle.activeDelivery) {
    return { delivery, available: false, reason: "Finish your active delivery first." };
  }
  if (!world.life.actProgress.firstDayComplete) {
    return { delivery, available: false, reason: "Finish Ibu Sari's first-day run first." };
  }
  if (!player.hasBike) {
    return { delivery, available: false, reason: "You need a scooter for delivery work." };
  }
  if (delivery.repeatable === false && world.life.hustle.completedDeliveryIds.includes(delivery.id)) {
    return { delivery, available: false, reason: "Already completed." };
  }
  const requiredDeliveries = delivery.minCompletedDeliveries ?? 0;
  if (requiredDeliveries > world.life.hustle.completedDeliveryCount) {
    return {
      delivery,
      available: false,
      reason: `Need ${requiredDeliveries} completed ${requiredDeliveries === 1 ? "delivery" : "deliveries"}.`
    };
  }
  const requiredRating = delivery.minDriverRating ?? 0;
  if (requiredRating > world.life.hustle.driverRating) {
    return { delivery, available: false, reason: `Need ${requiredRating.toFixed(1)}★ driver rating.` };
  }
  return { delivery, available: true, reason: null };
}

export function previewDeliveryCondition(world: WorldState, delivery: DeliveryDefinition, now: number): DeliveryCondition | undefined {
  return selectDeliveryCondition(world, delivery, now);
}

export function getEffectiveDeliveryTerms(
  delivery: DeliveryDefinition,
  condition?: DeliveryCondition
): EffectiveDeliveryTerms {
  return {
    payout: Math.max(0, delivery.payout + (condition?.payoutBonus ?? 0)),
    timeLimitMin: Math.max(25, delivery.timeLimitMin + (condition?.timeLimitDeltaMin ?? 0)),
    meterDeltas: mergeMeterDeltas(delivery.meterDeltas, condition?.meterDeltas)
  };
}

function selectDeliveryCondition(world: WorldState, delivery: DeliveryDefinition, now: number): DeliveryCondition | undefined {
  if (!delivery.conditions?.length) {
    return undefined;
  }
  const bucket = Math.floor(now / 120);
  const seed = `${delivery.id}:${world.clock.day}:${world.life.hustle.completedDeliveryCount}:${bucket}`;
  const index = stableHash(seed) % delivery.conditions.length;
  return delivery.conditions[index];
}

function mergeMeterDeltas(
  base: DeliveryDefinition["meterDeltas"],
  modifier: DeliveryCondition["meterDeltas"]
): DeliveryDefinition["meterDeltas"] {
  const result: DeliveryDefinition["meterDeltas"] = { ...base };
  for (const [meter, delta] of Object.entries(modifier ?? {}) as Array<[keyof DeliveryDefinition["meterDeltas"], number]>) {
    result[meter] = (result[meter] ?? 0) + delta;
  }
  return result;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function roundRating(value: number): number {
  return Math.round(Math.max(1, Math.min(5, value)) * 10) / 10;
}
