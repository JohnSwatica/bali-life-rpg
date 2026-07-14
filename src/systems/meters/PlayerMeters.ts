import type { PlayerEntityState, PlayerMeters, WorldState } from "../../types";
import { isFocusBufferActive } from "./FocusBuffer";

export const DEFAULT_PLAYER_METERS: PlayerMeters = {
  energy: 78,
  wellbeing: 66,
  focus: 42,
  social: 36
};

type RawMeterInput = Partial<PlayerMeters> | undefined;
type RawLegacyPlayerInput = Partial<Pick<PlayerEntityState, "focus" | "socialEnergy">> | undefined;

export function createDefaultPlayerMeters(): PlayerMeters {
  return { ...DEFAULT_PLAYER_METERS };
}

export function clampMeter(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function migratePlayerMeters(rawMeters: unknown, legacyPlayer?: RawLegacyPlayerInput): PlayerMeters {
  const meters = isMeterInput(rawMeters) ? rawMeters : undefined;
  return {
    energy: readMeter(meters?.energy, DEFAULT_PLAYER_METERS.energy),
    wellbeing: readMeter(meters?.wellbeing, DEFAULT_PLAYER_METERS.wellbeing),
    focus: readMeter(meters?.focus, legacyPlayer?.focus ?? DEFAULT_PLAYER_METERS.focus),
    social: readMeter(meters?.social, legacyPlayer?.socialEnergy ?? DEFAULT_PLAYER_METERS.social)
  };
}

export function adjustPlayerMeters(world: WorldState, deltas: Partial<Record<keyof PlayerMeters, number>>): PlayerMeters {
  const focusDelta = deltas.focus ?? 0;
  world.meters = {
    energy: clampMeter(world.meters.energy + (deltas.energy ?? 0)),
    wellbeing: clampMeter(world.meters.wellbeing + (deltas.wellbeing ?? 0)),
    focus: clampMeter(world.meters.focus + (focusDelta < 0 && isFocusBufferActive(world) ? 0 : focusDelta)),
    social: clampMeter(world.meters.social + (deltas.social ?? 0))
  };
  syncLegacyPlayerMeterMirrors(world);
  return world.meters;
}

export function setPlayerMeters(world: WorldState, next: Partial<PlayerMeters>): PlayerMeters {
  world.meters = {
    energy: readMeter(next.energy, world.meters.energy),
    wellbeing: readMeter(next.wellbeing, world.meters.wellbeing),
    focus: readMeter(next.focus, world.meters.focus),
    social: readMeter(next.social, world.meters.social)
  };
  syncLegacyPlayerMeterMirrors(world);
  return world.meters;
}

export function syncLegacyPlayerMeterMirrors(world: WorldState): void {
  const player = world.players[world.localPlayerId];
  if (!player) {
    return;
  }
  player.focus = world.meters.focus;
  player.socialEnergy = world.meters.social;
}

function readMeter(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? clampMeter(value) : clampMeter(fallback);
}

function isMeterInput(value: unknown): value is RawMeterInput {
  return typeof value === "object" && value !== null;
}
