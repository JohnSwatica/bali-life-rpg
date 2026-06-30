import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { sleepUntilNextMorning } from "../time/DailyClock";
import { applyPendingMorningPenalties } from "./ActivityEngine";
import type { PlayerMeters, WorldState } from "../../types";

export interface SleepCycleResult {
  meters: PlayerMeters;
  morningPenaltyMessage: string;
}

export function sleepAtHomeUntilMorning(world: WorldState): SleepCycleResult {
  sleepUntilNextMorning(world);
  world.meters.energy = 100;
  const meters = adjustPlayerMeters(world, { wellbeing: 8, focus: 6, social: -4 });
  const morningPenaltyMessage = applyPendingMorningPenalties(world);
  return { meters, morningPenaltyMessage };
}
