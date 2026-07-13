import { getDeliveryDefinition } from "../../data/deliveries";
import { playerHomeBase } from "../../data/homeBase";
import { getAct0StepState, isAct0Complete } from "../life/ActProgression";
import { areAct2GoalsComplete, getAct2NextStep, getAct2PayoffOpportunityState, isAct2Unlocked } from "../life/Act2Goals";
import { getAct3ReadinessNextStep } from "../life/Act3Readiness";
import { getStationRecoveryNudge } from "../life/StationRecovery";
import { getHustleNextStep } from "../hustle/HustleGoals";
import { getRentPressureState, getScooterUpgradeStatus, MIN_DELIVERY_BIKE_CONDITION } from "../hustle/HustleEconomy";
import { getAct1MoveOutReadiness } from "../hustle/HustleMilestones";
import { getSocialGroup } from "../groups/GroupRegistry";
import { getEvent } from "../events/EventScheduler";
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

  if (isAct2Unlocked(world)) {
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
    return [
      { type: "venue", id: "act0_meal_coffee_milk_madu", label: "Brunch and coffee", venueId: "milk_madu_berawa" },
      { type: "venue", id: "act0_meal_coffee_baked", label: "Bakery coffee", venueId: "baked_berawa" }
    ];
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
    return [{ type: "point", id: delivery.dropoffId, label: delivery.dropoffLabel, ...delivery.dropoffPoint }];
  }

  const player = world.players[world.localPlayerId];
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

  if (world.life.hustle.moveOutReady) {
    return [
      { type: "venue", id: "act2_beach_crew", label: "Find beach crew", venueId: "berawa_beach" },
      { type: "venue", id: "act2_focus_table", label: "Find focus table", venueId: "satu_satu_coffee" },
      { type: "venue", id: "act2_brunch_builders", label: "Find brunch builders", venueId: "milk_madu_berawa" }
    ];
  }

  if (getScooterUpgradeStatus(world).available) {
    return [{ type: "venue", id: "scooter_upgrade_counter", label: "Upgrade scooter", venueId: "bali_family_rental_scooter" }];
  }

  const recoveryNudge = getStationRecoveryNudge(world);
  if (recoveryNudge) {
    return [
      ...(recoveryNudge.includeHome ? ([{ type: "home" as const, id: playerHomeBase.id, label: playerHomeBase.name }] satisfies FieldObjectiveTargetRef[]) : []),
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

  const recurringEventId = world.life.joinedClubIds.flatMap((groupId) => getSocialGroup(groupId)?.recurringEventIds ?? [])[0];
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
