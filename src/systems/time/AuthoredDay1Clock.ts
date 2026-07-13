import type { WorldState } from "../../types";

export const DAY1_TIME_BEATS = ["morning", "noon", "stormDusk", "night"] as const;
export type Day1TimeBeat = (typeof DAY1_TIME_BEATS)[number];

export interface AuthoredDay1ClockState {
  active: boolean;
  beat: Day1TimeBeat | null;
}

export const DAY1_TIME_BEAT_MINUTES: Record<Day1TimeBeat, number> = {
  morning: 8 * 60,
  noon: 12 * 60 + 15,
  stormDusk: 18 * 60 + 20,
  night: 20 * 60 + 15
};

export function createAuthoredDay1ClockState(): AuthoredDay1ClockState {
  return { active: false, beat: null };
}

/**
 * Moves the existing world clock to an authored Day-1 beat. The normal clock
 * keeps advancing from this point; this controller never owns a second timer.
 */
export function setTimePhaseForBeat(
  world: WorldState,
  state: AuthoredDay1ClockState,
  beat: Day1TimeBeat
): boolean {
  if (world.life.actProgress.currentAct !== 0 || world.life.actProgress.firstDayComplete) {
    return false;
  }
  world.clock.minuteOfDay = DAY1_TIME_BEAT_MINUTES[beat];
  state.active = true;
  state.beat = beat;
  return true;
}

export function releaseAuthoredDay1Clock(state: AuthoredDay1ClockState): boolean {
  if (!state.active && state.beat === null) {
    return false;
  }
  state.active = false;
  state.beat = null;
  return true;
}
