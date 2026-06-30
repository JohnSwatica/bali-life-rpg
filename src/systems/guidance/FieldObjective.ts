import { getAct0StepState, isAct0Complete } from "../life/ActProgression";
import { areAct2GoalsComplete, getAct2NextStep } from "../life/Act2Goals";
import { getAct3ReadinessNextStep } from "../life/Act3Readiness";
import { getHustleNextStep } from "../hustle/HustleGoals";
import type { WorldState } from "../../types";

export type FieldObjectiveSource = "act0" | "hustle" | "act2" | "act3" | "idle";
export type FieldObjectiveUrgency = "normal" | "urgent" | "blocked" | "complete";

export interface FieldObjectiveState {
  source: FieldObjectiveSource;
  title: string;
  detail: string;
  urgency: FieldObjectiveUrgency;
}

export function getFieldObjective(world: WorldState): FieldObjectiveState {
  if (!isAct0Complete(world)) {
    const step = getAct0StepState(world);
    return {
      source: "act0",
      title: step.title,
      detail: step.objective,
      urgency: "normal"
    };
  }

  if (world.life.actProgress.currentAct >= 2) {
    const act3Next = areAct2GoalsComplete(world) ? getAct3ReadinessNextStep(world) : null;
    if (act3Next?.urgency === "ceo") {
      return {
        source: "act3",
        title: act3Next.title,
        detail: act3Next.detail,
        urgency: "complete"
      };
    }

    const act2Next = getAct2NextStep(world);
    if (act2Next) {
      return {
        source: "act2",
        title: act2Next.title,
        detail: act2Next.detail,
        urgency: act2Next.urgency
      };
    }
  }

  if (world.life.actProgress.currentAct === 1 || world.life.hustle.moveOutReady) {
    const hustleNext = getHustleNextStep(world);
    return {
      source: "hustle",
      title: hustleNext.title,
      detail: hustleNext.detail,
      urgency: hustleNext.urgency
    };
  }

  return {
    source: "idle",
    title: "Explore Berawa",
    detail: "Talk to locals, visit venues, and follow any markers that show up on the street.",
    urgency: "normal"
  };
}

export function formatFieldObjectiveLine(objective: FieldObjectiveState): string {
  return `Now: ${objective.title} - ${objective.detail}`;
}
