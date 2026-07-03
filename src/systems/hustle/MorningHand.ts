import { getDeliveryDefinition } from "../../data/deliveries";
import {
  getDeliveryOfferAvailability,
  getEffectiveDeliveryTerms,
  previewDeliveryCondition
} from "./DeliverySystem";
import { getRentPressureState, getScooterRepairStatus } from "./HustleEconomy";
import { getOpportunityTemplate } from "../opportunities/OpportunityEngine";
import type { WorldState } from "../../types";

export type MorningHandCardAction = "accept_delivery" | "pay_rent" | "track_opportunity" | "close";
export type MorningHandCardKind = "delivery" | "repair" | "rent" | "opportunity" | "recovery";

export interface MorningHandCard {
  id: string;
  kind: MorningHandCardKind;
  title: string;
  body: string;
  actionLabel: string;
  action: MorningHandCardAction;
  deliveryId?: string;
  opportunityId?: string;
  venueId?: string;
  available: boolean;
}

const MIN_MORNING_HAND_CARDS = 3;
const MAX_MORNING_HAND_CARDS = 5;

export function shouldShowMorningHand(world: WorldState): boolean {
  return (
    world.life.actProgress.firstDayComplete &&
    world.life.actProgress.currentAct === 1 &&
    !world.life.hustle.activeDelivery &&
    world.clock.minuteOfDay >= 5 * 60 &&
    world.clock.minuteOfDay <= 11 * 60
  );
}

export function getMorningHandCards(world: WorldState, now: number): MorningHandCard[] {
  const cards: MorningHandCard[] = [];
  const offers = getDeliveryOfferAvailability(world);
  const availableOffers = offers.filter((offer) => offer.available);

  for (const offer of availableOffers.slice(0, 3)) {
    const condition = previewDeliveryCondition(world, offer.delivery, now);
    const terms = getEffectiveDeliveryTerms(offer.delivery, condition);
    cards.push({
      id: `delivery:${offer.delivery.id}`,
      kind: "delivery",
      title: offer.delivery.title,
      body: `Rp ${terms.payout} | ${terms.timeLimitMin} min${condition ? ` | ${condition.label}` : ""}. ${condition?.description ?? offer.delivery.description}`,
      actionLabel: "Take Run",
      action: "accept_delivery",
      deliveryId: offer.delivery.id,
      venueId: offer.delivery.pickupVenueId,
      available: true
    });
  }

  const repair = getScooterRepairStatus(world);
  if (repair.available) {
    cards.push({
      id: "repair:scooter",
      kind: "repair",
      title: "Patch the scooter first",
      body: `Rp ${repair.cost} at Bali Family Rental Scooter. A clean wrench beat can push it closer to ${repair.targetCondition}%.`,
      actionLabel: "Find Rental",
      action: "close",
      venueId: "bali_family_rental_scooter",
      available: true
    });
  }

  const rent = getRentPressureState(world);
  const player = world.players[world.localPlayerId];
  if (player.money >= world.life.hustle.rentAmount || rent.status !== "comfortable") {
    cards.push({
      id: "rent:kos",
      kind: "rent",
      title: player.money >= world.life.hustle.rentAmount ? "Cover rent now" : rent.shortLabel,
      body:
        player.money >= world.life.hustle.rentAmount
          ? `You have Rp ${player.money}. Pay Rp ${world.life.hustle.rentAmount} from the kos before the day gets noisy.`
          : `${rent.message} Need Rp ${Math.max(0, world.life.hustle.rentAmount - player.money)} more.`,
      actionLabel: player.money >= world.life.hustle.rentAmount ? "Pay Rent" : "Not Yet",
      action: player.money >= world.life.hustle.rentAmount ? "pay_rent" : "close",
      venueId: "cheap_kos",
      available: player.money >= world.life.hustle.rentAmount
    });
  }

  const shadyPackage = world.opportunities.live.find(
    (opportunity) =>
      (opportunity.status === "live" || opportunity.status === "accepted") &&
      opportunity.templateId === "no_questions_package"
  );
  if (shadyPackage) {
    const template = getOpportunityTemplate(shadyPackage.templateId);
    cards.push({
      id: `opportunity:${shadyPackage.id}`,
      kind: "opportunity",
      title: template?.title ?? "The No-Questions Package",
      body: `${template?.blurb ?? "A sketchy paid run is waiting at the rental."} Discovery happens at the rental counter; you do not have to take it.`,
      actionLabel: shadyPackage.status === "accepted" ? "Tracked" : "Track",
      action: "track_opportunity",
      opportunityId: shadyPackage.id,
      venueId: shadyPackage.locationVenueId,
      available: true
    });
  }

  if (cards.length < MIN_MORNING_HAND_CARDS) {
    for (const offer of offers.filter((offer) => !offer.available).slice(0, MIN_MORNING_HAND_CARDS - cards.length)) {
      const delivery = getDeliveryDefinition(offer.delivery.id);
      cards.push({
        id: `locked:${offer.delivery.id}`,
        kind: "delivery",
        title: `${delivery?.title ?? offer.delivery.title} (locked)`,
        body: offer.reason ?? "This run is not open yet.",
        actionLabel: "Locked",
        action: "close",
        deliveryId: offer.delivery.id,
        venueId: offer.delivery.pickupVenueId,
        available: false
      });
    }
  }

  if (cards.length < MIN_MORNING_HAND_CARDS) {
    cards.push({
      id: "recovery:warung",
      kind: "recovery",
      title: "Eat before another run",
      body: "If your meters are shaky, use a warung or cafe station before stacking delivery work.",
      actionLabel: "Start Day",
      action: "close",
      venueId: "canggu_station",
      available: true
    });
  }

  return cards.slice(0, MAX_MORNING_HAND_CARDS);
}
