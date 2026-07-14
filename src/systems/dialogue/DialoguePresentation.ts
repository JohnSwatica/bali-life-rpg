import type { WorldState } from "../../types";
import { getKadekPriorityAmbientLine } from "../story/Act1KadekPriority";
import { getMadeRoomOfferAmbientLine } from "../story/Act1MadeRoomOffer";

export type DialogueSurface = "panel" | "ambient";
export type DialogueSurfaceReason = "act0" | "quest" | "relationship" | "minor";

export interface NpcDialogueSurfaceInput {
  act0Critical?: boolean;
  questCritical?: boolean;
  relationshipBeat?: boolean;
}

export interface NpcDialogueSurfaceDecision {
  surface: DialogueSurface;
  reason: DialogueSurfaceReason;
}

export function getNpcDialogueSurface(input: NpcDialogueSurfaceInput): NpcDialogueSurfaceDecision {
  if (input.act0Critical) {
    return { surface: "panel", reason: "act0" };
  }
  if (input.questCritical) {
    return { surface: "panel", reason: "quest" };
  }
  if (input.relationshipBeat) {
    return { surface: "panel", reason: "relationship" };
  }
  return { surface: "ambient", reason: "minor" };
}

export function getAmbientNpcLine(world: WorldState, npcId: string, fallbackLine: string, routineLabel?: string): string {
  const player = world.players[world.localPlayerId];
  if (player.bikeStuck) {
    return "That scooter is asking for a mercy repair.";
  }
  if (player.hasBike && player.bikeCondition < 35) {
    return "Awas, jalan rusak. That bike is rattling hard.";
  }
  if (world.life.hustle.driverRating < 3.4 && (npcId === "ibu_sari" || npcId === "kadek")) {
    return "Slow down. Ratings recover when deliveries arrive clean.";
  }
  if (npcId === "kadek") {
    const priorityLine = getKadekPriorityAmbientLine(world);
    if (priorityLine) {
      return priorityLine;
    }
  }
  if (npcId === "made") {
    const roomLine = getMadeRoomOfferAmbientLine(world);
    if (roomLine) {
      return roomLine;
    }
  }
  if (npcId === "rio") {
    const rioMemory = world.relationships.find((memory) => memory.subjectType === "npc" && memory.subjectId === "rio");
    const raceMemory = [...(rioMemory?.memories ?? [])]
      .reverse()
      .find((memory) => memory.type === "lost_to_you_clean" || memory.type === "beat_you");
    const now = Math.floor((Math.max(1, world.clock.day) - 1) * 1440 + world.clock.minuteOfDay);
    if (raceMemory && now - raceMemory.at >= 1440) {
      return raceMemory.type === "lost_to_you_clean"
        ? "Enjoy the leaderboard bump. It will not hold itself."
        : "Rematch stays open. The NusaDrop board remembers everything.";
    }
  }
  if (routineLabel) {
    return appendRoutineContext(shortenAmbientLine(fallbackLine), routineLabel);
  }
  return shortenAmbientLine(fallbackLine);
}

function shortenAmbientLine(line: string): string {
  const compact = line.replace(/\s+/g, " ").trim();
  const firstSentence = compact.match(/^(?:\d+\.\d+|[^.!?])+[.!?]/)?.[0] ?? compact;
  if (firstSentence.length <= 92) {
    return firstSentence;
  }
  return `${firstSentence.slice(0, 89).trim()}...`;
}

function appendRoutineContext(line: string, routineLabel: string): string {
  const suffix = ` (${routineLabel})`;
  const base = line.replace(/[.!?]\s*$/, "");
  const maxLength = 112;
  if (`${base}${suffix}`.length <= maxLength) {
    return `${base}${suffix}`;
  }
  return `${base.slice(0, Math.max(12, maxLength - suffix.length - 3)).trim()}...${suffix}`;
}
