import type { RoadPathDefinition } from "../../data/berawaLayout";
import { type RoadVisualClass, getRoadVisualClass, roadWidthForClass } from "./PlayerUnitScale";
import { scaleDistance } from "./WorldScale";

const MAIN_ROAD_NAMES = [
  "jalan pantai berawa",
  "jalan nelayan",
  "jalan tegal sari",
  "jalan raya semat",
  "jalan semat",
  "jalan subak sari",
  "jalan subak sari ii",
  "jalan pura kayu putih",
  "jalan segara perancak",
  "canggu shortcut"
];

const MICRO_ROAD_NAMES = new Set(["service", "footway", "path", "steps", "track"]);
const GENERIC_LANE_NAMES = new Set(["residential", "living street"]);

export interface PresentedRoad {
  road: RoadPathDefinition;
  visualClass: RoadVisualClass;
  width: number;
  length: number;
}

export function getPresentedRoads(roads: RoadPathDefinition[]): PresentedRoad[] {
  return roads
    .map((road) => ({ road, visualClass: classifyRoad(road), length: roadLength(road) }))
    .filter((road) => shouldRenderRoad(road.road, road.visualClass, road.length))
    .map((road) => ({ ...road, width: roadWidthForClass(road.visualClass) }));
}

export function getVenueSnapRoads(roads: RoadPathDefinition[]): RoadPathDefinition[] {
  const snapRoads = roads.filter((road) => road.importance !== "lane");
  return snapRoads.length > 0 ? snapRoads : roads;
}

export function classifyRoad(road: RoadPathDefinition): RoadVisualClass {
  const normalizedName = normalizeRoadName(road.name);
  if (road.importance === "primary" || MAIN_ROAD_NAMES.some((name) => normalizedName.includes(name))) {
    return "main";
  }
  if (road.importance === "lane" || normalizedName.startsWith("gang ") || GENERIC_LANE_NAMES.has(normalizedName)) {
    return "lane";
  }
  if (road.importance === "secondary" && !isMicroRoadName(normalizedName)) {
    return "secondary";
  }
  return getRoadVisualClass(road);
}

export function roadLength(road: Pick<RoadPathDefinition, "points">): number {
  let length = 0;
  for (let index = 1; index < road.points.length; index += 1) {
    const start = road.points[index - 1];
    const end = road.points[index];
    length += Math.hypot(end.x - start.x, end.y - start.y);
  }
  return length;
}

function shouldRenderRoad(road: RoadPathDefinition, visualClass: RoadVisualClass, length: number): boolean {
  const normalizedName = normalizeRoadName(road.name);
  if (visualClass === "main") {
    return length >= scaleDistance(14);
  }
  if (isMicroRoadName(normalizedName)) {
    return false;
  }
  if (normalizedName.startsWith("gang ")) {
    return length >= scaleDistance(135);
  }
  if (GENERIC_LANE_NAMES.has(normalizedName)) {
    return length >= scaleDistance(115);
  }
  return length >= scaleDistance(visualClass === "secondary" ? 62 : 105);
}

function isMicroRoadName(normalizedName: string): boolean {
  return MICRO_ROAD_NAMES.has(normalizedName);
}

function normalizeRoadName(name: string): string {
  return name.trim().toLowerCase();
}
