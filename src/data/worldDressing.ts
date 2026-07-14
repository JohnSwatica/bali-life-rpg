export type PaddyFieldVisualState = "green" | "yellowing";

export interface PaddyFieldPatch {
  id: string;
  templateId: string;
  tileX: number;
  tileY: number;
  widthTiles: number;
  heightTiles: number;
  startsYellowing?: boolean;
  yellowingFromAct?: number;
  yellowingFlag?: string;
}

export interface StreetTextureProp {
  id: string;
  kind: "canang" | "laundry" | "parked_scooter" | "warung_steam" | "produce_crates" | "beach_gear" | "kerb_drainage";
  x: number;
  y: number;
  direction?: -1 | 1;
  color?: number;
}

export interface VillaGateDressing {
  deliveryId: string;
  dropoffId: string;
  x: number;
  y: number;
}

export interface StreetLandmarkDefinition {
  id: string;
  templateId: string;
  kind: "finns_tower";
  x: number;
  y: number;
}

export interface WalkableStreetParcel {
  id: string;
  templateId: string;
  kind: "dirt_path" | "bus_dropoff" | "gated_alley";
  tileX: number;
  tileY: number;
  widthTiles: number;
  heightTiles: number;
}

export const paddyFieldPatches: PaddyFieldPatch[] = [
  {
    id: "corner_yellowing_paddy",
    templateId: "jl_pantai_berawa",
    tileX: 34,
    tileY: 2,
    widthTiles: 12,
    heightTiles: 7,
    startsYellowing: true
  },
  {
    id: "upper_west_paddy",
    templateId: "jl_pantai_berawa",
    tileX: 33,
    tileY: 12,
    widthTiles: 13,
    heightTiles: 11
  },
  {
    id: "middle_west_paddy",
    templateId: "jl_pantai_berawa",
    tileX: 33,
    tileY: 27,
    widthTiles: 13,
    heightTiles: 12
  },
  {
    id: "lower_west_paddy",
    templateId: "jl_pantai_berawa",
    tileX: 33,
    tileY: 44,
    widthTiles: 13,
    heightTiles: 13
  },
  {
    id: "beach_approach_paddy",
    templateId: "jl_pantai_berawa",
    tileX: 34,
    tileY: 60,
    widthTiles: 12,
    heightTiles: 10
  }
];

export const streetTextureProps: StreetTextureProp[] = [
  { id: "canang_canggu_station", kind: "canang", x: 2068, y: 124 },
  { id: "canang_sari_kitchen", kind: "canang", x: 2068, y: 1006 },
  { id: "canang_milk_madu_threshold", kind: "canang", x: 2068, y: 740 },
  { id: "canang_satu_satu_threshold", kind: "canang", x: 2068, y: 388 },
  { id: "canang_beach_warung", kind: "canang", x: 1774, y: 2304 },
  { id: "laundry_baked_bungalow", kind: "laundry", x: 1544, y: 174, direction: 1 },
  { id: "laundry_cafe_strip", kind: "laundry", x: 2048, y: 848, direction: -1 },
  { id: "laundry_kos_lane", kind: "laundry", x: 1538, y: 1030, direction: 1 },
  { id: "station_warung_steam", kind: "warung_steam", x: 2076, y: 166 },
  { id: "station_produce_crates", kind: "produce_crates", x: 2078, y: 222 },
  { id: "parked_scooter_satu_satu", kind: "parked_scooter", x: 2068, y: 390, direction: -1, color: 0x4e9fd6 },
  { id: "parked_scooter_satu_satu_2", kind: "parked_scooter", x: 2102, y: 414, direction: -1, color: 0xf2c35d },
  { id: "parked_scooter_satu_satu_3", kind: "parked_scooter", x: 2070, y: 440, direction: -1, color: 0x4f8f66 },
  { id: "parked_scooter_milk_madu", kind: "parked_scooter", x: 2070, y: 742, direction: -1, color: 0xe35d4f },
  { id: "parked_scooter_milk_madu_2", kind: "parked_scooter", x: 2104, y: 766, direction: -1, color: 0x4e9fd6 },
  { id: "parked_scooter_rental", kind: "parked_scooter", x: 1768, y: 302, direction: 1, color: 0xd95b43 },
  { id: "parked_scooter_rental_2", kind: "parked_scooter", x: 1734, y: 330, direction: 1, color: 0x4f8f66 },
  { id: "parked_scooter_beach_club", kind: "parked_scooter", x: 1492, y: 2046, direction: 1, color: 0xf2c35d },
  { id: "beach_gear_approach", kind: "beach_gear", x: 1766, y: 2204, direction: 1 },
  { id: "beach_gear_sand", kind: "beach_gear", x: 1698, y: 2312, direction: 1 },
  { id: "kerb_station_east", kind: "kerb_drainage", x: 2044, y: 220 },
  { id: "kerb_mid_east", kind: "kerb_drainage", x: 2044, y: 960 },
  { id: "kerb_mid_west", kind: "kerb_drainage", x: 1796, y: 1370 },
  { id: "kerb_beach_west", kind: "kerb_drainage", x: 1796, y: 2050 }
];

export const villaGateDressings: VillaGateDressing[] = [
  { deliveryId: "first_baked_villa_delivery", dropoffId: "intro_villa_lane", x: 1488, y: 144 },
  { deliveryId: "milk_madu_brunch_bag", dropoffId: "upper_lane_villa", x: 2014, y: 604 }
];

export const streetLandmarks: StreetLandmarkDefinition[] = [
  {
    id: "finns_recreation_tower",
    templateId: "jl_pantai_berawa",
    kind: "finns_tower",
    x: 2304,
    y: 608
  }
];

export const walkableStreetParcels: WalkableStreetParcel[] = [
  {
    id: "baked_locked_back_alley",
    templateId: "jl_pantai_berawa",
    kind: "gated_alley",
    tileX: 43,
    tileY: 0,
    widthTiles: 14,
    heightTiles: 1
  },
  {
    id: "canggu_station_bus_dropoff",
    templateId: "jl_pantai_berawa",
    kind: "bus_dropoff",
    tileX: 71,
    tileY: 1,
    widthTiles: 6,
    heightTiles: 3
  },
  {
    id: "corner_paddy_edge_path",
    templateId: "jl_pantai_berawa",
    kind: "dirt_path",
    tileX: 46,
    tileY: 5,
    widthTiles: 10,
    heightTiles: 1
  }
];
