import { canSleepNow } from "../time/DailyClock";
import type { WorldState } from "../../types";

export interface StationRecoveryNudge {
  id: "energy" | "wellbeing" | "focus";
  title: string;
  detail: string;
  urgency: "normal" | "blocked";
  venueIds: string[];
  includeHome: boolean;
}

export function getStationRecoveryNudge(world: WorldState): StationRecoveryNudge | null {
  if (!world.life.actProgress.firstDayComplete || world.life.hustle.activeDelivery) {
    return null;
  }

  if (world.meters.energy <= 25) {
    const sleepCopy = canSleepNow(world.clock, world.meters) ? " Sleep at the kos if you want to end the day cleanly." : "";
    return {
      id: "energy",
      title: "Recover before the next run",
      detail: `Energy is low. Eat at Ulekan or use the cheap kos before taking another job.${sleepCopy}`,
      urgency: "blocked",
      venueIds: ["ulekan_berawa", "milk_madu_berawa"],
      includeHome: true
    };
  }

  if (world.meters.wellbeing <= 30) {
    return {
      id: "wellbeing",
      title: "Reset your head",
      detail: "Wellbeing is shaky. Berawa Beach or a cheap warung stop can steady the day before more hustle.",
      urgency: "normal",
      venueIds: ["berawa_beach", "ulekan_berawa"],
      includeHome: false
    };
  }

  if (world.meters.focus <= 25) {
    return {
      id: "focus",
      title: "Refocus before drifting",
      detail: "Focus is thin. Use Satu-Satu's cafe table or a coworking sprint to turn the next hour into progress.",
      urgency: "normal",
      venueIds: ["satu_satu_coffee", "tropical_nomad_coworking_space"],
      includeHome: false
    };
  }

  return null;
}
