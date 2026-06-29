import Phaser from "phaser";
import { activityDefinitions } from "../../data/community";
import { curatedVenueNodes } from "../../data/authoredStreetLayout";
import { npcDefinitions } from "../../data/npcs";
import { pickupDefinitions } from "../../data/map";
import { shopDefinitions } from "../../data/shops";
import { scaleDistance } from "../map/WorldScale";
import type { PickupDefinition } from "../../types";

const NPC_INTERACTION_RADIUS = scaleDistance(82);
const OFFENDER_INTERACTION_RADIUS = scaleDistance(78);
const PICKUP_INTERACTION_RADIUS = scaleDistance(64);
const VENUE_INTERACTION_RADIUS = scaleDistance(70);

export type InteractionTarget =
  | { type: "npc"; id: string; label: string; distance: number }
  | { type: "delivery"; id: string; label: string; distance: number }
  | { type: "shop"; id: string; label: string; distance: number }
  | { type: "venue"; id: string; label: string; distance: number }
  | { type: "pickup"; id: string; label: string; distance: number }
  | { type: "activity"; id: string; label: string; distance: number }
  | { type: "offender"; id: string; label: string; distance: number };

export interface InteractionOffender {
  id: string;
  name: string;
  sprite: Phaser.GameObjects.Sprite;
  cash: number;
  wantedLevel: number;
}

export interface InteractionDeliveryTarget {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
}

interface InteractionControllerOptions {
  getPlayerPosition: () => { x: number; y: number };
  getNpcSprite: (npcId: string) => Phaser.Physics.Arcade.Sprite | undefined;
  isPickupAvailable: (pickup: PickupDefinition) => boolean;
  getWantedOffenders: () => Iterable<InteractionOffender>;
  getOffenderReward: (offender: InteractionOffender) => number;
  getDeliveryTargets?: () => Iterable<InteractionDeliveryTarget>;
}

interface InteractionHandlers {
  npc: (id: string) => void;
  shop: (id: string) => void;
  venue: (id: string) => void;
  pickup: (id: string) => void;
  delivery: (id: string) => void;
  activity: (id: string) => void;
  offender: (id: string) => void;
}

export class InteractionController {
  constructor(private readonly options: InteractionControllerOptions) {}

  getNearestInteraction(): InteractionTarget | undefined {
    const candidates: InteractionTarget[] = [];
    const { x: px, y: py } = this.options.getPlayerPosition();

    for (const npc of Object.values(npcDefinitions)) {
      const sprite = this.options.getNpcSprite(npc.id);
      if (!sprite) continue;
      const distance = Phaser.Math.Distance.Between(px, py, sprite.x, sprite.y);
      if (distance <= NPC_INTERACTION_RADIUS) {
        candidates.push({ type: "npc", id: npc.id, label: `Talk to ${npc.name}`, distance });
      }
    }

    for (const shop of Object.values(shopDefinitions)) {
      const distance = Phaser.Math.Distance.Between(px, py, shop.x, shop.y);
      if (distance <= shop.radius) {
        candidates.push({ type: "shop", id: shop.id, label: `Enter ${shop.name}`, distance });
      }
    }

    for (const delivery of this.options.getDeliveryTargets?.() ?? []) {
      const distance = Phaser.Math.Distance.Between(px, py, delivery.x, delivery.y);
      if (distance <= delivery.radius) {
        candidates.push({ type: "delivery", id: delivery.id, label: delivery.label, distance });
      }
    }

    for (const venue of curatedVenueNodes) {
      if (shopDefinitions[venue.venueId]) {
        continue;
      }
      const distance = Phaser.Math.Distance.Between(px, py, venue.x, venue.y);
      if (distance <= Math.min(venue.radius, VENUE_INTERACTION_RADIUS)) {
        candidates.push({ type: "venue", id: venue.venueId, label: `Check out ${venue.name}`, distance });
      }
    }

    for (const activity of activityDefinitions) {
      const distance = Phaser.Math.Distance.Between(px, py, activity.x, activity.y);
      if (distance <= activity.radius) {
        candidates.push({ type: "activity", id: activity.id, label: activity.title, distance });
      }
    }

    for (const offender of this.options.getWantedOffenders()) {
      if (offender.wantedLevel <= 0) {
        continue;
      }
      const distance = Phaser.Math.Distance.Between(px, py, offender.sprite.x, offender.sprite.y);
      if (distance <= OFFENDER_INTERACTION_RADIUS) {
        candidates.push({
          type: "offender",
          id: offender.id,
          label: `Citizen arrest ${offender.name} for Rp ${Math.min(offender.cash, this.options.getOffenderReward(offender))}`,
          distance
        });
      }
    }

    for (const pickup of pickupDefinitions) {
      if (!this.options.isPickupAvailable(pickup)) continue;
      const distance = Phaser.Math.Distance.Between(px, py, pickup.x, pickup.y);
      if (distance <= PICKUP_INTERACTION_RADIUS) {
        candidates.push({ type: "pickup", id: pickup.id, label: `Pick up ${pickup.label}`, distance });
      }
    }

    return candidates.sort((a, b) => priority(a) - priority(b) || a.distance - b.distance)[0];
  }

  resolveTarget(target: InteractionTarget, handlers: InteractionHandlers): void {
    if (target.type === "npc") {
      handlers.npc(target.id);
    } else if (target.type === "delivery") {
      handlers.delivery(target.id);
    } else if (target.type === "shop") {
      handlers.shop(target.id);
    } else if (target.type === "venue") {
      handlers.venue(target.id);
    } else if (target.type === "activity") {
      handlers.activity(target.id);
    } else if (target.type === "offender") {
      handlers.offender(target.id);
    } else {
      handlers.pickup(target.id);
    }
  }
}

function priority(target: InteractionTarget): number {
  if (target.type === "npc") return 0;
  if (target.type === "offender") return 1;
  if (target.type === "delivery") return 2;
  if (target.type === "activity") return 3;
  if (target.type === "shop") return 4;
  if (target.type === "venue") return 5;
  return 5;
}
