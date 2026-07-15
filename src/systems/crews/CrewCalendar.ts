import { crewDefinitions } from "../../data/crews";
import type { WorldState } from "../../types";
import { getCrewState } from "./CrewSystem";

export type CrewCalendarEntry =
  | {
      kind: "crew_session";
      day: number;
      startHour: number;
      title: string;
      crewId: string;
      membership: "invited" | "member";
      bold: boolean;
    }
  | {
      kind: "rent_day";
      day: number;
      startHour: number;
      title: string;
      bold: false;
    };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function getCrewCalendarEntries(world: WorldState): CrewCalendarEntry[] {
  if (world.life.actProgress.currentAct < 2) return [];
  const weekStart = startOfWeek(world.clock.day);
  const weekEnd = weekStart + 6;
  const entries: CrewCalendarEntry[] = [];

  for (const crew of crewDefinitions) {
    const state = getCrewState(world, crew.id);
    if (!state.invited && !state.member) continue;
    for (const slot of crew.sessionSlots) {
      const day = weekStart + dayOffset(slot.dayOfWeek);
      entries.push({
        kind: "crew_session",
        day,
        startHour: slot.startHour,
        title: `${DAY_LABELS[slot.dayOfWeek]} ${formatHour(slot.startHour)}-${formatHour(slot.endHour)} · ${crew.name}`,
        crewId: crew.id,
        membership: state.member ? "member" : "invited",
        bold: state.member
      });
    }
  }

  const rentDay = world.life.hustle.rentDueDay;
  if (rentDay >= weekStart && rentDay <= weekEnd) {
    entries.push({
      kind: "rent_day",
      day: rentDay,
      startHour: 0,
      title: `${DAY_LABELS[rentDay % 7]} · Rent day · Rp ${world.life.hustle.rentAmount}`,
      bold: false
    });
  }

  return entries.sort((a, b) => a.day - b.day || a.startHour - b.startHour || a.title.localeCompare(b.title));
}

export function getCrewCalendarWeekLabel(world: WorldState): string {
  const start = startOfWeek(world.clock.day);
  return `THIS WEEK · DAYS ${start}-${start + 6}`;
}

function startOfWeek(day: number): number {
  const safeDay = Math.max(1, Math.floor(day));
  return safeDay - ((safeDay - 1) % 7);
}

function dayOffset(dayOfWeek: number): number {
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

function formatHour(hourValue: number): string {
  const total = Math.round(hourValue * 60);
  const hour = Math.floor(total / 60) % 24;
  const minute = total % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}
