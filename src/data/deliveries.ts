import { offsetVenuePoint } from "./layoutLookup";
import type { Meter, ReputationTag } from "../types";

export interface DeliveryCondition {
  id: string;
  label: string;
  description: string;
  payoutBonus?: number;
  timeLimitDeltaMin?: number;
  meterDeltas?: Partial<Record<Meter, number>>;
  ratingModifier?: number;
}

export interface DeliveryDefinition {
  id: string;
  title: string;
  description: string;
  pickupVenueId: string;
  pickupLabel: string;
  dropoffId: string;
  dropoffName: string;
  dropoffLabel: string;
  dropoffPoint: { x: number; y: number; radius: number };
  itemId: string;
  timeLimitMin: number;
  payout: number;
  meterDeltas: Partial<Record<Meter, number>>;
  affinityBumps?: { npcId: string; amount: number }[];
  reputation?: { delta?: number; tag?: ReputationTag; reason: string };
  ratingWeight: number;
  tutorialDelivery?: boolean;
  boardAvailable?: boolean;
  repeatable?: boolean;
  minDriverRating?: number;
  minCompletedDeliveries?: number;
  conditions?: DeliveryCondition[];
}

export const deliveryDefinitions: DeliveryDefinition[] = [
  {
    id: "first_baked_villa_delivery",
    title: "First BAKED villa drop",
    description: "Ibu Sari's starter gig: collect pastries at BAKED and take them to a villa down the lane.",
    pickupVenueId: "baked_berawa",
    pickupLabel: "Pick up sealed pastries at BAKED.",
    dropoffId: "intro_villa_lane",
    dropoffName: "Villa Lane Dropoff",
    dropoffLabel: "Drop the pastry box at the villa gate.",
    dropoffPoint: {
      ...offsetVenuePoint("bungalow_living", { x: 1500, y: 640 }, -160, -112),
      radius: 78
    },
    itemId: "delivery_pastry_box",
    timeLimitMin: 90,
    payout: 145,
    meterDeltas: { energy: -12, wellbeing: 4, focus: 4, social: 2 },
    affinityBumps: [
      { npcId: "ibu_sari", amount: 3 },
      { npcId: "kadek", amount: 2 }
    ],
    reputation: { delta: 2, tag: "reliable", reason: "Completed the first BAKED villa delivery" },
    ratingWeight: 1,
    tutorialDelivery: true,
    boardAvailable: false,
    repeatable: false
  },
  {
    id: "milk_madu_brunch_bag",
    title: "Brunch bag to the upper lane",
    description: "A compact Act 1 delivery from Milk & Madu to a hungry villa crew.",
    pickupVenueId: "milk_madu_berawa",
    pickupLabel: "Pick up the brunch bag at Milk & Madu.",
    dropoffId: "upper_lane_villa",
    dropoffName: "Upper Lane Villa",
    dropoffLabel: "Drop the brunch bag by the villa gate.",
    dropoffPoint: {
      ...offsetVenuePoint("finns_recreation_club", { x: 1660, y: 360 }, -210, 92),
      radius: 78
    },
    itemId: "pantry_bag",
    timeLimitMin: 75,
    payout: 105,
    meterDeltas: { energy: -10, focus: 3, social: 1 },
    affinityBumps: [{ npcId: "made", amount: 1 }],
    reputation: { delta: 1, tag: "reliable", reason: "Completed a brunch delivery" },
    ratingWeight: 0.6,
    boardAvailable: true,
    repeatable: true,
    minDriverRating: 3.2,
    minCompletedDeliveries: 1,
    conditions: [
      {
        id: "villa_tip",
        label: "Villa tip",
        description: "The villa crew promises a little extra if the brunch bag arrives warm.",
        payoutBonus: 18,
        meterDeltas: { social: 1 },
        ratingModifier: 0.1
      },
      {
        id: "rush_hour",
        label: "Rush hour",
        description: "Lunch traffic is thick, but the app is paying surge money.",
        payoutBonus: 30,
        timeLimitDeltaMin: -10,
        meterDeltas: { energy: -3, focus: 2 },
        ratingModifier: -0.1
      }
    ]
  },
  {
    id: "satu_satu_invoice_pouch",
    title: "Satu-Satu invoice pouch",
    description: "A quiet paperwork run from Satu-Satu to the rental desk. Easy money if you ride clean.",
    pickupVenueId: "satu_satu_coffee",
    pickupLabel: "Pick up the invoice pouch at Satu-Satu.",
    dropoffId: "scooter_rental_counter",
    dropoffName: "Scooter Rental Counter",
    dropoffLabel: "Hand the invoice pouch to the rental counter.",
    dropoffPoint: {
      ...offsetVenuePoint("bali_family_rental_scooter", { x: 1720, y: 410 }, -72, 74),
      radius: 76
    },
    itemId: "invoice_pouch",
    timeLimitMin: 70,
    payout: 120,
    meterDeltas: { energy: -9, focus: 5, social: 2 },
    affinityBumps: [{ npcId: "kadek", amount: 2 }],
    reputation: { delta: 1, tag: "reliable", reason: "Completed a clean invoice delivery" },
    ratingWeight: 0.75,
    boardAvailable: true,
    repeatable: true,
    minDriverRating: 3.5,
    minCompletedDeliveries: 1,
    conditions: [
      {
        id: "clean_papers",
        label: "Clean papers",
        description: "Everything is already signed. Easy if you keep it dry and uncrumpled.",
        payoutBonus: 12,
        meterDeltas: { focus: 1 },
        ratingModifier: 0.15
      },
      {
        id: "rain_window",
        label: "Rain window",
        description: "A short wet-season gap makes this a now-or-never paperwork run.",
        payoutBonus: 28,
        timeLimitDeltaMin: -8,
        meterDeltas: { energy: -4, wellbeing: -1, focus: 2 },
        ratingModifier: -0.05
      }
    ]
  },
  {
    id: "finns_linen_bundle",
    title: "FINNS linen bundle",
    description: "A higher-trust run toward the beach end. Better payout, less room for sloppy riding.",
    pickupVenueId: "finns_recreation_club",
    pickupLabel: "Pick up the linen bundle at FINNS Rec.",
    dropoffId: "beach_club_service_gate",
    dropoffName: "Beach Club Service Gate",
    dropoffLabel: "Drop the linen bundle at the beach-club service gate.",
    dropoffPoint: {
      ...offsetVenuePoint("finns_beach_club", { x: 1120, y: 1680 }, 96, -82),
      radius: 82
    },
    itemId: "linen_bundle",
    timeLimitMin: 85,
    payout: 185,
    meterDeltas: { energy: -16, wellbeing: 2, focus: 6, social: 3 },
    affinityBumps: [{ npcId: "ari", amount: 2 }],
    reputation: { delta: 2, tag: "venue_regular", reason: "Completed a higher-trust FINNS delivery" },
    ratingWeight: 1,
    boardAvailable: true,
    repeatable: true,
    minDriverRating: 4.1,
    minCompletedDeliveries: 3,
    conditions: [
      {
        id: "fragile_stack",
        label: "Fragile stack",
        description: "The bundle is awkwardly packed. Smooth riding matters.",
        payoutBonus: 45,
        timeLimitDeltaMin: -12,
        meterDeltas: { energy: -4, focus: 3 },
        ratingModifier: -0.2
      },
      {
        id: "service_gate_priority",
        label: "Service gate priority",
        description: "Security is expecting you, and a clean drop earns better trust.",
        payoutBonus: 24,
        meterDeltas: { social: 1, focus: 1 },
        ratingModifier: 0.1
      }
    ]
  }
];

export function getDeliveryDefinition(deliveryId: string): DeliveryDefinition | undefined {
  return deliveryDefinitions.find((delivery) => delivery.id === deliveryId);
}

export function getDeliveryCondition(delivery: DeliveryDefinition, conditionId: string | undefined): DeliveryCondition | undefined {
  if (!conditionId) {
    return undefined;
  }
  return delivery.conditions?.find((condition) => condition.id === conditionId);
}
