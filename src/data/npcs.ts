import type { NpcDefinition, NpcRouteWaypoint } from "../types";
import { offsetVenuePoint } from "./layoutLookup";

function routePoint(
  id: string,
  label: string,
  venueId: string,
  fallback: { x: number; y: number },
  dx: number,
  dy: number,
  pauseMs = 1400
): NpcRouteWaypoint {
  return {
    id,
    label,
    venueId,
    ...offsetVenuePoint(venueId, fallback, dx, dy),
    pauseMs
  };
}

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
    idleTag: "tidy_counter",
    defaultLine: "Selamat datang. Berawa shelves empty faster when the FINNS shuttle crowd arrives.",
    routine: [
      { id: "prep", label: "stocking the Canggu Station front shelf", x: sariPrep.x, y: sariPrep.y, startMinute: 300, endMinute: 660 },
      { id: "lunch", label: "handling the Berawa grocery rush", x: sariLunch.x, y: sariLunch.y, startMinute: 660, endMinute: 900 },
      { id: "milk-madu", label: "checking lunch orders near Milk & Madu", x: sariMilkMadu.x, y: sariMilkMadu.y, startMinute: 900, endMinute: 1080 },
      { id: "evening", label: "closing the grocery counter after traffic thins", x: sariEvening.x, y: sariEvening.y, startMinute: 1080, endMinute: 1440 },
      { id: "sleep", label: "resting above the Berawa lane", x: sariSleep.x, y: sariSleep.y, startMinute: 0, endMinute: 300 }
    ],
    routineRoutes: [
      {
        id: "prep-route",
        label: "tidying the Canggu Station front shelf",
        startMinute: 300,
        endMinute: 660,
        waypoints: [
          routePoint("front-shelf", "front shelf", "canggu_station", { x: 610, y: 690 }, -28, -58),
          routePoint("produce-crate", "produce crate", "canggu_station", { x: 610, y: 690 }, 16, -38),
          routePoint("counter-edge", "counter edge", "canggu_station", { x: 610, y: 690 }, -8, -2)
        ]
      },
      {
        id: "lunch-route",
        label: "moving through the grocery rush",
        startMinute: 660,
        endMinute: 900,
        waypoints: [
          routePoint("checkout", "checkout corner", "canggu_station", { x: 700, y: 770 }, 70, 42),
          routePoint("market-stall", "market stall", "canggu_station", { x: 700, y: 770 }, 28, 62),
          routePoint("bench-check", "bench check", "canggu_station", { x: 700, y: 770 }, 92, 80)
        ]
      },
      {
        id: "milk-madu-route",
        label: "checking a lunch order near Milk & Madu",
        startMinute: 900,
        endMinute: 1080,
        waypoints: [
          routePoint("pickup-table", "pickup table", "milk_madu_berawa", { x: 1120, y: 610 }, -55, 24),
          routePoint("side-counter", "side counter", "milk_madu_berawa", { x: 1120, y: 610 }, -24, 50),
          routePoint("shade-bench", "shade bench", "milk_madu_berawa", { x: 1120, y: 610 }, -82, 60)
        ]
      },
      {
        id: "evening-route",
        label: "closing the grocery counter",
        startMinute: 1080,
        endMinute: 1440,
        waypoints: [
          routePoint("closing-counter", "closing counter", "canggu_station", { x: 640, y: 705 }, -12, -18),
          routePoint("door-check", "door check", "canggu_station", { x: 640, y: 705 }, 34, -4),
          routePoint("stack-crates", "stacked crates", "canggu_station", { x: 640, y: 705 }, -34, 18)
        ]
      },
      {
        id: "rest-route",
        label: "resting above the Berawa lane",
        startMinute: 0,
        endMinute: 300,
        waypoints: [
          routePoint("upstairs-door", "upstairs door", "canggu_station", { x: 575, y: 640 }, -80, -92, 2200),
          routePoint("quiet-balcony", "quiet balcony", "canggu_station", { x: 575, y: 640 }, -48, -108, 2200)
        ]
      }
    ]
  },
  kadek: {
    id: "kadek",
    name: "Kadek",
    role: "FINNS Runner",
    spriteKey: "npc-kadek",
    tint: 0x6ab7ff,
    idleTag: "knead_oven",
    defaultLine: "The shortcut says five minutes. Berawa traffic says good luck.",
    routine: [
      { id: "club-gate", label: "checking the FINNS Recreation Club gate", x: kadekClub.x, y: kadekClub.y, startMinute: 300, endMinute: 720 },
      { id: "bakery-run", label: "hovering near BAKED. Berawa", x: kadekBakery.x, y: kadekBakery.y, startMinute: 720, endMinute: 960 },
      { id: "coffee-stop", label: "talking beans near Satu-Satu", x: kadekCoffee.x, y: kadekCoffee.y, startMinute: 960, endMinute: 1140 },
      { id: "sunset", label: "watching the Berawa Beach crowd roll in", x: kadekSunset.x, y: kadekSunset.y, startMinute: 1140, endMinute: 1440 },
      { id: "sleep", label: "resting by the club-side board rack", x: kadekSleep.x, y: kadekSleep.y, startMinute: 0, endMinute: 300 }
    ],
    routineRoutes: [
      {
        id: "club-gate-route",
        label: "checking the FINNS Recreation Club gate",
        startMinute: 300,
        endMinute: 720,
        waypoints: [
          routePoint("gate-left", "left gate", "finns_recreation_club", { x: 1660, y: 360 }, 32, -34),
          routePoint("gate-right", "right gate", "finns_recreation_club", { x: 1660, y: 360 }, 76, -22),
          routePoint("runner-post", "runner post", "finns_recreation_club", { x: 1660, y: 360 }, 52, 24)
        ]
      },
      {
        id: "bakery-route",
        label: "checking the BAKED pickup window",
        startMinute: 720,
        endMinute: 960,
        waypoints: [
          routePoint("bakery-door", "bakery door", "baked_berawa", { x: 700, y: 470 }, 44, 22),
          routePoint("oven-window", "oven window", "baked_berawa", { x: 700, y: 470 }, 12, 42),
          routePoint("delivery-shelf", "delivery shelf", "baked_berawa", { x: 700, y: 470 }, 70, 58)
        ]
      },
      {
        id: "coffee-route",
        label: "talking beans near Satu-Satu",
        startMinute: 960,
        endMinute: 1140,
        waypoints: [
          routePoint("bean-counter", "bean counter", "satu_satu_coffee", { x: 1780, y: 365 }, 36, 24),
          routePoint("side-table", "side table", "satu_satu_coffee", { x: 1780, y: 365 }, 8, 54),
          routePoint("delivery-notes", "delivery notes", "satu_satu_coffee", { x: 1780, y: 365 }, 58, 72)
        ]
      },
      {
        id: "sunset-route",
        label: "watching the Berawa Beach crowd roll in",
        startMinute: 1140,
        endMinute: 1440,
        waypoints: [
          routePoint("sand-edge", "sand edge", "berawa_beach", { x: 650, y: 1215 }, -62, 20),
          routePoint("club-lane", "club lane", "berawa_beach", { x: 650, y: 1215 }, -24, 52),
          routePoint("sunset-post", "sunset post", "berawa_beach", { x: 650, y: 1215 }, -88, 72)
        ]
      },
      {
        id: "kadek-rest-route",
        label: "resting by the club-side board rack",
        startMinute: 0,
        endMinute: 300,
        waypoints: [
          routePoint("board-rack", "board rack", "mowies_berawa", { x: 760, y: 1190 }, 35, 30, 2200),
          routePoint("quiet-corner", "quiet corner", "mowies_berawa", { x: 760, y: 1190 }, 66, 18, 2200)
        ]
      }
    ]
  },
  made: {
    id: "made",
    name: "Made",
    role: "Bungalow Living Stylist",
    spriteKey: "npc-made",
    tint: 0x8bd17c,
    idleTag: "tinker_board",
    defaultLine: "Cushions, sarongs, beach totes, and the calm side of Berawa shopping.",
    routine: [
      { id: "stall", label: "opening the Bungalow Living display", x: madeStall.x, y: madeStall.y, startMinute: 300, endMinute: 960 },
      { id: "coffee", label: "grabbing coffee near Satu-Satu", x: madeCoffee.x, y: madeCoffee.y, startMinute: 960, endMinute: 1080 },
      { id: "closing", label: "packing the homeware display", x: madeClosing.x, y: madeClosing.y, startMinute: 1080, endMinute: 1440 },
      { id: "sleep", label: "resting at home", x: madeSleep.x, y: madeSleep.y, startMinute: 0, endMinute: 300 }
    ],
    routineRoutes: [
      {
        id: "stall-route",
        label: "arranging the Bungalow Living display",
        startMinute: 300,
        endMinute: 960,
        waypoints: [
          routePoint("front-display", "front display", "bungalow_living", { x: 1510, y: 815 }, 24, 22),
          routePoint("fabric-rack", "fabric rack", "bungalow_living", { x: 1510, y: 815 }, -16, 46),
          routePoint("street-board", "street board", "bungalow_living", { x: 1510, y: 815 }, 54, 58)
        ]
      },
      {
        id: "made-coffee-route",
        label: "grabbing coffee near Satu-Satu",
        startMinute: 960,
        endMinute: 1080,
        waypoints: [
          routePoint("coffee-queue", "coffee queue", "satu_satu_coffee", { x: 1760, y: 380 }, -35, 28),
          routePoint("focus-table", "focus table", "satu_satu_coffee", { x: 1760, y: 380 }, -66, 52),
          routePoint("notice-board", "notice board", "satu_satu_coffee", { x: 1760, y: 380 }, -20, 70)
        ]
      },
      {
        id: "closing-route",
        label: "packing the homeware display",
        startMinute: 1080,
        endMinute: 1440,
        waypoints: [
          routePoint("closing-rack", "closing rack", "bungalow_living", { x: 1500, y: 820 }, -18, 40),
          routePoint("ledger-board", "ledger board", "bungalow_living", { x: 1500, y: 820 }, 20, 58),
          routePoint("door-mat", "door mat", "bungalow_living", { x: 1500, y: 820 }, -42, 68)
        ]
      },
      {
        id: "made-rest-route",
        label: "resting at home",
        startMinute: 0,
        endMinute: 300,
        waypoints: [
          routePoint("home-chair", "home chair", "bungalow_living", { x: 1300, y: 420 }, -95, -70, 2200),
          routePoint("home-window", "home window", "bungalow_living", { x: 1300, y: 420 }, -60, -88, 2200)
        ]
      }
    ]
  },
  ari: {
    id: "ari",
    name: "Ari",
    role: "Berawa Surfer",
    spriteKey: "npc-ari",
    tint: 0xffd166,
    idleTag: "laptop_sip",
    defaultLine: "The tide left coconuts, wax marks, and stories. Berawa provides.",
    routine: [
      { id: "boards", label: "checking boards by Berawa Beach", x: ariBoards.x, y: ariBoards.y, startMinute: 300, endMinute: 720 },
      { id: "breakfast", label: "looking for breakfast near Milk & Madu", x: ariBreakfast.x, y: ariBreakfast.y, startMinute: 720, endMinute: 900 },
      { id: "beach", label: "watching the tide", x: ariBeach.x, y: ariBeach.y, startMinute: 900, endMinute: 1200 },
      { id: "sunset", label: "lighting a beach lantern", x: ariSunset.x, y: ariSunset.y, startMinute: 1200, endMinute: 1440 },
      { id: "sleep", label: "resting by the board rack", x: ariSleep.x, y: ariSleep.y, startMinute: 0, endMinute: 300 }
    ],
    routineRoutes: [
      {
        id: "boards-route",
        label: "checking boards by Berawa Beach",
        startMinute: 300,
        endMinute: 720,
        waypoints: [
          routePoint("board-line", "board line", "berawa_beach", { x: 350, y: 1275 }, -60, 28),
          routePoint("wax-box", "wax box", "berawa_beach", { x: 350, y: 1275 }, -32, 58),
          routePoint("tide-mark", "tide mark", "berawa_beach", { x: 350, y: 1275 }, -86, 72)
        ]
      },
      {
        id: "breakfast-route",
        label: "looking for breakfast near Milk & Madu",
        startMinute: 720,
        endMinute: 900,
        waypoints: [
          routePoint("breakfast-queue", "breakfast queue", "milk_madu_berawa", { x: 1160, y: 640 }, 55, 32),
          routePoint("laptop-table", "laptop table", "milk_madu_berawa", { x: 1160, y: 640 }, 26, 56),
          routePoint("drink-ledge", "drink ledge", "milk_madu_berawa", { x: 1160, y: 640 }, 82, 64)
        ]
      },
      {
        id: "beach-route",
        label: "watching the tide",
        startMinute: 900,
        endMinute: 1200,
        waypoints: [
          routePoint("tide-watch", "tide watch", "berawa_beach", { x: 475, y: 1340 }, -8, 54),
          routePoint("surf-chat", "surf chat", "berawa_beach", { x: 475, y: 1340 }, 28, 82),
          routePoint("coconut-spot", "coconut spot", "berawa_beach", { x: 475, y: 1340 }, -38, 92)
        ]
      },
      {
        id: "sunset-ari-route",
        label: "lighting a beach lantern",
        startMinute: 1200,
        endMinute: 1440,
        waypoints: [
          routePoint("lantern-post", "lantern post", "mowies_berawa", { x: 650, y: 1215 }, 58, 24),
          routePoint("sunset-table", "sunset table", "mowies_berawa", { x: 650, y: 1215 }, 88, 50),
          routePoint("sand-circle", "sand circle", "mowies_berawa", { x: 650, y: 1215 }, 34, 70)
        ]
      },
      {
        id: "ari-rest-route",
        label: "resting by the board rack",
        startMinute: 0,
        endMinute: 300,
        waypoints: [
          routePoint("rack-rest", "rack rest", "berawa_beach", { x: 310, y: 1260 }, -110, 18, 2200),
          routePoint("quiet-sand", "quiet sand", "berawa_beach", { x: 310, y: 1260 }, -82, 42, 2200)
        ]
      }
    ]
  }
};
