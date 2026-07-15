import { getDeliveryDefinition } from "../../data/deliveries";
import { getPlayerHomeBase, playerHomeBase } from "../../data/homeBase";
import { getAct0StepState, isAct0Complete } from "../life/ActProgression";
import {
  areAct2GoalsComplete,
  getAct2NextStep,
  getAct2PayoffOpportunityState,
  getJoinedClubRecurringEventIds,
  isAct2Unlocked
} from "../life/Act2Goals";
import { getAct3ReadinessNextStep } from "../life/Act3Readiness";
import { getStationRecoveryNudge } from "../life/StationRecovery";
import { getHustleNextStep } from "../hustle/HustleGoals";
import { getRentPressureState, getScooterUpgradeStatus, MIN_DELIVERY_BIKE_CONDITION } from "../hustle/HustleEconomy";
import { getAct1MoveOutReadiness } from "../hustle/HustleMilestones";
import {
  ACT1_MADE_KEY_FLAG,
  ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG,
  canStartIbuGuaranteeScene,
  isAct1MoveOutComplete,
  isIbuGuaranteeComplete
} from "../story/Act1Finale";
import { getEvent } from "../events/EventScheduler";
import { isKitchenCircleInvitationPending } from "../story/Act2KitchenCircle";
import {
  getAct2SeatGate,
  hasResolvedVanceOffer,
  isAct2FinaleComplete,
  isAct2FinaleStarted,
  isVanceOfferPending
} from "../story/Act2Finale";
import { getRelationshipArcStates } from "../relationships/RelationshipArcs";
import type { WorldState } from "../../types";

export type FieldObjectiveSource = "act0" | "hustle" | "act2" | "act3" | "idle";
export type FieldObjectiveUrgency = "normal" | "urgent" | "blocked" | "complete";

export interface FieldObjectiveState {
  source: FieldObjectiveSource;
  title: string;
  detail: string;
  urgency: FieldObjectiveUrgency;
  targets: FieldObjectiveTargetRef[];
}

export type FieldObjectiveTargetRef =
  | { type: "npc"; id: string; label: string; npcId: string }
  | { type: "venue"; id: string; label: string; venueId: string }
  | { type: "home"; id: string; label: string }
  | { type: "point"; id: string; label: string; x: number; y: number; radius: number };

export function getFieldObjective(world: WorldState): FieldObjectiveState {
  if (!isAct0Complete(world)) {
    const step = getAct0StepState(world);
    return {
      source: "act0",
      title: step.title,
      detail: step.objective,
      urgency: "normal",
      targets: getAct0ObjectiveTargets(world)
    };
  }

  // A committed delivery remains the immediate field promise in every act.
  // Act-level social guidance resumes as soon as the handoff is complete.
  if (world.life.hustle.activeDelivery) {
    const hustleNext = getHustleNextStep(world);
    return {
      source: "hustle",
      title: hustleNext.title,
      detail: hustleNext.detail,
      urgency: hustleNext.urgency,
      targets: getHustleObjectiveTargets(world)
    };
  }

  if (isAct2Unlocked(world)) {
    if (isKitchenCircleInvitationPending(world)) {
      return {
        source: "act2",
        title: "Answer Ibu's summons",
        detail: "Ibu has a busy night and expects your hands at the warung. The invitation will not expire.",
        urgency: "normal",
        targets: [{ type: "npc", id: "act2_kitchen_circle_invitation", label: "Talk to Ibu Sari", npcId: "ibu_sari" }]
      };
    }
    if (isVanceOfferPending(world)) {
      return {
        source: "act2",
        title: "Meet Julian Vance",
        detail: "He has your numbers open at Milk & Madu. Hear the offer; neither answer changes access or work.",
        urgency: "normal",
        targets: [{ type: "venue", id: "act2_vance_offer", label: "Enter Milk & Madu", venueId: "milk_madu_berawa" }]
      };
    }
    const seatGate = getAct2SeatGate(world);
    if (!isAct2FinaleComplete(world) && (isAct2FinaleStarted(world) || (seatGate.foundationComplete && hasResolvedVanceOffer(world)))) {
      return {
        source: "act2",
        title: isAct2FinaleStarted(world) ? "Finish the sunset toast" : seatGate.sundaySunset ? "Take the seat" : "Return Sunday at sunset",
        detail: seatGate.sundaySunset || isAct2FinaleStarted(world)
          ? "Both circles are together at Berawa Beach, and a place is open for you."
          : "The circle returns Sunday from 17:00 to 20:00. Missing it has no penalty.",
        urgency: "normal",
        targets: [{ type: "venue", id: "act2_sunset_seat", label: "Berawa Beach circle", venueId: "berawa_beach" }]
      };
    }
    const act3Next = areAct2GoalsComplete(world) ? getAct3ReadinessNextStep(world) : null;
    if (act3Next?.urgency === "ceo") {
      return {
        source: "act3",
        title: act3Next.title,
        detail: act3Next.detail,
        urgency: "complete",
        targets: []
      };
    }

    const act2Next = getAct2NextStep(world);
    if (act2Next) {
      return {
        source: "act2",
        title: act2Next.title,
        detail: act2Next.detail,
        urgency: act2Next.urgency,
        targets: getAct2ObjectiveTargets(world)
      };
    }
  }

  if (world.life.actProgress.currentAct === 1) {
    const hustleNext = getHustleNextStep(world);
    return {
      source: "hustle",
      title: hustleNext.title,
      detail: hustleNext.detail,
      urgency: hustleNext.urgency,
      targets: getHustleObjectiveTargets(world)
    };
  }

  return {
    source: "idle",
    title: "Explore Berawa",
    detail: "Talk to locals, visit venues, and follow any markers that show up on the street.",
    urgency: "normal",
    targets: []
  };
}

export function formatFieldObjectiveLine(objective: FieldObjectiveState): string {
  return `Now: ${objective.title} - ${objective.detail}`;
}

function getAct0ObjectiveTargets(world: WorldState): FieldObjectiveTargetRef[] {
  const step = world.life.actProgress.act0Step;
  if (step === "meet_ibu_sari") {
    return [{ type: "npc", id: "act0_ibu_sari", label: "Find Ibu Sari", npcId: "ibu_sari" }];
  }
  if (step === "pickup_first_delivery") {
    return [{ type: "venue", id: "act0_baked_pickup", label: "BAKED pickup", venueId: "baked_berawa" }];
  }
  if (step === "dropoff_first_delivery") {
    const delivery = getDeliveryDefinition(world.life.hustle.activeDelivery?.deliveryId ?? "first_baked_villa_delivery");
    return delivery ? [{ type: "point", id: delivery.dropoffId, label: delivery.dropoffLabel, ...delivery.dropoffPoint }] : [];
  }
  if (step === "buy_meal_and_coffee") {
    return [{ type: "venue", id: "act0_milk_madu_scene", label: "Enter Milk & Madu", venueId: "milk_madu_berawa" }];
  }
  if (step === "nusadrop_signup" || step === "landlord_ultimatum" || step === "villa_order_ping") {
    return [];
  }
  if (step === "dropoff_storm_delivery" || step === "pickup_villa_delivery" || step === "dropoff_villa_delivery") {
    const delivery = getDeliveryDefinition(world.life.hustle.activeDelivery?.deliveryId ?? "");
    if (!delivery) return [];
    if (world.life.hustle.activeDelivery?.stage === "accepted") {
      return [{ type: "venue", id: `${delivery.id}_pickup`, label: delivery.pickupLabel, venueId: delivery.pickupVenueId }];
    }
    return [{ type: "point", id: delivery.dropoffId, label: delivery.dropoffLabel, ...delivery.dropoffPoint }];
  }
  if (step === "pay_kos_deposit") {
    return [{ type: "home", id: playerHomeBase.id, label: "Return to the kos" }];
  }
  if (step === "sleep_first_night") {
    return [{ type: "home", id: playerHomeBase.id, label: playerHomeBase.name }];
  }
  return [];
}

function getHustleObjectiveTargets(world: WorldState): FieldObjectiveTargetRef[] {
  const active = world.life.hustle.activeDelivery;
  if (active) {
    const delivery = getDeliveryDefinition(active.deliveryId);
    if (!delivery) {
      return [];
    }
    if (active.stage === "accepted") {
      return [{ type: "venue", id: `${delivery.id}_pickup`, label: delivery.pickupLabel, venueId: delivery.pickupVenueId }];
    }
    if (delivery.dropoffVenueId) {
      return [{ type: "venue", id: `${delivery.id}_dropoff`, label: delivery.dropoffLabel, venueId: delivery.dropoffVenueId }];
    }
    return [{ type: "point", id: delivery.dropoffId, label: delivery.dropoffLabel, ...delivery.dropoffPoint }];
  }

  const player = world.players[world.localPlayerId];

  if (canStartIbuGuaranteeScene(world)) {
    return [{ type: "npc", id: "act1_ibu_guarantee", label: "Ask Ibu Sari to vouch", npcId: "ibu_sari" }];
  }
  if (isIbuGuaranteeComplete(world) && !world.collectedPickups[ACT1_MADE_KEY_FLAG]) {
    return [{ type: "npc", id: "act1_made_key", label: "Bring Ibu's letter to Made", npcId: "made" }];
  }
  if (world.collectedPickups[ACT1_MADE_KEY_FLAG] && !isAct1MoveOutComplete(world)) {
    return [];
  }
  if (isAct1MoveOutComplete(world) && !world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG]) {
    return [{ type: "venue", id: "act1_weekly_scooter", label: "Sign weekly scooter contract", venueId: "bali_family_rental_scooter" }];
  }
  if (!player.hasBike || player.bikeCondition < MIN_DELIVERY_BIKE_CONDITION) {
    return [{ type: "venue", id: "scooter_counter", label: "Scooter counter", venueId: "bali_family_rental_scooter" }];
  }

  const rentPressure = getRentPressureState(world);
  if (rentPressure.status !== "comfortable" && player.money >= world.life.hustle.rentAmount) {
    return [{ type: "home", id: playerHomeBase.id, label: "Pay rent at home" }];
  }

  const moveOutReadiness = getAct1MoveOutReadiness(world);
  if (
    !moveOutReadiness.complete &&
    moveOutReadiness.deliveriesComplete &&
    moveOutReadiness.earningsComplete &&
    moveOutReadiness.ratingComplete &&
    !moveOutReadiness.firstRentCovered &&
    player.money >= world.life.hustle.rentAmount
  ) {
    return [{ type: "home", id: playerHomeBase.id, label: "Cover first rent" }];
  }

  if (getScooterUpgradeStatus(world).available) {
    return [{ type: "venue", id: "scooter_upgrade_counter", label: "Upgrade scooter", venueId: "bali_family_rental_scooter" }];
  }

  const recoveryNudge = getStationRecoveryNudge(world);
  if (recoveryNudge) {
    return [
      ...(recoveryNudge.includeHome ? ([{ type: "home" as const, id: getPlayerHomeBase(world).id, label: getPlayerHomeBase(world).name }] satisfies FieldObjectiveTargetRef[]) : []),
      ...recoveryNudge.venueIds.map(
        (venueId): FieldObjectiveTargetRef => ({
          type: "venue",
          id: `station_recovery_${venueId}`,
          label: recoveryNudge.title,
          venueId
        })
      )
    ];
  }

  return [{ type: "npc", id: "hustle_board_ibu_sari", label: "Ask Ibu Sari about the NusaDrop Board", npcId: "ibu_sari" }];
}

function getAct2ObjectiveTargets(world: WorldState): FieldObjectiveTargetRef[] {
  if (world.life.joinedClubIds.length === 0) {
    return [
      { type: "venue", id: "act2_beach_crew", label: "Find beach crew", venueId: "berawa_beach" },
      { type: "venue", id: "act2_focus_table", label: "Find focus table", venueId: "satu_satu_coffee" },
      { type: "venue", id: "act2_brunch_builders", label: "Find brunch builders", venueId: "milk_madu_berawa" }
    ];
  }

  const recurringEventId = getJoinedClubRecurringEventIds(world)[0];
  const recurringEvent = recurringEventId ? getEvent(recurringEventId) : undefined;
  if (recurringEvent && !world.runtimeEvents.attendedEventIds.includes(recurringEvent.id)) {
    return [{ type: "venue", id: `event_${recurringEvent.id}`, label: recurringEvent.title, venueId: recurringEvent.locationVenueId }];
  }

  const availableBeat = getRelationshipArcStates(world).find((state) => state.available);
  if (availableBeat) {
    return [
      {
        type: "npc",
        id: `relationship_${availableBeat.arc.npcId}`,
        label: availableBeat.beat.title,
        npcId: availableBeat.arc.npcId
      }
    ];
  }

  const payoff = getAct2PayoffOpportunityState(world);
  if (payoff && payoff.status !== "completed") {
    return [{ type: "venue", id: `act2_payoff_${payoff.templateId}`, label: payoff.title, venueId: payoff.venueId }];
  }

  return [];
}
