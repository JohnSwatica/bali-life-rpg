import { gameEventDefinitions } from "../../data/events";
import type { GameEvent, PortalState, WorldClockState } from "../../types";

export function getActiveEvents(clock: WorldClockState, _portal?: PortalState): GameEvent[] {
  return gameEventDefinitions.filter((event) => isEventActive(event, clock));
}

export function getActiveEventsAtVenue(clock: WorldClockState, venueId: string): GameEvent[] {
  return getActiveEvents(clock).filter((event) => event.locationVenueId === venueId);
}

export function getUpcomingEvents(clock: WorldClockState, _portal?: PortalState, windowMinutes = 720): GameEvent[] {
  return gameEventDefinitions
    .map((event) => ({ event, distance: minutesUntilNextStart(clock, event) }))
    .filter(({ distance }) => distance > 0 && distance <= windowMinutes)
    .sort((a, b) => a.distance - b.distance)
    .map(({ event }) => event);
}

export function getEvent(eventId: string): GameEvent | undefined {
  return gameEventDefinitions.find((event) => event.id === eventId);
}

export function formatEventTime(event: GameEvent): string {
  return `${formatHour(event.schedule.startHour)}-${formatHour(event.schedule.endHour)}`;
}

export function formatEventSchedule(event: GameEvent): string {
  const days = event.schedule.day != null
    ? `Day ${event.schedule.day}`
    : `Days ${(event.schedule.recurringDays ?? []).join(", ") || "daily"}`;
  return `${days} ${formatEventTime(event)}`;
}

export function isEventActive(event: GameEvent, clock: WorldClockState): boolean {
  if (!isEventOnDay(event, clock.day)) {
    return false;
  }
  return isMinuteInWindow(clock.minuteOfDay, startMinute(event), endMinute(event));
}

function isEventOnDay(event: GameEvent, day: number): boolean {
  if (event.schedule.day != null) {
    return event.schedule.day === day;
  }
  const recurring = event.schedule.recurringDays;
  if (!recurring || recurring.length === 0) {
    return true;
  }
  return recurring.includes(day % 7);
}

function minutesUntilNextStart(clock: WorldClockState, event: GameEvent): number {
  const start = startMinute(event);
  for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    const candidateDay = clock.day + dayOffset;
    if (!isEventOnDay(event, candidateDay)) {
      continue;
    }
    const candidateDistance = dayOffset * 1440 + start - clock.minuteOfDay;
    if (candidateDistance > 0) {
      return candidateDistance;
    }
  }
  return Number.POSITIVE_INFINITY;
}

function isMinuteInWindow(minute: number, start: number, end: number): boolean {
  if (start <= end) {
    return minute >= start && minute < end;
  }
  return minute >= start || minute < end;
}

function startMinute(event: GameEvent): number {
  return Math.round(event.schedule.startHour * 60);
}

function endMinute(event: GameEvent): number {
  return Math.round(event.schedule.endHour * 60);
}

function formatHour(hourValue: number): string {
  const total = Math.round(hourValue * 60);
  const hour = Math.floor(total / 60) % 24;
  const minute = total % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}
