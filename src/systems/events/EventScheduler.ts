import { gameEventDefinitions } from "../../data/events";
import type { GameEvent, PortalState, WorldClockState } from "../../types";

export function getActiveEvents(clock: WorldClockState, portal: PortalState): GameEvent[] {
  return gameEventDefinitions.filter((event) => isEventVisible(event, portal) && isMinuteInWindow(clock.minuteOfDay, event));
}

export function getUpcomingEvents(clock: WorldClockState, portal: PortalState, windowMinutes = 360): GameEvent[] {
  const now = clock.minuteOfDay;
  return gameEventDefinitions
    .filter((event) => isEventVisible(event, portal))
    .map((event) => ({ event, distance: minutesUntil(now, event.startsAt) }))
    .filter(({ distance }) => distance > 0 && distance <= windowMinutes)
    .sort((a, b) => a.distance - b.distance)
    .map(({ event }) => event);
}

export function getEvent(eventId: string): GameEvent | undefined {
  return gameEventDefinitions.find((event) => event.id === eventId);
}

export function formatEventTime(event: GameEvent): string {
  return `${formatMinute(event.startsAt)}-${formatMinute(event.endsAt)}`;
}

function isEventVisible(event: GameEvent, portal: PortalState): boolean {
  if (event.mode === "multi" && portal.multiplayerStatus === "locked") {
    return true;
  }
  return event.mode === "both" || event.mode === "single" || portal.current === "multiplayer";
}

function isMinuteInWindow(minute: number, event: GameEvent): boolean {
  if (event.startsAt <= event.endsAt) {
    return minute >= event.startsAt && minute < event.endsAt;
  }
  return minute >= event.startsAt || minute < event.endsAt;
}

function minutesUntil(now: number, target: number): number {
  return target >= now ? target - now : 1440 - now + target;
}

function formatMinute(total: number): string {
  const hour = Math.floor(total / 60) % 24;
  const minute = total % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}
