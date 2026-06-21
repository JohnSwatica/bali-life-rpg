import type { InterestGroupDefinition, VenueActivityDefinition } from "../types";
import { scaleDistance, scalePoint } from "../systems/map/WorldScale";

function activityPoint(x: number, y: number): { x: number; y: number } {
  return scalePoint({ x, y });
}

export const interestGroupDefinitions: Record<string, InterestGroupDefinition> = {
  berawa_deep_work: {
    id: "berawa_deep_work",
    name: "Berawa Deep Work Table",
    venueName: "Satu-Satu Coffee Company",
    hook: "Laptop people who actually want quiet focus before they socialize.",
    vibe: "calm, early, plug-aware",
    meetingRhythm: "Weekday mornings",
    tags: ["remote work", "focus", "coffee"]
  },
  brunch_builders: {
    id: "brunch_builders",
    name: "Brunch Builders",
    venueName: "Milk & Madu Berawa",
    hook: "Founders, freelancers, and product people trading notes over brunch.",
    vibe: "chatty, optimistic, practical",
    meetingRhythm: "Late mornings and Sunday pizza nights",
    tags: ["founders", "freelance", "food"]
  },
  berawa_sweat_social: {
    id: "berawa_sweat_social",
    name: "Berawa Sweat Social",
    venueName: "FINNS Club Area",
    hook: "Gym-class, padel, recovery, and post-workout coffee people.",
    vibe: "high-energy, friendly, routine-driven",
    meetingRhythm: "Morning and sunset sessions",
    tags: ["fitness", "padel", "wellness"]
  },
  sunset_table: {
    id: "sunset_table",
    name: "Sunset Table",
    venueName: "FINNS / Atlas Beach Club Stretch",
    hook: "A softer way into the beach club scene: one drink, real intros, sunset exit optional.",
    vibe: "social, golden-hour, low-pressure",
    meetingRhythm: "Evenings near sunset",
    tags: ["beach club", "music", "new friends"]
  },
  berawa_home_base: {
    id: "berawa_home_base",
    name: "Berawa Home Base",
    venueName: "Bungalow Living Bali",
    hook: "People making Bali feel less temporary through homeware, routines, and neighborhood tips.",
    vibe: "grounded, aesthetic, generous",
    meetingRhythm: "Afternoons",
    tags: ["settling in", "home", "local tips"]
  },
  bakery_warmups: {
    id: "bakery_warmups",
    name: "Bakery Warmups",
    venueName: "BAKED. Berawa",
    hook: "Quick pastry meetups before work, surf, or gym.",
    vibe: "brief, warm, easy to join",
    meetingRhythm: "Early mornings",
    tags: ["coffee", "breakfast", "casual"]
  },
  berawa_neighbor_care: {
    id: "berawa_neighbor_care",
    name: "Berawa Neighbor Care",
    venueName: "Beach / banjar lanes",
    hook: "A lightweight way to repair trust: clean the beach, help a morning sweep, and ride more carefully.",
    vibe: "practical, respectful, low-drama",
    meetingRhythm: "Mornings and late afternoons",
    tags: ["local life", "cleanup", "repair"]
  }
};

export const activityDefinitions: VenueActivityDefinition[] = [
  {
    id: "satu_satu_focus",
    venueName: "Satu-Satu Coffee Company",
    ...activityPoint(1768, 365),
    radius: scaleDistance(130),
    title: "Two-Hour Deep Work Table",
    description: "Claim a quiet table, order coffee, and exchange one useful contact before opening the laptop.",
    schedule: "08:00-11:00",
    tags: ["remote work", "coffee", "focus"],
    moneyCost: 20,
    focusReward: 25,
    socialEnergyDelta: -8,
    connectionReward: 1,
    rewardItems: [{ itemId: "coffee_beans", quantity: 1 }],
    groupId: "berawa_deep_work"
  },
  {
    id: "milk_madu_brunch_build",
    venueName: "Milk & Madu Berawa",
    ...activityPoint(1190, 610),
    radius: scaleDistance(115),
    title: "Brunch & Build Notes",
    description: "Share what you are building, hear two blunt-but-kind suggestions, and leave with a next step.",
    schedule: "10:30-13:00",
    tags: ["founders", "freelance", "food"],
    moneyCost: 38,
    focusReward: 8,
    socialEnergyDelta: -12,
    connectionReward: 2,
    rewardItems: [{ itemId: "brunch_slice", quantity: 1 }],
    groupId: "brunch_builders"
  },
  {
    id: "baked_warmup",
    venueName: "BAKED. Berawa",
    ...activityPoint(675, 465),
    radius: scaleDistance(105),
    title: "Pastry Warmup Chat",
    description: "A ten-minute table conversation: where are you working from today, and what are you avoiding?",
    schedule: "07:30-09:30",
    tags: ["coffee", "breakfast", "casual"],
    moneyCost: 32,
    focusReward: 10,
    socialEnergyDelta: 4,
    connectionReward: 1,
    rewardItems: [{ itemId: "butter_croissant", quantity: 1 }],
    groupId: "bakery_warmups"
  },
  {
    id: "finns_sweat_social",
    venueName: "FINNS Club Area",
    ...activityPoint(1768, 300),
    radius: scaleDistance(150),
    title: "Sweat Social Check-In",
    description: "Join a gym-class/padel-style circuit, then cool down with the people who also showed up half-awake.",
    schedule: "06:30-09:00 / 17:00-19:00",
    tags: ["fitness", "padel", "wellness"],
    moneyCost: 55,
    focusReward: 12,
    socialEnergyDelta: -18,
    connectionReward: 2,
    rewardItems: [{ itemId: "padel_wristband", quantity: 1 }],
    groupId: "berawa_sweat_social"
  },
  {
    id: "beachclub_sunset_table",
    venueName: "FINNS / Atlas Beach Club Stretch",
    ...activityPoint(585, 1225),
    radius: scaleDistance(145),
    title: "Sunset Table",
    description: "Meet near the beach club glow, make one sincere intro, and decide whether tonight is loud or early.",
    schedule: "17:30-20:00",
    tags: ["beach club", "music", "new friends"],
    moneyCost: 45,
    focusReward: -5,
    socialEnergyDelta: -20,
    connectionReward: 3,
    rewardItems: [{ itemId: "surf_sticker", quantity: 1 }],
    groupId: "sunset_table"
  },
  {
    id: "bungalow_home_base",
    venueName: "Bungalow Living Bali",
    ...activityPoint(1510, 820),
    radius: scaleDistance(120),
    title: "Home Base Moodboard",
    description: "Swap villa setup tips, quiet-lane recommendations, and the small rituals that make Berawa feel livable.",
    schedule: "14:00-16:30",
    tags: ["settling in", "home", "local tips"],
    moneyCost: 15,
    focusReward: 6,
    socialEnergyDelta: 8,
    connectionReward: 1,
    rewardItems: [{ itemId: "home_cushion", quantity: 1 }],
    groupId: "berawa_home_base"
  },
  {
    id: "berawa_beach_cleanup",
    venueName: "Berawa Beach",
    ...activityPoint(350, 1245),
    radius: scaleDistance(150),
    title: "Berawa Beach Cleanup",
    description: "Fill a bag along the sand line, greet the regulars, and leave the beach a little better than you found it.",
    schedule: "07:00-09:00 / 16:30-18:00",
    tags: ["local life", "cleanup", "repair"],
    moneyCost: 0,
    focusReward: 4,
    socialEnergyDelta: 6,
    connectionReward: 1,
    reputationReward: 14,
    wantedReduction: 1,
    bountyReduction: 30,
    safetyReward: 4,
    isRedemption: true,
    rewardItems: [{ itemId: "cleanup_bag", quantity: 1 }],
    groupId: "berawa_neighbor_care"
  },
  {
    id: "banjar_morning_sweep",
    venueName: "Berawa Villa Lane",
    ...activityPoint(365, 520),
    radius: scaleDistance(135),
    title: "Morning Lane Sweep",
    description: "Help the neighborhood sweep leaves, move bins, and make space around small offerings before traffic builds.",
    schedule: "06:30-08:30",
    tags: ["local life", "neighbors", "repair"],
    moneyCost: 0,
    focusReward: 8,
    socialEnergyDelta: -4,
    connectionReward: 1,
    reputationReward: 18,
    wantedReduction: 1,
    bountyReduction: 45,
    safetyReward: 6,
    isRedemption: true,
    rewardItems: [{ itemId: "banjar_thanks_note", quantity: 1 }],
    groupId: "berawa_neighbor_care"
  },
  {
    id: "scooter_safety_reset",
    venueName: "Bali Family Rental Scooter",
    ...activityPoint(820, 735),
    radius: scaleDistance(105),
    title: "Scooter Safety Reset",
    description: "Check the brakes, talk through narrow-lane etiquette, and reset your pace before riding again.",
    schedule: "Anytime before sunset",
    tags: ["scooter", "safety", "repair"],
    moneyCost: 12,
    focusReward: 5,
    socialEnergyDelta: 0,
    connectionReward: 0,
    reputationReward: 10,
    wantedReduction: 1,
    bountyReduction: 25,
    safetyReward: 20,
    isRedemption: true,
    rewardItems: [{ itemId: "safety_card", quantity: 1 }],
    groupId: "berawa_neighbor_care"
  }
];
