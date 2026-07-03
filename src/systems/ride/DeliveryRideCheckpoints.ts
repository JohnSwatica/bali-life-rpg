import { getDeliveryDefinition } from "../../data/deliveries";
import { venueMapNodes } from "../../data/authoredStreetLayout";

export interface RideCheckpointDefinition {
  id: string;
  deliveryId: string;
  minigameId: string;
  routeFraction: number;
  radius: number;
  arriveToast: string;
  outcomeToasts: { high: string; mid: string; low: string };
}

const RIDE_CHECKPOINTS: RideCheckpointDefinition[] = [
  {
    id: "first_baked_villa_delivery_traffic_gap",
    deliveryId: "first_baked_villa_delivery",
    minigameId: "ride_checkpoint_traffic_gap",
    routeFraction: 0.4,
    radius: 90,
    arriveToast: "A delivery truck noses out from a side lane ahead. Timing this keeps the pastries level.",
    outcomeToasts: {
      high: "You thread the gap with room to spare. Not bad for a borrowed scooter.",
      mid: "You squeeze through the gap, heart rate up a little.",
      low: "You brake hard and swerve -- the truck driver throws you a look, but you're through."
    }
  },
  {
    id: "first_baked_villa_delivery_corner",
    deliveryId: "first_baked_villa_delivery",
    minigameId: "ride_checkpoint_corner_lean",
    routeFraction: 0.75,
    radius: 90,
    arriveToast: "The lane narrows into a blind corner by Bungalow Living. Cargo shifts if you take it wrong.",
    outcomeToasts: {
      high: "Clean line through the corner. The pastry box doesn't even shift.",
      mid: "You take the corner a little wide but hold it together.",
      low: "The corner catches you rough -- you hear the box slide in the basket."
    }
  }
];

export function getRideCheckpointsForDelivery(deliveryId: string): RideCheckpointDefinition[] {
  return RIDE_CHECKPOINTS.filter((checkpoint) => checkpoint.deliveryId === deliveryId);
}

export function resolveRideCheckpointPosition(checkpoint: RideCheckpointDefinition): { x: number; y: number } | null {
  const delivery = getDeliveryDefinition(checkpoint.deliveryId);
  if (!delivery) {
    return null;
  }
  const pickupNode = venueMapNodes.find((node) => node.venueId === delivery.pickupVenueId);
  if (!pickupNode) {
    return null;
  }
  const t = checkpoint.routeFraction;
  return {
    x: pickupNode.x + (delivery.dropoffPoint.x - pickupNode.x) * t,
    y: pickupNode.y + (delivery.dropoffPoint.y - pickupNode.y) * t
  };
}

export function pickOutcomeToast(checkpoint: RideCheckpointDefinition, performanceScore: number): string {
  if (performanceScore >= 0.85) {
    return checkpoint.outcomeToasts.high;
  }
  if (performanceScore >= 0.5) {
    return checkpoint.outcomeToasts.mid;
  }
  return checkpoint.outcomeToasts.low;
}
