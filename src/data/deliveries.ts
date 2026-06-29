import { offsetVenuePoint } from "./layoutLookup";
import type { Meter, ReputationTag } from "../types";

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
    tutorialDelivery: true
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
    ratingWeight: 0.6
  }
];

export function getDeliveryDefinition(deliveryId: string): DeliveryDefinition | undefined {
  return deliveryDefinitions.find((delivery) => delivery.id === deliveryId);
}
