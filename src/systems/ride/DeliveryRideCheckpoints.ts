import { getDeliveryDefinition } from "../../data/deliveries";
import { venueMapNodes } from "../../data/authoredStreetLayout";

export interface RideCheckpointDefinition {
  id: string;
  deliveryId: string;
  conditionIds?: string[];
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
  },
  {
    id: "milk_madu_brunch_warm_corner",
    deliveryId: "milk_madu_brunch_bag",
    minigameId: "ride_checkpoint_corner_lean",
    routeFraction: 0.58,
    radius: 88,
    arriveToast: "The brunch bag shifts as the lane curves. A smooth lean keeps it warm and upright.",
    outcomeToasts: {
      high: "You float through the curve and the bag stays perfectly settled.",
      mid: "The bag bumps once, but the handoff will still read clean.",
      low: "The corner rattles the bag hard. Nothing spills, but it was not elegant."
    }
  },
  {
    id: "satu_satu_invoice_pothole",
    deliveryId: "satu_satu_invoice_pouch",
    minigameId: "ride_checkpoint_pothole",
    routeFraction: 0.52,
    radius: 88,
    arriveToast: "A broken strip of asphalt appears ahead. Keep the invoice pouch from crumpling.",
    outcomeToasts: {
      high: "You dodge the rough patch and the papers stay crisp.",
      mid: "You skim the pothole, but the pouch survives.",
      low: "The pothole kicks the scooter sideways. The paperwork is still there, barely tidy."
    }
  },
  {
    id: "satu_satu_invoice_rain_slick",
    deliveryId: "satu_satu_invoice_pouch",
    conditionIds: ["rain_window"],
    minigameId: "ride_checkpoint_rain_slick",
    routeFraction: 0.72,
    radius: 88,
    arriveToast: "Rainwater beads across the painted line. Brake too late and the pouch gets a shower.",
    outcomeToasts: {
      high: "You ease through the slick line like you saw it coming.",
      mid: "The rear wheel twitches, but you keep the pouch dry.",
      low: "The scooter slips for a second. You recover, wetter and wiser."
    }
  },
  {
    id: "nude_cold_bag_balance",
    deliveryId: "nude_cold_bag_run",
    minigameId: "ride_checkpoint_cargo_balance",
    routeFraction: 0.5,
    radius: 90,
    arriveToast: "The cold bag swings wide in the basket. Balance it before the ice sweats through.",
    outcomeToasts: {
      high: "The bag settles back into place. Still cold, still clean.",
      mid: "You catch the swing before it becomes a problem.",
      low: "The bag thumps the basket wall. The ice is losing the argument."
    }
  },
  {
    id: "beach_wristband_gate_gap",
    deliveryId: "beach_wristband_pouch",
    minigameId: "ride_checkpoint_traffic_gap",
    routeFraction: 0.64,
    radius: 92,
    arriveToast: "A service cart noses across the beach-club approach. Time the gap before the gate crowd thickens.",
    outcomeToasts: {
      high: "You slip behind the cart and the gate stays open in front of you.",
      mid: "You pause, then catch the gap before the line grows.",
      low: "You brake late and lose a few seconds to the gate mess."
    }
  },
  {
    id: "finns_linen_fragile_stack",
    deliveryId: "finns_linen_bundle",
    minigameId: "ride_checkpoint_cargo_balance",
    routeFraction: 0.46,
    radius: 92,
    arriveToast: "The linen stack leans against the basket straps. Keep the load from slumping.",
    outcomeToasts: {
      high: "The linen stack rides like it was tied by a professional.",
      mid: "A corner lifts, but you pat it back into place at the next breath.",
      low: "The stack slumps hard. Still deliverable, definitely less graceful."
    }
  }
];

export function getRideCheckpointsForDelivery(deliveryId: string, conditionId?: string): RideCheckpointDefinition[] {
  return RIDE_CHECKPOINTS.filter(
    (checkpoint) =>
      checkpoint.deliveryId === deliveryId &&
      (!checkpoint.conditionIds || (conditionId != null && checkpoint.conditionIds.includes(conditionId)))
  );
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
