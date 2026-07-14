import type { OpportunityTemplate } from "../types";

/**
 * Workstream A keeps the opportunity engine available for authored story and
 * goal consumers, but stops the generic menu-errand pool from repopulating the
 * phone. Definitions stay below so legacy saves can still hydrate safely and
 * cut ideas can be restaged as real scenes later.
 */
export const generatedOpportunityTemplateIds: ReadonlySet<string> = new Set([
  "no_questions_package",
  "focus_table_client_referral",
  "run_crew_breakfast_shift",
  "brunch_builders_paid_intro",
  "surf_circle_board_repair",
  "sari_warung_seed_errand"
]);

export function isOpportunityTemplateGenerationEnabled(templateId: string): boolean {
  return generatedOpportunityTemplateIds.has(templateId);
}

export const opportunityTemplates: OpportunityTemplate[] = [
  {
    id: "milk_madu_lunch_rush_shift",
    type: "gig",
    title: "Lunch rush barista @ Milk & Madu",
    blurb: "Made says the brunch line is chaos and one extra pair of hands would earn quick cash.",
    trigger: { timeWindow: { startHour: 10.5, endHour: 13.5 }, venueIds: ["milk_madu_berawa"] },
    locationVenueId: "milk_madu_berawa",
    durationMin: 95,
    timeCostMin: 70,
    reward: {
      money: 95,
      meterDeltas: { energy: -18, wellbeing: -4, focus: 6, social: 5 },
      affinityBumps: [{ npcId: "made", amount: 3 }],
      reputation: { delta: 2, tag: "reliable", reason: "Handled a lunch rush gig" }
    },
    chainTo: "milk_madu_after_shift_intro",
    weight: 8,
    cooldownMin: 720
  },
  {
    id: "milk_madu_after_shift_intro",
    type: "social",
    title: "After-shift founder intro",
    blurb: "A regular saw you helping and wants to swap projects over a quick table chat.",
    trigger: { venueIds: ["milk_madu_berawa"] },
    locationVenueId: "milk_madu_berawa",
    durationMin: 80,
    timeCostMin: 45,
    reward: {
      meterDeltas: { energy: -6, focus: 5, social: 14, wellbeing: 5 },
      affinityBumps: [{ npcId: "made", amount: 2 }],
      reputation: { delta: 1, tag: "social", reason: "Followed up on a useful local intro" }
    },
    weight: 3,
    cooldownMin: 1440
  },
  {
    id: "satu_satu_receipt_sort",
    type: "gig",
    title: "Receipt sort sprint @ Satu-Satu",
    blurb: "A quiet admin sprint for coffee money. Not glamorous, very Berawa.",
    trigger: { timeWindow: { startHour: 8.5, endHour: 11.5 }, venueIds: ["satu_satu_coffee"] },
    locationVenueId: "satu_satu_coffee",
    durationMin: 110,
    timeCostMin: 60,
    reward: {
      money: 70,
      meterDeltas: { energy: -14, wellbeing: -3, focus: 12, social: -2 },
      affinityBumps: [{ npcId: "kadek", amount: 2 }],
      reputation: { delta: 1, tag: "reliable", reason: "Did a clean focus sprint for a cafe" }
    },
    weight: 7,
    cooldownMin: 600
  },
  {
    id: "finns_trusted_runner",
    type: "gig",
    title: "Trusted errand @ FINNS",
    blurb: "A better-paid beach-club errand only appears once people know you show up.",
    trigger: { timeWindow: { startHour: 16, endHour: 19.5 }, minReputation: 70, venueIds: ["finns_beach_club"] },
    locationVenueId: "finns_beach_club",
    durationMin: 75,
    timeCostMin: 50,
    reward: {
      money: 155,
      meterDeltas: { energy: -16, focus: 4, social: 8 },
      affinityBumps: [{ npcId: "ari", amount: 2 }],
      reputation: { delta: 3, tag: "venue_regular", reason: "Completed a higher-trust FINNS errand" }
    },
    weight: 4,
    cooldownMin: 1440
  },
  {
    id: "ari_sunset_ping",
    type: "social",
    title: "Ari: sunset beach check?",
    blurb: "Ari texts that the beach crowd is friendly tonight and asks if you are coming.",
    trigger: {
      timeWindow: { startHour: 16.5, endHour: 18.5 },
      venueIds: ["berawa_beach"],
      requiresAffinity: { npcId: "ari", tier: "acquaintance" }
    },
    locationVenueId: "berawa_beach",
    durationMin: 90,
    timeCostMin: 55,
    reward: {
      meterDeltas: { energy: -8, wellbeing: 12, focus: -2, social: 18 },
      affinityBumps: [{ npcId: "ari", amount: 4 }],
      reputation: { delta: 1, tag: "social", reason: "Showed up for a friend's beach ping" }
    },
    weight: 6,
    cooldownMin: 720
  },
  {
    id: "run_crew_open_slot",
    type: "social",
    title: "Run crew open slot",
    blurb: "The Berawa Run Crew has one spare loop spot before breakfast.",
    trigger: {
      timeWindow: { startHour: 6, endHour: 8 },
      venueIds: ["berawa_beach"],
      requiresClubId: "berawa_run_crew"
    },
    locationVenueId: "berawa_beach",
    durationMin: 70,
    timeCostMin: 50,
    reward: {
      meterDeltas: { energy: -14, wellbeing: 14, focus: 3, social: 12 },
      affinityBumps: [
        { npcId: "ari", amount: 3 },
        { npcId: "kadek", amount: 2 }
      ],
      reputation: { delta: 2, tag: "reliable", reason: "Kept pace with the run crew" }
    },
    weight: 5,
    cooldownMin: 720
  },
  {
    id: "canggu_station_dropped_cart",
    type: "help_out",
    title: "Dropped grocery cart",
    blurb: "Ibu Sari needs a quick hand before the produce aisle jams up.",
    trigger: { timeWindow: { startHour: 13, endHour: 17 }, venueIds: ["canggu_station"] },
    locationVenueId: "canggu_station",
    durationMin: 70,
    timeCostMin: 30,
    reward: {
      money: 25,
      meterDeltas: { energy: -8, wellbeing: 4, social: 5 },
      affinityBumps: [{ npcId: "ibu_sari", amount: 4 }],
      items: [{ itemId: "pantry_bag", quantity: 1 }],
      reputation: { delta: 2, tag: "helpful", reason: "Helped with a local grocery mishap" }
    },
    weight: 7,
    cooldownMin: 720
  },
  {
    id: "lost_scooter_key_help",
    type: "help_out",
    title: "Lost scooter key panic",
    blurb: "Someone at the rental desk is retracing their whole morning. Calm help beats drama.",
    trigger: { timeWindow: { startHour: 9, endHour: 18 }, venueIds: ["bali_family_rental_scooter"] },
    locationVenueId: "bali_family_rental_scooter",
    durationMin: 80,
    timeCostMin: 35,
    reward: {
      money: 35,
      meterDeltas: { energy: -7, wellbeing: 4, social: 4 },
      items: [{ itemId: "safety_card", quantity: 1 }],
      reputation: { delta: 2, tag: "helpful", reason: "Helped a rider avoid a bad scooter day" }
    },
    weight: 6,
    cooldownMin: 720
  },
  {
    id: "no_questions_package",
    type: "gig",
    title: "The No-Questions Package",
    blurb:
      "No name on it, no manifest, just an address and cash on delivery. The guy handing it over won't meet your eyes. You don't have to take it.",
    trigger: { maxMoney: 40, minCompletedDeliveryCount: 3 },
    locationVenueId: "bali_family_rental_scooter",
    durationMin: 240,
    timeCostMin: 55,
    reward: {
      money: 180,
      meterDeltas: { energy: -10, wellbeing: -6 },
      reputation: { delta: -3, reason: "Took the no-questions package" },
      axisImpact: { rooted: -15, reason: "Took the no-questions package" }
    },
    declineReward: {
      reputation: { delta: 3, tag: "reliable", reason: "Let the no-questions package expire and stayed clean" },
      axisImpact: { rooted: 10, reason: "Let the no-questions package expire and stayed clean" }
    },
    weight: 1,
    cooldownMin: 999999
  },
  {
    id: "baked_croissant_flash",
    type: "flash_deal",
    title: "Flash tray @ BAKED",
    blurb: "BAKED has a tiny not-live, local-only simulated tray deal before the pastry case resets.",
    trigger: { timeWindow: { startHour: 7.5, endHour: 10 }, venueIds: ["baked_berawa"] },
    locationVenueId: "baked_berawa",
    durationMin: 55,
    timeCostMin: 20,
    reward: {
      money: -18,
      meterDeltas: { energy: 8, wellbeing: 6, focus: 3 },
      affinityBumps: [{ npcId: "kadek", amount: 1 }],
      items: [{ itemId: "butter_croissant", quantity: 1 }]
    },
    weight: 7,
    cooldownMin: 480
  },
  {
    id: "finns_coconut_cooldown",
    type: "flash_deal",
    title: "Simulated coconut cooldown",
    blurb: "A beach-club promo placeholder: cheap coconuts for the next little window. No real coupon.",
    trigger: { timeWindow: { startHour: 14, endHour: 17 }, venueIds: ["finns_beach_club"] },
    locationVenueId: "finns_beach_club",
    durationMin: 60,
    timeCostMin: 20,
    reward: {
      money: -14,
      meterDeltas: { energy: 6, wellbeing: 7, social: 2 },
      items: [{ itemId: "coconut", quantity: 1 }]
    },
    weight: 5,
    cooldownMin: 480
  },
  {
    id: "bungalow_room_whisper",
    type: "rumor",
    title: "Home lead whisper",
    blurb: "Made heard a soft housing lead, but only shares the context with people she trusts.",
    trigger: {
      timeWindow: { startHour: 12, endHour: 16 },
      venueIds: ["bungalow_living"],
      requiresAffinity: { npcId: "made", tier: "friendly" }
    },
    locationVenueId: "bungalow_living",
    durationMin: 120,
    timeCostMin: 35,
    reward: {
      meterDeltas: { energy: -4, wellbeing: 8, social: 8 },
      affinityBumps: [{ npcId: "made", amount: 4 }],
      reputation: { delta: 1, tag: "explorer", reason: "Followed a local housing rumor carefully" }
    },
    weight: 4,
    cooldownMin: 1440
  },
  {
    id: "beach_tide_tip",
    type: "rumor",
    title: "Tide tip on the sand",
    blurb: "A beach regular points out the safer sunset route if you arrive before the light changes.",
    trigger: { timeWindow: { startHour: 15.5, endHour: 18 }, venueIds: ["berawa_beach"] },
    locationVenueId: "berawa_beach",
    durationMin: 80,
    timeCostMin: 25,
    reward: {
      meterDeltas: { energy: -4, wellbeing: 8, social: 5 },
      affinityBumps: [{ npcId: "ari", amount: 2 }],
      reputation: { delta: 1, tag: "explorer", reason: "Learned a useful local tide route" }
    },
    weight: 6,
    cooldownMin: 720
  },
  {
    id: "swap_coconut_for_coffee",
    type: "trade",
    title: "Trade coconut for coffee",
    blurb: "A cafe regular wants a beach coconut and has a spare kopi in return.",
    trigger: { timeWindow: { startHour: 10, endHour: 15 }, venueIds: ["satu_satu_coffee"] },
    locationVenueId: "satu_satu_coffee",
    durationMin: 90,
    timeCostMin: 25,
    reward: {
      meterDeltas: { energy: 5, focus: 5, social: 5 },
      items: [{ itemId: "kopi_bali", quantity: 1 }],
      reputation: { delta: 1, tag: "social", reason: "Made a small neighborly trade" }
    },
    weight: 5,
    cooldownMin: 600
  },
  {
    id: "surf_wax_intro_trade",
    type: "trade",
    title: "Surf wax for an intro",
    blurb: "Someone forgot wax before a tide check. Help now, gain a softer door into the beach crowd.",
    trigger: {
      timeWindow: { startHour: 6.5, endHour: 9.5 },
      venueIds: ["berawa_beach"],
      requiresClubId: "berawa_surf_circle"
    },
    locationVenueId: "berawa_beach",
    durationMin: 75,
    timeCostMin: 30,
    reward: {
      meterDeltas: { energy: -4, wellbeing: 7, social: 11 },
      affinityBumps: [{ npcId: "ari", amount: 3 }],
      reputation: { delta: 2, tag: "community_contributor", reason: "Helped the surf circle with a practical trade" }
    },
    weight: 4,
    cooldownMin: 720
  },
  {
    id: "focus_table_client_referral",
    type: "gig",
    title: "Warm client intro @ Satu-Satu",
    blurb: "The focus table trusts you enough to pass along a tiny paid fix-it brief. Low drama, better money.",
    trigger: {
      timeWindow: { startHour: 13, endHour: 16 },
      venueIds: ["satu_satu_coffee"],
      requiresClubId: "focus_table_collective",
      minReputation: 55
    },
    locationVenueId: "satu_satu_coffee",
    durationMin: 95,
    timeCostMin: 70,
    reward: {
      money: 145,
      meterDeltas: { energy: -16, wellbeing: -2, focus: 14, social: 8 },
      affinityBumps: [
        { npcId: "made", amount: 3 },
        { npcId: "kadek", amount: 2 }
      ],
      reputation: { delta: 3, tag: "reliable", reason: "Handled a warm client referral from the focus table" }
    },
    weight: 9,
    cooldownMin: 1440
  },
  {
    id: "run_crew_breakfast_shift",
    type: "gig",
    title: "Run crew breakfast shift",
    blurb: "The run crew needs one reliable hand to help steer post-loop breakfast chaos into paid work.",
    trigger: {
      timeWindow: { startHour: 8, endHour: 10.5 },
      venueIds: ["milk_madu_berawa"],
      requiresClubId: "berawa_run_crew",
      minReputation: 60
    },
    locationVenueId: "milk_madu_berawa",
    durationMin: 85,
    timeCostMin: 60,
    reward: {
      money: 135,
      meterDeltas: { energy: -14, wellbeing: 4, focus: 5, social: 12 },
      affinityBumps: [
        { npcId: "ari", amount: 3 },
        { npcId: "kadek", amount: 3 }
      ],
      reputation: { delta: 2, tag: "reliable", reason: "Turned run crew trust into a paid breakfast shift" }
    },
    weight: 9,
    cooldownMin: 1440
  },
  {
    id: "brunch_builders_paid_intro",
    type: "gig",
    title: "Paid founder intro @ Milk & Madu",
    blurb: "A brunch-table regular needs a tiny ops fix and would rather pay someone the group already knows.",
    trigger: {
      timeWindow: { startHour: 11, endHour: 14 },
      venueIds: ["milk_madu_berawa"],
      requiresClubId: "brunch_builders_table",
      minReputation: 62
    },
    locationVenueId: "milk_madu_berawa",
    durationMin: 100,
    timeCostMin: 70,
    reward: {
      money: 175,
      meterDeltas: { energy: -16, wellbeing: 2, focus: 12, social: 10 },
      affinityBumps: [{ npcId: "made", amount: 4 }],
      reputation: { delta: 3, tag: "social", reason: "Converted brunch-builder trust into useful paid work" }
    },
    weight: 8,
    cooldownMin: 1440
  },
  {
    id: "surf_circle_board_repair",
    type: "help_out",
    title: "Surf circle board patch",
    blurb: "Ari's circle has a dinged board and a tiny thank-you budget. Practical help buys beach trust.",
    trigger: {
      timeWindow: { startHour: 15, endHour: 18 },
      venueIds: ["berawa_beach"],
      requiresClubId: "berawa_surf_circle",
      requiresAffinity: { npcId: "ari", tier: "friendly" }
    },
    locationVenueId: "berawa_beach",
    durationMin: 90,
    timeCostMin: 45,
    reward: {
      money: 90,
      meterDeltas: { energy: -10, wellbeing: 8, focus: 5, social: 12 },
      affinityBumps: [{ npcId: "ari", amount: 5 }],
      reputation: { delta: 2, tag: "community_contributor", reason: "Helped the surf circle solve a real problem" }
    },
    weight: 8,
    cooldownMin: 1440
  },
  {
    id: "sari_warung_seed_errand",
    type: "rumor",
    title: "Ibu Sari's warung numbers",
    blurb: "Ibu Sari lets you help with a small stock-and-margin errand, the first real hint of running your own spot someday.",
    trigger: {
      timeWindow: { startHour: 14, endHour: 17 },
      venueIds: ["canggu_station"],
      minReputation: 65,
      requiresAffinity: { npcId: "ibu_sari", tier: "friendly" }
    },
    locationVenueId: "canggu_station",
    durationMin: 120,
    timeCostMin: 55,
    reward: {
      money: 80,
      meterDeltas: { energy: -8, wellbeing: 8, focus: 12, social: 6 },
      affinityBumps: [{ npcId: "ibu_sari", amount: 5 }],
      reputation: { delta: 2, tag: "local_trusted", reason: "Helped Ibu Sari think through warung stock basics" }
    },
    weight: 3,
    cooldownMin: 2880
  }
];
