import type { NpcDefinition } from "../types";
import { offsetVenuePoint } from "./layoutLookup";

const sariPrep = offsetVenuePoint("canggu_station", { x: 610, y: 690 }, -28, -58);
const sariLunch = offsetVenuePoint("canggu_station", { x: 700, y: 770 }, 70, 42);
const sariMilkMadu = offsetVenuePoint("milk_madu_berawa", { x: 1120, y: 610 }, -55, 24);
const sariEvening = offsetVenuePoint("canggu_station", { x: 640, y: 705 }, -12, -18);
const sariSleep = offsetVenuePoint("canggu_station", { x: 575, y: 640 }, -80, -92);

const kadekClub = offsetVenuePoint("finns_recreation_club", { x: 1660, y: 360 }, 32, -34);
const kadekBakery = offsetVenuePoint("baked_berawa", { x: 700, y: 470 }, 44, 22);
const kadekCoffee = offsetVenuePoint("satu_satu_coffee", { x: 1780, y: 365 }, 36, 24);
const kadekSunset = offsetVenuePoint("berawa_beach", { x: 650, y: 1215 }, -62, 20);
const kadekSleep = offsetVenuePoint("mowies_berawa", { x: 760, y: 1190 }, 35, 30);

const madeStall = offsetVenuePoint("bungalow_living", { x: 1510, y: 815 }, 24, 22);
const madeCoffee = offsetVenuePoint("satu_satu_coffee", { x: 1760, y: 380 }, -35, 28);
const madeClosing = offsetVenuePoint("bungalow_living", { x: 1500, y: 820 }, -18, 40);
const madeSleep = offsetVenuePoint("bungalow_living", { x: 1300, y: 420 }, -95, -70);

const ariBoards = offsetVenuePoint("berawa_beach", { x: 350, y: 1275 }, -60, 28);
const ariBreakfast = offsetVenuePoint("milk_madu_berawa", { x: 1160, y: 640 }, 55, 32);
const ariBeach = offsetVenuePoint("berawa_beach", { x: 475, y: 1340 }, -8, 54);
const ariSunset = offsetVenuePoint("mowies_berawa", { x: 650, y: 1215 }, 58, 24);
const ariSleep = offsetVenuePoint("berawa_beach", { x: 310, y: 1260 }, -110, 18);

export const npcDefinitions: Record<string, NpcDefinition> = {
  ibu_sari: {
    id: "ibu_sari",
    name: "Ibu Sari",
    role: "Canggu Station Grocer",
    spriteKey: "npc-sari",
    tint: 0xf59f43,
    defaultLine: "Selamat datang. Berawa shelves empty faster when the FINNS shuttle crowd arrives.",
    routine: [
      { id: "prep", label: "stocking the Canggu Station front shelf", x: sariPrep.x, y: sariPrep.y, startMinute: 300, endMinute: 660 },
      { id: "lunch", label: "handling the Berawa grocery rush", x: sariLunch.x, y: sariLunch.y, startMinute: 660, endMinute: 900 },
      { id: "milk-madu", label: "checking lunch orders near Milk & Madu", x: sariMilkMadu.x, y: sariMilkMadu.y, startMinute: 900, endMinute: 1080 },
      { id: "evening", label: "closing the grocery counter after traffic thins", x: sariEvening.x, y: sariEvening.y, startMinute: 1080, endMinute: 1440 },
      { id: "sleep", label: "resting above the Berawa lane", x: sariSleep.x, y: sariSleep.y, startMinute: 0, endMinute: 300 }
    ]
  },
  kadek: {
    id: "kadek",
    name: "Kadek",
    role: "FINNS Runner",
    spriteKey: "npc-kadek",
    tint: 0x6ab7ff,
    defaultLine: "The shortcut says five minutes. Berawa traffic says good luck.",
    routine: [
      { id: "club-gate", label: "checking the FINNS Recreation Club gate", x: kadekClub.x, y: kadekClub.y, startMinute: 300, endMinute: 720 },
      { id: "bakery-run", label: "hovering near BAKED. Berawa", x: kadekBakery.x, y: kadekBakery.y, startMinute: 720, endMinute: 960 },
      { id: "coffee-stop", label: "talking beans near Satu-Satu", x: kadekCoffee.x, y: kadekCoffee.y, startMinute: 960, endMinute: 1140 },
      { id: "sunset", label: "watching the Berawa Beach crowd roll in", x: kadekSunset.x, y: kadekSunset.y, startMinute: 1140, endMinute: 1440 },
      { id: "sleep", label: "resting by the club-side board rack", x: kadekSleep.x, y: kadekSleep.y, startMinute: 0, endMinute: 300 }
    ]
  },
  made: {
    id: "made",
    name: "Made",
    role: "Bungalow Living Stylist",
    spriteKey: "npc-made",
    tint: 0x8bd17c,
    defaultLine: "Cushions, sarongs, beach totes, and the calm side of Berawa shopping.",
    routine: [
      { id: "stall", label: "opening the Bungalow Living display", x: madeStall.x, y: madeStall.y, startMinute: 300, endMinute: 960 },
      { id: "coffee", label: "grabbing coffee near Satu-Satu", x: madeCoffee.x, y: madeCoffee.y, startMinute: 960, endMinute: 1080 },
      { id: "closing", label: "packing the homeware display", x: madeClosing.x, y: madeClosing.y, startMinute: 1080, endMinute: 1440 },
      { id: "sleep", label: "resting at home", x: madeSleep.x, y: madeSleep.y, startMinute: 0, endMinute: 300 }
    ]
  },
  ari: {
    id: "ari",
    name: "Ari",
    role: "Berawa Surfer",
    spriteKey: "npc-ari",
    tint: 0xffd166,
    defaultLine: "The tide left coconuts, wax marks, and stories. Berawa provides.",
    routine: [
      { id: "boards", label: "checking boards by Berawa Beach", x: ariBoards.x, y: ariBoards.y, startMinute: 300, endMinute: 720 },
      { id: "breakfast", label: "looking for breakfast near Milk & Madu", x: ariBreakfast.x, y: ariBreakfast.y, startMinute: 720, endMinute: 900 },
      { id: "beach", label: "watching the tide", x: ariBeach.x, y: ariBeach.y, startMinute: 900, endMinute: 1200 },
      { id: "sunset", label: "lighting a beach lantern", x: ariSunset.x, y: ariSunset.y, startMinute: 1200, endMinute: 1440 },
      { id: "sleep", label: "resting by the board rack", x: ariSleep.x, y: ariSleep.y, startMinute: 0, endMinute: 300 }
    ]
  }
};
