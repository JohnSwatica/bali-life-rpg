import { getDeliveryDefinition } from "../../data/deliveries";
import type { Act0Step, WorldState } from "../../types";

export interface Act0StepState {
  id: Act0Step;
  title: string;
  objective: string;
  complete: boolean;
}

export interface Act0ColdOpenCopy {
  title: string;
  body: string;
}

const ACT0_COLD_OPEN: Act0ColdOpenCopy = {
  title: "Morning In Berawa",
  body:
    "Morning drops you at the cheap kos with one bag, almost no rupiah, and Berawa traffic humming outside. " +
    "Your phone buzzes: Ibu Sari can help if you reach her near Canggu Station before the first rush.\n\n" +
    "Walk toward the marker. Controls: WASD/arrow keys move, E / ACT talks, P opens the phone for backup, ESC closes panels."
};

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
    title: "First timed dropoff",
    objective: "Get the loaded box to the marked door before the visible timer expires."
  },
  buy_meal_and_coffee: {
    title: "Get onto NusaDrop",
    objective: "At Milk & Madu, finish NusaDrop signup over a quick coffee and a proper plate."
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

const ACT0_MEAL_ACTIVITY_KIND: Record<string, "coffee" | "meal" | undefined> = {
  grab_coffee: "coffee",
  cafe_quick_caffeine: "coffee",
  eat_properly: "meal",
  cafe_brunch_table: "meal",
  warung_nasi_reset: "meal"
};

export function getAct0ColdOpenCopy(): Act0ColdOpenCopy {
  return ACT0_COLD_OPEN;
}

export function getAct0StepState(world: WorldState): Act0StepState {
  const id = world.life.actProgress.act0Step;
  if (id === "dropoff_first_delivery" && world.life.hustle.activeDelivery) {
    const delivery = getDeliveryDefinition(world.life.hustle.activeDelivery.deliveryId);
    const timeLeft = Math.max(0, Math.ceil(world.life.hustle.activeDelivery.dueAt - absoluteMinute(world)));
    return {
      id,
      title: timeLeft > 0 ? `TIMED DELIVERY · ${timeLeft} min` : "WINDOW MISSED · FINISH THE RUN",
      objective:
        timeLeft > 0
          ? `${delivery?.dropoffLabel ?? "Reach the marked door."} Keep the box steady.`
          : `The bonus is gone, but the story is not. ${delivery?.dropoffLabel ?? "Complete the marked dropoff."}`,
      complete: false
    };
  }
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
      `NusaDrop: ${world.life.hustle.completedDeliveryCount} deliveries, Rp ${world.life.hustle.deliveryEarnings}, ${world.life.hustle.driverRating.toFixed(1)}★`
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

export function getAct0MealProgressKindForActivity(activityId: string): "coffee" | "meal" | null {
  return ACT0_MEAL_ACTIVITY_KIND[activityId] ?? null;
}

export function isAct0Complete(world: WorldState): boolean {
  return world.life.actProgress.firstDayComplete || world.life.actProgress.act0Step === "complete";
}

export function applyAct0NegotiatedCompletionFee(world: WorldState, deliveryId: string): number {
  if (
    deliveryId !== "act0_ibu_milk_madu_catering" ||
    !world.questFlags.act0_negotiated_fee ||
    world.questFlags.act0_negotiated_fee_paid
  ) {
    return 0;
  }
  const fee = 25;
  world.questFlags.act0_negotiated_fee_paid = true;
  world.players[world.localPlayerId].money += fee;
  world.life.hustle.deliveryEarnings += fee;
  return fee;
}

function absoluteMinute(world: WorldState): number {
  return Math.floor((Math.max(1, world.clock.day) - 1) * 1440 + world.clock.minuteOfDay);
}
