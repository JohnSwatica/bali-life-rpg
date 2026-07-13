import type { ActiveDeliveryState, Act0Step, ActProgressState, DayLedgerBaseline, HustleState, LifeLoopState } from "../../types";

const ACT0_STEPS: Act0Step[] = [
  "meet_ibu_sari",
  "pickup_first_delivery",
  "dropoff_first_delivery",
  "buy_meal_and_coffee",
  "sleep_first_night",
  "complete"
];

export function createDefaultLifeLoopState(): LifeLoopState {
  return {
    activityHistory: {},
    pendingMorningPenalties: [],
    completedGoalIds: [],
    joinedClubIds: [],
    relationshipArcProgress: {},
    settledIn: false,
    actProgress: createDefaultActProgressState(),
    hustle: createDefaultHustleState(),
    dayLedger: null
  };
}

export function createDefaultActProgressState(): ActProgressState {
  return {
    currentAct: 0,
    act0Step: "meet_ibu_sari",
    completedAct0StepIds: [],
    firstDayComplete: false
  };
}

export function createDefaultHustleState(): HustleState {
  return {
    driverRating: 3.2,
    completedDeliveryIds: [],
    completedDeliveryCount: 0,
    deliveryEarnings: 0,
    activeDelivery: null,
    rentDueDay: 4,
    rentAmount: 450,
    scooterTier: "borrowed_rattletrap",
    moveOutReady: false
  };
}

export function migrateLifeLoopState(rawLife: unknown): LifeLoopState {
  const base = createDefaultLifeLoopState();
  if (!rawLife || typeof rawLife !== "object") {
    return base;
  }
  const partial = rawLife as Partial<LifeLoopState> & Record<string, unknown>;
  const legacyLifeProgress = hasLegacyLifeProgress(partial);
  return {
    activityHistory: partial.activityHistory ?? {},
    pendingMorningPenalties: migratePendingMorningPenalties(partial.pendingMorningPenalties),
    completedGoalIds: partial.completedGoalIds ?? [],
    joinedClubIds: partial.joinedClubIds ?? [],
    relationshipArcProgress: partial.relationshipArcProgress ?? {},
    settledIn: partial.settledIn ?? false,
    actProgress: migrateActProgressState(partial.actProgress, legacyLifeProgress, partial.settledIn ?? false),
    hustle: migrateHustleState(partial.hustle),
    dayLedger: migrateDayLedgerBaseline(partial.dayLedger)
  };
}

function migrateDayLedgerBaseline(raw: unknown): DayLedgerBaseline | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const value = raw as Partial<DayLedgerBaseline>;
  if (typeof value.day !== "number" || !Number.isFinite(value.day)) {
    return null;
  }
  const readNumber = (candidate: unknown, fallback: number): number =>
    typeof candidate === "number" && Number.isFinite(candidate) ? candidate : fallback;
  return {
    day: value.day,
    money: readNumber(value.money, 0),
    driverRating: readNumber(value.driverRating, 3.2),
    completedDeliveryCount: readNumber(value.completedDeliveryCount, 0),
    deliveryEarnings: readNumber(value.deliveryEarnings, 0),
    bikeCondition: readNumber(value.bikeCondition, 100),
    relationshipCount: readNumber(value.relationshipCount, 0)
  };
}

function migratePendingMorningPenalties(raw: unknown): LifeLoopState["pendingMorningPenalties"] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const value = entry as Partial<LifeLoopState["pendingMorningPenalties"][number]>;
      if (typeof value.id !== "string" || typeof value.activityId !== "string" || typeof value.label !== "string") {
        return null;
      }
      return {
        id: value.id,
        activityId: value.activityId,
        label: value.label,
        createdDay: typeof value.createdDay === "number" && Number.isFinite(value.createdDay) ? value.createdDay : 0,
        meterDeltas: value.meterDeltas && typeof value.meterDeltas === "object" ? value.meterDeltas : {},
        reason: typeof value.reason === "string" ? value.reason : value.label
      };
    })
    .filter((entry): entry is LifeLoopState["pendingMorningPenalties"][number] => Boolean(entry));
}

function migrateActProgressState(raw: unknown, legacyLifeProgress = false, settledIn = false): ActProgressState {
  const base = createDefaultActProgressState();
  if (!raw || typeof raw !== "object") {
    if (legacyLifeProgress) {
      return {
        currentAct: settledIn ? 2 : 1,
        act0Step: "complete",
        completedAct0StepIds: [
          "meet_ibu_sari",
          "pickup_first_delivery",
          "dropoff_first_delivery",
          "buy_meal_and_coffee",
          "sleep_first_night"
        ],
        firstDayComplete: true
      };
    }
    return base;
  }
  const value = raw as Partial<ActProgressState>;
  const act0Step = isAct0Step(value.act0Step) ? value.act0Step : base.act0Step;
  return {
    currentAct: readAct(value.currentAct, base.currentAct),
    act0Step,
    completedAct0StepIds: Array.isArray(value.completedAct0StepIds) ? value.completedAct0StepIds.filter(isAct0Step) : [],
    firstDayComplete: value.firstDayComplete ?? act0Step === "complete"
  };
}

function hasLegacyLifeProgress(value: Partial<LifeLoopState> & Record<string, unknown>): boolean {
  return Boolean(
    value.settledIn ||
      (Array.isArray(value.completedGoalIds) && value.completedGoalIds.length > 0) ||
      (Array.isArray(value.joinedClubIds) && value.joinedClubIds.length > 0) ||
      (value.activityHistory && typeof value.activityHistory === "object" && Object.keys(value.activityHistory).length > 0) ||
      (value.relationshipArcProgress &&
        typeof value.relationshipArcProgress === "object" &&
        Object.keys(value.relationshipArcProgress).length > 0)
  );
}

function migrateHustleState(raw: unknown): HustleState {
  const base = createDefaultHustleState();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const value = raw as Partial<HustleState>;
  return {
    driverRating: clamp(readNumber(value.driverRating, base.driverRating), 1, 5),
    completedDeliveryIds: Array.isArray(value.completedDeliveryIds)
      ? value.completedDeliveryIds.filter((entry): entry is string => typeof entry === "string")
      : [],
    completedDeliveryCount: Math.max(0, Math.floor(readNumber(value.completedDeliveryCount, base.completedDeliveryCount))),
    deliveryEarnings: Math.max(0, Math.floor(readNumber(value.deliveryEarnings, base.deliveryEarnings))),
    activeDelivery: migrateActiveDelivery(value.activeDelivery),
    rentDueDay: Math.max(1, Math.floor(readNumber(value.rentDueDay, base.rentDueDay))),
    rentAmount: Math.max(0, Math.floor(readNumber(value.rentAmount, base.rentAmount))),
    scooterTier:
      value.scooterTier === "daily_rental" || value.scooterTier === "proper_bike" || value.scooterTier === "borrowed_rattletrap"
        ? value.scooterTier
        : base.scooterTier,
    moveOutReady: value.moveOutReady ?? false
  };
}

function migrateActiveDelivery(raw: unknown): ActiveDeliveryState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const value = raw as Partial<ActiveDeliveryState>;
  if (
    typeof value.deliveryId !== "string" ||
    (value.stage !== "accepted" && value.stage !== "picked_up") ||
    typeof value.acceptedAt !== "number" ||
    typeof value.dueAt !== "number"
  ) {
    return null;
  }
  return {
    deliveryId: value.deliveryId,
    stage: value.stage,
    acceptedAt: value.acceptedAt,
    dueAt: value.dueAt,
    conditionId: typeof value.conditionId === "string" ? value.conditionId : undefined,
    pickedUpAt: typeof value.pickedUpAt === "number" ? value.pickedUpAt : undefined,
    completedAt: typeof value.completedAt === "number" ? value.completedAt : undefined,
    starRating: typeof value.starRating === "number" ? clamp(value.starRating, 1, 5) : undefined,
    cargoIntegrity: typeof value.cargoIntegrity === "number" ? clamp(value.cargoIntegrity, 0, 100) : undefined,
    cargoDamageEvents:
      typeof value.cargoDamageEvents === "number" ? Math.max(0, Math.floor(value.cargoDamageEvents)) : undefined,
    rideRun: migrateDeliveryRideRun(value.rideRun)
  };
}

function migrateDeliveryRideRun(raw: unknown): ActiveDeliveryState["rideRun"] {
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Partial<NonNullable<ActiveDeliveryState["rideRun"]>>;
  const count = (candidate: unknown): number =>
    typeof candidate === "number" && Number.isFinite(candidate) ? Math.max(0, Math.floor(candidate)) : 0;
  return {
    elapsedMs: count(value.elapsedMs),
    hazardsSpawned: count(value.hazardsSpawned),
    hazardsAvoided: count(value.hazardsAvoided),
    nearMisses: count(value.nearMisses),
    contacts: count(value.contacts)
  };
}

function isAct0Step(value: unknown): value is Act0Step {
  return typeof value === "string" && ACT0_STEPS.includes(value as Act0Step);
}

function readAct(value: unknown, fallback: ActProgressState["currentAct"]): ActProgressState["currentAct"] {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
