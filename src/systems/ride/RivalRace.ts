import { venueMapNodes } from "../../data/authoredStreetLayout";
import { adjustReputationAxis } from "../reputation/ReputationState";
import { recordRelationshipMemory } from "../relationships/RelationshipMemory";
import type { WorldState } from "../../types";

export type RivalRaceResult = "win" | "loss";

export interface RivalRaceRoutePoint {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface RivalRaceConfig {
  id: string;
  title: string;
  venueId: string;
  stake: number;
  winPayout: number;
  checkpointRadius: number;
  ghostTargetMs: number;
  ghostMaxStepPerSecond: number;
  ghostLeadCap: number;
  ghostTrailCap: number;
  maxRaceMs: number;
  route: RivalRaceRoutePoint[];
}

export interface RivalRaceEligibility {
  eligible: boolean;
  reason: string | null;
}

export interface RivalRaceOutcomeInput {
  playerFinishMs?: number;
  ghostFinishMs?: number;
  conceded?: boolean;
  timedOut?: boolean;
}

export interface RivalRaceOutcome {
  result: RivalRaceResult;
  reason: "player_beat_ghost" | "ghost_beat_player" | "conceded" | "timed_out";
}

export interface RivalRaceGhostStep {
  progress: number;
  finished: boolean;
}

export const RIO_RACE_COMPLETED_FLAG = "rio_race_completed";
export const RIO_RACE_WON_FLAG = "rio_race_won";
export const RIO_RACE_LOST_FLAG = "rio_race_lost";

const routeVenueIds = [
  "bali_family_rental_scooter",
  "canggu_station",
  "bungalow_living",
  "berawa_beach",
  "bali_family_rental_scooter"
];

export const RIO_RACE: RivalRaceConfig = {
  id: "rio_streak_duel",
  title: "Rio's Streak Duel",
  venueId: "bali_family_rental_scooter",
  stake: 25,
  winPayout: 70,
  checkpointRadius: 120,
  ghostTargetMs: 42000,
  ghostMaxStepPerSecond: 0.044,
  ghostLeadCap: 0.22,
  ghostTrailCap: 0.18,
  maxRaceMs: 70000,
  route: routeVenueIds.map((venueId, index) => {
    const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
    return {
      id: `${index}:${venueId}`,
      label: venueId.replace(/_/g, " "),
      x: node?.x ?? 0,
      y: node?.y ?? 0
    };
  })
};

export function getRioRaceEligibility(world: WorldState): RivalRaceEligibility {
  if (world.collectedPickups[RIO_RACE_COMPLETED_FLAG]) {
    return { eligible: false, reason: "Rio already has a result to talk about." };
  }
  if (world.life.actProgress.currentAct !== 1) {
    return { eligible: false, reason: "Rio saves the streak duel for the Act 1 hustle." };
  }
  if (world.life.hustle.activeDelivery) {
    return { eligible: false, reason: "Finish the active delivery before racing Rio." };
  }
  if (world.life.hustle.completedDeliveryCount < 3) {
    return { eligible: false, reason: "Rio does not notice you until you have three completed runs." };
  }
  if (world.life.hustle.driverRating < 3.5) {
    return { eligible: false, reason: "Rio wants at least a 3.5 driver rating before he risks his streak." };
  }
  if (!world.players[world.localPlayerId].hasBike) {
    return { eligible: false, reason: "You need scooter access before racing Rio." };
  }
  return { eligible: true, reason: null };
}

export function advanceRivalRaceGhost(
  config: RivalRaceConfig,
  previousProgress: number,
  elapsedMs: number,
  playerProgress: number,
  deltaMs: number
): RivalRaceGhostStep {
  const base = elapsedMs / config.ghostTargetMs;
  const target = clamp(base, Math.max(0, playerProgress - config.ghostTrailCap), Math.min(1, playerProgress + config.ghostLeadCap));
  const maxStep = (deltaMs / 1000) * config.ghostMaxStepPerSecond;
  const progress = clamp(target, previousProgress, Math.min(1, previousProgress + maxStep));
  return { progress, finished: progress >= 1 };
}

export function getRivalRaceRoutePosition(config: RivalRaceConfig, progress: number): RivalRaceRoutePoint {
  const route = config.route;
  if (route.length === 0) {
    return { id: "missing", label: "Missing route", x: 0, y: 0 };
  }
  if (route.length === 1) {
    return route[0];
  }
  const clamped = clamp(progress, 0, 1);
  const segmentFloat = clamped * (route.length - 1);
  const index = Math.min(route.length - 2, Math.floor(segmentFloat));
  const localT = segmentFloat - index;
  const start = route[index];
  const end = route[index + 1];
  return {
    id: `ghost:${index}`,
    label: end.label,
    x: start.x + (end.x - start.x) * localT,
    y: start.y + (end.y - start.y) * localT
  };
}

export function resolveRivalRaceOutcome(input: RivalRaceOutcomeInput): RivalRaceOutcome {
  if (input.conceded) {
    return { result: "loss", reason: "conceded" };
  }
  if (input.timedOut || input.playerFinishMs == null) {
    return { result: "loss", reason: "timed_out" };
  }
  if (input.ghostFinishMs != null && input.playerFinishMs > input.ghostFinishMs) {
    return { result: "loss", reason: "ghost_beat_player" };
  }
  return { result: "win", reason: "player_beat_ghost" };
}

export function applyRivalRaceOutcome(world: WorldState, outcome: RivalRaceOutcome, now: number): void {
  const player = world.players[world.localPlayerId];
  world.collectedPickups[RIO_RACE_COMPLETED_FLAG] = now;
  if (outcome.result === "win") {
    player.money += RIO_RACE.winPayout;
    world.collectedPickups[RIO_RACE_WON_FLAG] = now;
    adjustReputationAxis(world.reputation, "relational", 4, "Beat Rio clean in the streak duel", now);
    recordRelationshipMemory(world, "npc", "rio", "lost_to_you_clean", "Rio lost to you clean in the Act 1 streak duel", now);
    return;
  }
  world.collectedPickups[RIO_RACE_LOST_FLAG] = now;
  recordRelationshipMemory(world, "npc", "rio", "beat_you", "Rio beat you in the Act 1 streak duel", now);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
