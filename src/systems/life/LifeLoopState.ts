import type { LifeLoopState } from "../../types";

export function createDefaultLifeLoopState(): LifeLoopState {
  return {
    activityHistory: {},
    completedGoalIds: [],
    joinedClubIds: [],
    relationshipArcProgress: {},
    settledIn: false
  };
}

export function migrateLifeLoopState(rawLife: unknown): LifeLoopState {
  const base = createDefaultLifeLoopState();
  if (!rawLife || typeof rawLife !== "object") {
    return base;
  }
  const partial = rawLife as Partial<LifeLoopState>;
  return {
    activityHistory: partial.activityHistory ?? {},
    completedGoalIds: partial.completedGoalIds ?? [],
    joinedClubIds: partial.joinedClubIds ?? [],
    relationshipArcProgress: partial.relationshipArcProgress ?? {},
    settledIn: partial.settledIn ?? false
  };
}
