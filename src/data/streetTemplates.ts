import { createStreetSlots, type StreetTemplate } from "../systems/map/StreetTemplate";

const JL_PANTAI_BERAWA_BASE: Omit<StreetTemplate, "slots"> = {
  id: "jl_pantai_berawa",
  name: "Jl. Pantai Berawa",
  axis: "vertical",
  lengthTiles: 70,
  roadWidthTiles: 6,
  sidewalkTiles: 2,
  slotDepthTiles: 5,
  start: { tileX: 0, tileY: 6 },
  roadLeftTile: 57,
  beachTerminus: undefined
};

export const jlPantaiBerawaTemplate: StreetTemplate = {
  ...JL_PANTAI_BERAWA_BASE,
  slots: createStreetSlots(JL_PANTAI_BERAWA_BASE, [])
};

export const streetTemplates = [jlPantaiBerawaTemplate] as const;
