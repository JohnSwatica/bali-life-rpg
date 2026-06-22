import { jlPantaiBerawaTemplate } from "./streetTemplates";
import type {
  CuratedVenueMapNode,
  MapAreaDefinition,
  MapFeatureDefinition,
  RoadPathDefinition,
  VenueMapNode
} from "./berawaLayout";
import { getStreetBuildingRects, getStreetMapFeatures, getStreetRoadPaths } from "../systems/map/StreetRenderer";
import { TILE_SIZE, tileToWorld } from "../systems/map/TileStreetScale";

export type {
  CuratedVenueMapNode,
  MapAreaDefinition,
  MapFeatureDefinition,
  RoadPathDefinition,
  VenueMapNode
} from "./berawaLayout";

export const activeStreetTemplate = jlPantaiBerawaTemplate;

export const osmLayoutMetadata = {
  generatedAt: "authored-tile-street",
  source: "Authored tile street; OSM/curated coordinates used only for venue sequencing",
  world: {
    w: 120 * TILE_SIZE,
    h: 85 * TILE_SIZE
  },
  tile: {
    size: TILE_SIZE,
    widthTiles: 120,
    heightTiles: 85
  },
  street: {
    id: activeStreetTemplate.id,
    name: activeStreetTemplate.name,
    axis: activeStreetTemplate.axis,
    roadWidthTiles: activeStreetTemplate.roadWidthTiles,
    sidewalkTiles: activeStreetTemplate.sidewalkTiles,
    slotDepthTiles: activeStreetTemplate.slotDepthTiles
  }
};

export const berawaRoads: RoadPathDefinition[] = getStreetRoadPaths(activeStreetTemplate);

export const berawaMapFeatures: MapFeatureDefinition[] = getStreetMapFeatures(activeStreetTemplate);

export const berawaAreas: MapAreaDefinition[] = [
  {
    id: "pantai_berawa",
    name: "Jl. Pantai Berawa",
    ...tileToWorld(60, 38),
    radius: 560
  },
  {
    id: "cafe_cluster",
    name: "Pantai Berawa Cafe Strip",
    ...tileToWorld(60, 28),
    radius: 440
  },
  {
    id: "berawa_beach",
    name: "Berawa Beach",
    ...tileToWorld(60, 74),
    radius: 360
  }
];

export const curatedVenueNodes: CuratedVenueMapNode[] = getStreetBuildingRects(activeStreetTemplate)
  .filter((rect) => rect.slot.venueId && rect.slot.curatedVenueId)
  .map((rect) => ({
    venueId: rect.slot.venueId!,
    curatedVenueId: rect.slot.curatedVenueId!,
    name: rect.slot.label ?? rect.slot.venueId!,
    category: rect.slot.category ?? "shop",
    isLandmark: rect.slot.isLandmark ?? false,
    questCritical: rect.slot.questCritical ?? false,
    coordinateSource:
      rect.slot.curatedVenueId === "canggu_station" ? "authored_side_street_stub" : "authored_tile_sequence",
    x: rect.centerX,
    y: rect.centerY,
    radius: Math.max(TILE_SIZE * 2.2, Math.max(rect.width, rect.height) * 0.72),
    areaId: rect.slot.venueId === "berawa_beach" ? "berawa_beach" : "pantai_berawa"
  }));

export const venueMapNodes: VenueMapNode[] = curatedVenueNodes.map((node) => ({
  venueId: node.venueId,
  x: node.x,
  y: node.y,
  radius: node.radius,
  areaId: node.areaId
}));
