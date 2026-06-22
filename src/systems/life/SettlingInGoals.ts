import { settlingInGoalDefinitions } from "../../data/goals";
import { getAffinityTier } from "../relationships/RelationshipMemory";
import type { WorldState } from "../../types";

export interface SettlingInGoalState {
  id: string;
  title: string;
  description: string;
  complete: boolean;
}

export function getSettlingInGoalStates(world: WorldState): SettlingInGoalState[] {
  return settlingInGoalDefinitions.map((goal) => ({
    ...goal,
    complete: isGoalComplete(world, goal.id)
  }));
}

export function updateSettlingInGoals(world: WorldState): string[] {
  const newlyCompleted: string[] = [];
  for (const goal of getSettlingInGoalStates(world)) {
    if (goal.complete && !world.life.completedGoalIds.includes(goal.id)) {
      world.life.completedGoalIds.push(goal.id);
      newlyCompleted.push(goal.id);
    }
  }
  if (world.life.completedGoalIds.length >= settlingInGoalDefinitions.length) {
    world.life.settledIn = true;
  }
  return newlyCompleted;
}

export function getSettlingInGoalTitle(goalId: string): string {
  return settlingInGoalDefinitions.find((goal) => goal.id === goalId)?.title ?? goalId;
}

function isGoalComplete(world: WorldState, goalId: string): boolean {
  if (world.life.completedGoalIds.includes(goalId)) {
    return true;
  }
  if (goalId === "find_your_spot") {
    return hasVenueActivityCount(world, 3);
  }
  if (goalId === "first_friend") {
    return world.relationships.some((memory) => {
      const tier = getAffinityTier(memory);
      return memory.subjectType === "npc" && (tier === "friendly" || tier === "regular" || tier === "trusted");
    });
  }
  if (goalId === "earn_your_keep") {
    return totalEarnedFromWork(world) >= 300;
  }
  if (goalId === "touch_grass") {
    return Object.keys(world.life.activityHistory).some((key) => key.endsWith(":surf_beach_time"));
  }
  if (goalId === "plug_in") {
    return world.runtimeEvents.attendedEventIds.length > 0 || Object.keys(world.life.activityHistory).some((key) => key.endsWith(":remote_work_session"));
  }
  return false;
}

function hasVenueActivityCount(world: WorldState, requiredCount: number): boolean {
  const venueCounts = new Map<string, number>();
  for (const [key, record] of Object.entries(world.life.activityHistory)) {
    const venueId = key.split(":")[0];
    venueCounts.set(venueId, (venueCounts.get(venueId) ?? 0) + record.totalCount);
  }
  return [...venueCounts.values()].some((count) => count >= requiredCount);
}

function totalEarnedFromWork(world: WorldState): number {
  return Object.entries(world.life.activityHistory)
    .filter(([key]) => key.endsWith(":remote_work_session"))
    .reduce((total, [, record]) => total + record.earnedMoney, 0);
}
