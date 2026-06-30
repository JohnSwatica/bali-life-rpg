import type { CuratedCategory } from "./curatedVenues";

export type StationVisualProp = "laptop_table" | "surf_reset" | "club_rope" | "warung_steam" | "coworking_desks";

export interface StationVisualPalette {
  roof: number;
  roofLight: number;
  wall: number;
  trim: number;
  sign: number;
  accent: number;
}

export interface StationVisualDefinition {
  venueIds: string[];
  categories?: CuratedCategory[];
  signLabel: string;
  prop: StationVisualProp;
  palette: StationVisualPalette;
}

export const stationVisualDefinitions: StationVisualDefinition[] = [
  {
    venueIds: ["satu_satu_coffee", "milk_madu_berawa", "nude_cafe_berawa", "baked_berawa"],
    categories: ["cafe", "coffee", "bakery"],
    signLabel: "FOCUS\nTABLE",
    prop: "laptop_table",
    palette: { roof: 0xc86f50, roofLight: 0xf4b06d, wall: 0xf2dfb8, trim: 0x7e5542, sign: 0x2f5f67, accent: 0x66b8a0 }
  },
  {
    venueIds: ["berawa_beach"],
    categories: ["beach"],
    signLabel: "SURF\nRESET",
    prop: "surf_reset",
    palette: { roof: 0x48a6b0, roofLight: 0x94d9d2, wall: 0xf1dfb6, trim: 0x247780, sign: 0x12535c, accent: 0xf5c75d }
  },
  {
    venueIds: ["finns_beach_club"],
    categories: ["beach_club"],
    signLabel: "SUNSET\nSOCIAL",
    prop: "club_rope",
    palette: { roof: 0x254b6c, roofLight: 0x79b3c8, wall: 0xf0d9a8, trim: 0x16384f, sign: 0x5f2c5f, accent: 0xf3b54a }
  },
  {
    venueIds: ["ulekan_berawa"],
    categories: ["restaurant"],
    signLabel: "WARUNG\nRESET",
    prop: "warung_steam",
    palette: { roof: 0x4f8f66, roofLight: 0x96d08e, wall: 0xf4dfad, trim: 0x2f6b4d, sign: 0x6b3f2a, accent: 0xd95b43 }
  },
  {
    venueIds: ["tropical_nomad_coworking_space", "outpost_canggu_coworking"],
    categories: ["coworking"],
    signLabel: "WORK\nSPRINT",
    prop: "coworking_desks",
    palette: { roof: 0x3f6f8f, roofLight: 0x92c7d9, wall: 0xdbe6d6, trim: 0x284f68, sign: 0x253a35, accent: 0xf2c35d }
  }
];

export function getStationVisualForVenue(venueId: string | undefined, category: CuratedCategory | undefined): StationVisualDefinition | undefined {
  return stationVisualDefinitions.find(
    (visual) => (venueId && visual.venueIds.includes(venueId)) || (category && visual.categories?.includes(category))
  );
}
