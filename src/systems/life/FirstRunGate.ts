import type { InteractionTarget } from "../interaction/InteractionController";
import type { WorldState } from "../../types";

export const FIRST_RUN_IBU_REDIRECT_TOAST = "Ibu Sari is waiting for you first - follow the arrow.";

export function shouldStartAct0FirstRunGate(world: WorldState): boolean {
  return !world.questFlags.firstRunHintSeen && world.life.actProgress.act0Step === "meet_ibu_sari";
}

export function isAct0FirstRunGateActive(world: WorldState, firstRunSessionActive: boolean): boolean {
  return firstRunSessionActive && world.life.actProgress.act0Step === "meet_ibu_sari";
}

export function shouldRedirectAct0FirstRunInteraction(
  world: WorldState,
  firstRunSessionActive: boolean,
  target: InteractionTarget | undefined,
  atHomeBase = false
): boolean {
  if (!isAct0FirstRunGateActive(world, firstRunSessionActive)) {
    return false;
  }
  if (target?.type === "npc" && target.id === "ibu_sari") {
    return false;
  }
  if ((target?.type === "venue" || target?.type === "shop") && target.id === "canggu_station") {
    return false;
  }
  return atHomeBase || Boolean(target);
}
