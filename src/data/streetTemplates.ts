import { curatedVenues, shouldRender, type CuratedVenue } from "./curatedVenues";
import { curatedVenueNodes, type CuratedVenueMapNode } from "./berawaLayout";
import { createStreetSlots, type StreetSlotSpec, type StreetTemplate } from "../systems/map/StreetTemplate";

type AuthoredVenueSide = "left" | "right";
type BranchDirection = "west" | "east";

interface PantaiBerawaOrderEntry {
  orderLabel: string;
  curatedVenueId: string;
  side: AuthoredVenueSide;
  geminiSide: AuthoredVenueSide;
}

export interface PantaiBerawaCrossStreet {
  streetName: string;
  branchDirection: BranchDirection;
  approximateMainOrder: number;
  curatedVenueIds: string[];
  note: string;
}

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
const QUEST_CRITICAL_SIDE_STREET_STUB_IDS = new Set(["baked_berawa", "canggu_station"]);
const BEACH_ANCHOR_STUB_IDS = new Set(["berawa_beach"]);

export const pantaiBerawaWalkingOrder: PantaiBerawaOrderEntry[] = [
  { orderLabel: "1A", curatedVenueId: "finns_beach_club", side: "left", geminiSide: "left" },
  { orderLabel: "1B", curatedVenueId: "atlas_beach_fest", side: "right", geminiSide: "right" },
  { orderLabel: "2", curatedVenueId: "trattoria_canggu", side: "left", geminiSide: "left" },
  { orderLabel: "3", curatedVenueId: "lusa_by_suka", side: "right", geminiSide: "left" },
  { orderLabel: "4", curatedVenueId: "one_eyed_jack", side: "left", geminiSide: "left" },
  { orderLabel: "5", curatedVenueId: "two_trees_eatery", side: "right", geminiSide: "left" },
  { orderLabel: "6", curatedVenueId: "ruko_cafe", side: "left", geminiSide: "left" },
  { orderLabel: "7", curatedVenueId: "matcha_cafe_bali", side: "right", geminiSide: "left" },
  { orderLabel: "8", curatedVenueId: "synkonah", side: "left", geminiSide: "left" },
  { orderLabel: "9", curatedVenueId: "golden_monkey_chinese_restaurant", side: "right", geminiSide: "left" },
  { orderLabel: "10", curatedVenueId: "wild_habit_pizza", side: "left", geminiSide: "left" },
  { orderLabel: "11", curatedVenueId: "losteria_funiculi_funicula_canggu", side: "right", geminiSide: "left" },
  { orderLabel: "12", curatedVenueId: "tygr_sushi_berawa", side: "left", geminiSide: "left" },
  { orderLabel: "13", curatedVenueId: "nude", side: "right", geminiSide: "left" },
  { orderLabel: "14", curatedVenueId: "monsieur_spoon_berawa", side: "left", geminiSide: "left" },
  { orderLabel: "15", curatedVenueId: "bottega_italiana_berawa", side: "right", geminiSide: "left" },
  { orderLabel: "16", curatedVenueId: "macan_cafe", side: "left", geminiSide: "left" },
  { orderLabel: "17", curatedVenueId: "sari_kitchen_and_community", side: "right", geminiSide: "left" },
  { orderLabel: "18", curatedVenueId: "secret_spot_canggu", side: "left", geminiSide: "left" },
  { orderLabel: "19", curatedVenueId: "milu_by_nook", side: "right", geminiSide: "left" },
  { orderLabel: "20", curatedVenueId: "cinta_cafe", side: "left", geminiSide: "right" },
  { orderLabel: "21", curatedVenueId: "milk_and_madu_berawa", side: "right", geminiSide: "right" },
  { orderLabel: "22", curatedVenueId: "behind_the_green_door", side: "left", geminiSide: "right" },
  { orderLabel: "23", curatedVenueId: "frestive_berawa", side: "right", geminiSide: "right" },
  { orderLabel: "24", curatedVenueId: "bakersfield_berawa", side: "left", geminiSide: "left" },
  { orderLabel: "25", curatedVenueId: "finns_recreation_club", side: "right", geminiSide: "right" },
  { orderLabel: "26", curatedVenueId: "bali_family_rental_scooter", side: "left", geminiSide: "right" },
  { orderLabel: "27", curatedVenueId: "satu_satu_coffee_company", side: "right", geminiSide: "right" },
  { orderLabel: "28", curatedVenueId: "bungalow_living_bali", side: "left", geminiSide: "right" }
];

export const pantaiBerawaCrossStreets: PantaiBerawaCrossStreet[] = [
  {
    streetName: "Jl. Subak Sari",
    branchDirection: "west",
    approximateMainOrder: 2,
    curatedVenueIds: ["braud_cafe"],
    note: "Near the beach end; future west branch template."
  },
  {
    streetName: "Jl. Pemelisan Agung",
    branchDirection: "west",
    approximateMainOrder: 3,
    curatedVenueIds: ["manggis_in_canggu"],
    note: "Near the beach end; future west branch template."
  },
  {
    streetName: "Jl. Taman Tamora",
    branchDirection: "west",
    approximateMainOrder: 9,
    curatedVenueIds: ["the_shady_pig"],
    note: "Mid-strip Tamora branch; not placed on the main strip."
  },
  {
    streetName: "Jl. Subak Canggu",
    branchDirection: "west",
    approximateMainOrder: 12,
    curatedVenueIds: ["tropical_nomad_coworking_space"],
    note: "Mid-strip coworking branch; not placed on the main strip."
  },
  {
    streetName: "Jl. Tegal Sari",
    branchDirection: "east",
    approximateMainOrder: 23,
    curatedVenueIds: ["ulekan"],
    note: "Upper-mid east branch; future Tegal Sari template."
  },
  {
    streetName: "Jl. Raya Semat",
    branchDirection: "east",
    approximateMainOrder: 25,
    curatedVenueIds: [
      "hungry_bird_coffee_roaster",
      "popular_deli_berawa",
      "outpost_canggu_coworking",
      "baked_berawa",
      "canggu_station"
    ],
    note: "North junction branch. BAKED and Canggu Station remain reachable as quest-critical stubs."
  }
];

export const pantaiBerawaAuthoredOrderFlaggedConflicts = [
  {
    curatedVenueId: "bakersfield_berawa",
    localStreet: "Jl. Raya Semat",
    authoredPlacement: "Main Jl. Pantai Berawa strip order #24 from Gemini"
  },
  {
    curatedVenueId: "baked_berawa",
    localStreet: "Jl. Pantai Berawa",
    authoredPlacement: "Jl. Raya Semat side-street stub from Gemini"
  },
  {
    curatedVenueId: "da_romeo_restaurant",
    localStreet: "Jl. Pantai Berawa",
    authoredPlacement: "Not present in Gemini walking order; deferred for manual placement"
  }
];

const MAIN_STRIP_CURATED_IDS = new Set(pantaiBerawaWalkingOrder.map((entry) => entry.curatedVenueId));
const CROSS_STREET_CURATED_IDS = new Set(pantaiBerawaCrossStreets.flatMap((entry) => entry.curatedVenueIds));

export const jlPantaiBerawaTemplate: StreetTemplate = {
  ...JL_PANTAI_BERAWA_BASE,
  slots: createStreetSlots(JL_PANTAI_BERAWA_BASE, createPantaiBerawaSlotSpecs())
};

export const streetTemplates = [jlPantaiBerawaTemplate] as const;

export const deferredStreetVenueIds = curatedVenues
  .filter(
    (venue) =>
      shouldRender(venue) &&
      !MAIN_STRIP_CURATED_IDS.has(venue.id) &&
      !QUEST_CRITICAL_SIDE_STREET_STUB_IDS.has(venue.id) &&
      !BEACH_ANCHOR_STUB_IDS.has(venue.id)
  )
  .map((venue) => venue.id);

export const sideStreetVenueIds = curatedVenues
  .filter((venue) => shouldRender(venue) && CROSS_STREET_CURATED_IDS.has(venue.id) && !QUEST_CRITICAL_SIDE_STREET_STUB_IDS.has(venue.id))
  .map((venue) => venue.id);

function createPantaiBerawaSlotSpecs(): StreetSlotSpec[] {
  const ordered = getPantaiBerawaVenueOrder();
  const rowCount = Math.ceil(ordered.length / 2);

  const pantaiSpecs = ordered.map(({ entry, venue, node }, index): StreetSlotSpec => {
    const size = slotSizeForVenue(venue);
    const row = rowCount - 1 - Math.floor(index / 2);
    return {
      side: entry.side,
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

  return [...pantaiSpecs, ...createQuestCriticalCrossStreetStubSpecs(), ...createBeachAnchorStubSpecs()];
}

function getPantaiBerawaVenueOrder(): Array<{ entry: PantaiBerawaOrderEntry; venue: CuratedVenue; node: CuratedVenueMapNode }> {
  const nodesByCuratedId = new Map(curatedVenueNodes.map((node) => [node.curatedVenueId, node]));
  const venuesById = new Map(curatedVenues.map((venue) => [venue.id, venue]));
  return pantaiBerawaWalkingOrder.map((entry) => {
    const venue = venuesById.get(entry.curatedVenueId);
    const node = nodesByCuratedId.get(entry.curatedVenueId);
    if (!venue || !node) {
      throw new Error(`Missing authored Pantai Berawa venue data for ${entry.curatedVenueId}`);
    }
    return { entry, venue, node };
  });
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

function createQuestCriticalCrossStreetStubSpecs(): StreetSlotSpec[] {
  const venuesById = new Map(curatedVenues.map((venue) => [venue.id, venue]));
  const nodesByCuratedId = new Map(curatedVenueNodes.map((node) => [node.curatedVenueId, node]));
  return [
    { curatedVenueId: "baked_berawa", side: "left" as const, label: "BAKED. Berawa" },
    { curatedVenueId: "canggu_station", side: "right" as const, label: "Canggu Station" }
  ].flatMap((stub): StreetSlotSpec[] => {
    const venue = venuesById.get(stub.curatedVenueId);
    const node = nodesByCuratedId.get(stub.curatedVenueId);
    if (!venue || !node) {
      return [];
    }
    return [
      {
        side: stub.side,
        order: -1,
        tileY: 1,
        widthTiles: 4,
        depthTiles: 5,
        venueId: node.venueId,
        curatedVenueId: venue.id,
        label: stub.label,
        category: venue.category,
        isLandmark: venue.isLandmark,
        questCritical: true
      }
    ];
  });
}

function createBeachAnchorStubSpecs(): StreetSlotSpec[] {
  const venue = curatedVenues.find((candidate) => candidate.id === "berawa_beach");
  const node = curatedVenueNodes.find((candidate) => candidate.curatedVenueId === "berawa_beach");
  if (!venue || !node) {
    return [];
  }
  return [
    {
      side: "top",
      order: 999,
      tileX: 54,
      tileY: 74,
      widthTiles: 5,
      depthTiles: 3,
      venueId: node.venueId,
      curatedVenueId: venue.id,
      label: "Berawa Beach",
      category: venue.category,
      isLandmark: venue.isLandmark,
      questCritical: true
    }
  ];
}
