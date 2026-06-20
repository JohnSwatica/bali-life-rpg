export interface RoadPathDefinition {
  id: string;
  name: string;
  width: number;
  points: Array<{ x: number; y: number }>;
  importance: "primary" | "secondary" | "lane";
}

export interface MapAreaDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  debugOnly?: boolean;
}

export interface VenueMapNode {
  venueId: string;
  x: number;
  y: number;
  radius: number;
  areaId: string;
}

// North is up. South leads to Berawa Beach; east bends toward Tegal Sari.
// This is a compressed playable plan, not a 1:1 survey map.
export const berawaRoads: RoadPathDefinition[] = [
  {
    id: "jl_pantai_berawa",
    name: "Jl. Pantai Berawa",
    width: 130,
    importance: "primary",
    points: [
      { x: 980, y: 70 },
      { x: 980, y: 360 },
      { x: 950, y: 650 },
      { x: 910, y: 900 },
      { x: 780, y: 1160 },
      { x: 650, y: 1390 }
    ]
  },
  {
    id: "jl_nelayan",
    name: "Jl. Nelayan",
    width: 112,
    importance: "primary",
    points: [
      { x: 190, y: 390 },
      { x: 560, y: 405 },
      { x: 980, y: 390 },
      { x: 1370, y: 420 },
      { x: 1700, y: 455 }
    ]
  },
  {
    id: "jl_tegal_sari",
    name: "Jl. Tegal Sari",
    width: 104,
    importance: "primary",
    points: [
      { x: 1580, y: 210 },
      { x: 1530, y: 470 },
      { x: 1510, y: 780 },
      { x: 1600, y: 1045 },
      { x: 1800, y: 1230 }
    ]
  },
  {
    id: "finns_club_lane",
    name: "FINNS / Club Lane",
    width: 76,
    importance: "secondary",
    points: [
      { x: 980, y: 390 },
      { x: 1270, y: 320 },
      { x: 1768, y: 300 }
    ]
  },
  {
    id: "berawa_market_lane",
    name: "Berawa Cafe Lane",
    width: 74,
    importance: "secondary",
    points: [
      { x: 620, y: 735 },
      { x: 930, y: 735 },
      { x: 1190, y: 610 },
      { x: 1510, y: 820 }
    ]
  },
  {
    id: "beach_access",
    name: "Berawa Beach Access",
    width: 92,
    importance: "secondary",
    points: [
      { x: 650, y: 1390 },
      { x: 520, y: 1280 },
      { x: 410, y: 1215 },
      { x: 300, y: 1185 }
    ]
  },
  {
    id: "seminyak_shortcut",
    name: "Soft Shortcut",
    width: 58,
    importance: "lane",
    points: [
      { x: 1510, y: 780 },
      { x: 1780, y: 760 },
      { x: 2040, y: 740 }
    ]
  }
];

export const berawaAreas: MapAreaDefinition[] = [
  { id: "nelayan", name: "Jl. Nelayan", x: 760, y: 390, radius: 230 },
  { id: "pantai_berawa", name: "Jl. Pantai Berawa", x: 920, y: 790, radius: 280 },
  { id: "tegal_sari", name: "Jl. Tegal Sari", x: 1540, y: 790, radius: 250 },
  { id: "finns_area", name: "FINNS / Canggu Club Area", x: 1768, y: 300, radius: 260 },
  { id: "beach", name: "Berawa Beach Direction", x: 350, y: 1225, radius: 320 },
  { id: "cafe_cluster", name: "Berawa Cafe Cluster", x: 1190, y: 610, radius: 260 }
];

export const venueMapNodes: VenueMapNode[] = [
  { venueId: "canggu_station", x: 610, y: 735, radius: 180, areaId: "pantai_berawa" },
  { venueId: "bali_family_rental_scooter", x: 820, y: 735, radius: 160, areaId: "pantai_berawa" },
  { venueId: "milk_madu_berawa", x: 1190, y: 610, radius: 170, areaId: "cafe_cluster" },
  { venueId: "baked_berawa", x: 675, y: 465, radius: 165, areaId: "nelayan" },
  { venueId: "bungalow_living", x: 1510, y: 820, radius: 180, areaId: "tegal_sari" },
  { venueId: "satu_satu_coffee", x: 1768, y: 365, radius: 180, areaId: "finns_area" },
  { venueId: "finns_recreation_club", x: 1768, y: 300, radius: 220, areaId: "finns_area" },
  { venueId: "berawa_beach", x: 350, y: 1225, radius: 240, areaId: "beach" },
  { venueId: "nude_cafe_berawa", x: 1180, y: 700, radius: 170, areaId: "cafe_cluster" },
  { venueId: "ulekan_berawa", x: 1390, y: 690, radius: 170, areaId: "cafe_cluster" },
  { venueId: "mowies_berawa", x: 520, y: 1185, radius: 190, areaId: "beach" }
];
