export type Direction = "down" | "up" | "left" | "right";
export type TimePhase = "dawn" | "day" | "dusk" | "night";
export type GroupTravelMode = "walk" | "bike";
export type TutorialStep = "earn_bike_money" | "rent_bike" | "join_group" | "free_roam";
export type PortalMode = "single" | "multiplayer";
export type Meter = "energy" | "wellbeing" | "focus" | "social";
export type Act0Step =
  | "meet_ibu_sari"
  | "pickup_first_delivery"
  | "dropoff_first_delivery"
  | "buy_meal_and_coffee"
  | "sleep_first_night"
  | "complete";
export type DiscoveryLedgerEntryKind = "investigation" | "codex_note";
export type DiscoveryLedgerUnlockCondition =
  | { type: "pickup_collected"; pickupId: string }
  | { type: "act0_step_complete"; step: Act0Step }
  | { type: "delivery_count"; count: number }
  | { type: "driver_rating"; minimumRating: number };
export interface DiscoveryLedgerEntry {
  id: string;
  kind: DiscoveryLedgerEntryKind;
  title: string;
  body: string;
  unlock: DiscoveryLedgerUnlockCondition;
}
export type DeliveryStage = "accepted" | "picked_up";
export type VenueType =
  | "cafe"
  | "grocery"
  | "beach_club"
  | "homeware"
  | "coworking"
  | "bakery"
  | "coffee"
  | "other";
export type RatingSource = "manual_seed" | "curated_admin" | "google_places_future" | "unknown";
export type VerificationStatus = "manual_seeded" | "needs_verification" | "verified";
export type VenueCategory =
  | "restaurant"
  | "cafe"
  | "bar"
  | "beach_club"
  | "grocery"
  | "fitness"
  | "homeware"
  | "transport"
  | "landmark"
  | "other";
export type VenueMapVisibility = "hidden_until_discovered" | "road_visible" | "always_visible";
export type VenueDiscoveryState = "runtime" | "discovered" | "undiscovered";
export type EventType =
  | "surf_morning"
  | "cafe_rush"
  | "brunch_hour"
  | "evening_gathering"
  | "market_walk"
  | "community_route"
  | "venue_challenge"
  | "crew_meetup"
  | "party"
  | "market"
  | "class"
  | "run"
  | "meetup"
  | "live_music"
  | "coworking";
export type GroupPurpose = "social" | "run" | "coworking" | "surf" | "food" | "housing";
export type OpportunityType = "gig" | "social" | "help_out" | "flash_deal" | "rumor" | "trade";
export type OpportunityStatus = "live" | "accepted" | "completed" | "missed";
export type ActivityMinigameKind = "timing" | "balance" | "choice";
export type ReputationTag =
  | "helpful"
  | "reliable"
  | "social"
  | "explorer"
  | "local_trusted"
  | "venue_regular"
  | "community_contributor";
export type MemoryType =
  | "completed_quest"
  | "visited"
  | "bought_item"
  | "helped"
  | "attended_event"
  | "missed_opportunity"
  | "lost_to_you_clean"
  | "beat_you";
export type OfflineActivityType =
  | "venue_challenge"
  | "neighborhood_ritual"
  | "local_trial"
  | "community_route"
  | "stamp_walk"
  | "crew_mission"
  | "popup_event"
  | "check_in"
  | "venue_quest"
  | "social_gathering";

export interface PortalState {
  current: PortalMode;
  multiplayerStatus: "locked" | "mocked" | "local";
}

export interface OpenHours {
  [day: string]: { open: number; close: number } | "closed";
}

export interface PromotionPlaceholder {
  enabled: false;
}

export interface CheckInPlaceholder {
  enabled: false;
}

export interface BookingPlaceholder {
  enabled: false;
}

export interface DeliveryPlaceholder {
  enabled: false;
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  description: string;
  openHours: OpenHours;
  npcIds: string[];
  itemIds: string[];
  questIds: string[];
  realWorldRef: { mapName?: string; lat?: number; lng?: number } | null;
  promotion: PromotionPlaceholder | null;
  checkIn: CheckInPlaceholder | null;
  booking: BookingPlaceholder | null;
  delivery: DeliveryPlaceholder | null;
  implementationStatus: "stub" | "partial" | "live";
  ratingSource: RatingSource;
  rating: number | null;
  reviewCount: number | null;
  lastVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
  isPriorityVenue: boolean;
  venueCategory: VenueCategory;
  mapVisibility: VenueMapVisibility;
  discoveryState: VenueDiscoveryState;
}

export interface RewardSpec {
  money?: number;
  itemIds?: string[];
  reputationTag?: ReputationTag;
}

export interface GameEvent {
  id: string;
  title: string;
  type: EventType;
  host: { type: "venue" | "npc" | "group" | "player"; id: string };
  locationVenueId: string;
  visibility?: { requiresJoinedGroupId?: string };
  schedule: { day?: number; recurringDays?: number[]; startHour: number; endHour: number };
  description: string;
  participation: {
    timeCost: number;
    cost?: number;
    meterDeltas: Partial<Record<Meter, number>>;
    affinityBumps?: { npcId: string; amount: number }[];
    meetNpcs?: string[];
    reputationTag?: ReputationTag;
    reputationDelta?: number;
    itemIds?: string[];
  };
}

export interface SocialGroupDefinition {
  id: string;
  name: string;
  purpose: GroupPurpose;
  owner: { type: "npc" | "venue" | "group" | "player"; id: string };
  homeVenueId?: string;
  memberIds: string[];
  recurringEventIds?: string[];
  description: string;
  joinHook: string;
}

export interface OpportunityTrigger {
  timeWindow?: { startHour: number; endHour: number };
  venueIds?: string[];
  areas?: string[];
  minReputation?: number;
  requiresClubId?: string;
  requiresAffinity?: { npcId: string; tier: "stranger" | "acquaintance" | "friendly" | "regular" | "trusted" };
  maxMoney?: number;
  minCompletedDeliveryCount?: number;
}

export interface OpportunityReward {
  money?: number;
  meterDeltas?: Partial<Record<Meter, number>>;
  reputation?: {
    delta?: number;
    tag?: ReputationTag;
    reason: string;
  };
  axisImpact?: { rooted?: number; relational?: number; reason: string };
  affinityBumps?: { npcId: string; amount: number }[];
  items?: InventoryEntry[];
}

export interface OpportunityTemplate {
  id: string;
  type: OpportunityType;
  title: string;
  blurb: string;
  trigger: OpportunityTrigger;
  locationVenueId: string;
  durationMin: number;
  timeCostMin: number;
  reward: OpportunityReward;
  declineReward?: OpportunityReward;
  chainTo?: string;
  weight?: number;
  cooldownMin?: number;
}

export interface LiveOpportunity {
  id: string;
  templateId: string;
  status: OpportunityStatus;
  spawnedAt: number;
  expiresAt: number;
  locationVenueId: string;
  acceptedAt?: number;
  completedAt?: number;
  missedAt?: number;
}

export interface OpportunityMessage {
  id: string;
  at: number;
  from: string;
  body: string;
  opportunityId?: string;
  venueId?: string;
  read: boolean;
}

export interface OpportunityRuntimeState {
  live: LiveOpportunity[];
  completedTemplateIds: string[];
  missedTemplateIds: string[];
  messages: OpportunityMessage[];
  trackedOpportunityId: string | null;
  lastSpawnAt: number;
  templateCooldownUntil: Record<string, number>;
}

export interface ActiveMinigameChoice {
  id: string;
  label: string;
  score: number;
  feedback: string;
}

export interface ActiveMinigameState {
  kind: ActivityMinigameKind;
  title: string;
  prompt: string;
  actionLabel: string;
  attempts: number;
  bestScore: number;
  markerPhase: number;
  targetStart: number;
  targetEnd: number;
  selectedChoiceId?: string;
  feedback?: string;
  choices?: ActiveMinigameChoice[];
}

interface ActiveActivityBaseState {
  venueId: string;
  venueName: string;
  label: string;
  durationMin: number;
  elapsedMs: number;
  realDurationMs: number;
  startedAt: number;
  performanceScore?: number;
  minigame?: ActiveMinigameState;
}

export type ActiveActivityState =
  | (ActiveActivityBaseState & {
      source: "activity";
      activityId: string;
      opportunityId?: never;
      checkpointId?: never;
    })
  | (ActiveActivityBaseState & {
      source: "opportunity";
      opportunityId: string;
      activityId?: never;
      checkpointId?: never;
    })
  | (ActiveActivityBaseState & {
      source: "rideCheckpoint";
      checkpointId: string;
      activityId?: never;
      opportunityId?: never;
    })
  | (ActiveActivityBaseState & {
      source: "scooterRepair";
      activityId?: never;
      opportunityId?: never;
      checkpointId?: never;
    })
  | (ActiveActivityBaseState & {
      source: "rivalRace";
      raceId: string;
      activityId?: never;
      opportunityId?: never;
      checkpointId?: never;
    });

export type RelationshipArcPayoffKind = "club_invite" | "recurring_hangout" | "discount_hook" | "housing_lead_tease";

export interface RelationshipArcBeat {
  id: string;
  title: string;
  description: string;
  minAffinity: number;
  requiresEventIds?: string[];
  requiresJoinedClubIds?: string[];
  requiresCompletedQuestIds?: string[];
  payoff: {
    kind: RelationshipArcPayoffKind;
    text: string;
    groupId?: string;
  };
}

export interface RelationshipArcDefinition {
  id: string;
  npcId: string;
  title: string;
  beats: RelationshipArcBeat[];
}

export interface RelationshipArcProgress {
  completedBeatIds: string[];
  lastAdvancedAt: number;
}

export interface TrustFlag {
  type: "green" | "red";
  reason: string;
  source: string;
  createdAt: number;
}

export interface ReputationEvent {
  at: number;
  change: string;
  delta?: number;
}

export interface ReputationState {
  score: number;
  wantedLevel: number;
  bounty: number;
  flaggedByVictims: number;
  lastFlagReason?: string;
  tags: ReputationTag[];
  hiddenFlags: TrustFlag[];
  redemption: { active: boolean; challengeId: string | null };
  history: ReputationEvent[];
  // Both axes range -100..100 like score: +rooted/-extractive, +relational/-algorithmic.
  rootedAxis: number;
  relationalAxis: number;
}

export interface MemoryEvent {
  type: MemoryType;
  at: number;
  detail?: string;
}

export interface RelationshipMemory {
  subjectType: "npc" | "venue";
  subjectId: string;
  affinity: number;
  lastInteractionAt: number;
  memories: MemoryEvent[];
}

export interface OfflineActivity {
  activityId: string;
  venueId: string;
  activityType: OfflineActivityType;
  onlinePreview: string;
  offlineCheckInRequired: boolean;
  reward: RewardSpec | null;
  socialCapacity: number | null;
  startsAt: number | null;
  endsAt: number | null;
  requiresMultiplayer: boolean;
  futureCouponEligible: boolean;
  status: "simulated";
}

export interface AvatarConfig {
  body: string;
  hair: string;
  outfit: string;
  accessory?: string;
}

export interface PlayerProfile {
  profileId: string;
  displayName: string;
  avatar: AvatarConfig;
  lifestyleTags: string[];
  bio: string;
  homeArea: string;
  createdAt: number;
  remoteAccountId: string | null;
}

export interface RuntimeEventState {
  attendedEventIds: string[];
}

export interface MapDiscoveryState {
  discoveredAreaIds: string[];
  discoveredVenueIds: string[];
  revealAll: boolean;
}

export interface PlayerMeters {
  energy: number;
  wellbeing: number;
  focus: number;
  social: number;
}

export interface LifeActivityRecord {
  count: number;
  lastDay: number;
  totalCount: number;
  earnedMoney: number;
}

export interface PendingMorningPenalty {
  id: string;
  activityId: string;
  label: string;
  createdDay: number;
  meterDeltas: Partial<Record<Meter, number>>;
  reason: string;
}

export interface ActProgressState {
  currentAct: 0 | 1 | 2 | 3 | 4 | 5;
  act0Step: Act0Step;
  completedAct0StepIds: Act0Step[];
  firstDayComplete: boolean;
}

export interface ActiveDeliveryState {
  deliveryId: string;
  stage: DeliveryStage;
  acceptedAt: number;
  dueAt: number;
  conditionId?: string;
  pickedUpAt?: number;
  completedAt?: number;
  starRating?: number;
  cargoIntegrity?: number;
  cargoDamageEvents?: number;
}

export interface HustleState {
  driverRating: number;
  completedDeliveryIds: string[];
  completedDeliveryCount: number;
  deliveryEarnings: number;
  activeDelivery: ActiveDeliveryState | null;
  rentDueDay: number;
  rentAmount: number;
  scooterTier: "borrowed_rattletrap" | "daily_rental" | "proper_bike";
  moveOutReady: boolean;
}

export interface DayLedgerBaseline {
  day: number;
  money: number;
  driverRating: number;
  completedDeliveryCount: number;
  deliveryEarnings: number;
  bikeCondition: number;
  relationshipCount: number;
}

export interface LifeLoopState {
  activityHistory: Record<string, LifeActivityRecord>;
  pendingMorningPenalties: PendingMorningPenalty[];
  completedGoalIds: string[];
  joinedClubIds: string[];
  relationshipArcProgress: Record<string, RelationshipArcProgress>;
  settledIn: boolean;
  actProgress: ActProgressState;
  hustle: HustleState;
  dayLedger: DayLedgerBaseline | null;
}

export type GameIntent =
  | { kind: "SwitchPortal"; mode: PortalMode }
  | { kind: "AttendEvent"; eventId: string }
  | { kind: "JoinClub"; groupId: string }
  | { kind: "VisitVenue"; venueId: string }
  | { kind: "RecordMemory"; subjectType: "npc" | "venue"; subjectId: string; memory: MemoryType; detail?: string }
  | { kind: "AwardReputationTag"; tag: ReputationTag; reason: string }
  | { kind: "AdjustReputation"; delta: number; reason: string }
  | { kind: "AdjustReputationAxis"; axis: "rooted" | "relational"; delta: number; reason: string };

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export interface PlayerEntityState {
  id: string;
  displayName: string;
  x: number;
  y: number;
  direction: Direction;
  money: number;
  focus: number;
  socialEnergy: number;
  connections: number;
  hasBike: boolean;
  onBike: boolean;
  bikeStuck: boolean;
  bikeCondition: number;
  safety: number;
  tutorialStep: TutorialStep;
  inventory: InventoryEntry[];
  activeQuestIds: string[];
  completedQuestIds: string[];
  joinedGroupIds: string[];
  activeGroupId?: string;
  groupTravelMode?: GroupTravelMode;
}

export interface NpcEntityState {
  id: string;
  x: number;
  y: number;
  currentRoutineId: string;
  lastSpokenDay: number;
}

export interface WorldClockState {
  day: number;
  minuteOfDay: number;
  minutesPerSecond: number;
}

export interface GroupEntityState {
  id: string;
  groupDefinitionId: string;
  leaderId: string;
  memberIds: string[];
  travelMode: GroupTravelMode;
  status: "idle" | "traveling" | "stuck-recovery";
  requiresBike: boolean;
  x: number;
  y: number;
}

export interface WorldState {
  schemaVersion: number;
  version: 1;
  neighborhoodId: "berawa-finns-club";
  clock: WorldClockState;
  localPlayerId: string;
  players: Record<string, PlayerEntityState>;
  npcs: Record<string, NpcEntityState>;
  groups: Record<string, GroupEntityState>;
  profile: PlayerProfile;
  reputation: ReputationState;
  meters: PlayerMeters;
  relationships: RelationshipMemory[];
  portal: PortalState;
  runtimeEvents: RuntimeEventState;
  life: LifeLoopState;
  opportunities: OpportunityRuntimeState;
  activeActivity: ActiveActivityState | null;
  mapDiscovery: MapDiscoveryState;
  questFlags: Record<string, number | string | boolean>;
  collectedPickups: Record<string, number>;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  buyPrice: number;
  sellPrice: number;
}

export interface ShopDefinition {
  id: string;
  name: string;
  keeperNpcId?: string;
  x: number;
  y: number;
  radius: number;
  sells: string[];
  buys: string[];
  greeting: string;
}

export interface VenueActivityDefinition {
  id: string;
  venueName: string;
  x: number;
  y: number;
  radius: number;
  title: string;
  description: string;
  schedule: string;
  tags: string[];
  moneyCost: number;
  focusReward: number;
  socialEnergyDelta: number;
  connectionReward: number;
  reputationReward?: number;
  wantedReduction?: number;
  bountyReduction?: number;
  safetyReward?: number;
  isRedemption?: boolean;
  rewardItems: InventoryEntry[];
  groupId?: string;
}

export interface InterestGroupDefinition {
  id: string;
  name: string;
  venueName: string;
  hook: string;
  vibe: string;
  meetingRhythm: string;
  tags: string[];
}

export interface QuestDefinition {
  id: string;
  title: string;
  giverNpcId: string;
  shortDescription: string;
  activeText: string;
  turnInText: string;
  rewardMoney: number;
  rewardItems: InventoryEntry[];
}

export interface NpcRoutineStop {
  id: string;
  label: string;
  x: number;
  y: number;
  startMinute: number;
  endMinute: number;
}

export interface NpcRouteWaypoint {
  id: string;
  label: string;
  venueId?: string;
  x: number;
  y: number;
  pauseMs?: number;
}

export interface NpcRoutineRoute {
  id: string;
  label: string;
  startMinute: number;
  endMinute: number;
  waypoints: NpcRouteWaypoint[];
}

export type NpcIdleTag = "tidy_counter" | "knead_oven" | "laptop_sip" | "tinker_board" | "generic_idle";

export interface NpcDefinition {
  id: string;
  name: string;
  role: string;
  spriteKey: string;
  tint: number;
  routine: NpcRoutineStop[];
  routineRoutes?: NpcRoutineRoute[];
  idleTag?: NpcIdleTag;
  defaultLine: string;
}

export interface InteriorStationDefinition {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  activityVenueId: string;
}

export interface InteriorNpcSlotDefinition {
  npcId: string;
  x: number;
  y: number;
}

export interface InteriorDefinition {
  id: string;
  venueId: string;
  name: string;
  origin: { x: number; y: number };
  width: number;
  height: number;
  entrance: { x: number; y: number };
  exitMat: { x: number; y: number; radius: number };
  stations: InteriorStationDefinition[];
  npcSlots: InteriorNpcSlotDefinition[];
}

export interface PickupDefinition {
  id: string;
  itemId: string;
  x: number;
  y: number;
  respawnMinutes: number;
  label: string;
}

export interface RectDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
