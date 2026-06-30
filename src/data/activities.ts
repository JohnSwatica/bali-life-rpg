import type { CuratedCategory } from "./curatedVenues";
import type { GameplayStationId, StationTimeOfDayModifier } from "./stationLoops";
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
  venueIds?: string[];
  stationId?: GameplayStationId;
  actionLabel?: string;
  outcomePreview?: string;
  stationRisk?: string;
  stationReward?: string;
  timeOfDayModifier?: StationTimeOfDayModifier;
  nextMorningDeltas?: Partial<Record<Meter, number>>;
  nextMorningReason?: string;
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
    cost: -125,
    meterDeltas: { energy: -30, wellbeing: -10, focus: 10, social: -5 },
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
    cost: 30,
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
    cost: 65,
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
    meterDeltas: { energy: -26, wellbeing: 20, social: 7, focus: -4 },
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
    cost: 180,
    meterDeltas: { energy: -38, wellbeing: 4, focus: -28, social: 24 },
    affinityBump: 3,
    repeatable: false,
    requires: { minEnergy: 35, openHoursOnly: true, startsAt: 18 * 60, endsAt: 3 * 60 }
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
  },
  {
    id: "cafe_deep_work",
    label: "Deep work table",
    description: "Claim a corner table, order enough to be welcome, and push one serious block of work.",
    categories: ["cafe", "coffee", "bakery"],
    venueIds: ["satu_satu_coffee", "milk_madu_berawa", "nude_cafe_berawa", "baked_berawa"],
    stationId: "cafe",
    actionLabel: "Focus",
    outcomePreview: "Earns money and Focus; drains Energy and a little Wellbeing.",
    stationReward: "Reliable cash plus Focus when you commit to a real block.",
    stationRisk: "Long cafe sessions make the day disappear and leave you tired.",
    timeOfDayModifier: {
      label: "Morning focus window",
      startsAt: 7 * 60,
      endsAt: 12 * 60,
      meterMultiplier: 1.18,
      moneyMultiplier: 1.08
    },
    timeCost: 120,
    cost: -115,
    meterDeltas: { energy: -24, wellbeing: -6, focus: 18, social: -4 },
    affinityBump: 1,
    repeatable: true,
    requires: { minEnergy: 30, openHoursOnly: true }
  },
  {
    id: "cafe_brunch_table",
    label: "Brunch table reset",
    description: "Sit down for an actual plate before pretending another coffee can carry the whole day.",
    categories: ["cafe", "coffee", "bakery"],
    venueIds: ["satu_satu_coffee", "milk_madu_berawa", "nude_cafe_berawa", "baked_berawa"],
    stationId: "cafe",
    actionLabel: "Eat",
    outcomePreview: "Costs more than coffee, restores Energy and Wellbeing, and keeps you socially present.",
    stationReward: "A proper first-day meal that stabilizes the meters.",
    stationRisk: "Cafe brunch is useful, but not the cheapest food in Berawa.",
    timeCost: 60,
    cost: 55,
    meterDeltas: { energy: 18, wellbeing: 12, focus: 3, social: 6 },
    affinityBump: 2,
    reputationEffect: { delta: 1, reason: "Sat down for a proper cafe meal" },
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "cafe_quick_caffeine",
    label: "Quick caffeine reset",
    description: "A focused coffee stop: no full meal, no laptop sprawl, just enough lift to keep moving.",
    categories: ["cafe", "coffee", "bakery"],
    venueIds: ["satu_satu_coffee", "milk_madu_berawa", "nude_cafe_berawa", "baked_berawa"],
    stationId: "cafe",
    actionLabel: "Reset",
    outcomePreview: "Fast Energy and Focus for a small cash cost.",
    stationReward: "Short, useful recovery when a delivery or meeting is next.",
    stationRisk: "Not a meal; it will not carry the whole day.",
    timeCost: 25,
    cost: 28,
    meterDeltas: { energy: 14, wellbeing: 2, focus: 9 },
    affinityBump: 1,
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "beach_surf_session",
    label: "Surf session",
    description: "Paddle out, burn the nerves off, and come back saltier, happier, and less productive.",
    categories: ["beach"],
    venueIds: ["berawa_beach"],
    stationId: "beach",
    actionLabel: "Surf",
    outcomePreview: "Large Wellbeing, some Social, explorer reputation; costs Energy and Focus.",
    stationReward: "The clearest wellbeing spike in the neighborhood.",
    stationRisk: "Great memories are still time away from rent.",
    timeOfDayModifier: {
      label: "Morning glassy water",
      startsAt: 6 * 60,
      endsAt: 10 * 60,
      meterMultiplier: 1.2,
      meterDeltas: { focus: 2 }
    },
    timeCost: 90,
    cost: 0,
    meterDeltas: { energy: -24, wellbeing: 24, focus: -6, social: 5 },
    affinityBump: 2,
    reputationEffect: { tag: "explorer", reason: "Made time for Berawa Beach surf" },
    repeatable: false,
    requires: { minEnergy: 24 }
  },
  {
    id: "beach_reflect_walk",
    label: "Reflective beach walk",
    description: "Walk the shore slowly enough for the bigger shape of the day to come back into focus.",
    categories: ["beach"],
    venueIds: ["berawa_beach"],
    stationId: "beach",
    actionLabel: "Walk",
    outcomePreview: "Gentle Wellbeing and Focus with minimal cost.",
    stationReward: "A cheap reset when meters are low.",
    stationRisk: "Calm is useful, but it does not pay the rent by itself.",
    timeOfDayModifier: {
      label: "Sunset clarity",
      startsAt: 17 * 60,
      endsAt: 19 * 60,
      meterMultiplier: 1.22
    },
    timeCost: 45,
    cost: 0,
    meterDeltas: { energy: -5, wellbeing: 13, focus: 7, social: 2 },
    affinityBump: 1,
    repeatable: true
  },
  {
    id: "beach_cleanup_chat",
    label: "Cleanup chat",
    description: "Grab a bag, help for a little while, and talk to whoever else showed up.",
    categories: ["beach"],
    venueIds: ["berawa_beach"],
    stationId: "beach",
    actionLabel: "Help",
    outcomePreview: "Social and reputation, plus a small Wellbeing lift.",
    stationReward: "Turns recovery time into community trust.",
    stationRisk: "Helpful time still costs Energy.",
    timeCost: 55,
    cost: 0,
    meterDeltas: { energy: -10, wellbeing: 10, focus: 2, social: 9 },
    affinityBump: 3,
    reputationEffect: { delta: 2, tag: "community_contributor", reason: "Helped with a beach cleanup chat" },
    itemRewards: ["cleanup_bag"],
    repeatable: true,
    requires: { minEnergy: 12 }
  },
  {
    id: "beach_club_sunset_table",
    label: "Sunset table",
    description: "Pay for the good hour: visible, social, and expensive enough to make you choose it on purpose.",
    categories: ["beach_club"],
    venueIds: ["finns_beach_club"],
    stationId: "beach_club",
    actionLabel: "Join",
    outcomePreview: "Strong Social and Wellbeing; costs money, Energy, and Focus.",
    stationReward: "A controlled version of nightlife social acceleration.",
    stationRisk: "Your wallet and focus both notice.",
    timeOfDayModifier: {
      label: "Golden hour",
      startsAt: 17 * 60,
      endsAt: 20 * 60,
      meterMultiplier: 1.18
    },
    timeCost: 90,
    cost: 120,
    meterDeltas: { energy: -16, wellbeing: 8, focus: -8, social: 18 },
    affinityBump: 3,
    reputationEffect: { delta: 1, reason: "Showed up at a sunset beach-club table" },
    repeatable: true,
    requires: { minEnergy: 25, openHoursOnly: true }
  },
  {
    id: "beach_club_big_night",
    label: "Big night out",
    description: "Say yes to the loud version of Bali: new faces, strong memories, and tomorrow collecting its fee.",
    categories: ["beach_club"],
    venueIds: ["finns_beach_club"],
    stationId: "beach_club",
    actionLabel: "Go big",
    outcomePreview: "Huge Social now; money, Energy, Focus, and tomorrow take the hit.",
    stationReward: "Fastest social jump when you can afford the fallout.",
    stationRisk: "Adds a next-morning hangover penalty.",
    timeOfDayModifier: {
      label: "Night crowd",
      startsAt: 20 * 60,
      endsAt: 2 * 60,
      meterMultiplier: 1.12
    },
    nextMorningDeltas: { energy: -16, wellbeing: -4, focus: -12 },
    nextMorningReason: "Big night at FINNS",
    timeCost: 150,
    cost: 220,
    meterDeltas: { energy: -34, wellbeing: 5, focus: -24, social: 32 },
    affinityBump: 4,
    reputationEffect: { tag: "social", reason: "Went big at FINNS Beach Club" },
    repeatable: false,
    requires: { minEnergy: 40, openHoursOnly: true, startsAt: 18 * 60, endsAt: 3 * 60 }
  },
  {
    id: "beach_club_leave_early",
    label: "Leave early",
    description: "Show face, have one drink, and leave while the night still thinks you are mysterious.",
    categories: ["beach_club"],
    venueIds: ["finns_beach_club"],
    stationId: "beach_club",
    actionLabel: "Dip",
    outcomePreview: "Small Social gain with a controlled cost and no morning penalty.",
    stationReward: "Keeps the club in the loop without sacrificing tomorrow.",
    stationRisk: "You will not get the big networking spike.",
    timeCost: 45,
    cost: 60,
    meterDeltas: { energy: -6, wellbeing: 3, focus: -2, social: 8 },
    affinityBump: 1,
    repeatable: true,
    requires: { openHoursOnly: true, startsAt: 17 * 60, endsAt: 2 * 60 }
  },
  {
    id: "warung_nasi_reset",
    label: "Nasi reset",
    description: "Sit down for the practical meal your meters have been asking for all day.",
    categories: ["restaurant"],
    venueIds: ["ulekan_berawa"],
    stationId: "warung",
    actionLabel: "Eat",
    outcomePreview: "Cheap Energy and Wellbeing recovery.",
    stationReward: "Best low-cost restore in the current neighborhood.",
    stationRisk: "Pure recovery: useful, not glamorous.",
    timeOfDayModifier: {
      label: "Lunch plate",
      startsAt: 11 * 60,
      endsAt: 14 * 60,
      meterMultiplier: 1.12
    },
    timeCost: 35,
    cost: 28,
    meterDeltas: { energy: 26, wellbeing: 12, focus: 2 },
    affinityBump: 1,
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "warung_local_chat",
    label: "Local chat",
    description: "Order simply, sit a little longer, and listen before trying to sound worldly.",
    categories: ["restaurant"],
    venueIds: ["ulekan_berawa"],
    stationId: "warung",
    actionLabel: "Chat",
    outcomePreview: "Social and Wellbeing for low money; slow but grounding.",
    stationReward: "Small but steady neighborhood trust.",
    stationRisk: "Time goes into belonging rather than output.",
    timeCost: 50,
    cost: 22,
    meterDeltas: { energy: 8, wellbeing: 9, focus: 2, social: 9 },
    affinityBump: 3,
    reputationEffect: { delta: 1, reason: "Took time for a local warung chat" },
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "warung_budget_pack",
    label: "Budget takeaway pack",
    description: "Grab food for later instead of letting the next hunger dip make bad decisions for you.",
    categories: ["restaurant"],
    venueIds: ["ulekan_berawa"],
    stationId: "warung",
    actionLabel: "Pack",
    outcomePreview: "Fast, cheap Energy plus a Nasi Bungkus for later.",
    stationReward: "Preps the next stretch without a long stop.",
    stationRisk: "Less Wellbeing than sitting down properly.",
    timeCost: 25,
    cost: 18,
    meterDeltas: { energy: 12, wellbeing: 4 },
    itemRewards: ["nasi_bungkus"],
    affinityBump: 1,
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "coworking_focus_sprint",
    label: "Coworking focus sprint",
    description: "Pay for structure, put the phone face down, and turn the room's seriousness into output.",
    categories: ["coworking"],
    venueIds: ["tropical_nomad_coworking_space", "outpost_canggu_coworking"],
    stationId: "coworking",
    actionLabel: "Sprint",
    outcomePreview: "Earns strong money and Focus; costs an entry fee and Energy.",
    stationReward: "Best focused earning option when Energy is high.",
    stationRisk: "Pricier and more draining than a cafe.",
    timeOfDayModifier: {
      label: "Core work block",
      startsAt: 10 * 60,
      endsAt: 16 * 60,
      meterMultiplier: 1.16,
      moneyMultiplier: 1.12
    },
    timeCost: 150,
    cost: -170,
    meterDeltas: { energy: -30, wellbeing: -7, focus: 22, social: -4 },
    affinityBump: 2,
    repeatable: true,
    requires: { minEnergy: 36, openHoursOnly: true }
  },
  {
    id: "coworking_accountability_chat",
    label: "Accountability chat",
    description: "Trade a little output for a useful conversation with someone else trying to make the day count.",
    categories: ["coworking"],
    venueIds: ["tropical_nomad_coworking_space", "outpost_canggu_coworking"],
    stationId: "coworking",
    actionLabel: "Network",
    outcomePreview: "Social and Focus with moderate Energy cost.",
    stationReward: "Connects productivity to future social hooks.",
    stationRisk: "Networking can eat the deep-work block.",
    timeCost: 75,
    cost: 45,
    meterDeltas: { energy: -12, wellbeing: 3, focus: 10, social: 14 },
    affinityBump: 3,
    reputationEffect: { delta: 1, reason: "Joined a coworking accountability chat" },
    repeatable: true,
    requires: { minEnergy: 20, openHoursOnly: true }
  },
  {
    id: "coworking_admin_reset",
    label: "Admin reset",
    description: "Handle invoices, messages, and the boring tabs that keep future-you from panicking.",
    categories: ["coworking"],
    venueIds: ["tropical_nomad_coworking_space", "outpost_canggu_coworking"],
    stationId: "coworking",
    actionLabel: "Admin",
    outcomePreview: "Focus and Wellbeing through order; no immediate cash.",
    stationReward: "Turns life clutter into usable Focus.",
    stationRisk: "Helpful, but not income.",
    timeCost: 60,
    cost: 25,
    meterDeltas: { energy: -8, wellbeing: 8, focus: 12, social: -2 },
    affinityBump: 1,
    repeatable: true,
    requires: { openHoursOnly: true }
  },
  {
    id: "home_sleep_until_morning",
    label: "Sleep until morning",
    description: "Close the day properly in your cheap kos instead of passing out wherever the loop leaves you.",
    categories: ["shop"],
    venueIds: ["cheap_kos"],
    stationId: "home",
    actionLabel: "Sleep",
    outcomePreview: "Ends the day, restores Energy, and applies any next-morning consequences.",
    stationReward: "The cleanest full recovery.",
    stationRisk: "Commits the rest of the night.",
    timeCost: 0,
    cost: 0,
    meterDeltas: {},
    repeatable: true
  },
  {
    id: "home_plan_tomorrow",
    label: "Plan tomorrow",
    description: "Make the room useful: list errands, count cash, and choose what kind of day this is becoming.",
    categories: ["shop"],
    venueIds: ["cheap_kos"],
    stationId: "home",
    actionLabel: "Plan",
    outcomePreview: "Small Focus and Wellbeing bump for a short time cost.",
    stationReward: "A low-risk setup action before heading back out.",
    stationRisk: "Preparation cannot replace doing the work.",
    timeOfDayModifier: {
      label: "Morning clarity",
      startsAt: 6 * 60,
      endsAt: 10 * 60,
      meterMultiplier: 1.2
    },
    timeCost: 30,
    cost: 0,
    meterDeltas: { energy: -3, wellbeing: 5, focus: 12 },
    repeatable: true
  },
  {
    id: "home_prep_snack",
    label: "Prep room snack",
    description: "Turn your tiny room into a practical base by packing something useful before the day pulls you out.",
    categories: ["shop"],
    venueIds: ["cheap_kos"],
    stationId: "home",
    actionLabel: "Prep",
    outcomePreview: "Costs time, gives a small Energy lift and a Nasi Bungkus.",
    stationReward: "A cheap buffer against bad meter timing.",
    stationRisk: "Small upside; not a replacement for a real meal.",
    timeCost: 25,
    cost: 0,
    meterDeltas: { energy: 8, wellbeing: 3 },
    itemRewards: ["nasi_bungkus"],
    repeatable: true
  }
];
