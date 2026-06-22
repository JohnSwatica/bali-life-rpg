import type { OpenHours, PlayerMeters, WorldClockState, WorldState } from "../../types";

const DAY_MINUTES = 24 * 60;
export const MORNING_START_MINUTE = 8 * 60;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function advanceWorldMinutes(world: WorldState, minutes: number): void {
  world.clock.minuteOfDay += Math.max(0, minutes);
  while (world.clock.minuteOfDay >= DAY_MINUTES) {
    world.clock.minuteOfDay -= DAY_MINUTES;
    world.clock.day += 1;
  }
}

export function sleepUntilNextMorning(world: WorldState): void {
  world.clock.day += 1;
  world.clock.minuteOfDay = MORNING_START_MINUTE;
}

export function canSleepNow(clock: WorldClockState, meters: PlayerMeters): boolean {
  return clock.minuteOfDay >= 21 * 60 || clock.minuteOfDay < 5 * 60 || meters.energy <= 25;
}

export function isOpenAt(openHours: OpenHours | undefined, clock: WorldClockState): boolean {
  if (!openHours) {
    return true;
  }
  const hours = openHours[getDayKey(clock.day)];
  if (!hours || hours === "closed") {
    return false;
  }
  return isMinuteInHours(clock.minuteOfDay, hours.open * 60, hours.close * 60);
}

export function formatClockTime(minuteOfDay: number): string {
  const minutes = Math.floor(minuteOfDay);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function getDayKey(day: number): (typeof DAY_KEYS)[number] {
  return DAY_KEYS[day % DAY_KEYS.length];
}

function isMinuteInHours(minuteOfDay: number, openMinute: number, closeMinute: number): boolean {
  if (openMinute === closeMinute) {
    return true;
  }
  if (closeMinute > openMinute) {
    return minuteOfDay >= openMinute && minuteOfDay < closeMinute;
  }
  return minuteOfDay >= openMinute || minuteOfDay < closeMinute;
}
