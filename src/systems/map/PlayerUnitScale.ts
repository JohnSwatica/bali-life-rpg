import type { RoadPathDefinition } from "../../data/berawaLayout";
import { scaleDistance } from "./WorldScale";

export type RoadVisualClass = "main" | "secondary" | "lane";

export const PLAYER_UNIT = {
  width: scaleDistance(21),
  height: scaleDistance(27)
} as const;

export const POKEMON_SCALE = {
  roads: {
    main: 3.6,
    secondary: 2.2,
    lane: 1.6
  },
  buildings: {
    normal: { width: 4.2, height: 3.6 },
    wide: { width: 4.6, height: 3.8 },
    questCritical: { width: 5.0, height: 4.0 },
    landmark: { width: 8.8, height: 7.2 },
    beachLandmark: { width: 9.2, height: 5.8 },
    beachMarker: { width: 5.0, height: 3.8 }
  },
  layout: {
    roadsideGap: 0.65,
    maxRoadsideTangentSlide: 36.0,
    maxRoadSnapDistance: 5.5
  },
  camera: {
    desktopZoom: 1.86,
    mobileZoom: 1.52
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
