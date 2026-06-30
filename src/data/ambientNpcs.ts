import type { NpcIdleTag, NpcRoutineRoute, NpcRouteWaypoint } from "../types";
import { offsetVenuePoint } from "./layoutLookup";

export interface AmbientNpcDefinition {
  id: string;
  spriteKey: string;
  tint: number;
  idleTag: NpcIdleTag;
  route: NpcRoutineRoute;
  speedPxPerSecond?: number;
}

function ambientPoint(
  id: string,
  label: string,
  venueId: string,
  fallback: { x: number; y: number },
  dx: number,
  dy: number,
  pauseMs = 900
): NpcRouteWaypoint {
  return {
    id,
    label,
    venueId,
    ...offsetVenuePoint(venueId, fallback, dx, dy),
    pauseMs
  };
}

export const ambientNpcDefinitions: AmbientNpcDefinition[] = [
  {
    id: "ambient-coffee-walker",
    spriteKey: "npc-made",
    tint: 0x9fdbc7,
    idleTag: "generic_idle",
    speedPxPerSecond: 34,
    route: {
      id: "coffee-walker-loop",
      label: "walking the cafe lane",
      startMinute: 0,
      endMinute: 1440,
      waypoints: [
        ambientPoint("satu-satu-door", "Satu-Satu door", "satu_satu_coffee", { x: 1760, y: 380 }, -64, 62),
        ambientPoint("milk-madu-path", "Milk & Madu path", "milk_madu_berawa", { x: 1160, y: 640 }, 90, 82),
        ambientPoint("canggu-bench", "Canggu Station bench", "canggu_station", { x: 700, y: 770 }, 116, 92)
      ]
    }
  },
  {
    id: "ambient-beach-stroller",
    spriteKey: "npc-ari",
    tint: 0xf2c16d,
    idleTag: "generic_idle",
    speedPxPerSecond: 30,
    route: {
      id: "beach-stroller-loop",
      label: "strolling the beach edge",
      startMinute: 0,
      endMinute: 1440,
      waypoints: [
        ambientPoint("mowies-front", "Mowies front", "mowies_berawa", { x: 690, y: 1210 }, 12, 64, 1200),
        ambientPoint("sand-lookout", "sand lookout", "berawa_beach", { x: 500, y: 1320 }, -40, 78, 1400),
        ambientPoint("beach-return", "beach return", "berawa_beach", { x: 650, y: 1215 }, -92, 38, 1200)
      ]
    }
  },
  {
    id: "ambient-club-runner",
    spriteKey: "npc-kadek",
    tint: 0x79aee8,
    idleTag: "generic_idle",
    speedPxPerSecond: 44,
    route: {
      id: "club-runner-loop",
      label: "cutting past the club gate",
      startMinute: 0,
      endMinute: 1440,
      waypoints: [
        ambientPoint("club-gate", "club gate", "finns_recreation_club", { x: 1660, y: 360 }, -60, 18),
        ambientPoint("club-sidewalk", "club sidewalk", "finns_recreation_club", { x: 1660, y: 360 }, 92, 48),
        ambientPoint("coffee-corner", "coffee corner", "satu_satu_coffee", { x: 1780, y: 365 }, 94, 86)
      ]
    }
  },
  {
    id: "ambient-shop-browser",
    spriteKey: "npc-sari",
    tint: 0xe3a35e,
    idleTag: "generic_idle",
    speedPxPerSecond: 28,
    route: {
      id: "shop-browser-loop",
      label: "browsing the shopfronts",
      startMinute: 0,
      endMinute: 1440,
      waypoints: [
        ambientPoint("bungalow-display", "Bungalow display", "bungalow_living", { x: 1510, y: 815 }, 82, 78, 1800),
        ambientPoint("fabric-look", "fabric look", "bungalow_living", { x: 1510, y: 815 }, -48, 60, 1800),
        ambientPoint("market-crossing", "market crossing", "canggu_station", { x: 700, y: 770 }, 150, 112, 1000)
      ]
    }
  }
];
