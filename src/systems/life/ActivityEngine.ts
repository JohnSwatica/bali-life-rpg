import { activityDefinitions, type Activity } from "../../data/activities";
import { curatedVenues, type CuratedCategory, type CuratedVenue } from "../../data/curatedVenues";
import { curatedVenueNodes } from "../../data/authoredStreetLayout";
import { venueDefinitions } from "../../data/venues";
import { addItem } from "../Inventory";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import {
  formatPerformanceSummary,
  scaleMeterDeltasForPerformance,
  scaleMoneyDeltaForPerformance
} from "../minigames/ActivityMinigames";
import { advanceWorldMinutes, formatClockTime, isOpenAt } from "../time/DailyClock";
import type { OpenHours, WorldState } from "../../types";

export interface VenueActivityContext {
  venueId: string;
  curatedVenueId: string | null;
  name: string;
  category: CuratedCategory;
  openHours: OpenHours | undefined;
  npcIds: string[];
}

export interface ActivityAvailability {
  activity: Activity;
  available: boolean;
  reason: string | null;
}

export interface ActivityResult {
  ok: boolean;
  message: string;
  meterSummary: string;
  moneyDelta: number;
}

export interface ApplyActivityOptions {
  performanceScore?: number;
}

export function getVenueActivityContext(venueId: string): VenueActivityContext | null {
  const node = curatedVenueNodes.find((candidate) => candidate.venueId === venueId);
  const venue = venueDefinitions[venueId];
  const curated = findCuratedVenue(node?.curatedVenueId ?? venueId);
  const category = curated?.category ?? venueCategoryToCuratedCategory(venue?.venueCategory);
  if (!node && !venue && !curated) {
    return null;
  }
  return {
    venueId,
    curatedVenueId: curated?.id ?? node?.curatedVenueId ?? null,
    name: venue?.name ?? curated?.name ?? node?.name ?? venueId,
    category,
    openHours: venue?.openHours ?? openHoursFromTypicalHours(curated?.typicalHours),
    npcIds: venue?.npcIds ?? []
  };
}

export function getActivityAvailability(world: WorldState, context: VenueActivityContext): ActivityAvailability[] {
  return activityDefinitions
    .filter((activity) => activity.categories.includes(context.category))
    .map((activity) => evaluateActivity(world, context, activity));
}

export function applyActivity(
  world: WorldState,
  context: VenueActivityContext,
  activityId: string,
  options: ApplyActivityOptions = {}
): ActivityResult {
  const availability = getActivityAvailability(world, context).find((candidate) => candidate.activity.id === activityId);
  if (!availability) {
    return { ok: false, message: "No activity found here.", meterSummary: "", moneyDelta: 0 };
  }
  if (!availability.available) {
    return { ok: false, message: availability.reason ?? "Activity unavailable.", meterSummary: "", moneyDelta: 0 };
  }

  const player = world.players[world.localPlayerId];
  const activity = availability.activity;
  const cost = activity.cost ?? 0;
  const moneyDelta = scaleMoneyDeltaForPerformance(-cost, options.performanceScore);
  const meterDeltas = scaleMeterDeltasForPerformance(activity.meterDeltas, options.performanceScore);
  player.money += moneyDelta;
  adjustPlayerMeters(world, meterDeltas);
  advanceWorldMinutes(world, activity.timeCost);

  for (const itemId of activity.itemRewards ?? []) {
    addItem(player, itemId, 1);
  }

  const recordKey = activityRecordKey(context.venueId, activity.id);
  const existing = world.life.activityHistory[recordKey] ?? {
    count: 0,
    lastDay: world.clock.day,
    totalCount: 0,
    earnedMoney: 0
  };
  world.life.activityHistory[recordKey] = {
    count: existing.lastDay === world.clock.day ? existing.count + 1 : 1,
    lastDay: world.clock.day,
    totalCount: existing.totalCount + 1,
    earnedMoney: existing.earnedMoney + Math.max(0, moneyDelta)
  };

  return {
    ok: true,
    message: `${activity.label}: ${formatClockTime(world.clock.minuteOfDay)}. ${formatMoneyDelta(moneyDelta)}${meterSummary(meterDeltas)}${formatPerformanceSummary(options.performanceScore)}`,
    meterSummary: meterSummary(meterDeltas),
    moneyDelta
  };
}

export function activityRecordKey(venueId: string, activityId: string): string {
  return `${venueId}:${activityId}`;
}

function evaluateActivity(world: WorldState, context: VenueActivityContext, activity: Activity): ActivityAvailability {
  const player = world.players[world.localPlayerId];
  const cost = activity.cost ?? 0;
  if (cost > 0 && player.money < cost) {
    return { activity, available: false, reason: `Need Rp ${cost}.` };
  }
  if (activity.requires?.minEnergy && world.meters.energy < activity.requires.minEnergy) {
    return { activity, available: false, reason: `Need Energy ${activity.requires.minEnergy}.` };
  }
  if (activity.requires?.openHoursOnly && !isOpenAt(context.openHours, world.clock)) {
    return { activity, available: false, reason: "Venue is closed." };
  }
  if (!isActivityInTimeWindow(world.clock.minuteOfDay, activity.requires?.startsAt, activity.requires?.endsAt)) {
    return { activity, available: false, reason: "Wrong time of day." };
  }
  if (!activity.repeatable) {
    const existing = world.life.activityHistory[activityRecordKey(context.venueId, activity.id)];
    if (existing?.lastDay === world.clock.day && existing.count > 0) {
      return { activity, available: false, reason: "Already done today." };
    }
  }
  return { activity, available: true, reason: null };
}

function findCuratedVenue(curatedVenueId: string): CuratedVenue | undefined {
  return curatedVenues.find((venue) => venue.id === curatedVenueId);
}

function venueCategoryToCuratedCategory(category: string | undefined): CuratedCategory {
  if (category === "restaurant" || category === "cafe" || category === "bar" || category === "beach_club") return category;
  if (category === "grocery" || category === "shop") return category;
  if (category === "landmark") return "beach";
  if (category === "fitness") return "coworking";
  return "shop";
}

function isActivityInTimeWindow(minuteOfDay: number, startsAt?: number, endsAt?: number): boolean {
  if (startsAt == null || endsAt == null) {
    return true;
  }
  if (startsAt === endsAt) {
    return true;
  }
  if (endsAt > startsAt) {
    return minuteOfDay >= startsAt && minuteOfDay < endsAt;
  }
  return minuteOfDay >= startsAt || minuteOfDay < endsAt;
}

function openHoursFromTypicalHours(typicalHours: string | null | undefined): OpenHours | undefined {
  if (!typicalHours) {
    return undefined;
  }
  const match = typicalHours.match(/(\d{1,2}):?(\d{2})?[–-](\d{1,2}):?(\d{2})?/);
  if (!match) {
    return undefined;
  }
  const open = Number(match[1]);
  const close = Number(match[3]);
  if (!Number.isFinite(open) || !Number.isFinite(close)) {
    return undefined;
  }
  const hours = { open, close };
  return {
    mon: hours,
    tue: hours,
    wed: hours,
    thu: hours,
    fri: hours,
    sat: hours,
    sun: hours
  };
}

function meterSummary(deltas: Partial<Record<string, number>>): string {
  const parts = Object.entries(deltas).map(([meter, delta]) => `${meter} ${Number(delta) >= 0 ? "+" : ""}${delta}`);
  return parts.length ? ` | ${parts.join(", ")}` : "";
}

function formatMoneyDelta(delta: number): string {
  if (delta > 0) return `Rp +${delta}`;
  if (delta < 0) return `Rp ${delta}`;
  return "Rp 0";
}
