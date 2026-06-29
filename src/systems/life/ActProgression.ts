import { getDeliveryDefinition } from "../../data/deliveries";
import type { Act0Step, WorldState } from "../../types";

export interface Act0StepState {
  id: Act0Step;
  title: string;
  objective: string;
  complete: boolean;
}

const STEP_COPY: Record<Act0Step, { title: string; objective: string }> = {
  meet_ibu_sari: {
    title: "Find Ibu Sari",
    objective: "Walk to Ibu Sari near Canggu Station and press E / ACT."
  },
  pickup_first_delivery: {
    title: "First delivery pickup",
    objective: "Ride to BAKED. Berawa and pick up the sealed pastry box."
  },
  dropoff_first_delivery: {
    title: "Villa dropoff",
    objective: "Take the pastry box to the marked villa gate before the timer slips."
  },
  buy_meal_and_coffee: {
    title: "Spend your first earnings",
    objective: "Grab coffee and eat properly at a cafe or bakery."
  },
  sleep_first_night: {
    title: "Sleep it off",
    objective: "Ride back to your cheap kos marker and sleep until morning."
  },
  complete: {
    title: "First day survived",
    objective: "Open hustle begins: keep your rating up, cover rent, and build a life."
  }
};

const NEXT_STEP: Record<Act0Step, Act0Step> = {
  meet_ibu_sari: "pickup_first_delivery",
  pickup_first_delivery: "dropoff_first_delivery",
  dropoff_first_delivery: "buy_meal_and_coffee",
  buy_meal_and_coffee: "sleep_first_night",
  sleep_first_night: "complete",
  complete: "complete"
};

export function getAct0StepState(world: WorldState): Act0StepState {
  const id = world.life.actProgress.act0Step;
  return {
    id,
    ...STEP_COPY[id],
    complete: id === "complete"
  };
}

export function getAct0HudLines(world: WorldState): string[] {
  const step = getAct0StepState(world);
  const lines = [`Act 0: ${step.title}`, step.objective];
  const activeDelivery = world.life.hustle.activeDelivery;
  if (activeDelivery) {
    const delivery = getDeliveryDefinition(activeDelivery.deliveryId);
    if (delivery) {
      const timeLeft = Math.max(0, Math.ceil(activeDelivery.dueAt - absoluteMinute(world)));
      lines.push(
        activeDelivery.stage === "accepted"
          ? `Delivery: ${delivery.pickupLabel} (${timeLeft} min left)`
          : `Delivery: ${delivery.dropoffLabel} (${timeLeft} min left)`
      );
    }
  }
  if (world.life.actProgress.firstDayComplete) {
    lines.push(
      `Hustle: ${world.life.hustle.completedDeliveryCount} deliveries, Rp ${world.life.hustle.deliveryEarnings}, ${world.life.hustle.driverRating.toFixed(1)}★`
    );
  }
  return lines;
}

export function completeAct0Step(world: WorldState, stepId: Act0Step): boolean {
  const progress = world.life.actProgress;
  if (progress.completedAct0StepIds.includes(stepId)) {
    return false;
  }
  if (progress.act0Step !== stepId) {
    return false;
  }
  progress.completedAct0StepIds.push(stepId);
  progress.act0Step = NEXT_STEP[stepId];
  if (progress.act0Step === "complete") {
    if (progress.currentAct === 0) {
      progress.currentAct = 1;
    }
    progress.firstDayComplete = true;
  }
  return true;
}

export function markAct0MealProgress(world: WorldState, kind: "coffee" | "meal"): boolean {
  if (world.life.actProgress.act0Step !== "buy_meal_and_coffee") {
    return false;
  }
  const key = kind === "coffee" ? "act0_coffee_done" : "act0_meal_done";
  world.questFlags[key] = true;
  if (world.questFlags.act0_coffee_done && world.questFlags.act0_meal_done) {
    return completeAct0Step(world, "buy_meal_and_coffee");
  }
  return false;
}

export function isAct0Complete(world: WorldState): boolean {
  return world.life.actProgress.firstDayComplete || world.life.actProgress.act0Step === "complete";
}

function absoluteMinute(world: WorldState): number {
  return Math.floor((Math.max(1, world.clock.day) - 1) * 1440 + world.clock.minuteOfDay);
}
