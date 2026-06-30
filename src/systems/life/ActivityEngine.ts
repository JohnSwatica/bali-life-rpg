import { activityDefinitions, type Activity } from "../../data/activities";
import { curatedVenues, type CuratedCategory, type CuratedVenue } from "../../data/curatedVenues";
import { curatedVenueNodes } from "../../data/authoredStreetLayout";
import { playerHomeBase } from "../../data/homeBase";
import { getGameplayStationLoopForVenue, type GameplayStationId, type StationTimeOfDayModifier } from "../../data/stationLoops";
import { venueDefinitions } from "../../data/venues";
import { addItem } from "../Inventory";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import {
  formatPerformanceSummary,
  scaleMeterDeltasForPerformance,
  scaleMoneyDeltaForPerformance
} from "../minigames/ActivityMinigames";
import { advanceWorldMinutes, formatClockTime, isOpenAt } from "../time/DailyClock";
import type { Meter, OpenHours, WorldState } from "../../types";

export interface VenueActivityContext {
  venueId: string;
  curatedVenueId: string | null;
  name: string;
  category: CuratedCategory;
  stationId?: GameplayStationId;
  openHours: OpenHours | undefined;
  npcIds: string[];
}

export interface ActivityAvailability {
  activity: Activity;
  available: boolean;
  reason: string | null;
  timeModifier: StationTimeOfDayModifier | null;
}

export interface ActivityResult {
  ok: boolean;
  message: string;
  meterSummary: string;
  moneyDelta: number;
  morningPenaltySummary: string;
}

export interface ApplyActivityOptions {
  performanceScore?: number;
}

export function getVenueActivityContext(venueId: string): VenueActivityContext | null {
  if (venueId === playerHomeBase.id) {
    return {
      venueId: playerHomeBase.id,
      curatedVenueId: null,
      name: playerHomeBase.name,
      category: "shop",
      stationId: "home",
      openHours: undefined,
      npcIds: []
    };
  }
  const node = curatedVenueNodes.find((candidate) => candidate.venueId === venueId);
  const venue = venueDefinitions[venueId];
  const curated = findCuratedVenue(node?.curatedVenueId ?? venueId);
  const category = curated?.category ?? venueCategoryToCuratedCategory(venue?.venueCategory);
  const station = getGameplayStationLoopForVenue(venueId);
  if (!node && !venue && !curated) {
    return null;
  }
  return {
    venueId,
    curatedVenueId: curated?.id ?? node?.curatedVenueId ?? null,
    name: venue?.name ?? curated?.name ?? node?.name ?? venueId,
    category,
    stationId: station?.id,
    openHours: venue?.openHours ?? openHoursFromTypicalHours(curated?.typicalHours),
    npcIds: venue?.npcIds ?? []
  };
}

export function getActivityAvailability(world: WorldState, context: VenueActivityContext): ActivityAvailability[] {
  return activityDefinitions
    .filter((activity) => activityMatchesContext(activity, context))
    .sort((a, b) => activityContextPriority(b, context) - activityContextPriority(a, context))
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
    return { ok: false, message: "No activity found here.", meterSummary: "", moneyDelta: 0, morningPenaltySummary: "" };
  }
  if (!availability.available) {
    return { ok: false, message: availability.reason ?? "Activity unavailable.", meterSummary: "", moneyDelta: 0, morningPenaltySummary: "" };
  }

  const player = world.players[world.localPlayerId];
  const activity = availability.activity;
  const cost = activity.cost ?? 0;
  const moneyDelta = applyTimeModifierToMoney(scaleMoneyDeltaForPerformance(-cost, options.performanceScore), availability.timeModifier);
  const meterDeltas = applyTimeModifierToMeters(
    scaleMeterDeltasForPerformance(activity.meterDeltas, options.performanceScore),
    availability.timeModifier
  );
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

  const morningPenaltySummary = queueNextMorningPenalty(world, context, activity);

  return {
    ok: true,
    message: `${activity.label}: ${formatClockTime(world.clock.minuteOfDay)}. ${formatMoneyDelta(moneyDelta)}${meterSummary(meterDeltas)}${formatTimeModifierSummary(availability.timeModifier)}${morningPenaltySummary}${formatPerformanceSummary(options.performanceScore)}`,
    meterSummary: meterSummary(meterDeltas),
    moneyDelta,
    morningPenaltySummary
  };
}

export function activityRecordKey(venueId: string, activityId: string): string {
  return `${venueId}:${activityId}`;
}

function evaluateActivity(world: WorldState, context: VenueActivityContext, activity: Activity): ActivityAvailability {
  const player = world.players[world.localPlayerId];
  const cost = activity.cost ?? 0;
  if (cost > 0 && player.money < cost) {
    return { activity, available: false, reason: `Need Rp ${cost}.`, timeModifier: getActiveActivityTimeModifier(world, activity) };
  }
  if (activity.requires?.minEnergy && world.meters.energy < activity.requires.minEnergy) {
    return { activity, available: false, reason: `Need Energy ${activity.requires.minEnergy}.`, timeModifier: getActiveActivityTimeModifier(world, activity) };
  }
  if (activity.requires?.openHoursOnly && !isOpenAt(context.openHours, world.clock)) {
    return { activity, available: false, reason: "Venue is closed.", timeModifier: getActiveActivityTimeModifier(world, activity) };
  }
  if (!isActivityInTimeWindow(world.clock.minuteOfDay, activity.requires?.startsAt, activity.requires?.endsAt)) {
    return { activity, available: false, reason: "Wrong time of day.", timeModifier: getActiveActivityTimeModifier(world, activity) };
  }
  if (!activity.repeatable) {
    const existing = world.life.activityHistory[activityRecordKey(context.venueId, activity.id)];
    if (existing?.lastDay === world.clock.day && existing.count > 0) {
      return { activity, available: false, reason: "Already done today.", timeModifier: getActiveActivityTimeModifier(world, activity) };
    }
  }
  return { activity, available: true, reason: null, timeModifier: getActiveActivityTimeModifier(world, activity) };
}

export function applyPendingMorningPenalties(world: WorldState): string {
  const pending = world.life.pendingMorningPenalties;
  if (pending.length === 0) {
    return "";
  }
  const combined: Partial<Record<Meter, number>> = {};
  for (const penalty of pending) {
    for (const [meter, delta] of Object.entries(penalty.meterDeltas) as Array<[Meter, number]>) {
      combined[meter] = (combined[meter] ?? 0) + delta;
    }
  }
  adjustPlayerMeters(world, combined);
  world.life.pendingMorningPenalties = [];
  return ` Morning consequences applied: ${meterSummary(combined).replace(/^ \| /, "")}.`;
}

export function getActiveActivityTimeModifier(world: WorldState, activity: Activity): StationTimeOfDayModifier | null {
  const modifier = activity.timeOfDayModifier;
  if (!modifier) {
    return null;
  }
  return isActivityInTimeWindow(world.clock.minuteOfDay, modifier.startsAt, modifier.endsAt) ? modifier : null;
}

export function formatActivityPreview(activity: Activity, modifier: StationTimeOfDayModifier | null): string {
  const details = [
    activity.outcomePreview,
    activity.stationReward ? `Reward: ${activity.stationReward}` : "",
    activity.stationRisk ? `Risk: ${activity.stationRisk}` : "",
    modifier ? `Now: ${modifier.label}` : ""
  ].filter(Boolean);
  return details.join("\n");
}

function activityMatchesContext(activity: Activity, context: VenueActivityContext): boolean {
  if (activity.venueIds?.includes(context.venueId)) {
    return true;
  }
  if (context.curatedVenueId && activity.venueIds?.includes(context.curatedVenueId)) {
    return true;
  }
  if (context.stationId === "home") {
    return false;
  }
  return !activity.venueIds?.length && activity.categories.includes(context.category);
}

function activityContextPriority(activity: Activity, context: VenueActivityContext): number {
  if (activity.venueIds?.includes(context.venueId)) {
    return 3;
  }
  if (context.curatedVenueId && activity.venueIds?.includes(context.curatedVenueId)) {
    return 2;
  }
  return activity.stationId ? 1 : 0;
}

function queueNextMorningPenalty(world: WorldState, context: VenueActivityContext, activity: Activity): string {
  if (!activity.nextMorningDeltas) {
    return "";
  }
  const id = `${world.clock.day}:${context.venueId}:${activity.id}:${world.life.pendingMorningPenalties.length + 1}`;
  world.life.pendingMorningPenalties.push({
    id,
    activityId: activity.id,
    label: activity.label,
    createdDay: world.clock.day,
    meterDeltas: { ...activity.nextMorningDeltas },
    reason: activity.nextMorningReason ?? activity.label
  });
  return " | morning penalty queued";
}

function applyTimeModifierToMoney(delta: number, modifier: StationTimeOfDayModifier | null): number {
  if (!modifier?.moneyMultiplier || delta <= 0) {
    return delta;
  }
  return Math.round(delta * modifier.moneyMultiplier);
}

function applyTimeModifierToMeters(
  deltas: Partial<Record<Meter, number>>,
  modifier: StationTimeOfDayModifier | null
): Partial<Record<Meter, number>> {
  if (!modifier) {
    return { ...deltas };
  }
  const adjusted: Partial<Record<Meter, number>> = {};
  for (const [meter, delta] of Object.entries(deltas) as Array<[Meter, number]>) {
    adjusted[meter] = delta > 0 && modifier.meterMultiplier ? Math.round(delta * modifier.meterMultiplier) : delta;
  }
  for (const [meter, delta] of Object.entries(modifier.meterDeltas ?? {}) as Array<[Meter, number]>) {
    adjusted[meter] = (adjusted[meter] ?? 0) + delta;
  }
  return adjusted;
}

function formatTimeModifierSummary(modifier: StationTimeOfDayModifier | null): string {
  return modifier ? ` | ${modifier.label}` : "";
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
