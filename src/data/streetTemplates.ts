import { curatedVenues, shouldRender, type CuratedVenue } from "./curatedVenues";
import { curatedVenueNodes, type CuratedVenueMapNode } from "./berawaLayout";
import { createStreetSlots, type StreetSlotSpec, type StreetTemplate } from "../systems/map/StreetTemplate";

const JL_PANTAI_BERAWA_BASE: Omit<StreetTemplate, "slots"> = {
  id: "jl_pantai_berawa",
  name: "Jl. Pantai Berawa",
  axis: "vertical",
  lengthTiles: 72,
  roadWidthTiles: 6,
  sidewalkTiles: 2,
  slotDepthTiles: 5,
  start: { tileX: 0, tileY: 5 },
  roadLeftTile: 57,
  beachTerminus: {
    startsAtTile: 73,
    sandTiles: 5,
    waterTiles: 7,
    dockTileX: 59
  }
};

const SLOT_TOP_TILE = 6;
const SLOT_ROW_STEP = 4;
const QUEST_CRITICAL_SIDE_STREET_STUB_IDS = new Set(["canggu_station"]);
const BEACH_TO_INLAND_REFERENCE = {
  beachCuratedId: "berawa_beach",
  inlandCuratedId: "secret_spot_canggu"
} as const;

export const jlPantaiBerawaTemplate: StreetTemplate = {
  ...JL_PANTAI_BERAWA_BASE,
  slots: createStreetSlots(JL_PANTAI_BERAWA_BASE, createPantaiBerawaSlotSpecs())
};

export const streetTemplates = [jlPantaiBerawaTemplate] as const;

export const deferredStreetVenueIds = curatedVenues
  .filter((venue) => shouldRender(venue) && !isPantaiBerawaVenue(venue) && !QUEST_CRITICAL_SIDE_STREET_STUB_IDS.has(venue.id))
  .map((venue) => venue.id);

function createPantaiBerawaSlotSpecs(): StreetSlotSpec[] {
  const ordered = getPantaiBerawaVenueOrder();
  const rowCount = Math.ceil(ordered.length / 2);

  const pantaiSpecs = ordered.map(({ venue, node }, index): StreetSlotSpec => {
    const size = slotSizeForVenue(venue);
    const row = rowCount - 1 - Math.floor(index / 2);
    return {
      side: index % 2 === 0 ? "left" : "right",
      order: row,
      tileY: SLOT_TOP_TILE + row * SLOT_ROW_STEP,
      widthTiles: size.widthTiles,
      depthTiles: size.depthTiles,
      venueId: node.venueId,
      curatedVenueId: venue.id,
      label: venue.name,
      category: venue.category,
      isLandmark: venue.isLandmark,
      questCritical: venue.questCritical
    };
  });

  const sideStreetStub = createCangguStationStubSpec();
  return sideStreetStub ? [...pantaiSpecs, sideStreetStub] : pantaiSpecs;
}

function getPantaiBerawaVenueOrder(): Array<{ venue: CuratedVenue; node: CuratedVenueMapNode }> {
  const nodesByCuratedId = new Map(curatedVenueNodes.map((node) => [node.curatedVenueId, node]));
  return curatedVenues
    .filter((venue) => shouldRender(venue) && isPantaiBerawaVenue(venue))
    .map((venue) => {
      const node = nodesByCuratedId.get(venue.id);
      if (!node) {
        return null;
      }
      return { venue, node, order: projectBeachToInland(node) };
    })
    .filter((entry): entry is { venue: CuratedVenue; node: CuratedVenueMapNode; order: number } => entry != null)
    .sort((a, b) => a.order - b.order)
    .map(({ venue, node }) => ({ venue, node }));
}

function isPantaiBerawaVenue(venue: CuratedVenue): boolean {
  return venue.street === "Jl. Pantai Berawa" || venue.id === "berawa_beach";
}

function projectBeachToInland(node: CuratedVenueMapNode): number {
  const nodesByCuratedId = new Map(curatedVenueNodes.map((candidate) => [candidate.curatedVenueId, candidate]));
  const beach = nodesByCuratedId.get(BEACH_TO_INLAND_REFERENCE.beachCuratedId);
  const inland = nodesByCuratedId.get(BEACH_TO_INLAND_REFERENCE.inlandCuratedId);
  if (!beach || !inland) {
    return -node.y;
  }
  const axisX = inland.x - beach.x;
  const axisY = inland.y - beach.y;
  const axisLengthSquared = axisX * axisX + axisY * axisY || 1;
  return ((node.x - beach.x) * axisX + (node.y - beach.y) * axisY) / axisLengthSquared;
}

function slotSizeForVenue(venue: CuratedVenue): { widthTiles: number; depthTiles: number } {
  if (venue.id === "berawa_beach") {
    return { widthTiles: 4, depthTiles: 5 };
  }
  if (venue.isLandmark) {
    return { widthTiles: 4, depthTiles: 7 };
  }
  if (venue.questCritical) {
    return { widthTiles: 4, depthTiles: 5 };
  }
  if (venue.category === "beach_club") {
    return { widthTiles: 4, depthTiles: 7 };
  }
  return { widthTiles: 3, depthTiles: 4 };
}

function createCangguStationStubSpec(): StreetSlotSpec | null {
  const venue = curatedVenues.find((candidate) => candidate.id === "canggu_station");
  const node = curatedVenueNodes.find((candidate) => candidate.curatedVenueId === "canggu_station");
  if (!venue || !node) {
    return null;
  }
  return {
    side: "right",
    order: -1,
    tileY: 1,
    widthTiles: 4,
    depthTiles: 5,
    venueId: node.venueId,
    curatedVenueId: venue.id,
    label: "Canggu Station",
    category: venue.category,
    isLandmark: venue.isLandmark,
    questCritical: true
  };
}
