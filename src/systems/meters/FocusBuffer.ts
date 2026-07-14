import type { WorldState } from "../../types";

export const FOCUS_BUFFER_UNTIL_FLAG = "kadek_focus_buffer_until";
export const FOCUS_BUFFER_DURATION_MIN = 3 * 60;

export function activateFocusBuffer(world: WorldState, now: number): number {
  const until = Math.floor(now) + FOCUS_BUFFER_DURATION_MIN;
  world.questFlags[FOCUS_BUFFER_UNTIL_FLAG] = until;
  return until;
}

export function isFocusBufferActive(world: WorldState, now = getWorldAbsoluteMinute(world)): boolean {
  const until = world.questFlags[FOCUS_BUFFER_UNTIL_FLAG];
  return typeof until === "number" && Number.isFinite(until) && now < until;
}

export function getFocusBufferRemainingMinutes(world: WorldState, now = getWorldAbsoluteMinute(world)): number {
  const until = world.questFlags[FOCUS_BUFFER_UNTIL_FLAG];
  return typeof until === "number" && Number.isFinite(until) ? Math.max(0, Math.ceil(until - now)) : 0;
}

function getWorldAbsoluteMinute(world: WorldState): number {
  return Math.floor((Math.max(1, world.clock.day) - 1) * 1440 + world.clock.minuteOfDay);
}
