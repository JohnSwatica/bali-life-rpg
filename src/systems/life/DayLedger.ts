import { getRentPressureState } from "../hustle/HustleEconomy";
import type { DayLedgerBaseline, WorldState } from "../../types";

export interface DayLedgerRow {
  title: string;
  body: string;
}

export interface DayLedgerSummary {
  closedDay: number;
  runsCompleted: number;
  moneyDelta: number;
  ratingDelta: number;
  bikeConditionDelta: number;
  newRelationships: number;
  rows: DayLedgerRow[];
}

export function captureDayLedgerBaseline(world: WorldState): void {
  const player = world.players[world.localPlayerId];
  const baseline: DayLedgerBaseline = {
    day: world.clock.day,
    money: player.money,
    driverRating: world.life.hustle.driverRating,
    completedDeliveryCount: world.life.hustle.completedDeliveryCount,
    deliveryEarnings: world.life.hustle.deliveryEarnings,
    bikeCondition: player.bikeCondition,
    relationshipCount: world.relationships.length
  };
  world.life.dayLedger = baseline;
}

export function buildDayLedgerSummary(world: WorldState): DayLedgerSummary | null {
  const baseline = world.life.dayLedger;
  if (!baseline || !world.life.actProgress.firstDayComplete) {
    return null;
  }

  const player = world.players[world.localPlayerId];
  const runsCompleted = Math.max(0, world.life.hustle.completedDeliveryCount - baseline.completedDeliveryCount);
  const earned = Math.max(0, world.life.hustle.deliveryEarnings - baseline.deliveryEarnings);
  const moneyDelta = player.money - baseline.money;
  const ratingDelta = world.life.hustle.driverRating - baseline.driverRating;
  const bikeConditionDelta = player.bikeCondition - baseline.bikeCondition;
  const newRelationships = Math.max(0, world.relationships.length - baseline.relationshipCount);
  const rows: DayLedgerRow[] = [];

  rows.push({
    title: runsCompleted > 0 ? `${runsCompleted} run${runsCompleted === 1 ? "" : "s"} completed` : "No runs completed",
    body:
      runsCompleted > 0
        ? `Rp ${earned} earned on the road. Driver rating ${describeRatingShift(ratingDelta)} at ${world.life.hustle.driverRating.toFixed(1)} stars.`
        : "The scooter stayed parked today. Tomorrow's hand is a fresh start."
  });

  rows.push({
    title: moneyDelta >= 0 ? `Wallet up Rp ${moneyDelta}` : `Wallet down Rp ${Math.abs(moneyDelta)}`,
    body: `You closed the day holding Rp ${player.money}.`
  });

  const rent = getRentPressureState(world);
  rows.push({
    title: rent.shortLabel,
    body:
      player.money >= world.life.hustle.rentAmount
        ? `Rp ${world.life.hustle.rentAmount} rent is covered if you pay now.`
        : `You are Rp ${world.life.hustle.rentAmount - player.money} short of the Rp ${world.life.hustle.rentAmount} rent.`
  });

  if (bikeConditionDelta < 0) {
    rows.push({
      title: `Scooter wear ${bikeConditionDelta}%`,
      body: `Condition sits at ${Math.round(player.bikeCondition)}%. A clean wrench beat at the rental keeps runs forgiving.`
    });
  }

  if (newRelationships > 0) {
    rows.push({
      title: newRelationships === 1 ? "1 new bond" : `${newRelationships} new bonds`,
      body: "Someone in Berawa will remember today."
    });
  }

  return {
    closedDay: baseline.day,
    runsCompleted,
    moneyDelta,
    ratingDelta,
    bikeConditionDelta,
    newRelationships,
    rows
  };
}

function describeRatingShift(delta: number): string {
  if (Math.abs(delta) < 0.05) {
    return "held steady";
  }
  return delta > 0 ? `up ${delta.toFixed(1)}` : `down ${Math.abs(delta).toFixed(1)}`;
}
