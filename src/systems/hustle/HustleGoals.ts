import { getDeliveryDefinition } from "../../data/deliveries";
import { getRentPressureState, getScooterUpgradeStatus, MIN_DELIVERY_BIKE_CONDITION } from "./HustleEconomy";
import {
  ACT1_MOVE_OUT_DELIVERIES,
  ACT1_MOVE_OUT_DELIVERY_EARNINGS,
  ACT1_MOVE_OUT_DRIVER_RATING,
  ACT1_STEADY_RUNNER_DELIVERIES,
  getAct1MoveOutReadiness,
  hasCoveredFirstRent
} from "./HustleMilestones";
import { getStationRecoveryNudge } from "../life/StationRecovery";
import { getMadeRoomGoalState } from "../story/Act1MadeRoomOffer";
import {
  ACT1_MADE_KEY_FLAG,
  ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG,
  canStartIbuGuaranteeScene,
  isAct1MoveOutComplete,
  isIbuGuaranteeComplete
} from "../story/Act1Finale";
import {
  isAct1BreakdownPushActive,
  isAct1ScooterBlown
} from "../story/Act1Breakdown";
import type { WorldState } from "../../types";

export interface HustleGoalState {
  id: "first_delivery" | "steady_runner" | "daily_scooter" | "cover_first_rent" | "move_out_ready" | "mades_room";
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
  const moveOutReadiness = getAct1MoveOutReadiness(world);
  const goals: HustleGoalState[] = [
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
      progress: `${Math.min(ACT1_STEADY_RUNNER_DELIVERIES, hustle.completedDeliveryCount)}/${ACT1_STEADY_RUNNER_DELIVERIES} deliveries`,
      complete: hustle.completedDeliveryCount >= ACT1_STEADY_RUNNER_DELIVERIES
    },
    {
      id: "daily_scooter",
      title: "Better scooter",
      description: "Upgrade from the borrowed rattletrap to a daily rental.",
      progress: hustle.scooterTier === "borrowed_rattletrap" ? scooterUpgrade.reason ?? "Ready at scooter counter" : "Daily rental unlocked",
      complete: hustle.scooterTier !== "borrowed_rattletrap"
    },
    {
      id: "cover_first_rent",
      title: "Cover rent",
      description: "Pay the first local rent target and buy breathing room.",
      progress:
        hasCoveredFirstRent(world)
          ? `Paid through Day ${hustle.rentDueDay}`
          : `Rp ${Math.min(player.money, hustle.rentAmount)}/${hustle.rentAmount}; ${rentPressure.shortLabel}`,
      complete: hasCoveredFirstRent(world)
    },
    {
      id: "move_out_ready",
      title: "Move-out ready",
      description: `Reach ${ACT1_MOVE_OUT_DELIVERIES} deliveries, Rp ${ACT1_MOVE_OUT_DELIVERY_EARNINGS} delivery earnings, first rent covered, and either ${ACT1_MOVE_OUT_DRIVER_RATING.toFixed(1)}★ or Ibu Sari's guarantee.`,
      progress: `${Math.min(ACT1_MOVE_OUT_DELIVERIES, hustle.completedDeliveryCount)}/${ACT1_MOVE_OUT_DELIVERIES} runs, Rp ${Math.min(ACT1_MOVE_OUT_DELIVERY_EARNINGS, hustle.deliveryEarnings)}/${ACT1_MOVE_OUT_DELIVERY_EARNINGS}, ${Math.min(ACT1_MOVE_OUT_DRIVER_RATING, hustle.driverRating).toFixed(1)}/${ACT1_MOVE_OUT_DRIVER_RATING.toFixed(1)}★ or letter ${moveOutReadiness.guaranteeComplete ? "✓" : "✗"}, rent ${moveOutReadiness.firstRentCovered ? "covered" : "open"}`,
      complete: moveOutReadiness.complete
    }
  ];
  const madeRoomGoal = getMadeRoomGoalState(world);
  if (madeRoomGoal) {
    goals.push(madeRoomGoal);
  }
  return goals;
}

export function getHustleNextStep(world: WorldState): HustleNextStepState {
  const player = world.players[world.localPlayerId];
  const hustle = world.life.hustle;
  const moveOutReadiness = getAct1MoveOutReadiness(world);

  if (!world.life.actProgress.firstDayComplete) {
    return {
      title: "Finish first day",
      detail: "Follow the Act 0 marker until Ibu Sari's delivery, first meal, and cheap-kos sleep are done.",
      urgency: "normal"
    };
  }

  if (hustle.activeDelivery) {
    const delivery = getDeliveryDefinition(hustle.activeDelivery.deliveryId);
    if (isAct1BreakdownPushActive(world)) {
      return {
        title: "TRANSMISSION GONE — push it in",
        detail: `Walk the blown scooter to ${delivery?.dropoffName ?? "the dropoff"}. The cargo is ruined, but this run still completes late.`,
        urgency: "urgent"
      };
    }
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

  if (canStartIbuGuaranteeScene(world)) {
    return {
      title: "Ask Ibu Sari to vouch",
      detail: "The deliveries, earnings, and first rent are covered. Meet Ibu at the warung; the app rating is not the final word.",
      urgency: "complete"
    };
  }

  if (isIbuGuaranteeComplete(world) && !world.collectedPickups[ACT1_MADE_KEY_FLAG]) {
    return {
      title: "Bring Ibu's letter to Made",
      detail: "Made is waiting inside Bungalow Living. The recommendation now satisfies the room condition.",
      urgency: "complete"
    };
  }

  if (world.collectedPickups[ACT1_MADE_KEY_FLAG] && !isAct1MoveOutComplete(world)) {
    return {
      title: "Move out of the kos",
      detail: "Pack the temporary room, look back once, and take the shared-room key forward.",
      urgency: "complete"
    };
  }

  if (isAct1MoveOutComplete(world) && !world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG]) {
    return {
      title: "Sign the weekly scooter contract",
      detail: "Take the borrowed rattletrap to the rental counter and sign for a sustainable weekly ride.",
      urgency: "complete"
    };
  }

  if (world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG]) {
    return {
      title: "Act 1 complete",
      detail: "The room and ride are secured. Finding your people comes next.",
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
    if (isAct1ScooterBlown(world)) {
      return {
        title: "Repair blown transmission",
        detail: "Push complete. Take the scooter to the rental counter; repair restores the ride, not the 3.2★ rating.",
        urgency: "blocked"
      };
    }
    return {
      title: "Free the scooter",
      detail: "Ask nearby helpers to pull it out before taking another delivery.",
      urgency: "blocked"
    };
  }

  if (player.bikeCondition < MIN_DELIVERY_BIKE_CONDITION) {
    return {
      title: "Repair scooter",
      detail: `Repair at the scooter counter before board jobs unlock again. Current condition: ${player.bikeCondition}%.`,
      urgency: "blocked"
    };
  }

  const rentPressure = getRentPressureState(world);
  if (rentPressure.status !== "comfortable") {
    if (player.money >= hustle.rentAmount) {
      return {
        title: "Pay rent",
        detail: `You have Rp ${player.money}; pay Rp ${hustle.rentAmount} at the cheap kos to buy breathing room.`,
        urgency: rentPressure.status === "overdue" || rentPressure.status === "due_today" ? "urgent" : "normal"
      };
    }
    return {
      title: "Earn rent money",
      detail: `${rentPressure.shortLabel}. Need Rp ${hustle.rentAmount - player.money} more before rent feels steady.`,
      urgency: rentPressure.status === "overdue" || rentPressure.status === "due_today" ? "urgent" : "normal"
    };
  }

  const recoveryNudge = getStationRecoveryNudge(world);
  if (recoveryNudge) {
    return {
      title: recoveryNudge.title,
      detail: recoveryNudge.detail,
      urgency: recoveryNudge.urgency
    };
  }

  if (hustle.completedDeliveryCount < ACT1_STEADY_RUNNER_DELIVERIES) {
    return {
      title: "Build delivery rhythm",
      detail: `Take ${ACT1_STEADY_RUNNER_DELIVERIES - hustle.completedDeliveryCount} more NusaDrop run${ACT1_STEADY_RUNNER_DELIVERIES - hustle.completedDeliveryCount === 1 ? "" : "s"} to become a steady runner.`,
      urgency: "normal"
    };
  }

  const scooterUpgrade = getScooterUpgradeStatus(world);
  if (scooterUpgrade.available) {
    return {
      title: "Upgrade scooter",
      detail: `Spend Rp ${scooterUpgrade.cost} at the scooter counter for a daily rental and smoother delivery work.`,
      urgency: "normal"
    };
  }

  if (hustle.completedDeliveryCount < ACT1_MOVE_OUT_DELIVERIES) {
    return {
      title: "Push toward move-out",
      detail: `${ACT1_MOVE_OUT_DELIVERIES - hustle.completedDeliveryCount} more clean run${ACT1_MOVE_OUT_DELIVERIES - hustle.completedDeliveryCount === 1 ? "" : "s"} before Ibu Sari trusts you can leave the cheap kos.`,
      urgency: "normal"
    };
  }

  if (hustle.deliveryEarnings < ACT1_MOVE_OUT_DELIVERY_EARNINGS) {
    return {
      title: "Stack delivery earnings",
      detail: `Earn Rp ${ACT1_MOVE_OUT_DELIVERY_EARNINGS - hustle.deliveryEarnings} more from board jobs to prove the hustle can cover a better room.`,
      urgency: "normal"
    };
  }

  if (!moveOutReadiness.ratingOrGuaranteeComplete) {
    return {
      title: "Raise driver rating",
      detail: `You need ${(ACT1_MOVE_OUT_DRIVER_RATING - hustle.driverRating).toFixed(1)}★ more. Pick cleaner jobs and arrive before the timer bites.`,
      urgency: "normal"
    };
  }

  if (!moveOutReadiness.firstRentCovered) {
    if (player.money >= hustle.rentAmount) {
      return {
        title: "Cover first rent",
        detail: `Pay Rp ${hustle.rentAmount} at the cheap kos so Ibu Sari trusts you can leave it.`,
        urgency: "normal"
      };
    }
    return {
      title: "Stack rent buffer",
      detail: `Need Rp ${hustle.rentAmount - player.money} more, then pay first rent to unlock the Act 2 bridge.`,
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
