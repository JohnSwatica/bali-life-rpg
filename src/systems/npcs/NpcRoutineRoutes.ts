import type { NpcDefinition, NpcRoutineRoute, NpcRouteWaypoint } from "../../types";

export interface NpcRouteMotionState {
  routeId: string | null;
  waypointIndex: number;
  pauseMsRemaining: number;
}

export interface NpcRouteMotionInput extends NpcRouteMotionState {
  x: number;
  y: number;
}

export interface NpcRouteMotionResult extends NpcRouteMotionState {
  x: number;
  y: number;
  moving: boolean;
  facingDx: number;
  facingDy: number;
  target: NpcRouteWaypoint;
}

const DEFAULT_WAYPOINT_PAUSE_MS = 1200;
const DEFAULT_ARRIVAL_RADIUS = 3;

export function getActiveNpcRoute(npc: NpcDefinition, minuteOfDay: number): NpcRoutineRoute {
  const route =
    npc.routineRoutes?.find((candidate) => isMinuteInRange(minuteOfDay, candidate.startMinute, candidate.endMinute)) ??
    npc.routineRoutes?.[0];
  if (route) {
    return route;
  }

  const stop = npc.routine.find((candidate) => isMinuteInRange(minuteOfDay, candidate.startMinute, candidate.endMinute)) ?? npc.routine[0];
  return {
    id: stop.id,
    label: stop.label,
    startMinute: stop.startMinute,
    endMinute: stop.endMinute,
    waypoints: [
      {
        id: stop.id,
        label: stop.label,
        x: stop.x,
        y: stop.y
      }
    ]
  };
}

export function getNpcRouteActivityLabel(npc: NpcDefinition, routeId: string): string | undefined {
  return npc.routineRoutes?.find((route) => route.id === routeId)?.label ?? npc.routine.find((stop) => stop.id === routeId)?.label;
}

export function advanceNpcRouteMotion(
  route: NpcRoutineRoute,
  motion: NpcRouteMotionInput,
  deltaMs: number,
  speedPxPerSecond: number,
  arrivalRadius = DEFAULT_ARRIVAL_RADIUS
): NpcRouteMotionResult {
  const waypoints = route.waypoints.length > 0 ? route.waypoints : [{ id: route.id, label: route.label, x: motion.x, y: motion.y }];
  const routeChanged = motion.routeId !== route.id;
  const waypointIndex = routeChanged ? 0 : clampIndex(motion.waypointIndex, waypoints.length);
  const pauseMsRemaining = routeChanged ? 0 : Math.max(0, motion.pauseMsRemaining);
  const target = waypoints[waypointIndex];

  if (pauseMsRemaining > 0) {
    return {
      routeId: route.id,
      waypointIndex,
      pauseMsRemaining: Math.max(0, pauseMsRemaining - deltaMs),
      x: motion.x,
      y: motion.y,
      moving: false,
      facingDx: 0,
      facingDy: 0,
      target
    };
  }

  const dx = target.x - motion.x;
  const dy = target.y - motion.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= arrivalRadius) {
    return {
      routeId: route.id,
      waypointIndex: (waypointIndex + 1) % waypoints.length,
      pauseMsRemaining: target.pauseMs ?? DEFAULT_WAYPOINT_PAUSE_MS,
      x: target.x,
      y: target.y,
      moving: false,
      facingDx: 0,
      facingDy: 0,
      target
    };
  }

  const step = Math.min(distance, (speedPxPerSecond * deltaMs) / 1000);
  const ux = dx / distance;
  const uy = dy / distance;
  return {
    routeId: route.id,
    waypointIndex,
    pauseMsRemaining: 0,
    x: motion.x + ux * step,
    y: motion.y + uy * step,
    moving: true,
    facingDx: dx,
    facingDy: dy,
    target
  };
}

function isMinuteInRange(minute: number, startMinute: number, endMinute: number): boolean {
  if (startMinute === endMinute) {
    return true;
  }
  if (endMinute > startMinute) {
    return minute >= startMinute && minute < endMinute;
  }
  return minute >= startMinute || minute < endMinute;
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(length - 1, Math.floor(index)));
}
