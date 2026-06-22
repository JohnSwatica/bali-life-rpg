export type Direction = "down" | "up" | "left" | "right";
export type TimePhase = "dawn" | "day" | "dusk" | "night";
export type GroupTravelMode = "walk" | "bike";
export type TutorialStep = "earn_bike_money" | "rent_bike" | "join_group" | "free_roam";
export type PortalMode = "single" | "multiplayer";
export type Meter = "energy" | "wellbeing" | "focus" | "social";
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
  | "crew_meetup";
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
  | "missed_opportunity";
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
  venueId: string | null;
  startsAt: number;
  endsAt: number;
  mode: "single" | "multi" | "both";
  requiresMultiplayer: boolean;
  reward: RewardSpec | null;
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

export interface LifeLoopState {
  activityHistory: Record<string, LifeActivityRecord>;
  completedGoalIds: string[];
  settledIn: boolean;
}

export type GameIntent =
  | { kind: "SwitchPortal"; mode: PortalMode }
  | { kind: "AttendEvent"; eventId: string }
  | { kind: "VisitVenue"; venueId: string }
  | { kind: "RecordMemory"; subjectType: "npc" | "venue"; subjectId: string; memory: MemoryType; detail?: string }
  | { kind: "AwardReputationTag"; tag: ReputationTag; reason: string }
  | { kind: "AdjustReputation"; delta: number; reason: string };

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

export interface NpcDefinition {
  id: string;
  name: string;
  role: string;
  spriteKey: string;
  tint: number;
  routine: NpcRoutineStop[];
  defaultLine: string;
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
