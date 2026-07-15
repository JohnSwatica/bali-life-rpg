import { KITCHEN_CIRCLE_CREW_ID } from "../../data/crews";
import type { GameEvent, Meter, WarungServeContext, WorldState } from "../../types";
import { completeCrewSession, getCrewState, hasCompletedCrewSessionOccurrence } from "../crews/CrewSystem";
import { applyEventParticipation, type EventParticipationResult } from "../events/EventParticipation";
import { IntentDispatcher, type IntentResult } from "../intents/IntentDispatcher";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { bumpRelationshipAffinity } from "../relationships/RelationshipMemory";
import { advanceWorldMinutes } from "../time/DailyClock";
import {
  completeKitchenBusyNightServe,
  getKitchenBusyNightWeekStart,
  hasSeenKitchenCircleSqueeze,
  isKitchenBusyNightServeAvailable,
  isKitchenCircleSessionEvent
} from "./Act2KitchenCircle";

export const WARUNG_SERVE_ACTIVITY_ID = "warung_lunch_rush";
export const WARUNG_SERVE_LABEL = "Ibu's dinner rush · SERVE";
export const WARUNG_SERVE_DURATION_MIN = 25;
export const WARUNG_SERVE_TIP_MIN = 12;
export const WARUNG_SERVE_TIP_MAX = 28;
export const WARUNG_SERVE_AFFINITY_MIN = 1;
export const WARUNG_SERVE_AFFINITY_MAX = 3;
export const WARUNG_SERVE_STRONG_THRESHOLD = 0.72;
export const WARUNG_SERVE_POST_SQUEEZE_COPY = "Every plate we serve ourselves is a plate the app doesn't tax.";

const BUSY_NIGHT_METER_DELTAS: Partial<Record<Meter, number>> = {
  energy: -5,
  wellbeing: 2,
  social: 6
};

const STRONG_ROUND_LINES = [
  'Mira catches the last plate. “That table stopped watching the clock. Good sign.”',
  'Wayan clears the counter with one sweep. “You found the room before it found you.”',
  'Kadek stacks two bowls. “Annoyingly competent. I was ready with a much better joke.”'
] as const;

export interface WarungServeResidue {
  performanceScore: number;
  tip: number;
  affinityBump: number;
  feedback: string;
  extraCrewLine?: string;
}

export interface KitchenSessionServeResolution {
  ok: boolean;
  message: string;
  residue?: WarungServeResidue;
  participation?: EventParticipationResult;
  intent?: IntentResult;
  attendance?: ReturnType<typeof completeCrewSession>;
}

export interface BusyNightServeResolution {
  ok: boolean;
  message: string;
  residue?: WarungServeResidue;
}

export function getWarungServeStakesCopy(world: WorldState): string {
  return hasSeenKitchenCircleSqueeze(world)
    ? `Ibu: “${WARUNG_SERVE_POST_SQUEEZE_COPY}”`
    : "Ibu: “People first. Plates moving.”";
}

export function getWarungServeTotalPlays(world: WorldState): number {
  return world.life.activityHistory[activityHistoryKey()]?.totalCount ?? 0;
}

export function resolveKitchenSessionWarungServe(
  world: WorldState,
  event: GameEvent,
  occurrenceDay: number,
  performanceScore: number,
  startedAt: number
): KitchenSessionServeResolution {
  if (!isKitchenCircleSessionEvent(event)) return { ok: false, message: "That event is not a Kitchen Circle SERVE session." };
  const crew = getCrewState(world, KITCHEN_CIRCLE_CREW_ID);
  if (!crew.member) return { ok: false, message: "Join the Kitchen Circle before serving its dinner rush." };
  if (hasCompletedCrewSessionOccurrence(world, event, occurrenceDay)) {
    return { ok: false, message: "This Kitchen Circle session already counted." };
  }

  const participation = applyEventParticipation(world, event, startedAt);
  if (!participation.ok) return { ok: false, message: participation.message, participation };
  const intent = new IntentDispatcher().dispatch({ kind: "AttendEvent", eventId: event.id }, world, participation.completedAt);
  const attendance = completeCrewSession(world, event, occurrenceDay, participation.completedAt);
  if (!attendance.ok) return { ok: false, message: attendance.message, participation, intent, attendance };

  const residue = applyWarungServeResidue(world, performanceScore, participation.completedAt, crew.attendanceCount);
  recordWarungServePlay(world, occurrenceDay, residue.tip);
  return {
    ok: true,
    message: `${participation.message} ${attendance.message} ${residue.feedback}${residue.extraCrewLine ? ` ${residue.extraCrewLine}` : ""}`,
    residue,
    participation,
    intent,
    attendance
  };
}

export function resolveBusyNightWarungServe(
  world: WorldState,
  context: Extract<WarungServeContext, { kind: "busy_night" }>,
  performanceScore: number,
  startedAt: number
): BusyNightServeResolution {
  const weekStartDay = getKitchenBusyNightWeekStart(context.weekStartDay);
  if (!isKitchenBusyNightServeAvailable(world, weekStartDay)) {
    return { ok: false, message: "Ibu's busy-night SERVE window is not open." };
  }
  const startDay = world.clock.day;
  adjustPlayerMeters(world, BUSY_NIGHT_METER_DELTAS);
  advanceWorldMinutes(world, WARUNG_SERVE_DURATION_MIN);
  const residue = applyWarungServeResidue(world, performanceScore, startedAt + WARUNG_SERVE_DURATION_MIN);
  completeKitchenBusyNightServe(world, weekStartDay);
  recordWarungServePlay(world, startDay, residue.tip);
  return {
    ok: true,
    message: `Busy-night SERVE complete. ${residue.feedback}`,
    residue
  };
}

/** Lets an already-active pre-W2-06 v11 lunch-rush save finish without restoring its retired launch surface. */
export function resolveLegacyWarungRush(world: WorldState, performanceScore: number, startedAt: number): BusyNightServeResolution {
  const startDay = world.clock.day;
  adjustPlayerMeters(world, BUSY_NIGHT_METER_DELTAS);
  advanceWorldMinutes(world, WARUNG_SERVE_DURATION_MIN);
  const residue = applyWarungServeResidue(world, performanceScore, startedAt + WARUNG_SERVE_DURATION_MIN);
  recordWarungServePlay(world, startDay, residue.tip);
  return { ok: true, message: `Saved rush complete. ${residue.feedback}`, residue };
}

function applyWarungServeResidue(
  world: WorldState,
  performanceScore: number,
  at: number,
  strongLineIndex?: number
): WarungServeResidue {
  const score = clamp01(performanceScore);
  const tip = Math.round(WARUNG_SERVE_TIP_MIN + (WARUNG_SERVE_TIP_MAX - WARUNG_SERVE_TIP_MIN) * score);
  const affinityBump = score >= WARUNG_SERVE_STRONG_THRESHOLD ? 3 : score >= 0.5 ? 2 : 1;
  world.players[world.localPlayerId].money += tip;
  bumpRelationshipAffinity(world, "npc", "ibu_sari", affinityBump, `${WARUNG_SERVE_LABEL}: ${Math.round(score * 100)}%`, at);
  const feedback = score >= WARUNG_SERVE_STRONG_THRESHOLD
    ? `Ibu nods once: the room kept moving. Tip Rp ${tip}; Ibu affinity +${affinityBump}.`
    : score >= 0.5
      ? `Ibu slides the last bowl into place. “Better. Keep your eyes ahead of your hands.” Tip Rp ${tip}; Ibu affinity +${affinityBump}.`
      : `Ibu taps the slow table. “They came hungry, not retired.” She is teasing, not docking you. Tip Rp ${tip}; Ibu affinity +${affinityBump}.`;
  return {
    performanceScore: score,
    tip,
    affinityBump,
    feedback,
    extraCrewLine: score >= WARUNG_SERVE_STRONG_THRESHOLD && strongLineIndex != null
      ? STRONG_ROUND_LINES[strongLineIndex % STRONG_ROUND_LINES.length]
      : undefined
  };
}

function recordWarungServePlay(world: WorldState, day: number, earnedMoney: number): void {
  const key = activityHistoryKey();
  const existing = world.life.activityHistory[key] ?? { count: 0, lastDay: day, totalCount: 0, earnedMoney: 0 };
  world.life.activityHistory[key] = {
    count: existing.lastDay === day ? existing.count + 1 : 1,
    lastDay: day,
    totalCount: existing.totalCount + 1,
    earnedMoney: existing.earnedMoney + earnedMoney
  };
}

function activityHistoryKey(): string {
  return `canggu_station:${WARUNG_SERVE_ACTIVITY_ID}`;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
