import type { GameEvent } from "../types";

export const gameEventDefinitions: GameEvent[] = [
  {
    id: "berawa_beach_run_morning",
    title: "Berawa Beach Run",
    type: "run",
    host: { type: "npc", id: "ari" },
    locationVenueId: "berawa_beach",
    schedule: { recurringDays: [1, 3, 5], startHour: 6.5, endHour: 8 },
    description: "A gentle sand-to-street run with regulars who know the morning tide and the good coconut cart.",
    participation: {
      timeCost: 75,
      cost: 0,
      meterDeltas: { energy: -18, wellbeing: 18, social: 10, focus: 4 },
      affinityBumps: [{ npcId: "ari", amount: 4 }],
      meetNpcs: ["ari"],
      reputationTag: "explorer"
    }
  },
  {
    id: "satu_satu_focus_meetup",
    title: "Deep Work Table",
    type: "coworking",
    host: { type: "venue", id: "satu_satu_coffee" },
    locationVenueId: "satu_satu_coffee",
    schedule: { recurringDays: [1, 2, 3, 4, 5], startHour: 9, endHour: 11 },
    description: "A quiet laptop table where people trade one useful intro, then actually work.",
    participation: {
      timeCost: 120,
      cost: 35,
      meterDeltas: { energy: -16, wellbeing: -4, focus: 18, social: 8 },
      affinityBumps: [
        { npcId: "made", amount: 2 },
        { npcId: "kadek", amount: 2 }
      ],
      meetNpcs: ["made", "kadek"],
      reputationTag: "reliable"
    }
  },
  {
    id: "milk_madu_brunch_social",
    title: "Brunch Builders Table",
    type: "meetup",
    host: { type: "venue", id: "milk_madu_berawa" },
    locationVenueId: "milk_madu_berawa",
    schedule: { recurringDays: [2, 4, 6], startHour: 11, endHour: 13 },
    description: "Founders, freelancers, and product people swapping current projects over brunch.",
    participation: {
      timeCost: 90,
      cost: 85,
      meterDeltas: { energy: 8, wellbeing: 8, focus: 4, social: 16 },
      affinityBumps: [{ npcId: "made", amount: 4 }],
      meetNpcs: ["made"],
      reputationTag: "social"
    }
  },
  {
    id: "canggu_station_market_hour",
    title: "Market Hour Walk",
    type: "market",
    host: { type: "npc", id: "ibu_sari" },
    locationVenueId: "canggu_station",
    schedule: { recurringDays: [1, 3, 6], startHour: 15, endHour: 17 },
    description: "A practical pantry walk: produce, small talk, and learning who stocks what before the rush.",
    participation: {
      timeCost: 75,
      cost: 45,
      meterDeltas: { energy: 8, wellbeing: 8, social: 8 },
      affinityBumps: [{ npcId: "ibu_sari", amount: 4 }],
      meetNpcs: ["ibu_sari"],
      reputationTag: "helpful",
      itemIds: ["pantry_bag"]
    }
  },
  {
    id: "finns_sunset_social",
    title: "FINNS Sunset Social",
    type: "party",
    host: { type: "venue", id: "finns_beach_club" },
    locationVenueId: "finns_beach_club",
    schedule: { recurringDays: [5, 6], startHour: 18, endHour: 21 },
    description: "A beach-club social that is useful if you have energy and ruinous if you pretend tomorrow does not exist.",
    participation: {
      timeCost: 150,
      cost: 210,
      meterDeltas: { energy: -34, wellbeing: 6, focus: -24, social: 28 },
      affinityBumps: [{ npcId: "ari", amount: 3 }],
      meetNpcs: ["ari"],
      reputationTag: "social"
    }
  },
  {
    id: "bungalow_home_base_intro",
    title: "Home Base Intro",
    type: "class",
    host: { type: "venue", id: "bungalow_living" },
    locationVenueId: "bungalow_living",
    schedule: { recurringDays: [2, 5], startHour: 14, endHour: 16 },
    description: "A small settling-in session about villa basics, quiet lanes, and making a temporary place feel lived in.",
    participation: {
      timeCost: 90,
      cost: 40,
      meterDeltas: { energy: -6, wellbeing: 14, social: 10 },
      affinityBumps: [{ npcId: "made", amount: 3 }],
      meetNpcs: ["made"],
      reputationTag: "venue_regular"
    }
  },
  {
    id: "berawa_run_crew_loop",
    title: "Run Crew Sunrise Loop",
    type: "run",
    host: { type: "group", id: "berawa_run_crew" },
    locationVenueId: "berawa_beach",
    visibility: { requiresJoinedGroupId: "berawa_run_crew" },
    schedule: { recurringDays: [2, 4], startHour: 6.25, endHour: 7.75 },
    description: "A members' loop from the beach edge back toward the cafe strip, easy pace, names remembered.",
    participation: {
      timeCost: 70,
      cost: 0,
      meterDeltas: { energy: -16, wellbeing: 16, social: 12, focus: 3 },
      affinityBumps: [
        { npcId: "ari", amount: 4 },
        { npcId: "kadek", amount: 2 }
      ],
      meetNpcs: ["ari", "kadek"],
      reputationTag: "reliable"
    }
  },
  {
    id: "focus_collective_sprint",
    title: "Focus Table Sprint",
    type: "coworking",
    host: { type: "group", id: "focus_table_collective" },
    locationVenueId: "satu_satu_coffee",
    visibility: { requiresJoinedGroupId: "focus_table_collective" },
    schedule: { recurringDays: [2, 4], startHour: 13, endHour: 15 },
    description: "A closed-table work sprint: quiet first hour, intro swap second hour.",
    participation: {
      timeCost: 120,
      cost: 45,
      meterDeltas: { energy: -18, wellbeing: -2, focus: 22, social: 8 },
      affinityBumps: [
        { npcId: "made", amount: 3 },
        { npcId: "kadek", amount: 3 }
      ],
      meetNpcs: ["made", "kadek"],
      reputationTag: "reliable"
    }
  },
  {
    id: "sunset_surf_check",
    title: "Sunset Tide Check",
    type: "meetup",
    host: { type: "group", id: "berawa_surf_circle" },
    locationVenueId: "berawa_beach",
    visibility: { requiresJoinedGroupId: "berawa_surf_circle" },
    schedule: { recurringDays: [3, 6], startHour: 16.5, endHour: 18 },
    description: "A small beach-circle check-in before sunset, half surf notes, half life notes.",
    participation: {
      timeCost: 80,
      cost: 0,
      meterDeltas: { energy: -8, wellbeing: 14, social: 14, focus: -2 },
      affinityBumps: [{ npcId: "ari", amount: 5 }],
      meetNpcs: ["ari"],
      reputationTag: "social"
    }
  }
];
