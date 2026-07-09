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
  kind: "canang" | "sleeping_dog" | "laundry" | "parked_scooter";
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
  { id: "canang_beach_warung", kind: "canang", x: 1774, y: 2304 },
  { id: "dog_bungalow_lane", kind: "sleeping_dog", x: 1510, y: 260, direction: 1 },
  { id: "dog_cafe_strip", kind: "sleeping_dog", x: 2054, y: 916, direction: -1 },
  { id: "dog_beach_approach", kind: "sleeping_dog", x: 1494, y: 1830, direction: 1 },
  { id: "laundry_baked_bungalow", kind: "laundry", x: 1544, y: 174, direction: 1 },
  { id: "laundry_cafe_strip", kind: "laundry", x: 2048, y: 848, direction: -1 },
  { id: "parked_scooter_satu_satu", kind: "parked_scooter", x: 2068, y: 390, direction: -1, color: 0x4e9fd6 },
  { id: "parked_scooter_milk_madu", kind: "parked_scooter", x: 2070, y: 742, direction: -1, color: 0xe35d4f },
  { id: "parked_scooter_beach_club", kind: "parked_scooter", x: 1492, y: 2046, direction: 1, color: 0xf2c35d }
];

export const villaGateDressings: VillaGateDressing[] = [
  { deliveryId: "first_baked_villa_delivery", dropoffId: "intro_villa_lane", x: 1488, y: 144 },
  { deliveryId: "milk_madu_brunch_bag", dropoffId: "upper_lane_villa", x: 2014, y: 604 }
];
