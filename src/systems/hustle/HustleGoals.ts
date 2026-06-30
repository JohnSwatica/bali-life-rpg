import { getDeliveryDefinition } from "../../data/deliveries";
import { getRentPressureState, getScooterUpgradeStatus, MIN_DELIVERY_BIKE_CONDITION } from "./HustleEconomy";
import type { WorldState } from "../../types";

export interface HustleGoalState {
  id: "first_delivery" | "steady_runner" | "daily_scooter" | "cover_first_rent" | "move_out_ready";
  title: string;
  description: string;
  progress: string;
  complete: boolean;
}

export interface HustleNextStepState {
  title: string;
  detail: string;
  urgency: "normal" | "urgent" | "blocked" | "complete";
}

export function getHustleGoalStates(world: WorldState): HustleGoalState[] {
  const hustle = world.life.hustle;
  const player = world.players[world.localPlayerId];
  const scooterUpgrade = getScooterUpgradeStatus(world);
  const rentPressure = getRentPressureState(world);
  return [
    {
      id: "first_delivery",
      title: "First run",
      description: "Complete Ibu Sari's starter delivery.",
      progress: `${Math.min(1, hustle.completedDeliveryCount)}/1 delivery`,
      complete: hustle.completedDeliveryCount >= 1
    },
    {
      id: "steady_runner",
      title: "Steady runner",
      description: "Complete 3 deliveries without dropping the hustle.",
      progress: `${Math.min(3, hustle.completedDeliveryCount)}/3 deliveries`,
      complete: hustle.completedDeliveryCount >= 3
    },
    {
      id: "daily_scooter",
      title: "Better scooter",
      description: "Upgrade from the borrowed rattletrap to a daily rental.",
      progress: hustle.scooterTier === "borrowed_rattletrap" ? scooterUpgrade.reason ?? "Ready in Phone Feed" : "Daily rental unlocked",
      complete: hustle.scooterTier !== "borrowed_rattletrap"
    },
    {
      id: "cover_first_rent",
      title: "Cover rent",
      description: "Pay the first local rent target and buy breathing room.",
      progress:
        hustle.rentDueDay > 4
          ? `Paid through Day ${hustle.rentDueDay}`
          : `Rp ${Math.min(player.money, hustle.rentAmount)}/${hustle.rentAmount}; ${rentPressure.shortLabel}`,
      complete: hustle.rentDueDay > 4
    },
    {
      id: "move_out_ready",
      title: "Move-out ready",
      description: "Reach 5 deliveries, Rp 700 delivery earnings, and 4.2★ driver rating.",
      progress: `${Math.min(5, hustle.completedDeliveryCount)}/5 runs, Rp ${Math.min(700, hustle.deliveryEarnings)}/700, ${Math.min(4.2, hustle.driverRating).toFixed(1)}/4.2★`,
      complete: hustle.moveOutReady
    }
  ];
}

export function getHustleNextStep(world: WorldState): HustleNextStepState {
  const player = world.players[world.localPlayerId];
  const hustle = world.life.hustle;

  if (!world.life.actProgress.firstDayComplete) {
    return {
      title: "Finish first day",
      detail: "Follow the Act 0 marker until Ibu Sari's delivery, first meal, and cheap-kos sleep are done.",
      urgency: "normal"
    };
  }

  if (hustle.activeDelivery) {
    const delivery = getDeliveryDefinition(hustle.activeDelivery.deliveryId);
    const timeLeft = Math.max(0, Math.ceil(hustle.activeDelivery.dueAt - absoluteMinute(world)));
    return {
      title: hustle.activeDelivery.stage === "accepted" ? "Pick up active delivery" : "Drop off active delivery",
      detail:
        hustle.activeDelivery.stage === "accepted"
          ? `${delivery?.pickupLabel ?? "Go to the pickup marker."} ${timeLeft} min left.`
          : `${delivery?.dropoffLabel ?? "Go to the dropoff marker."} ${timeLeft} min left.`,
      urgency: timeLeft <= 15 ? "urgent" : "normal"
    };
  }

  if (hustle.moveOutReady) {
    return {
      title: "Start Act 2",
      detail: "You have the hustle baseline. Follow Ari's social markers, join a crew, and turn familiar faces into friends.",
      urgency: "complete"
    };
  }

  if (!player.hasBike) {
    return {
      title: "Get scooter access",
      detail: "Delivery work needs a scooter. Recover the Act 0 borrowed ride or rent one near Canggu Station.",
      urgency: "blocked"
    };
  }

  if (player.bikeStuck) {
    return {
      title: "Free the scooter",
      detail: "Ask nearby helpers to pull it out before taking another delivery.",
      urgency: "blocked"
    };
  }

  if (player.bikeCondition < MIN_DELIVERY_BIKE_CONDITION) {
    return {
      title: "Repair scooter",
      detail: `Phone Feed repair is needed before board jobs unlock again. Current condition: ${player.bikeCondition}%.`,
      urgency: "blocked"
    };
  }

  const rentPressure = getRentPressureState(world);
  if (rentPressure.status !== "comfortable") {
    if (player.money >= hustle.rentAmount) {
      return {
        title: "Pay rent",
        detail: `You have Rp ${player.money}; pay Rp ${hustle.rentAmount} in Phone Feed to buy breathing room.`,
        urgency: rentPressure.status === "overdue" || rentPressure.status === "due_today" ? "urgent" : "normal"
      };
    }
    return {
      title: "Earn rent money",
      detail: `${rentPressure.shortLabel}. Need Rp ${hustle.rentAmount - player.money} more before rent feels steady.`,
      urgency: rentPressure.status === "overdue" || rentPressure.status === "due_today" ? "urgent" : "normal"
    };
  }

  const scooterUpgrade = getScooterUpgradeStatus(world);
  if (scooterUpgrade.available) {
    return {
      title: "Upgrade scooter",
      detail: `Spend Rp ${scooterUpgrade.cost} in Phone Feed for a daily rental and smoother delivery work.`,
      urgency: "normal"
    };
  }

  if (hustle.completedDeliveryCount < 3) {
    return {
      title: "Build delivery rhythm",
      detail: `Take ${3 - hustle.completedDeliveryCount} more Hustle Board run${3 - hustle.completedDeliveryCount === 1 ? "" : "s"} to become a steady runner.`,
      urgency: "normal"
    };
  }

  if (hustle.completedDeliveryCount < 5) {
    return {
      title: "Push toward move-out",
      detail: `${5 - hustle.completedDeliveryCount} more clean run${5 - hustle.completedDeliveryCount === 1 ? "" : "s"} before Ibu Sari trusts you can leave the cheap kos.`,
      urgency: "normal"
    };
  }

  if (hustle.deliveryEarnings < 700) {
    return {
      title: "Stack delivery earnings",
      detail: `Earn Rp ${700 - hustle.deliveryEarnings} more from board jobs to prove the hustle can cover a better room.`,
      urgency: "normal"
    };
  }

  if (hustle.driverRating < 4.2) {
    return {
      title: "Raise driver rating",
      detail: `You need ${(4.2 - hustle.driverRating).toFixed(1)}★ more. Pick cleaner jobs and arrive before the timer bites.`,
      urgency: "normal"
    };
  }

  return {
    title: "Take one more board run",
    detail: "The numbers are close. Finish a clean delivery to lock in move-out readiness.",
    urgency: "normal"
  };
}

function absoluteMinute(world: WorldState): number {
  return Math.floor((Math.max(1, world.clock.day) - 1) * 1440 + world.clock.minuteOfDay);
}
