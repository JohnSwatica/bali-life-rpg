import {
  berawaAreas as rawBerawaAreas,
  berawaMapFeatures as rawBerawaMapFeatures,
  berawaRoads as rawBerawaRoads,
  curatedVenueNodes as rawCuratedVenueNodes,
  osmLayoutMetadata as rawOsmLayoutMetadata,
  venueMapNodes as rawVenueMapNodes,
  type CuratedVenueMapNode,
  type MapAreaDefinition,
  type MapFeatureDefinition,
  type RoadPathDefinition,
  type VenueMapNode
} from "./berawaLayout";
import { BASE_WORLD_HEIGHT, BASE_WORLD_WIDTH, WORLD_SCALE, scaleDistance, scalePoint } from "../systems/map/WorldScale";

export type {
  CuratedVenueMapNode,
  MapAreaDefinition,
  MapFeatureDefinition,
  RoadPathDefinition,
  VenueMapNode
} from "./berawaLayout";

export const osmLayoutMetadata = {
  ...rawOsmLayoutMetadata,
  presentationWorldScale: WORLD_SCALE,
  baseWorld: {
    w: BASE_WORLD_WIDTH,
    h: BASE_WORLD_HEIGHT
  },
  world: {
    w: scaleDistance(BASE_WORLD_WIDTH),
    h: scaleDistance(BASE_WORLD_HEIGHT)
  }
};

export const berawaRoads: RoadPathDefinition[] = rawBerawaRoads.map((road) => ({
  ...road,
  width: scaleDistance(road.width),
  points: road.points.map(scalePoint)
}));

export const berawaAreas: MapAreaDefinition[] = rawBerawaAreas.map((area) => ({
  ...scalePoint(area),
  radius: scaleDistance(area.radius)
}));

export const venueMapNodes: VenueMapNode[] = rawVenueMapNodes.map((node) => ({
  ...scalePoint(node),
  radius: scaleDistance(node.radius)
}));

export const curatedVenueNodes: CuratedVenueMapNode[] = rawCuratedVenueNodes.map((node) => ({
  ...scalePoint(node),
  radius: scaleDistance(node.radius)
}));

export const berawaMapFeatures: MapFeatureDefinition[] = rawBerawaMapFeatures.map((feature) => ({
  ...feature,
  points: feature.points.map(scalePoint)
}));
