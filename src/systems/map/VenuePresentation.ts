import type { CuratedVenueMapNode } from "../../data/berawaLayout";

export interface VenueFootprint {
  width: number;
  height: number;
}

export const PLAYER_PRESENTATION_FOOTPRINT: VenueFootprint = {
  width: 24,
  height: 30
};

export const BUILDING_SCALE_MULTIPLES = {
  normal: { width: 2.0, height: 1.5 },
  wide: { width: 2.3, height: 1.55 },
  questCritical: { width: 2.45, height: 1.65 },
  landmark: { width: 5.0, height: 3.0 },
  beachLandmark: { width: 4.6, height: 2.2 },
  beachMarker: { width: 2.4, height: 1.25 }
} as const;

export function getVenueFootprint(node: CuratedVenueMapNode): VenueFootprint {
  if (node.category === "beach") {
    return scaleFootprint(node.isLandmark ? BUILDING_SCALE_MULTIPLES.beachLandmark : BUILDING_SCALE_MULTIPLES.beachMarker);
  }

  if (node.isLandmark) {
    return scaleFootprint(BUILDING_SCALE_MULTIPLES.landmark);
  }

  if (node.questCritical) {
    return scaleFootprint(BUILDING_SCALE_MULTIPLES.questCritical);
  }

  if (node.category === "coworking" || node.category === "grocery" || node.category === "shop") {
    return scaleFootprint(BUILDING_SCALE_MULTIPLES.wide);
  }

  return scaleFootprint(BUILDING_SCALE_MULTIPLES.normal);
}

function scaleFootprint(multiple: { width: number; height: number }): VenueFootprint {
  return {
    width: Math.round(PLAYER_PRESENTATION_FOOTPRINT.width * multiple.width),
    height: Math.round(PLAYER_PRESENTATION_FOOTPRINT.height * multiple.height)
  };
}
