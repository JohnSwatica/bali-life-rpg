import type { WorldState } from "../../types";

export interface HustleGoalState {
  id: "first_delivery" | "steady_runner" | "daily_scooter" | "cover_first_rent" | "move_out_ready";
  title: string;
  description: string;
  complete: boolean;
}

export function getHustleGoalStates(world: WorldState): HustleGoalState[] {
  const hustle = world.life.hustle;
  return [
    {
      id: "first_delivery",
      title: "First run",
      description: "Complete Ibu Sari's starter delivery.",
      complete: hustle.completedDeliveryCount >= 1
    },
    {
      id: "steady_runner",
      title: "Steady runner",
      description: "Complete 3 deliveries without dropping the hustle.",
      complete: hustle.completedDeliveryCount >= 3
    },
    {
      id: "daily_scooter",
      title: "Better scooter",
      description: "Upgrade from the borrowed rattletrap to a daily rental.",
      complete: hustle.scooterTier !== "borrowed_rattletrap"
    },
    {
      id: "cover_first_rent",
      title: "Cover rent",
      description: "Pay the first local rent target and buy breathing room.",
      complete: hustle.rentDueDay > 4
    },
    {
      id: "move_out_ready",
      title: "Move-out ready",
      description: "Reach 5 deliveries, Rp 700 delivery earnings, and 4.2★ driver rating.",
      complete: hustle.moveOutReady
    }
  ];
}
