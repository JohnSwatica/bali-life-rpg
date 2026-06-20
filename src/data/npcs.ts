import type { NpcDefinition } from "../types";

export const npcDefinitions: Record<string, NpcDefinition> = {
  ibu_sari: {
    id: "ibu_sari",
    name: "Ibu Sari",
    role: "Canggu Station Grocer",
    spriteKey: "npc-sari",
    tint: 0xf59f43,
    defaultLine: "Selamat datang. Berawa shelves empty faster when the FINNS shuttle crowd arrives.",
    routine: [
      { id: "prep", label: "stocking the Canggu Station front shelf", x: 610, y: 690, startMinute: 300, endMinute: 660 },
      { id: "lunch", label: "handling the Berawa grocery rush", x: 700, y: 770, startMinute: 660, endMinute: 900 },
      { id: "milk-madu", label: "checking lunch orders near Milk & Madu", x: 1120, y: 610, startMinute: 900, endMinute: 1080 },
      { id: "evening", label: "closing the grocery counter after traffic thins", x: 640, y: 705, startMinute: 1080, endMinute: 1440 },
      { id: "sleep", label: "resting above the Berawa lane", x: 575, y: 640, startMinute: 0, endMinute: 300 }
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
      { id: "club-gate", label: "checking the FINNS Recreation Club gate", x: 1660, y: 360, startMinute: 300, endMinute: 720 },
      { id: "bakery-run", label: "hovering near BAKED. Berawa", x: 700, y: 470, startMinute: 720, endMinute: 960 },
      { id: "coffee-stop", label: "talking beans near Satu-Satu", x: 1780, y: 365, startMinute: 960, endMinute: 1140 },
      { id: "sunset", label: "watching the Berawa Beach crowd roll in", x: 650, y: 1215, startMinute: 1140, endMinute: 1440 },
      { id: "sleep", label: "resting by the club-side board rack", x: 760, y: 1190, startMinute: 0, endMinute: 300 }
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
      { id: "stall", label: "opening the Bungalow Living display", x: 1510, y: 815, startMinute: 300, endMinute: 960 },
      { id: "coffee", label: "grabbing coffee near Satu-Satu", x: 1760, y: 380, startMinute: 960, endMinute: 1080 },
      { id: "closing", label: "packing the homeware display", x: 1500, y: 820, startMinute: 1080, endMinute: 1440 },
      { id: "sleep", label: "resting at home", x: 1300, y: 420, startMinute: 0, endMinute: 300 }
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
      { id: "boards", label: "checking boards by Berawa Beach", x: 350, y: 1275, startMinute: 300, endMinute: 720 },
      { id: "breakfast", label: "looking for breakfast near Milk & Madu", x: 1160, y: 640, startMinute: 720, endMinute: 900 },
      { id: "beach", label: "watching the tide", x: 475, y: 1340, startMinute: 900, endMinute: 1200 },
      { id: "sunset", label: "lighting a beach lantern", x: 650, y: 1215, startMinute: 1200, endMinute: 1440 },
      { id: "sleep", label: "resting by the board rack", x: 310, y: 1260, startMinute: 0, endMinute: 300 }
    ]
  }
};
