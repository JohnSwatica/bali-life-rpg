import type { RoadPathDefinition } from "../../data/berawaLayout";
import { scaleDistance } from "./WorldScale";

export type RoadVisualClass = "main" | "secondary" | "lane";

export const PLAYER_UNIT = {
  width: scaleDistance(24),
  height: scaleDistance(30)
} as const;

export const POKEMON_SCALE = {
  roads: {
    main: 3.0,
    secondary: 1.8,
    lane: 1.35
  },
  buildings: {
    normal: { width: 3.0, height: 2.4 },
    wide: { width: 3.4, height: 2.6 },
    questCritical: { width: 3.8, height: 2.8 },
    landmark: { width: 6.0, height: 4.2 },
    beachLandmark: { width: 6.2, height: 3.4 },
    beachMarker: { width: 4.0, height: 2.3 }
  },
  layout: {
    roadsideGap: 0.4,
    maxRoadsideTangentSlide: 20.0,
    maxRoadSnapDistance: 5.5
  },
  camera: {
    desktopZoom: 1.62,
    mobileZoom: 1.42
  }
} as const;

export function playerUnits(value: number, axis: "x" | "y" = "y"): number {
  return Math.round(value * (axis === "x" ? PLAYER_UNIT.width : PLAYER_UNIT.height));
}

export function getRoadVisualClass(road: Pick<RoadPathDefinition, "importance">): RoadVisualClass {
  if (road.importance === "primary") {
    return "main";
  }
  if (road.importance === "secondary") {
    return "secondary";
  }
  return "lane";
}

export function roadWidthForClass(visualClass: RoadVisualClass): number {
  return playerUnits(POKEMON_SCALE.roads[visualClass]);
}

export function roadWidthForImportance(importance: RoadPathDefinition["importance"]): number {
  return roadWidthForClass(getRoadVisualClass({ importance }));
}
