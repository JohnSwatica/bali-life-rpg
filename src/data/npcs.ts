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

const rioSleep = offsetVenuePoint("bali_family_rental_scooter", { x: 650, y: 900 }, -48, -62);
const rioRentalMorning = offsetVenuePoint("bali_family_rental_scooter", { x: 650, y: 900 }, 36, -26);
const rioStation = offsetVenuePoint("canggu_station", { x: 610, y: 742 }, 78, -30);
const rioBeach = offsetVenuePoint("berawa_beach", { x: 650, y: 1215 }, 46, 32);
const rioRentalEvening = offsetVenuePoint("bali_family_rental_scooter", { x: 650, y: 900 }, -24, 44);

const bagusSleep = offsetVenuePoint("finns_recreation_club", { x: 1660, y: 360 }, -58, -48);
const bagusClubMorning = offsetVenuePoint("finns_recreation_club", { x: 1660, y: 360 }, -32, 34);
const bagusCoffee = offsetVenuePoint("satu_satu_coffee", { x: 1780, y: 365 }, 82, 18);
const bagusClubEvening = offsetVenuePoint("finns_recreation_club", { x: 1660, y: 360 }, 54, 52);

const willowSleep = offsetVenuePoint("milk_madu_berawa", { x: 1160, y: 640 }, -72, -44);
const willowMilkMorning = offsetVenuePoint("milk_madu_berawa", { x: 1160, y: 640 }, 64, -18);
const willowBeachClub = offsetVenuePoint("finns_beach_club", { x: 1768, y: 300 }, -46, 42);
const willowMilkEvening = offsetVenuePoint("milk_madu_berawa", { x: 1160, y: 640 }, 36, 58);

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
  },
  rio: {
    id: "rio",
    name: "Leo",
    role: "NusaDrop Driver, Leaderboard #1",
    spriteKey: "npc-rio",
    tint: 0xff5d5d,
    idleTag: "generic_idle",
    defaultLine: "Rated 4.9. NusaDrop's optimal path says I should already be gone. You keeping up?",
    routine: [
      { id: "sleep", label: "resting at the scooter rental", x: rioSleep.x, y: rioSleep.y, startMinute: 0, endMinute: 300 },
      { id: "rental-morning", label: "checking NusaDrop leaderboard times at Bali Family Rental Scooter", x: rioRentalMorning.x, y: rioRentalMorning.y, startMinute: 300, endMinute: 720 },
      { id: "station-run", label: "hovering near the Canggu Station NusaDrop board", x: rioStation.x, y: rioStation.y, startMinute: 720, endMinute: 960 },
      { id: "beach-flex", label: "showing off by Berawa Beach", x: rioBeach.x, y: rioBeach.y, startMinute: 960, endMinute: 1260 },
      { id: "rental-evening", label: "tuning NusaDrop routes at Bali Family Rental Scooter", x: rioRentalEvening.x, y: rioRentalEvening.y, startMinute: 1260, endMinute: 1440 }
    ],
    routineRoutes: [
      {
        id: "rio-rest-route",
        label: "resting at the scooter rental",
        startMinute: 0,
        endMinute: 300,
        waypoints: [
          routePoint("rental-back-bench", "rental back bench", "bali_family_rental_scooter", { x: 650, y: 900 }, -48, -62, 2200),
          routePoint("helmet-rack", "helmet rack", "bali_family_rental_scooter", { x: 650, y: 900 }, -18, -78, 2200)
        ]
      },
      {
        id: "rio-rental-morning-route",
        label: "checking NusaDrop leaderboard times at Bali Family Rental Scooter",
        startMinute: 300,
        endMinute: 720,
        waypoints: [
          routePoint("rental-counter", "rental counter", "bali_family_rental_scooter", { x: 650, y: 900 }, 36, -26),
          routePoint("scooter-line", "scooter line", "bali_family_rental_scooter", { x: 650, y: 900 }, 74, -8),
          routePoint("timing-board", "timing board", "bali_family_rental_scooter", { x: 650, y: 900 }, 18, 28)
        ]
      },
      {
        id: "rio-station-route",
        label: "hovering near the Canggu Station NusaDrop board",
        startMinute: 720,
        endMinute: 960,
        waypoints: [
          routePoint("station-board", "station board", "canggu_station", { x: 610, y: 742 }, 78, -30),
          routePoint("fast-lane", "fast lane", "canggu_station", { x: 610, y: 742 }, 44, -62),
          routePoint("order-pickup", "order pickup", "canggu_station", { x: 610, y: 742 }, 92, 12)
        ]
      },
      {
        id: "rio-beach-route",
        label: "showing off by Berawa Beach",
        startMinute: 960,
        endMinute: 1260,
        waypoints: [
          routePoint("beach-edge-flex", "beach edge", "berawa_beach", { x: 650, y: 1215 }, 46, 32),
          routePoint("photo-stop", "photo stop", "berawa_beach", { x: 650, y: 1215 }, 82, 58),
          routePoint("scooter-lean", "scooter lean", "berawa_beach", { x: 650, y: 1215 }, 28, 82)
        ]
      },
      {
        id: "rio-rental-evening-route",
        label: "tuning NusaDrop routes at Bali Family Rental Scooter",
        startMinute: 1260,
        endMinute: 1440,
        waypoints: [
          routePoint("evening-route-map", "route map", "bali_family_rental_scooter", { x: 650, y: 900 }, -24, 44),
          routePoint("battery-check", "battery check", "bali_family_rental_scooter", { x: 650, y: 900 }, 22, 64),
          routePoint("night-helmet", "night helmet", "bali_family_rental_scooter", { x: 650, y: 900 }, -58, 70)
        ]
      }
    ]
  },
  pak_bagus: {
    id: "pak_bagus",
    name: "Julian Vance",
    role: "Vanguard Co-Living Partner",
    spriteKey: "npc-pak-bagus",
    tint: 0xd4af6a,
    idleTag: "generic_idle",
    defaultLine: "Enclave Berawa is not a gated escape. It is a better system for this street.",
    routine: [
      { id: "sleep", label: "resting near FINNS Recreation Club", x: bagusSleep.x, y: bagusSleep.y, startMinute: 0, endMinute: 300 },
      { id: "club-morning", label: "hosting the Vanguard morning crowd at FINNS", x: bagusClubMorning.x, y: bagusClubMorning.y, startMinute: 300, endMinute: 780 },
      { id: "coffee-network", label: "taking Enclave Berawa meetings at Satu-Satu Coffee", x: bagusCoffee.x, y: bagusCoffee.y, startMinute: 780, endMinute: 1020 },
      { id: "club-evening", label: "holding court near FINNS Recreation Club", x: bagusClubEvening.x, y: bagusClubEvening.y, startMinute: 1020, endMinute: 1440 }
    ],
    routineRoutes: [
      {
        id: "bagus-rest-route",
        label: "resting near FINNS Recreation Club",
        startMinute: 0,
        endMinute: 300,
        waypoints: [
          routePoint("club-villa-gate", "club villa gate", "finns_recreation_club", { x: 1660, y: 360 }, -58, -48, 2200),
          routePoint("quiet-driveway", "quiet driveway", "finns_recreation_club", { x: 1660, y: 360 }, -28, -70, 2200)
        ]
      },
      {
        id: "bagus-club-morning-route",
        label: "hosting the Vanguard morning crowd at FINNS",
        startMinute: 300,
        endMinute: 780,
        waypoints: [
          routePoint("sponsor-banner", "sponsor banner", "finns_recreation_club", { x: 1660, y: 360 }, -32, 34),
          routePoint("club-steps", "club steps", "finns_recreation_club", { x: 1660, y: 360 }, 12, 58),
          routePoint("handshake-post", "handshake post", "finns_recreation_club", { x: 1660, y: 360 }, -68, 66)
        ]
      },
      {
        id: "bagus-coffee-route",
        label: "taking Enclave Berawa meetings at Satu-Satu Coffee",
        startMinute: 780,
        endMinute: 1020,
        waypoints: [
          routePoint("corner-table", "corner table", "satu_satu_coffee", { x: 1780, y: 365 }, 82, 18),
          routePoint("investor-chat", "investor chat", "satu_satu_coffee", { x: 1780, y: 365 }, 50, 46),
          routePoint("street-call", "street call", "satu_satu_coffee", { x: 1780, y: 365 }, 92, 64)
        ]
      },
      {
        id: "bagus-club-evening-route",
        label: "holding court near FINNS Recreation Club",
        startMinute: 1020,
        endMinute: 1440,
        waypoints: [
          routePoint("evening-terrace", "evening terrace", "finns_recreation_club", { x: 1660, y: 360 }, 54, 52),
          routePoint("guest-arrival", "guest arrival", "finns_recreation_club", { x: 1660, y: 360 }, 88, 26),
          routePoint("club-sign", "club sign", "finns_recreation_club", { x: 1660, y: 360 }, 22, 78)
        ]
      }
    ]
  },
  willow: {
    id: "willow",
    name: "Willow",
    role: "@WillowWanders -- Wellness Creator",
    spriteKey: "npc-willow",
    tint: 0xc9a6ff,
    idleTag: "generic_idle",
    defaultLine: "This lighting is SO good right now. Wait, are you new? You have such an authentic energy.",
    routine: [
      { id: "sleep", label: "resting near Milk & Madu", x: willowSleep.x, y: willowSleep.y, startMinute: 0, endMinute: 300 },
      { id: "milk-morning", label: "filming wellness content at Milk & Madu", x: willowMilkMorning.x, y: willowMilkMorning.y, startMinute: 300, endMinute: 900 },
      { id: "beach-club", label: "shooting beach content at FINNS Beach Club", x: willowBeachClub.x, y: willowBeachClub.y, startMinute: 900, endMinute: 1200 },
      { id: "milk-evening", label: "editing captions at Milk & Madu", x: willowMilkEvening.x, y: willowMilkEvening.y, startMinute: 1200, endMinute: 1440 }
    ],
    routineRoutes: [
      {
        id: "willow-rest-route",
        label: "resting near Milk & Madu",
        startMinute: 0,
        endMinute: 300,
        waypoints: [
          routePoint("quiet-booth", "quiet booth", "milk_madu_berawa", { x: 1160, y: 640 }, -72, -44, 2200),
          routePoint("phone-charge", "phone charge", "milk_madu_berawa", { x: 1160, y: 640 }, -38, -64, 2200)
        ]
      },
      {
        id: "willow-milk-morning-route",
        label: "filming wellness content at Milk & Madu",
        startMinute: 300,
        endMinute: 900,
        waypoints: [
          routePoint("content-table", "content table", "milk_madu_berawa", { x: 1160, y: 640 }, 64, -18),
          routePoint("smoothie-light", "smoothie light", "milk_madu_berawa", { x: 1160, y: 640 }, 86, 18),
          routePoint("mirror-check", "mirror check", "milk_madu_berawa", { x: 1160, y: 640 }, 42, 34)
        ]
      },
      {
        id: "willow-beach-club-route",
        label: "shooting beach content at FINNS Beach Club",
        startMinute: 900,
        endMinute: 1200,
        waypoints: [
          routePoint("pool-shot", "pool shot", "finns_beach_club", { x: 1768, y: 300 }, -46, 42),
          routePoint("beach-club-sign", "beach club sign", "finns_beach_club", { x: 1768, y: 300 }, -78, 62),
          routePoint("story-angle", "story angle", "finns_beach_club", { x: 1768, y: 300 }, -24, 84)
        ]
      },
      {
        id: "willow-milk-evening-route",
        label: "editing captions at Milk & Madu",
        startMinute: 1200,
        endMinute: 1440,
        waypoints: [
          routePoint("caption-corner", "caption corner", "milk_madu_berawa", { x: 1160, y: 640 }, 36, 58),
          routePoint("late-smoothie", "late smoothie", "milk_madu_berawa", { x: 1160, y: 640 }, 76, 76),
          routePoint("softbox-pack", "softbox pack", "milk_madu_berawa", { x: 1160, y: 640 }, 12, 82)
        ]
      }
    ]
  }
};
