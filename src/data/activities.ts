import type { CuratedCategory } from "./curatedVenues";
import type { Meter, ReputationTag } from "../types";

export interface ActivityRequirement {
  minEnergy?: number;
  openHoursOnly?: boolean;
  startsAt?: number;
  endsAt?: number;
}

export interface Activity {
  id: string;
  label: string;
  description: string;
  categories: CuratedCategory[];
  timeCost: number;
  cost?: number;
  meterDeltas: Partial<Record<Meter, number>>;
  affinityBump?: number;
  reputationEffect?: {
    delta?: number;
    tag?: ReputationTag;
    reason: string;
  };
  repeatable: boolean;
  itemRewards?: string[];
  requires?: ActivityRequirement;
}

export const activityDefinitions: Activity[] = [
  {
    id: "remote_work_session",
    label: "Work session",
    description: "Settle in with a laptop and ship client work before the day disappears.",
    categories: ["cafe", "coffee", "coworking"],
    timeCost: 180,
    cost: -140,
    meterDeltas: { energy: -28, wellbeing: -8, focus: 12, social: -4 },
    affinityBump: 2,
    repeatable: true,
    requires: { minEnergy: 30, openHoursOnly: true }
  },
  {
    id: "grab_coffee",
    label: "Grab coffee",
    description: "A quick coffee reset. Useful, not a full meal.",
    categories: ["cafe", "coffee", "bakery"],
    timeCost: 30,
    cost: 25,
    meterDeltas: { energy: 16, focus: 8, wellbeing: 1 },
    affinityBump: 1,
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "eat_properly",
    label: "Eat properly",
    description: "Sit down for food instead of pretending another coffee is lunch.",
    categories: ["restaurant", "cafe", "bakery", "grocery"],
    timeCost: 60,
    cost: 55,
    meterDeltas: { energy: 22, wellbeing: 10, focus: 2 },
    affinityBump: 2,
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "surf_beach_time",
    label: "Surf / beach time",
    description: "Trade productivity for saltwater, sun, and the feeling that moving here was the point.",
    categories: ["beach", "beach_club"],
    timeCost: 90,
    cost: 0,
    meterDeltas: { energy: -22, wellbeing: 20, social: 7, focus: -4 },
    affinityBump: 2,
    reputationEffect: { tag: "explorer", reason: "Made time for Berawa Beach" },
    repeatable: false,
    requires: { minEnergy: 20 }
  },
  {
    id: "night_out",
    label: "Night out",
    description: "Say yes to the evening. Great for connections, expensive for tomorrow.",
    categories: ["bar", "beach_club"],
    timeCost: 120,
    cost: 160,
    meterDeltas: { energy: -32, wellbeing: 4, focus: -22, social: 24 },
    affinityBump: 3,
    repeatable: false,
    requires: { minEnergy: 25, openHoursOnly: true, startsAt: 18 * 60, endsAt: 3 * 60 }
  },
  {
    id: "shop_for_day",
    label: "Shop for the day",
    description: "Pick up the small things that make the next stretch easier.",
    categories: ["shop", "grocery"],
    timeCost: 45,
    cost: 35,
    meterDeltas: { wellbeing: 3 },
    affinityBump: 2,
    itemRewards: ["coconut"],
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "relax_hangout",
    label: "Relax / hang out",
    description: "Do less, notice more, and let the neighborhood start recognizing you.",
    categories: ["cafe", "bar", "beach", "beach_club"],
    timeCost: 75,
    cost: 20,
    meterDeltas: { energy: -6, wellbeing: 11, social: 10, focus: -2 },
    affinityBump: 3,
    reputationEffect: { delta: 1, reason: "Spent time becoming a venue regular" },
    repeatable: true,
    requires: { minEnergy: 12, openHoursOnly: true }
  }
];
