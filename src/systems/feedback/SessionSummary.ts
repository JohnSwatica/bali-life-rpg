import { getLocalPlayer } from "../WorldState";
import type { WorldState } from "../../types";

export interface SessionSummaryOptions {
  buildStamp: string;
  sessionStartedAt: number | null;
  now: number;
  lastObjectiveLine: string;
}

export function getApproximateSessionMinutes(sessionStartedAt: number | null, now: number): number {
  if (sessionStartedAt == null) {
    return 0;
  }
  return Math.max(0, Math.round((now - sessionStartedAt) / 60000));
}

export function createSessionSummary(world: WorldState, options: SessionSummaryOptions): string {
  const player = getLocalPlayer(world);
  const hustle = world.life.hustle;
  return [
    "Bali Life RPG feedback",
    `Build: ${options.buildStamp}`,
    `Act: ${world.life.actProgress.currentAct}`,
    `Day: ${world.clock.day}`,
    `Money: Rp ${player.money}`,
    `Driver rating: ${hustle.driverRating.toFixed(1)}`,
    `Completed deliveries: ${hustle.completedDeliveryCount}`,
    `Approx. minutes played this session: ${getApproximateSessionMinutes(options.sessionStartedAt, options.now)}`,
    `Last objective: ${options.lastObjectiveLine || "None"}`,
    "",
    "Where did you get bored?",
    "",
    "Where were you confused?",
    "",
    "Anything you liked?",
    ""
  ].join("\n");
}

export function createFeedbackMailto(world: WorldState, options: SessionSummaryOptions): string {
  const subject = `Bali Life RPG feedback ${options.buildStamp}`;
  return `mailto:smartjonnyz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(createSessionSummary(world, options))}`;
}
