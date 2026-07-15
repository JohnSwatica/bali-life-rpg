import Phaser from "phaser";
import {
  activeStreetTemplate,
  berawaAreas,
  berawaMapFeatures,
  berawaRoads,
  curatedVenueNodes,
  venueMapNodes,
  type CuratedVenueMapNode,
  type VenueMapNode,
  type MapFeatureDefinition
} from "../data/authoredStreetLayout";
import { ambientNpcDefinitions, type AmbientNpcDefinition } from "../data/ambientNpcs";
import { activityDefinitions, interestGroupDefinitions } from "../data/community";
import type { Activity } from "../data/activities";
import { itemDefinitions } from "../data/items";
import { authoredPlayableBounds } from "../data/playableBounds";
import { getPlayerHomeBase } from "../data/homeBase";
import { getGameplayStationLoop } from "../data/stationLoops";
import { interiorDefinitions } from "../data/interiors";
import { collisionRects, pickupDefinitions, WORLD_HEIGHT, WORLD_WIDTH } from "../data/map";
import { npcDefinitions } from "../data/npcs";
import { questDefinitions } from "../data/quests";
import { shopDefinitions } from "../data/shops";
import { walkableStreetParcels } from "../data/worldDressing";
import { getDeliveryCondition, getDeliveryDefinition } from "../data/deliveries";
import { getStreetVenueFlavor } from "../data/streetVenueFlavors";
import { addItem, formatInventory, getQuantity, removeItem } from "../systems/Inventory";
import { LocalNetworkAdapter, type NetworkAdapter } from "../systems/NetworkAdapter";
import { clearSave, hasSavedWorldState, loadWorldState, saveWorldState } from "../systems/Persistence";
import { BUILD_STAMP } from "../systems/build/BuildInfo";
import { createFeedbackMailto } from "../systems/feedback/SessionSummary";
import { ScriptedDialogueProvider, type DialogueProvider } from "../systems/dialogue/DialogueProvider";
import { getAmbientNpcLine, getNpcDialogueSurface } from "../systems/dialogue/DialoguePresentation";
import { getPortraitDataUrl, getPortraitDefinition, portraitVariantForTier } from "../systems/dialogue/PortraitArt";
import { buildAct1IntroCutscene, buildAct2IntroCutscene } from "../systems/cutscene/ActCardScripts";
import { buildAct1MoveOutMontage } from "../systems/cutscene/Act1FinaleScripts";
import { buildAct0OpeningCutscene } from "../systems/cutscene/Act0OpeningScript";
import {
  buildAct0CafeScene,
  buildAct0CollapseScene,
  buildAct0KosResolveScene,
  buildAct0LandlordUltimatumScene
} from "../systems/cutscene/Act0BackHalfScripts";
import {
  getCutsceneStepState,
  getCutsceneLetterboxProgress,
  getStoryHudTopOffset,
  shouldPauseQueuedFeedback,
  skipCutscene,
  type CutsceneScript,
  type CutsceneStep,
  type CutsceneStepState
} from "../systems/cutscene/CutsceneSequencer";
import {
  selectAmbientBed,
  SoundManager,
  type AmbientScene,
  type SoundCue
} from "../systems/audio/SoundManager";
import { InteractionController, type InteractionTarget } from "../systems/interaction/InteractionController";
import { InputController, type GameKeyMap } from "../systems/input/InputController";
import { IntentDispatcher, type IntentResult } from "../systems/intents/IntentDispatcher";
import {
  formatFieldObjectiveLine,
  getFieldObjective,
  type FieldObjectiveState,
  type FieldObjectiveTargetRef
} from "../systems/guidance/FieldObjective";
import {
  areAdvancedMetersVisible,
  formatVisibleMeterDeltas,
  formatVisibleMeterValues,
  getVisibleMeters
} from "../systems/guidance/MeterVisibility";
import { getFieldIndicators, type VenueFieldIndicator } from "../systems/guidance/FieldIndicators";
import {
  getEventWorldScenes,
  getAct1IncitingHookWorldScenes,
  getFieldFirstDiscoveryAudit,
  getMadeRoomOfferWorldScenes,
  getOpportunityWorldScenes,
  getRivalRaceWorldScenes,
  resolveWorldSceneVenueAnchor,
  type EventWorldScene,
  type FieldFirstDiscoveryAudit,
  type OpportunityWorldScene,
  type WorldSceneActor
} from "../systems/world/WorldScenes";
import { getMembershipDebugState, getSocialGroupsForVenue, isSocialGroupJoined } from "../systems/groups/GroupRegistry";
import { PLAYER_UNIT, POKEMON_SCALE } from "../systems/map/PlayerUnitScale";
import { getPresentedRoads, getVenueSnapRoads } from "../systems/map/RoadPresentation";
import {
  getPermanentlySignedVenueIds,
  renderStreetTemplate,
  selectVisibleStreetSignIds,
  type StreetSignHandle
} from "../systems/map/StreetRenderer";
import { STREET_CAMERA, TILE_SIZE } from "../systems/map/TileStreetScale";
import { clampPointToPlayableBounds } from "../systems/map/PlayableBounds";
import { scaleDistance, scalePoint } from "../systems/map/WorldScale";
import {
  getInteriorByVenueId,
  getInteriorDeliveryPickupForStation,
  getOccupiedInteriorNpcSlots,
  getScheduledInteriorForNpc,
  INTERIOR_NPC_INTERACTION_RADIUS,
  isInteriorPointInsideRoom,
  resolveInteriorObjectiveTargets
} from "../systems/interiors/InteriorState";
import { calculateInteriorCameraBounds, calculateInteriorCameraZoom } from "../systems/interiors/InteriorCamera";
import {
  advanceNpcRouteMotion,
  getActiveNpcRoute,
  getNpcRouteActivityLabel,
  type NpcRouteMotionState
} from "../systems/npcs/NpcRoutineRoutes";
import {
  getNpcIdleCue,
  getNpcIdleTag,
  getNpcIdleVisual,
  shouldShowNpcIdleCueLabel
} from "../systems/npcs/NpcIdleBehavior";
import {
  getNpcProximityReaction as resolveNpcProximityReaction,
  type NpcProximityReaction
} from "../systems/npcs/NpcProximityReactions";
import { adjustPlayerMeters } from "../systems/meters/PlayerMeters";
import { getFocusBufferRemainingMinutes } from "../systems/meters/FocusBuffer";
import {
  createActiveMinigame,
  getActivityMinigameDefinition,
  getOpportunityMinigameDefinition,
  resolvePerformanceScore,
  rewardMultiplier,
  scoreChoice,
  scoreTimingAttempt
} from "../systems/minigames/ActivityMinigames";
import { calculateWarungRushPerformance, createWarungRushState, pickUpWarungDish, serveWarungOrder, updateWarungRush, WARUNG_DISH_LABELS } from "../systems/minigames/WarungRush";
import {
  applyDeliveryHazardContact,
  getDeliveryHazards,
  getDeliveryRideDensity,
  getDeliveryRunPerformance,
  getHazardVisibilityDistance,
  type DeliveryHazardDefinition
} from "../systems/ride/DeliveryRideMode";
import {
  createRideModelState,
  updateRideModel,
  type RideModelOutput,
  type RideModelState
} from "../systems/ride/RideModel";
import { canPlayerBeOnBike, resolveRequestedBikeState } from "../systems/ride/RideMode";
import { getRideTelemetry, type RideTelemetry } from "../systems/ride/RideTelemetry";
import { applyCargoDamage, shouldShowCargoCareChip } from "../systems/ride/CargoCare";
import {
  advanceRivalRaceGhost,
  applyRivalRaceOutcome,
  getRioRaceEligibility,
  getRivalRaceRoutePosition,
  resolveRivalRaceOutcome,
  RIO_RACE,
  type RivalRaceConfig
} from "../systems/ride/RivalRace";
import {
  getRelationshipChoiceScene,
  getRelationshipChoiceSceneForNpc,
  getRelationshipChoiceSkipOption,
  type RelationshipChoiceOption,
  type RelationshipChoiceScene
} from "../systems/relationships/RelationshipChoiceScenes";
import { getActiveEvents, getActiveEventsAtVenue, isEventActive } from "../systems/events/EventScheduler";
import { applyEventParticipation } from "../systems/events/EventParticipation";
import {
  buildCrewSessionOpenMessage,
  completeCrewSession,
  CREW_REGULAR_ATTENDANCE_COUNT,
  getKnownCrewStates,
  getCrewState,
  hasCompletedCrewSessionOccurrence,
  inviteToCrew,
  joinCrew
} from "../systems/crews/CrewSystem";
import { prepareAriCrewSessionBeat } from "../systems/story/Act2AriCrew";
import {
  buildKitchenCircleResidueMessage,
  completeKitchenCircleInvitation,
  consumeKitchenCircleDeflection,
  hasSeenKitchenCircleSqueeze,
  isKitchenCircleInvitationPending,
  isKitchenCircleSessionEvent,
  prepareKitchenCircleSessionBeat
} from "../systems/story/Act2KitchenCircle";
import {
  buildStructuralUnlockMessages,
  getStructuralEventMeterState,
  getStructuralNpcDialogueLine,
  getStructuralShopItemIds,
  getStructuralShopItemOffer,
  getWarungInteriorAccessState,
  purchaseKadekFocusBufferPastry
} from "../systems/story/Act2StructuralUnlocks";
import { canSleepNow } from "../systems/time/DailyClock";
import {
  createAuthoredDay1ClockState,
  setTimePhaseForBeat as applyTimePhaseForBeat,
  type AuthoredDay1ClockState,
  type Day1TimeBeat
} from "../systems/time/AuthoredDay1Clock";
import {
  isRideSurfaceSlick as isWeatherRideSurfaceSlick,
  isWeatherWet,
  WorldWeatherController,
  type WeatherKind
} from "../systems/weather/WorldWeather";
import {
  applyActivity,
  formatActivityPreview,
  getActivityAvailability,
  getVenuePurposeLine,
  getStationRhythmState,
  getVenueActivityContext,
  type ActivityAvailability,
  type VenueActivityContext
} from "../systems/life/ActivityEngine";
import { getSettlingInGoalTitle, updateSettlingInGoals } from "../systems/life/SettlingInGoals";
import { getStationSocialBridgeOptions } from "../systems/life/StationSocialBridge";
import { sleepAtHomeUntilMorning } from "../systems/life/SleepCycle";
import {
  applyAct0NegotiatedCompletionFee,
  completeAct0Step,
  getAct0ColdOpenCopy,
  getAct0MealProgressKindForActivity,
  isAct0Complete,
  markAct0MealProgress
} from "../systems/life/ActProgression";
import {
  FIRST_RUN_IBU_REDIRECT_TOAST,
  isAct0FirstRunGateActive,
  shouldStartAct0FirstRunGate,
  shouldRedirectAct0FirstRunInteraction
} from "../systems/life/FirstRunGate";
import { canUseHomeSleep, isPlayerAtHomeBase } from "../systems/life/HomeBase";
import {
  acceptDelivery,
  calculateDeliveryPayout,
  completeDelivery,
  getDeliveryOfferAvailability,
  getEffectiveDeliveryTerms,
  pickupDelivery,
  previewDeliveryCondition
} from "../systems/hustle/DeliverySystem";
import {
  getScooterRepairStatus,
  getScooterUpgradeStatus,
  payHustleRent,
  repairScooter,
  upgradeToDailyScooter
} from "../systems/hustle/HustleEconomy";
import { shouldOpenIbuHustleBoard as canOpenIbuHustleBoard } from "../systems/hustle/IbuHustleBoard";
import { isAct1MoveOutReady } from "../systems/hustle/HustleMilestones";
import {
  completeAct1LeoEncounter,
  getAct1LeoEncounterHookLine,
  isAct1LeoEncounterPending,
  triggerAct1RateCut
} from "../systems/story/Act1IncitingHook";
import { buildKadekRushOfferMessage } from "../systems/story/Act1KadekPriority";
import {
  buildMadeRoomOfferMessage,
  completeMadeRoomOfferScene,
  isMadeRoomOfferPending
} from "../systems/story/Act1MadeRoomOffer";
import {
  ACT1_BREAKDOWN_FLAG,
  isAct1BreakdownPushActive,
  isAct1ScooterBlown,
  triggerAct1Breakdown
} from "../systems/story/Act1Breakdown";
import {
  ACT1_LUXURY_TIP_PENDING_FLAG,
  ACT1_LUXURY_TIP_SCENE_ID,
  getVillaRegularAmbientLine,
  resolveAct1LuxuryTipChoice
} from "../systems/story/Act1LuxuryTip";
import {
  ACT1_MADE_KEY_FLAG,
  ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG,
  acceptMadeFinale,
  canMadeAcceptFinale,
  canSignWeeklyScooterContract,
  canStartIbuGuaranteeScene,
  completeAct1MoveOut,
  completeIbuGuaranteeScene,
  getAct1FinaleAmbientLine,
  isAct1MoveOutComplete,
  markMoveOutMontageStarted,
  signWeeklyScooterContract,
  startAct2AfterFinale
} from "../systems/story/Act1Finale";
import { flushAct1LeoCadence } from "../systems/story/Act1LeoCadence";
import {
  ACT0_STORM_DELIVERY_ID,
  ACT0_STORM_TRIGGER_MS,
  ACT0_VILLA_DELIVERY_ID,
  getAct0CriticalPathMenuOpenCount,
  getAct0DepositState,
  getAct0StormTriggerCount,
  isAct0StoryDelivery,
  markAct0StormTriggered,
  recordAct0CriticalPathMenuOpen,
  resolveAct0Deposit,
  revealAct0Deposit,
  completeAct0CafeScene,
  prepareAct0VillaOrder
} from "../systems/story/Act0BackHalf";
import { startAct0FirstDelivery } from "../systems/story/Act0Opening";
import { getMorningHandCards, shouldShowMorningHand, type MorningHandCard } from "../systems/hustle/MorningHand";
import {
  buildDayLedgerSummary,
  captureDayLedgerBaseline,
  type DayLedgerRow,
  type DayLedgerSummary
} from "../systems/life/DayLedger";
import {
  acceptOpportunity,
  appendOpportunityMessage,
  declineOpportunity,
  generateOpportunityPhoneTexts,
  getAbsoluteMinute as getOpportunityAbsoluteMinute,
  getLiveOpportunityCountdown,
  getOpportunityTemplate,
  getUnreadOpportunityMessageCount,
  maintainOpportunityPool,
  markOpportunityMessagesRead,
  resolveOpportunity
} from "../systems/opportunities/OpportunityEngine";
import {
  computeVenuePresentationLayout,
  getVenueFootprint,
  type MapPoint,
  type VenuePresentationPlacement
} from "../systems/map/VenuePresentation";
import {
  createWaterBoundaryGuard,
  resolveWaterBoundaryPosition,
  type WaterBoundaryGuard
} from "../systems/map/WaterBoundary";
import { bumpRelationshipAffinity, getAffinityTier, getRelationship } from "../systems/relationships/RelationshipMemory";
import { completeNextRelationshipArcBeat } from "../systems/relationships/RelationshipArcs";
import {
  clearWantedStanding,
  getBounty,
  getReputationScore,
  getWantedLevel,
  reduceWantedStanding
} from "../systems/reputation/ReputationState";
import { applyPlayerBikeHitConsequence } from "../systems/reputation/RecklessRiding";
import {
  directionFromDelta,
  npcIdleAnimationKey,
  npcReactionAnimationKey,
  selectCharacterAnimation
} from "../systems/animation/CharacterAnimations";
import { getScooterVisualState, type ScooterVisualState } from "../systems/animation/ScooterAnimation";
import {
  getInteractionFlourishSpec,
  type InteractionFlourishKind
} from "../systems/animation/InteractionFlourishes";
import {
  buildPayoutCelebrationSpec,
  getChapterCutsceneDelayMs,
  type PayoutCelebrationSpec
} from "../systems/animation/PayoutCelebration";
import {
  CARGO_FEEL_TUNING,
  DELIVERY_RIDE_FEEL_TUNING,
  PAYOUT_FEEL_TUNING,
  RIDE_FEEL_TUNING,
  WARUNG_RUSH_FEEL_TUNING
} from "../tuning/FeelTuning";
import {
  advanceClock,
  formatClock,
  getLocalPlayer,
  getTimePhase
} from "../systems/WorldState";
import { isQuestActive, isQuestComplete, startQuest } from "../systems/QuestSystem";
import { resolveNpcQuestInteraction } from "../systems/quests/QuestRegistry";
import { HudController } from "../ui/hud/HudController";
import { parsePhoneTab, PhoneShell } from "../ui/phone/PhoneShell";
import { TitleScreen } from "../ui/title/TitleScreen";
import { shouldAdvanceGameplayBehindMenu } from "../ui/title/TitleMenuState";
import { getPhoneCameraScale } from "../ui/phone/PhoneLayout";
import { getAllVenues, getVenue } from "../systems/venues/VenueRegistry";
import type {
  Direction,
  CrewState,
  ActiveActivityState,
  GameEvent,
  GameIntent,
  GroupTravelMode,
  InteriorDefinition,
  InteriorNpcSlotDefinition,
  Meter,
  MemoryType,
  NpcDefinition,
  PickupDefinition,
  PlayerEntityState,
  ReputationTag,
  ShopDefinition,
  OpportunityType,
  VenueActivityDefinition,
  WorldState
} from "../types";

type Mode =
  | "world"
  | "interior"
  | "dialogue"
  | "shop"
  | "inventory"
  | "activity"
  | "committedActivity"
  | "warungRush"
  | "community"
  | "phone"
  | "godmode"
  | "cutscene"
  | "title"
  | "pause";

interface CutsceneOverlay {
  container: Phaser.GameObjects.Container;
  topBar: Phaser.GameObjects.Rectangle;
  bottomBar: Phaser.GameObjects.Rectangle;
  dim: Phaser.GameObjects.Rectangle;
  cardScrim: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  subtitle: Phaser.GameObjects.Text;
}

interface RainDropRuntime {
  x: number;
  y: number;
  speed: number;
  length: number;
  drift: number;
  alpha: number;
}

const CAFE_AMBIENT_INTERIOR_IDS = new Set(["milk_madu_interior", "baked_berawa_interior", "satu_satu_interior"]);
const LEGACY_ARI_BEACH_GROUP_IDS = new Set(["berawa_run_crew", "berawa_surf_circle"]);

interface ActiveCutsceneRunner {
  script: CutsceneScript;
  elapsedMs: number;
  priorMode: Mode;
  overlay: CutsceneOverlay;
  onComplete?: () => void;
  activeStepId?: string;
  playerStart?: { x: number; y: number };
  actors?: Map<string, Phaser.GameObjects.Container>;
}

const SHOW_NPC_IDLE_DEBUG_LABELS = shouldShowNpcIdleCueLabel();
const TOAST_DURATION_MS = 2600;
const TOAST_GAP_MS = 180;
const TOAST_FADE_IN_MS = 150;
const TOAST_FADE_OUT_MS = 350;

interface BaliLifeDebugSnapshot {
  schemaVersion: number;
  mode: Mode;
  overlayOpen: boolean;
  player: {
    x: number;
    y: number;
    direction: Direction;
    hasBike: boolean;
    onBike: boolean;
    bikeStuck: boolean;
    bikeCondition: number;
    safety: number;
  };
  money: number;
  focus: number;
  socialEnergy: number;
  connections: number;
  meters: WorldState["meters"];
  reputation: number;
  wantedLevel: number;
  bounty: number;
  reputationTags: string[];
  lifestyleTags: string[];
  portal: string;
  act0Step: string;
  phoneStoryMoment: string | null;
  phoneStoryStep: number | null;
  deposit: ReturnType<typeof getAct0DepositState> | null;
  act0CriticalPathMenuOpens: number;
  act0StormTriggerCount: number;
  currentAct: number;
  completedDeliveryCount: number;
  rateCutFired: boolean;
  kadekPriority: boolean;
  breakdownFired: boolean;
  breakdownPushActive: boolean;
  scooterBlown: boolean;
  driverRating: number;
  activeDelivery: string | null;
  activeDeliveryStage: "accepted" | "picked_up" | null;
  activeDeliveryDueAt: number | null;
  deliveryRideRun: { elapsedMs: number; hazardsSpawned: number; hazardsAvoided: number; nearMisses: number; contacts: number } | null;
  cutscene: { id: string; stepId: string | null; elapsedMs: number } | null;
  fieldObjective: FieldObjectiveState;
  fieldObjectiveLine: string;
  worldSceneAudit: FieldFirstDiscoveryAudit;
  relationshipCount: number;
  inventory: string[];
  activeQuestIds: string[];
  completedQuestIds: string[];
  joinedClubIds: string[];
  crewStates: CrewState[];
  joinedGroupIds: string[];
  legacyJoinedGroupIds: string[];
  prompt: string;
  time: string;
  timePhase: string;
  authoredDay1Clock: AuthoredDay1ClockState;
  weather: { kind: WeatherKind; source: string | null; revision: number };
  ambientBed: string;
  rainDropCount: number;
  fps: number;
  activeGroupId?: string;
  groupTravelMode?: GroupTravelMode;
  groupHelpers: number;
  touchControlsVisible: boolean;
  nearestInteraction?: string;
  movementSpeedMultiplier: number;
  discoveredAreaIds: string[];
  discoveredVenueIds: string[];
  revealAllMap: boolean;
  trafficHitCooldown: number;
  npcRoutines: Record<string, string>;
  objectiveTargets: { x: number; y: number }[];
  activeInteriorId: string | null;
  interiorExit: { x: number; y: number } | null;
  interiorTransitioning: boolean;
  ride: RideTelemetry | null;
  updatedAt: number;
}

interface DevProofInteractionResult {
  ok: boolean;
  message: string;
}

interface DevProofBoardOffer {
  id: string;
  label: string;
  available: boolean;
  reason: string | null;
}

declare global {
  interface Window {
    __BALI_LIFE_DEBUG__?: BaliLifeDebugSnapshot;
    __BALI_LIFE_DEV_SENSATION__?: {
      setTimePhaseForBeat: (beat: Day1TimeBeat) => boolean;
      startWeather: (kind: Exclude<WeatherKind, "clear">) => boolean;
      stopWeather: () => boolean;
      enterKos: () => void;
      teleport: (x: number, y: number) => void;
    };
    __BALI_LIFE_DEV_PROOF__?: {
      bootState: (name: string, clock?: { day: number; minuteOfDay: number }) => DevProofInteractionResult;
      acceptDeliveryById: (id: string) => ReturnType<typeof acceptDelivery>;
      openPhoneTab: (tab: string) => DevProofInteractionResult;
      openVenuePanel: (venueId: string) => DevProofInteractionResult;
      enterInterior: (interiorId: string) => DevProofInteractionResult;
      payRent: () => ReturnType<typeof payHustleRent>;
      getBoardOffers: () => DevProofBoardOffer[];
      clickDialogueOption: (index: number) => DevProofInteractionResult;
      inviteCrew: (crewId: string) => DevProofInteractionResult;
      joinCrew: (crewId: string) => DevProofInteractionResult;
      setClock: (clock: { day: number; minuteOfDay: number }) => DevProofInteractionResult;
    };
  }
}

interface MudZoneDefinition {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GroupTravelerRuntime {
  id: string;
  name: string;
  hasBike: boolean;
  sprite: Phaser.GameObjects.Sprite;
  bikeSprite: Phaser.GameObjects.Sprite;
}

interface TrafficRouteDefinition {
  id: string;
  points: MapPoint[];
  length: number;
}

interface TrafficJunctionOption {
  route: TrafficRouteDefinition;
  pointIndex: number;
}

interface FieldObjectiveTarget {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  type: FieldObjectiveTargetRef["type"];
}

interface NpcAmbientLineBubble {
  container: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  tail: Phaser.GameObjects.Graphics;
}

type InteriorInteractionTarget =
  | { type: "exit"; label: string; interiorId: string }
  | { type: "delivery"; id: string; label: string }
  | { type: "npc"; id: string; label: string }
  | { type: "station"; id: string; label: string; activityVenueId: string };

interface TrafficBikeRuntime {
  sprite: Phaser.GameObjects.Sprite;
  route: TrafficRouteDefinition;
  targetIndex: number;
  direction: 1 | -1;
  speed: number;
  velocity: Phaser.Math.Vector2;
  seed: number;
}

interface DeliveryHazardRuntime {
  definition: DeliveryHazardDefinition;
  visual: Phaser.GameObjects.Graphics;
  approached: boolean;
  resolved: boolean;
  nearMissed: boolean;
}

interface WantedOffenderRuntime {
  id: string;
  name: string;
  sprite: Phaser.GameObjects.Sprite;
  bikeSprite: Phaser.GameObjects.Sprite;
  sign: Phaser.GameObjects.Text;
  cash: number;
  wantedLevel: number;
  route: Phaser.Math.Vector2[];
  routeIndex: number;
  speed: number;
}

interface RivalRaceRuntime {
  config: RivalRaceConfig;
  elapsedMs: number;
  checkpointIndex: number;
  ghostProgress: number;
  ghostFinishedAtMs?: number;
}

interface MinimapLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

const WALK_SPEED = scaleDistance(78);
const BIKE_PUSH_SPEED = scaleDistance(48);
const BIKE_SPEED = scaleDistance(RIDE_FEEL_TUNING.baseBikeSpeed);
const GROUP_WALK_SPEED = scaleDistance(92);
const GROUP_BIKE_SPEED = scaleDistance(255);
const RIDE_NEAR_MISS_RADIUS = scaleDistance(RIDE_FEEL_TUNING.nearMissRadius);
const RIDE_NEAR_MISS_INNER_RADIUS = scaleDistance(RIDE_FEEL_TUNING.nearMissInnerRadius);
const RIDE_NEAR_MISS_COOLDOWN_MS = RIDE_FEEL_TUNING.nearMissCooldownMs;
const BIKE_RENTAL_ITEM_ID = "scooter_rental";
const SCOOTER_KEY_ITEM_ID = "scooter_key";
const REQUIRED_BIKE_HELPERS = 5;
const MAX_PLAYER_WANTED_LEVEL = 3;
const MAX_PLAYER_BOUNTY = 120;
const MAX_BOUNTY_REWARD = 55;
const FIRST_FLAG_BOUNTY = 20;
const REPEAT_FLAG_BOUNTY = 35;
const TRAFFIC_HIT_COOLDOWN_MS = 2200;
const TRAFFIC_HIT_MONEY_LOSS = 10;
const TRAFFIC_KNOCKBACK_DISTANCE = scaleDistance(76);
const CARGO_HARD_COLLISION_COOLDOWN_MS = CARGO_FEEL_TUNING.hardCollisionCooldownMs;
const CARGO_HARD_COLLISION_SPEED = scaleDistance(CARGO_FEEL_TUNING.hardCollisionSpeed);
const WATER_BOUNDARY_TOAST_COOLDOWN_MS = 1800;
const VENUE_LABEL_NEAR_RADIUS = scaleDistance(210);
const NPC_PROXIMITY_REACTION_RADIUS = scaleDistance(112);
const NPC_PROXIMITY_REACTION_LABEL_MS = 950;
const VENUE_LABEL_STACK_DISTANCE = scaleDistance(92);
const MAX_VISIBLE_VENUE_LABELS = 5;
const MINIMAP_MAX_WIDTH = 280;
const MINIMAP_MIN_WIDTH = 104;
const MINIMAP_PADDING = 7;
const PRESENTED_BERAWA_ROADS = getPresentedRoads(berawaRoads);
const VENUE_SNAP_ROADS = getVenueSnapRoads(berawaRoads);
const TRAFFIC_BIKE_COUNT = 8;
const TRAFFIC_ROUTE_MIN_LENGTH = scaleDistance(230);
const PLAYER_BODY_WIDTH = Math.min(48, PLAYER_UNIT.width);
const PLAYER_BODY_HEIGHT = Math.min(48, PLAYER_UNIT.height);
const PLAYER_BODY_OFFSET_X = Math.max(0, (48 - PLAYER_BODY_WIDTH) / 2);
const PLAYER_BODY_OFFSET_Y = Math.max(0, 48 - PLAYER_BODY_HEIGHT - 2);
const CHARACTER_SPRITE_SCALE = 0.84;
const PLAYER_BIKE_SPRITE_SCALE = 0.82;
const TRAFFIC_BIKE_SPRITE_SCALE = 0.88;
const MAX_STATIC_MAP_BAKE_SCALE = 2.5;
const FALLBACK_MAX_TEXTURE_SIZE = 4096;
const TRAFFIC_ROUTES: TrafficRouteDefinition[] = PRESENTED_BERAWA_ROADS
  .filter((entry) => entry.visualClass !== "lane" && entry.length >= TRAFFIC_ROUTE_MIN_LENGTH && entry.road.points.length > 1)
  .map((entry) => ({
    id: entry.road.id,
    points: entry.road.points,
    length: entry.length
  }));
const TRAFFIC_JUNCTIONS = buildTrafficJunctionIndex(TRAFFIC_ROUTES);
const BIKE_TERRAIN_STUCK_ENABLED = false;
const BIKE_MUD_ZONES: MudZoneDefinition[] = [
  {
    id: "berawa-shortcut-mud",
    label: "the soft Berawa shortcut mud",
    ...scaleRectDefinition(1910, 700, 260, 80)
  },
  {
    id: "beach-soft-sand",
    label: "the deep beach sand",
    ...scaleRectDefinition(0, 1320, 2400, 170)
  }
];
const UI_DEPTH = 1200;

function scaleRectDefinition(x: number, y: number, width: number, height: number): Omit<MudZoneDefinition, "id" | "label"> {
  return {
    x: scaleDistance(x),
    y: scaleDistance(y),
    width: scaleDistance(width),
    height: scaleDistance(height)
  };
}

function worldVector(x: number, y: number): Phaser.Math.Vector2 {
  const point = scalePoint({ x, y });
  return new Phaser.Math.Vector2(point.x, point.y);
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function formatMeterDeltaSummary(world: WorldState, deltas: Partial<Record<Meter, number>>): string {
  return formatVisibleMeterDeltas(world, deltas);
}

function buildTrafficJunctionIndex(routes: TrafficRouteDefinition[]): Map<string, TrafficJunctionOption[]> {
  const junctions = new Map<string, TrafficJunctionOption[]>();
  for (const route of routes) {
    route.points.forEach((point, pointIndex) => {
      const key = trafficPointKey(point);
      const options = junctions.get(key) ?? [];
      options.push({ route, pointIndex });
      junctions.set(key, options);
    });
  }
  for (const [key, options] of junctions) {
    const uniqueRouteCount = new Set(options.map((option) => option.route.id)).size;
    if (uniqueRouteCount < 2) {
      junctions.delete(key);
    }
  }
  return junctions;
}

function trafficPointKey(point: MapPoint): string {
  return `${Math.round(point.x)}:${Math.round(point.y)}`;
}

export class GameScene extends Phaser.Scene {
  private world!: WorldState;
  private playerState!: PlayerEntityState;
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;
  private npcSprites = new Map<string, Phaser.Physics.Arcade.Sprite>();
  private npcRouteMotion = new Map<string, NpcRouteMotionState>();
  private npcIdlePhases = new Map<string, number>();
  private npcIdleLabels = new Map<string, Phaser.GameObjects.Text>();
  private npcReactionNear = new Map<string, boolean>();
  private npcReactionCooldowns = new Map<string, number>();
  private npcReactionLabels = new Map<string, Phaser.GameObjects.Text>();
  private npcReactionCues = new Map<string, { cue: string; remainingMs: number }>();
  private npcReactionAnimationTimers = new Map<string, number>();
  private npcFacingDirections = new Map<string, Direction>();
  private npcTalkBobTimers = new Map<string, number>();
  private npcAmbientLines = new Map<string, { text: string; remainingMs: number }>();
  private npcAmbientLineBubbles = new Map<string, NpcAmbientLineBubble>();
  private ambientNpcSprites = new Map<string, Phaser.Physics.Arcade.Sprite>();
  private ambientNpcRouteMotion = new Map<string, NpcRouteMotionState>();
  private ambientNpcIdlePhases = new Map<string, number>();
  private ambientNpcFacingDirections = new Map<string, Direction>();
  private pickupSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private playerBike?: Phaser.GameObjects.Sprite;
  private playerBikeSpeedCue?: Phaser.GameObjects.Graphics;
  private scooterMotionElapsedMs = 0;
  private trafficBikes: TrafficBikeRuntime[] = [];
  private trafficRouteCursor = 0;
  private trafficHitCooldown = 0;
  private cargoHardCollisionCooldown = 0;
  private bikeHarmCooldown = 0;
  private groupLeader?: GroupTravelerRuntime;
  private groupFollowers: GroupTravelerRuntime[] = [];
  private groupRoute: Phaser.Math.Vector2[] = [];
  private groupRouteIndex = 0;
  private wantedOffenders = new Map<string, WantedOffenderRuntime>();
  private playerWantedSign?: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: GameKeyMap;
  private mode: Mode = "world";
  private network: NetworkAdapter = new LocalNetworkAdapter();
  private dispatcher = new IntentDispatcher();
  private interactionController!: InteractionController;
  private inputController!: InputController;
  private dialogueProvider: DialogueProvider = new ScriptedDialogueProvider();
  private soundManager = new SoundManager();
  private authoredDay1Clock: AuthoredDay1ClockState = createAuthoredDay1ClockState();
  private weather = new WorldWeatherController();
  private ambientSceneOverride: AmbientScene | null = null;
  private hudController!: HudController;
  private phone?: PhoneShell;
  private titleScreen?: TitleScreen;
  private sessionStartedAt: number | null = null;
  private skipTitleScreenForFreshStart = false;
  private act0FirstRunGateSessionActive = false;
  private showMovementTutorialPrompt = false;
  private activeInteriorId: string | null = null;
  private interiorReturnPoint?: { x: number; y: number };
  private renderedInteriorIds = new Set<string>();
  private interiorDinerSprites = new Map<string, Phaser.GameObjects.Sprite[]>();
  private interiorTransitioning = false;
  private godmodePanel?: Phaser.GameObjects.Container;
  private movementSpeedMultiplier = 1;
  private discoveryLabels: Array<{ subjectType: "area" | "venue"; id: string; label: Phaser.GameObjects.Text }> = [];
  private streetSigns: StreetSignHandle[] = [];
  private unsubscribeNetwork?: () => void;
  private networkPushTimer = 0;
  private autosaveTimer = 0;
  private opportunityUpdateTimer = 0;
  private phoneBuzzTimer = 0;

  private hudLayer!: Phaser.GameObjects.Container;
  private hudChrome!: Phaser.GameObjects.Graphics;
  private timeText!: Phaser.GameObjects.Text;
  private questText!: Phaser.GameObjects.Text;
  private wantedChipText!: Phaser.GameObjects.Text;
  private depositChipText!: Phaser.GameObjects.Text;
  private bikeChipText!: Phaser.GameObjects.Text;
  private cargoChipText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;
  private toastTimer = 0;
  private toastGapTimer = 0;
  private toastQueue: string[] = [];
  private activeCutscene?: ActiveCutsceneRunner;
  private cutsceneDeferredSave = false;
  private pendingAct2CutscenePreviousAct?: number;
  private payoutCelebration?: {
    container: Phaser.GameObjects.Container;
    countText: Phaser.GameObjects.Text;
    ratingText: Phaser.GameObjects.Text;
    rentText?: Phaser.GameObjects.Text;
    countTween: Phaser.Tweens.Tween;
    spec: PayoutCelebrationSpec;
  };
  private hudObjectiveTitle = "";
  private hudObjectiveDetailUntil = 0;
  private panel?: Phaser.GameObjects.Container;
  private homeBaseMarker?: Phaser.GameObjects.Container;
  private dialogueOverlay?: HTMLElement;
  private pendingDialogueContinuation?: () => void;
  private activityMenuOverlay?: HTMLElement;
  private committedActivity?: ActiveActivityState;
  private committedActivityOverlay?: HTMLElement;
  private committedActivityProgress?: HTMLDivElement;
  private committedActivityStatus?: HTMLDivElement;
  private committedMinigameMarker?: HTMLDivElement;
  private committedMinigameFeedback?: HTMLDivElement;
  private warungRushVisuals?: Phaser.GameObjects.Graphics;
  private warungRushCustomers: Phaser.GameObjects.Sprite[] = [];
  private deliveryHazards: DeliveryHazardRuntime[] = [];
  private deliveryHazardDeliveryId: string | null = null;
  private deliveryHazardContactCooldown = 0;
  private activeRivalRace?: RivalRaceRuntime;
  private rivalRaceGhost?: Phaser.GameObjects.Sprite;
  private rivalRaceMarkerLayer!: Phaser.GameObjects.Graphics;
  private rideModelState: RideModelState = createRideModelState();
  private rideModelOutput: RideModelOutput | null = null;
  private rideCameraOffsetX = 0;
  private rideCameraOffsetY = 0;
  private nearMissFeedbackCooldown = 0;
  private awaitingRelationshipChoice = false;
  private activeRelationshipChoiceScene?: RelationshipChoiceScene;
  private pendingChoiceOpportunityId?: string;
  private nightOverlayLayer!: Phaser.GameObjects.Container;
  private nightOverlay!: Phaser.GameObjects.Graphics;
  private lanternGlow!: Phaser.GameObjects.Graphics;
  private weatherOverlayLayer!: Phaser.GameObjects.Container;
  private wetStreetTint!: Phaser.GameObjects.Graphics;
  private rainLayer!: Phaser.GameObjects.Graphics;
  private thunderFlash!: Phaser.GameObjects.Graphics;
  private rainDrops: RainDropRuntime[] = [];
  private thunderFlashAlpha = 0;
  private objectiveArrowLayer!: Phaser.GameObjects.Graphics;
  private discoveryToastCooldown = 0;
  private waterBoundaryToastCooldown = 0;
  private waterBoundaryGuard: WaterBoundaryGuard = createWaterBoundaryGuard(berawaMapFeatures, {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT
  });
  private opportunityMarkerLayer!: Phaser.GameObjects.Graphics;
  private deliveryMarkerLayer!: Phaser.GameObjects.Graphics;
  private fieldIndicatorLayer!: Phaser.GameObjects.Graphics;
  private worldSceneLayer!: Phaser.GameObjects.Graphics;
  private worldSceneLabels = new Map<string, Phaser.GameObjects.Text>();
  private opportunityMarkerZones: Phaser.GameObjects.Zone[] = [];

  constructor() {
    super("GameScene");
  }

  init(data?: { startFresh?: boolean }): void {
    this.skipTitleScreenForFreshStart = Boolean(data?.startFresh);
    this.authoredDay1Clock = createAuthoredDay1ClockState();
    this.weather = new WorldWeatherController();
    this.ambientSceneOverride = null;
    this.rainDrops = [];
    this.thunderFlashAlpha = 0;
  }

  create(): void {
    const hasSaveAtBoot = !this.skipTitleScreenForFreshStart && hasSavedWorldState();
    this.world = loadWorldState();
    this.playerState = getLocalPlayer(this.world);
    this.phone = new PhoneShell({
      scene: this,
      getWorld: () => this.world,
      dispatcher: this.dispatcher,
      getNow: () => this.getAbsoluteMinute(),
      save: () => this.requestSave(),
      toast: (message) => this.showToast(message),
      playUiClick: () => this.playUiClick(),
      isAudioMuted: () => this.soundManager.isMuted,
      onAudioMutedChange: (muted) => this.setAudioMuted(muted),
      onOpportunityAccept: (opportunityId) => this.acceptPhoneOpportunity(opportunityId),
      onOpportunityTrack: (opportunityId) => this.trackPhoneOpportunity(opportunityId),
      onDeliveryAccept: (deliveryId) => this.acceptPhoneDelivery(deliveryId),
      onPayRent: () => this.payPhoneRent(),
      onRepairScooter: () => this.repairPhoneScooter(),
      onUpgradeScooter: () => this.upgradePhoneScooter(),
      onFeedViewed: () => this.markPhoneFeedRead(),
      onFeedback: () => this.sendFeedback(),
      onClose: () => {
        if (this.mode === "phone") {
          this.mode = this.activeInteriorId ? "interior" : "world";
        }
      }
    });

    this.physics.world.setBounds(
      authoredPlayableBounds.x,
      authoredPlayableBounds.y,
      authoredPlayableBounds.width,
      authoredPlayableBounds.height
    );
    this.drawNeighborhood();
    this.createCollision();
    this.createPickups();
    this.createNpcs();
    this.createAmbientNpcs();
    this.createPlayer();
    this.createTrafficBikes();
    this.createWantedOffenders();
    this.createInteractionController();
    this.createInput();
    this.createHud();
    this.updateMapDiscovery(true, !this.skipTitleScreenForFreshStart);
    this.updateOpportunityFeed(0, true);

    if (import.meta.env.DEV && typeof window !== "undefined") {
      window.__BALI_LIFE_DEV_SENSATION__ = {
        setTimePhaseForBeat: (beat) => this.setTimePhaseForBeat(beat),
        startWeather: (kind) => this.startWeather(kind),
        stopWeather: () => this.stopWeather(),
        enterKos: () => this.enterInterior("cheap_kos_interior"),
        teleport: (x, y) => this.devTeleport(x, y)
      };
    }
    if (import.meta.env.DEV && typeof window !== "undefined") {
      void import("../dev/DevProofStates").then(({ buildDevProofBootState, isDevProofBootStateName }) => {
        window.__BALI_LIFE_DEV_PROOF__ = {
          bootState: (name, clock) => {
            if (!isDevProofBootStateName(name)) {
              return { ok: false, message: `Unknown proof boot state: ${name}.` };
            }
            try {
              const authoredWorld = buildDevProofBootState(name);
              if (
                clock &&
                Number.isFinite(clock.day) &&
                Number.isFinite(clock.minuteOfDay) &&
                clock.day >= 1 &&
                clock.minuteOfDay >= 0 &&
                clock.minuteOfDay < 1440
              ) {
                authoredWorld.clock.day = Math.floor(clock.day);
                authoredWorld.clock.minuteOfDay = Math.floor(clock.minuteOfDay);
              }
              saveWorldState(authoredWorld);
              window.sessionStorage.setItem("bali-life-rpg.dev-proof-resume", name);
              window.setTimeout(() => window.location.reload(), 0);
              return { ok: true, message: `Booting ${name}.` };
            } catch (error) {
              return { ok: false, message: error instanceof Error ? error.message : String(error) };
            }
          },
          acceptDeliveryById: (id) => this.acceptPhoneDelivery(id),
          openPhoneTab: (tab) => this.devOpenPhoneTab(tab),
          openVenuePanel: (venueId) => this.devOpenVenuePanel(venueId),
          enterInterior: (interiorId) => this.devEnterInterior(interiorId),
          payRent: () => {
            const result = payHustleRent(this.world, this.getAbsoluteMinute());
            saveWorldState(this.world);
            this.phone?.refresh();
            return result;
          },
          getBoardOffers: () => this.devGetBoardOffers(),
          clickDialogueOption: (index) => this.devClickDialogueOption(index),
          inviteCrew: (crewId) => {
            const result = inviteToCrew(this.world, crewId);
            saveWorldState(this.world);
            this.phone?.refresh();
            return result;
          },
          joinCrew: (crewId) => {
            const result = joinCrew(this.world, crewId);
            saveWorldState(this.world);
            this.phone?.refresh();
            return result;
          },
          setClock: (clock) => {
            if (
              !Number.isFinite(clock?.day) ||
              !Number.isFinite(clock?.minuteOfDay) ||
              clock.day < 1 ||
              clock.minuteOfDay < 0 ||
              clock.minuteOfDay >= 1440
            ) {
              return { ok: false, message: "Proof clock requires day >= 1 and minuteOfDay in 0..1439." };
            }
            this.world.clock.day = Math.floor(clock.day);
            this.world.clock.minuteOfDay = Math.floor(clock.minuteOfDay);
            this.updateLighting();
            this.updateOpportunityFeed(0, true);
            saveWorldState(this.world);
            this.phone?.refresh();
            return { ok: true, message: `Clock set to ${formatClock(this.world)}.` };
          }
        };
        const resumeName = window.sessionStorage.getItem("bali-life-rpg.dev-proof-resume");
        if (resumeName) {
          window.sessionStorage.removeItem("bali-life-rpg.dev-proof-resume");
          this.resumeFromMenu();
          const proofVenueId = new URLSearchParams(window.location.search).get("proofVenue");
          if (proofVenueId) {
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("proofVenue");
            window.history.replaceState({}, "", cleanUrl);
            window.setTimeout(() => this.devOpenVenuePanel(proofVenueId), 0);
          }
        } else {
          const proofStateName = new URLSearchParams(window.location.search).get("proofState");
          if (proofStateName) {
            const cleanUrl = new URL(window.location.href);
            const proofDay = Number(cleanUrl.searchParams.get("proofDay"));
            const proofMinute = Number(cleanUrl.searchParams.get("proofMinute"));
            const proofClock = Number.isFinite(proofDay) && Number.isFinite(proofMinute)
              ? { day: proofDay, minuteOfDay: proofMinute }
              : undefined;
            cleanUrl.searchParams.delete("proofState");
            cleanUrl.searchParams.delete("proofDay");
            cleanUrl.searchParams.delete("proofMinute");
            window.history.replaceState({}, "", cleanUrl);
            window.__BALI_LIFE_DEV_PROOF__.bootState(proofStateName, proofClock);
          }
        }
      });
    }

    this.cameras.main.setBounds(
      authoredPlayableBounds.x,
      authoredPlayableBounds.y,
      authoredPlayableBounds.width,
      authoredPlayableBounds.height
    );
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.layoutForViewport();

    this.unsubscribeNetwork = this.network.subscribeToWorldPatches(() => undefined);
    void this.network.connect(this.world);

    if (this.skipTitleScreenForFreshStart) {
      this.skipTitleScreenForFreshStart = false;
      this.sessionStartedAt = Date.now();
      this.startAct0Opening();
    } else {
      this.openTitleScreen(hasSaveAtBoot, "title");
    }
  }

  update(_time: number, delta: number): void {
    const menuOpen = !shouldAdvanceGameplayBehindMenu(this.mode) || Boolean(this.activeCutscene);
    if (!menuOpen) {
      advanceClock(this.world, delta);
    }
    this.discoveryToastCooldown = Math.max(0, this.discoveryToastCooldown - delta);
    this.waterBoundaryToastCooldown = Math.max(0, this.waterBoundaryToastCooldown - delta);
    this.nearMissFeedbackCooldown = Math.max(0, this.nearMissFeedbackCooldown - delta);
    if (!menuOpen) {
      this.autosaveTimer += delta;
      if (this.autosaveTimer > 15000) {
        this.autosaveTimer = 0;
        this.requestSave();
      }
    }
    this.updateCutscene(delta);

    this.updatePlayer(delta);
    if (!menuOpen) {
      this.updateRivalRace(delta);
      this.updateDeliveryRideMode(delta);
    }
    if (!this.activeCutscene) {
      this.updateMapDiscovery();
    }
    this.updateStreetSignVisibility();
    this.updateTraffic(delta);
    this.updateWantedOffenders(delta);
    this.updateGroupLine(delta);
    this.updateNpcRoutines(delta);
    this.updateAmbientNpcs(delta);
    this.updatePickups();
    this.updateOpportunityFeed(delta);
    if (!menuOpen) {
      this.updateCommittedActivity(delta);
      this.updateWarungRush(delta);
    }
    this.updateHud(delta);
    this.updateLighting();
    this.updateWeather(delta);
    this.updateDynamicObjectCulling();
    this.phone?.syncToCamera();
  }

  destroy(): void {
    this.clearDeliveryHazards();
    this.destroyDialogueOverlay();
    this.destroyCommittedActivityOverlay();
    this.activeCutscene?.overlay.container.destroy(true);
    for (const actor of this.activeCutscene?.actors?.values() ?? []) {
      actor.destroy(true);
    }
    this.activeCutscene = undefined;
    this.soundManager.destroy();
    if (import.meta.env.DEV && typeof window !== "undefined") {
      delete window.__BALI_LIFE_DEV_SENSATION__;
      delete window.__BALI_LIFE_DEV_PROOF__;
    }
    this.unsubscribeNetwork?.();
    this.network.disconnect();
  }

  private drawNeighborhood(): void {
    this.streetSigns = renderStreetTemplate(this, activeStreetTemplate).signs;
    this.opportunityMarkerLayer = this.add.graphics().setDepth(210);
    this.deliveryMarkerLayer = this.add.graphics().setDepth(211);
    this.rivalRaceMarkerLayer = this.add.graphics().setDepth(211.5);
    this.fieldIndicatorLayer = this.add.graphics().setDepth(212);
    this.worldSceneLayer = this.add.graphics().setDepth(213);
    this.addAreaLabels();
    this.drawHomeBaseStationMarker();
  }

  private drawHomeBaseStationMarker(): void {
    this.homeBaseMarker?.destroy(true);
    const home = getPlayerHomeBase(this.world);
    const container = this.add.container(home.x, home.y).setDepth(home.y + 2);
    const g = this.add.graphics();
    const x = 0;
    const y = 0;
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(x, y + scaleDistance(34), scaleDistance(92), scaleDistance(24), 28);
    g.fillStyle(0xf2dfb8, 1);
    g.fillRoundedRect(x - scaleDistance(42), y - scaleDistance(26), scaleDistance(84), scaleDistance(62), scaleDistance(7));
    g.fillStyle(0x4f8f66, 1);
    g.beginPath();
    g.moveTo(x - scaleDistance(50), y - scaleDistance(22));
    g.lineTo(x, y - scaleDistance(62));
    g.lineTo(x + scaleDistance(50), y - scaleDistance(22));
    g.closePath();
    g.fillPath();
    g.fillStyle(0x253a35, 1);
    g.fillRoundedRect(x - scaleDistance(11), y + scaleDistance(4), scaleDistance(22), scaleDistance(32), scaleDistance(3));
    g.fillStyle(0xf7eac1, 1);
    g.fillCircle(x + scaleDistance(6), y + scaleDistance(20), scaleDistance(2));
    g.lineStyle(scaleDistance(2), 0x6b3f2a, 0.8);
    g.strokeRoundedRect(x - scaleDistance(33), y + scaleDistance(12), scaleDistance(18), scaleDistance(16), scaleDistance(3));
    const label = this.add
      .text(x, y - scaleDistance(18), home.id === "shared_room" ? "HOME" : "KOS", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: `${Math.max(10, scaleDistance(10))}px`,
        fontStyle: "900",
        color: "#fff8de",
        backgroundColor: "#253a35",
        padding: { x: 4, y: 2 }
      })
      .setOrigin(0.5)
      .setResolution(2);
    container.add([g, label]);
    this.homeBaseMarker = container;
  }

  private getStaticMapBakeScale(): number {
    const dpr = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
    const zoomTarget = Math.max(POKEMON_SCALE.camera.desktopZoom, POKEMON_SCALE.camera.mobileZoom);
    const maxTextureSize = this.getRendererMaxTextureSize();
    const textureLimitScale = Math.max(1, (maxTextureSize - 16) / Math.max(WORLD_WIDTH, WORLD_HEIGHT));
    return Math.min(MAX_STATIC_MAP_BAKE_SCALE, textureLimitScale, Math.max(1, dpr * zoomTarget));
  }

  private getRendererMaxTextureSize(): number {
    const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer & {
      getMaxTextureSize?: () => number;
    };
    if (typeof renderer.getMaxTextureSize === "function") {
      return renderer.getMaxTextureSize();
    }
    return FALLBACK_MAX_TEXTURE_SIZE;
  }

  private drawStaticNeighborhood(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x66a36a, 1);
    g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const vegetationStep = scaleDistance(48);
    for (let y = 0; y < scaleDistance(1230); y += vegetationStep) {
      for (let x = 0; x < WORLD_WIDTH; x += vegetationStep) {
        const tint = (x / vegetationStep + y / vegetationStep) % 3 === 0 ? 0x79b779 : 0x4e8f5a;
        g.fillStyle(tint, 0.09);
        g.fillCircle(x + scaleDistance(12), y + scaleDistance(18), scaleDistance(2));
        g.fillCircle(x + scaleDistance(35), y + scaleDistance(38), Math.max(1, scaleDistance(1.4)));
      }
    }

    this.drawBeach(g);
    this.drawRoads(g);
    this.drawCuratedVenueBuildings(g);
  }

  private drawBeach(g: Phaser.GameObjects.Graphics): void {
    if (berawaMapFeatures.length > 0) {
      this.drawOsmBeach(g);
      return;
    }
    this.drawFallbackBeach(g);
  }

  private drawFallbackBeach(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0xd9b875, 1);
    g.fillRect(0, scaleDistance(1160), WORLD_WIDTH, scaleDistance(360));
    g.fillStyle(0xcda561, 0.55);
    for (let x = scaleDistance(20); x < WORLD_WIDTH; x += scaleDistance(80)) {
      g.fillCircle(x, scaleDistance(1245) + ((x / scaleDistance(40)) % 5) * scaleDistance(18), scaleDistance(3));
      g.fillCircle(x + scaleDistance(28), scaleDistance(1370) + ((x / scaleDistance(50)) % 4) * scaleDistance(14), scaleDistance(2));
    }

    g.fillStyle(0x18708b, 1);
    g.fillRect(0, scaleDistance(1505), WORLD_WIDTH, scaleDistance(195));
    g.fillStyle(0x43c3c5, 0.75);
    for (let y = scaleDistance(1530); y < WORLD_HEIGHT; y += scaleDistance(44)) {
      for (let x = 0; x < WORLD_WIDTH; x += scaleDistance(180)) {
        g.lineStyle(scaleDistance(3), 0x9ee6df, 0.6);
        g.beginPath();
        g.moveTo(x, y);
        for (let step = 1; step <= 12; step += 1) {
          const progress = step / 12;
          g.lineTo(x + progress * scaleDistance(160), y + Math.sin(progress * Math.PI * 2) * scaleDistance(14));
        }
        g.strokePath();
      }
    }

    g.lineStyle(scaleDistance(3), 0xf4dfaa, 0.64);
    g.beginPath();
    g.moveTo(0, scaleDistance(1175));
    for (let x = 0; x <= WORLD_WIDTH; x += scaleDistance(120)) {
      g.lineTo(x, scaleDistance(1190) + Math.sin(x / scaleDistance(190)) * scaleDistance(28));
    }
    g.strokePath();
  }

  private drawOsmBeach(g: Phaser.GameObjects.Graphics): void {
    const coastline = berawaMapFeatures
      .filter((feature) => feature.kind === "coastline")
      .flatMap((feature) => feature.points)
      .sort((a, b) => a.y - b.y || a.x - b.x);

    if (coastline.length > 1) {
      g.fillStyle(0x18708b, 1);
      g.beginPath();
      g.moveTo(coastline[0].x, coastline[0].y);
      for (const point of coastline.slice(1)) {
        g.lineTo(point.x, point.y);
      }
      g.lineTo(0, WORLD_HEIGHT);
      g.lineTo(0, coastline[0].y);
      g.closePath();
      g.fillPath();

      g.lineStyle(scaleDistance(4), 0x9ee6df, 0.72);
      this.strokeRoadPath(g, coastline);
      for (let index = 0; index < coastline.length; index += 5) {
        const point = coastline[index];
        g.lineStyle(scaleDistance(2), 0x9ee6df, 0.38);
        g.beginPath();
        g.arc(point.x - scaleDistance(18), point.y + scaleDistance(16), scaleDistance(18), Phaser.Math.DegToRad(205), Phaser.Math.DegToRad(335));
        g.strokePath();
      }
    }

    for (const feature of berawaMapFeatures.filter((candidate) => candidate.kind === "water")) {
      this.fillMapFeature(g, feature, 0x2d9ab0, 0.66, 0x9ee6df, 0.32);
    }

    for (const feature of berawaMapFeatures.filter((candidate) => candidate.kind === "beach")) {
      this.fillMapFeature(g, feature, 0xd9b875, 0.96, 0xf4dfaa, 0.54);
      g.fillStyle(0xcda561, 0.38);
      for (const point of feature.points.filter((_, index) => index % 4 === 0)) {
        g.fillCircle(point.x, point.y, scaleDistance(3));
      }
    }
  }

  private fillMapFeature(
    g: Phaser.GameObjects.Graphics,
    feature: MapFeatureDefinition,
    fill: number,
    alpha: number,
    stroke: number,
    strokeAlpha: number
  ): void {
    if (feature.points.length < 3) {
      return;
    }
    g.fillStyle(fill, alpha);
    g.beginPath();
    g.moveTo(feature.points[0].x, feature.points[0].y);
    for (const point of feature.points.slice(1)) {
      g.lineTo(point.x, point.y);
    }
    g.closePath();
    g.fillPath();
    g.lineStyle(scaleDistance(2), stroke, strokeAlpha);
    this.strokeRoadPath(g, feature.points);
  }

  private drawRoads(g: Phaser.GameObjects.Graphics): void {
    for (const entry of PRESENTED_BERAWA_ROADS) {
      const shoulderWidth = entry.width + scaleDistance(entry.visualClass === "lane" ? 8 : 16);
      g.lineStyle(shoulderWidth, 0x8d8c73, entry.visualClass === "lane" ? 0.38 : 0.5);
      this.strokeRoadPath(g, entry.road.points);
    }

    for (const entry of PRESENTED_BERAWA_ROADS) {
      const roadColor = entry.visualClass === "lane" ? 0xcac4aa : entry.visualClass === "secondary" ? 0xded0b0 : 0xf0dfb9;
      g.lineStyle(entry.width, roadColor, 1);
      this.strokeRoadPath(g, entry.road.points);
      g.lineStyle(scaleDistance(2), 0x8b8068, 0.36);
      this.strokeRoadPath(g, entry.road.points);

      if (entry.visualClass === "main") {
        g.lineStyle(scaleDistance(4), 0xfff7d3, 0.74);
        this.drawDashedPath(g, entry.road.points, scaleDistance(54), scaleDistance(62));
      } else if (entry.visualClass === "secondary") {
        g.lineStyle(scaleDistance(3), 0xfff0bd, 0.34);
        this.drawDashedPath(g, entry.road.points, scaleDistance(34), scaleDistance(58));
      }
    }
  }

  private strokeRoadPath(g: Phaser.GameObjects.Graphics, points: Array<{ x: number; y: number }>): void {
    if (points.length < 2) {
      return;
    }
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
      g.lineTo(point.x, point.y);
    }
    g.strokePath();
  }

  private drawDashedPath(
    g: Phaser.GameObjects.Graphics,
    points: Array<{ x: number; y: number }>,
    dashLength: number,
    gapLength: number
  ): void {
    for (let index = 1; index < points.length; index += 1) {
      const start = points[index - 1];
      const end = points[index];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= 0) {
        continue;
      }
      const ux = dx / distance;
      const uy = dy / distance;
      for (let walked = 0; walked < distance; walked += dashLength + gapLength) {
        const dashEnd = Math.min(distance, walked + dashLength);
        g.lineBetween(start.x + ux * walked, start.y + uy * walked, start.x + ux * dashEnd, start.y + uy * dashEnd);
      }
    }
  }

  private drawCuratedVenueBuildings(g: Phaser.GameObjects.Graphics): void {
    for (const placement of computeVenuePresentationLayout(curatedVenueNodes, VENUE_SNAP_ROADS)) {
      if (placement.node.category === "beach") {
        this.drawBeachVenueMarker(g, placement.node);
      } else {
        this.drawCuratedVenueBuilding(g, placement);
      }
    }
  }

  private drawCuratedVenueBuilding(g: Phaser.GameObjects.Graphics, placement: VenuePresentationPlacement): void {
    const { node } = placement;
    const size = placement;
    const palette = this.venuePalette(node.category);
    const corner = node.isLandmark ? 10 : 6;

    g.fillStyle(0x1b1713, 0.11);
    this.fillPlacedRect(g, placement, scaleDistance(4), scaleDistance(5), size.width, size.height, 0x1b1713, 0.11);
    g.fillStyle(palette.wall, 1);
    this.fillPlacedRect(g, placement, 0, 0, size.width, size.height, palette.wall, 1);
    g.fillStyle(palette.roof, 1);
    this.fillPlacedRect(g, placement, 0, -size.height * 0.34, size.width + scaleDistance(10), Math.max(scaleDistance(18), size.height * 0.34), palette.roof, 1);

    g.fillStyle(0x2b2a26, 0.56);
    this.fillPlacedRect(g, placement, 0, -size.height / 2 + scaleDistance(9), scaleDistance(14), scaleDistance(18), 0x2b2a26, 0.56);
    g.fillStyle(0xf7e7ad, 0.85);
    this.fillPlacedRect(g, placement, -size.width * 0.26, size.height * 0.08, scaleDistance(12), scaleDistance(10), 0xf7e7ad, 0.85);
    this.fillPlacedRect(g, placement, size.width * 0.26, size.height * 0.08, scaleDistance(12), scaleDistance(10), 0xf7e7ad, 0.85);

    if (node.isLandmark) {
      g.lineStyle(scaleDistance(3), 0xf6d67a, 0.82);
      this.strokePlacedRect(g, placement, 0, -scaleDistance(2), size.width + scaleDistance(8), size.height + scaleDistance(12));
    } else if (node.questCritical) {
      g.lineStyle(scaleDistance(2), 0xf7f1d2, 0.58);
      this.strokePlacedRect(g, placement, 0, -scaleDistance(2), size.width + scaleDistance(4), size.height + scaleDistance(10));
    }

    if (node.coordinateSource === "estimate" || node.coordinateSource === "fallback") {
      g.fillStyle(node.coordinateSource === "estimate" ? 0xf0b35f : 0xb8b4a1, 0.92);
      const marker = this.localToWorld(placement, size.width / 2 - scaleDistance(7), -size.height / 2 + scaleDistance(7));
      g.fillCircle(marker.x, marker.y, scaleDistance(4));
    }
  }

  private fillPlacedRect(
    g: Phaser.GameObjects.Graphics,
    placement: VenuePresentationPlacement,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    color: number,
    alpha: number
  ): void {
    const points = this.placedRectPoints(placement, offsetX, offsetY, width, height);
    g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
      g.lineTo(point.x, point.y);
    }
    g.closePath();
    g.fillPath();
  }

  private strokePlacedRect(
    g: Phaser.GameObjects.Graphics,
    placement: VenuePresentationPlacement,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
  ): void {
    const points = this.placedRectPoints(placement, offsetX, offsetY, width, height);
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
      g.lineTo(point.x, point.y);
    }
    g.closePath();
    g.strokePath();
  }

  private placedRectPoints(
    placement: VenuePresentationPlacement,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
  ): MapPoint[] {
    const left = offsetX - width / 2;
    const right = offsetX + width / 2;
    const top = offsetY - height / 2;
    const bottom = offsetY + height / 2;
    return [
      this.localToWorld(placement, left, top),
      this.localToWorld(placement, right, top),
      this.localToWorld(placement, right, bottom),
      this.localToWorld(placement, left, bottom)
    ];
  }

  private localToWorld(placement: VenuePresentationPlacement, localX: number, localY: number): MapPoint {
    return {
      x: placement.x + placement.tangent.x * localX + placement.outwardNormal.x * localY,
      y: placement.y + placement.tangent.y * localX + placement.outwardNormal.y * localY
    };
  }

  private drawBeachVenueMarker(g: Phaser.GameObjects.Graphics, node: CuratedVenueMapNode): void {
    const { width, height } = getVenueFootprint(node);
    const x = node.x - width / 2;
    const y = node.y - height / 2;
    g.fillStyle(0x111b22, 0.18);
    g.fillEllipse(node.x, node.y + height / 2, width + scaleDistance(18), scaleDistance(18));
    g.fillStyle(0xc79652, 1);
    g.fillRoundedRect(x, y, width, height, scaleDistance(7));
    g.fillStyle(0x3f88c5, 1);
    g.fillRoundedRect(x - scaleDistance(6), y - scaleDistance(13), width + scaleDistance(12), scaleDistance(24), scaleDistance(8));
    g.fillStyle(0xf7f1d2, 0.9);
    g.fillCircle(node.x - width * 0.2, y + height * 0.58, scaleDistance(5));
    g.fillCircle(node.x + width * 0.2, y + height * 0.58, scaleDistance(5));
  }

  private venuePalette(category: string): { wall: number; roof: number } {
    const palettes: Record<string, { wall: number; roof: number }> = {
      cafe: { wall: 0xe7c983, roof: 0x7b5b3a },
      coffee: { wall: 0xb98f65, roof: 0x4a3327 },
      restaurant: { wall: 0x7fb9b6, roof: 0x2f5f68 },
      bar: { wall: 0x8a6d9f, roof: 0x3a2f57 },
      beach_club: { wall: 0xe5a55d, roof: 0xb64e3e },
      bakery: { wall: 0xf1d99d, roof: 0x9b6f45 },
      grocery: { wall: 0xa9c978, roof: 0x456a3d },
      coworking: { wall: 0x91b7dd, roof: 0x375f85 },
      shop: { wall: 0xd2b2d8, roof: 0x744b79 }
    };
    return palettes[category] ?? { wall: 0xc7b08a, roof: 0x5a4a3c };
  }

  private drawMarket(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0xb89058, 1);
    g.fillRoundedRect(1030, 520, 360, 230, 10);
    for (let y = 535; y < 735; y += 32) {
      for (let x = 1045; x < 1375; x += 32) {
        g.fillStyle((x + y) % 64 === 0 ? 0xd3b071 : 0xa87947, 0.45);
        g.fillRect(x, y, 26, 26);
      }
    }

    this.drawStall(g, 1110, 555, 135, 75, 0xdb4d4d, "MILK & MADU");
    this.drawStall(g, 1270, 622, 118, 72, 0x37a2a2, "BRUNCH");
    this.drawUmbrella(g, 1045, 650, 0xf2cc5c, 0xe94f37);
    this.drawUmbrella(g, 1340, 555, 0x3f88c5, 0xf7f1d2);
  }

  private drawBuildings(g: Phaser.GameObjects.Graphics): void {
    this.drawBuilding(g, 480, 560, 260, 150, 0xc76d4b, 0x7d2f2f, "Canggu Station");
    this.drawStall(g, 748, 660, 152, 64, 0x377d9f, "BIKE RENTAL");
    this.drawBuilding(g, 235, 345, 250, 150, 0xe2c17d, 0x714c2e, "Berawa Villa");
    this.drawBuilding(g, 560, 300, 230, 145, 0xbad3a6, 0x5c6d36, "BAKED.");
    this.drawBuilding(g, 1410, 665, 280, 140, 0x7fb9b6, 0x304f69, "Bungalow Living");
    this.drawFinnsClub(g);

    g.fillStyle(0x86ad5f, 1);
    g.fillRoundedRect(1910, 700, 260, 80, 8);
    g.lineStyle(3, 0x4d7445, 1);
    for (let x = 1925; x < 2160; x += 36) {
      g.lineBetween(x, 706, x + 22, 775);
    }
    this.add.text(1960, 725, "Berawa Shortcut", this.mapLabelStyle()).setDepth(40);

    this.drawStall(g, 650, 1110, 170, 78, 0x33a6b8, "FINNS BEACH");
    this.drawStall(g, 850, 1130, 145, 70, 0xd65a31, "ATLAS");
  }

  private drawBuilding(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    wall: number,
    roof: number,
    label: string
  ): void {
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(x + 10, y + 14, width, height, 10);
    g.fillStyle(wall, 1);
    g.fillRoundedRect(x, y, width, height, 10);
    g.fillStyle(roof, 1);
    g.fillRoundedRect(x - 14, y - 24, width + 28, 52, 12);
    g.fillStyle(0x2b1d17, 0.45);
    for (let tx = x; tx < x + width; tx += 38) {
      g.fillRect(tx, y - 19, 20, 42);
    }
    g.fillStyle(0x2e2b29, 1);
    g.fillRoundedRect(x + width / 2 - 22, y + height - 45, 44, 45, 6);
    g.fillStyle(0xf4cf77, 1);
    g.fillCircle(x + width / 2 + 13, y + height - 22, 3);
    g.fillStyle(0xf6e8c5, 0.92);
    g.fillRoundedRect(x + 22, y + 48, 48, 36, 6);
    g.fillRoundedRect(x + width - 70, y + 48, 48, 36, 6);
    this.add.text(x + width / 2, y + 9, label, this.signStyle()).setOrigin(0.5, 0).setDepth(40);
  }

  private drawFinnsClub(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x5f5346, 1);
    g.fillRoundedRect(1510, 160, 52, 300, 5);
    g.fillRoundedRect(1980, 160, 52, 300, 5);
    g.fillStyle(0x8a6d4d, 1);
    g.fillRoundedRect(1600, 165, 340, 160, 8);
    g.fillStyle(0xb04335, 1);
    g.fillRoundedRect(1575, 132, 390, 54, 8);
    g.fillStyle(0x3f2b26, 1);
    g.fillRoundedRect(1725, 250, 88, 75, 6);
    g.fillStyle(0xd6a93f, 1);
    g.fillCircle(1768, 285, 6);
    g.fillStyle(0x567d46, 1);
    g.fillRoundedRect(1645, 360, 255, 90, 12);
    for (let i = 0; i < 12; i += 1) {
      g.fillStyle(i % 2 === 0 ? 0xfff0c9 : 0xf5c0ce, 1);
      g.fillCircle(1665 + i * 19, 395 + (i % 3) * 8, 5);
    }
    this.add.text(1770, 148, "FINNS Rec Club", this.signStyle()).setOrigin(0.5, 0).setDepth(40);
  }

  private drawDecorations(g: Phaser.GameObjects.Graphics): void {
    const trees = [
      [180, 1180],
      [225, 1285],
      [555, 1225],
      [710, 1320],
      [930, 1245],
      [2140, 1130],
      [2030, 500],
      [360, 545],
      [1310, 370],
      [1815, 525]
    ];
    for (const [x, y] of trees) {
      this.drawPalm(g, x, y);
    }

    const scooters = [
      [800, 725, 0xe84a5f],
      [1360, 805, 0x35a7ff],
      [1570, 905, 0xffc857]
    ];
    for (const [x, y, color] of scooters) {
      g.fillStyle(0x111111, 0.35);
      g.fillEllipse(x, y + 18, 70, 16, 32);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 28, y, 56, 18, 9);
      g.fillStyle(0x1a2026, 1);
      g.fillCircle(x - 22, y + 18, 8);
      g.fillCircle(x + 24, y + 18, 8);
    }

    const lanterns = [
      [760, 735],
      [1015, 745],
      [1448, 430],
      [1588, 455],
      [660, 1210],
      [1850, 455]
    ];
    for (const [x, y] of lanterns) {
      g.fillStyle(0x4b352d, 1);
      g.fillRect(x - 2, y - 24, 4, 44);
      g.fillStyle(0xf4c95d, 1);
      g.fillCircle(x, y - 26, 8);
    }

    g.fillStyle(0x76665b, 1);
    g.fillRoundedRect(780, 1260, 120, 90, 28);
    g.fillRoundedRect(1110, 1315, 145, 75, 24);
  }

  private drawStall(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    awning: number,
    label: string
  ): void {
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(x + 8, y + 12, width, height, 9);
    g.fillStyle(0xc9a46b, 1);
    g.fillRoundedRect(x, y, width, height, 8);
    g.fillStyle(awning, 1);
    for (let sx = x; sx < x + width; sx += 28) {
      g.fillRoundedRect(sx, y - 18, 22, 30, 6);
    }
    this.add.text(x + width / 2, y + 22, label, this.signStyle()).setOrigin(0.5).setDepth(40);
  }

  private drawUmbrella(g: Phaser.GameObjects.Graphics, x: number, y: number, a: number, b: number): void {
    g.fillStyle(0x4a382f, 1);
    g.fillRect(x - 3, y, 6, 58);
    g.fillStyle(a, 1);
    g.slice(x, y, 52, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    g.fillPath();
    g.fillStyle(b, 1);
    g.slice(x, y, 34, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.fillPath();
  }

  private drawPalm(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x70513d, 1);
    g.fillRoundedRect(x - 8, y - 48, 16, 62, 8);
    g.lineStyle(9, 0x2c7f4f, 1);
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const endX = x + Math.cos(angle) * 48;
      const endY = y - 58 + Math.sin(angle) * 24;
      g.lineBetween(x, y - 55, endX, endY);
      g.fillStyle(0x4f9b55, 1);
      g.fillCircle(endX, endY, 7);
    }
    g.lineStyle(0, 0, 0);
    g.fillStyle(0x8b5f2f, 1);
    g.fillCircle(x + 5, y - 42, 6);
    g.fillCircle(x - 7, y - 40, 5);
  }

  private addAreaLabels(): void {
    this.discoveryLabels = [];
    this.add
      .text(52, 48, "N\n^", {
        ...this.mapLabelStyle(),
        align: "center",
        backgroundColor: "rgba(35, 30, 24, 0.46)",
        padding: { x: 8, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(45);

    for (const area of berawaAreas) {
      const label = this.add
        .text(area.x, area.y - 44, area.name, {
          ...this.mapLabelStyle(),
          backgroundColor: "rgba(35, 30, 24, 0.5)",
          padding: { x: 8, y: 4 }
        })
        .setOrigin(0.5)
        .setDepth(45)
        .setVisible(false);
      this.discoveryLabels.push({ subjectType: "area", id: area.id, label });
    }

    const venues = new Map(getAllVenues().map((venue) => [venue.id, venue.name]));
    for (const node of curatedVenueNodes) {
      venues.set(node.venueId, node.name);
    }
    const permanentlySignedVenueIds = getPermanentlySignedVenueIds(activeStreetTemplate);
    for (const node of venueMapNodes) {
      if (permanentlySignedVenueIds.has(node.venueId)) {
        continue;
      }
      const label = this.add
        .text(node.x, node.y - 42, venues.get(node.venueId) ?? node.venueId, {
          ...this.mapLabelStyle(),
          fontSize: "12px",
          backgroundColor: "rgba(16, 24, 32, 0.52)",
          padding: { x: 7, y: 3 }
        })
        .setOrigin(0.5)
        .setDepth(45)
        .setVisible(false);
      this.discoveryLabels.push({ subjectType: "venue", id: node.venueId, label });
    }
  }

  private createCollision(): void {
    this.obstacleGroup = this.physics.add.staticGroup();
    for (const rect of collisionRects) {
      const zone = this.add.zone(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height);
      this.physics.add.existing(zone, true);
      this.obstacleGroup.add(zone);
    }
  }

  private createPickups(): void {
    for (const pickup of pickupDefinitions) {
      const sprite = this.add
        .sprite(pickup.x, pickup.y, pickup.itemId === "coconut" ? "pickup-coconut" : "pickup-frangipani")
        .setDepth(pickup.y)
        .setName(pickup.id);
      this.pickupSprites.set(pickup.id, sprite);
    }
  }

  private createNpcs(): void {
    for (const npc of Object.values(npcDefinitions)) {
      const state = this.world.npcs[npc.id];
      const sprite = this.physics.add.sprite(state.x, state.y, npc.spriteKey).setDepth(state.y).setImmovable(true);
      this.npcFacingDirections.set(npc.id, "down");
      this.applyCharacterAnimation(sprite, npc.spriteKey, this.npcFacingDirections.get(npc.id) ?? "down", false, CHARACTER_SPRITE_SCALE);
      sprite.body?.setSize(PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT);
      sprite.body?.setOffset(PLAYER_BODY_OFFSET_X, PLAYER_BODY_OFFSET_Y);
      this.npcSprites.set(npc.id, sprite);
    }
  }

  private createAmbientNpcs(): void {
    for (const ambientNpc of ambientNpcDefinitions) {
      const firstWaypoint = ambientNpc.route.waypoints[0];
      if (!firstWaypoint) {
        continue;
      }
      const sprite = this.physics.add
        .sprite(firstWaypoint.x, firstWaypoint.y, ambientNpc.spriteKey)
        .setDepth(firstWaypoint.y)
        .setTint(ambientNpc.tint)
        .setAlpha(0.88)
        .setImmovable(true);
      this.ambientNpcFacingDirections.set(ambientNpc.id, "down");
      this.applyCharacterAnimation(sprite, ambientNpc.spriteKey, "down", false, CHARACTER_SPRITE_SCALE * 0.92);
      sprite.body?.setSize(PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT);
      sprite.body?.setOffset(PLAYER_BODY_OFFSET_X, PLAYER_BODY_OFFSET_Y);
      this.ambientNpcSprites.set(ambientNpc.id, sprite);
    }
  }

  private createPlayer(): void {
    const start = this.clampToPlayableBounds(this.playerState.x, this.playerState.y, scaleDistance(28));
    this.playerState.x = Math.round(start.x);
    this.playerState.y = Math.round(start.y);
    this.player = this.physics.add.sprite(this.playerState.x, this.playerState.y, "player");
    this.applyCharacterAnimation(this.player, "player", this.playerState.direction, false, CHARACTER_SPRITE_SCALE);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(this.player.y);
    this.player.body?.setSize(PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT);
    this.player.body?.setOffset(PLAYER_BODY_OFFSET_X, PLAYER_BODY_OFFSET_Y);
    this.playerBike = this.add.sprite(this.playerState.x, this.playerState.y + scaleDistance(10), "player-bike").setVisible(false);
    this.playerBikeSpeedCue = this.add.graphics().setVisible(false);
    this.physics.add.collider(this.player, this.obstacleGroup, () => this.handleHardCargoCollision());
    this.updatePlayerBikeVisual();
  }

  private createTrafficBikes(): void {
    if (TRAFFIC_ROUTES.length === 0) {
      this.trafficBikes = [];
      return;
    }

    this.trafficBikes = Array.from({ length: TRAFFIC_BIKE_COUNT }, (_, index) => {
      const sprite = this.add.sprite(0, 0, "traffic-bike");
      const bike: TrafficBikeRuntime = {
        sprite,
        route: TRAFFIC_ROUTES[0],
        targetIndex: 1,
        direction: 1,
        speed: scaleDistance(150),
        velocity: new Phaser.Math.Vector2(1, 0),
        seed: index
      };
      this.configureTrafficBike(bike, index, true);
      return bike;
    });
  }

  private configureTrafficBike(bike: TrafficBikeRuntime, seed: number, distributeOnRoute: boolean): void {
    const route = this.getTrafficRoute(seed);
    const direction: 1 | -1 = seed % 2 === 0 ? 1 : -1;
    const maxInteriorIndex = Math.max(1, route.points.length - 2);
    const interiorIndex = Math.min(route.points.length - 2, 1 + ((seed * 3) % maxInteriorIndex));
    const startIndex = distributeOnRoute ? interiorIndex : direction > 0 ? 0 : route.points.length - 1;
    const targetIndex = Phaser.Math.Clamp(startIndex + direction, 0, route.points.length - 1);

    const resolvedDirection: 1 | -1 = targetIndex === startIndex ? (direction === 1 ? -1 : 1) : direction;
    bike.route = route;
    bike.direction = resolvedDirection;
    bike.targetIndex = targetIndex === startIndex ? Phaser.Math.Clamp(startIndex + resolvedDirection, 0, route.points.length - 1) : targetIndex;
    bike.speed = scaleDistance(135 + ((seed * 23) % 70));
    bike.seed = seed;
    const start = route.points[startIndex];
    bike.sprite.setPosition(start.x, start.y);
    this.updateTrafficBikeVelocityAndFacing(bike);
  }

  private getTrafficRoute(seed: number): TrafficRouteDefinition {
    const routeCount = TRAFFIC_ROUTES.length;
    const searchCount = Math.min(routeCount, 28);
    const nearbyRoutes = [...TRAFFIC_ROUTES]
      .sort((a, b) => this.distanceFromPlayerToRoute(a) - this.distanceFromPlayerToRoute(b))
      .slice(0, searchCount);
    return nearbyRoutes[(seed * 5) % nearbyRoutes.length] ?? TRAFFIC_ROUTES[seed % routeCount];
  }

  private distanceFromPlayerToRoute(route: TrafficRouteDefinition): number {
    let distance = Number.POSITIVE_INFINITY;
    for (const point of route.points) {
      distance = Math.min(distance, Phaser.Math.Distance.Between(this.player.x, this.player.y, point.x, point.y));
    }
    return distance;
  }

  private createWantedOffenders(): void {
    const route = [
      worldVector(1360, 805),
      worldVector(1060, 805),
      worldVector(975, 610),
      worldVector(1475, 430),
      worldVector(1768, 365),
      worldVector(1768, 805)
    ];
    const sprite = this.add.sprite(route[0].x, route[0].y, "npc-ari").setDepth(route[0].y + 4);
    const bikeSprite = this.add.sprite(route[0].x, route[0].y + scaleDistance(10), "traffic-bike").setDepth(route[0].y + 3);
    this.setSpriteFacing(sprite, false, CHARACTER_SPRITE_SCALE);
    bikeSprite.setScale(TRAFFIC_BIKE_SPRITE_SCALE, TRAFFIC_BIKE_SPRITE_SCALE);
    const sign = this.add
      .text(route[0].x, route[0].y - scaleDistance(46), "WANTED\nRp 120", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "11px",
        color: "#2b1d17",
        align: "center",
        backgroundColor: "#fff0bd",
        padding: { x: 5, y: 3 }
      })
      .setOrigin(0.5)
      .setDepth(UI_DEPTH - 20);

    this.wantedOffenders.set("reckless-berawa-rider", {
      id: "reckless-berawa-rider",
      name: "Flagged Rider",
      sprite,
      bikeSprite,
      sign,
      cash: 120,
      wantedLevel: 3,
      route,
      routeIndex: 1,
      speed: scaleDistance(118)
    });
  }

  private createInteractionController(): void {
    this.interactionController = new InteractionController({
      getPlayerPosition: () => ({ x: this.player.x, y: this.player.y }),
      getNpcSprite: (npcId) => (this.isNpcInsideClosedInterior(npcId) ? undefined : this.npcSprites.get(npcId)),
      isPickupAvailable: (pickup) => this.isPickupAvailable(pickup),
      getWantedOffenders: () => this.wantedOffenders.values(),
      getOffenderReward: (offender) => this.getOffenderReward(offender),
      getDeliveryTargets: () => this.getActiveDeliveryTargets()
    });
  }

  private createInput(): void {
    this.inputController = new InputController(this);
    const bindings = this.inputController.createKeyboard({
      action: () => this.handleAction(),
      inventory: () => this.toggleInventory(),
      community: () => this.toggleCommunityBoard(),
      bike: () => this.toggleBike(),
      phone: () => this.togglePhone(),
      godmode: () => this.toggleGodmodePanel(),
      escape: () => {
        if (this.activeCutscene) {
          this.skipActiveCutscene();
        } else if (this.activeRivalRace) {
          this.finishRivalRace({ conceded: true });
        } else if (this.mode === "title") {
          return;
        } else if (this.mode === "pause") {
          this.closePauseMenu();
        } else if (this.godmodePanel) {
          this.closeGodmodePanel();
        } else if (this.mode === "committedActivity" || this.mode === "warungRush") {
          this.cancelCommittedActivity();
        } else if (this.awaitingRelationshipChoice) {
          const scene = this.activeRelationshipChoiceScene;
          const defaultOption = scene ? getRelationshipChoiceSkipOption(scene) : undefined;
          if (scene && defaultOption) {
            this.resolveRelationshipChoice(scene, defaultOption);
          }
          return;
        } else if (this.phone?.isOpen) {
          this.phone.close();
        } else if (this.mode === "world" || this.mode === "interior") {
          this.openPauseMenu();
        } else {
          this.closePanel();
        }
      },
      save: () => this.saveGame(),
      reset: () => {
        const wasOnMenu = Boolean(this.titleScreen);
        this.resetToFreshWorld();
        if (wasOnMenu) {
          this.closePauseMenu();
          this.sessionStartedAt = Date.now();
          this.openFirstRunHint();
        }
        this.showToast("Save cleared. New neighbor day started.");
      }
    });
    if (!bindings) {
      return;
    }

    this.cursors = bindings.cursors;
    this.keys = bindings.keys;

    this.input.keyboard?.on("keydown", () => {
      this.unlockAudio();
      this.finishPayoutCelebration();
    });
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.handlePointerUp(pointer));
    this.input.on("gameout", () => this.hudController.cancelTouchInput());
    this.scale.on("resize", () => {
      this.hudController.cancelTouchInput();
      this.layoutForViewport();
    });
  }

  private openTitleScreen(hasSave: boolean, mode: "title" | "pause"): void {
    if (typeof document === "undefined") {
      this.mode = this.activeInteriorId ? "interior" : "world";
      return;
    }
    this.titleScreen?.destroy();
    this.mode = mode;
    this.hudController.setOverlayOpen(true);
    this.titleScreen = new TitleScreen({
      hasSave,
      buildStamp: BUILD_STAMP,
      mode,
      onContinue: () => this.resumeFromMenu(),
      onNewGame: () => this.startNewGameFromMenu(),
      onFeedback: () => this.sendFeedback(),
      onClose: () => this.closePauseMenu()
    });
  }

  private openPauseMenu(): void {
    this.openTitleScreen(hasSavedWorldState(), "pause");
  }

  private closePauseMenu(): void {
    this.titleScreen?.destroy();
    this.titleScreen = undefined;
    this.hudController.setOverlayOpen(false);
    this.mode = this.activeInteriorId ? "interior" : "world";
  }

  private resumeFromMenu(): void {
    this.closePauseMenu();
    this.resumeCommittedActivityIfNeeded();
    this.resumeAct0BackHalfIfNeeded();
    if (this.world.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG]) {
      const scene = getRelationshipChoiceScene(ACT1_LUXURY_TIP_SCENE_ID);
      if (scene) {
        this.openRelationshipChoiceScene(scene);
        this.sessionStartedAt ??= Date.now();
        return;
      }
    }
    if (this.world.collectedPickups[ACT1_MADE_KEY_FLAG] && !isAct1MoveOutComplete(this.world)) {
      this.startAct1MoveOutMontage();
      this.sessionStartedAt ??= Date.now();
      return;
    }
    if (
      this.world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG] &&
      this.world.life.actProgress.currentAct < 2
    ) {
      this.startAct2FinaleCard();
      this.sessionStartedAt ??= Date.now();
      return;
    }
    if (this.pendingAct2CutscenePreviousAct != null) {
      const previousAct = this.pendingAct2CutscenePreviousAct;
      this.pendingAct2CutscenePreviousAct = undefined;
      this.maybeStartAct2Cutscene(previousAct);
    }
    this.sessionStartedAt ??= Date.now();
    this.showToast("Welcome to Berawa near FINNS. Press E near people, venues, and pickups.");
    this.openFirstRunHint();
  }

  private startNewGameFromMenu(): void {
    clearSave();
    this.titleScreen?.destroy();
    this.titleScreen = undefined;
    this.hudController.setOverlayOpen(false);
    this.scene.restart({ startFresh: true });
  }

  private resetToFreshWorld(): void {
    clearSave();
    this.phone?.close();
    this.closePanel(false);
    this.activeCutscene?.overlay.container.destroy(true);
    this.activeCutscene = undefined;
    this.cutsceneDeferredSave = false;
    this.pendingAct2CutscenePreviousAct = undefined;
    this.committedActivity = undefined;
    this.destroyCommittedActivityOverlay();
    this.activeRivalRace = undefined;
    this.rivalRaceGhost?.destroy();
    this.rivalRaceGhost = undefined;
    this.rivalRaceMarkerLayer?.clear();
    this.finishPayoutCelebration();
    this.clearDeliveryHazards();
    this.world = loadWorldState();
    this.playerState = getLocalPlayer(this.world);
    this.activeInteriorId = null;
    this.interiorReturnPoint = undefined;
    this.interiorTransitioning = false;
    this.mode = "world";
    this.applyWorldCameraBounds();
    const start = this.clampToPlayableBounds(this.playerState.x, this.playerState.y, scaleDistance(28));
    this.playerState.x = Math.round(start.x);
    this.playerState.y = Math.round(start.y);
    this.player.setPosition(this.playerState.x, this.playerState.y);
    this.clearGroupLine();
    this.updatePlayerBikeVisual();
  }

  private createHud(): void {
    this.hudLayer = this.add
      .container(this.cameras.main.worldView.x, this.cameras.main.worldView.y)
      .setScrollFactor(1)
      .setDepth(UI_DEPTH);
    this.hudChrome = this.add.graphics();
    this.timeText = this.add.text(16, 12, "", this.hudTextStyle(15));
    this.questText = this.add.text(16, 46, "", this.hudTextStyle(14));
    this.wantedChipText = this.add.text(16, 0, "", this.hudTextStyle(13)).setColor("#ff8f80").setVisible(false);
    this.depositChipText = this.add.text(16, 0, "", this.hudTextStyle(13)).setColor("#fff0bd").setVisible(false);
    this.bikeChipText = this.add.text(16, 0, "", this.hudTextStyle(13)).setColor("#f4b860").setVisible(false);
    this.cargoChipText = this.add.text(16, 0, "", this.hudTextStyle(13)).setColor("#62c48f").setVisible(false);
    this.promptText = this.add.text(16, 0, "", this.hudTextStyle(15));
    this.toastText = this.add
      .text(0, 0, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "16px",
        color: "#fff8df",
        align: "center",
        backgroundColor: "rgba(21, 24, 29, 0.76)",
        padding: { x: 12, y: 8 },
        wordWrap: { width: 520 }
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.objectiveArrowLayer = this.add.graphics();
    this.hudLayer.add([
      this.hudChrome,
      this.objectiveArrowLayer,
      this.timeText,
      this.questText,
      this.wantedChipText,
      this.depositChipText,
      this.bikeChipText,
      this.cargoChipText,
      this.promptText,
      this.toastText
    ]);
    this.nightOverlayLayer = this.createZoomCompensatedContainer(900);
    this.nightOverlay = this.add.graphics();
    this.nightOverlayLayer.add(this.nightOverlay);
    this.lanternGlow = this.add.graphics().setDepth(905);
    this.weatherOverlayLayer = this.createZoomCompensatedContainer(910);
    this.wetStreetTint = this.add.graphics();
    this.rainLayer = this.add.graphics();
    this.thunderFlash = this.add.graphics();
    this.weatherOverlayLayer.add([this.wetStreetTint, this.rainLayer, this.thunderFlash]);
    this.hudController = new HudController(this, UI_DEPTH, {
      action: () => {
        this.playUiClick();
        if (this.activeRivalRace && this.hudController.isTouchInputActive) {
          this.finishRivalRace({ conceded: true });
          return;
        }
        this.handleAction();
      },
      inventory: () => {
        this.playUiClick();
        this.toggleInventory();
      },
      community: () => {
        this.playUiClick();
        this.toggleCommunityBoard();
      },
      bike: () => {
        this.playUiClick();
        this.toggleBike();
      },
      phone: () => {
        this.playUiClick();
        this.togglePhone();
      },
      save: () => {
        this.playUiClick();
        this.saveGame();
      }
    });
    this.hudController.createTouchControls();
    this.layoutForViewport();
  }

  private updatePlayer(delta: number): void {
    if (!this.player.body) {
      return;
    }
    this.cargoHardCollisionCooldown = Math.max(0, this.cargoHardCollisionCooldown - delta);

    const movement = this.inputController.getMovementVector(this.mode, this.cursors, this.keys, this.hudController.joystickVector);
    const hasMovementInput = movement.lengthSq() > 0;
    const canMove = this.mode === "world" || this.mode === "interior" || this.mode === "warungRush";
    const isRidingBike =
      canMove &&
      canPlayerBeOnBike(this.mode, this.playerState.hasBike, this.activeInteriorId) &&
      this.playerState.onBike &&
      !this.playerState.bikeStuck;

    if (hasMovementInput) {
      this.showMovementTutorialPrompt = false;
    }

    if (isRidingBike) {
      if (hasMovementInput) {
        movement.normalize();
      }
      const ride = updateRideModel({
        inputX: hasMovementInput ? movement.x : 0,
        inputY: hasMovementInput ? movement.y : 0,
        deltaMs: delta,
        state: this.rideModelState,
        baseMaxSpeed: BIKE_SPEED * this.movementSpeedMultiplier,
        tier: this.world.life.hustle.scooterTier,
        bikeCondition: this.playerState.bikeCondition,
        slick: this.isRideSurfaceSlick()
      });
      this.rideModelState = ride;
      this.rideModelOutput = ride;
      this.player.setVelocity(ride.velocityX, ride.velocityY);
      if (hasMovementInput || ride.speed > scaleDistance(RIDE_FEEL_TUNING.minimumAnimatedRideSpeed)) {
        this.playerState.direction = this.directionFromVector(new Phaser.Math.Vector2(ride.velocityX, ride.velocityY));
      }
      this.updateRideCameraLookahead(ride);
      this.checkRideNearMiss(ride);
    } else if (hasMovementInput) {
      this.rideModelState = createRideModelState();
      this.rideModelOutput = null;
      this.updateRideCameraLookahead();
      movement.normalize();
      const speed = (isAct1BreakdownPushActive(this.world) ? BIKE_PUSH_SPEED : WALK_SPEED) * this.movementSpeedMultiplier;
      this.player.setVelocity(movement.x * speed, movement.y * speed);
      this.playerState.direction = this.directionFromVector(movement);
    } else {
      this.rideModelState = createRideModelState();
      this.rideModelOutput = null;
      this.updateRideCameraLookahead();
      this.player.setVelocity(0, 0);
    }
    const walkingOnFoot = hasMovementInput && !isRidingBike;
    this.applyCharacterAnimation(this.player, "player", this.playerState.direction, walkingOnFoot, CHARACTER_SPRITE_SCALE);

    if (this.activeInteriorId) {
      this.enforceInteriorBounds();
      if (this.mode !== "warungRush") this.tryAutoExitInterior();
    } else {
      this.enforceWaterBoundary();
      this.enforcePlayableBounds();
    }

    if (!this.activeInteriorId) {
      this.playerState.x = Math.round(this.player.x);
      this.playerState.y = Math.round(this.player.y);
    }
    this.player.setDepth(this.player.y);
    this.updatePlayerBikeVisual(delta);
    if (!this.activeInteriorId) {
      this.checkBikeTerrain();
      this.checkPlayerBikeHarmToOthers();
    }
    this.updatePlayerWantedSign();

    this.networkPushTimer += delta;
    if (this.networkPushTimer > 180) {
      this.networkPushTimer = 0;
      this.network.pushLocalPlayer(this.playerState);
    }
  }

  private updatePlayerBikeVisual(delta = 0): void {
    if (!this.playerBike) {
      return;
    }
    this.scooterMotionElapsedMs = (this.scooterMotionElapsedMs + delta) % 120000;
    const visible =
      canPlayerBeOnBike(this.mode, this.playerState.hasBike, this.activeInteriorId) &&
      (this.playerState.onBike || this.playerState.bikeStuck);
    const bodyVelocity = this.player.body?.velocity;
    const visual = getScooterVisualState({
      tier: this.world.life.hustle.scooterTier,
      bikeCondition: this.playerState.bikeCondition,
      velocityX: visible ? bodyVelocity?.x ?? 0 : 0,
      velocityY: visible ? bodyVelocity?.y ?? 0 : 0,
      maxSpeed: BIKE_SPEED * this.movementSpeedMultiplier,
      elapsedMs: this.scooterMotionElapsedMs,
      leanDegrees: this.playerState.onBike && !this.playerState.bikeStuck ? this.rideModelState.leanDegrees : undefined
    });
    this.playerBike.setVisible(visible);
    this.playerBike.setPosition(this.player.x + visual.offsetX, this.player.y + scaleDistance(10) + visual.offsetY);
    this.playerBike.setDepth(this.player.y - 1);
    this.playerBike.setAlpha(this.playerState.bikeStuck ? 0.62 : 1);
    this.playerBike.setAngle(visual.angleDegrees);
    this.setSpriteFacing(
      this.playerBike,
      this.playerState.direction === "left",
      PLAYER_BIKE_SPRITE_SCALE * visual.scaleX,
      PLAYER_BIKE_SPRITE_SCALE * visual.scaleY
    );
    this.drawPlayerScooterSpeedCue(visible, visual, bodyVelocity?.x ?? 0, bodyVelocity?.y ?? 0);
  }

  private updateRideCameraLookahead(ride?: RideModelOutput): void {
    const shouldLead =
      ride &&
      !this.activeInteriorId &&
      this.playerState.onBike &&
      !this.playerState.bikeStuck &&
      ride.speedRatio > RIDE_FEEL_TUNING.cameraLeadMinimumSpeedRatio;
    const targetX = shouldLead
      ? -Math.sign(ride.velocityX) *
        Math.min(
          scaleDistance(RIDE_FEEL_TUNING.cameraLeadMaxX),
          Math.abs(ride.velocityX / Math.max(1, ride.maxSpeed)) * scaleDistance(RIDE_FEEL_TUNING.cameraLeadMaxX)
        )
      : 0;
    const targetY = shouldLead
      ? -Math.sign(ride.velocityY) *
        Math.min(
          scaleDistance(RIDE_FEEL_TUNING.cameraLeadMaxY),
          Math.abs(ride.velocityY / Math.max(1, ride.maxSpeed)) * scaleDistance(RIDE_FEEL_TUNING.cameraLeadMaxY)
        )
      : 0;
    this.rideCameraOffsetX = Phaser.Math.Linear(
      this.rideCameraOffsetX,
      targetX,
      RIDE_FEEL_TUNING.cameraLeadLerp
    );
    this.rideCameraOffsetY = Phaser.Math.Linear(
      this.rideCameraOffsetY,
      targetY,
      RIDE_FEEL_TUNING.cameraLeadLerp
    );
    this.cameras.main.setFollowOffset(this.rideCameraOffsetX, this.rideCameraOffsetY);
  }

  private checkRideNearMiss(ride: RideModelOutput): void {
    if (
      this.activeInteriorId ||
      this.nearMissFeedbackCooldown > 0 ||
      ride.speedRatio < RIDE_FEEL_TUNING.nearMissMinimumSpeedRatio
    ) {
      return;
    }
    if (this.isNearMissAgainstTraffic() || this.isNearMissAgainstPedestrians()) {
      this.nearMissFeedbackCooldown = RIDE_NEAR_MISS_COOLDOWN_MS;
      this.recordDeliveryNearMiss();
      this.spawnInteractionFlourish("nearMiss", this.player.x, this.player.y, "Whoosh");
      this.playSound("nearMiss");
    }
  }

  private isNearMissAgainstTraffic(): boolean {
    return this.trafficBikes.some((bike) => bike.sprite.visible && this.isNearMissDistance(bike.sprite.x, bike.sprite.y));
  }

  private isNearMissAgainstPedestrians(): boolean {
    for (const sprite of this.npcSprites.values()) {
      if (this.isNearMissDistance(sprite.x, sprite.y)) {
        return true;
      }
    }
    for (const sprite of this.ambientNpcSprites.values()) {
      if (this.isNearMissDistance(sprite.x, sprite.y)) {
        return true;
      }
    }
    return false;
  }

  private isNearMissDistance(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
    return distance >= RIDE_NEAR_MISS_INNER_RADIUS && distance <= RIDE_NEAR_MISS_RADIUS;
  }

  private drawPlayerScooterSpeedCue(visible: boolean, visual: ScooterVisualState, velocityX: number, velocityY: number): void {
    const cue = this.playerBikeSpeedCue;
    if (!cue) {
      return;
    }
    cue.clear();
    cue.setVisible(false);
    if (!visible || visual.speedCueCount <= 0) {
      return;
    }
    const speed = Math.hypot(velocityX, velocityY);
    if (speed <= 0.01) {
      return;
    }
    const ux = velocityX / speed;
    const uy = velocityY / speed;
    const sideX = -uy;
    const sideY = ux;
    const baseX = this.player.x - ux * scaleDistance(18);
    const baseY = this.player.y + scaleDistance(10) - uy * scaleDistance(18);
    cue.setDepth(this.player.y - 2);
    cue.setVisible(true);
    for (let index = 0; index < visual.speedCueCount; index += 1) {
      const spread = (index - (visual.speedCueCount - 1) / 2) * scaleDistance(9);
      const startX = baseX + sideX * spread;
      const startY = baseY + sideY * spread;
      const length = scaleDistance(24 + index * 8);
      cue.lineStyle(Math.max(1, scaleDistance(2)), 0xfff0bd, visual.speedCueAlpha * (1 - index * 0.12));
      cue.beginPath();
      cue.moveTo(startX, startY);
      cue.lineTo(startX - ux * length, startY - uy * length);
      cue.strokePath();
    }
  }

  private updateTraffic(delta: number): void {
    this.trafficHitCooldown = Math.max(0, this.trafficHitCooldown - delta);
    this.bikeHarmCooldown = Math.max(0, this.bikeHarmCooldown - delta);
    const activeDelivery = this.world.life.hustle.activeDelivery;
    const trafficDensity = activeDelivery?.stage === "picked_up"
      ? getDeliveryRideDensity(this.world.life.actProgress.currentAct, activeDelivery.deliveryId)
      : 1;
    const liveTrafficCount = Math.max(1, Math.round(this.trafficBikes.length * trafficDensity));
    for (const [index, bike] of this.trafficBikes.entries()) {
      const live = index < liveTrafficCount;
      bike.sprite.setVisible(live);
      if (!live) continue;
      this.moveTrafficBikeAlongRoad(bike, (bike.speed * delta) / 1000);
      bike.sprite.setDepth(bike.sprite.y + 3);

      if (this.trafficHitCooldown <= 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, bike.sprite.x, bike.sprite.y) < scaleDistance(34)) {
        this.applyTrafficHit(bike);
      }
    }
  }

  private moveTrafficBikeAlongRoad(bike: TrafficBikeRuntime, distance: number): void {
    let remaining = distance;
    let guard = 0;

    while (remaining > 0 && guard < 6) {
      guard += 1;
      const target = bike.route.points[bike.targetIndex];
      if (!target) {
        this.respawnTrafficBike(bike);
        return;
      }

      const dx = target.x - bike.sprite.x;
      const dy = target.y - bike.sprite.y;
      const segmentDistance = Math.hypot(dx, dy);
      if (segmentDistance <= 1) {
        bike.sprite.setPosition(target.x, target.y);
        this.advanceTrafficBikeTarget(bike);
        continue;
      }

      const step = Math.min(segmentDistance, remaining);
      bike.sprite.x += (dx / segmentDistance) * step;
      bike.sprite.y += (dy / segmentDistance) * step;
      bike.velocity.set((dx / segmentDistance) * bike.speed, (dy / segmentDistance) * bike.speed);
      remaining -= step;

      if (segmentDistance - step <= 1) {
        bike.sprite.setPosition(target.x, target.y);
        this.advanceTrafficBikeTarget(bike);
      }
    }

    this.updateTrafficBikeFacingFromVelocity(bike);
  }

  private advanceTrafficBikeTarget(bike: TrafficBikeRuntime): void {
    const currentPointIndex = bike.targetIndex;
    if (this.tryTrafficJunctionTurn(bike, currentPointIndex)) {
      this.updateTrafficBikeVelocityAndFacing(bike);
      return;
    }

    const nextIndex = currentPointIndex + bike.direction;
    if (nextIndex < 0 || nextIndex >= bike.route.points.length) {
      this.respawnTrafficBike(bike);
      return;
    }
    bike.targetIndex = nextIndex;
    this.updateTrafficBikeVelocityAndFacing(bike);
  }

  private tryTrafficJunctionTurn(bike: TrafficBikeRuntime, pointIndex: number): boolean {
    const point = bike.route.points[pointIndex];
    const options = TRAFFIC_JUNCTIONS.get(trafficPointKey(point))?.filter((option) => option.route.id !== bike.route.id) ?? [];
    if (options.length === 0) {
      return false;
    }

    this.trafficRouteCursor += 1;
    if ((bike.seed + pointIndex + this.trafficRouteCursor) % 3 !== 0) {
      return false;
    }

    const option = options[(bike.seed + this.trafficRouteCursor) % options.length];
    const directions: Array<1 | -1> = [];
    if (option.pointIndex < option.route.points.length - 1) {
      directions.push(1);
    }
    if (option.pointIndex > 0) {
      directions.push(-1);
    }
    if (directions.length === 0) {
      return false;
    }

    const direction = directions[(bike.seed + pointIndex + this.trafficRouteCursor) % directions.length];
    bike.route = option.route;
    bike.direction = direction;
    bike.targetIndex = option.pointIndex + direction;
    return true;
  }

  private respawnTrafficBike(bike: TrafficBikeRuntime): void {
    this.trafficRouteCursor += 1;
    this.configureTrafficBike(bike, bike.seed + this.trafficRouteCursor + 11, false);
  }

  private updateTrafficBikeVelocityAndFacing(bike: TrafficBikeRuntime): void {
    const target = bike.route.points[bike.targetIndex];
    if (!target) {
      bike.velocity.set(0, 0);
      return;
    }
    const dx = target.x - bike.sprite.x;
    const dy = target.y - bike.sprite.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 0) {
      bike.velocity.set((dx / distance) * bike.speed, (dy / distance) * bike.speed);
    }
    this.updateTrafficBikeFacingFromVelocity(bike);
  }

  private updateTrafficBikeFacingFromVelocity(bike: TrafficBikeRuntime): void {
    if (bike.velocity.lengthSq() <= 0.01) {
      return;
    }
    bike.sprite.setScale(TRAFFIC_BIKE_SPRITE_SCALE, TRAFFIC_BIKE_SPRITE_SCALE);
    bike.sprite.setAngle(Phaser.Math.RadToDeg(Math.atan2(bike.velocity.y, bike.velocity.x)));
  }

  private handleHardCargoCollision(): void {
    if (this.cargoHardCollisionCooldown > 0 || !this.playerState.onBike || this.mode !== "world") {
      return;
    }
    const speed = Math.hypot(this.player.body?.velocity.x ?? 0, this.player.body?.velocity.y ?? 0);
    if (speed < CARGO_HARD_COLLISION_SPEED) {
      return;
    }
    const cargoDamage = this.damageActiveDeliveryCargo("hard_collision");
    if (!cargoDamage?.damaged) {
      return;
    }
    this.cargoHardCollisionCooldown = CARGO_HARD_COLLISION_COOLDOWN_MS;
    this.spawnFloatingText(`Cargo -${cargoDamage.amount}%`, this.player.x, this.player.y - scaleDistance(34), "#f4b860");
    this.cameras.main.shake(120, 0.003);
    saveWorldState(this.world);
    this.showToast(`Hard stop. Cargo ${cargoDamage.after}%.`);
  }

  private updateWantedOffenders(delta: number): void {
    for (const offender of this.wantedOffenders.values()) {
      if (offender.wantedLevel <= 0) {
        offender.sign.setVisible(false);
        offender.bikeSprite.setAlpha(0.45);
        offender.sprite.setAlpha(0.6);
        continue;
      }

      const target = offender.route[offender.routeIndex];
      const reached = this.moveSpriteToward(offender.sprite, target.x, target.y, offender.speed, delta);
      if (reached) {
        offender.routeIndex = (offender.routeIndex + 1) % offender.route.length;
      }
      offender.bikeSprite.setPosition(offender.sprite.x, offender.sprite.y + scaleDistance(10));
      offender.bikeSprite.setDepth(offender.sprite.y + 2);
      this.setSpriteFacing(offender.bikeSprite, offender.sprite.scaleX < 0, TRAFFIC_BIKE_SPRITE_SCALE);
      offender.sprite.setDepth(offender.sprite.y + 3);
      offender.sign
        .setText(`WANTED\nRp ${Math.min(offender.cash, this.getOffenderReward(offender))}`)
        .setPosition(offender.sprite.x, offender.sprite.y - scaleDistance(48))
        .setDepth(offender.sprite.y + 5)
        .setVisible(true);
    }

    this.updatePlayerWantedSign();
  }

  private moveSpriteToward(
    sprite: Phaser.GameObjects.Sprite,
    targetX: number,
    targetY: number,
    speed: number,
    delta: number
  ): boolean {
    const dx = targetX - sprite.x;
    const dy = targetY - sprite.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= scaleDistance(5)) {
      return true;
    }
    const step = Math.min(distance, (speed * delta) / 1000);
    sprite.x += (dx / distance) * step;
    sprite.y += (dy / distance) * step;
    this.setSpriteFacing(sprite, dx < -1, CHARACTER_SPRITE_SCALE);
    return distance - step <= scaleDistance(5);
  }

  private applyTrafficHit(source: TrafficBikeRuntime): void {
    this.trafficHitCooldown = TRAFFIC_HIT_COOLDOWN_MS;
    const activeDelivery = this.world.life.hustle.activeDelivery;
    const act0Step = this.world.life.actProgress.act0Step;
    const act0FailForwardTransit =
      isAct0StoryDelivery(activeDelivery?.deliveryId) ||
      act0Step === "landlord_ultimatum" ||
      act0Step === "villa_order_ping" ||
      act0Step === "pickup_villa_delivery" ||
      act0Step === "dropoff_villa_delivery" ||
      act0Step === "pay_kos_deposit";
    if ((activeDelivery?.stage === "picked_up" || act0FailForwardTransit) && this.playerState.onBike) {
      const contact = applyDeliveryHazardContact();
      const cargoDamage = this.damageActiveDeliveryCargo(contact.cargoReason);
      if (activeDelivery) {
        activeDelivery.rideRun ??= { elapsedMs: 0, hazardsSpawned: 0, hazardsAvoided: 0, nearMisses: 0, contacts: 0 };
        activeDelivery.rideRun.contacts += 1;
      }
      this.applyDeliverySpeedStumble(contact.speedMultiplier);
      this.applyTrafficKnockback(source);
      this.cameras.main.shake(140, 0.004);
      this.spawnHitSplash(this.player.x, this.player.y);
      if (cargoDamage?.damaged) {
        this.spawnFloatingText(`Cargo -${cargoDamage.amount}%`, this.player.x, this.player.y - scaleDistance(34), "#f4b860");
      }
      saveWorldState(this.world);
      this.showToast(`Scooter clip — soft hit, keep riding. Cargo ${cargoDamage?.after ?? activeDelivery?.cargoIntegrity ?? 100}%.`);
      return;
    }
    const moneyLoss = Math.min(this.playerState.money, TRAFFIC_HIT_MONEY_LOSS);
    this.playerState.safety = Phaser.Math.Clamp(this.playerState.safety - 12, 0, 100);
    adjustPlayerMeters(this.world, { focus: -5 });
    this.playerState.money -= moneyLoss;
    if (this.playerState.onBike) {
      this.playerState.bikeCondition = Phaser.Math.Clamp(this.playerState.bikeCondition - 8, 0, 100);
      if (this.playerState.bikeCondition <= 0) {
        this.playerState.bikeStuck = true;
        this.playerState.onBike = false;
      }
    }
    const cargoDamage = this.damageActiveDeliveryCargo("traffic_hit");
    this.applyTrafficKnockback(source);
    this.cameras.main.shake(180, 0.006);
    this.spawnHitSplash(this.player.x, this.player.y);
    this.spawnFloatingText("Ouch!", this.player.x, this.player.y - scaleDistance(34), "#ffdfb3");
    if (cargoDamage?.damaged) {
      this.spawnFloatingText(`Cargo -${cargoDamage.amount}%`, this.player.x - scaleDistance(20), this.player.y - scaleDistance(6), "#f4b860");
    }
    if (moneyLoss > 0) {
      this.spawnCashBurst(this.player.x, this.player.y, moneyLoss);
      this.spawnFloatingText(`-Rp ${moneyLoss}`, this.player.x + scaleDistance(20), this.player.y - scaleDistance(12), "#fff0bd");
    }
    saveWorldState(this.world);
    const cargoCopy = cargoDamage?.damaged ? ` Cargo ${cargoDamage.after}%.` : "";
    this.showToast(`A passing scooter clipped you. Safety -12, Focus -5${moneyLoss > 0 ? `, Rp -${moneyLoss}` : ""}.${cargoCopy}`);
  }

  private applyTrafficKnockback(source: TrafficBikeRuntime): void {
    const knockback = source.velocity.lengthSq() > 0.01
      ? source.velocity.clone().normalize()
      : new Phaser.Math.Vector2(this.player.x - source.sprite.x || 1, this.player.y - source.sprite.y).normalize();
    const away = new Phaser.Math.Vector2(this.player.x - source.sprite.x, this.player.y - source.sprite.y);
    if (away.lengthSq() > 16) {
      away.normalize();
      knockback.add(away.scale(0.45)).normalize();
    }
    const next = this.clampToPlayableBounds(
      this.player.x + knockback.x * TRAFFIC_KNOCKBACK_DISTANCE,
      this.player.y + knockback.y * TRAFFIC_KNOCKBACK_DISTANCE,
      scaleDistance(28)
    );
    this.player.setVelocity(0, 0);
    this.player.setPosition(next.x, next.y);
    this.player.body?.updateFromGameObject();
    this.playerState.x = Math.round(this.player.x);
    this.playerState.y = Math.round(this.player.y);
    this.updatePlayerBikeVisual();
  }

  private spawnHitSplash(x: number, y: number): void {
    const colors = [0xe85d5a, 0xff8a5b, 0xffcf70];
    for (let i = 0; i < 10; i += 1) {
      const dot = this.add
        .circle(x, y - scaleDistance(10), Phaser.Math.Between(scaleDistance(3), scaleDistance(7)), colors[i % colors.length], 0.82)
        .setDepth(this.player.y + 12);
      this.tweens.add({
        targets: dot,
        x: x + Phaser.Math.Between(-scaleDistance(34), scaleDistance(34)),
        y: y + Phaser.Math.Between(-scaleDistance(48), scaleDistance(20)),
        scale: 0.25,
        alpha: 0,
        duration: 420,
        ease: "Cubic.easeOut",
        onComplete: () => dot.destroy()
      });
    }
  }

  private spawnFloatingText(
    text: string,
    x: number,
    y: number,
    color: string,
    options: { durationMs?: number; fontSize?: string; backgroundColor?: string } = {}
  ): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: options.fontSize ?? "15px",
        color,
        fontStyle: "700",
        backgroundColor: options.backgroundColor ?? "rgba(17, 24, 32, 0.62)",
        padding: { x: 7, y: 3 }
      })
      .setOrigin(0.5)
      .setDepth(UI_DEPTH - 8);
    this.tweens.add({
      targets: label,
      y: y - scaleDistance(34),
      alpha: 0,
      duration: options.durationMs ?? 900,
      ease: "Cubic.easeOut",
      onComplete: () => label.destroy()
    });
  }

  private spawnInteractionFlourish(kind: InteractionFlourishKind, x: number, y: number, label?: string): void {
    const spec = getInteractionFlourishSpec(kind);
    const ring = this.add
      .circle(x, y, scaleDistance(15), spec.ringColor, 0.08)
      .setStrokeStyle(Math.max(1, scaleDistance(2)), spec.ringColor, 0.9)
      .setScale(spec.startScale)
      .setDepth(y + 18);
    this.tweens.add({
      targets: ring,
      scale: spec.endScale,
      alpha: 0,
      duration: spec.durationMs,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy()
    });
    if (label) {
      this.spawnFloatingText(
        label,
        x,
        y - scaleDistance(32),
        spec.textColor,
        kind === "delivery"
          ? { durationMs: 1800, fontSize: "18px", backgroundColor: "rgba(7, 11, 16, 0.92)" }
          : undefined
      );
    }
  }

  private playPickupPop(sprite: Phaser.GameObjects.Sprite, label: string): void {
    const ghost = this.add
      .sprite(sprite.x, sprite.y, sprite.texture.key)
      .setDepth(sprite.y + 16)
      .setScale(sprite.scaleX, sprite.scaleY)
      .setAlpha(0.92);
    this.tweens.add({
      targets: ghost,
      y: sprite.y - scaleDistance(18),
      scaleX: Math.abs(sprite.scaleX) * 1.28,
      scaleY: Math.abs(sprite.scaleY) * 1.28,
      alpha: 0,
      duration: getInteractionFlourishSpec("pickup").durationMs,
      ease: "Back.easeOut",
      onComplete: () => ghost.destroy()
    });
    this.spawnInteractionFlourish("pickup", sprite.x, sprite.y, label);
    this.playSound("pickup");
  }

  private playDeliveryFlourish(x: number, y: number, payout?: number, celebration?: PayoutCelebrationSpec): void {
    this.spawnInteractionFlourish("delivery", x, y, payout ? `Delivered +Rp ${payout}` : "Delivered");
    this.playSound("payout");
    if (celebration) {
      this.showPayoutCelebration(celebration);
    }
    if (payout && payout > 0) {
      this.spawnCashBurst(x, y, payout);
    }
  }

  private showPayoutCelebration(spec: PayoutCelebrationSpec): void {
    this.finishPayoutCelebration();
    const panelWidth = spec.rentMilestone ? 246 : 218;
    const panelHeight = spec.rentMilestone ? 86 : 66;
    const x = spec.tier === "great"
      ? Math.max(16, Math.round((this.scale.width - panelWidth) / 2))
      : Phaser.Math.Clamp(this.scale.width - panelWidth - 18, 16, Math.max(16, this.scale.width - panelWidth - 18));
    const y = spec.tier === "great" ? 118 : 92;
    const container = this.add.container(x, y).setAlpha(1);
    const bg = this.add.graphics();
    bg.fillStyle(0x101820, 0.9);
    bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 8);
    bg.lineStyle(spec.rentMilestone ? 2 : 1, spec.rentMilestone ? 0xfff0bd : 0x8ee6ff, spec.rentMilestone ? 0.82 : 0.42);
    bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 8);
    const countText = this.add
      .text(14, 10, "Rp +0", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: spec.tier === "great" ? "24px" : "22px",
        fontStyle: "900",
        color: spec.tier === "great" ? "#fff0bd" : "#8ee6ff"
      })
      .setOrigin(0, 0);
    const ratingText = this.add
      .text(16, 40, this.formatPayoutRatingLine(spec), {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        color: "#fff8df"
      })
      .setOrigin(0, 0);
    const children: Phaser.GameObjects.GameObject[] = [bg, countText, ratingText];
    let rentText: Phaser.GameObjects.Text | undefined;
    if (spec.rentMilestone) {
      rentText = this.add
        .text(16, 62, "Rent target covered", {
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "12px",
          fontStyle: "700",
          color: "#fff0bd"
        })
        .setOrigin(0, 0);
      children.push(rentText);
    }
    container.add(children);
    this.hudLayer.add(container);
    const counter = { value: 0 };
    const countTween = this.tweens.add({
      targets: counter,
      value: spec.payout,
      duration: spec.countUpDurationMs,
      ease: "Cubic.easeOut",
      onUpdate: () => countText.setText(`Rp +${Math.round(counter.value)}`),
      onComplete: () => countText.setText(`Rp +${spec.payout}`)
    });
    this.payoutCelebration = { container, countText, ratingText, rentText, countTween, spec };
    this.tweens.add({
      targets: countText,
      scaleX: spec.scalePunch,
      scaleY: spec.scalePunch,
      duration: PAYOUT_FEEL_TUNING.amountPunchDurationMs,
      yoyo: true,
      ease: "Back.easeOut"
    });
    if (spec.ratingMoved) {
      this.tweens.add({
        targets: ratingText,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: PAYOUT_FEEL_TUNING.ratingPunchDurationMs,
        delay: PAYOUT_FEEL_TUNING.ratingPunchDelayMs,
        yoyo: true,
        ease: "Back.easeOut"
      });
    }
    if (spec.rentMilestone && rentText) {
      this.tweens.add({
        targets: rentText,
        alpha: 0.38,
        duration: PAYOUT_FEEL_TUNING.rentPulseDurationMs,
        yoyo: true,
        repeat: PAYOUT_FEEL_TUNING.rentPulseRepeatCount,
        ease: "Sine.easeInOut"
      });
    }
    this.tweens.add({
      targets: container,
      alpha: 0,
      duration: PAYOUT_FEEL_TUNING.fadeOutDurationMs,
      delay: Math.max(0, spec.totalDurationMs - PAYOUT_FEEL_TUNING.fadeOutDurationMs),
      onComplete: () => {
        if (this.payoutCelebration?.container === container) {
          this.payoutCelebration = undefined;
        }
        container.destroy(true);
      }
    });
  }

  private finishPayoutCelebration(): void {
    if (!this.payoutCelebration) {
      return;
    }
    const { container, countText, ratingText, rentText, countTween, spec } = this.payoutCelebration;
    countTween.stop();
    countText.setText(`Rp +${spec.payout}`);
    ratingText.setText(this.formatPayoutRatingLine(spec));
    rentText?.setAlpha(1);
    this.tweens.killTweensOf([container, countText, ratingText, rentText].filter(Boolean));
    this.payoutCelebration = undefined;
    this.tweens.add({
      targets: container,
      alpha: 0,
      duration: PAYOUT_FEEL_TUNING.dismissFadeDurationMs,
      onComplete: () => container.destroy(true)
    });
  }

  private formatPayoutRatingLine(spec: PayoutCelebrationSpec): string {
    const run = `Run ${spec.starRating.toFixed(1)}★`;
    if (!spec.ratingMoved) {
      return run;
    }
    return `${run} · Driver ${spec.previousDriverRating.toFixed(1)}→${spec.nextDriverRating.toFixed(1)}★`;
  }

  private playActivityCommitFlourish(x: number, y: number, label: string): void {
    this.spawnInteractionFlourish("activity", x, y, label);
    this.cameras.main.flash(120, 244, 213, 141, false);
  }

  private spawnBreakdownSmokePuff(): void {
    const smoke = this.add.graphics().setPosition(this.player.x, this.player.y).setDepth(this.player.y + 4);
    smoke.fillStyle(0x4f5558, 0.78);
    smoke.fillCircle(-scaleDistance(8), -scaleDistance(4), scaleDistance(12));
    smoke.fillStyle(0x74797a, 0.68);
    smoke.fillCircle(scaleDistance(5), -scaleDistance(14), scaleDistance(16));
    smoke.fillStyle(0xa1a19a, 0.48);
    smoke.fillCircle(scaleDistance(17), -scaleDistance(24), scaleDistance(11));
    this.tweens.add({
      targets: smoke,
      y: smoke.y - scaleDistance(54),
      x: smoke.x + scaleDistance(18),
      alpha: 0,
      scale: 1.8,
      duration: 1_250,
      ease: "Cubic.easeOut",
      onComplete: () => smoke.destroy()
    });
    this.spawnFloatingText("KRRK—CHUNK", this.player.x, this.player.y - scaleDistance(46), "#ffb8a6");
  }

  private checkBikeTerrain(): void {
    if (!BIKE_TERRAIN_STUCK_ENABLED) {
      return;
    }
    if (!this.playerState.onBike || this.playerState.bikeStuck) {
      return;
    }

    const zone = BIKE_MUD_ZONES.find((candidate) => this.isPointInZone(this.player.x, this.player.y, candidate));
    if (!zone) {
      return;
    }

    const act0Step = this.world.life.actProgress.act0Step;
    const storyDeliveryId = this.world.life.hustle.activeDelivery?.deliveryId;
    const act0FailForwardRide =
      isAct0StoryDelivery(storyDeliveryId) ||
      act0Step === "dropoff_storm_delivery" ||
      act0Step === "landlord_ultimatum" ||
      act0Step === "villa_order_ping" ||
      act0Step === "pickup_villa_delivery" ||
      act0Step === "dropoff_villa_delivery" ||
      act0Step === "pay_kos_deposit";
    if (act0FailForwardRide) {
      const flag = `act0_mud_fail_forward_${storyDeliveryId ?? act0Step}`;
      if (!this.world.questFlags[flag]) {
        this.world.questFlags[flag] = true;
        this.playerState.bikeCondition = Math.max(20, this.playerState.bikeCondition - 6);
        const cargoDamage = this.damageActiveDeliveryCargo("hard_collision");
        this.applyDeliverySpeedStumble(0.72);
        saveWorldState(this.world);
        this.showToast(
          cargoDamage?.damaged
            ? `${zone.label}: cargo -${cargoDamage.amount}%, but the story ride keeps moving.`
            : `${zone.label}: the scooter fishtails, but the kos run keeps moving.`
        );
      }
      return;
    }

    this.playerState.bikeStuck = true;
    this.playerState.onBike = false;
    this.playerState.bikeCondition = Phaser.Math.Clamp(this.playerState.bikeCondition - 14, 0, 100);
    saveWorldState(this.world);
    this.showToast(`The bike bogged down in ${zone.label}. Bring ${REQUIRED_BIKE_HELPERS} group helpers and press E.`);
  }

  private enforceWaterBoundary(): void {
    const correction = resolveWaterBoundaryPosition(this.waterBoundaryGuard, {
      x: this.player.x,
      y: this.player.y
    });
    if (!correction) {
      return;
    }

    this.player.setVelocity(0, 0);
    const clamped = this.clampToPlayableBounds(correction.x, correction.y, scaleDistance(24));
    this.player.setPosition(clamped.x, clamped.y);
    this.player.body?.updateFromGameObject();
    if (this.waterBoundaryToastCooldown <= 0) {
      this.waterBoundaryToastCooldown = WATER_BOUNDARY_TOAST_COOLDOWN_MS;
      this.showToast(
        correction.reason === "sea"
          ? "The surf is for swimming later. Stay on the sand, road, or beach path."
          : "That waterway is not passable yet. Find a road or path around it."
      );
    }
  }

  private enforcePlayableBounds(): void {
    const clamped = this.clampToPlayableBounds(this.player.x, this.player.y, scaleDistance(24));
    if (Math.abs(clamped.x - this.player.x) < 0.5 && Math.abs(clamped.y - this.player.y) < 0.5) {
      return;
    }
    this.player.setVelocity(0, 0);
    this.player.setPosition(clamped.x, clamped.y);
    this.player.body?.updateFromGameObject();
  }

  private clampToPlayableBounds(x: number, y: number, edgeMargin = 0): { x: number; y: number } {
    return clampPointToPlayableBounds(authoredPlayableBounds, { x, y }, edgeMargin);
  }

  private enforceInteriorBounds(): void {
    const interior = this.getActiveInterior();
    if (!interior) {
      return;
    }
    const margin = scaleDistance(18);
    const clamped = {
      x: Phaser.Math.Clamp(this.player.x, interior.origin.x + margin, interior.origin.x + interior.width - margin),
      y: Phaser.Math.Clamp(this.player.y, interior.origin.y + margin, interior.origin.y + interior.height - margin)
    };
    if (Math.abs(clamped.x - this.player.x) < 0.5 && Math.abs(clamped.y - this.player.y) < 0.5) {
      return;
    }
    this.player.setVelocity(0, 0);
    this.player.setPosition(clamped.x, clamped.y);
    this.player.body?.updateFromGameObject();
  }

  private tryAutoExitInterior(): void {
    const target = this.getNearestInteriorInteraction();
    if (target?.type === "exit" && !this.interiorTransitioning) {
      this.exitInterior();
    }
  }

  private checkPlayerBikeHarmToOthers(): void {
    if (!this.playerState.onBike || this.playerState.bikeStuck || this.bikeHarmCooldown > 0) {
      return;
    }

    for (const npc of Object.values(npcDefinitions)) {
      const sprite = this.npcSprites.get(npc.id);
      if (!sprite) {
        continue;
      }
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y) < scaleDistance(34)) {
        this.flagLocalPlayerForBikeHit(npc.name, sprite);
        return;
      }
    }

    for (const traveler of this.getGroupTravelers()) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, traveler.sprite.x, traveler.sprite.y) < scaleDistance(34)) {
        this.flagLocalPlayerForBikeHit(traveler.name, traveler.sprite);
        return;
      }
    }
  }

  private flagLocalPlayerForBikeHit(victimName: string, victim?: { x: number; y: number }): void {
    this.bikeHarmCooldown = 2400;
    const result = applyPlayerBikeHitConsequence(this.world, victimName, this.getAbsoluteMinute(), {
      maxWantedLevel: MAX_PLAYER_WANTED_LEVEL,
      maxBounty: MAX_PLAYER_BOUNTY,
      firstFlagBounty: FIRST_FLAG_BOUNTY,
      repeatFlagBounty: REPEAT_FLAG_BOUNTY
    });
    if (!result.flagged) {
      this.applyPedestrianBumpKnockback(victim);
      this.cameras.main.shake(110, 0.002);
      this.spawnFloatingText("Sorry!", this.player.x, this.player.y - scaleDistance(32), "#fff0bd");
    }
    saveWorldState(this.world);
    this.updatePlayerWantedSign();
    this.showToast(result.toast);
  }

  private applyPedestrianBumpKnockback(victim?: { x: number; y: number }): void {
    const sourceX = victim?.x ?? this.player.x - 1;
    const sourceY = victim?.y ?? this.player.y;
    const away = new Phaser.Math.Vector2(this.player.x - sourceX || 1, this.player.y - sourceY);
    if (away.lengthSq() <= 0.01) {
      away.set(1, 0);
    }
    away.normalize();
    const next = this.clampToPlayableBounds(
      this.player.x + away.x * scaleDistance(36),
      this.player.y + away.y * scaleDistance(36),
      scaleDistance(24)
    );
    this.player.setVelocity(0, 0);
    this.player.setPosition(next.x, next.y);
    this.player.body?.updateFromGameObject();
    this.playerState.x = Math.round(this.player.x);
    this.playerState.y = Math.round(this.player.y);
    this.updatePlayerBikeVisual();
  }

  private updatePlayerWantedSign(): void {
    if (getWantedLevel(this.world.reputation) <= 0) {
      this.playerWantedSign?.setVisible(false);
      return;
    }
    if (!this.playerWantedSign) {
      this.playerWantedSign = this.add
        .text(0, 0, "", {
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "11px",
          color: "#2b1d17",
          align: "center",
          backgroundColor: "#fff0bd",
          padding: { x: 5, y: 3 }
        })
        .setOrigin(0.5);
    }
    this.playerWantedSign
      .setText(`WANTED\nRp ${getBounty(this.world.reputation)}`)
      .setPosition(this.player.x, this.player.y - 48)
      .setDepth(this.player.y + 6)
      .setVisible(true);
  }

  private isPointInZone(x: number, y: number, zone: MudZoneDefinition): boolean {
    return x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height;
  }

  private updateNpcRoutines(delta: number): void {
    for (const npc of Object.values(npcDefinitions)) {
      const state = this.world.npcs[npc.id];
      const sprite = this.npcSprites.get(npc.id);
      const route = getActiveNpcRoute(npc, this.world.clock.minuteOfDay);
      if (!sprite || !route) {
        continue;
      }
      const closedInteriorSlot = this.getClosedInteriorNpcSlot(npc.id);
      if (closedInteriorSlot) {
        sprite.setPosition(closedInteriorSlot.slot.x, closedInteriorSlot.slot.y);
        sprite.body?.updateFromGameObject();
        sprite.setVisible(false);
        continue;
      }
      const interiorSlot = this.getActiveInteriorNpcSlot(npc.id);
      if (interiorSlot) {
        const distanceToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, interiorSlot.x, interiorSlot.y);
        let facingDirection = this.npcFacingDirections.get(npc.id) ?? "down";
        if (distanceToPlayer <= NPC_PROXIMITY_REACTION_RADIUS) {
          facingDirection = directionFromDelta(this.player.x - interiorSlot.x, this.player.y - interiorSlot.y, facingDirection);
        }
        this.npcFacingDirections.set(npc.id, facingDirection);
        sprite.setPosition(interiorSlot.x, interiorSlot.y);
        sprite.body?.updateFromGameObject();
        sprite.setDepth(sprite.y);
        sprite.setVisible(true);
        this.updateNpcIdleVisual(npc, sprite, true, delta);
        this.updateNpcTalkBobVisual(npc.id, sprite, delta);
        this.updateNpcAmbientLineVisual(npc.id, sprite, delta);
        continue;
      }

      const previousMotion = this.npcRouteMotion.get(npc.id) ?? {
        routeId: null,
        waypointIndex: 0,
        pauseMsRemaining: 0
      };
      const routeMotion =
        previousMotion.routeId === route.id
          ? previousMotion
          : {
              routeId: route.id,
              waypointIndex: 0,
              pauseMsRemaining: 0
            };
      const reaction = this.resolveNpcProximityReaction(npc, sprite);
      const cooldown = Math.max(0, (this.npcReactionCooldowns.get(npc.id) ?? 0) - delta);
      this.npcReactionCooldowns.set(npc.id, cooldown);
      const wasNear = this.npcReactionNear.get(npc.id) ?? false;
      const shouldReact = reaction.active && !wasNear && cooldown <= 0;
      this.npcReactionNear.set(npc.id, reaction.active);
      if (shouldReact) {
        this.npcReactionCooldowns.set(npc.id, reaction.cooldownMs);
        this.npcReactionCues.set(npc.id, { cue: reaction.cue, remainingMs: NPC_PROXIMITY_REACTION_LABEL_MS });
        this.npcReactionAnimationTimers.set(npc.id, 260);
      }
      const nextMotion = advanceNpcRouteMotion(
        route,
        {
          ...routeMotion,
          pauseMsRemaining: shouldReact ? Math.max(routeMotion.pauseMsRemaining, reaction.pauseMs) : routeMotion.pauseMsRemaining,
          x: sprite.x,
          y: sprite.y
        },
        delta,
        scaleDistance(42)
      );
      const reactingNow = this.tickNpcReactionAnimation(npc.id, delta);
      let facingDirection = this.npcFacingDirections.get(npc.id) ?? "down";
      if (nextMotion.moving) {
        facingDirection = directionFromDelta(nextMotion.facingDx, nextMotion.facingDy, facingDirection);
      }
      if (reaction.active) {
        facingDirection = directionFromDelta(this.player.x - nextMotion.x, this.player.y - nextMotion.y, facingDirection);
      }
      this.npcFacingDirections.set(npc.id, facingDirection);

      this.npcRouteMotion.set(npc.id, {
        routeId: nextMotion.routeId,
        waypointIndex: nextMotion.waypointIndex,
        pauseMsRemaining: nextMotion.pauseMsRemaining
      });

      state.currentRoutineId = route.id;
      sprite.setPosition(nextMotion.x, nextMotion.y);
      if (reactingNow) {
        this.applyNpcReactionAnimation(npc, sprite, facingDirection);
      } else if (nextMotion.moving) {
        this.applyCharacterAnimation(sprite, npc.spriteKey, facingDirection, true, CHARACTER_SPRITE_SCALE);
      }
      sprite.body?.updateFromGameObject();
      state.x = Math.round(sprite.x);
      state.y = Math.round(sprite.y);
      sprite.setDepth(sprite.y);
      this.updateNpcIdleVisual(npc, sprite, !nextMotion.moving && !reactingNow, delta);
      this.updateNpcReactionVisual(npc, sprite, delta);
      this.updateNpcTalkBobVisual(npc.id, sprite, delta);
      this.updateNpcAmbientLineVisual(npc.id, sprite, delta);
    }
  }

  private resolveNpcProximityReaction(npc: NpcDefinition, sprite: Phaser.Physics.Arcade.Sprite): NpcProximityReaction {
    const distance = Math.hypot(this.player.x - sprite.x, this.player.y - sprite.y);
    return resolveNpcProximityReaction(getRelationship(this.world, "npc", npc.id), distance, NPC_PROXIMITY_REACTION_RADIUS);
  }

  private tickNpcReactionAnimation(npcId: string, delta: number): boolean {
    const current = this.npcReactionAnimationTimers.get(npcId) ?? 0;
    if (current <= 0) {
      return false;
    }
    const remaining = Math.max(0, current - delta);
    if (remaining > 0) {
      this.npcReactionAnimationTimers.set(npcId, remaining);
    } else {
      this.npcReactionAnimationTimers.delete(npcId);
    }
    return true;
  }

  private applyNpcReactionAnimation(npc: NpcDefinition, sprite: Phaser.GameObjects.Sprite, direction: Direction): void {
    sprite.play(npcReactionAnimationKey(npc.spriteKey), true);
    this.setSpriteFacing(sprite, direction === "left", CHARACTER_SPRITE_SCALE);
  }

  private startNpcTalkBob(npcId: string): void {
    this.npcTalkBobTimers.set(npcId, getInteractionFlourishSpec("talk").durationMs);
  }

  private updateNpcTalkBobVisual(npcId: string, sprite: Phaser.GameObjects.Sprite, delta: number): void {
    const current = this.npcTalkBobTimers.get(npcId) ?? 0;
    if (current <= 0) {
      return;
    }
    const spec = getInteractionFlourishSpec("talk");
    const next = Math.max(0, current - delta);
    if (next > 0) {
      this.npcTalkBobTimers.set(npcId, next);
    } else {
      this.npcTalkBobTimers.delete(npcId);
    }
    const progress = 1 - next / spec.durationMs;
    const nod = Math.sin(progress * Math.PI);
    sprite.setScale(sprite.scaleX, Math.abs(sprite.scaleY) * (1 + nod * 0.055));
    sprite.setAngle(sprite.angle + nod * 2.4);
  }

  private showNpcAmbientLine(npcId: string, text: string): void {
    this.npcAmbientLines.set(npcId, { text, remainingMs: 3600 });
  }

  private updateNpcAmbientLineVisual(npcId: string, sprite: Phaser.GameObjects.Sprite, delta: number): void {
    const line = this.npcAmbientLines.get(npcId);
    const existingBubble = this.npcAmbientLineBubbles.get(npcId);
    if (!line) {
      existingBubble?.container.setVisible(false);
      return;
    }

    const remainingMs = line.remainingMs - delta;
    if (remainingMs <= 0) {
      this.npcAmbientLines.delete(npcId);
      existingBubble?.container.setVisible(false);
      return;
    }

    this.npcAmbientLines.set(npcId, { ...line, remainingMs });
    const bubble = this.getNpcAmbientLineBubble(npcId);
    const elapsedMs = 3600 - remainingMs;
    const alpha = Math.min(1, elapsedMs / 150, remainingMs / 350);
    bubble.label.setText(line.text);
    bubble.container
      .setPosition(sprite.x, sprite.y - scaleDistance(76))
      .setDepth(sprite.y + 9)
      .setAlpha(alpha)
      .setVisible(true);
  }

  private getNpcAmbientLineBubble(npcId: string): NpcAmbientLineBubble {
    const existing = this.npcAmbientLineBubbles.get(npcId);
    if (existing) {
      return existing;
    }
    const label = this.add
      .text(0, 0, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "12px",
        color: "#fff8df",
        backgroundColor: "rgba(16,24,32,0.92)",
        padding: { x: 8, y: 5 },
        wordWrap: { width: scaleDistance(140) }
      })
      .setOrigin(0.5, 1);
    const tail = this.add.graphics();
    tail.fillStyle(0x101820, 0.92);
    tail.fillTriangle(-5, 0, 5, 0, 0, 7);
    const container = this.add.container(0, 0, [label, tail]).setVisible(false);
    const bubble = { container, label, tail };
    this.npcAmbientLineBubbles.set(npcId, bubble);
    return bubble;
  }

  private updateNpcIdleVisual(npc: NpcDefinition, sprite: Phaser.Physics.Arcade.Sprite, isIdle: boolean, delta: number): void {
    const label = SHOW_NPC_IDLE_DEBUG_LABELS ? this.getNpcIdleLabel(npc) : this.npcIdleLabels.get(npc.id);
    if (!isIdle) {
      this.npcIdlePhases.set(npc.id, 0);
      sprite.setAngle(0);
      label?.setVisible(false);
      return;
    }

    const elapsed = ((this.npcIdlePhases.get(npc.id) ?? 0) + delta) % 6000;
    const visual = getNpcIdleVisual(npc, elapsed);
    const facingDirection = this.npcFacingDirections.get(npc.id) ?? "down";
    this.npcIdlePhases.set(npc.id, elapsed);
    sprite.play(npcIdleAnimationKey(npc.spriteKey, getNpcIdleTag(npc)), true);
    sprite.setAngle(visual.angleDegrees);
    this.setSpriteFacing(sprite, facingDirection === "left", CHARACTER_SPRITE_SCALE, CHARACTER_SPRITE_SCALE * visual.scaleY);
    if (!SHOW_NPC_IDLE_DEBUG_LABELS) {
      label?.setVisible(false);
      return;
    }
    label?.setText(visual.cue)
      .setPosition(sprite.x, sprite.y - scaleDistance(44) + visual.labelYOffset)
      .setDepth(sprite.y + 4)
      .setAlpha(visual.labelAlpha)
      .setVisible(true);
  }

  private getNpcIdleLabel(npc: NpcDefinition): Phaser.GameObjects.Text {
    const existing = this.npcIdleLabels.get(npc.id);
    if (existing) {
      return existing;
    }
    const label = this.add
      .text(0, 0, getNpcIdleCue(npc), {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "9px",
        color: "#fff8df",
        backgroundColor: "rgba(16,24,32,0.58)",
        padding: { x: 4, y: 2 }
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.npcIdleLabels.set(npc.id, label);
    return label;
  }

  private updateNpcReactionVisual(npc: NpcDefinition, sprite: Phaser.Physics.Arcade.Sprite, delta: number): void {
    const cue = this.npcReactionCues.get(npc.id);
    const existingLabel = this.npcReactionLabels.get(npc.id);
    if (!cue) {
      existingLabel?.setVisible(false);
      return;
    }

    const remainingMs = cue.remainingMs - delta;
    if (remainingMs <= 0) {
      this.npcReactionCues.delete(npc.id);
      existingLabel?.setVisible(false);
      return;
    }

    this.npcReactionCues.set(npc.id, { ...cue, remainingMs });
    const label = this.getNpcReactionLabel(npc);
    label
      .setText(cue.cue)
      .setPosition(sprite.x, sprite.y - scaleDistance(58))
      .setDepth(sprite.y + 6)
      .setAlpha(Math.min(1, remainingMs / 250))
      .setVisible(true);
  }

  private getNpcReactionLabel(npc: NpcDefinition): Phaser.GameObjects.Text {
    const existing = this.npcReactionLabels.get(npc.id);
    if (existing) {
      return existing;
    }
    const label = this.add
      .text(0, 0, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "10px",
        color: "#123026",
        backgroundColor: "#e6fff4",
        padding: { x: 5, y: 2 }
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.npcReactionLabels.set(npc.id, label);
    return label;
  }

  private updateAmbientNpcs(delta: number): void {
    for (const ambientNpc of ambientNpcDefinitions) {
      const sprite = this.ambientNpcSprites.get(ambientNpc.id);
      if (!sprite) {
        continue;
      }

      const previousMotion = this.ambientNpcRouteMotion.get(ambientNpc.id) ?? {
        routeId: ambientNpc.route.id,
        waypointIndex: 0,
        pauseMsRemaining: 0
      };
      const nextMotion = advanceNpcRouteMotion(
        ambientNpc.route,
        {
          ...previousMotion,
          x: sprite.x,
          y: sprite.y
        },
        delta,
        scaleDistance(ambientNpc.speedPxPerSecond ?? 32)
      );

      this.ambientNpcRouteMotion.set(ambientNpc.id, {
        routeId: nextMotion.routeId,
        waypointIndex: nextMotion.waypointIndex,
        pauseMsRemaining: nextMotion.pauseMsRemaining
      });

      if (nextMotion.moving) {
        this.ambientNpcIdlePhases.set(ambientNpc.id, 0);
        sprite.setAngle(0);
        const direction = directionFromDelta(
          nextMotion.facingDx,
          nextMotion.facingDy,
          this.ambientNpcFacingDirections.get(ambientNpc.id) ?? "down"
        );
        this.ambientNpcFacingDirections.set(ambientNpc.id, direction);
        this.applyCharacterAnimation(sprite, ambientNpc.spriteKey, direction, true, CHARACTER_SPRITE_SCALE * 0.92);
      } else {
        this.updateAmbientNpcIdleVisual(ambientNpc, sprite, delta);
      }
      sprite.setPosition(nextMotion.x, nextMotion.y);
      sprite.body?.updateFromGameObject();
      sprite.setDepth(sprite.y - 2);
    }
  }

  private updateAmbientNpcIdleVisual(ambientNpc: AmbientNpcDefinition, sprite: Phaser.Physics.Arcade.Sprite, delta: number): void {
    const elapsed = ((this.ambientNpcIdlePhases.get(ambientNpc.id) ?? 0) + delta) % 6000;
    const visual = getNpcIdleVisual(ambientNpc, elapsed);
    const facingDirection = this.ambientNpcFacingDirections.get(ambientNpc.id) ?? "down";
    const scale = CHARACTER_SPRITE_SCALE * 0.92;
    this.ambientNpcIdlePhases.set(ambientNpc.id, elapsed);
    sprite.play(npcIdleAnimationKey(ambientNpc.spriteKey, ambientNpc.idleTag), true);
    sprite.setAngle(visual.angleDegrees * 0.65);
    this.setSpriteFacing(sprite, facingDirection === "left", scale, scale * visual.scaleY);
  }

  private updatePickups(): void {
    for (const pickup of pickupDefinitions) {
      const sprite = this.pickupSprites.get(pickup.id);
      if (!sprite) {
        continue;
      }
      sprite.setVisible(this.isPickupAvailable(pickup));
      sprite.setDepth(sprite.y);
    }
  }

  private updateDynamicObjectCulling(): void {
    const view = this.cameras.main.worldView;
    const margin = scaleDistance(220);
    const visibleBounds = new Phaser.Geom.Rectangle(view.x - margin, view.y - margin, view.width + margin * 2, view.height + margin * 2);
    const within = (object: { x: number; y: number }): boolean => Phaser.Geom.Rectangle.Contains(visibleBounds, object.x, object.y);

    for (const sprite of this.npcSprites.values()) {
      sprite.setVisible(within(sprite));
    }

    for (const sprite of this.ambientNpcSprites.values()) {
      sprite.setVisible(within(sprite));
    }

    for (const sprite of this.pickupSprites.values()) {
      sprite.setVisible(sprite.visible && within(sprite));
    }

    for (const bike of this.trafficBikes) {
      bike.sprite.setVisible(within(bike.sprite));
    }

    for (const traveler of this.getGroupTravelers()) {
      const travelerVisible = within(traveler.sprite);
      traveler.sprite.setVisible(travelerVisible);
      traveler.bikeSprite.setVisible(traveler.bikeSprite.visible && travelerVisible);
    }

    for (const offender of this.wantedOffenders.values()) {
      const offenderVisible = within(offender.sprite);
      offender.sprite.setVisible(offenderVisible && offender.wantedLevel > 0);
      offender.bikeSprite.setVisible(offenderVisible && offender.wantedLevel > 0);
      offender.sign.setVisible(offender.sign.visible && offenderVisible);
    }
  }

  private updateHud(delta: number): void {
    this.syncHudLayerToCamera();
    this.hudController.syncTouchControlsToCamera();
    const unreadCount = getUnreadOpportunityMessageCount(this.world.opportunities);
    const wantedLevel = getWantedLevel(this.world.reputation);
    const bounty = getBounty(this.world.reputation);
    const mailSuffix = unreadCount > 0 ? `   ✉ ${unreadCount}` : "";
    const cutsceneState = this.activeCutscene ? getCutsceneStepState(this.activeCutscene.script, this.activeCutscene.elapsedMs) : null;
    const hudTopOffset = getStoryHudTopOffset(cutsceneState, this.scale.height);
    const focusBufferMinutes = getFocusBufferRemainingMinutes(this.world);
    this.timeText.setPosition(16, hudTopOffset).setText(
      `${formatClock(this.world)}   Rp ${this.playerState.money}   ★ ${this.world.life.hustle.driverRating.toFixed(1)}${focusBufferMinutes > 0 ? `   ◇ Focus Buffer ${focusBufferMinutes}m` : ""}${mailSuffix}`
    );
    this.hudController.updateMeterReadout({
      money: this.playerState.money,
      energy: this.world.meters.energy,
      wellbeing: this.world.meters.wellbeing,
      focus: this.world.meters.focus,
      social: this.world.meters.social,
      visibleMeters: getVisibleMeters(this.world)
    });
    this.hudController.updatePhoneBadge(unreadCount, this.phoneBuzzTimer > 0);
    this.updateOverlayChrome();
    const fieldObjective = getFieldObjective(this.world);
    if (fieldObjective.title !== this.hudObjectiveTitle) {
      this.hudObjectiveTitle = fieldObjective.title;
      this.hudObjectiveDetailUntil = this.time.now + 6000;
    }
    const showObjectiveDetail = this.time.now < this.hudObjectiveDetailUntil;
    this.questText
      .setPosition(16, hudTopOffset + this.timeText.height + 8)
      .setText(showObjectiveDetail ? `▸ ${fieldObjective.title}\n${fieldObjective.detail}` : `▸ ${fieldObjective.title}`);
    this.questText.setColor(this.objectiveColor(fieldObjective));
    this.questText.setWordWrapWidth(Math.min(420, this.scale.width - 40));

    let warningY = this.questText.y + this.questText.height + 8;
    if (wantedLevel > 0) {
      this.wantedChipText.setText(`WANTED ${wantedLevel} · Rp ${bounty}`).setPosition(16, warningY).setVisible(true);
      warningY += this.wantedChipText.height + 8;
    } else {
      this.wantedChipText.setText("").setVisible(false);
    }
    const deposit = getAct0DepositState(this.world);
    const storyPhoneMomentOpen = Boolean(this.phone?.activeStoryMomentId);
    if (deposit.visible) {
      const depositCopy = storyPhoneMomentOpen
        ? `DEPOSIT TARGET Rp ${deposit.target} · GAP Rp ${deposit.gap}`
        : `DEPOSIT Rp ${deposit.target} · WALLET Rp ${deposit.wallet} · GAP Rp ${deposit.gap}`;
      this.depositChipText.setText(depositCopy).setVisible(true);
      if (storyPhoneMomentOpen) {
        this.depositChipText.setOrigin(0.5, 0).setPosition(this.scale.width / 2, 12);
      } else {
        this.depositChipText.setOrigin(0, 0).setPosition(16, warningY);
      }
      warningY += this.depositChipText.height + 8;
    } else {
      this.depositChipText.setText("").setVisible(false);
    }
    if (this.playerState.onBike && this.playerState.bikeCondition < 50) {
      this.bikeChipText.setText(`Scooter ${this.playerState.bikeCondition}%`).setPosition(16, warningY).setVisible(true);
      warningY += this.bikeChipText.height + 8;
    } else {
      this.bikeChipText.setText("").setVisible(false);
    }
    const cargoIntegrity = this.getActiveCargoIntegrity();
    const cargoSurface = this.mode === "world" ? "world" : this.mode === "interior" ? "interior" : "overlay";
    if (cargoIntegrity != null && shouldShowCargoCareChip(cargoIntegrity, cargoSurface, Boolean(this.activeRivalRace))) {
      const color = cargoIntegrity >= 70 ? "#62c48f" : cargoIntegrity >= 35 ? "#f4b860" : "#ff8f80";
      const rideRun = this.world.life.hustle.activeDelivery?.rideRun;
      this.cargoChipText
        .setText(
          rideRun
            ? `Cargo ${cargoIntegrity}% · Avoid ${rideRun.hazardsAvoided}/${rideRun.hazardsSpawned} · Near ${rideRun.nearMisses}`
            : `Cargo ${cargoIntegrity}%`
        )
        .setColor(color)
        .setPosition(16, warningY)
        .setVisible(true);
    } else {
      this.cargoChipText.setText("").setVisible(false);
    }

    const homeSleepReady = this.isAct0HomeSleepReady();
    const target = this.mode === "world" ? this.getNearestInteraction() : undefined;
    const interiorTarget = this.mode === "interior" ? this.getNearestInteriorInteraction() : undefined;
    this.hudController.setActionButtonMode(this.activeRivalRace ? "concede" : "action");
    if (this.activeRivalRace) {
      const next = this.activeRivalRace.config.route[this.activeRivalRace.checkpointIndex];
      this.promptText.setText(
        `Race Leo: ${next ? `hit ${next.label}` : "finish the lap"}. ${this.getRaceConcedeHint()}`
      );
    } else if (this.mode === "world" && isAct1BreakdownPushActive(this.world)) {
      this.promptText.setText("TRANSMISSION GONE — walk the scooter to the dropoff, then press E / ACT");
    } else if (this.mode === "world" && this.playerState.bikeStuck) {
      this.promptText.setText(
        isAct1ScooterBlown(this.world)
          ? "Transmission blown — repair at the scooter counter"
          : `E / ACT: ask ${REQUIRED_BIKE_HELPERS} helpers to drag the bike out`
      );
    } else if (this.mode === "world" && isAct0FirstRunGateActive(this.world, this.act0FirstRunGateSessionActive)) {
      this.promptText.setText("Find Ibu Sari first - follow the arrow and press E / ACT.");
    } else if (this.mode === "world" && homeSleepReady) {
      this.promptText.setText(`E — Enter ${getPlayerHomeBase(this.world).name}`);
    } else if (this.mode === "world" && isPlayerAtHomeBase(this.world)) {
      this.promptText.setText(`E — Enter ${getPlayerHomeBase(this.world).name}`);
    } else if (this.mode === "world" && target) {
      this.promptText.setText(`E — ${target.label}`);
    } else if (this.mode === "world" && this.canSleepHere()) {
      this.promptText.setText("E / ACT: sleep until morning.");
    } else if (this.mode === "world" && this.showMovementTutorialPrompt) {
      this.promptText.setText("WASD / arrows to move");
    } else if (this.mode === "world") {
      this.promptText.setText("");
    } else if (this.mode === "interior") {
      this.promptText.setText(interiorTarget ? `E — ${interiorTarget.label}` : "");
    } else if (this.mode === "phone") {
      this.promptText.setText("ESC closes the phone.");
    } else if (this.mode === "committedActivity") {
      this.promptText.setText(
        this.hudController.isTouchInputActive
          ? "Activity in progress. Use the on-screen controls."
          : "Activity in progress. ESC cancels early."
      );
    } else if (this.mode === "warungRush") {
      this.promptText.setText("Lunch rush — E / ACT at Ibu's counter to pick up, then at the matching table to serve.");
    } else {
      this.promptText.setText("ESC closes the current panel.");
    }

    this.updateToastVisual(delta);

    this.redrawHudChrome();
    this.drawOpportunityMarkers();
    this.drawRivalRaceMarkers();
    this.drawFieldIndicators();
    this.drawWorldInteractionScenes();
    this.drawObjectiveMarkers();
    this.drawObjectiveDirectionCue();
    this.drawMinimap();
    this.publishDebugSnapshot(target, fieldObjective);
  }

  private objectiveColor(objective: FieldObjectiveState): string {
    if (objective.urgency === "urgent") {
      return "#fff0bd";
    }
    if (objective.urgency === "blocked") {
      return "#ffb8a6";
    }
    if (objective.urgency === "complete") {
      return "#c9ffd8";
    }
    return "#fff8df";
  }

  private getBikeStatusLabel(): string {
    if (!this.playerState.hasBike) {
      return "On foot";
    }
    if (this.playerState.bikeStuck) {
      return `Bike stuck ${this.playerState.bikeCondition}%`;
    }
    return `${this.playerState.onBike ? "Bike riding" : "Bike parked"} ${this.playerState.bikeCondition}%`;
  }

  private updateLighting(): void {
    this.syncZoomCompensatedContainer(this.nightOverlayLayer);
    const phase = getTimePhase(this.world.clock.minuteOfDay);
    const minute = this.world.clock.minuteOfDay;
    let alpha = 0;
    let color = 0x111a31;

    if (phase === "night") {
      alpha = minute < 360 ? 0.5 : 0.47;
      color = 0x071126;
    } else if (phase === "dawn") {
      alpha = 0.16;
      color = 0x6c4a7c;
    } else if (phase === "dusk") {
      alpha = 0.29;
      color = 0x4d3157;
    } else if (this.authoredDay1Clock.active && this.authoredDay1Clock.beat === "morning") {
      alpha = 0.09;
      color = 0xd98b45;
    } else if (this.authoredDay1Clock.active && this.authoredDay1Clock.beat === "noon") {
      alpha = 0.035;
      color = 0xffedc4;
    }

    this.nightOverlay.clear();
    this.nightOverlay.fillStyle(color, alpha);
    this.nightOverlay.fillRect(0, 0, this.scale.width, this.scale.height);

    this.lanternGlow.clear();
    if (alpha > 0.1) {
      const lanterns = [
        [760, 709],
        [1015, 719],
        [1448, 404],
        [1588, 429],
        [660, 1184],
        [1850, 429]
      ];
      for (const [x, y] of lanterns) {
        const point = scalePoint({ x, y });
        this.lanternGlow.fillStyle(0xffcc66, phase === "night" ? 0.28 : 0.15);
        this.lanternGlow.fillCircle(point.x, point.y, scaleDistance(phase === "night" ? 92 : 62));
        this.lanternGlow.fillStyle(0xffefad, 0.65);
        this.lanternGlow.fillCircle(point.x, point.y, scaleDistance(8));
      }
    }

    this.syncAmbientBed();
  }

  /** Story scenes call this at Day-1 beat boundaries; normal clock flow then continues. */
  setTimePhaseForBeat(beat: Day1TimeBeat): boolean {
    const changed = applyTimePhaseForBeat(this.world, this.authoredDay1Clock, beat);
    if (changed) {
      this.updateLighting();
    }
    return changed;
  }

  /** Starts an authored rain/storm scene without persisting weather into the save. */
  startWeather(kind: Exclude<WeatherKind, "clear">): boolean {
    const changed = this.weather.start(kind, "scene");
    if (changed) {
      this.syncAmbientBed();
    }
    return changed;
  }

  stopWeather(): boolean {
    const changed = this.weather.stop();
    if (changed) {
      this.syncAmbientBed();
    }
    return changed;
  }

  /** Optional scene override; null returns bed selection to phase/weather/interior context. */
  setAmbientScene(scene: AmbientScene | null): void {
    this.ambientSceneOverride = scene;
    this.syncAmbientBed();
  }

  private syncAmbientBed(): void {
    const scene =
      this.ambientSceneOverride ??
      (this.activeInteriorId && CAFE_AMBIENT_INTERIOR_IDS.has(this.activeInteriorId)
        ? "cafeInterior"
        : this.activeInteriorId
          ? "interior"
          : "street");
    this.soundManager.setAmbientBed(
      selectAmbientBed({
        phase: getTimePhase(this.world.clock.minuteOfDay),
        weather: this.weather.state.kind,
        scene
      })
    );
  }

  private updateWeather(delta: number): void {
    const activeDelivery = this.world.life.hustle.activeDelivery;
    this.weather.syncDeliveryCondition(activeDelivery?.conditionId);
    const weatherUpdate = this.weather.update(delta);
    if (weatherUpdate.thunder) {
      this.thunderFlashAlpha = 0.72;
      this.playSound("thunder");
    }
    this.thunderFlashAlpha = Math.max(0, this.thunderFlashAlpha - delta / 420);
    this.syncZoomCompensatedContainer(this.weatherOverlayLayer);

    this.wetStreetTint.clear();
    this.rainLayer.clear();
    this.thunderFlash.clear();

    const worldVisible = !this.activeInteriorId && this.mode !== "title";
    if (!worldVisible || !isWeatherWet(this.weather.state)) {
      this.syncAmbientBed();
      return;
    }

    const storm = this.weather.state.kind === "storm";
    this.wetStreetTint.fillStyle(storm ? 0x304e68 : 0x426b7d, storm ? 0.2 : 0.14);
    this.wetStreetTint.fillRect(0, 0, this.scale.width, this.scale.height);
    this.wetStreetTint.lineStyle(1, 0x9dd6dc, storm ? 0.12 : 0.08);
    for (let y = this.scale.height * 0.62; y < this.scale.height; y += 28) {
      this.wetStreetTint.lineBetween(0, y, this.scale.width, y + 5);
    }

    const activeDropCount = this.scale.width <= 480 ? 72 : 128;
    this.ensureRainPool(activeDropCount);
    this.rainLayer.lineStyle(this.scale.width <= 480 ? 1 : 1.35, 0xd5f1ef, storm ? 0.7 : 0.58);
    for (let index = 0; index < activeDropCount; index += 1) {
      const drop = this.rainDrops[index];
      drop.y += drop.speed * (delta / 1000) * (storm ? 1.18 : 1);
      drop.x += drop.drift * (delta / 1000);
      if (drop.y > this.scale.height + drop.length || drop.x > this.scale.width + 24) {
        this.resetRainDrop(drop, true);
      }
      this.rainLayer.lineStyle(this.scale.width <= 480 ? 1 : 1.35, 0xd5f1ef, drop.alpha * (storm ? 1 : 0.82));
      this.rainLayer.lineBetween(drop.x, drop.y, drop.x - drop.drift * 0.035, drop.y - drop.length);
    }

    if (this.thunderFlashAlpha > 0) {
      this.thunderFlash.fillStyle(0xe8f4ff, this.thunderFlashAlpha);
      this.thunderFlash.fillRect(0, 0, this.scale.width, this.scale.height);
    }
    this.syncAmbientBed();
  }

  private ensureRainPool(count: number): void {
    while (this.rainDrops.length < count) {
      const drop: RainDropRuntime = { x: 0, y: 0, speed: 0, length: 0, drift: 0, alpha: 0 };
      this.resetRainDrop(drop, false);
      this.rainDrops.push(drop);
    }
  }

  private resetRainDrop(drop: RainDropRuntime, fromTop: boolean): void {
    drop.x = Math.random() * (this.scale.width + 80) - 40;
    drop.y = fromTop ? -20 - Math.random() * this.scale.height * 0.3 : Math.random() * this.scale.height;
    drop.speed = 470 + Math.random() * 420;
    drop.length = 12 + Math.random() * 18;
    drop.drift = 72 + Math.random() * 52;
    drop.alpha = 0.38 + Math.random() * 0.42;
  }

  private handleAction(): void {
    if (this.activeCutscene) {
      this.skipActiveCutscene();
      return;
    }
    if (this.interiorTransitioning) {
      return;
    }

    if (this.mode === "dialogue") {
      if (this.awaitingRelationshipChoice) {
        return;
      }
      this.closePanel();
      return;
    }

    if (this.mode === "warungRush") {
      this.handleWarungRushAction();
      return;
    }

    if (this.mode === "interior") {
      this.handleInteriorAction();
      return;
    }

    if (this.mode !== "world") {
      return;
    }

    if (this.playerState.bikeStuck) {
      if (isAct1BreakdownPushActive(this.world)) {
        const pushTarget = this.getNearestInteraction();
        if (pushTarget?.type === "delivery") {
          this.handleDeliveryInteraction(pushTarget.id);
        } else {
          this.showToast("TRANSMISSION GONE — push it to the marked dropoff. This run cannot time out.");
        }
        return;
      }
      if (isAct1ScooterBlown(this.world)) {
        this.showToast("The transmission is blown. The scooter counter repair restores riding; helpers cannot.");
        return;
      }
      this.tryFreeBike();
      return;
    }

    const target = this.getNearestInteraction();
    if (
      shouldRedirectAct0FirstRunInteraction(
        this.world,
        this.act0FirstRunGateSessionActive,
        target,
        isPlayerAtHomeBase(this.world)
      )
    ) {
      this.showToast(FIRST_RUN_IBU_REDIRECT_TOAST);
      return;
    }

    if (isPlayerAtHomeBase(this.world)) {
      const homeInterior = getInteriorByVenueId(getPlayerHomeBase(this.world).id);
      if (homeInterior) {
        this.enterInterior(homeInterior.id);
        return;
      }
      this.openHomeActivityMenu();
      return;
    }

    if (!target) {
      if (this.canSleepHere()) {
        this.sleepToMorning();
        return;
      }
      this.showToast("No one is close enough to talk, trade, or join an activity with.");
      return;
    }

    this.interactionController.resolveTarget(target, {
      npc: (id) => this.interactWithNpc(id),
      delivery: (id) => this.handleDeliveryInteraction(id),
      shop: (id) => this.openExteriorVenueInteraction(id),
      venue: (id) => this.openExteriorVenueInteraction(id),
      activity: (id) => this.openActivity(id),
      offender: (id) => this.confrontWantedOffender(id),
      pickup: (id) => this.collectPickup(id)
    });
  }

  private toggleInventory(): void {
    if (this.mode === "inventory") {
      this.closePanel();
      return;
    }
    if (this.mode !== "world") {
      return;
    }
    this.openInventory();
  }

  private toggleCommunityBoard(): void {
    if (this.mode === "community") {
      this.closePanel();
      return;
    }
    if (this.mode !== "world") {
      return;
    }
    this.openCommunityBoard();
  }

  private togglePhone(): void {
    if (this.phone?.isOpen) {
      this.phone.close();
      return;
    }
    if (this.mode !== "world") {
      return;
    }
    this.mode = "phone";
    this.phone?.open();
  }

  private toggleBike(): void {
    if (this.mode !== "world") {
      return;
    }
    if (!this.playerState.hasBike) {
      this.showToast(`Rent a scooter first. You need Rp ${itemDefinitions[BIKE_RENTAL_ITEM_ID].buyPrice}.`);
      return;
    }
    if (this.playerState.bikeStuck) {
      this.showToast(
        isAct1ScooterBlown(this.world)
          ? "The transmission is blown. Repair it at the scooter counter before riding again."
          : `The bike is stuck. Bring ${REQUIRED_BIKE_HELPERS} group helpers and press E.`
      );
      return;
    }

    this.setPlayerBikeMode(!this.playerState.onBike);
    if (this.playerState.onBike && this.playerState.tutorialStep === "rent_bike") {
      this.playerState.tutorialStep = "join_group";
    }
    saveWorldState(this.world);
    this.showToast(this.playerState.onBike ? "Bike mode on. Roads are fast; beach rides stay smooth." : "Bike parked. You are back on foot.");
  }

  private setPlayerBikeMode(requestedOnBike: boolean): boolean {
    this.playerState.onBike = resolveRequestedBikeState(
      requestedOnBike,
      this.mode,
      this.playerState.hasBike,
      this.activeInteriorId
    );
    if (!this.playerState.onBike) {
      this.rideModelState = createRideModelState();
    }
    this.updatePlayerBikeVisual();
    return this.playerState.onBike;
  }

  private interactWithNpc(npcId: string): void {
    const npc = npcDefinitions[npcId];
    const state = this.world.npcs[npcId];
    const routineLabel = getNpcRouteActivityLabel(npc, state.currentRoutineId);
    this.startNpcTalkBob(npcId);
    this.dispatchIntent({ kind: "RecordMemory", subjectType: "npc", subjectId: npcId, memory: "visited", detail: "Spoke in world." });

    const act0Critical = npcId === "ibu_sari" && this.world.life.actProgress.act0Step === "meet_ibu_sari";
    if (getNpcDialogueSurface({ act0Critical }).surface === "panel" && act0Critical) {
      this.startAct0WithIbuSari();
      return;
    }

    if (npcId === "ibu_sari" && canStartIbuGuaranteeScene(this.world)) {
      const guarantee = completeIbuGuaranteeScene(this.world, this.getAbsoluteMinute());
      if (guarantee.ok && guarantee.dialogue) {
        saveWorldState(this.world);
        this.phone?.refresh();
        this.openDialogue(npc.name, guarantee.dialogue, npcId);
        return;
      }
    }

    if (npcId === "made" && canMadeAcceptFinale(this.world)) {
      const acceptance = acceptMadeFinale(this.world, this.getAbsoluteMinute());
      if (acceptance.ok && acceptance.dialogue) {
        saveWorldState(this.world);
        this.phone?.refresh();
        this.openStoryDialogue(npc.name, acceptance.dialogue, npcId, () => this.startAct1MoveOutMontage());
        return;
      }
    }

    if (npcId === "ibu_sari" && isKitchenCircleInvitationPending(this.world)) {
      const invitation = completeKitchenCircleInvitation(this.world);
      if (invitation.fired && invitation.dialogue) {
        saveWorldState(this.world);
        this.phone?.refresh();
        this.openDialogue(npc.name, invitation.dialogue, npcId);
        return;
      }
    }

    if (npcId === "ibu_sari") {
      const deflection = consumeKitchenCircleDeflection(this.world);
      if (deflection) {
        saveWorldState(this.world);
        this.openDialogue(npc.name, deflection, npcId);
        return;
      }
    }

    if (this.shouldOpenIbuHustleBoard(npcId)) {
      this.openIbuHustleBoard();
      return;
    }

    if (npcId === "made" && isMadeRoomOfferPending(this.world)) {
      const roomOffer = completeMadeRoomOfferScene(this.world, this.getAbsoluteMinute());
      if (roomOffer.fired && roomOffer.dialogue) {
        saveWorldState(this.world);
        this.phone?.refresh();
        this.openDialogue(npc.name, roomOffer.dialogue, npcId);
        return;
      }
    }

    const questInteraction = resolveNpcQuestInteraction(this.playerState, npcId);
    if (questInteraction?.handled) {
      for (const intent of questInteraction.intents) {
        this.dispatchIntent(intent);
      }
      if (questInteraction.shouldSave) {
        this.refreshSettlingInGoals();
        saveWorldState(this.world);
      }
      const justCompletedQuest = questInteraction.intents.some(
        (intent) => intent.kind === "RecordMemory" && intent.memory === "completed_quest"
      );
      const choiceScene = justCompletedQuest ? getRelationshipChoiceSceneForNpc(npcId) : undefined;
      const alreadyShownChoice = choiceScene ? Boolean(this.world.collectedPickups[choiceScene.id]) : false;
      if (choiceScene && !alreadyShownChoice) {
        this.openRelationshipChoiceScene(choiceScene);
        return;
      }
      this.openDialogue(npc.name, questInteraction.dialogue, npcId);
      return;
    }

    const arcBeat = completeNextRelationshipArcBeat(this.world, npcId, this.getAbsoluteMinute());
    if (arcBeat) {
      this.refreshSettlingInGoals(false);
      saveWorldState(this.world);
    }
    const baseLine = this.getNpcDialogueLine(npcId);
    if (getNpcDialogueSurface({ relationshipBeat: Boolean(arcBeat) }).surface === "ambient") {
      this.showNpcAmbientLine(npcId, getAmbientNpcLine(this.world, npcId, baseLine));
      return;
    }
    const arcCopy = arcBeat
      ? `\n\n${arcBeat.arc.title} - ${arcBeat.beat.title}\n${arcBeat.beat.description}\nPerk: ${arcBeat.payoffMessage}`
      : "";
    this.openDialogue(
      npc.name,
      `${baseLine}\n\nRight now ${npc.name} is ${routineLabel ?? "taking in the neighborhood"}.${arcCopy}`,
      npcId
    );
  }

  private getNpcDialogueLine(npcId: string): string {
    const finaleLine = getAct1FinaleAmbientLine(this.world, npcId);
    if (finaleLine) return finaleLine;
    const structuralLine = getStructuralNpcDialogueLine(this.world, npcId);
    if (structuralLine) return structuralLine;
    if (npcId === "ibu_sari" && this.world.life.hustle.completedDeliveryIds.includes("act0_ibu_milk_madu_catering")) {
      if (!this.world.questFlags.act0_catering_on_time) {
        return this.world.questFlags.act0_negotiated_fee
          ? '"You bargained, then missed the window," Ibu Sari says. "Still — you finished. I remember both."'
          : '"The window went, but you did not abandon the box," Ibu Sari says. "I remember that."';
      }
      return this.world.questFlags.act0_negotiated_fee
        ? '"You bargained before you had a bed," Ibu Sari says. "But you delivered what you promised. I remember both."'
        : '"You said you would not forget," Ibu Sari says. "You made the window. I remember that too."';
    }
    const line = this.dialogueProvider.getLine(npcId, { memory: getRelationship(this.world, "npc", npcId) });
    if (typeof line === "string") {
      return line;
    }
    return npcDefinitions[npcId]?.defaultLine ?? "The neighborhood hums around you.";
  }

  private openDialogue(title: string, body: string, npcId?: string): void {
    this.closePanel();
    this.mode = "dialogue";
    this.createDialogueOverlay(title, body, npcId);
  }

  private openStoryDialogue(title: string, body: string, npcId: string | undefined, onContinue: () => void): void {
    this.openDialogue(title, body, npcId);
    this.pendingDialogueContinuation = onContinue;
  }

  private openRelationshipChoiceScene(scene: RelationshipChoiceScene): void {
    this.closePanel(false);
    this.mode = "dialogue";
    this.awaitingRelationshipChoice = true;
    this.activeRelationshipChoiceScene = scene;
    this.createRelationshipChoiceOverlay(scene);
  }

  private openRioRaceChallenge(): void {
    const scene = getRelationshipChoiceScene("rio_streak_duel_challenge");
    if (!scene) {
      this.showToast("Leo's race scene is missing.");
      return;
    }
    this.openRelationshipChoiceScene(scene);
  }

  private createRelationshipChoiceOverlay(scene: RelationshipChoiceScene): void {
    this.destroyDialogueOverlay();
    if (typeof document === "undefined") {
      return;
    }
    const npc = npcDefinitions[scene.npcId];

    const overlay = document.createElement("section");
    overlay.className = "bali-life-dialogue";
    overlay.dataset.dialoguePanel = "true";
    overlay.dataset.uiSurface = "dialogue";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", scene.speakerName ?? npc?.name ?? scene.npcId);
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const titleEl = document.createElement("h2");
    titleEl.className = "bali-life-dialogue-title";
    titleEl.textContent = scene.speakerName ?? npc?.name ?? scene.npcId;

    const bodyEl = document.createElement("div");
    bodyEl.className = "bali-life-dialogue-body";
    bodyEl.dataset.dialogueBody = "true";
    bodyEl.textContent = `${scene.npcOpeningLine}\n\n${scene.prompt}`;

    const choiceRow = document.createElement("div");
    choiceRow.className = "bali-life-dialogue-choices";
    for (const option of scene.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bali-life-dialogue-choice";
      button.textContent = option.label;
      button.addEventListener("click", () => this.resolveRelationshipChoice(scene, option));
      choiceRow.appendChild(button);
    }

    const content = document.createElement("div");
    content.className = "bali-life-dialogue-content";
    const portrait = this.createDialoguePortraitElement(scene.npcId);
    if (portrait) {
      overlay.classList.add("has-portrait");
      content.appendChild(portrait);
    }
    const copy = document.createElement("div");
    copy.className = "bali-life-dialogue-copy";
    copy.append(titleEl, bodyEl);
    content.appendChild(copy);

    overlay.append(content, choiceRow);
    document.body.appendChild(overlay);
    this.dialogueOverlay = overlay;
  }

  private resolveRelationshipChoice(scene: RelationshipChoiceScene, option: RelationshipChoiceOption): void {
    if (!this.awaitingRelationshipChoice) return;
    this.awaitingRelationshipChoice = false;
    this.activeRelationshipChoiceScene = undefined;
    const consumesScene =
      option.actionId !== "start_rio_race" &&
      option.actionId !== "decline_rio_race" &&
      option.actionId !== "complete_act1_leo_encounter";
    if (consumesScene) {
      this.world.collectedPickups[scene.id] = (this.world.collectedPickups[scene.id] ?? 0) + 1;
    }
    const meterDeltas: Partial<Record<"energy" | "focus", number>> = {};
    if (option.energyDelta) {
      meterDeltas.energy = option.energyDelta;
    }
    if (option.focusDelta) {
      meterDeltas.focus = option.focusDelta;
    }
    if (Object.keys(meterDeltas).length > 0) {
      adjustPlayerMeters(this.world, meterDeltas);
    }
    if (option.affinityBonus) {
      bumpRelationshipAffinity(this.world, "npc", scene.npcId, option.affinityBonus, `Chose: ${option.label}`, this.getAbsoluteMinute());
    }
    if (option.axis) {
      this.dispatchIntent({
        kind: "AdjustReputationAxis",
        axis: option.axis.kind,
        delta: option.axis.delta,
        reason: `${npcDefinitions[scene.npcId]?.name ?? scene.npcId}: ${option.label}`
      });
    }
    if (option.memory) {
      this.dispatchIntent({
        kind: "RecordMemory",
        subjectType: "npc",
        subjectId: scene.npcId,
        memory: option.memory.type,
        detail: option.memory.detail
      });
    }
    if (option.actionId === "accept_act0_humbly" || option.actionId === "negotiate_act0_fee") {
      this.resolveAct0OpeningChoice(option);
      return;
    }
    if (option.actionId === "start_rio_race") {
      this.pendingChoiceOpportunityId = undefined;
      this.destroyDialogueOverlay();
      this.startRioRace();
      return;
    }
    if (option.actionId === "decline_rio_race") {
      this.pendingChoiceOpportunityId = undefined;
      saveWorldState(this.world);
      this.openDialogue(npcDefinitions[scene.npcId]?.name ?? scene.npcId, option.resultLine, scene.npcId);
      return;
    }
    if (option.actionId === "complete_act1_leo_encounter") {
      completeAct1LeoEncounter(this.world, this.getAbsoluteMinute());
      const kadekRushMessage = buildKadekRushOfferMessage(this.world, this.getAbsoluteMinute());
      if (kadekRushMessage) {
        appendOpportunityMessage(this.world.opportunities, kadekRushMessage);
      }
      saveWorldState(this.world);
      this.openDialogue(
        npcDefinitions[scene.npcId]?.name ?? scene.npcId,
        `${option.resultLine}\n\n${getAct1LeoEncounterHookLine(this.world)}`,
        scene.npcId
      );
      return;
    }
    if (option.actionId === "keep_act1_luxury_tip" || option.actionId === "return_act1_luxury_tip") {
      const choice = option.actionId === "keep_act1_luxury_tip" ? "keep" : "return";
      const resolution = resolveAct1LuxuryTipChoice(this.world, choice, this.getAbsoluteMinute());
      saveWorldState(this.world);
      this.phone?.refresh();
      this.openDialogue(
        scene.speakerName ?? npcDefinitions[scene.npcId]?.name ?? scene.npcId,
        resolution.ok ? option.resultLine : "The transfer has already been settled."
      );
      return;
    }
    let followUpLine = "";
    if (option.actionId === "accept_no_questions" && this.pendingChoiceOpportunityId) {
      const result = acceptOpportunity(
        this.world.opportunities,
        this.pendingChoiceOpportunityId,
        getOpportunityAbsoluteMinute(this.world.clock)
      );
      followUpLine = result.ok
        ? "\n\n(The package is yours now. Commit to the run at the rental counter before the window closes.)"
        : `\n\n(${result.message})`;
    }
    if (option.actionId === "decline_no_questions" && this.pendingChoiceOpportunityId) {
      const result = declineOpportunity(
        this.world.opportunities,
        this.world,
        this.pendingChoiceOpportunityId,
        getOpportunityAbsoluteMinute(this.world.clock)
      );
      if (result.ok) {
        followUpLine = "\n\n(You stayed clean. Word gets around Berawa either way.)";
      }
    }
    this.pendingChoiceOpportunityId = undefined;
    saveWorldState(this.world);
    this.openDialogue(npcDefinitions[scene.npcId]?.name ?? scene.npcId, option.resultLine + followUpLine, scene.npcId);
  }

  private createDialogueOverlay(title: string, body: string, npcId?: string): void {
    this.destroyDialogueOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const overlay = document.createElement("section");
    overlay.className = "bali-life-dialogue";
    overlay.dataset.dialoguePanel = "true";
    overlay.dataset.uiSurface = "dialogue";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", title);
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const titleEl = document.createElement("h2");
    titleEl.className = "bali-life-dialogue-title";
    titleEl.textContent = title;

    const bodyEl = document.createElement("div");
    bodyEl.className = "bali-life-dialogue-body";
    bodyEl.dataset.dialogueBody = "true";
    bodyEl.textContent = body;

    const hint = document.createElement("div");
    hint.className = "bali-life-dialogue-hint";
    hint.textContent = this.hudController.isTouchInputActive ? "Tap Continue" : "E / ESC";

    const content = document.createElement("div");
    content.className = "bali-life-dialogue-content";
    const portrait = this.createDialoguePortraitElement(npcId);
    if (portrait) {
      overlay.classList.add("has-portrait");
      content.appendChild(portrait);
    }
    const copy = document.createElement("div");
    copy.className = "bali-life-dialogue-copy";
    copy.append(titleEl, bodyEl);
    content.appendChild(copy);

    overlay.appendChild(content);
    if (this.hudController.isTouchInputActive) {
      const footer = document.createElement("div");
      footer.className = "bali-life-dialogue-footer";
      const continueButton = document.createElement("button");
      continueButton.type = "button";
      continueButton.className = "bali-life-dialogue-continue";
      continueButton.textContent = "Continue";
      continueButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.playUiClick();
        this.handleAction();
      });
      footer.append(hint, continueButton);
      overlay.appendChild(footer);
    } else {
      overlay.appendChild(hint);
    }
    document.body.appendChild(overlay);
    this.dialogueOverlay = overlay;
  }

  private createDialoguePortraitElement(npcId: string | undefined): HTMLImageElement | null {
    if (!npcId || typeof document === "undefined") {
      return null;
    }
    const definition = getPortraitDefinition(npcId);
    if (!definition) {
      return null;
    }
    const tier = getAffinityTier(getRelationship(this.world, "npc", npcId));
    const variant = portraitVariantForTier(tier);
    const src = getPortraitDataUrl(npcId, variant);
    if (!src) {
      return null;
    }
    const img = document.createElement("img");
    img.className = "bali-life-dialogue-portrait";
    img.src = src;
    img.alt = definition.alt;
    img.dataset.npcId = npcId;
    img.dataset.variant = variant;
    return img;
  }

  private destroyDialogueOverlay(): void {
    this.dialogueOverlay?.remove();
    this.dialogueOverlay = undefined;
  }

  private openShop(shopId: string): void {
    this.mode = "shop";
    this.dispatchIntent({ kind: "VisitVenue", venueId: shopId });
    this.renderShopPanel(shopDefinitions[shopId]);
  }

  private visitStreetVenue(venueId: string): void {
    const node = curatedVenueNodes.find((candidate) => candidate.venueId === venueId);
    if (!node) {
      return;
    }

    const existingRelationship = getRelationship(this.world, "venue", venueId);
    const isFirstVisit = !existingRelationship?.memories.some((memory) => memory.type === "visited");
    const venue = getVenue(venueId);
    const flavor = getStreetVenueFlavor({
      venueId,
      name: venue?.name ?? node.name,
      category: node.category,
      isLandmark: node.isLandmark,
      minuteOfDay: this.world.clock.minuteOfDay
    });

    this.dispatchIntent({ kind: "VisitVenue", venueId });

    if (isFirstVisit) {
      adjustPlayerMeters(this.world, { focus: flavor.focusDelta, social: flavor.socialEnergyDelta });
      this.playerState.connections += flavor.connectionDelta;
    }

    saveWorldState(this.world);
    const firstVisitMeterCopy = formatVisibleMeterDeltas(this.world, {
      focus: flavor.focusDelta,
      social: flavor.socialEnergyDelta
    });
    const statLine = isFirstVisit
      ? `\n\nFirst visit: ${
          firstVisitMeterCopy ? `${firstVisitMeterCopy.replace(/, /g, "  |  ")}  |  ` : ""
        }Links ${formatSigned(flavor.connectionDelta)}`
      : "\n\nYou have already mapped this stop. It still feels useful as a landmark.";
    this.openDialogue(venue?.name ?? node.name, `${flavor.body}${statLine}`);
    this.showToast(isFirstVisit ? flavor.firstVisitToast : flavor.repeatToast);
  }

  private startAct0WithIbuSari(): void {
    this.playerState.hasBike = true;
    this.playerState.bikeStuck = false;
    this.setPlayerBikeMode(false);
    this.playerState.bikeCondition = Math.min(this.playerState.bikeCondition, 48);
    this.playerState.tutorialStep = "free_roam";
    this.world.life.hustle.scooterTier = "borrowed_rattletrap";
    if (getQuantity(this.playerState, SCOOTER_KEY_ITEM_ID) === 0) {
      addItem(this.playerState, SCOOTER_KEY_ITEM_ID, 1);
    }
    const accepted = acceptDelivery(this.world, "first_baked_villa_delivery", this.getAbsoluteMinute());
    completeAct0Step(this.world, "meet_ibu_sari");
    saveWorldState(this.world);
    this.openDialogue(
      "Ibu Sari",
      [
        "You found me. Good. Berawa is easier when one person is in your corner.",
        "Take this scooter. It rattles, but it knows the lane better than you do.",
        accepted.ok
          ? "Your first gig is already on the phone: pick up pastries at BAKED and take them to the villa gate. Do this clean and you get your first rating."
          : accepted.message
      ].join("\n\n"),
      "ibu_sari"
    );
    this.showToast("Borrowed scooter unlocked. First delivery accepted.");
  }

  private startAct0Opening(): void {
    if (this.world.life.actProgress.act0Step !== "meet_ibu_sari" || this.world.questFlags.act0_v4_opening_complete) {
      this.openFirstRunHint();
      return;
    }
    this.act0FirstRunGateSessionActive = true;
    this.showMovementTutorialPrompt = false;
    this.world.clock.minuteOfDay = 6 * 60 + 50;
    this.player.setPosition(2352, 96);
    this.player.body?.reset(2352, 96);

    const bus = this.add.container(2420, 96).setDepth(220);
    bus.add([
      this.add.rectangle(0, 0, 132, 48, 0x315b78).setStrokeStyle(3, 0xfff0bd, 0.8),
      this.add.rectangle(-24, -7, 22, 14, 0x9ee6df, 0.9),
      this.add.rectangle(8, -7, 22, 14, 0x9ee6df, 0.9),
      this.add.circle(-42, 23, 10, 0x101820),
      this.add.circle(42, 23, 10, 0x101820)
    ]);
    const ibu = this.add.container(2192, 96).setDepth(221);
    ibu.add(this.add.sprite(0, 0, "npc-sari").setScale(CHARACTER_SPRITE_SCALE));
    const backpack = this.add.container(2352, 110).setDepth(2351);
    backpack.add([
      this.add.ellipse(0, 4, 36, 20, 0x5f4635).setStrokeStyle(2, 0xd1a968, 0.8),
      this.add.rectangle(0, -7, 22, 18, 0x7a5940).setStrokeStyle(2, 0x3d2c23, 0.7)
    ]);
    const actors = new Map<string, Phaser.GameObjects.Container>([
      ["arrival_bus", bus],
      ["ibu_sari_cutscene", ibu],
      ["arrival_backpack", backpack]
    ]);
    const script = buildAct0OpeningCutscene({
      player: { x: 2352, y: 96 },
      busStart: { x: 2420, y: 96 },
      busExit: { x: 2820, y: 96 },
      ibuStart: { x: 2192, y: 96 },
      ibuEnd: { x: 2304, y: 96 },
      station: { x: 2192, y: 96 }
    });
    this.startCutscene(script, () => {
      const choice = getRelationshipChoiceScene("ibu_sari_act0_scooter_deal");
      if (choice) {
        this.openRelationshipChoiceScene(choice);
      }
    }, actors);
  }

  private resolveAct0OpeningChoice(option: RelationshipChoiceOption): void {
    const accepted = startAct0FirstDelivery(
      this.world,
      option.actionId === "negotiate_act0_fee",
      this.getAbsoluteMinute()
    );
    if (accepted.ok) {
      this.setPlayerBikeMode(true);
    }
    this.pendingChoiceOpportunityId = undefined;
    saveWorldState(this.world);
    this.destroyDialogueOverlay();
    this.openDialogue(
      "Ibu Sari",
      `${option.resultLine}\n\n${accepted.ok ? "Catering box loaded. The 15:00 countdown is live — ride to Milk & Madu now." : accepted.message}`,
      "ibu_sari"
    );
    this.showToast("TIMED DELIVERY LIVE — Milk & Madu · 15 min");
  }

  private openExteriorVenueInteraction(venueId: string): void {
    const interior = getInteriorByVenueId(venueId);
    if (interior) {
      this.enterInterior(interior.id);
      return;
    }
    this.openVenueActivityMenu(venueId);
  }

  private openVenueActivityMenu(venueId: string): void {
    const context = getVenueActivityContext(venueId);
    const shop = shopDefinitions[venueId];
    if (!context) {
      if (shop) {
        this.openShop(venueId);
      }
      return;
    }

    this.closePanel(false);
    this.mode = "activity";
    this.dispatchIntent({ kind: "VisitVenue", venueId });

    const availability = getActivityAvailability(this.world, context);
    this.createActivityMenuOverlay(venueId, context, availability, shop);
  }

  private handleInteriorAction(): void {
    const target = this.getNearestInteriorInteraction();
    if (!target) {
      this.showToast("Nothing in reach here yet.");
      return;
    }
    if (target.type === "exit") {
      this.exitInterior();
      return;
    }
    if (target.type === "npc") {
      this.interactWithNpc(target.id);
      return;
    }
    if (target.type === "delivery") {
      this.handleDeliveryInteraction(target.id);
      return;
    }
    this.openVenueActivityMenu(target.activityVenueId);
  }

  private enterInterior(interiorId: string): void {
    const interior = interiorDefinitions[interiorId];
    if (!interior || this.interiorTransitioning) {
      return;
    }
    const warungAccess = interior.id === "warung_sari_interior"
      ? getWarungInteriorAccessState(this.world)
      : undefined;
    if (warungAccess && !warungAccess.allowed) {
      this.showToast(warungAccess.message);
      return;
    }
    this.renderInteriorIfNeeded(interior);
    this.closePanel(false);
    this.phone?.close();
    this.interiorTransitioning = true;
    this.interiorReturnPoint = { x: this.player.x, y: this.player.y };
    this.setPlayerBikeMode(false);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.activeInteriorId = interior.id;
      this.mode = "interior";
      this.applyInteriorCameraBounds(interior);
      this.hudController.setMinimapHidden(true);
      this.placePlayerSprite(interior.entrance, false);
      this.interiorTransitioning = false;
      this.cameras.main.fadeIn(400, 0, 0, 0);
      this.showToast(
        warungAccess?.kind === "regular_after_hours"
          ? warungAccess.message
          : `Entered ${interior.name}.`
      );
      this.maybeStartAct0InteriorBeat();
    });
  }

  private maybeStartAct0InteriorBeat(): void {
    if (this.activeInteriorId === "milk_madu_interior" && this.world.life.actProgress.act0Step === "buy_meal_and_coffee") {
      this.startAct0CafeScene();
      return;
    }
    if (this.activeInteriorId === "cheap_kos_interior" && this.world.life.actProgress.act0Step === "pay_kos_deposit") {
      this.startAct0KosResolve();
    }
  }

  private startAct0CafeScene(): void {
    if (this.activeCutscene || this.world.life.actProgress.act0Step !== "buy_meal_and_coffee") {
      return;
    }
    const interior = interiorDefinitions.milk_madu_interior;
    this.world.questFlags.act0_cafe_scene_started = true;
    this.setTimePhaseForBeat("noon");
    this.setAmbientScene("cafeInterior");
    this.placePlayerSprite({ x: interior.origin.x + TILE_SIZE * 6.2, y: interior.origin.y + TILE_SIZE * 5.45 }, false);

    const vance = this.add.container(interior.origin.x + TILE_SIZE * 6.9, interior.origin.y + TILE_SIZE * 2.35).setDepth(260);
    vance.add(this.add.sprite(0, 0, npcDefinitions.pak_bagus.spriteKey).setScale(CHARACTER_SPRITE_SCALE));
    const tableBusiness = this.add.container(interior.origin.x + TILE_SIZE * 6.2, interior.origin.y + TILE_SIZE * 4.95).setDepth(255);
    tableBusiness.add([
      this.add.ellipse(-18, 2, 38, 20, 0xfff0bd).setStrokeStyle(2, 0x73543a, 0.8),
      this.add.circle(22, -1, 10, 0xf7f0df).setStrokeStyle(2, 0x73543a, 0.8),
      this.add.circle(22, -1, 5, 0x543323)
    ]);
    const actors = new Map<string, Phaser.GameObjects.Container>([
      ["julian_vance", vance],
      ["plate_and_coffee", tableBusiness]
    ]);

    this.startCutscene(buildAct0CafeScene(), () => {
      if (this.world.life.actProgress.act0Step !== "buy_meal_and_coffee") return;
      completeAct0CafeScene(this.world);
      this.setAmbientScene(null);
      saveWorldState(this.world);
      this.mode = "phone";
      this.phone?.openAct0Signup(() => this.completeAct0NusaDropSignup());
    }, actors);
  }

  private completeAct0NusaDropSignup(): void {
    if (this.world.life.actProgress.act0Step !== "nusadrop_signup") return;
    const accepted = acceptDelivery(this.world, ACT0_STORM_DELIVERY_ID, this.getAbsoluteMinute());
    if (!accepted.ok) {
      this.showToast(accepted.message);
      return;
    }
    pickupDelivery(this.world, this.getAbsoluteMinute());
    completeAct0Step(this.world, "nusadrop_signup");
    saveWorldState(this.world);
    this.showToast("NusaDrop run live — sealed bag loaded. Ride to the beach service shelter.");
    if (this.activeInteriorId) {
      this.exitInterior();
    }
  }

  private startAct0LandlordUltimatum(): void {
    if (this.activeCutscene || this.world.life.actProgress.act0Step !== "landlord_ultimatum") {
      return;
    }
    this.world.questFlags.act0_landlord_ultimatum_started = true;
    const deposit = revealAct0Deposit(this.world);
    saveWorldState(this.world);
    this.startCutscene(buildAct0LandlordUltimatumScene(deposit.target, deposit.wallet), () => {
      if (this.world.life.actProgress.act0Step !== "landlord_ultimatum") return;
      completeAct0Step(this.world, "landlord_ultimatum");
      this.setTimePhaseForBeat("night");
      this.startWeather("rain");
      saveWorldState(this.world);
      this.openAct0VillaOrder();
    });
  }

  private openAct0VillaOrder(): void {
    if (this.world.life.actProgress.act0Step !== "villa_order_ping") return;
    const definition = getDeliveryDefinition(ACT0_VILLA_DELIVERY_ID);
    if (!definition) return;
    const condition = definition.conditions?.[0];
    const cleanPayout = calculateDeliveryPayout(getEffectiveDeliveryTerms(definition, condition, this.world).payout, 5);
    const deposit = getAct0DepositState(this.world);
    // A mud fishtail can happen while the dropoff alert owns the screen; the critical path must still accept and ride.
    prepareAct0VillaOrder(this.world);
    this.mode = "phone";
    this.phone?.openAct0VillaOrder(deposit.gap, cleanPayout, () => {
      if (this.world.life.actProgress.act0Step !== "villa_order_ping") return;
      const accepted = acceptDelivery(this.world, ACT0_VILLA_DELIVERY_ID, this.getAbsoluteMinute());
      if (!accepted.ok) {
        this.showToast(accepted.message);
        return;
      }
      completeAct0Step(this.world, "villa_order_ping");
      saveWorldState(this.world);
      this.showToast(`SURGE ACCEPTED — clean Rp ${cleanPayout}. Pickup at BAKED.`);
    });
  }

  private startAct0KosResolve(): void {
    if (this.activeCutscene || this.world.life.actProgress.act0Step !== "pay_kos_deposit") {
      return;
    }
    this.world.questFlags.act0_kos_resolve_started = true;
    const resolution = resolveAct0Deposit(this.world);
    this.stopWeather();
    this.setAmbientScene("interior");
    saveWorldState(this.world);
    const interior = interiorDefinitions.cheap_kos_interior;
    const landlord = this.add
      .container(interior.exitMat.x + TILE_SIZE * 1.05, interior.exitMat.y - TILE_SIZE * 0.28)
      .setDepth(interior.exitMat.y + 12);
    const landlordSprite = this.add
      .sprite(0, 0, npcDefinitions.pak_bagus.spriteKey)
      .setScale(CHARACTER_SPRITE_SCALE * 1.2)
      .setTint(0x80675a);
    landlord.add([
      this.add.ellipse(0, TILE_SIZE * 0.36, TILE_SIZE * 0.78, TILE_SIZE * 0.22, 0x090807, 0.68),
      landlordSprite
    ]);
    this.startCutscene(buildAct0KosResolveScene(resolution), () => {
      if (this.world.life.actProgress.act0Step !== "pay_kos_deposit") return;
      completeAct0Step(this.world, "pay_kos_deposit");
      saveWorldState(this.world);
      this.startCutscene(buildAct0CollapseScene(), () => {
        this.setAmbientScene(null);
        if (this.world.life.actProgress.act0Step === "sleep_first_night") {
          this.sleepToMorning();
        }
      });
    }, new Map([["kos_landlord", landlord]]));
  }

  private resumeAct0BackHalfIfNeeded(): void {
    const step = this.world.life.actProgress.act0Step;
    if (step === "nusadrop_signup") {
      this.mode = "phone";
      this.phone?.openAct0Signup(() => this.completeAct0NusaDropSignup());
      return;
    }
    if (step === "dropoff_storm_delivery" && getAct0StormTriggerCount(this.world) > 0) {
      this.setTimePhaseForBeat("stormDusk");
      this.startWeather("storm");
      return;
    }
    if (step === "landlord_ultimatum") {
      this.startAct0LandlordUltimatum();
      return;
    }
    if (step === "villa_order_ping") {
      this.setTimePhaseForBeat("night");
      this.startWeather("rain");
      this.openAct0VillaOrder();
      return;
    }
    if (step === "pickup_villa_delivery" || step === "dropoff_villa_delivery" || step === "pay_kos_deposit") {
      this.setTimePhaseForBeat("night");
      this.startWeather("rain");
    }
  }

  private exitInterior(): void {
    const interior = this.getActiveInterior();
    if (!interior || this.interiorTransitioning) {
      return;
    }
    const returnPoint = this.interiorReturnPoint ?? this.getExteriorDoorReturnPoint(interior);
    this.interiorTransitioning = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.activeInteriorId = null;
      this.mode = "world";
      this.applyWorldCameraBounds();
      this.layoutForViewport();
      this.hudController.setMinimapHidden(false);
      this.resetNpcSpritesToRoutineState();
      this.placePlayerSprite(returnPoint, true);
      this.interiorReturnPoint = undefined;
      this.interiorTransitioning = false;
      this.cameras.main.fadeIn(400, 0, 0, 0);
      this.showToast(
        this.playerState.hasBike
          ? `Left ${interior.name}. Your scooter is outside; press B / BIKE to ride.`
          : `Left ${interior.name}.`
      );
    });
  }

  private renderInteriorIfNeeded(interior: InteriorDefinition): void {
    if (this.renderedInteriorIds.has(interior.id)) {
      return;
    }
    this.renderedInteriorIds.add(interior.id);
    this.drawInteriorShell(interior);
    this.createInteriorDiners(interior);
  }

  private drawInteriorShell(interior: InteriorDefinition): void {
    const g = this.add.graphics().setDepth(35);
    const { x, y } = interior.origin;
    const width = interior.width;
    const height = interior.height;
    const wall = TILE_SIZE * 0.45;
    const doorGap = TILE_SIZE * 1.35;
    const doorLeft = interior.exitMat.x - doorGap / 2;
    const doorRight = interior.exitMat.x + doorGap / 2;
    const isBleakKos = interior.id === "cheap_kos_interior";
    const isSharedRoom = interior.id === "shared_room_interior";
    const isCompactHome = isBleakKos || isSharedRoom;

    g.fillStyle(0x101820, 1);
    g.fillRect(x - TILE_SIZE * 8, y - TILE_SIZE * 7, width + TILE_SIZE * 16, height + TILE_SIZE * 14);
    g.fillStyle(isBleakKos ? 0x302b29 : isSharedRoom ? 0x496a67 : 0xb9824f, 1);
    g.fillRoundedRect(x, y, width, height, TILE_SIZE * 0.18);
    g.fillStyle(isBleakKos ? 0x514b45 : isSharedRoom ? 0xcab58d : 0xdab277, 1);
    g.fillRect(x + wall, y + wall, width - wall * 2, height - wall * 2);

    g.lineStyle(1, isBleakKos ? 0x756c61 : isSharedRoom ? 0xa68f6f : 0xc99b62, isBleakKos ? 0.18 : 0.32);
    for (let row = 1; row < 8; row += 1) {
      g.lineBetween(x + wall, y + row * TILE_SIZE, x + width - wall, y + row * TILE_SIZE);
    }
    for (let column = 1; column < 12; column += 1) {
      g.lineBetween(x + column * TILE_SIZE, y + wall, x + column * TILE_SIZE, y + height - wall);
    }

    g.fillStyle(isBleakKos ? 0x211e1d : isSharedRoom ? 0x2b4545 : 0x5b3a29, 1);
    g.fillRect(x, y, width, wall);
    g.fillRect(x, y, wall, height);
    g.fillRect(x + width - wall, y, wall, height);
    g.fillRect(x, y + height - wall, Math.max(0, doorLeft - x), wall);
    g.fillRect(doorRight, y + height - wall, Math.max(0, x + width - doorRight), wall);

    g.fillStyle(isBleakKos ? 0x625a50 : 0xf0d192, 1);
    g.fillRoundedRect(x + TILE_SIZE * 1.1, y + TILE_SIZE * 0.8, TILE_SIZE * (isBleakKos ? 3.1 : isCompactHome ? 7.8 : 9.8), TILE_SIZE * 0.56, TILE_SIZE * 0.12);
    g.fillStyle(isBleakKos ? 0x393431 : isSharedRoom ? 0x52706d : 0x7f4f35, 1);
    g.fillRoundedRect(x + TILE_SIZE * 1.35, y + TILE_SIZE * 1.12, TILE_SIZE * (isBleakKos ? 2.6 : isCompactHome ? 7.3 : 9.3), TILE_SIZE * 0.28, TILE_SIZE * 0.08);

    g.fillStyle(0x253a35, 0.82);
    g.fillRoundedRect(interior.exitMat.x - TILE_SIZE * 0.55, interior.exitMat.y - TILE_SIZE * 0.26, TILE_SIZE * 1.1, TILE_SIZE * 0.52, TILE_SIZE * 0.08);
    g.lineStyle(1, 0xfff0bd, 0.62);
    g.strokeRoundedRect(interior.exitMat.x - TILE_SIZE * 0.55, interior.exitMat.y - TILE_SIZE * 0.26, TILE_SIZE * 1.1, TILE_SIZE * 0.52, TILE_SIZE * 0.08);

    if (interior.id === "warung_sari_interior") {
      g.fillStyle(0x6f4a2f, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.2, y + TILE_SIZE * 1.65, TILE_SIZE * 9.6, TILE_SIZE * 1.05, TILE_SIZE * 0.1);
      g.fillStyle(0xf6d79b, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.5, y + TILE_SIZE * 1.82, TILE_SIZE * 2.2, TILE_SIZE * 0.36, TILE_SIZE * 0.08);
      g.fillRoundedRect(x + TILE_SIZE * 4.2, y + TILE_SIZE * 1.82, TILE_SIZE * 2.6, TILE_SIZE * 0.36, TILE_SIZE * 0.08);
      g.fillStyle(0x253a35, 0.72);
      g.fillRoundedRect(x + TILE_SIZE * 4.9, y + TILE_SIZE * 2.75, TILE_SIZE * 2.2, TILE_SIZE * 0.24, TILE_SIZE * 0.07);

      const tables = [
        { x: x + TILE_SIZE * 2.35, y: y + TILE_SIZE * 4.55 },
        { x: x + TILE_SIZE * 8.75, y: y + TILE_SIZE * 4.8 }
      ];
      for (const table of tables) {
        g.fillStyle(0x8b5937, 1);
        g.fillRoundedRect(table.x - TILE_SIZE * 0.5, table.y - TILE_SIZE * 0.28, TILE_SIZE, TILE_SIZE * 0.56, TILE_SIZE * 0.12);
        g.fillStyle(0xfff0bd, 0.9);
        g.fillCircle(table.x, table.y - TILE_SIZE * 0.02, TILE_SIZE * 0.12);
      }
      // Working kitchen: pans, stools, and the condiment caddy make this Ibu's warung, not a generic cafe.
      g.fillStyle(0x253a35, 0.95);
      g.fillCircle(x + TILE_SIZE * 8.8, y + TILE_SIZE * 2.15, TILE_SIZE * 0.24);
      g.fillCircle(x + TILE_SIZE * 9.45, y + TILE_SIZE * 2.15, TILE_SIZE * 0.2);
      g.lineStyle(2, 0x101820, 0.9);
      g.lineBetween(x + TILE_SIZE * 9.02, y + TILE_SIZE * 2.15, x + TILE_SIZE * 9.24, y + TILE_SIZE * 1.86);
      for (const stoolX of [4.1, 5.2, 6.3]) {
        g.fillStyle(0x7f4f35, 1);
        g.fillCircle(x + TILE_SIZE * stoolX, y + TILE_SIZE * 3.38, TILE_SIZE * 0.18);
        g.fillRect(x + TILE_SIZE * stoolX - 2, y + TILE_SIZE * 3.55, 4, TILE_SIZE * 0.32);
      }
      for (const [index, color] of [0xd95b43, 0xf2c35d, 0x4f8f66].entries()) {
        g.fillStyle(color, 0.96);
        g.fillRoundedRect(x + TILE_SIZE * (7.8 + index * 0.32), y + TILE_SIZE * 2.86, TILE_SIZE * 0.18, TILE_SIZE * 0.34, 2);
      }
    } else if (interior.id === "baked_berawa_interior") {
      g.fillStyle(0xf3e3c0, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.25, y + TILE_SIZE * 1.62, TILE_SIZE * 9.5, TILE_SIZE * 1.08, TILE_SIZE * 0.1);
      g.fillStyle(0x7a432f, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.55, y + TILE_SIZE * 2.02, TILE_SIZE * 2.45, TILE_SIZE * 0.36, TILE_SIZE * 0.08);
      g.fillRoundedRect(x + TILE_SIZE * 4.45, y + TILE_SIZE * 2.02, TILE_SIZE * 2.45, TILE_SIZE * 0.36, TILE_SIZE * 0.08);
      g.fillRoundedRect(x + TILE_SIZE * 7.35, y + TILE_SIZE * 2.02, TILE_SIZE * 2.45, TILE_SIZE * 0.36, TILE_SIZE * 0.08);
      g.fillStyle(0xd88d4c, 1);
      for (const tray of [
        { x: x + TILE_SIZE * 2.2, y: y + TILE_SIZE * 2.18 },
        { x: x + TILE_SIZE * 5.1, y: y + TILE_SIZE * 2.18 },
        { x: x + TILE_SIZE * 8, y: y + TILE_SIZE * 2.18 }
      ]) {
        g.fillEllipse(tray.x, tray.y, TILE_SIZE * 0.38, TILE_SIZE * 0.16, 16);
      }
      g.fillStyle(0x2d2620, 1);
      g.fillRoundedRect(x + TILE_SIZE * 8.35, y + TILE_SIZE * 3.25, TILE_SIZE * 1.6, TILE_SIZE * 1.35, TILE_SIZE * 0.12);
      g.fillStyle(0xffb45c, 0.74);
      g.fillRoundedRect(x + TILE_SIZE * 8.62, y + TILE_SIZE * 3.55, TILE_SIZE * 1.06, TILE_SIZE * 0.42, TILE_SIZE * 0.08);
      g.fillStyle(0x8b5937, 1);
      g.fillRoundedRect(x + TILE_SIZE * 2.1, y + TILE_SIZE * 4.8, TILE_SIZE * 2.3, TILE_SIZE * 0.72, TILE_SIZE * 0.12);
      g.fillStyle(0xfff0bd, 0.88);
      g.fillCircle(x + TILE_SIZE * 3.25, y + TILE_SIZE * 5.05, TILE_SIZE * 0.16);
      // Bakery-specific back wall: cooling racks and flour sacks frame the existing oven.
      g.lineStyle(2, 0x6f4a2f, 0.88);
      for (const rackY of [3.18, 3.7, 4.22]) {
        g.lineBetween(x + TILE_SIZE * 1.35, y + TILE_SIZE * rackY, x + TILE_SIZE * 3.7, y + TILE_SIZE * rackY);
      }
      g.lineBetween(x + TILE_SIZE * 1.45, y + TILE_SIZE * 3.02, x + TILE_SIZE * 1.45, y + TILE_SIZE * 4.45);
      g.lineBetween(x + TILE_SIZE * 3.58, y + TILE_SIZE * 3.02, x + TILE_SIZE * 3.58, y + TILE_SIZE * 4.45);
      for (const sack of [5.0, 5.75, 6.5]) {
        g.fillStyle(0xe7d3a4, 1);
        g.fillRoundedRect(x + TILE_SIZE * sack, y + TILE_SIZE * 4.58, TILE_SIZE * 0.52, TILE_SIZE * 0.68, TILE_SIZE * 0.12);
        g.lineStyle(1, 0x8b5937, 0.72);
        g.lineBetween(x + TILE_SIZE * (sack + 0.1), y + TILE_SIZE * 4.85, x + TILE_SIZE * (sack + 0.42), y + TILE_SIZE * 4.85);
      }
    } else if (interior.id === "milk_madu_interior") {
      g.fillStyle(0xf4d58d, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.1, y + TILE_SIZE * 1.5, TILE_SIZE * 9.8, TILE_SIZE * 0.72, TILE_SIZE * 0.14);
      g.fillStyle(0x345c54, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.35, y + TILE_SIZE * 1.78, TILE_SIZE * 3.1, TILE_SIZE * 0.22, TILE_SIZE * 0.08);
      g.fillRoundedRect(x + TILE_SIZE * 5.1, y + TILE_SIZE * 1.78, TILE_SIZE * 2.2, TILE_SIZE * 0.22, TILE_SIZE * 0.08);
      const tables = [
        { x: x + TILE_SIZE * 3.4, y: y + TILE_SIZE * 4.85 },
        { x: x + TILE_SIZE * 6, y: y + TILE_SIZE * 4.2 },
        { x: x + TILE_SIZE * 8.65, y: y + TILE_SIZE * 4.9 }
      ];
      for (const table of tables) {
        g.fillStyle(0x8b5937, 1);
        g.fillRoundedRect(table.x - TILE_SIZE * 0.55, table.y - TILE_SIZE * 0.3, TILE_SIZE * 1.1, TILE_SIZE * 0.6, TILE_SIZE * 0.12);
        g.fillStyle(0xfff0bd, 0.9);
        g.fillCircle(table.x - TILE_SIZE * 0.14, table.y - TILE_SIZE * 0.04, TILE_SIZE * 0.12);
        g.fillStyle(0x6ab7ff, 0.82);
        g.fillRoundedRect(table.x + TILE_SIZE * 0.08, table.y - TILE_SIZE * 0.15, TILE_SIZE * 0.34, TILE_SIZE * 0.22, TILE_SIZE * 0.05);
      }
      g.fillStyle(0x4f8f66, 1);
      g.fillCircle(x + TILE_SIZE * 1.55, y + TILE_SIZE * 5.55, TILE_SIZE * 0.32);
      g.fillCircle(x + TILE_SIZE * 1.75, y + TILE_SIZE * 5.28, TILE_SIZE * 0.28);
      g.fillStyle(0x7f4f35, 1);
      g.fillRect(x + TILE_SIZE * 1.58, y + TILE_SIZE * 5.55, TILE_SIZE * 0.22, TILE_SIZE * 0.62);
      // Espresso machine and menu board distinguish a working brunch counter from a generic room.
      g.fillStyle(0x253a35, 1);
      g.fillRoundedRect(x + TILE_SIZE * 7.85, y + TILE_SIZE * 1.1, TILE_SIZE * 1.25, TILE_SIZE * 0.58, TILE_SIZE * 0.1);
      g.fillStyle(0x6ab7ff, 0.78);
      g.fillRoundedRect(x + TILE_SIZE * 8.05, y + TILE_SIZE * 1.24, TILE_SIZE * 0.56, TILE_SIZE * 0.18, TILE_SIZE * 0.04);
      g.fillStyle(0xfff0bd, 0.9);
      g.fillCircle(x + TILE_SIZE * 8.8, y + TILE_SIZE * 1.48, TILE_SIZE * 0.09);
      g.fillStyle(0x345c54, 1);
      g.fillRoundedRect(x + TILE_SIZE * 9.58, y + TILE_SIZE * 3.08, TILE_SIZE * 0.72, TILE_SIZE * 1.34, TILE_SIZE * 0.08);
      for (const menuY of [3.34, 3.64, 3.94]) g.fillRect(x + TILE_SIZE * 9.72, y + TILE_SIZE * menuY, TILE_SIZE * 0.42, 2);
    } else if (interior.id === "cheap_kos_interior") {
      // One tired mattress, one crate, one shelf: this room is the BUILD motivator.
      g.fillStyle(0x292524, 0.62);
      g.fillEllipse(x + TILE_SIZE * 2.55, y + TILE_SIZE * 4.82, TILE_SIZE * 3.1, TILE_SIZE * 0.58);
      g.fillStyle(0x8b8175, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.15, y + TILE_SIZE * 3.08, TILE_SIZE * 2.8, TILE_SIZE * 1.72, TILE_SIZE * 0.08);
      g.fillStyle(0xb4a68f, 0.9);
      g.fillRoundedRect(x + TILE_SIZE * 1.3, y + TILE_SIZE * 3.2, TILE_SIZE * 2.5, TILE_SIZE * 0.48, TILE_SIZE * 0.06);
      g.fillStyle(0x6f665c, 1);
      g.fillRoundedRect(x + TILE_SIZE * 6.45, y + TILE_SIZE * 4.05, TILE_SIZE * 1.1, TILE_SIZE * 0.9, TILE_SIZE * 0.06);
      g.lineStyle(1, 0xa99a83, 0.42);
      g.strokeRoundedRect(x + TILE_SIZE * 6.45, y + TILE_SIZE * 4.05, TILE_SIZE * 1.1, TILE_SIZE * 0.9, TILE_SIZE * 0.06);
      g.fillStyle(0x34302d, 1);
      g.fillRoundedRect(x + TILE_SIZE * 5.75, y + TILE_SIZE * 1.15, TILE_SIZE * 2.55, TILE_SIZE * 0.28, TILE_SIZE * 0.04);
      g.fillStyle(0x7b7063, 0.72);
      g.fillRoundedRect(x + TILE_SIZE * 6.05, y + TILE_SIZE * 0.95, TILE_SIZE * 0.42, TILE_SIZE * 0.18, TILE_SIZE * 0.03);
      g.fillRoundedRect(x + TILE_SIZE * 6.72, y + TILE_SIZE * 0.92, TILE_SIZE * 0.3, TILE_SIZE * 0.21, TILE_SIZE * 0.03);

      // Damp stains and bare patches stay outside the bulb's strongest radius.
      g.fillStyle(0x2f4542, 0.34);
      g.fillEllipse(x + TILE_SIZE * 1.1, y + TILE_SIZE * 1.9, TILE_SIZE * 0.72, TILE_SIZE * 0.48);
      g.fillEllipse(x + TILE_SIZE * 8.8, y + TILE_SIZE * 5.1, TILE_SIZE * 0.82, TILE_SIZE * 0.38);

      const bulbX = x + TILE_SIZE * 7.9;
      const bulbY = y + TILE_SIZE * 1.35;
      g.fillStyle(0xf4bd62, 0.07);
      g.fillCircle(bulbX, bulbY + TILE_SIZE * 0.9, TILE_SIZE * 2.75);
      g.fillStyle(0xffca68, 0.12);
      g.fillCircle(bulbX, bulbY + TILE_SIZE * 0.48, TILE_SIZE * 1.7);
      g.lineStyle(2, 0x2a2522, 0.88);
      g.lineBetween(bulbX, y + wall, bulbX, bulbY - TILE_SIZE * 0.17);
      g.fillStyle(0xffd978, 0.98);
      g.fillCircle(bulbX, bulbY, TILE_SIZE * 0.17);
      g.fillStyle(0xfff0bd, 0.86);
      g.fillCircle(bulbX, bulbY - TILE_SIZE * 0.03, TILE_SIZE * 0.07);
    } else if (interior.id === "shared_room_interior") {
      // BUILD rung two: still modest, but two real mattresses, airflow, and daylight replace the bleak kos.
      for (const bedX of [1.05, 6.05]) {
        g.fillStyle(0x36504f, 0.38);
        g.fillEllipse(x + TILE_SIZE * (bedX + 1.4), y + TILE_SIZE * 5.0, TILE_SIZE * 3.1, TILE_SIZE * 0.55);
        g.fillStyle(0xd8c7a2, 1);
        g.fillRoundedRect(x + TILE_SIZE * bedX, y + TILE_SIZE * 3.35, TILE_SIZE * 2.85, TILE_SIZE * 1.55, TILE_SIZE * 0.1);
        g.fillStyle(bedX < 2 ? 0x91b7dd : 0xe5a58f, 0.94);
        g.fillRoundedRect(x + TILE_SIZE * (bedX + 0.14), y + TILE_SIZE * 3.48, TILE_SIZE * 2.55, TILE_SIZE * 0.48, TILE_SIZE * 0.08);
      }

      // One bright window throws a soft rectangle of morning light across the floor.
      g.fillStyle(0x8dd7ef, 0.9);
      g.fillRoundedRect(x + TILE_SIZE * 3.92, y + TILE_SIZE * 1.58, TILE_SIZE * 2.15, TILE_SIZE * 1.2, TILE_SIZE * 0.08);
      g.lineStyle(2, 0xfff0bd, 0.8);
      g.strokeRoundedRect(x + TILE_SIZE * 3.92, y + TILE_SIZE * 1.58, TILE_SIZE * 2.15, TILE_SIZE * 1.2, TILE_SIZE * 0.08);
      g.lineBetween(x + TILE_SIZE * 5, y + TILE_SIZE * 1.64, x + TILE_SIZE * 5, y + TILE_SIZE * 2.72);
      g.fillStyle(0xffefbd, 0.12);
      g.fillRoundedRect(x + TILE_SIZE * 3.35, y + TILE_SIZE * 2.8, TILE_SIZE * 3.3, TILE_SIZE * 2.55, TILE_SIZE * 0.2);

      // A ceiling fan makes the improvement practical rather than luxurious.
      const fanX = x + TILE_SIZE * 5;
      const fanY = y + TILE_SIZE * 3.05;
      g.fillStyle(0x253a35, 1);
      g.fillCircle(fanX, fanY, TILE_SIZE * 0.14);
      g.lineStyle(5, 0x52706d, 0.95);
      g.lineBetween(fanX - TILE_SIZE * 0.85, fanY, fanX - TILE_SIZE * 0.12, fanY);
      g.lineBetween(fanX + TILE_SIZE * 0.12, fanY, fanX + TILE_SIZE * 0.85, fanY);
      g.lineBetween(fanX, fanY - TILE_SIZE * 0.12, fanX, fanY - TILE_SIZE * 0.72);
    } else if (interior.id === "scooter_rental_interior") {
      g.fillStyle(0x253a47, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.1, y + TILE_SIZE * 1.55, TILE_SIZE * 9.8, TILE_SIZE * 1.05, TILE_SIZE * 0.1);
      g.fillStyle(0xf4d58d, 0.88);
      g.fillRoundedRect(x + TILE_SIZE * 1.45, y + TILE_SIZE * 1.82, TILE_SIZE * 2.1, TILE_SIZE * 0.32, TILE_SIZE * 0.08);
      g.fillRoundedRect(x + TILE_SIZE * 4.1, y + TILE_SIZE * 1.82, TILE_SIZE * 2.1, TILE_SIZE * 0.32, TILE_SIZE * 0.08);
      g.fillRoundedRect(x + TILE_SIZE * 6.75, y + TILE_SIZE * 1.82, TILE_SIZE * 2.1, TILE_SIZE * 0.32, TILE_SIZE * 0.08);
      g.fillStyle(0x101820, 0.9);
      g.fillRoundedRect(x + TILE_SIZE * 8.65, y + TILE_SIZE * 3.25, TILE_SIZE * 1.55, TILE_SIZE * 1.2, TILE_SIZE * 0.1);
      g.fillStyle(0x6ab7ff, 0.76);
      g.fillRoundedRect(x + TILE_SIZE * 8.9, y + TILE_SIZE * 3.52, TILE_SIZE * 1.05, TILE_SIZE * 0.2, TILE_SIZE * 0.04);
      g.fillRoundedRect(x + TILE_SIZE * 8.9, y + TILE_SIZE * 3.92, TILE_SIZE * 0.72, TILE_SIZE * 0.2, TILE_SIZE * 0.04);
      for (const scooter of [
        { x: x + TILE_SIZE * 2.7, y: y + TILE_SIZE * 4.95, color: 0x4f8f66 },
        { x: x + TILE_SIZE * 5.2, y: y + TILE_SIZE * 5.2, color: 0xd95c8a }
      ]) {
        g.fillStyle(scooter.color, 1);
        g.fillRoundedRect(scooter.x - TILE_SIZE * 0.55, scooter.y - TILE_SIZE * 0.18, TILE_SIZE * 1.1, TILE_SIZE * 0.36, TILE_SIZE * 0.12);
        g.fillStyle(0x101820, 1);
        g.fillCircle(scooter.x - TILE_SIZE * 0.42, scooter.y + TILE_SIZE * 0.17, TILE_SIZE * 0.17);
        g.fillCircle(scooter.x + TILE_SIZE * 0.42, scooter.y + TILE_SIZE * 0.17, TILE_SIZE * 0.17);
        g.lineStyle(2, 0xfff0bd, 0.6);
        g.lineBetween(scooter.x + TILE_SIZE * 0.22, scooter.y - TILE_SIZE * 0.18, scooter.x + TILE_SIZE * 0.48, scooter.y - TILE_SIZE * 0.48);
      }
      g.fillStyle(0xfff0bd, 0.86);
      g.fillCircle(x + TILE_SIZE * 2.1, y + TILE_SIZE * 2.95, TILE_SIZE * 0.18);
      g.fillCircle(x + TILE_SIZE * 2.65, y + TILE_SIZE * 2.95, TILE_SIZE * 0.18);
      g.fillCircle(x + TILE_SIZE * 3.2, y + TILE_SIZE * 2.95, TILE_SIZE * 0.18);
      // Parts wall and tool bench stay clear of the scooter-counter interaction radius.
      g.fillStyle(0x5b3c2c, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.2, y + TILE_SIZE * 3.15, TILE_SIZE * 2.65, TILE_SIZE * 0.18, TILE_SIZE * 0.04);
      for (const toolX of [1.5, 2.05, 2.62, 3.18]) {
        g.lineStyle(2, 0xfff0bd, 0.82);
        g.lineBetween(x + TILE_SIZE * toolX, y + TILE_SIZE * 3.3, x + TILE_SIZE * (toolX + 0.1), y + TILE_SIZE * 3.78);
      }
      g.fillStyle(0x7f4f35, 1);
      g.fillRoundedRect(x + TILE_SIZE * 6.55, y + TILE_SIZE * 4.62, TILE_SIZE * 1.35, TILE_SIZE * 0.45, TILE_SIZE * 0.08);
      g.fillStyle(0x253a35, 1);
      g.fillRoundedRect(x + TILE_SIZE * 6.85, y + TILE_SIZE * 4.42, TILE_SIZE * 0.72, TILE_SIZE * 0.22, TILE_SIZE * 0.05);
    } else if (interior.id === "satu_satu_interior") {
      g.fillStyle(0x6f4a2f, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.1, y + TILE_SIZE * 1.42, TILE_SIZE * 9.8, TILE_SIZE * 0.82, TILE_SIZE * 0.12);
      g.fillStyle(0xf4d58d, 0.88);
      g.fillRoundedRect(x + TILE_SIZE * 1.45, y + TILE_SIZE * 1.72, TILE_SIZE * 2.2, TILE_SIZE * 0.24, TILE_SIZE * 0.06);
      g.fillRoundedRect(x + TILE_SIZE * 4.1, y + TILE_SIZE * 1.72, TILE_SIZE * 1.6, TILE_SIZE * 0.24, TILE_SIZE * 0.06);
      g.fillStyle(0x253a35, 1);
      g.fillRoundedRect(x + TILE_SIZE * 8.55, y + TILE_SIZE * 2.75, TILE_SIZE * 1.55, TILE_SIZE * 2.05, TILE_SIZE * 0.12);
      g.fillStyle(0xfff0bd, 0.76);
      g.fillRoundedRect(x + TILE_SIZE * 8.82, y + TILE_SIZE * 3.08, TILE_SIZE * 1.02, TILE_SIZE * 0.18, TILE_SIZE * 0.04);
      g.fillRoundedRect(x + TILE_SIZE * 8.82, y + TILE_SIZE * 3.58, TILE_SIZE * 0.78, TILE_SIZE * 0.18, TILE_SIZE * 0.04);
      g.fillRoundedRect(x + TILE_SIZE * 8.82, y + TILE_SIZE * 4.08, TILE_SIZE * 0.96, TILE_SIZE * 0.18, TILE_SIZE * 0.04);
      g.fillStyle(0x8b5937, 1);
      g.fillRoundedRect(x + TILE_SIZE * 2.35, y + TILE_SIZE * 4.02, TILE_SIZE * 4.9, TILE_SIZE * 0.82, TILE_SIZE * 0.14);
      g.fillStyle(0x6ab7ff, 0.86);
      for (const laptop of [
        { x: x + TILE_SIZE * 3.15, y: y + TILE_SIZE * 4.0 },
        { x: x + TILE_SIZE * 4.65, y: y + TILE_SIZE * 4.0 },
        { x: x + TILE_SIZE * 6.15, y: y + TILE_SIZE * 4.0 }
      ]) {
        g.fillRoundedRect(laptop.x, laptop.y, TILE_SIZE * 0.42, TILE_SIZE * 0.28, TILE_SIZE * 0.05);
      }
      g.fillStyle(0xfff0bd, 0.88);
      g.fillCircle(x + TILE_SIZE * 2.75, y + TILE_SIZE * 4.42, TILE_SIZE * 0.11);
      g.fillCircle(x + TILE_SIZE * 5.35, y + TILE_SIZE * 4.42, TILE_SIZE * 0.11);
      g.fillStyle(0x4f8f66, 1);
      g.fillCircle(x + TILE_SIZE * 1.5, y + TILE_SIZE * 5.25, TILE_SIZE * 0.28);
      g.fillCircle(x + TILE_SIZE * 1.74, y + TILE_SIZE * 5.02, TILE_SIZE * 0.24);
      g.fillStyle(0x7f4f35, 1);
      g.fillRect(x + TILE_SIZE * 1.54, y + TILE_SIZE * 5.25, TILE_SIZE * 0.2, TILE_SIZE * 0.58);
      // Roaster and bean sacks make the room's coffee purpose visible before its label is read.
      g.fillStyle(0x253a35, 1);
      g.fillCircle(x + TILE_SIZE * 7.5, y + TILE_SIZE * 3.62, TILE_SIZE * 0.46);
      g.fillStyle(0x6ab7ff, 0.8);
      g.fillCircle(x + TILE_SIZE * 7.5, y + TILE_SIZE * 3.62, TILE_SIZE * 0.22);
      g.lineStyle(2, 0x101820, 0.76);
      g.lineBetween(x + TILE_SIZE * 7.92, y + TILE_SIZE * 3.62, x + TILE_SIZE * 8.2, y + TILE_SIZE * 3.62);
      for (const beanX of [6.7, 7.3, 7.9]) {
        g.fillStyle(0xc79a55, 1);
        g.fillRoundedRect(x + TILE_SIZE * beanX, y + TILE_SIZE * 5.12, TILE_SIZE * 0.46, TILE_SIZE * 0.58, TILE_SIZE * 0.1);
        g.lineStyle(1, 0x6f4a2f, 0.75);
        g.lineBetween(x + TILE_SIZE * (beanX + 0.12), y + TILE_SIZE * 5.37, x + TILE_SIZE * (beanX + 0.35), y + TILE_SIZE * 5.37);
      }
    } else if (interior.id === "bungalow_living_interior") {
      g.fillStyle(0x8b5937, 1);
      g.fillRoundedRect(x + TILE_SIZE * 1.05, y + TILE_SIZE * 1.48, TILE_SIZE * 9.9, TILE_SIZE * 1.02, TILE_SIZE * 0.12);
      g.fillStyle(0xfff0bd, 0.82);
      g.fillRoundedRect(x + TILE_SIZE * 1.4, y + TILE_SIZE * 1.78, TILE_SIZE * 1.5, TILE_SIZE * 0.28, TILE_SIZE * 0.07);
      g.fillRoundedRect(x + TILE_SIZE * 3.3, y + TILE_SIZE * 1.78, TILE_SIZE * 1.5, TILE_SIZE * 0.28, TILE_SIZE * 0.07);
      g.fillRoundedRect(x + TILE_SIZE * 5.2, y + TILE_SIZE * 1.78, TILE_SIZE * 1.5, TILE_SIZE * 0.28, TILE_SIZE * 0.07);
      g.fillStyle(0xe58fb1, 0.92);
      g.fillRoundedRect(x + TILE_SIZE * 1.65, y + TILE_SIZE * 3.3, TILE_SIZE * 1.25, TILE_SIZE * 1.6, TILE_SIZE * 0.1);
      g.fillStyle(0x6ab7ff, 0.78);
      g.fillRoundedRect(x + TILE_SIZE * 3.15, y + TILE_SIZE * 3.15, TILE_SIZE * 1.1, TILE_SIZE * 1.95, TILE_SIZE * 0.1);
      g.fillStyle(0x62c48f, 0.84);
      g.fillRoundedRect(x + TILE_SIZE * 4.55, y + TILE_SIZE * 3.42, TILE_SIZE * 1.18, TILE_SIZE * 1.45, TILE_SIZE * 0.1);
      g.fillStyle(0x253a35, 1);
      g.fillRoundedRect(x + TILE_SIZE * 8.35, y + TILE_SIZE * 3.0, TILE_SIZE * 1.85, TILE_SIZE * 1.55, TILE_SIZE * 0.12);
      g.fillStyle(0xf4d58d, 0.76);
      g.fillRoundedRect(x + TILE_SIZE * 8.65, y + TILE_SIZE * 3.32, TILE_SIZE * 1.24, TILE_SIZE * 0.18, TILE_SIZE * 0.04);
      g.fillRoundedRect(x + TILE_SIZE * 8.65, y + TILE_SIZE * 3.82, TILE_SIZE * 0.9, TILE_SIZE * 0.18, TILE_SIZE * 0.04);
      for (const cushion of [
        { x: x + TILE_SIZE * 6.55, y: y + TILE_SIZE * 4.85, color: 0xf4b860 },
        { x: x + TILE_SIZE * 7.25, y: y + TILE_SIZE * 4.65, color: 0x91b7dd },
        { x: x + TILE_SIZE * 7.95, y: y + TILE_SIZE * 4.9, color: 0xe58fb1 }
      ]) {
        g.fillStyle(cushion.color, 0.92);
        g.fillRoundedRect(cushion.x - TILE_SIZE * 0.28, cushion.y - TILE_SIZE * 0.18, TILE_SIZE * 0.56, TILE_SIZE * 0.36, TILE_SIZE * 0.08);
      }
      // Made's hidden room is now a readable doorway, while the counter and exit mat remain exactly where they were.
      g.fillStyle(0x4c3027, 1);
      g.fillRoundedRect(x + TILE_SIZE * 9.1, y + TILE_SIZE * 4.9, TILE_SIZE * 1.18, TILE_SIZE * 1.52, TILE_SIZE * 0.08);
      g.fillStyle(0xf4d58d, 0.88);
      g.fillRoundedRect(x + TILE_SIZE * 9.28, y + TILE_SIZE * 5.1, TILE_SIZE * 0.82, TILE_SIZE * 1.13, TILE_SIZE * 0.04);
      g.fillStyle(0x253a35, 0.9);
      g.fillCircle(x + TILE_SIZE * 9.92, y + TILE_SIZE * 5.7, TILE_SIZE * 0.06);
      g.fillStyle(0x6f4a2f, 1);
      for (const rackX of [2.0, 3.45, 4.9]) {
        g.fillRoundedRect(x + TILE_SIZE * rackX, y + TILE_SIZE * 5.55, TILE_SIZE * 0.92, TILE_SIZE * 0.12, TILE_SIZE * 0.03);
        g.lineStyle(1, 0x6f4a2f, 0.85);
        g.lineBetween(x + TILE_SIZE * (rackX + 0.15), y + TILE_SIZE * 5.67, x + TILE_SIZE * (rackX + 0.15), y + TILE_SIZE * 6.12);
        g.lineBetween(x + TILE_SIZE * (rackX + 0.77), y + TILE_SIZE * 5.67, x + TILE_SIZE * (rackX + 0.77), y + TILE_SIZE * 6.12);
      }
    }

    this.drawInteriorStationMarkers(g, interior);
  }

  private drawInteriorStationMarkers(g: Phaser.GameObjects.Graphics, interior: InteriorDefinition): void {
    for (const station of interior.stations) {
      g.fillStyle(0x000000, 0.12);
      g.fillEllipse(station.x, station.y + TILE_SIZE * 0.14, TILE_SIZE * 0.72, TILE_SIZE * 0.28, 20);
      g.fillStyle(0xfff0bd, 0.2);
      g.fillCircle(station.x, station.y, TILE_SIZE * 0.34);
      g.lineStyle(2, 0xf4d58d, 0.68);
      g.strokeCircle(station.x, station.y, TILE_SIZE * 0.34);
      g.fillStyle(0x101820, 0.72);
      g.fillCircle(station.x, station.y, TILE_SIZE * 0.14);
      g.fillStyle(0xfff0bd, 0.92);
      g.fillCircle(station.x, station.y, TILE_SIZE * 0.055);
    }
  }

  private createInteriorDiners(interior: InteriorDefinition): void {
    if (this.interiorDinerSprites.has(interior.id)) {
      return;
    }
    const { x, y } = interior.origin;
    const diners =
      interior.id === "warung_sari_interior"
        ? [
            { key: "npc-ari", x: x + TILE_SIZE * 1.9, y: y + TILE_SIZE * 5.1, tint: 0xe58fb1 },
            { key: "npc-made", x: x + TILE_SIZE * 9.15, y: y + TILE_SIZE * 5.35, tint: 0x62c48f }
          ]
        : interior.id === "baked_berawa_interior"
          ? [{ key: "npc-made", x: x + TILE_SIZE * 2.75, y: y + TILE_SIZE * 5.25, tint: 0xf4b860 }]
          : interior.id === "milk_madu_interior"
            ? [
                { key: "npc-sari", x: x + TILE_SIZE * 2.85, y: y + TILE_SIZE * 5.4, tint: 0x91b7dd },
                { key: "npc-made", x: x + TILE_SIZE * 9.25, y: y + TILE_SIZE * 5.45, tint: 0xe58fb1 }
              ]
            : [];
    if (diners.length === 0) {
      return;
    }
    const sprites = diners.map((diner) => {
      const sprite = this.add.sprite(diner.x, diner.y, diner.key).setDepth(diner.y).setTint(diner.tint).setAlpha(0.82);
      this.applyCharacterAnimation(sprite, diner.key, "down", false, CHARACTER_SPRITE_SCALE * 0.82);
      return sprite;
    });
    this.interiorDinerSprites.set(interior.id, sprites);
  }

  private getActiveInterior(): InteriorDefinition | undefined {
    return this.activeInteriorId ? interiorDefinitions[this.activeInteriorId] : undefined;
  }

  private getActiveInteriorNpcSlot(npcId: string): InteriorNpcSlotDefinition | undefined {
    const interior = this.getActiveInterior();
    if (!interior) {
      return undefined;
    }
    return getOccupiedInteriorNpcSlots(this.world, interior).find((slot) => slot.npcId === npcId);
  }

  private getClosedInteriorNpcSlot(npcId: string): { interior: InteriorDefinition; slot: InteriorNpcSlotDefinition } | undefined {
    const scheduled = getScheduledInteriorForNpc(this.world, npcId);
    if (!scheduled || scheduled.interior.id === this.activeInteriorId) {
      return undefined;
    }
    return scheduled;
  }

  private isNpcInsideClosedInterior(npcId: string): boolean {
    return Boolean(this.getClosedInteriorNpcSlot(npcId));
  }

  private resetNpcSpritesToRoutineState(): void {
    for (const npc of Object.values(npcDefinitions)) {
      const sprite = this.npcSprites.get(npc.id);
      const state = this.world.npcs[npc.id];
      if (!sprite || !state) {
        continue;
      }
      sprite.setPosition(state.x, state.y);
      sprite.body?.updateFromGameObject();
      sprite.setDepth(sprite.y);
    }
  }

  private getExteriorDoorReturnPoint(interior: InteriorDefinition): { x: number; y: number } {
    const home = getPlayerHomeBase(this.world);
    const node = venueMapNodes.find((candidate) => candidate.venueId === interior.venueId);
    if (!node && interior.venueId === home.id) {
      return { x: home.x, y: home.y };
    }
    return node ? { x: node.x, y: node.y + Math.min(node.radius, scaleDistance(52)) } : { x: this.playerState.x, y: this.playerState.y };
  }

  private applyInteriorCameraBounds(interior: InteriorDefinition): void {
    const zoom = calculateInteriorCameraZoom(this.scale.width, this.scale.height, interior);
    const bounds = calculateInteriorCameraBounds(this.scale.width, this.scale.height, zoom, interior);
    this.cameras.main.setZoom(zoom);
    this.physics.world.setBounds(interior.origin.x, interior.origin.y, interior.width, interior.height);
    this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    this.cameras.main.centerOn(interior.origin.x + interior.width / 2, interior.origin.y + interior.height / 2);
  }

  private applyWorldCameraBounds(): void {
    this.physics.world.setBounds(
      authoredPlayableBounds.x,
      authoredPlayableBounds.y,
      authoredPlayableBounds.width,
      authoredPlayableBounds.height
    );
    this.cameras.main.setBounds(
      authoredPlayableBounds.x,
      authoredPlayableBounds.y,
      authoredPlayableBounds.width,
      authoredPlayableBounds.height
    );
  }

  private placePlayerSprite(point: { x: number; y: number }, updatePersistentState: boolean): void {
    this.player.setVelocity(0, 0);
    this.player.setPosition(point.x, point.y);
    this.player.body?.updateFromGameObject();
    if (updatePersistentState) {
      this.playerState.x = Math.round(point.x);
      this.playerState.y = Math.round(point.y);
    }
    this.updatePlayerBikeVisual();
  }

  private openHomeActivityMenu(): void {
    const home = getPlayerHomeBase(this.world);
    const context = getVenueActivityContext(home.id);
    if (!context) {
      this.showToast("Home base is not available yet.");
      return;
    }
    this.closePanel(false);
    this.mode = "activity";
    const availability = getActivityAvailability(this.world, context);
    this.createActivityMenuOverlay(home.id, context, availability, undefined);
  }

  private shouldOpenIbuHustleBoard(npcId: string): boolean {
    return canOpenIbuHustleBoard(this.world, npcId);
  }

  private openIbuHustleBoard(): void {
    this.closePanel(false);
    this.mode = "activity";
    this.destroyActivityMenuOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const overlay = document.createElement("section");
    overlay.id = "bali-life-activity-menu";
    overlay.className = "bali-life-activity-menu";
    overlay.dataset.activityPanel = "true";
    overlay.dataset.uiSurface = "activity-panel";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Ibu Sari NusaDrop board");
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const header = document.createElement("div");
    header.className = "bali-life-activity-menu-header";
    const title = document.createElement("h2");
    title.className = "bali-life-activity-menu-title";
    title.textContent = "Ibu Sari's NusaDrop Board";
    const meta = document.createElement("div");
    meta.className = "bali-life-activity-menu-meta";
    meta.textContent =
      `${this.world.life.hustle.completedDeliveryCount} runs | Rp ${this.world.life.hustle.deliveryEarnings} earned | ` +
      `${this.world.life.hustle.driverRating.toFixed(1)} stars | Scooter ${this.playerState.bikeCondition}%`;
    header.append(title, meta);

    const content = document.createElement("div");
    content.className = "bali-life-activity-menu-content";
    this.appendIbuHustleBoardRows(content);

    const footer = document.createElement("div");
    footer.className = "bali-life-activity-menu-footer";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "bali-life-activity-menu-button is-close";
    close.textContent = "Close";
    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.closePanel();
    });
    footer.appendChild(close);

    overlay.append(header, content, footer);
    document.body.appendChild(overlay);
    this.activityMenuOverlay = overlay;
  }

  private openMorningHand(): void {
    if (!shouldShowMorningHand(this.world)) {
      return;
    }
    this.closePanel(false);
    this.mode = "activity";
    this.destroyActivityMenuOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const overlay = document.createElement("section");
    overlay.id = "bali-life-activity-menu";
    overlay.className = "bali-life-activity-menu";
    overlay.dataset.activityPanel = "true";
    overlay.dataset.uiSurface = "activity-panel";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Morning hand");
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const header = document.createElement("div");
    header.className = "bali-life-activity-menu-header";
    const title = document.createElement("h2");
    title.className = "bali-life-activity-menu-title";
    title.textContent = "Today's Hand";
    const meta = document.createElement("div");
    meta.className = "bali-life-activity-menu-meta";
    meta.textContent =
      `${formatClock(this.world)} | ${this.world.life.hustle.completedDeliveryCount} runs | ` +
      `${this.world.life.hustle.driverRating.toFixed(1)} stars | Rent Day ${this.world.life.hustle.rentDueDay}`;
    header.append(title, meta);

    const content = document.createElement("div");
    content.className = "bali-life-activity-menu-content";
    this.appendActivityMenuSection(content, "Choose the shape of the morning");
    for (const card of getMorningHandCards(this.world, this.getAbsoluteMinute())) {
      this.appendMorningHandCard(content, card);
    }

    const footer = document.createElement("div");
    footer.className = "bali-life-activity-menu-footer";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "bali-life-activity-menu-button is-close";
    close.textContent = "Start Day";
    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.closePanel();
    });
    footer.appendChild(close);

    overlay.append(header, content, footer);
    document.body.appendChild(overlay);
    this.activityMenuOverlay = overlay;
  }

  private openDayLedger(summary: DayLedgerSummary): void {
    this.closePanel(false);
    this.mode = "activity";
    this.destroyActivityMenuOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const overlay = document.createElement("section");
    overlay.id = "bali-life-activity-menu";
    overlay.className = "bali-life-activity-menu";
    overlay.dataset.activityPanel = "true";
    overlay.dataset.uiSurface = "activity-panel";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Day ledger");
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const header = document.createElement("div");
    header.className = "bali-life-activity-menu-header";
    const title = document.createElement("h2");
    title.className = "bali-life-activity-menu-title";
    title.textContent = `Day ${summary.closedDay} Ledger`;
    const meta = document.createElement("div");
    meta.className = "bali-life-activity-menu-meta";
    meta.textContent =
      `${summary.runsCompleted} run${summary.runsCompleted === 1 ? "" : "s"} | ` +
      `${this.world.life.hustle.driverRating.toFixed(1)} stars | Rent Day ${this.world.life.hustle.rentDueDay}`;
    header.append(title, meta);

    const content = document.createElement("div");
    content.className = "bali-life-activity-menu-content";
    this.appendActivityMenuSection(content, "How the day closed");
    for (const row of summary.rows) {
      this.appendDayLedgerRow(content, row);
    }

    const footer = document.createElement("div");
    footer.className = "bali-life-activity-menu-footer";
    const next = document.createElement("button");
    next.type = "button";
    next.className = "bali-life-activity-menu-button is-close";
    next.textContent = "See Today's Hand";
    next.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.closePanel(false);
      this.openMorningHand();
      if (!this.activityMenuOverlay) {
        this.mode = this.activeInteriorId ? "interior" : "world";
      }
    });
    footer.appendChild(next);

    overlay.append(header, content, footer);
    document.body.appendChild(overlay);
    this.activityMenuOverlay = overlay;
  }

  private appendDayLedgerRow(parent: HTMLElement, row: DayLedgerRow): void {
    const article = document.createElement("article");
    article.className = "bali-life-activity-menu-row";
    const copy = document.createElement("div");
    copy.className = "bali-life-activity-menu-copy";
    const title = document.createElement("h3");
    title.className = "bali-life-activity-menu-row-title";
    title.textContent = row.title;
    const body = document.createElement("p");
    body.className = "bali-life-activity-menu-row-body";
    body.textContent = row.body;
    copy.append(title, body);
    article.appendChild(copy);
    parent.appendChild(article);
  }

  private appendMorningHandCard(parent: HTMLElement, card: MorningHandCard): void {
    this.appendActivityMenuRow(parent, {
      title: card.title,
      body: card.body,
      actionLabel: card.actionLabel,
      variant: card.available ? "primary" : "blocked",
      onAction: () => this.resolveMorningHandCard(card)
    });
  }

  private resolveMorningHandCard(card: MorningHandCard): void {
    if (card.action === "accept_delivery" && card.deliveryId) {
      const result = acceptDelivery(this.world, card.deliveryId, this.getAbsoluteMinute());
      this.showToast(result.ok ? `${result.message} Follow the delivery marker.` : result.message);
      saveWorldState(this.world);
      this.closePanel();
      return;
    }
    if (card.action === "pay_rent") {
      this.payHomeRent();
      return;
    }
    if (card.action === "track_opportunity" && card.opportunityId) {
      this.world.opportunities.trackedOpportunityId = card.opportunityId;
      this.showToast("Tracked on the field. Ride to the rental counter if you want to face it.");
      saveWorldState(this.world);
      this.closePanel();
      return;
    }
    this.showToast(card.venueId ? `Head to ${card.venueId.replace(/_/g, " ")} when ready.` : "Day started.");
    this.closePanel();
  }

  private createActivityMenuOverlay(
    venueId: string,
    context: VenueActivityContext,
    availability: ActivityAvailability[],
    shop: ShopDefinition | undefined
  ): void {
    recordAct0CriticalPathMenuOpen(this.world);
    this.destroyActivityMenuOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const overlay = document.createElement("section");
    overlay.id = "bali-life-activity-menu";
    overlay.className = "bali-life-activity-menu";
    overlay.dataset.activityPanel = "true";
    overlay.dataset.uiSurface = "activity-panel";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", `${context.name} activities`);
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const header = document.createElement("div");
    header.className = "bali-life-activity-menu-header";

    const title = document.createElement("h2");
    title.className = "bali-life-activity-menu-title";
    title.textContent = context.name;

    const meta = document.createElement("div");
    meta.className = "bali-life-activity-menu-meta";
    const purpose = getVenuePurposeLine(context.venueId);
    const rhythm = getStationRhythmState(this.world, context);
    const rhythmCopy = rhythm && areAdvancedMetersVisible(this.world)
      ? `${rhythm.stationTitle} | Best: ${rhythm.bestTimeOfDay}${rhythm.activeModifierLabels.length ? ` | Active: ${rhythm.activeModifierLabels.join(", ")}` : ""}`
      : `${context.category.replace(/_/g, " ")} activities`;
    meta.textContent =
      `${purpose ?? rhythmCopy}\n${formatClock(this.world)} | ` +
      `${formatVisibleMeterValues(this.world)}  Rp ${this.playerState.money}`;

    header.append(title, meta);

    const content = document.createElement("div");
    content.className = "bali-life-activity-menu-content";

    if (shop) {
      this.appendActivityMenuRow(content, {
        title: "Shop counter",
        body: "Existing shop flow, unchanged.",
        actionLabel: "Open buy/sell",
        onAction: () => this.openShop(venueId)
      });
    }

    if (context.venueId === getPlayerHomeBase(this.world).id) {
      this.appendHomeStationActions(content);
    }

    if (context.venueId === "bali_family_rental_scooter") {
      this.appendScooterCounterActions(content);
      if (isAct1LeoEncounterPending(this.world)) {
        this.appendActivityMenuSection(content, "Pickup rail");
        this.appendActivityMenuRow(content, {
          title: "Leo is waiting by the NusaDrop pickup rail",
          body: "He saw the rate-cut notice too. He is looking at your scooter like it submitted an application.",
          actionLabel: "Face Leo",
          onAction: () => {
            const scene = getRelationshipChoiceScene("rio_act1_rate_cut_encounter");
            if (scene) this.openRelationshipChoiceScene(scene);
          }
        });
      }
      const raceEligibility = getRioRaceEligibility(this.world);
      if (!isAct1LeoEncounterPending(this.world) && raceEligibility.eligible) {
        this.appendActivityMenuSection(content, "Leo's streak");
        this.appendActivityMenuRow(content, {
          title: RIO_RACE.title,
          body: "Leo is posted by the timing board with his helmet already on. Bail = he wins. He will mention it.",
          actionLabel: "Hear him out",
          onAction: () => this.openRioRaceChallenge()
        });
      }
    }

    const activeEvents = getActiveEventsAtVenue(this.world.clock, venueId, this.world);
    if (activeEvents.length > 0) {
      this.appendActivityMenuSection(content, "Happening now");
      for (const event of activeEvents.slice(0, 2)) {
        const cost = event.participation.cost ?? 0;
        const canAfford = cost <= 0 || this.playerState.money >= cost;
        const crewState = event.crewSession ? getCrewState(this.world, event.crewSession.crewId) : undefined;
        const canJoinCrew = Boolean(crewState?.invited && !crewState.member);
        const canAttendCrew = !crewState || crewState.member || canJoinCrew;
        const moneyCopy = cost < 0 ? `Earn Rp ${Math.abs(cost)}` : cost > 0 ? `Cost Rp ${cost}` : "Free";
        const meterCopy = formatMeterDeltaSummary(this.world, getStructuralEventMeterState(this.world, event).meterDeltas);
        const crewStatusCopy = crewState
          ? `\nAttendance ${crewState.attendanceCount}/${CREW_REGULAR_ATTENDANCE_COUNT}${crewState.regular ? " · REGULAR" : ""}`
          : "";
        this.appendActivityMenuRow(content, {
          title: event.title,
          body: `${event.description}\n${event.participation.timeCost} min | ${moneyCopy}${meterCopy ? ` | ${meterCopy}` : ""}${crewStatusCopy}`,
          actionLabel: canJoinCrew
            ? isKitchenCircleSessionEvent(event) ? "Join & serve" : "Join & talk"
            : !canAttendCrew
              ? "Join crew first"
              : canAfford
                ? isKitchenCircleSessionEvent(event) ? "Serve & attend" : "Talk & attend"
                : "Need Rp",
          variant: canAfford && canAttendCrew ? "primary" : "blocked",
          onAction: () => {
            if (canJoinCrew && event.crewSession) {
              const joined = joinCrew(this.world, event.crewSession.crewId);
              if (!joined.ok) {
                this.showToast(joined.message);
                return;
              }
              saveWorldState(this.world);
              this.phone?.refresh();
              this.attendVenueEvent(event);
            } else if (!canAttendCrew) {
              this.showToast("This invitation is a promise. Join the crew before counting attendance.");
            } else if (canAfford) {
              this.attendVenueEvent(event);
            } else {
              this.showToast(`Need Rp ${cost} for ${event.title}.`);
            }
          }
        });
      }
    }

    const liveVenueOpportunities = this.world.opportunities.live.filter((opportunity) => opportunity.locationVenueId === venueId);
    if (liveVenueOpportunities.length > 0) {
      this.appendActivityMenuSection(content, "Phone pings here");
      for (const opportunity of liveVenueOpportunities.slice(0, 2)) {
        const template = getOpportunityTemplate(opportunity.templateId);
        const countdown = getLiveOpportunityCountdown(opportunity, this.world.clock);
        const canResolve = opportunity.status === "accepted";
        const facedScene =
          !canResolve && template?.id === "no_questions_package"
            ? getRelationshipChoiceScene("rio_no_questions_package")
            : undefined;
        this.appendActivityMenuRow(content, {
          title: template?.title ?? opportunity.templateId,
          body: `${template?.blurb ?? "Resolve this before the timer runs out."}\n${opportunity.status} | ${Math.ceil(countdown)} min left`,
          actionLabel: canResolve ? "Resolve" : facedScene ? "Face it" : "Accept",
          onAction: () => {
            if (canResolve) {
              this.startCommittedOpportunity(opportunity.id, venueId);
            } else if (facedScene) {
              this.pendingChoiceOpportunityId = opportunity.id;
              this.openRelationshipChoiceScene(facedScene);
            } else {
              const result = acceptOpportunity(this.world.opportunities, opportunity.id, getOpportunityAbsoluteMinute(this.world.clock));
              saveWorldState(this.world);
              this.showToast(result.message);
              this.openVenueActivityMenu(venueId);
            }
          }
        });
      }
    }

    const venueGroups = getSocialGroupsForVenue(venueId).filter(
      (group) => this.world.life.actProgress.currentAct < 2 || !LEGACY_ARI_BEACH_GROUP_IDS.has(group.id)
    );
    const joinableGroups = venueGroups.filter((group) => !isSocialGroupJoined(this.world, group.id));
    if (joinableGroups.length > 0) {
      this.appendActivityMenuSection(content, "Local clubs");
      for (const group of joinableGroups.slice(0, 2)) {
        const eventCopy = group.recurringEventIds?.length ? `Recurring events: ${group.recurringEventIds.length}` : "Recurring event hooks reserved";
        this.appendActivityMenuRow(content, {
          title: `${group.name} (${group.purpose})`,
          body: `${group.joinHook}\n${eventCopy}`,
          actionLabel: "Join",
          onAction: () => {
            const result = this.dispatchIntent({ kind: "JoinClub", groupId: group.id });
            saveWorldState(this.world);
            this.showToast(result.message);
            this.openVenueActivityMenu(venueId);
          }
        });
      }
    }

    const bridgeGroups = getStationSocialBridgeOptions(this.world, context).filter((option) => option.status === "go_to_home");
    if (bridgeGroups.length > 0) {
      this.appendActivityMenuSection(content, "Crew doors");
      for (const option of bridgeGroups.slice(0, 2)) {
        this.appendActivityMenuRow(content, {
          title: `${option.group.name} (${option.group.purpose})`,
          body: `${option.reason}\nJoin at ${option.homeVenueName}: ${option.group.joinHook}`,
          actionLabel: "Find",
          onAction: () => {
            this.showToast(`Head to ${option.homeVenueName} to join ${option.group.name}.`);
          }
        });
      }
    }

    if (availability.length === 0) {
      const empty = document.createElement("div");
      empty.className = "bali-life-activity-menu-empty";
      empty.textContent = "No daily-life activities are defined for this venue category yet.";
      content.appendChild(empty);
    }

    const stationOptions = availability.filter((option) => option.activity.stationId && option.activity.venueIds?.includes(context.venueId));
    if (stationOptions.length > 0 && context.stationId) {
      const station = getGameplayStationLoop(context.stationId);
      this.appendActivityMenuSection(content, `${station.title} actions`);
      for (const option of stationOptions.slice(0, 3)) {
        this.appendActivityOptionRow(content, context, option);
      }
    } else {
      for (const option of availability.slice(0, 6)) {
        this.appendActivityOptionRow(content, context, option);
      }
    }

    const footer = document.createElement("div");
    footer.className = "bali-life-activity-menu-footer";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "bali-life-activity-menu-button is-close";
    close.textContent = "Close";
    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.closePanel();
    });
    footer.appendChild(close);

    overlay.append(header, content, footer);
    document.body.appendChild(overlay);
    this.activityMenuOverlay = overlay;
  }

  private appendActivityMenuSection(parent: HTMLElement, label: string): void {
    const heading = document.createElement("div");
    heading.className = "bali-life-activity-menu-section";
    heading.textContent = label;
    parent.appendChild(heading);
  }

  private appendHomeStationActions(parent: HTMLElement): void {
    const rentReady = this.playerState.money >= this.world.life.hustle.rentAmount;
    const rentDueCopy = `Rent target: Rp ${this.world.life.hustle.rentAmount} by Day ${this.world.life.hustle.rentDueDay}. Current cash: Rp ${this.playerState.money}.`;
    this.appendActivityMenuSection(parent, "Rent and room");
    this.appendActivityMenuRow(parent, {
      title: rentReady ? "Pay rent at the kos" : "Rent target",
      body: rentReady
        ? `${rentDueCopy}\nPaying here buys breathing room without opening the phone.`
        : `${rentDueCopy}\nNeed Rp ${this.world.life.hustle.rentAmount - this.playerState.money} more before you can cover it.`,
      actionLabel: rentReady ? "Pay Rent" : "Blocked",
      variant: rentReady ? "primary" : "blocked",
      onAction: () => {
        if (!rentReady) {
          this.showToast(`Need Rp ${this.world.life.hustle.rentAmount - this.playerState.money} more for rent.`);
          return;
        }
        this.payHomeRent();
      }
    });
  }

  private appendScooterCounterActions(parent: HTMLElement): void {
    const repairStatus = getScooterRepairStatus(this.world);
    const upgradeStatus = getScooterUpgradeStatus(this.world);
    this.appendActivityMenuSection(parent, "Scooter counter");
    if (canSignWeeklyScooterContract(this.world)) {
      this.appendActivityMenuRow(parent, {
        title: "Weekly rental contract",
        body: "Retire the borrowed rattletrap and sign for a maintained weekly scooter. No rating reset; no extra payout.",
        actionLabel: "Sign contract",
        variant: "special",
        onAction: () => {
          const contract = signWeeklyScooterContract(this.world, this.getAbsoluteMinute());
          if (!contract.ok || !contract.dialogue) {
            this.showToast("The weekly contract is already settled.");
            return;
          }
          saveWorldState(this.world);
          this.phone?.refresh();
          this.updatePlayerBikeVisual();
          this.openStoryDialogue("Rental Counter", contract.dialogue, undefined, () => this.startAct2FinaleCard());
        }
      });
    }
    this.appendActivityMenuRow(parent, {
      title: repairStatus.available ? "Patch scooter" : "Repair status",
      body: repairStatus.available
        ? `Rp ${repairStatus.cost} to patch this tier back to ${repairStatus.targetCondition}%. Current condition: ${this.playerState.bikeCondition}%.`
        : repairStatus.reason ?? "Scooter repair is not needed right now.",
      actionLabel: repairStatus.available ? `Repair Rp ${repairStatus.cost}` : "Blocked",
      variant: repairStatus.available ? "primary" : "blocked",
      onAction: () => {
        if (!repairStatus.available) {
          this.showToast(repairStatus.reason ?? "Scooter repair is not available.");
          return;
        }
        this.startScooterRepairMinigame();
      }
    });
    this.appendActivityMenuRow(parent, {
      title: upgradeStatus.available ? "Upgrade to daily rental" : "Upgrade status",
      body: upgradeStatus.available
        ? `Rp ${upgradeStatus.cost} for a daily rental: cleaner rides, steadier delivery work.`
        : upgradeStatus.reason ?? "Scooter upgrade is not available right now.",
      actionLabel: upgradeStatus.available ? "Upgrade" : "Locked",
      variant: upgradeStatus.available ? "primary" : "blocked",
      onAction: () => {
        if (!upgradeStatus.available) {
          this.showToast(upgradeStatus.reason ?? "Scooter upgrade is locked.");
          return;
        }
        const result = upgradeToDailyScooter(this.world, this.getAbsoluteMinute());
        this.showToast(result.message);
        if (result.ok) {
          this.updatePlayerBikeVisual();
        }
        saveWorldState(this.world);
        this.openVenueActivityMenu("bali_family_rental_scooter");
      }
    });
  }

  private appendIbuHustleBoardRows(parent: HTMLElement): void {
    const active = this.world.life.hustle.activeDelivery;
    if (active) {
      const delivery = getDeliveryDefinition(active.deliveryId);
      const timeLeft = Math.max(0, Math.ceil(active.dueAt - this.getAbsoluteMinute()));
      this.appendActivityMenuSection(parent, "Active run");
      this.appendActivityMenuRow(parent, {
        title: delivery?.title ?? active.deliveryId,
        body:
          `${active.stage === "accepted" ? delivery?.pickupLabel ?? "Go to pickup." : delivery?.dropoffLabel ?? "Go to dropoff."}\n` +
          `${timeLeft} min left. Follow the field marker and press E / ACT.`,
        actionLabel: "Tracked",
        variant: "blocked",
        onAction: () => this.showToast("Follow the delivery marker and press E / ACT.")
      });
      return;
    }

    const offers = getDeliveryOfferAvailability(this.world);
    if (offers.length === 0) {
      const empty = document.createElement("div");
      empty.className = "bali-life-activity-menu-empty";
      empty.textContent = "Delivery board unlocks after Ibu Sari's first run.";
      parent.appendChild(empty);
      return;
    }

    this.appendActivityMenuSection(parent, "Board jobs");
    for (const offer of offers.slice(0, 5)) {
      const delivery = offer.delivery;
      const condition = offer.available ? previewDeliveryCondition(this.world, delivery, this.getAbsoluteMinute()) : undefined;
      const terms = getEffectiveDeliveryTerms(delivery, condition, this.world);
      const status = offer.available
        ? `Rp ${terms.payout} | ${terms.timeLimitMin} min${condition ? ` | ${condition.label}` : ""}`
        : offer.reason ?? "Locked";
      this.appendActivityMenuRow(parent, {
        title: delivery.title,
        body: `${delivery.description}\n${status}`,
        actionLabel: offer.available ? "Accept" : "Locked",
        variant: !offer.available
          ? "blocked"
          : delivery.boardStyle === "story_special"
            ? "special"
            : delivery.boardStyle === "priority_premium"
              ? "premium"
              : "primary",
        onAction: () => {
          if (!offer.available) {
            this.showToast(offer.reason ?? "That job is locked.");
            return;
          }
          const result = acceptDelivery(this.world, delivery.id, this.getAbsoluteMinute());
          this.showToast(result.ok ? `${result.message} Follow the delivery marker.` : result.message);
          saveWorldState(this.world);
          this.openIbuHustleBoard();
        }
      });
    }
  }

  private payHomeRent(): void {
    const previousAct = this.world.life.actProgress.currentAct;
    const result = payHustleRent(this.world, this.getAbsoluteMinute());
    this.showToast(result.message);
    saveWorldState(this.world);
    if (result.ok && this.maybeStartAct2Cutscene(previousAct, () => this.openHomeActivityMenu())) {
      return;
    }
    this.openHomeActivityMenu();
  }

  private startScooterRepairMinigame(): void {
    const repairStatus = getScooterRepairStatus(this.world);
    if (!repairStatus.available) {
      this.showToast(repairStatus.reason ?? "Scooter repair is not available.");
      return;
    }
    this.closePanel(false);
    this.mode = "committedActivity";
    this.committedActivity = {
      source: "scooterRepair",
      venueId: "bali_family_rental_scooter",
      venueName: "Bali Family Rental Scooter",
      label: "Wrench Repair",
      durationMin: 25,
      elapsedMs: 0,
      realDurationMs: 4200,
      startedAt: this.getAbsoluteMinute(),
      minigame: createActiveMinigame(getActivityMinigameDefinition("scooter_repair_timing"))
    };
    this.world.activeActivity = { ...this.committedActivity };
    this.createCommittedActivityOverlay(this.committedActivity);
    this.playActivityCommitFlourish(this.player.x, this.player.y, "Repair");
    saveWorldState(this.world);
    this.showToast("Wrench Repair started. Hit the timing window for a cleaner patch.");
  }

  private finishScooterRepair(performanceScore?: number): void {
    const result = repairScooter(this.world, this.getAbsoluteMinute(), performanceScore);
    if (result.ok) {
      this.updatePlayerBikeVisual();
    }
    saveWorldState(this.world);
    this.showToast(result.message);
  }

  private startRioRace(): void {
    const eligibility = getRioRaceEligibility(this.world);
    if (!eligibility.eligible) {
      this.openDialogue("Leo", eligibility.reason ?? "Leo is not ready to race right now.", "rio");
      return;
    }
    if (this.playerState.money < RIO_RACE.stake) {
      this.openDialogue("Leo", `"Bring Rp ${RIO_RACE.stake} if you want to put your mouth on the road."`, "rio");
      return;
    }

    this.playerState.money -= RIO_RACE.stake;
    this.prepareExteriorRaceStart();
    saveWorldState(this.world);
    this.startCutscene(this.buildRioRaceCountdownCutscene(), () => this.beginRioRaceRun());
  }

  private prepareExteriorRaceStart(): void {
    this.closePanel(false);
    this.destroyDialogueOverlay();
    this.activeInteriorId = null;
    this.interiorReturnPoint = undefined;
    this.interiorTransitioning = false;
    this.mode = "world";
    this.applyWorldCameraBounds();
    this.layoutForViewport();
    this.hudController.setMinimapHidden(false);
    this.resetNpcSpritesToRoutineState();
    const start = RIO_RACE.route[0];
    this.playerState.hasBike = true;
    this.playerState.bikeStuck = false;
    this.setPlayerBikeMode(true);
    this.placePlayerSprite(start, true);
  }

  private buildRioRaceCountdownCutscene(): CutsceneScript {
    return {
      id: "rio_streak_duel_countdown",
      after: "world",
      timeoutMs: 3600,
      steps: [
        { id: "letterbox_in", kind: "letterbox_in", durationMs: 260 },
        {
          id: "three",
          kind: "act_card",
          durationMs: 620,
          title: "3",
          subtitle: "Leo revs beside you."
        },
        {
          id: "two",
          kind: "act_card",
          durationMs: 620,
          title: "2",
          subtitle: `Hit the route markers. ${this.getRaceConcedeHint()}`
        },
        {
          id: "one",
          kind: "act_card",
          durationMs: 620,
          title: "1",
          subtitle: "Rental, station, Bungalow, beach, back."
        },
        {
          id: "go",
          kind: "act_card",
          durationMs: 520,
          title: "GO",
          subtitle: "Beat Leo clean."
        },
        { id: "letterbox_out", kind: "letterbox_out", durationMs: 260 }
      ]
    };
  }

  private beginRioRaceRun(): void {
    this.mode = "world";
    this.activeRivalRace = {
      config: RIO_RACE,
      elapsedMs: 0,
      checkpointIndex: 1,
      ghostProgress: 0
    };
    const start = RIO_RACE.route[0];
    this.rivalRaceGhost?.destroy();
    this.rivalRaceGhost = this.add.sprite(start.x - scaleDistance(28), start.y, "npc-rio").setDepth(start.y + 2);
    this.setSpriteFacing(this.rivalRaceGhost, false, CHARACTER_SPRITE_SCALE);
    this.world.activeActivity = {
      source: "rivalRace",
      raceId: RIO_RACE.id,
      venueId: RIO_RACE.venueId,
      venueName: "Bali Family Rental Scooter",
      label: RIO_RACE.title,
      durationMin: 0,
      elapsedMs: 0,
      realDurationMs: RIO_RACE.maxRaceMs,
      startedAt: this.getAbsoluteMinute()
    };
    this.showToast(`Race started. Hit the route markers. ${this.getRaceConcedeHint()}`);
  }

  private updateRivalRace(delta: number): void {
    const race = this.activeRivalRace;
    if (!race) {
      return;
    }
    race.elapsedMs += delta;
    const playerProgress = Math.max(0, (race.checkpointIndex - 1) / Math.max(1, race.config.route.length - 1));
    const ghost = advanceRivalRaceGhost(race.config, race.ghostProgress, race.elapsedMs, playerProgress, delta);
    race.ghostProgress = ghost.progress;
    if (ghost.finished && race.ghostFinishedAtMs == null) {
      race.ghostFinishedAtMs = race.elapsedMs;
    }
    const ghostPosition = getRivalRaceRoutePosition(race.config, race.ghostProgress);
    this.rivalRaceGhost?.setPosition(ghostPosition.x, ghostPosition.y).setDepth(ghostPosition.y + 2);

    const next = race.config.route[race.checkpointIndex];
    if (next) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, next.x, next.y);
      if (distance <= scaleDistance(race.config.checkpointRadius)) {
        race.checkpointIndex += 1;
        this.showToast(race.checkpointIndex >= race.config.route.length ? "Finish line." : `Checkpoint: ${next.label}.`);
      }
    }

    this.world.activeActivity = this.world.activeActivity?.source === "rivalRace"
      ? { ...this.world.activeActivity, elapsedMs: race.elapsedMs }
      : this.world.activeActivity;

    if (race.checkpointIndex >= race.config.route.length) {
      this.finishRivalRace({ playerFinishMs: race.elapsedMs, ghostFinishMs: race.ghostFinishedAtMs });
      return;
    }
    if (race.elapsedMs >= race.config.maxRaceMs) {
      this.finishRivalRace({ playerFinishMs: race.elapsedMs, ghostFinishMs: race.ghostFinishedAtMs, timedOut: true });
    }
  }

  private finishRivalRace(input: { playerFinishMs?: number; ghostFinishMs?: number; conceded?: boolean; timedOut?: boolean }): void {
    const race = this.activeRivalRace;
    if (!race) {
      return;
    }
    const outcome = resolveRivalRaceOutcome(input);
    applyRivalRaceOutcome(this.world, outcome, this.getAbsoluteMinute());
    this.activeRivalRace = undefined;
    this.world.activeActivity = null;
    this.rivalRaceGhost?.destroy();
    this.rivalRaceGhost = undefined;
    this.rivalRaceMarkerLayer?.clear();
    saveWorldState(this.world);

    if (outcome.result === "win") {
      this.openDialogue(
        "Leo",
        'Leo pulls in half a breath after you, smile gone sharp instead of gone. "Clean line. Annoying." He tosses the side-bet cash at you. "Do not make a speech. I still have the better rating."',
        "rio"
      );
      return;
    }
    const line =
      outcome.reason === "conceded"
        ? 'Leo circles back before you can park. "Bailed? Good strategy if the goal was me winning." He taps your mirror. "Rematch stays open. Try courage next time."'
        : 'Leo is waiting at the rental, one foot on the curb. "See? Streaks are not luck." He grins, too pleased. "Rematch stays open."';
    this.openDialogue("Leo", line, "rio");
  }

  private appendActivityOptionRow(parent: HTMLElement, context: VenueActivityContext, option: ActivityAvailability): void {
    const activity = option.activity;
    const moneyCopy = activity.cost
      ? activity.cost < 0
        ? `Earn Rp ${Math.abs(activity.cost)}`
        : `Cost Rp ${activity.cost}`
      : "Free";
    const status = option.available ? `${activity.timeCost} min | ${moneyCopy}` : option.reason ?? "Unavailable";
    const preview = areAdvancedMetersVisible(this.world) ? formatActivityPreview(activity, option.timeModifier) : "";
    this.appendActivityMenuRow(parent, {
      title: activity.label,
      body: `${activity.description}\n${preview ? `${preview}\n` : ""}${status}`,
      actionLabel: option.available ? (activity.actionLabel ?? "Do") : "Blocked",
      variant: option.available ? "primary" : "blocked",
      onAction: () => {
        if (option.available) {
          this.performVenueActivity(context, activity.id);
        } else {
          this.showToast(option.reason ?? "Activity unavailable.");
        }
      }
    });
  }

  private appendActivityMenuRow(
    parent: HTMLElement,
    config: {
      title: string;
      body: string;
      actionLabel: string;
      onAction: () => void;
      variant?: "primary" | "blocked" | "special" | "premium";
    }
  ): void {
    const row = document.createElement("article");
    row.className = `bali-life-activity-menu-row${config.variant === "blocked" ? " is-blocked" : ""}${config.variant === "special" ? " is-special" : ""}${config.variant === "premium" ? " is-premium" : ""}`;

    const copy = document.createElement("div");
    copy.className = "bali-life-activity-menu-copy";
    const title = document.createElement("h3");
    title.className = "bali-life-activity-menu-row-title";
    title.textContent = config.title;
    const body = document.createElement("p");
    body.className = "bali-life-activity-menu-row-body";
    body.textContent = config.body;
    copy.append(title, body);

    const button = document.createElement("button");
    button.type = "button";
    button.className = `bali-life-activity-menu-button${config.variant === "blocked" ? " is-blocked" : ""}${config.variant === "special" ? " is-special" : ""}${config.variant === "premium" ? " is-premium" : ""}`;
    button.textContent = config.actionLabel;
    if (config.variant === "blocked") {
      button.setAttribute("aria-disabled", "true");
    }
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      config.onAction();
    });

    row.append(copy, button);
    parent.appendChild(row);
  }

  private destroyActivityMenuOverlay(): void {
    this.activityMenuOverlay?.remove();
    this.activityMenuOverlay = undefined;
  }

  private performVenueActivity(context: VenueActivityContext, activityId: string): void {
    const option = getActivityAvailability(this.world, context).find((candidate) => candidate.activity.id === activityId);
    if (!option) {
      this.showToast("No activity found here.");
      this.openVenueActivityMenu(context.venueId);
      return;
    }
    if (!option.available) {
      this.showToast(option.reason ?? "Activity unavailable.");
      this.openVenueActivityMenu(context.venueId);
      return;
    }

    if (activityId === "home_sleep_until_morning") {
      this.closePanel(false);
      this.sleepToMorning();
      return;
    }

    this.startCommittedActivity(context, option.activity.id);
  }

  private resolveVenueActivity(context: VenueActivityContext, activityId: string, performanceScore?: number): void {
    const option = getActivityAvailability(this.world, context).find((candidate) => candidate.activity.id === activityId);
    const result = applyActivity(this.world, context, activityId, { performanceScore });
    if (!result.ok) {
      this.showToast(result.message);
      return;
    }

    this.dispatchIntent({ kind: "VisitVenue", venueId: context.venueId });
    const effect = option?.activity.reputationEffect;
    if (effect?.delta) {
      this.dispatchIntent({ kind: "AdjustReputation", delta: effect.delta, reason: effect.reason });
    }
    if (effect?.tag) {
      this.dispatchIntent({ kind: "AwardReputationTag", tag: effect.tag, reason: effect.reason });
    }
    const affinityBump = option?.activity.affinityBump ?? 0;
    if (affinityBump > 0) {
      const scaledAffinity = Math.max(1, Math.round(affinityBump * rewardMultiplier(performanceScore)));
      for (const npcId of context.npcIds) {
        bumpRelationshipAffinity(
          this.world,
          "npc",
          npcId,
          scaledAffinity,
          `${option?.activity.label ?? "Activity"} at ${context.name}`,
          this.getAbsoluteMinute()
        );
      }
    }
    let act0Message = "";
    const act0MealKind = getAct0MealProgressKindForActivity(activityId);
    if (act0MealKind && this.world.life.actProgress.act0Step === "buy_meal_and_coffee") {
      const completedAct0Meal = markAct0MealProgress(this.world, act0MealKind);
      if (completedAct0Meal) {
        act0Message = " First earnings spent. Sleep when ready.";
      } else {
        act0Message = act0MealKind === "coffee" ? " Coffee handled. Eat properly before sleep." : " Meal handled. Grab coffee before sleep.";
      }
    }
    const goalMessage = this.refreshSettlingInGoals(false);
    this.updateLighting();
    saveWorldState(this.world);
    this.showToast(goalMessage || act0Message ? `${result.message} ${act0Message}${goalMessage ? ` ${goalMessage}` : ""}` : result.message);
  }

  private startCommittedActivity(context: VenueActivityContext, activityId: string): void {
    const option = getActivityAvailability(this.world, context).find((candidate) => candidate.activity.id === activityId);
    if (!option?.available) {
      this.showToast(option?.reason ?? "Activity unavailable.");
      this.openVenueActivityMenu(context.venueId);
      return;
    }

    if (activityId === "warung_lunch_rush" && this.activeInteriorId === "warung_sari_interior") {
      this.startWarungRush(context, option.activity);
      return;
    }

    if (!this.activeInteriorId) {
      const node = venueMapNodes.find((candidate) => candidate.venueId === context.venueId);
      this.placePlayerAtCommittedVenue(node);
    }

    this.closePanel(false);
    this.mode = "committedActivity";
    this.committedActivity = {
      source: "activity",
      venueId: context.venueId,
      activityId,
      venueName: context.name,
      label: option.activity.label,
      durationMin: option.activity.timeCost,
      elapsedMs: 0,
      realDurationMs: Phaser.Math.Clamp(option.activity.timeCost * 24, 2800, 6500),
      startedAt: this.getAbsoluteMinute(),
      minigame: createActiveMinigame(getActivityMinigameDefinition(option.activity.id))
    };
    this.world.activeActivity = { ...this.committedActivity };
    this.createCommittedActivityOverlay(this.committedActivity);
    this.playActivityCommitFlourish(this.player.x, this.player.y, option.activity.label);
    saveWorldState(this.world);
    const activityHint = this.hudController.isTouchInputActive
      ? "Use the on-screen controls."
      : "ESC cancels early.";
    this.showToast(`${option.activity.label} started. ${activityHint}`);
  }

  private startWarungRush(context: VenueActivityContext, activity: Activity): void {
    const plays = this.world.life.activityHistory[`${context.venueId}:${activity.id}`]?.totalCount ?? 0;
    this.closePanel(false);
    const rush = createWarungRushState(plays);
    this.committedActivity = {
      source: "warungRush", activityId: "warung_lunch_rush", rush,
      venueId: context.venueId, venueName: context.name, label: activity.label,
      durationMin: activity.timeCost, elapsedMs: 0, realDurationMs: WARUNG_RUSH_FEEL_TUNING.roundDurationMs,
      startedAt: this.getAbsoluteMinute()
    };
    this.mode = "warungRush";
    this.world.activeActivity = { ...this.committedActivity };
    this.createWarungRushVisuals();
    this.createCommittedActivityOverlay(this.committedActivity);
    saveWorldState(this.world);
    this.showToast(`Lunch rush! Walk to Ibu's counter, then E / ACT at the matching table.`);
  }

  private handleWarungRushAction(): void {
    const active = this.committedActivity;
    if (!active || active.source !== "warungRush") return;
    const interior = this.getActiveInterior();
    if (!interior) return;
    const counter = interior.stations.find((station) => station.id === "meal_counter");
    if (counter && Phaser.Math.Distance.Between(this.player.x, this.player.y, counter.x, counter.y) <= counter.radius) {
      const before = active.rush.heldDishId;
      active.rush = pickUpWarungDish(active.rush);
      this.showToast(active.rush.heldDishId && !before ? `Picked up ${WARUNG_DISH_LABELS[active.rush.heldDishId]}.` : "Hands full — deliver that dish first.");
      return;
    }
    const tableId = this.getWarungRushTableId();
    if (!tableId) {
      this.showToast("Move to Ibu's counter or a customer table.");
      return;
    }
    const result = serveWarungOrder(active.rush, tableId);
    active.rush = result.state;
    this.showToast(result.message);
  }

  private getWarungRushTableId(): string | undefined {
    const interior = this.getActiveInterior();
    if (!interior) return undefined;
    const { x, y } = interior.origin;
    const tables = [
      { id: "left", x: x + TILE_SIZE * 2.35, y: y + TILE_SIZE * 4.55 },
      { id: "right", x: x + TILE_SIZE * 8.75, y: y + TILE_SIZE * 4.8 },
      { id: "counter", x: x + TILE_SIZE * 6.9, y: y + TILE_SIZE * 4.95 }
    ];
    return tables.find((table) => Phaser.Math.Distance.Between(this.player.x, this.player.y, table.x, table.y) <= TILE_SIZE * 0.95)?.id;
  }

  private createWarungRushVisuals(): void {
    this.destroyWarungRushVisuals();
    const interior = this.getActiveInterior();
    if (!interior) return;
    const { x, y } = interior.origin;
    this.warungRushVisuals = this.add.graphics().setDepth(80);
    const tables = [
      { x: x + TILE_SIZE * 2.35, y: y + TILE_SIZE * 4.15 }, { x: x + TILE_SIZE * 8.75, y: y + TILE_SIZE * 4.4 }, { x: x + TILE_SIZE * 6.9, y: y + TILE_SIZE * 4.55 }
    ];
    this.warungRushCustomers = tables.map((table, index) => this.add.sprite(table.x, table.y, index % 2 ? "npc-kadek" : "npc-ibu_sari").setDepth(table.y + 3).setTint(index % 2 ? 0xffc4a2 : 0xaedbff).setScale(CHARACTER_SPRITE_SCALE * 0.82));
    this.updateWarungRushVisuals();
  }

  private updateWarungRushVisuals(): void {
    const active = this.committedActivity;
    if (!active || active.source !== "warungRush" || !this.warungRushVisuals) return;
    const interior = this.getActiveInterior();
    if (!interior) return;
    const { x, y } = interior.origin;
    const tablePositions: Record<string, { x: number; y: number }> = {
      left: { x: x + TILE_SIZE * 2.35, y: y + TILE_SIZE * 3.55 }, right: { x: x + TILE_SIZE * 8.75, y: y + TILE_SIZE * 3.8 }, counter: { x: x + TILE_SIZE * 6.9, y: y + TILE_SIZE * 3.95 }
    };
    this.warungRushVisuals.clear();
    for (const order of active.rush.orders.filter((order) => order.status === "waiting")) {
      const point = tablePositions[order.tableId]; if (!point) continue;
      const ratio = order.patienceMs / order.maxPatienceMs;
      this.warungRushVisuals.lineStyle(4, ratio > .5 ? 0x62c48f : ratio > .25 ? 0xf4b860 : 0xff7d70, .95);
      this.warungRushVisuals.beginPath(); this.warungRushVisuals.arc(point.x, point.y, TILE_SIZE * .48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio); this.warungRushVisuals.strokePath();
      this.warungRushVisuals.fillStyle(0x101820, .9); this.warungRushVisuals.fillRoundedRect(point.x - 34, point.y - 25, 68, 15, 4);
      // A small dish-color pip keeps the order readable at normal and touch zoom.
      this.warungRushVisuals.fillStyle(order.dishId === "nasi_campur" ? 0xf4d58d : order.dishId === "mie_goreng" ? 0xe38b52 : 0x6ab7ff, 1); this.warungRushVisuals.fillCircle(point.x, point.y - 17, 5);
    }
  }

  private destroyWarungRushVisuals(): void {
    this.warungRushVisuals?.destroy(); this.warungRushVisuals = undefined;
    this.warungRushCustomers.forEach((sprite) => sprite.destroy()); this.warungRushCustomers = [];
  }

  private startCommittedOpportunity(opportunityId: string, venueId: string): void {
    const live = this.world.opportunities.live.find((candidate) => candidate.id === opportunityId);
    if (!live || live.locationVenueId !== venueId) {
      this.showToast("That opportunity is not here anymore.");
      this.openVenueActivityMenu(venueId);
      return;
    }
    if (live.status !== "accepted") {
      this.showToast("Accept that phone ping before committing to it.");
      this.openVenueActivityMenu(venueId);
      return;
    }

    const countdown = getLiveOpportunityCountdown(live, this.world.clock);
    if (countdown <= 0) {
      const result = resolveOpportunity(this.world.opportunities, this.world, opportunityId);
      saveWorldState(this.world);
      this.showToast(result.message);
      this.openVenueActivityMenu(venueId);
      return;
    }

    const template = getOpportunityTemplate(live.templateId);
    if (!template) {
      this.showToast("Opportunity content is missing.");
      this.openVenueActivityMenu(venueId);
      return;
    }
    const moneyDelta = template.reward.money ?? 0;
    if (moneyDelta < 0 && this.playerState.money + moneyDelta < 0) {
      this.showToast(`Need Rp ${Math.abs(moneyDelta)} to take that opportunity.`);
      this.openVenueActivityMenu(venueId);
      return;
    }

    const context = getVenueActivityContext(venueId);
    if (!this.activeInteriorId) {
      const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
      this.placePlayerAtCommittedVenue(node);
    }

    this.closePanel(false);
    this.mode = "committedActivity";
    this.committedActivity = {
      source: "opportunity",
      venueId,
      opportunityId,
      venueName: context?.name ?? template.locationVenueId,
      label: template.title,
      durationMin: template.timeCostMin,
      elapsedMs: 0,
      realDurationMs: Phaser.Math.Clamp(template.timeCostMin * 28, 2800, 7200),
      startedAt: this.getAbsoluteMinute(),
      minigame: createActiveMinigame(getOpportunityMinigameDefinition(template.type))
    };
    this.world.activeActivity = { ...this.committedActivity };
    this.createCommittedActivityOverlay(this.committedActivity);
    this.playActivityCommitFlourish(this.player.x, this.player.y, template.title);
    saveWorldState(this.world);
    const activityHint = this.hudController.isTouchInputActive
      ? "Use the on-screen controls."
      : "ESC cancels early.";
    this.showToast(`${template.title} started. ${activityHint}`);
  }

  private placePlayerAtCommittedVenue(node: VenueMapNode | undefined): void {
    if (!node) {
      return;
    }
    this.playerState.x = node.x;
    this.playerState.y = node.y + Math.min(node.radius * 0.32, scaleDistance(42));
    this.player.setPosition(this.playerState.x, this.playerState.y);
    this.player.body?.reset(this.playerState.x, this.playerState.y);
  }

  private updateCommittedActivity(delta: number): void {
    const active = this.committedActivity;
    if (!active || this.mode !== "committedActivity") {
      return;
    }
    active.elapsedMs = Math.min(active.realDurationMs, active.elapsedMs + delta);
    this.updateCommittedMinigame(delta);
    this.world.activeActivity = { ...active };
    const progress = active.elapsedMs / active.realDurationMs;
    const elapsedMinutes = Math.round(active.durationMin * progress);
    if (this.committedActivityProgress) {
      this.committedActivityProgress.style.width = `${Math.round(progress * 100)}%`;
    }
    if (this.committedActivityStatus) {
      this.committedActivityStatus.textContent = `Fast-forwarding ${elapsedMinutes}/${active.durationMin} in-game minutes`;
    }
    if (progress >= 1) {
      this.completeCommittedActivity();
    }
  }

  private updateWarungRush(delta: number): void {
    const active = this.committedActivity;
    if (!active || active.source !== "warungRush" || this.mode !== "warungRush") return;
    active.elapsedMs = Math.min(active.realDurationMs, active.elapsedMs + delta);
    active.rush = updateWarungRush(active.rush, delta);
    this.world.activeActivity = { ...active };
    this.updateWarungRushVisuals();
    const progress = active.elapsedMs / active.realDurationMs;
    if (this.committedActivityProgress) this.committedActivityProgress.style.width = `${Math.round(progress * 100)}%`;
    if (this.committedActivityStatus) {
      const held = active.rush.heldDishId ? `Holding ${WARUNG_DISH_LABELS[active.rush.heldDishId]}` : "Hands empty — counter is ready";
      this.committedActivityStatus.textContent = `${held} · Served ${active.rush.servedCount} · Left ${Math.ceil((active.realDurationMs - active.elapsedMs) / 1000)}s`;
    }
    if (progress >= 1) this.completeCommittedActivity();
  }

  private completeCommittedActivity(): void {
    const active = this.committedActivity;
    if (!active) {
      return;
    }
    this.committedActivity = undefined;
    this.world.activeActivity = null;
    this.destroyCommittedActivityOverlay();
    this.mode = this.activeInteriorId ? "interior" : "world";
    const performanceScore = resolvePerformanceScore(active.minigame);
    active.performanceScore = performanceScore;
    if (active.source === "scooterRepair") {
      this.finishScooterRepair(performanceScore);
      return;
    }
    if (active.source === "warungRush") {
      this.destroyWarungRushVisuals();
      const context = getVenueActivityContext(active.venueId);
      if (context) this.resolveVenueActivity(context, active.activityId, calculateWarungRushPerformance(active.rush));
      return;
    }
    if (active.source === "activity") {
      const context = getVenueActivityContext(active.venueId);
      if (!context) {
        this.showToast("Activity finished, but the venue context was missing.");
        return;
      }
      this.resolveVenueActivity(context, active.activityId, performanceScore);
      return;
    }
    if (active.source === "rivalRace") {
      return;
    }
    if (!active.opportunityId) {
      this.showToast("Activity finished, but the opportunity was missing.");
      return;
    }
    this.finishCommittedOpportunity(active.opportunityId, performanceScore);
  }

  private updateDeliveryRideMode(delta: number): void {
    const active = this.world.life.hustle.activeDelivery;
    const deliveryRideActive = Boolean(active && active.stage === "picked_up");
    const raceRideActive = Boolean(this.activeRivalRace);
    if (!deliveryRideActive && !raceRideActive) {
      this.clearDeliveryHazards();
      return;
    }
    const rideId = deliveryRideActive ? active!.deliveryId : "leo_rival_race";
    this.ensureDeliveryHazards(rideId);
    if (active?.stage === "picked_up") {
      active.rideRun ??= { elapsedMs: 0, hazardsSpawned: this.deliveryHazards.length, hazardsAvoided: 0, nearMisses: 0, contacts: 0 };
      if (this.mode === "world" && this.playerState.onBike) {
        active.rideRun.elapsedMs += delta;
      }
      active.rideRun.hazardsSpawned = Math.max(active.rideRun.hazardsSpawned, this.deliveryHazards.length);
      if (
        active.deliveryId === ACT0_STORM_DELIVERY_ID &&
        active.rideRun.elapsedMs >= ACT0_STORM_TRIGGER_MS &&
        markAct0StormTriggered(this.world)
      ) {
        this.setTimePhaseForBeat("stormDusk");
        this.startWeather("storm");
        this.showToast("The storm breaks mid-run — keep the cargo upright.");
        saveWorldState(this.world);
      }
      const breakdown = triggerAct1Breakdown(this.world, {
        x: this.player.x,
        y: this.player.y,
        now: this.getAbsoluteMinute()
      });
      if (breakdown.fired) {
        this.toastQueue = [];
        this.toastTimer = 0;
        this.toastText.setAlpha(0);
        this.rideModelState = createRideModelState();
        this.player.setVelocity(0, 0);
        this.clearDeliveryHazards();
        this.spawnBreakdownSmokePuff();
        this.cameras.main.shake(420, 0.008);
        this.playSound("breakdown");
        saveWorldState(this.world);
        this.phone?.refresh();
        this.showToast(breakdown.message ?? "TRANSMISSION GONE — push it in.");
      }
    }
    if (this.mode !== "world" || !this.playerState.onBike) return;

    const elapsedMs = active?.rideRun?.elapsedMs ?? this.activeRivalRace?.elapsedMs ?? 0;
    this.deliveryHazardContactCooldown = Math.max(0, this.deliveryHazardContactCooldown - delta);
    const night = getTimePhase(this.world.clock.minuteOfDay) === "night";
    const visibilityDistance = scaleDistance(getHazardVisibilityDistance(night));
    const awarenessDistance = scaleDistance(DELIVERY_RIDE_FEEL_TUNING.awarenessRadius);
    const contactDistance = scaleDistance(DELIVERY_RIDE_FEEL_TUNING.contactRadius);
    const nearMissDistance = scaleDistance(DELIVERY_RIDE_FEEL_TUNING.nearMissRadius);

    for (const hazard of this.deliveryHazards) {
      if (hazard.definition.kind === "pedestrian") {
        hazard.visual.x = Math.sin(elapsedMs / 1500 + hazard.definition.y) * scaleDistance(42);
      }
      const hazardX = hazard.definition.x + hazard.visual.x;
      const hazardY = hazard.definition.y;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, hazardX, hazardY);
      hazard.visual.setAlpha(night && distance > visibilityDistance ? 0.12 : hazard.resolved ? 0.28 : 0.92);
      if (hazard.resolved) continue;
      if (distance <= awarenessDistance) hazard.approached = true;

      if (
        distance <= contactDistance &&
        this.deliveryHazardContactCooldown <= 0
      ) {
        const contact = applyDeliveryHazardContact();
        const cargoDamage = this.damageActiveDeliveryCargo(contact.cargoReason);
        if (active?.rideRun) active.rideRun.contacts += 1;
        hazard.resolved = true;
        this.deliveryHazardContactCooldown = DELIVERY_RIDE_FEEL_TUNING.contactCooldownMs;
        this.applyDeliverySpeedStumble(contact.speedMultiplier);
        this.cameras.main.shake(130, 0.0035);
        this.spawnFloatingText(
          cargoDamage?.damaged ? `Cargo -${cargoDamage.amount}%` : "Stumble",
          this.player.x,
          this.player.y - scaleDistance(34),
          "#f4b860"
        );
        this.showToast(`${this.hazardLabel(hazard.definition.kind)} — soft hit, keep riding.`);
        continue;
      }
      if (
        !hazard.nearMissed &&
        distance > contactDistance &&
        distance <= nearMissDistance &&
        (this.rideModelOutput?.speedRatio ?? 0) >= RIDE_FEEL_TUNING.nearMissMinimumSpeedRatio
      ) {
        hazard.nearMissed = true;
        this.recordDeliveryNearMiss();
      }
      if (hazard.approached && distance > awarenessDistance * 1.15) {
        hazard.resolved = true;
        if (active?.rideRun) active.rideRun.hazardsAvoided += 1;
      }
    }
  }

  private ensureDeliveryHazards(deliveryId: string): void {
    if (this.deliveryHazardDeliveryId === deliveryId) return;
    this.clearDeliveryHazards();
    this.deliveryHazardDeliveryId = deliveryId;
    const definitions = getDeliveryHazards(this.world.life.actProgress.currentAct, deliveryId);
    this.deliveryHazards = definitions.map((definition) => ({
      definition,
      visual: this.createDeliveryHazardVisual(definition),
      approached: false,
      resolved: false,
      nearMissed: false
    }));
  }

  private createDeliveryHazardVisual(definition: DeliveryHazardDefinition): Phaser.GameObjects.Graphics {
    const visual = this.add.graphics().setPosition(0, 0).setDepth(definition.y + 2);
    if (definition.kind === "pothole") {
      visual.fillStyle(0x443a32, 0.94);
      visual.fillEllipse(definition.x, definition.y, scaleDistance(42), scaleDistance(24));
      visual.lineStyle(Math.max(1, scaleDistance(2)), 0x8d806d, 0.72);
      visual.strokeEllipse(definition.x, definition.y, scaleDistance(42), scaleDistance(24));
    } else if (definition.kind === "puddle") {
      visual.fillStyle(0x4e98ad, 0.58);
      visual.fillEllipse(definition.x, definition.y, scaleDistance(48), scaleDistance(25));
      visual.lineStyle(Math.max(1, scaleDistance(2)), 0x9ee6df, 0.5);
      visual.strokeEllipse(definition.x, definition.y, scaleDistance(48), scaleDistance(25));
    } else {
      visual.fillStyle(0x253a35, 0.9);
      visual.fillCircle(definition.x, definition.y - scaleDistance(10), scaleDistance(7));
      visual.lineStyle(scaleDistance(4), 0xf2c35d, 0.92);
      visual.lineBetween(definition.x, definition.y - scaleDistance(2), definition.x, definition.y + scaleDistance(16));
      visual.lineBetween(definition.x, definition.y + scaleDistance(6), definition.x - scaleDistance(8), definition.y + scaleDistance(18));
      visual.lineBetween(definition.x, definition.y + scaleDistance(6), definition.x + scaleDistance(8), definition.y + scaleDistance(18));
    }
    return visual;
  }

  private clearDeliveryHazards(): void {
    for (const hazard of this.deliveryHazards) hazard.visual.destroy();
    this.deliveryHazards = [];
    this.deliveryHazardDeliveryId = null;
    this.deliveryHazardContactCooldown = 0;
  }

  private recordDeliveryNearMiss(): void {
    const active = this.world.life.hustle.activeDelivery;
    if (!active?.rideRun || active.stage !== "picked_up") return;
    active.rideRun.nearMisses += 1;
  }

  private applyDeliverySpeedStumble(multiplier: number): void {
    this.rideModelState = {
      ...this.rideModelState,
      velocityX: this.rideModelState.velocityX * multiplier,
      velocityY: this.rideModelState.velocityY * multiplier
    };
    this.player.setVelocity(this.rideModelState.velocityX, this.rideModelState.velocityY);
  }

  private hazardLabel(kind: DeliveryHazardDefinition["kind"]): string {
    return kind === "pothole" ? "Pothole" : kind === "puddle" ? "Puddle" : "Pedestrian crossing";
  }

  private isRideSurfaceSlick(): boolean {
    return isWeatherRideSurfaceSlick(this.weather.state);
  }

  private getActiveCargoIntegrity(): number | null {
    const active = this.world.life.hustle.activeDelivery;
    if (!active || active.stage !== "picked_up" || active.cargoIntegrity == null) {
      return null;
    }
    return Phaser.Math.Clamp(Math.round(active.cargoIntegrity), 0, 100);
  }

  private damageActiveDeliveryCargo(reason: "traffic_hit" | "hard_collision"): ReturnType<typeof applyCargoDamage> | null {
    const active = this.world.life.hustle.activeDelivery;
    if (!active || active.stage !== "picked_up") {
      return null;
    }
    const delivery = getDeliveryDefinition(active.deliveryId);
    if (!delivery) {
      return null;
    }
    const result = applyCargoDamage(active.cargoIntegrity ?? 100, reason);
    active.cargoIntegrity = result.after;
    active.cargoDamageEvents = (active.cargoDamageEvents ?? 0) + (result.damaged ? 1 : 0);
    return result;
  }

  private finishCommittedOpportunity(opportunityId: string, performanceScore?: number): void {
    const result = resolveOpportunity(this.world.opportunities, this.world, opportunityId, undefined, performanceScore);
    const goalMessage = this.refreshSettlingInGoals(false);
    this.updateLighting();
    saveWorldState(this.world);
    this.showToast(goalMessage && result.ok ? `${result.message} ${goalMessage}` : result.message);
  }

  private cancelCommittedActivity(): void {
    if (!this.committedActivity) {
      this.closePanel();
      return;
    }
    const label = this.committedActivity.label;
    const wasWarungRush = this.committedActivity.source === "warungRush";
    this.committedActivity = undefined;
    this.world.activeActivity = null;
    this.destroyCommittedActivityOverlay();
    if (wasWarungRush) this.destroyWarungRushVisuals();
    this.mode = this.activeInteriorId ? "interior" : "world";
    saveWorldState(this.world);
    this.showToast(`${label} cancelled. No reward earned.`);
  }

  private resumeCommittedActivityIfNeeded(): void {
    if (!this.world.activeActivity) {
      return;
    }
    if (this.world.activeActivity.source === "rivalRace") {
      this.resumeRivalRace(this.world.activeActivity);
      return;
    }
    if (this.world.activeActivity.source === "warungRush") {
      const interior = interiorDefinitions.warung_sari_interior;
      this.activeInteriorId = interior.id;
      this.applyInteriorCameraBounds(interior);
      this.placePlayerSprite(interior.entrance, false);
      this.committedActivity = { ...this.world.activeActivity };
      this.mode = "warungRush";
      this.createWarungRushVisuals();
      this.createCommittedActivityOverlay(this.committedActivity);
      return;
    }
    this.committedActivity = { ...this.world.activeActivity };
    this.mode = "committedActivity";
    const node = venueMapNodes.find((candidate) => candidate.venueId === this.committedActivity?.venueId);
    this.placePlayerAtCommittedVenue(node);
    this.createCommittedActivityOverlay(this.committedActivity);
  }

  private resumeRivalRace(active: Extract<ActiveActivityState, { source: "rivalRace" }>): void {
    this.prepareExteriorRaceStart();
    const progress = Math.max(0, Math.min(1, active.elapsedMs / Math.max(1, RIO_RACE.maxRaceMs)));
    this.activeRivalRace = {
      config: RIO_RACE,
      elapsedMs: active.elapsedMs,
      checkpointIndex: Math.max(1, Math.min(RIO_RACE.route.length - 1, Math.round(progress * (RIO_RACE.route.length - 1)))),
      ghostProgress: Math.min(0.92, progress)
    };
    const ghostPosition = getRivalRaceRoutePosition(RIO_RACE, this.activeRivalRace.ghostProgress);
    this.rivalRaceGhost?.destroy();
    this.rivalRaceGhost = this.add.sprite(ghostPosition.x, ghostPosition.y, "npc-rio").setDepth(ghostPosition.y + 2);
    this.setSpriteFacing(this.rivalRaceGhost, false, CHARACTER_SPRITE_SCALE);
    this.showToast(`Race resumed. Hit the next marker. ${this.getRaceConcedeHint()}`);
  }

  private getRaceConcedeHint(): string {
    return this.hudController.isTouchInputActive ? "QUIT concedes." : "ESC concedes.";
  }

  private updateCommittedMinigame(delta: number): void {
    const minigame = this.committedActivity?.minigame;
    if (!minigame || minigame.kind === "choice") {
      return;
    }
    const speed = minigame.kind === "balance" ? 1300 : 1050;
    minigame.markerPhase = (minigame.markerPhase + delta / speed) % 1;
    this.updateCommittedMinigameUi();
  }

  private recordCommittedMinigameTimingAttempt(): void {
    const active = this.committedActivity;
    const minigame = active?.minigame;
    if (!active || !minigame || minigame.kind === "choice") {
      return;
    }
    const score = scoreTimingAttempt(minigame.markerPhase, minigame.targetStart, minigame.targetEnd);
    minigame.attempts += 1;
    minigame.bestScore = Math.max(minigame.bestScore, score);
    minigame.feedback = score >= 0.92 ? "Clean hit. Rewards will land stronger." : score >= 0.55 ? "Good enough. You kept it together." : "Messy beat. You can try again before it ends.";
    active.performanceScore = resolvePerformanceScore(minigame);
    this.world.activeActivity = { ...active };
    this.updateCommittedMinigameUi();
  }

  private recordCommittedMinigameChoice(choiceId: string): void {
    const active = this.committedActivity;
    const minigame = active?.minigame;
    if (!active || !minigame || minigame.kind !== "choice") {
      return;
    }
    const choice = scoreChoice(minigame.choices, choiceId);
    if (!choice) {
      return;
    }
    minigame.selectedChoiceId = choice.id;
    minigame.attempts = Math.max(1, minigame.attempts + 1);
    minigame.bestScore = Math.max(minigame.bestScore, choice.score);
    minigame.feedback = choice.feedback;
    active.performanceScore = resolvePerformanceScore(minigame);
    this.world.activeActivity = { ...active };
    this.updateCommittedMinigameUi();
  }

  private updateCommittedMinigameUi(): void {
    const minigame = this.committedActivity?.minigame;
    if (!minigame) {
      return;
    }
    if (this.committedMinigameMarker) {
      this.committedMinigameMarker.style.left = `${Math.round(minigame.markerPhase * 100)}%`;
    }
    if (this.committedMinigameFeedback) {
      const score = resolvePerformanceScore(minigame);
      const performance = score == null ? "" : ` Best ${Math.round(score * 100)}%.`;
      this.committedMinigameFeedback.textContent =
        minigame.feedback ?? `Optional skill beat. Ignore it for a steady result.${performance}`;
      if (minigame.feedback) {
        this.committedMinigameFeedback.textContent += performance;
      }
    }
  }

  private createCommittedActivityOverlay(active: ActiveActivityState): void {
    this.destroyCommittedActivityOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const overlay = document.createElement("section");
    overlay.className = "bali-life-activity-progress";
    overlay.dataset.activityProgress = "true";
    overlay.dataset.uiSurface = "activity-progress";
    overlay.setAttribute("role", "status");
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const title = document.createElement("h2");
    title.className = "bali-life-activity-progress-title";
    title.textContent = active.label;

    const subtitle = document.createElement("div");
    subtitle.className = "bali-life-activity-progress-subtitle";
    subtitle.textContent = `${active.venueName} | committed moment`;

    const track = document.createElement("div");
    track.className = "bali-life-activity-progress-track";
    const fill = document.createElement("div");
    fill.className = "bali-life-activity-progress-fill";
    track.appendChild(fill);

    const status = document.createElement("div");
    status.className = "bali-life-activity-progress-status";
    status.textContent = `Fast-forwarding 0/${active.durationMin} in-game minutes`;

    const minigame = this.createCommittedMinigameElement(active);

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "bali-life-activity-progress-cancel";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.cancelCommittedActivity();
    });

    overlay.append(title, subtitle, track, status);
    if (minigame) {
      overlay.appendChild(minigame);
    }
    overlay.appendChild(cancel);
    document.body.appendChild(overlay);
    this.committedActivityOverlay = overlay;
    this.committedActivityProgress = fill;
    this.committedActivityStatus = status;
  }

  private createCommittedMinigameElement(active: ActiveActivityState): HTMLElement | null {
    const minigame = active.minigame;
    if (!minigame || typeof document === "undefined") {
      return null;
    }

    const wrap = document.createElement("div");
    wrap.className = "bali-life-minigame";

    const title = document.createElement("div");
    title.className = "bali-life-minigame-title";
    title.textContent = minigame.title;

    const prompt = document.createElement("div");
    prompt.className = "bali-life-minigame-prompt";
    prompt.textContent = minigame.prompt;

    const feedback = document.createElement("div");
    feedback.className = "bali-life-minigame-feedback";
    feedback.textContent = minigame.feedback ?? "Optional skill beat. Ignore it for a steady result.";

    wrap.append(title, prompt);

    if (minigame.kind === "choice") {
      const choiceGrid = document.createElement("div");
      choiceGrid.className = "bali-life-minigame-choices";
      for (const choice of minigame.choices ?? []) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bali-life-minigame-choice";
        button.textContent = choice.label;
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.recordCommittedMinigameChoice(choice.id);
        });
        choiceGrid.appendChild(button);
      }
      wrap.appendChild(choiceGrid);
    } else {
      const lane = document.createElement("div");
      lane.className = "bali-life-minigame-lane";
      const target = document.createElement("div");
      target.className = "bali-life-minigame-target";
      target.style.left = `${Math.round(minigame.targetStart * 100)}%`;
      target.style.width = `${Math.round((minigame.targetEnd - minigame.targetStart) * 100)}%`;
      const marker = document.createElement("div");
      marker.className = "bali-life-minigame-marker";
      lane.append(target, marker);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "bali-life-minigame-action";
      button.textContent = minigame.actionLabel;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.recordCommittedMinigameTimingAttempt();
      });

      this.committedMinigameMarker = marker;
      wrap.append(lane, button);
    }

    wrap.appendChild(feedback);
    this.committedMinigameFeedback = feedback;
    this.updateCommittedMinigameUi();
    return wrap;
  }

  private destroyCommittedActivityOverlay(): void {
    this.committedActivityOverlay?.remove();
    this.committedActivityOverlay = undefined;
    this.committedActivityProgress = undefined;
    this.committedActivityStatus = undefined;
    this.committedMinigameMarker = undefined;
    this.committedMinigameFeedback = undefined;
  }

  private attendVenueEvent(event: GameEvent): void {
    if (!isEventActive(event, this.world.clock)) {
      this.showToast("That event is not active right now.");
      this.openVenueActivityMenu(event.locationVenueId);
      return;
    }

    if (event.crewSession && !getCrewState(this.world, event.crewSession.crewId).member) {
      this.showToast("Join the invited crew before attending its session.");
      return;
    }

    const occurrenceDay = this.world.clock.day;
    if (event.crewSession && hasCompletedCrewSessionOccurrence(this.world, event, occurrenceDay)) {
      this.showToast("This session already counted. Stay if you like; nothing else is owed.");
      return;
    }
    const cost = event.participation.cost ?? 0;
    if (cost > 0 && this.playerState.money < cost) {
      this.showToast(`Need Rp ${cost} for ${event.title}.`);
      return;
    }

    const crewBeat = prepareAriCrewSessionBeat(this.world, event) ?? prepareKitchenCircleSessionBeat(this.world, event);
    if (crewBeat) {
      if (crewBeat.kind === "sunset_circle") {
        this.soundManager.setAmbientBed("nightQuiet");
      }
      this.openStoryDialogue(crewBeat.speakerName, crewBeat.dialogue, undefined, () => {
        this.syncAmbientBed();
        this.completeVenueEventParticipation(event, occurrenceDay);
      });
      return;
    }

    this.completeVenueEventParticipation(event, occurrenceDay);
  }

  private completeVenueEventParticipation(event: GameEvent, occurrenceDay: number): void {
    const cost = event.participation.cost ?? 0;
    const participation = applyEventParticipation(this.world, event, this.getAbsoluteMinute());
    if (!participation.ok) {
      this.showToast(participation.message);
      return;
    }

    const intentResult = this.dispatchIntent({ kind: "AttendEvent", eventId: event.id });
    const crewResult = event.crewSession
      ? completeCrewSession(this.world, event, occurrenceDay, participation.completedAt)
      : undefined;
    const goalMessage = this.refreshSettlingInGoals(false);
    this.updateLighting();
    saveWorldState(this.world);

    const moneyCopy = cost < 0 ? `Rp ${Math.abs(cost)} earned` : cost > 0 ? `Rp ${cost} spent` : "free";
    const meterCopy = formatMeterDeltaSummary(this.world, participation.meterDeltas);
    const details = `${moneyCopy}${meterCopy ? ` | ${meterCopy}` : ""}`;
    const attendanceCopy = crewResult?.ok ? ` ${crewResult.message}` : "";
    const benefitCopy = participation.benefitMessage ? ` ${participation.benefitMessage}` : "";
    this.updateOpportunityFeed(0, true);
    this.showToast(
      goalMessage
        ? `${intentResult.message} ${details}.${attendanceCopy}${benefitCopy} ${goalMessage}`
        : `${intentResult.message} ${details}.${attendanceCopy}${benefitCopy}`
    );
    this.openVenueActivityMenu(event.locationVenueId);
  }

  private renderShopPanel(shop: ShopDefinition): void {
    this.closePanel(false);
    this.mode = "shop";
    const { width, height } = this.scale;
    const panelWidth = Math.min(760, width - 28);
    const panelHeight = Math.min(580, height - 44);
    const x = (width - panelWidth) / 2;
    const y = (height - panelHeight) / 2;
    const container = this.createZoomCompensatedContainer(UI_DEPTH + 10);
    const bg = this.add.graphics();
    bg.fillStyle(0x111820, 0.95);
    bg.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    bg.lineStyle(2, 0xf4d58d, 0.52);
    bg.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    container.add(bg);

    container.add(this.add.text(x + 22, y + 18, shop.name, this.panelTitleStyle()));
    container.add(
      this.add.text(x + 22, y + 52, `${shop.greeting}\nMoney: Rp ${this.playerState.money}`, {
        ...this.panelBodyStyle(),
        wordWrap: { width: panelWidth - 44 }
      })
    );

    let rowY = y + 118;
    container.add(this.add.text(x + 22, rowY, "Buy", this.panelSectionStyle()));
    rowY += 30;
    for (const itemId of getStructuralShopItemIds(this.world, shop)) {
      const item = itemDefinitions[itemId];
      const structuralOffer = getStructuralShopItemOffer(this.world, shop.id, itemId);
      const benefitCopy = structuralOffer.benefitLabel ? `  ·  ${structuralOffer.benefitLabel}` : "";
      const availabilityCopy = structuralOffer.available ? "" : `  ·  ${structuralOffer.reason ?? "Unavailable"}`;
      this.addPanelButton(container, x + 22, rowY, panelWidth - 44, 38, `${structuralOffer.displayName}  -  Rp ${structuralOffer.price}${benefitCopy}${availabilityCopy}`, () => {
        if (itemId === BIKE_RENTAL_ITEM_ID) {
          this.buyBikeRental(shop);
          return;
        }
        if (itemId === "focus_buffer_pastry") {
          const purchase = purchaseKadekFocusBufferPastry(this.world, this.getAbsoluteMinute());
          this.showToast(purchase.message);
          if (purchase.ok) {
            saveWorldState(this.world);
            this.phone?.refresh();
          }
          this.renderShopPanel(shop);
          return;
        }
        if (!structuralOffer.available) {
          this.showToast(structuralOffer.reason ?? "That item is unavailable.");
          return;
        }
        if (this.playerState.money < structuralOffer.price) {
          this.showToast("Not enough money.");
          return;
        }
        this.playerState.money -= structuralOffer.price;
        addItem(this.playerState, itemId, 1);
        this.dispatchIntent({
          kind: "RecordMemory",
          subjectType: "venue",
          subjectId: shop.id,
          memory: "bought_item",
          detail: item.name
        });
        this.showToast(`Bought ${item.name} for Rp ${structuralOffer.price}.${structuralOffer.benefitLabel ? ` ${structuralOffer.benefitLabel}.` : ""}`);
        saveWorldState(this.world);
        this.renderShopPanel(shop);
      });
      rowY += 44;
    }

    rowY += 12;
    container.add(this.add.text(x + 22, rowY, "Sell", this.panelSectionStyle()));
    rowY += 30;
    for (const itemId of shop.buys) {
      const item = itemDefinitions[itemId];
      const owned = getQuantity(this.playerState, itemId);
      this.addPanelButton(
        container,
        x + 22,
        rowY,
        panelWidth - 44,
        38,
        `${item.name} x${owned}  +  Rp ${item.sellPrice}`,
        () => {
          if (!removeItem(this.playerState, itemId, 1)) {
            this.showToast(`You do not have ${item.name}.`);
            return;
          }
          this.playerState.money += item.sellPrice;
          this.showToast(`Sold ${item.name}.`);
          saveWorldState(this.world);
          this.renderShopPanel(shop);
        },
        owned > 0 ? 0x253a35 : 0x2d3036
      );
      rowY += 44;
    }

    this.addPanelButton(container, x + panelWidth - 160, y + panelHeight - 54, 138, 36, "Close", () => this.closePanel(), 0x4a3331);
    this.panel = container;
  }

  private buyBikeRental(shop: ShopDefinition): void {
    const rental = itemDefinitions[BIKE_RENTAL_ITEM_ID];
    if (this.playerState.hasBike) {
      this.showToast("You already have a rented bike today.");
      return;
    }
    if (this.playerState.money < rental.buyPrice) {
      this.showToast(`Not enough money. You need Rp ${rental.buyPrice}.`);
      return;
    }

    this.playerState.money -= rental.buyPrice;
    this.playerState.hasBike = true;
    this.playerState.bikeStuck = false;
    this.setPlayerBikeMode(false);
    this.playerState.bikeCondition = 100;
    this.playerState.tutorialStep = "join_group";
    if (getQuantity(this.playerState, SCOOTER_KEY_ITEM_ID) === 0) {
      addItem(this.playerState, SCOOTER_KEY_ITEM_ID, 1);
    }
    this.dispatchIntent({
      kind: "RecordMemory",
      subjectType: "venue",
      subjectId: shop.id,
      memory: "bought_item",
      detail: rental.name
    });
    saveWorldState(this.world);
    this.showToast("Scooter rented. Berawa suddenly feels connected. Press B to park or ride.");
    this.renderShopPanel(shop);
  }

  private openActivity(activityId: string): void {
    const activity = activityDefinitions.find((candidate) => candidate.id === activityId);
    if (!activity) {
      return;
    }
    this.renderActivityPanel(activity);
  }

  private renderActivityPanel(activity: VenueActivityDefinition): void {
    this.closePanel(false);
    this.mode = "activity";
    this.destroyActivityMenuOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const group = activity.groupId ? interestGroupDefinitions[activity.groupId] : undefined;
    const joined = group ? this.playerState.joinedGroupIds.includes(group.id) : false;
    const matchingShop = Object.values(shopDefinitions).find((shop) => shop.name === activity.venueName);
    const costLine = activity.moneyCost > 0 ? `Cost: Rp ${activity.moneyCost}` : "Cost: free";
    const advancedMetersVisible = areAdvancedMetersVisible(this.world);
    const energyLine = advancedMetersVisible
      ? activity.socialEnergyDelta < 0
        ? `Social energy: ${activity.socialEnergyDelta}`
        : `Social energy: +${activity.socialEnergyDelta}`
      : "Rest cost: handled by Energy";
    const redemptionLine = activity.isRedemption
      ? `\nRepair: Rep +${activity.reputationReward ?? 0}  |  Wanted -${activity.wantedReduction ?? 0}  |  Bounty -Rp ${activity.bountyReduction ?? 0}`
      : "";

    const overlay = document.createElement("section");
    overlay.id = "bali-life-activity-menu";
    overlay.className = "bali-life-activity-menu";
    overlay.dataset.activityPanel = "true";
    overlay.dataset.uiSurface = "activity-panel";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", activity.title);
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("click", (event) => event.stopPropagation());

    const header = document.createElement("div");
    header.className = "bali-life-activity-menu-header";
    const title = document.createElement("h2");
    title.className = "bali-life-activity-menu-title";
    title.textContent = activity.title;
    const meta = document.createElement("div");
    meta.className = "bali-life-activity-menu-meta";
    meta.textContent = `${activity.venueName} | ${activity.schedule} | ${activity.tags.join(" / ")}`;
    header.append(title, meta);

    const content = document.createElement("div");
    content.className = "bali-life-activity-menu-content";
    this.appendActivityMenuRow(content, {
      title: "Plan",
      body: `${activity.description}\n${costLine}${
        advancedMetersVisible ? ` | Focus ${activity.focusReward >= 0 ? "+" : ""}${activity.focusReward}` : ""
      } | ${energyLine} | Links +${activity.connectionReward}${redemptionLine}`,
      actionLabel: "Do Activity",
      onAction: () => this.participateInActivity(activity)
    });

    if (group) {
      this.appendActivityMenuSection(content, "Interest Group");
      this.appendActivityMenuRow(content, {
        title: group.name,
        body: `${group.hook}\nVibe: ${group.vibe}`,
        actionLabel: joined ? "Group Joined" : "Join Group",
        onAction: () => this.joinInterestGroup(group.id, activity)
      });
    }

    if (matchingShop) {
      this.appendActivityMenuRow(content, {
        title: "Venue Shop",
        body: "Open this venue's buy/sell panel.",
        actionLabel: "Venue Shop",
        onAction: () => this.renderShopPanel(matchingShop)
      });
    }

    const footer = document.createElement("div");
    footer.className = "bali-life-activity-menu-footer";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "bali-life-activity-menu-button is-close";
    close.textContent = "Close";
    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.closePanel();
    });
    footer.appendChild(close);

    overlay.append(header, content, footer);
    document.body.appendChild(overlay);
    this.activityMenuOverlay = overlay;
  }

  private participateInActivity(activity: VenueActivityDefinition): void {
    if (this.playerState.money < activity.moneyCost) {
      this.showToast("Not enough money for that plan.");
      return;
    }

    if (
      areAdvancedMetersVisible(this.world) &&
      activity.socialEnergyDelta < 0 &&
      this.world.meters.social < Math.abs(activity.socialEnergyDelta)
    ) {
      this.showToast("Your social battery is too low. Try a calmer activity first.");
      return;
    }

    this.playerState.money -= activity.moneyCost;
    adjustPlayerMeters(this.world, { focus: activity.focusReward, social: activity.socialEnergyDelta });
    this.playerState.connections += activity.connectionReward;
    if (activity.reputationReward) {
      this.dispatchIntent({
        kind: "AdjustReputation",
        delta: activity.reputationReward,
        reason: activity.isRedemption ? `Redemption activity: ${activity.title}` : `Activity: ${activity.title}`
      });
    }
    if (activity.isRedemption) {
      this.dispatchIntent({ kind: "AwardReputationTag", tag: "community_contributor", reason: activity.title });
    }
    this.playerState.safety = Phaser.Math.Clamp(this.playerState.safety + (activity.safetyReward ?? 0), 0, 100);
    if (activity.wantedReduction || activity.bountyReduction) {
      reduceWantedStanding(
        this.world.reputation,
        activity.wantedReduction ?? 0,
        activity.bountyReduction ?? 0,
        `Redemption activity: ${activity.title}`,
        this.getAbsoluteMinute()
      );
    }
    for (const reward of activity.rewardItems) {
      addItem(this.playerState, reward.itemId, reward.quantity);
    }
    if (activity.groupId && !this.playerState.joinedGroupIds.includes(activity.groupId)) {
      this.playerState.joinedGroupIds.push(activity.groupId);
      this.playerState.connections += 1;
      this.startGroupTravel(activity.groupId, "walk", false);
    }
    saveWorldState(this.world);
    const repairCopy = activity.isRedemption ? " Trust repaired." : "";
    this.showToast(`You joined ${activity.title}. New links: ${this.playerState.connections}.${repairCopy}`);
    this.renderActivityPanel(activity);
  }

  private joinInterestGroup(groupId: string, activity?: VenueActivityDefinition): void {
    const group = interestGroupDefinitions[groupId];
    if (!group) {
      return;
    }
    if (!this.playerState.joinedGroupIds.includes(groupId)) {
      this.playerState.joinedGroupIds.push(groupId);
      this.playerState.connections += 1;
      this.showToast(`Joined ${group.name}.`);
      saveWorldState(this.world);
    }
    this.startGroupTravel(groupId, "walk", false);
    if (activity) {
      this.renderActivityPanel(activity);
    } else {
      this.openCommunityBoard();
    }
  }

  private startGroupTravel(groupId: string, mode: GroupTravelMode, announce = true): void {
    const group = interestGroupDefinitions[groupId];
    if (!group) {
      return;
    }
    if (!this.playerState.joinedGroupIds.includes(groupId)) {
      this.playerState.joinedGroupIds.push(groupId);
    }
    if (mode === "bike") {
      if (!this.playerState.hasBike) {
        this.showToast("Bike lines require everyone to have a bike. Rent yours first.");
        return;
      }
      if (this.playerState.bikeStuck) {
        this.showToast("Free the stuck bike before joining a ride line.");
        return;
      }
      const existingParty = this.getGroupTravelers();
      if (existingParty.length > 0 && !existingParty.every((traveler) => traveler.hasBike)) {
        this.showToast("Bike lines are blocked because someone in the party does not have a bike.");
        return;
      }
      if (!this.setPlayerBikeMode(true)) {
        this.showToast("Step back outside before mounting for a bike line.");
        return;
      }
    } else {
      this.setPlayerBikeMode(false);
    }

    this.clearGroupLine();
    this.playerState.activeGroupId = groupId;
    this.playerState.groupTravelMode = mode;
    if (this.playerState.tutorialStep === "join_group") {
      this.playerState.tutorialStep = "free_roam";
    }
    this.spawnGroupLine(groupId, mode);
    this.syncGroupWorldState();
    saveWorldState(this.world);
    if (announce) {
      this.showToast(`${group.name} formed a ${mode === "bike" ? "bike" : "walking"} line. Follow the leader.`);
    }
  }

  private spawnGroupLine(groupId: string, mode: GroupTravelMode): void {
    const start = this.clampToPlayableBounds(this.player.x + scaleDistance(92), this.player.y + scaleDistance(8), scaleDistance(80));
    const startX = start.x;
    const startY = start.y;
    const helperNames = ["Nina", "Gus", "Maya", "Leo"];
    const helperSprites = ["npc-made", "npc-kadek", "npc-sari", "npc-ari"];

    this.groupLeader = this.createGroupTraveler(`${groupId}-leader`, "Group lead", "npc-kadek", startX, startY, true, mode);
    this.groupFollowers = helperNames.map((name, index) =>
      this.createGroupTraveler(
        `${groupId}-helper-${index + 1}`,
        name,
        helperSprites[index % helperSprites.length],
        startX - (index + 1) * scaleDistance(38),
        startY + (index % 2 === 0 ? scaleDistance(18) : -scaleDistance(18)),
        true,
        mode
      )
    );
    this.groupRoute = this.getGroupRoute(groupId, startX, startY);
    this.groupRouteIndex = 0;
  }

  private createGroupTraveler(
    id: string,
    name: string,
    spriteKey: string,
    x: number,
    y: number,
    hasBike: boolean,
    mode: GroupTravelMode
  ): GroupTravelerRuntime {
    const bikeSprite = this.add.sprite(x, y + scaleDistance(10), "group-bike").setVisible(mode === "bike").setDepth(y - 1);
    const sprite = this.add.sprite(x, y, spriteKey).setDepth(y);
    this.setSpriteFacing(sprite, false, CHARACTER_SPRITE_SCALE);
    this.setSpriteFacing(bikeSprite, false, PLAYER_BIKE_SPRITE_SCALE);
    return { id, name, hasBike, sprite, bikeSprite };
  }

  private getGroupRoute(groupId: string, startX: number, startY: number): Phaser.Math.Vector2[] {
    const routes: Record<string, Array<[number, number]>> = {
      berawa_sweat_social: [
        [1768, 300],
        [1475, 430],
        [975, 817],
        [610, 742]
      ],
      sunset_table: [
        [975, 817],
        [650, 1110],
        [585, 1225],
        [975, 817]
      ],
      berawa_deep_work: [
        [975, 817],
        [1475, 430],
        [1768, 365],
        [1510, 820]
      ],
      brunch_builders: [
        [975, 817],
        [1190, 610],
        [1475, 430],
        [610, 742]
      ]
    };
    const route = routes[groupId] ?? [
      [975, 817],
      [1475, 430],
      [1768, 365],
      [1510, 820],
      [610, 742]
    ];
    return [new Phaser.Math.Vector2(startX, startY), ...route.map(([x, y]) => worldVector(x, y))];
  }

  private updateGroupLine(delta: number): void {
    if (!this.groupLeader || this.groupRoute.length === 0) {
      return;
    }
    const mode = this.playerState.groupTravelMode ?? "walk";
    const speed = mode === "bike" ? GROUP_BIKE_SPEED : GROUP_WALK_SPEED;
    const target = this.groupRoute[this.groupRouteIndex];
    const reached = this.moveTravelerToward(this.groupLeader, target.x, target.y, speed, delta, 0);
    if (reached) {
      this.groupRouteIndex = (this.groupRouteIndex + 1) % this.groupRoute.length;
    }

    const travelers = this.getGroupTravelers();
    const desiredGap = scaleDistance(mode === "bike" ? 58 : 42);
    for (let index = 1; index < travelers.length; index += 1) {
      const ahead = travelers[index - 1].sprite;
      this.moveTravelerToward(travelers[index], ahead.x, ahead.y, speed * 1.08, delta, desiredGap);
    }

    for (const traveler of travelers) {
      this.updateGroupTravelerVisual(traveler, mode);
    }
    this.syncGroupWorldState();
  }

  private moveTravelerToward(
    traveler: GroupTravelerRuntime,
    targetX: number,
    targetY: number,
    speed: number,
    delta: number,
    stopDistance: number
  ): boolean {
    const dx = targetX - traveler.sprite.x;
    const dy = targetY - traveler.sprite.y;
    const distance = Math.hypot(dx, dy);
    const arrivalDistance = Math.max(stopDistance, scaleDistance(5));
    if (distance <= arrivalDistance) {
      return true;
    }
    const step = Math.min(distance - stopDistance, (speed * delta) / 1000);
    traveler.sprite.x += (dx / distance) * step;
    traveler.sprite.y += (dy / distance) * step;
    this.setSpriteFacing(traveler.sprite, dx < -1, CHARACTER_SPRITE_SCALE);
    return distance - step <= arrivalDistance;
  }

  private updateGroupTravelerVisual(traveler: GroupTravelerRuntime, mode: GroupTravelMode): void {
    traveler.sprite.setDepth(traveler.sprite.y + 2);
    traveler.bikeSprite.setVisible(mode === "bike");
    traveler.bikeSprite.setPosition(traveler.sprite.x, traveler.sprite.y + scaleDistance(10));
    traveler.bikeSprite.setDepth(traveler.sprite.y + 1);
    this.setSpriteFacing(traveler.bikeSprite, traveler.sprite.scaleX < 0, PLAYER_BIKE_SPRITE_SCALE);
  }

  private getGroupTravelers(): GroupTravelerRuntime[] {
    return this.groupLeader ? [this.groupLeader, ...this.groupFollowers] : [];
  }

  private countGroupHelpers(): number {
    return this.getGroupTravelers().length;
  }

  private tryFreeBike(): void {
    if (isAct1ScooterBlown(this.world)) {
      this.showToast("Helpers cannot fix a blown transmission. Use the scooter counter repair.");
      return;
    }
    const helpers = this.countGroupHelpers();
    if (helpers < REQUIRED_BIKE_HELPERS) {
      this.showToast(`Need ${REQUIRED_BIKE_HELPERS} group helpers to drag it out. You have ${helpers}. Join a group first.`);
      return;
    }

    this.playerState.bikeStuck = false;
    this.setPlayerBikeMode(true);
    this.playerState.bikeCondition = Phaser.Math.Clamp(this.playerState.bikeCondition + 8, 1, 100);
    this.playerState.tutorialStep = "free_roam";
    this.syncGroupWorldState("traveling");
    saveWorldState(this.world);
    this.showToast("The group hauled the bike out. Mud lesson learned.");
  }

  private syncGroupWorldState(status: "idle" | "traveling" | "stuck-recovery" = "traveling"): void {
    if (!this.groupLeader || !this.playerState.activeGroupId || !this.playerState.groupTravelMode) {
      return;
    }
    const stateId = `local-${this.playerState.activeGroupId}`;
    this.world.groups[stateId] = {
      id: stateId,
      groupDefinitionId: this.playerState.activeGroupId,
      leaderId: this.groupLeader.id,
      memberIds: [this.playerState.id, ...this.getGroupTravelers().map((traveler) => traveler.id)],
      travelMode: this.playerState.groupTravelMode,
      status: this.playerState.bikeStuck ? "stuck-recovery" : status,
      requiresBike: this.playerState.groupTravelMode === "bike",
      x: Math.round(this.groupLeader.sprite.x),
      y: Math.round(this.groupLeader.sprite.y)
    };
  }

  private clearGroupLine(): void {
    for (const traveler of this.getGroupTravelers()) {
      traveler.sprite.destroy();
      traveler.bikeSprite.destroy();
    }
    this.groupLeader = undefined;
    this.groupFollowers = [];
    this.groupRoute = [];
    this.groupRouteIndex = 0;
  }

  private openCommunityBoard(): void {
    this.closePanel(false);
    this.mode = "community";
    const { width, height } = this.scale;
    const panelWidth = Math.min(820, width - 28);
    const panelHeight = Math.min(660, height - 44);
    const x = (width - panelWidth) / 2;
    const y = (height - panelHeight) / 2;
    const container = this.createZoomCompensatedContainer(UI_DEPTH + 10);
    const bg = this.add.graphics();
    bg.fillStyle(0x111820, 0.96);
    bg.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    bg.lineStyle(2, 0xf4d58d, 0.52);
    bg.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    container.add(bg);

    container.add(this.add.text(x + 22, y + 18, "Berawa Community Board", this.panelTitleStyle()));
    container.add(
      this.add.text(
        x + 22,
        y + 56,
        `Links ${this.playerState.connections}  |  Rep ${getReputationScore(this.world.reputation)}  |  Wanted ${getWantedLevel(this.world.reputation)}  |  ${this.getBikeStatusLabel()}\nSeeded groups today. Later this can become a live event/group feed.`,
        {
          ...this.panelBodyStyle(),
          wordWrap: { width: panelWidth - 44 }
        }
      )
    );

    let rowY = y + 122;
    for (const group of Object.values(interestGroupDefinitions)) {
      const joined = this.playerState.joinedGroupIds.includes(group.id);
      const rowHeight = panelWidth < 520 ? 82 : 68;
      const rowBg = this.add.graphics();
      rowBg.fillStyle(joined ? 0x253a35 : 0x1d2832, 0.95);
      rowBg.fillRoundedRect(x + 18, rowY, panelWidth - 36, rowHeight, 6);
      rowBg.lineStyle(1, 0xf4d58d, joined ? 0.34 : 0.16);
      rowBg.strokeRoundedRect(x + 18, rowY, panelWidth - 36, rowHeight, 6);
      container.add(rowBg);
      container.add(
        this.add.text(x + 32, rowY + 10, `${joined ? "Joined: " : ""}${group.name} @ ${group.venueName}`, {
          ...this.panelSectionStyle(),
          wordWrap: { width: panelWidth - 190 }
        })
      );
      container.add(
        this.add.text(x + 32, rowY + 34, `${group.hook} (${group.tags.join(" / ")})`, {
          ...this.panelHintStyle(),
          wordWrap: { width: panelWidth - 190 }
        })
      );
      this.addPanelButton(
        container,
        x + panelWidth - 146,
        rowY + 16,
        112,
        34,
        joined ? "Joined" : "Join",
        () => this.joinInterestGroup(group.id),
        joined ? 0x2d3036 : 0x253a47
      );
      rowY += rowHeight + 8;
      if (rowY > y + panelHeight - 90) {
        break;
      }
    }

    const activeGroupId = this.playerState.activeGroupId ?? this.playerState.joinedGroupIds[0];
    if (activeGroupId) {
      const compactButtons = panelWidth < 560;
      const actionY = compactButtons ? y + panelHeight - 94 : y + panelHeight - 54;
      const actionWidth = compactButtons ? Math.max(112, (panelWidth - 58) / 2) : 132;
      this.addPanelButton(
        container,
        x + 22,
        actionY,
        actionWidth,
        36,
        "Walk Line",
        () => {
          this.closePanel();
          this.startGroupTravel(activeGroupId, "walk");
          this.openCommunityBoard();
        },
        0x253a35
      );
      this.addPanelButton(
        container,
        x + 30 + actionWidth,
        actionY,
        actionWidth,
        36,
        "Bike Line",
        () => {
          this.closePanel();
          this.startGroupTravel(activeGroupId, "bike");
          this.openCommunityBoard();
        },
        0x253a47
      );
    }

    this.addPanelButton(container, x + panelWidth - 160, y + panelHeight - 54, 138, 36, "Close", () => this.closePanel(), 0x4a3331);
    this.panel = container;
  }

  private openInventory(): void {
    this.closePanel(false);
    this.mode = "inventory";
    const { width, height } = this.scale;
    const panelWidth = Math.min(700, width - 28);
    const panelHeight = Math.min(560, height - 44);
    const x = (width - panelWidth) / 2;
    const y = (height - panelHeight) / 2;
    const container = this.createZoomCompensatedContainer(UI_DEPTH + 10);
    const bg = this.add.graphics();
    bg.fillStyle(0x111820, 0.95);
    bg.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    bg.lineStyle(2, 0xf4d58d, 0.52);
    bg.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    container.add(bg);
    container.add(this.add.text(x + 22, y + 18, "Bag", this.panelTitleStyle()));
    container.add(
      this.add.text(
        x + 22,
        y + 56,
        `Money: Rp ${this.playerState.money}  |  ${formatVisibleMeterValues(this.world)}\nRep ${getReputationScore(this.world.reputation)}  |  Wanted ${getWantedLevel(this.world.reputation)}  |  Bounty Rp ${getBounty(this.world.reputation)}  |  ${this.getBikeStatusLabel()}`,
        {
          ...this.panelBodyStyle(),
          wordWrap: { width: panelWidth - 44 }
        }
      )
    );

    const inventoryLines = formatInventory(this.playerState.inventory)
      .map((line) => `- ${line}`)
      .join("\n");
    container.add(
      this.add.text(x + 22, y + 112, inventoryLines, {
        ...this.panelBodyStyle(),
        wordWrap: { width: panelWidth - 44 }
      })
    );

    const questLines = [
      ...this.playerState.activeQuestIds.map((questId) => `Active: ${questDefinitions[questId]?.title ?? questId}`),
      ...this.playerState.completedQuestIds.map((questId) => `Done: ${questDefinitions[questId]?.title ?? questId}`)
    ];
    const joinedGroupLines = this.playerState.joinedGroupIds.map(
      (groupId) => `Group: ${interestGroupDefinitions[groupId]?.name ?? groupId}`
    );
    container.add(this.add.text(x + 22, y + panelHeight - 172, "Quests & Groups", this.panelSectionStyle()));
    container.add(
      this.add.text(x + 22, y + panelHeight - 140, [...questLines, ...joinedGroupLines].length ? [...questLines, ...joinedGroupLines].join("\n") : "No quests or groups yet.", {
        ...this.panelBodyStyle(),
        wordWrap: { width: panelWidth - 44 }
      })
    );

    this.addPanelButton(container, x + panelWidth - 306, y + panelHeight - 54, 138, 36, "Save", () => this.saveGame(), 0x253a35);
    this.addPanelButton(container, x + panelWidth - 160, y + panelHeight - 54, 138, 36, "Close", () => this.closePanel(), 0x4a3331);
    this.panel = container;
  }

  private closePanel(setWorldMode = true): void {
    const continuation = this.pendingDialogueContinuation;
    this.pendingDialogueContinuation = undefined;
    this.panel?.destroy(true);
    this.panel = undefined;
    this.awaitingRelationshipChoice = false;
    this.activeRelationshipChoiceScene = undefined;
    this.destroyDialogueOverlay();
    this.destroyActivityMenuOverlay();
    if (setWorldMode) {
      this.mode = this.activeInteriorId ? "interior" : "world";
    }
    continuation?.();
  }

  private openFirstRunHint(): void {
    if (this.world.questFlags.firstRunHintSeen) {
      return;
    }
    this.act0FirstRunGateSessionActive = shouldStartAct0FirstRunGate(this.world);
    this.showMovementTutorialPrompt = true;
    this.world.questFlags.firstRunHintSeen = true;
    saveWorldState(this.world);
    const copy = getAct0ColdOpenCopy();
    this.openDialogue(copy.title, copy.body);
  }

  private updateMapDiscovery(initial = false, persist = true): void {
    const discovery = this.world.mapDiscovery;
    let changed = false;
    const newVenueNames: string[] = [];

    for (const area of berawaAreas) {
      if (discovery.revealAll || Phaser.Math.Distance.Between(this.player.x, this.player.y, area.x, area.y) <= area.radius) {
        changed = this.addDiscoveredId(discovery.discoveredAreaIds, area.id) || changed;
      }
    }

    const venues = new Map(getAllVenues().map((venue) => [venue.id, venue.name]));
    for (const node of curatedVenueNodes) {
      venues.set(node.venueId, node.name);
    }
    for (const node of venueMapNodes) {
      if (discovery.revealAll || Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y) <= node.radius) {
        const wasAdded = this.addDiscoveredId(discovery.discoveredVenueIds, node.venueId);
        changed = wasAdded || changed;
        if (wasAdded) {
          newVenueNames.push(venues.get(node.venueId) ?? node.venueId);
        }
      }
    }

    if (changed || initial) {
      this.updateDiscoveryLabelVisibility();
    }
    if (changed) {
      if (persist) {
        saveWorldState(this.world);
      }
      if (!initial && newVenueNames.length > 0 && this.discoveryToastCooldown <= 0) {
        this.discoveryToastCooldown = 2600;
        this.showToast(`Map updated: ${newVenueNames[0]} discovered.`);
      }
    }
  }

  private addDiscoveredId(ids: string[], id: string): boolean {
    if (ids.includes(id)) {
      return false;
    }
    ids.push(id);
    return true;
  }

  private revealAllMapDiscovery(): void {
    this.world.mapDiscovery.revealAll = true;
    for (const area of berawaAreas) {
      this.addDiscoveredId(this.world.mapDiscovery.discoveredAreaIds, area.id);
    }
    for (const node of venueMapNodes) {
      this.addDiscoveredId(this.world.mapDiscovery.discoveredVenueIds, node.venueId);
    }
    this.updateDiscoveryLabelVisibility();
    saveWorldState(this.world);
  }

  private updateDiscoveryLabelVisibility(): void {
    const discovery = this.world.mapDiscovery;
    const venueCandidates: Array<{ entry: { subjectType: "area" | "venue"; id: string; label: Phaser.GameObjects.Text }; distance: number }> = [];
    for (const entry of this.discoveryLabels) {
      const discovered =
        discovery.revealAll ||
        (entry.subjectType === "area"
          ? discovery.discoveredAreaIds.includes(entry.id)
          : discovery.discoveredVenueIds.includes(entry.id));
      if (!discovered) {
        entry.label.setVisible(false);
        continue;
      }

      if (entry.subjectType === "area") {
        entry.label.setVisible(true);
        continue;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.label.x, entry.label.y);
      entry.label.setVisible(false);
      if (distance <= VENUE_LABEL_NEAR_RADIUS) {
        venueCandidates.push({ entry, distance });
      }
    }

    const shown: Phaser.GameObjects.Text[] = [];
    venueCandidates.sort((a, b) => a.distance - b.distance);
    for (const candidate of venueCandidates) {
      if (shown.length >= MAX_VISIBLE_VENUE_LABELS) {
        break;
      }
      const stacks = shown.some(
        (label) => Phaser.Math.Distance.Between(label.x, label.y, candidate.entry.label.x, candidate.entry.label.y) < VENUE_LABEL_STACK_DISTANCE
      );
      if (stacks) {
        continue;
      }
      candidate.entry.label.setVisible(true);
      shown.push(candidate.entry.label);
    }
  }

  private updateStreetSignVisibility(): void {
    const maxDistance = scaleDistance(250);
    const visibleIds = new Set(
      selectVisibleStreetSignIds(
        this.streetSigns.map(({ venueId, label }) => ({ venueId, x: label.x, y: label.y })),
        this.player,
        3,
        maxDistance
      )
    );
    for (const { venueId, label } of this.streetSigns) {
      const visible = visibleIds.has(venueId) && !this.activeInteriorId;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, label.x, label.y);
      label.setVisible(visible);
      label.setAlpha(visible ? Phaser.Math.Clamp(1 - distance / maxDistance, 0.48, 1) : 0);
    }
  }

  private getOpportunityTemplateSafe(templateId: string) {
    return getOpportunityTemplate(templateId);
  }

  private opportunityPalette(type: OpportunityType): { fill: number; icon: number } {
    if (type === "gig") return { fill: 0x2f7dd1, icon: 0xfff8df };
    if (type === "social") return { fill: 0xd95c8a, icon: 0xfff8df };
    if (type === "help_out") return { fill: 0x3aa66f, icon: 0xfff8df };
    if (type === "flash_deal") return { fill: 0xe0a928, icon: 0x1b2430 };
    if (type === "rumor") return { fill: 0x8b68d8, icon: 0xfff8df };
    return { fill: 0x43a6a8, icon: 0x101820 };
  }

  private drawOpportunityIcon(g: Phaser.GameObjects.Graphics, x: number, y: number, type: OpportunityType, color: number): void {
    const s = scaleDistance(1);
    g.fillStyle(color, 0.98);
    g.lineStyle(Math.max(1, scaleDistance(2)), color, 0.98);
    if (type === "gig") {
      g.fillRect(x - 5 * s, y - 5 * s, 10 * s, 10 * s);
    } else if (type === "social") {
      g.fillCircle(x - 4 * s, y - 2 * s, 4 * s);
      g.fillCircle(x + 4 * s, y - 2 * s, 4 * s);
      g.fillTriangle(x - 8 * s, y, x + 8 * s, y, x, y + 8 * s);
    } else if (type === "help_out") {
      g.fillRect(x - 2 * s, y - 8 * s, 4 * s, 16 * s);
      g.fillRect(x - 8 * s, y - 2 * s, 16 * s, 4 * s);
    } else if (type === "flash_deal") {
      g.fillTriangle(x - 7 * s, y - 1 * s, x + 2 * s, y - 9 * s, x - 1 * s, y - 1 * s);
      g.fillTriangle(x + 7 * s, y + 1 * s, x - 2 * s, y + 9 * s, x + 1 * s, y + 1 * s);
    } else if (type === "rumor") {
      g.strokeCircle(x, y - 2 * s, 6 * s);
      g.fillCircle(x, y + 8 * s, 2 * s);
    } else {
      g.beginPath();
      g.moveTo(x - 8 * s, y - 2 * s);
      g.lineTo(x + 6 * s, y - 2 * s);
      g.strokePath();
      g.fillTriangle(x + 6 * s, y - 7 * s, x + 12 * s, y - 2 * s, x + 6 * s, y + 3 * s);
      g.beginPath();
      g.moveTo(x + 8 * s, y + 4 * s);
      g.lineTo(x - 6 * s, y + 4 * s);
      g.strokePath();
      g.fillTriangle(x - 6 * s, y - 1 * s, x - 12 * s, y + 4 * s, x - 6 * s, y + 9 * s);
    }
  }

  private drawOpportunityMarkers(): void {
    if (!this.opportunityMarkerLayer) {
      return;
    }
    this.opportunityMarkerLayer.clear();
    for (const zone of this.opportunityMarkerZones) {
      zone.destroy();
    }
    this.opportunityMarkerZones = [];

    for (const opportunity of this.world.opportunities.live) {
      const node = resolveWorldSceneVenueAnchor(opportunity.locationVenueId);
      const template = opportunity.templateId ? this.getOpportunityTemplateSafe(opportunity.templateId) : undefined;
      if (!node || !template) {
        continue;
      }
      const tracked = this.world.opportunities.trackedOpportunityId === opportunity.id;
      const markerX = node.x;
      const markerY = node.y - Math.min(node.radius + scaleDistance(28), scaleDistance(86));
      const palette = this.opportunityPalette(template.type);
      const radius = tracked ? scaleDistance(18) : scaleDistance(15);

      this.opportunityMarkerLayer.fillStyle(0x101820, 0.72);
      this.opportunityMarkerLayer.fillCircle(markerX, markerY + scaleDistance(3), radius + scaleDistance(4));
      this.opportunityMarkerLayer.fillStyle(palette.fill, 0.96);
      this.opportunityMarkerLayer.fillCircle(markerX, markerY, radius);
      this.opportunityMarkerLayer.lineStyle(tracked ? scaleDistance(4) : scaleDistance(2), 0xfff0bd, tracked ? 0.95 : 0.65);
      this.opportunityMarkerLayer.strokeCircle(markerX, markerY, radius);
      this.opportunityMarkerLayer.fillTriangle(
        markerX - scaleDistance(6),
        markerY + radius - scaleDistance(2),
        markerX + scaleDistance(6),
        markerY + radius - scaleDistance(2),
        markerX,
        markerY + radius + scaleDistance(12)
      );
      this.drawOpportunityIcon(this.opportunityMarkerLayer, markerX, markerY, template.type, palette.icon);

      if (!this.world.opportunities.trackedOpportunityId && Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y) < node.radius + scaleDistance(64)) {
        this.world.opportunities.trackedOpportunityId = opportunity.id;
      }

      const zone = this.add.zone(markerX, markerY, scaleDistance(46), scaleDistance(46)).setDepth(211);
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerdown", (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Phaser.Types.Input.EventData) => {
        event?.stopPropagation();
        this.trackPhoneOpportunity(opportunity.id);
      });
      this.opportunityMarkerZones.push(zone);
    }
  }

  private drawRivalRaceMarkers(): void {
    if (!this.rivalRaceMarkerLayer) {
      return;
    }
    this.rivalRaceMarkerLayer.clear();
    const race = this.activeRivalRace;
    if (!race) {
      return;
    }
    race.config.route.forEach((point, index) => {
      if (index === 0) {
        return;
      }
      const isNext = index === race.checkpointIndex;
      const reached = index < race.checkpointIndex;
      const radius = scaleDistance(isNext ? 24 : 16);
      this.rivalRaceMarkerLayer.fillStyle(0x101820, reached ? 0.26 : 0.62);
      this.rivalRaceMarkerLayer.fillCircle(point.x, point.y, radius + scaleDistance(5));
      this.rivalRaceMarkerLayer.lineStyle(scaleDistance(isNext ? 4 : 2), isNext ? 0xfff0bd : 0xff5d5d, isNext ? 0.95 : 0.5);
      this.rivalRaceMarkerLayer.strokeCircle(point.x, point.y, radius);
      this.rivalRaceMarkerLayer.fillStyle(reached ? 0x62c48f : isNext ? 0xfff0bd : 0xff5d5d, reached ? 0.72 : 0.92);
      this.rivalRaceMarkerLayer.fillCircle(point.x, point.y, scaleDistance(isNext ? 8 : 5));
      if (isNext) {
        this.rivalRaceMarkerLayer.lineStyle(scaleDistance(2), 0xfff0bd, 0.82);
        this.rivalRaceMarkerLayer.lineBetween(point.x - scaleDistance(16), point.y - scaleDistance(28), point.x - scaleDistance(16), point.y + scaleDistance(8));
        this.rivalRaceMarkerLayer.fillTriangle(
          point.x - scaleDistance(16),
          point.y - scaleDistance(28),
          point.x + scaleDistance(12),
          point.y - scaleDistance(20),
          point.x - scaleDistance(16),
          point.y - scaleDistance(12)
        );
      }
    });
  }

  private drawWorldInteractionScenes(): void {
    if (!this.worldSceneLayer) {
      return;
    }
    this.worldSceneLayer.clear();
    const activeLabelIds = new Set<string>();
    const phase = Date.now() / 1000;

    for (const scene of getOpportunityWorldScenes(this.world)) {
      const node = resolveWorldSceneVenueAnchor(scene.venueId);
      if (!node) {
        continue;
      }
      const yOffset = Math.min(node.radius + scaleDistance(24), scaleDistance(92));
      const x = node.x;
      const y = node.y - yOffset;
      this.drawOpportunityWorldScene(scene, x, y, phase, activeLabelIds);
    }

    for (const scene of getRivalRaceWorldScenes(this.world)) {
      const node = resolveWorldSceneVenueAnchor(scene.venueId);
      if (!node) {
        continue;
      }
      const yOffset = Math.min(node.radius + scaleDistance(24), scaleDistance(92));
      this.drawOpportunityWorldScene(scene, node.x, node.y - yOffset, phase, activeLabelIds);
    }
    for (const scene of getAct1IncitingHookWorldScenes(this.world)) {
      const node = resolveWorldSceneVenueAnchor(scene.venueId);
      if (!node) continue;
      this.drawOpportunityWorldScene(scene, node.x, node.y - scaleDistance(58), phase, activeLabelIds);
    }
    for (const scene of getMadeRoomOfferWorldScenes(this.world)) {
      const node = resolveWorldSceneVenueAnchor(scene.venueId);
      if (!node) continue;
      this.drawOpportunityWorldScene(scene, node.x, node.y - scaleDistance(58), phase, activeLabelIds);
    }

    for (const scene of getEventWorldScenes(this.world)) {
      const node = resolveWorldSceneVenueAnchor(scene.venueId);
      if (!node) {
        continue;
      }
      const yOffset = Math.min(node.radius + scaleDistance(66), scaleDistance(136));
      const x = node.x + scaleDistance(44);
      const y = scene.crewId ? node.y - scaleDistance(6) : node.y - yOffset;
      this.drawEventWorldScene(scene, x, y, phase, activeLabelIds);
    }

    this.drawKitchenCircleInteriorScene(phase);

    for (const [id, label] of this.worldSceneLabels) {
      if (!activeLabelIds.has(id)) {
        label.setVisible(false);
      }
    }
  }

  private drawKitchenCircleInteriorScene(phase: number): void {
    if (this.activeInteriorId !== "warung_sari_interior") return;
    const event = getActiveEventsAtVenue(this.world.clock, "canggu_station", this.world).find(isKitchenCircleSessionEvent);
    if (!event) return;

    const interior = interiorDefinitions.warung_sari_interior;
    const { x, y } = interior.origin;
    const steamAlpha = 0.34 + Math.sin(phase * 3.2) * 0.08;

    for (const [index, steamX] of [2.2, 5.5, 8.9].entries()) {
      const drift = Math.sin(phase * 2.2 + index) * TILE_SIZE * 0.08;
      this.worldSceneLayer.lineStyle(2, 0xfff8df, steamAlpha);
      this.worldSceneLayer.beginPath();
      this.worldSceneLayer.moveTo(x + TILE_SIZE * steamX, y + TILE_SIZE * 2.05);
      this.worldSceneLayer.lineTo(x + TILE_SIZE * steamX + drift, y + TILE_SIZE * 1.76);
      this.worldSceneLayer.lineTo(x + TILE_SIZE * steamX - drift, y + TILE_SIZE * 1.55);
      this.worldSceneLayer.lineTo(x + TILE_SIZE * steamX + drift, y + TILE_SIZE * 1.3);
      this.worldSceneLayer.strokePath();
    }

    for (const plateX of [3.9, 4.45, 5, 5.55, 6.1]) {
      this.worldSceneLayer.fillStyle(0xfff8df, 0.9);
      this.worldSceneLayer.fillEllipse(x + TILE_SIZE * plateX, y + TILE_SIZE * 2.52, TILE_SIZE * 0.42, TILE_SIZE * 0.13);
      this.worldSceneLayer.lineStyle(1, 0xc99b62, 0.82);
      this.worldSceneLayer.strokeEllipse(x + TILE_SIZE * plateX, y + TILE_SIZE * 2.52, TILE_SIZE * 0.42, TILE_SIZE * 0.13);
    }

    const squeezeInProgress = hasSeenKitchenCircleSqueeze(this.world) &&
      !hasCompletedCrewSessionOccurrence(this.world, event, this.world.clock.day);
    if (squeezeInProgress) {
      const phoneX = x + TILE_SIZE * 7.45;
      const phoneY = y + TILE_SIZE * 2.03;
      this.worldSceneLayer.fillStyle(0x26313c, 0.98);
      this.worldSceneLayer.fillRoundedRect(phoneX, phoneY, TILE_SIZE * 0.22, TILE_SIZE * 0.38, 3);
      this.worldSceneLayer.fillStyle(0x91b7dd, 0.92);
      this.worldSceneLayer.fillRoundedRect(phoneX + 2, phoneY + 2, TILE_SIZE * 0.16, TILE_SIZE * 0.24, 2);
      this.worldSceneLayer.lineStyle(2, 0xffc6a6, 0.56 + Math.sin(phase * 7) * 0.16);
      this.worldSceneLayer.arc(phoneX + TILE_SIZE * 0.11, phoneY - TILE_SIZE * 0.04, TILE_SIZE * 0.18, Math.PI * 1.15, Math.PI * 1.85);
      this.worldSceneLayer.strokePath();
    }
  }

  private drawOpportunityWorldScene(scene: OpportunityWorldScene, x: number, y: number, phase: number, activeLabelIds: Set<string>): void {
    const palette = this.opportunityPalette(scene.opportunityType);
    const pulse = 0.72 + Math.sin(phase * 4) * 0.12;
    this.worldSceneLayer.fillStyle(0x101820, 0.28);
    this.worldSceneLayer.fillEllipse(x, y + scaleDistance(25), scaleDistance(88), scaleDistance(24));
    this.worldSceneLayer.lineStyle(scaleDistance(2), palette.fill, 0.28 + pulse * 0.22);
    this.worldSceneLayer.strokeEllipse(x, y + scaleDistance(25), scaleDistance(96), scaleDistance(30));

    if (scene.sceneKind === "deal_signal") {
      this.drawWorldSceneDealSignal(scene, x, y, phase, activeLabelIds, palette.fill);
      return;
    }

    if (scene.sceneKind === "social_gathering") {
      this.drawWorldSceneGathering(scene, x, y, phase, activeLabelIds, palette.fill);
      return;
    }

    if (scene.sceneKind === "shady_package") {
      this.drawWorldSceneActors(scene.actors, x - scaleDistance(18), y, phase, 1);
      this.worldSceneLayer.fillStyle(0x231917, 0.92);
      this.worldSceneLayer.fillRoundedRect(x + scaleDistance(2), y + scaleDistance(6), scaleDistance(34), scaleDistance(22), scaleDistance(4));
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), 0xffc6a6, 0.82 + Math.sin(phase * 5) * 0.08);
      this.worldSceneLayer.strokeRoundedRect(x + scaleDistance(2), y + scaleDistance(6), scaleDistance(34), scaleDistance(22), scaleDistance(4));
      this.worldSceneLayer.fillStyle(0xffc6a6, 0.86);
      this.worldSceneLayer.fillCircle(x + scaleDistance(28), y + scaleDistance(13), scaleDistance(3));
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(1)), 0xffc6a6, 0.52);
      this.worldSceneLayer.lineBetween(x + scaleDistance(8), y + scaleDistance(17), x + scaleDistance(22), y + scaleDistance(17));
      this.drawWorldSceneSign(scene, x, y - scaleDistance(26), activeLabelIds, 0xffc6a6);
      return;
    }

    if (scene.sceneKind === "race_challenge") {
      this.drawWorldSceneActors(scene.actors, x - scaleDistance(24), y, phase, 1);
      const flagX = x + scaleDistance(18);
      const flagY = y + scaleDistance(4);
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), 0xfff0bd, 0.9);
      this.worldSceneLayer.lineBetween(flagX, flagY - scaleDistance(26), flagX, flagY + scaleDistance(24));
      for (let index = 0; index < 3; index += 1) {
        this.worldSceneLayer.fillStyle(index % 2 === 0 ? 0xfff0bd : 0x101820, 0.95);
        this.worldSceneLayer.fillRect(flagX, flagY - scaleDistance(26) + index * scaleDistance(7), scaleDistance(22), scaleDistance(7));
      }
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), 0xff5d5d, 0.72 + Math.sin(phase * 7) * 0.14);
      this.worldSceneLayer.strokeCircle(x + scaleDistance(14), y + scaleDistance(18), scaleDistance(24));
      this.drawWorldSceneSign(scene, x, y - scaleDistance(30), activeLabelIds, 0xff5d5d);
      return;
    }

    if (scene.sceneKind === "help_distress") {
      this.drawWorldSceneActors(scene.actors, x, y, phase, 1);
      this.drawWorldSceneSign(scene, x, y - scaleDistance(22), activeLabelIds, 0xffc6a6);
      this.worldSceneLayer.lineStyle(scaleDistance(2), 0xffc6a6, 0.7 + Math.sin(phase * 8) * 0.18);
      this.worldSceneLayer.strokeCircle(x + scaleDistance(22), y - scaleDistance(12), scaleDistance(14));
      return;
    }

    this.drawWorldSceneActors(scene.actors, x, y, phase, 1);
    this.drawWorldSceneSign(scene, x, y - scaleDistance(24), activeLabelIds, palette.fill);
  }

  private drawEventWorldScene(scene: EventWorldScene, x: number, y: number, phase: number, activeLabelIds: Set<string>): void {
    const color = this.eventSceneColor(scene.sceneKind);
    const pulse = 0.62 + Math.sin(phase * (scene.clubId || scene.crewId ? 5.2 : 3.6)) * 0.18;
    this.worldSceneLayer.fillStyle(0x101820, 0.24);
    this.worldSceneLayer.fillEllipse(x, y + scaleDistance(28), scaleDistance(104), scaleDistance(28));
    this.worldSceneLayer.lineStyle(scaleDistance(scene.clubId || scene.crewId ? 3 : 2), color, 0.34 + pulse * 0.26);
    this.worldSceneLayer.strokeEllipse(x, y + scaleDistance(28), scaleDistance(112), scaleDistance(36));

    if (scene.sceneKind === "crew_sunset_circle") {
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(4)), 0x89542f, 0.92);
      this.worldSceneLayer.lineBetween(x - scaleDistance(12), y + scaleDistance(21), x + scaleDistance(12), y + scaleDistance(31));
      this.worldSceneLayer.lineBetween(x + scaleDistance(12), y + scaleDistance(21), x - scaleDistance(12), y + scaleDistance(31));
      this.worldSceneLayer.fillStyle(0xff8a3d, 0.82 + Math.sin(phase * 8) * 0.08);
      this.worldSceneLayer.fillCircle(x, y + scaleDistance(19), scaleDistance(9));
      this.worldSceneLayer.fillStyle(0xffd45c, 0.9);
      this.worldSceneLayer.fillCircle(x, y + scaleDistance(16), scaleDistance(5));
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(5)), 0x79b7c5, 0.86);
      this.worldSceneLayer.lineBetween(x - scaleDistance(66), y - scaleDistance(10), x - scaleDistance(50), y + scaleDistance(29));
      this.worldSceneLayer.lineBetween(x + scaleDistance(64), y - scaleDistance(11), x + scaleDistance(49), y + scaleDistance(29));
      this.worldSceneLayer.fillStyle(0x26313c, 0.95);
      this.worldSceneLayer.fillRoundedRect(x + scaleDistance(31), y + scaleDistance(20), scaleDistance(23), scaleDistance(8), scaleDistance(2));
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(1)), 0x91b7dd, 0.76);
      this.worldSceneLayer.lineBetween(x + scaleDistance(33), y + scaleDistance(20), x + scaleDistance(52), y + scaleDistance(20));
    } else if (scene.sceneKind === "crew_beach_run") {
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(3)), color, 0.78);
      this.worldSceneLayer.beginPath();
      this.worldSceneLayer.moveTo(x - scaleDistance(70), y + scaleDistance(28));
      this.worldSceneLayer.lineTo(x - scaleDistance(20), y + scaleDistance(16));
      this.worldSceneLayer.lineTo(x + scaleDistance(28), y + scaleDistance(29));
      this.worldSceneLayer.lineTo(x + scaleDistance(72), y + scaleDistance(17));
      this.worldSceneLayer.strokePath();
      for (const markerX of [-72, 72]) {
        this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), 0xfff0bd, 0.9);
        this.worldSceneLayer.lineBetween(x + scaleDistance(markerX), y + scaleDistance(7), x + scaleDistance(markerX), y + scaleDistance(31));
        this.worldSceneLayer.fillStyle(0xff8a3d, 0.9);
        this.worldSceneLayer.fillTriangle(
          x + scaleDistance(markerX), y + scaleDistance(7),
          x + scaleDistance(markerX + 12), y + scaleDistance(12),
          x + scaleDistance(markerX), y + scaleDistance(16)
        );
      }
    } else if (scene.sceneKind === "crew_kitchen_door") {
      this.worldSceneLayer.fillStyle(0xfff8df, 0.9);
      for (const plateX of [-24, 0, 24]) {
        this.worldSceneLayer.fillEllipse(x + scaleDistance(plateX), y + scaleDistance(20), scaleDistance(22), scaleDistance(7));
      }
      for (const [index, steamX] of [-24, 0, 24].entries()) {
        const drift = Math.sin(phase * 2.4 + index) * scaleDistance(4);
        this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), 0xfff8df, 0.58);
        this.worldSceneLayer.beginPath();
        this.worldSceneLayer.moveTo(x + scaleDistance(steamX), y + scaleDistance(14));
        this.worldSceneLayer.lineTo(x + scaleDistance(steamX) + drift, y - scaleDistance(4));
        this.worldSceneLayer.lineTo(x + scaleDistance(steamX) - drift, y - scaleDistance(18));
        this.worldSceneLayer.strokePath();
      }
    } else if (scene.sceneKind === "work_table") {
      this.worldSceneLayer.fillStyle(0x2b3d4f, 0.82);
      this.worldSceneLayer.fillRoundedRect(x - scaleDistance(28), y + scaleDistance(10), scaleDistance(56), scaleDistance(13), scaleDistance(4));
      this.worldSceneLayer.fillStyle(0xfff0bd, 0.86);
      this.worldSceneLayer.fillRoundedRect(x - scaleDistance(10), y + scaleDistance(3), scaleDistance(20), scaleDistance(12), scaleDistance(3));
    } else if (scene.sceneKind === "party_pulse") {
      for (let index = 0; index < 3; index += 1) {
        const noteX = x + scaleDistance(-24 + index * 24);
        const noteY = y - scaleDistance(8) + Math.sin(phase * 4 + index) * scaleDistance(5);
        this.worldSceneLayer.fillStyle(color, 0.72);
        this.worldSceneLayer.fillCircle(noteX, noteY, scaleDistance(3));
        this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), color, 0.72);
        this.worldSceneLayer.lineBetween(noteX + scaleDistance(3), noteY, noteX + scaleDistance(3), noteY - scaleDistance(16));
      }
    } else if (scene.sceneKind === "market_walk") {
      this.worldSceneLayer.fillStyle(0xfff0bd, 0.86);
      this.worldSceneLayer.fillRoundedRect(x - scaleDistance(31), y + scaleDistance(8), scaleDistance(62), scaleDistance(16), scaleDistance(5));
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), color, 0.72);
      this.worldSceneLayer.lineBetween(x - scaleDistance(20), y + scaleDistance(6), x + scaleDistance(20), y + scaleDistance(6));
    } else if (scene.sceneKind === "run_gathering") {
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), color, 0.78);
      this.worldSceneLayer.beginPath();
      this.worldSceneLayer.arc(x, y + scaleDistance(18), scaleDistance(28), 0.2, Math.PI * 1.72);
      this.worldSceneLayer.strokePath();
    } else {
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), color, 0.76);
      this.worldSceneLayer.strokeCircle(x, y + scaleDistance(16), scaleDistance(30 + Math.sin(phase * 4) * 3));
    }

    this.drawWorldSceneActors(scene.actors, x, y, phase, 1);
    this.drawWorldSceneSign(scene, x, y - scaleDistance(30), activeLabelIds, color);
  }

  private drawWorldSceneGathering(
    scene: OpportunityWorldScene,
    x: number,
    y: number,
    phase: number,
    activeLabelIds: Set<string>,
    color: number
  ): void {
    this.drawWorldSceneSign(scene, x, y - scaleDistance(30), activeLabelIds, color);
    scene.actors.forEach((actor, index) => {
      const loop = (phase * 0.32 + index * 0.21) % 1;
      const progress = loop < 0.72 ? loop / 0.72 : 1;
      const eased = 1 - Math.pow(1 - progress, 2);
      const startX = x + actor.approachOffsetX;
      const startY = y + actor.approachOffsetY;
      const endX = x + actor.offsetX;
      const endY = y + actor.offsetY;
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(1)), color, 0.22);
      this.worldSceneLayer.lineBetween(startX, startY + scaleDistance(18), endX, endY + scaleDistance(18));
      this.drawWorldSceneActor(actor, x, y, phase + index, eased);
    });
  }

  private drawWorldSceneDealSignal(
    scene: OpportunityWorldScene,
    x: number,
    y: number,
    phase: number,
    activeLabelIds: Set<string>,
    color: number
  ): void {
    const flip = 0.72 + Math.abs(Math.sin(phase * 4.2)) * 0.28;
    this.worldSceneLayer.fillStyle(0x101820, 0.68);
    this.worldSceneLayer.fillRoundedRect(x - scaleDistance(29) * flip, y - scaleDistance(38), scaleDistance(58) * flip, scaleDistance(28), scaleDistance(5));
    this.worldSceneLayer.lineStyle(scaleDistance(2), color, 0.92);
    this.worldSceneLayer.strokeRoundedRect(x - scaleDistance(29) * flip, y - scaleDistance(38), scaleDistance(58) * flip, scaleDistance(28), scaleDistance(5));
    for (let index = 0; index < 5; index += 1) {
      const angle = phase * 1.8 + index * 1.26;
      const inner = scaleDistance(24);
      const outer = scaleDistance(34 + (index % 2) * 6);
      this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), color, 0.26);
      this.worldSceneLayer.lineBetween(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner, x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    }
    this.drawWorldSceneSign(scene, x, y - scaleDistance(24), activeLabelIds, color);
  }

  private drawWorldSceneActors(actors: WorldSceneActor[], x: number, y: number, phase: number, progress: number): void {
    actors.forEach((actor, index) => this.drawWorldSceneActor(actor, x, y, phase + index * 0.4, progress));
  }

  private drawWorldSceneActor(actor: WorldSceneActor, centerX: number, centerY: number, phase: number, progress: number): void {
    const eased = Phaser.Math.Clamp(progress, 0, 1);
    const x = centerX + Phaser.Math.Linear(actor.approachOffsetX, actor.offsetX, eased);
    const y = centerY + Phaser.Math.Linear(actor.approachOffsetY, actor.offsetY, eased);
    const bob = Math.sin(phase * 6) * scaleDistance(actor.role === "distressed" ? 2.8 : 1.7);
    const color = this.sceneActorColor(actor.spriteKey);
    this.worldSceneLayer.fillStyle(0x101820, 0.22);
    this.worldSceneLayer.fillEllipse(x, y + scaleDistance(23), scaleDistance(24), scaleDistance(7));
    this.worldSceneLayer.fillStyle(color, 0.96);
    this.worldSceneLayer.fillRoundedRect(x - scaleDistance(7), y + scaleDistance(4) + bob, scaleDistance(14), scaleDistance(20), scaleDistance(5));
    this.worldSceneLayer.fillStyle(0xf3c36b, 0.96);
    this.worldSceneLayer.fillCircle(x, y - scaleDistance(5) + bob, scaleDistance(8));
    this.worldSceneLayer.fillStyle(0x25384a, 0.96);
    this.worldSceneLayer.fillCircle(x - scaleDistance(3), y - scaleDistance(10) + bob, scaleDistance(4));
    this.worldSceneLayer.fillCircle(x + scaleDistance(4), y - scaleDistance(10) + bob, scaleDistance(4));

    const wave = Math.sin(phase * (actor.role === "waving" ? 9 : 5));
    this.worldSceneLayer.lineStyle(Math.max(1, scaleDistance(2)), 0xf3c36b, 0.96);
    if (actor.role === "waving" || actor.role === "distressed") {
      this.worldSceneLayer.lineBetween(x + scaleDistance(8), y + scaleDistance(8) + bob, x + scaleDistance(16), y - scaleDistance(4) + bob + wave * scaleDistance(4));
    } else {
      this.worldSceneLayer.lineBetween(x + scaleDistance(8), y + scaleDistance(10) + bob, x + scaleDistance(15), y + scaleDistance(16) + bob);
    }
    this.worldSceneLayer.lineBetween(x - scaleDistance(8), y + scaleDistance(10) + bob, x - scaleDistance(15), y + scaleDistance(16) + bob);
  }

  private drawWorldSceneSign(
    scene: { id: string; cue: string; accepted?: boolean; opportunityId?: string; title?: string },
    x: number,
    y: number,
    activeLabelIds: Set<string>,
    color: number
  ): void {
    const label = this.getWorldSceneLabel(`${scene.id}:cue`, scene.cue);
    activeLabelIds.add(`${scene.id}:cue`);
    label
      .setPosition(x, y)
      .setDepth(y + UI_DEPTH / 3)
      .setColor(scene.accepted ? "#c9ffd8" : "#101820")
      .setBackgroundColor(scene.accepted ? "rgba(37,58,53,0.92)" : this.sceneLabelBackground(color))
      .setVisible(true);
    label.off("pointerdown");
    if (scene.opportunityId) {
      label.setInteractive({ useHandCursor: true });
      label.on("pointerdown", (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Phaser.Types.Input.EventData) => {
        event?.stopPropagation();
        this.trackPhoneOpportunity(scene.opportunityId!);
      });
      label.setData("hint", `Track ${scene.title ?? "opportunity"}`);
    } else {
      label.disableInteractive();
    }
  }

  private getWorldSceneLabel(id: string, text: string): Phaser.GameObjects.Text {
    const existing = this.worldSceneLabels.get(id);
    if (existing) {
      existing.setText(text);
      return existing;
    }
    const label = this.add
      .text(0, 0, text, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "11px",
        color: "#101820",
        fontStyle: "800",
        padding: { x: 5, y: 2 }
      })
      .setOrigin(0.5);
    this.worldSceneLabels.set(id, label);
    return label;
  }

  private sceneLabelBackground(color: number): string {
    const red = (color >> 16) & 0xff;
    const green = (color >> 8) & 0xff;
    const blue = color & 0xff;
    return `rgba(${red}, ${green}, ${blue}, 0.92)`;
  }

  private sceneActorColor(spriteKey: string): number {
    if (spriteKey === "npc-sari") return 0xf59f43;
    if (spriteKey === "npc-kadek") return 0x6ab7ff;
    if (spriteKey === "npc-made") return 0x8bd17c;
    if (spriteKey === "npc-ari") return 0xffd166;
    if (spriteKey === "npc-rio") return 0xff8f6b;
    return 0xf4d58d;
  }

  private eventSceneColor(kind: EventWorldScene["sceneKind"]): number {
    if (kind === "run_gathering" || kind === "crew_beach_run") return 0x8fe3b4;
    if (kind === "crew_sunset_circle") return 0xffb45f;
    if (kind === "crew_kitchen_door") return 0xf59f43;
    if (kind === "work_table") return 0x91b7dd;
    if (kind === "market_walk") return 0xffd45c;
    if (kind === "party_pulse") return 0xd95c8a;
    return 0xf4d58d;
  }

  private drawMinimap(): void {
    if (this.getActiveInterior()) {
      this.hudController.setMinimapHidden(true);
      return;
    }
    const surface = this.hudController.getMinimapSurface(WORLD_WIDTH, WORLD_HEIGHT);
    if (!surface) {
      return;
    }

    const { ctx, layout } = surface;
    this.fillRoundedRect(ctx, layout.x, layout.y, layout.width, layout.height, 7, 0x0f1820, 0.74);
    this.strokeRoundedRect(ctx, layout.x, layout.y, layout.width, layout.height, 7, 1, 0xf4d58d, 0.32);

    this.fillRoundedRect(
      ctx,
      layout.offsetX,
      layout.offsetY,
      WORLD_WIDTH * layout.scale,
      WORLD_HEIGHT * layout.scale,
      4,
      0x497f55,
      0.92
    );

    for (const feature of berawaMapFeatures) {
      if (feature.kind === "water") {
        this.fillMinimapFeature(ctx, feature, layout, 0x2d9ab0, 0.7);
      } else if (feature.kind === "beach") {
        this.fillMinimapFeature(ctx, feature, layout, 0xd9b875, 0.88);
      } else if (feature.kind === "coastline") {
        this.strokeMinimapPath(ctx, feature.points, layout, 1.5, 0x9ee6df, 0.75);
      }
    }

    for (const entry of PRESENTED_BERAWA_ROADS) {
      const width = entry.visualClass === "main" ? 2.3 : entry.visualClass === "secondary" ? 1.5 : 0.9;
      const color = entry.visualClass === "main" ? 0xe5d08f : entry.visualClass === "secondary" ? 0xb9b49d : 0x7c897b;
      this.strokeMinimapPath(ctx, entry.road.points, layout, width, color, entry.visualClass === "lane" ? 0.58 : 0.86);
    }

    for (const parcel of walkableStreetParcels) {
      this.fillRoundedRect(
        ctx,
        layout.offsetX + parcel.tileX * TILE_SIZE * layout.scale,
        layout.offsetY + parcel.tileY * TILE_SIZE * layout.scale,
        parcel.widthTiles * TILE_SIZE * layout.scale,
        Math.max(1.5, parcel.heightTiles * TILE_SIZE * layout.scale),
        1,
        0xd1a968,
        0.9
      );
    }

    this.drawMinimapDiscoveredVenues(ctx, layout);
    this.drawMinimapOpportunityMarkers(ctx, layout);
    this.drawMinimapObjectiveMarkers(ctx, layout);
    this.drawMinimapCameraView(ctx, layout);
    this.drawMinimapPlayer(ctx, layout);
  }

  private drawMinimapDiscoveredVenues(ctx: CanvasRenderingContext2D, layout: MinimapLayout): void {
    const discovery = this.world.mapDiscovery;
    for (const node of curatedVenueNodes) {
      if (!discovery.revealAll && !discovery.discoveredVenueIds.includes(node.venueId)) {
        continue;
      }
      const point = this.projectMinimapPoint(node, layout);
      const palette = this.venuePalette(node.category);
      const radius = node.isLandmark ? 3.2 : 2.2;
      this.fillCircle(ctx, point.x, point.y, radius, palette.roof, 0.95);
      this.strokeCircle(ctx, point.x, point.y, radius + 1, 1, 0xfff0bd, node.isLandmark ? 0.7 : 0.34);
    }
  }

  private drawMinimapOpportunityMarkers(ctx: CanvasRenderingContext2D, layout: MinimapLayout): void {
    for (const opportunity of this.world.opportunities.live) {
      const node = venueMapNodes.find((candidate) => candidate.venueId === opportunity.locationVenueId);
      const template = getOpportunityTemplate(opportunity.templateId);
      if (!node || !template) {
        continue;
      }
      const point = this.projectMinimapPoint(node, layout);
      const tracked = this.world.opportunities.trackedOpportunityId === opportunity.id;
      const palette = this.opportunityPalette(template.type);
      const radius = tracked ? 4.8 : 3.6;
      this.fillCircle(ctx, point.x, point.y, radius, palette.fill, 0.98);
      this.strokeCircle(ctx, point.x, point.y, radius + 1.5, tracked ? 2 : 1, 0xfff0bd, tracked ? 0.94 : 0.58);
    }
  }

  private drawMinimapObjectiveMarkers(ctx: CanvasRenderingContext2D, layout: MinimapLayout): void {
    const targets = this.getFieldObjectiveTargets();
    for (const target of targets) {
      const point = this.projectMinimapPoint(target, layout);
      this.fillCircle(ctx, point.x, point.y, 5.2, 0xffd45c, 0.98);
      this.strokeCircle(ctx, point.x, point.y, 7, 2, 0x253a35, 0.86);
      this.strokeCircle(ctx, point.x, point.y, 8.8, 1, 0xfff0bd, 0.72);
    }
  }

  private drawMinimapCameraView(ctx: CanvasRenderingContext2D, layout: MinimapLayout): void {
    const view = this.cameras.main.worldView;
    const topLeft = this.projectMinimapPoint({ x: view.x, y: view.y }, layout);
    ctx.strokeStyle = this.canvasColor(0xffffff, 0.44);
    ctx.lineWidth = 1;
    ctx.strokeRect(topLeft.x, topLeft.y, view.width * layout.scale, view.height * layout.scale);
  }

  private drawMinimapPlayer(ctx: CanvasRenderingContext2D, layout: MinimapLayout): void {
    const point = this.projectMinimapPoint(this.player, layout);
    const heading = this.getDirectionVector(this.playerState.direction);
    const left = { x: -heading.y, y: heading.x };
    const tip = { x: point.x + heading.x * 8, y: point.y + heading.y * 8 };
    const back = { x: point.x - heading.x * 4, y: point.y - heading.y * 4 };

    ctx.fillStyle = this.canvasColor(0xfff0bd, 1);
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(back.x + left.x * 4.5, back.y + left.y * 4.5);
    ctx.lineTo(back.x - left.x * 4.5, back.y - left.y * 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.canvasColor(0x2b1d17, 0.8);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private fillMinimapFeature(
    ctx: CanvasRenderingContext2D,
    feature: MapFeatureDefinition,
    layout: MinimapLayout,
    color: number,
    alpha: number
  ): void {
    if (feature.points.length < 3) {
      return;
    }

    const first = this.projectMinimapPoint(feature.points[0], layout);
    ctx.fillStyle = this.canvasColor(color, alpha);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const point of feature.points.slice(1)) {
      const next = this.projectMinimapPoint(point, layout);
      ctx.lineTo(next.x, next.y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private strokeMinimapPath(
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number }>,
    layout: MinimapLayout,
    width: number,
    color: number,
    alpha: number
  ): void {
    if (points.length < 2) {
      return;
    }

    const first = this.projectMinimapPoint(points[0], layout);
    ctx.strokeStyle = this.canvasColor(color, alpha);
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const point of points.slice(1)) {
      const next = this.projectMinimapPoint(point, layout);
      ctx.lineTo(next.x, next.y);
    }
    ctx.stroke();
  }

  private projectMinimapPoint(point: { x: number; y: number }, layout: MinimapLayout): MapPoint {
    return {
      x: layout.offsetX + point.x * layout.scale,
      y: layout.offsetY + point.y * layout.scale
    };
  }

  private getDirectionVector(direction: Direction): MapPoint {
    switch (direction) {
      case "left":
        return { x: -1, y: 0 };
      case "right":
        return { x: 1, y: 0 };
      case "up":
        return { x: 0, y: -1 };
      case "down":
      default:
        return { x: 0, y: 1 };
    }
  }

  private fillRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: number,
    alpha: number
  ): void {
    this.roundedRectPath(ctx, x, y, width, height, radius);
    ctx.fillStyle = this.canvasColor(color, alpha);
    ctx.fill();
  }

  private strokeRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    lineWidth: number,
    color: number,
    alpha: number
  ): void {
    this.roundedRectPath(ctx, x, y, width, height, radius);
    ctx.strokeStyle = this.canvasColor(color, alpha);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  private roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private fillCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: number, alpha: number): void {
    ctx.fillStyle = this.canvasColor(color, alpha);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  private strokeCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    lineWidth: number,
    color: number,
    alpha: number
  ): void {
    ctx.strokeStyle = this.canvasColor(color, alpha);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  private canvasColor(color: number, alpha: number): string {
    const red = (color >> 16) & 0xff;
    const green = (color >> 8) & 0xff;
    const blue = color & 0xff;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  private toggleGodmodePanel(): void {
    if (!this.isDevBuild()) {
      return;
    }
    if (this.godmodePanel) {
      this.closeGodmodePanel();
      return;
    }
    this.openGodmodePanel();
  }

  private openGodmodePanel(): void {
    if (!this.isDevBuild()) {
      return;
    }
    this.godmodePanel?.destroy(true);
    this.godmodePanel = undefined;
    this.closePanel(false);
    this.phone?.close();
    this.mode = "godmode";

    const { width, height } = this.scale;
    const panelWidth = Math.min(760, width - 28);
    const panelHeight = Math.min(720, height - 44);
    const x = (width - panelWidth) / 2;
    const y = (height - panelHeight) / 2;
    const container = this.createZoomCompensatedContainer(UI_DEPTH + 12);
    const bg = this.add.graphics();
    bg.fillStyle(0x111820, 0.96);
    bg.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    bg.lineStyle(2, 0x8fe3b4, 0.58);
    bg.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    container.add(bg);

    const ibuAffinity = getRelationship(this.world, "npc", "ibu_sari")?.affinity ?? 0;
    const stats =
      `Speed x${this.movementSpeedMultiplier}  |  Money Rp ${this.playerState.money}  |  Rep ${getReputationScore(this.world.reputation)}  |  Safety ${this.playerState.safety}\n` +
      `${this.getBikeStatusLabel()}  |  Ibu Sari affinity ${ibuAffinity}  |  Map ${this.world.mapDiscovery.discoveredVenueIds.length} venues${this.world.mapDiscovery.revealAll ? " + reveal all" : ""}\n` +
      "Development-only controls. This panel is omitted from production builds.";
    container.add(this.add.text(x + 22, y + 18, "Godmode", this.panelTitleStyle()));
    container.add(
      this.add.text(x + 22, y + 56, stats, {
        ...this.panelBodyStyle(),
        wordWrap: { width: panelWidth - 44 }
      })
    );

    const compact = panelWidth < 340;
    const cols = compact ? 1 : 2;
    const gap = 10;
    const buttonWidth = compact ? panelWidth - 44 : (panelWidth - 44 - gap) / 2;
    const buttonHeight = 32;
    let buttonIndex = 0;
    const addGodButton = (label: string, action: () => void, fill = 0x253a47): void => {
      const col = buttonIndex % cols;
      const row = Math.floor(buttonIndex / cols);
      const bx = x + 22 + col * (buttonWidth + gap);
      const by = y + 132 + row * (buttonHeight + 6);
      this.addPanelButton(container, bx, by, buttonWidth, buttonHeight, label, () => {
        action();
        saveWorldState(this.world);
        this.refreshGodmodePanel();
      }, fill);
      buttonIndex += 1;
    };

    addGodButton("Cycle Speed", () => {
      this.movementSpeedMultiplier = this.movementSpeedMultiplier === 1 ? 2 : this.movementSpeedMultiplier === 2 ? 4 : 1;
      this.showToast(`Dev speed x${this.movementSpeedMultiplier}.`);
    });
    addGodButton("+Rp 500", () => {
      this.playerState.money += 500;
      this.showToast("Dev money added.");
    }, 0x253a35);
    addGodButton("+Coconut", () => {
      addItem(this.playerState, "coconut", 1);
      this.showToast("Dev item added.");
    });
    addGodButton("+Croissant", () => {
      addItem(this.playerState, "butter_croissant", 1);
      this.showToast("Dev item added.");
    });
    addGodButton("+Ibu Relationship", () => this.devRecordMemory("npc", "ibu_sari", "helped", "Dev relationship adjustment."), 0x253a35);
    addGodButton("+Rep 10", () => this.devAdjustReputation(10, "Dev reputation adjustment."), 0x253a35);
    addGodButton("Helpful Tag", () => this.devAwardReputationTag("helpful", "Dev reputation tag adjustment."), 0x253a35);
    addGodButton("+Safety 20", () => {
      this.playerState.safety = Phaser.Math.Clamp(this.playerState.safety + 20, 0, 100);
      this.showToast("Dev safety adjusted.");
    });
    addGodButton("Toggle Bike", () => {
      this.playerState.hasBike = true;
      this.playerState.onBike = resolveRequestedBikeState(
        !this.playerState.onBike,
        this.activeInteriorId ? "interior" : "world",
        this.playerState.hasBike,
        this.activeInteriorId
      );
      if (getQuantity(this.playerState, SCOOTER_KEY_ITEM_ID) === 0) {
        addItem(this.playerState, SCOOTER_KEY_ITEM_ID, 1);
      }
      this.updatePlayerBikeVisual();
      this.showToast(this.playerState.onBike ? "Dev bike riding." : "Dev bike parked.");
    });
    addGodButton("Repair Bike", () => {
      this.playerState.hasBike = true;
      this.playerState.bikeCondition = 100;
      this.playerState.bikeStuck = false;
      this.updatePlayerBikeVisual();
      this.showToast("Dev bike repaired.");
    });
    addGodButton("Act 1 Ready", () => {
      this.world.life.actProgress.currentAct = 1;
      this.world.life.actProgress.act0Step = "complete";
      this.world.life.actProgress.firstDayComplete = true;
      this.world.life.actProgress.completedAct0StepIds = [
        "meet_ibu_sari",
        "pickup_first_delivery",
        "dropoff_first_delivery",
        "buy_meal_and_coffee",
        "sleep_first_night"
      ];
      this.world.life.hustle.completedDeliveryCount = Math.max(this.world.life.hustle.completedDeliveryCount, 1);
      this.world.life.hustle.deliveryEarnings = Math.max(this.world.life.hustle.deliveryEarnings, 160);
      this.world.life.hustle.driverRating = Math.max(this.world.life.hustle.driverRating, 3.6);
      this.playerState.hasBike = true;
      this.playerState.onBike = resolveRequestedBikeState(
        true,
        this.activeInteriorId ? "interior" : "world",
        this.playerState.hasBike,
        this.activeInteriorId
      );
      this.playerState.bikeStuck = false;
      this.playerState.bikeCondition = Math.max(this.playerState.bikeCondition, 48);
      if (getQuantity(this.playerState, SCOOTER_KEY_ITEM_ID) === 0) {
        addItem(this.playerState, SCOOTER_KEY_ITEM_ID, 1);
      }
      this.refreshHustleMoveOutReady();
      this.updatePlayerBikeVisual();
      this.showToast("Dev Act 1 hustle state ready.");
    }, 0x253a35);
    addGodButton("+Delivery Stat", () => {
      this.world.life.hustle.completedDeliveryCount += 1;
      this.world.life.hustle.deliveryEarnings += 140;
      this.world.life.hustle.driverRating = Math.min(5, Math.round((this.world.life.hustle.driverRating + 0.2) * 10) / 10);
      this.refreshHustleMoveOutReady();
      this.showToast("Dev delivery progress added.");
    }, 0x253a35);
    addGodButton("Rating 4.5★", () => {
      this.world.life.hustle.driverRating = 4.5;
      this.refreshHustleMoveOutReady();
      this.showToast("Dev driver rating set.");
    }, 0x253a35);
    addGodButton("Pay Rent", () => {
      const result = payHustleRent(this.world, this.getAbsoluteMinute());
      this.showToast(result.message);
    }, 0x394155);
    addGodButton("Upgrade Scooter", () => {
      const result = upgradeToDailyScooter(this.world, this.getAbsoluteMinute());
      this.updatePlayerBikeVisual();
      this.showToast(result.message);
    }, 0x394155);
    addGodButton("Time 08:00", () => this.devSetTime(8 * 60));
    addGodButton("Time 18:00", () => this.devSetTime(18 * 60));
    addGodButton("Reveal Map", () => {
      this.revealAllMapDiscovery();
      this.showToast("Dev map discovery revealed.");
    }, 0x394155);
    addGodButton("Quest Prep", () => {
      if (!isQuestActive(this.playerState, "canggu_station_restock") && !isQuestComplete(this.playerState, "canggu_station_restock")) {
        startQuest(this.playerState, "canggu_station_restock");
      }
      addItem(this.playerState, "coconut", 2);
      this.showToast("Dev grocery quest prepped.");
    }, 0x394155);
    addGodButton("Teleport Canggu Station", () => this.devTeleportToVenue("canggu_station"), 0x394155);
    addGodButton("Teleport FINNS", () => this.devTeleportToVenue("finns_beach_club"), 0x394155);
    addGodButton("Teleport Beach", () => this.devTeleportToVenue("berawa_beach"), 0x394155);
    addGodButton("Clear Wanted", () => {
      clearWantedStanding(this.world.reputation, "Dev wanted state cleared.", this.getAbsoluteMinute());
      this.updatePlayerWantedSign();
      this.showToast("Dev wanted state cleared.");
    }, 0x4a3331);

    this.addPanelButton(container, x + panelWidth - 160, y + panelHeight - 54, 138, 36, "Close", () => this.closeGodmodePanel(), 0x4a3331);
    this.godmodePanel = container;
  }

  private refreshHustleMoveOutReady(): void {
    this.world.life.hustle.moveOutReady = isAct1MoveOutReady(this.world);
  }

  private refreshGodmodePanel(): void {
    if (this.godmodePanel) {
      this.openGodmodePanel();
    }
  }

  private closeGodmodePanel(): void {
    this.godmodePanel?.destroy(true);
    this.godmodePanel = undefined;
    if (this.mode === "godmode") {
      this.mode = "world";
    }
  }

  private isDevBuild(): boolean {
    return Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);
  }

  private devRecordMemory(subjectType: "npc" | "venue", subjectId: string, memory: MemoryType, detail: string): void {
    this.dispatchIntent({ kind: "RecordMemory", subjectType, subjectId, memory, detail });
    this.showToast("Dev relationship memory recorded.");
  }

  private devAdjustReputation(delta: number, reason: string): void {
    this.dispatchIntent({ kind: "AdjustReputation", delta, reason });
    this.showToast(`Dev reputation ${delta >= 0 ? "+" : ""}${delta}.`);
  }

  private devAwardReputationTag(tag: ReputationTag, reason: string): void {
    this.dispatchIntent({ kind: "AwardReputationTag", tag, reason });
    this.showToast(`Dev tag awarded: ${tag}.`);
  }

  private devSetTime(minuteOfDay: number): void {
    this.world.clock.minuteOfDay = Phaser.Math.Clamp(minuteOfDay, 0, 1439);
    this.updateLighting();
    this.showToast(`Dev time set to ${formatClock(this.world)}.`);
  }

  private devTeleportToVenue(venueId: string): void {
    const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
    if (!node) {
      this.showToast(`Dev teleport failed: ${venueId} not found.`);
      return;
    }
    this.devTeleport(node.x, node.y);
  }

  private devTeleport(x: number, y: number): void {
    const point = this.clampToPlayableBounds(x, y, scaleDistance(28));
    this.player.setVelocity(0, 0);
    this.player.setPosition(point.x, point.y);
    this.player.body?.updateFromGameObject();
    this.playerState.x = Math.round(this.player.x);
    this.playerState.y = Math.round(this.player.y);
    this.updatePlayerBikeVisual();
    this.updateMapDiscovery();
    this.showToast("Dev teleport complete.");
  }

  private addPanelButton(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    fill = 0x253a47
  ): void {
    const button = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(fill, 1);
    bg.fillRoundedRect(0, 0, width, height, 6);
    bg.lineStyle(1, 0xf4d58d, 0.32);
    bg.strokeRoundedRect(0, 0, width, height, 6);
    const text = this.add
      .text(14, height / 2, label, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "15px",
        color: "#fff8df"
      })
      .setOrigin(0, 0.5);
    text.setWordWrapWidth(width - 28);
    button.add([bg, text]);
    button.setSize(width, height);
    container.add(button);

    const hitZone = this.add.zone(x + width / 2, y + height / 2, width, height);
    hitZone.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    if (hitZone.input) {
      hitZone.input.cursor = "pointer";
    }
    hitZone.on("pointerover", () => bg.setAlpha(0.86));
    hitZone.on("pointerout", () => bg.setAlpha(1));
    hitZone.on("pointerdown", (pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Phaser.Types.Input.EventData) => {
      event?.stopPropagation();
      pointer.event?.stopPropagation();
      onClick();
    });
    container.add(hitZone);
  }

  private collectPickup(pickupId: string): void {
    const pickup = pickupDefinitions.find((candidate) => candidate.id === pickupId);
    if (!pickup || !this.isPickupAvailable(pickup)) {
      return;
    }

    const sprite = this.pickupSprites.get(pickup.id);
    if (sprite) {
      this.playPickupPop(sprite, itemDefinitions[pickup.itemId].name);
    }
    addItem(this.playerState, pickup.itemId, 1);
    this.world.collectedPickups[pickup.id] = this.getAbsoluteMinute();
    saveWorldState(this.world);
    this.showToast(`Collected ${itemDefinitions[pickup.itemId].name}.`);
  }

  private confrontWantedOffender(offenderId: string): void {
    const offender = this.wantedOffenders.get(offenderId);
    if (!offender) {
      return;
    }
    if (offender.wantedLevel <= 0) {
      this.showToast("Only flagged wanted people can be confronted.");
      return;
    }

    const reward = Math.min(offender.cash, this.getOffenderReward(offender));
    offender.cash -= reward;
    offender.wantedLevel = Math.max(0, offender.wantedLevel - 1);
    this.playerState.money += reward;
    this.dispatchIntent({ kind: "AdjustReputation", delta: 3, reason: "Citizen arrest of flagged rider" });
    this.playerState.connections += offender.wantedLevel === 0 ? 1 : 0;
    this.spawnCashBurst(offender.sprite.x, offender.sprite.y, reward);
    saveWorldState(this.world);

    if (offender.wantedLevel === 0) {
      offender.sign.setVisible(false);
      this.showToast(`Citizen arrest complete. Rp ${reward} recovered from the offender.`);
    } else {
      this.showToast(`Bounty hit: Rp ${reward} fell from the wanted rider. Wanted level now ${offender.wantedLevel}.`);
    }
  }

  private getOffenderReward(offender: { wantedLevel: number }): number {
    return Math.min(MAX_BOUNTY_REWARD, 25 + offender.wantedLevel * 15);
  }

  private spawnCashBurst(x: number, y: number, amount: number): void {
    const pieces = Math.max(3, Math.min(7, Math.ceil(amount / 20)));
    for (let i = 0; i < pieces; i += 1) {
      const coin = this.add
        .text(x, y - 18, "Rp", {
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "12px",
          color: "#fff0bd",
          backgroundColor: "rgba(37, 58, 53, 0.82)",
          padding: { x: 4, y: 2 }
        })
        .setOrigin(0.5)
        .setDepth(UI_DEPTH - 10);
      this.tweens.add({
        targets: coin,
        x: x + Phaser.Math.Between(-42, 42),
        y: y + Phaser.Math.Between(8, 46),
        alpha: 0,
        duration: 850,
        ease: "Cubic.easeOut",
        onComplete: () => coin.destroy()
      });
    }
  }

  private getNearestInteraction(): InteractionTarget | undefined {
    return this.interactionController.getNearestInteraction();
  }

  private getNearestInteriorInteraction(): InteriorInteractionTarget | undefined {
    const interior = this.getActiveInterior();
    if (!interior) {
      return undefined;
    }

    const candidates: Array<InteriorInteractionTarget & { distance: number; priority: number }> = [];
    const exitDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, interior.exitMat.x, interior.exitMat.y);
    if (exitDistance <= interior.exitMat.radius) {
      candidates.push({
        type: "exit",
        interiorId: interior.id,
        label: `Leave ${interior.name}`,
        distance: exitDistance,
        priority: 1
      });
    }

    for (const station of interior.stations) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, station.x, station.y);
      if (distance <= station.radius) {
        const deliveryPickup = getInteriorDeliveryPickupForStation(this.world, station);
        if (deliveryPickup) {
          candidates.push({
            type: "delivery",
            id: deliveryPickup.deliveryId,
            label: deliveryPickup.label,
            distance,
            priority: 0
          });
        }
        candidates.push({
          type: "station",
          id: station.id,
          label: station.label,
          activityVenueId: station.activityVenueId,
          distance,
          priority: 2
        });
      }
    }

    for (const slot of getOccupiedInteriorNpcSlots(this.world, interior)) {
      const npc = npcDefinitions[slot.npcId];
      if (!npc) {
        continue;
      }
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, slot.x, slot.y);
      if (distance <= INTERIOR_NPC_INTERACTION_RADIUS) {
        candidates.push({
          type: "npc",
          id: slot.npcId,
          label: `Talk to ${npc.name}`,
          distance,
          priority: 3
        });
      }
    }

    candidates.sort((a, b) => a.priority - b.priority || a.distance - b.distance);
    return candidates[0];
  }

  private *getActiveDeliveryTargets() {
    const active = this.world.life.hustle.activeDelivery;
    if (!active) {
      return;
    }
    const delivery = getDeliveryDefinition(active.deliveryId);
    if (!delivery) {
      return;
    }
    if (active.stage === "accepted") {
      if (getInteriorByVenueId(delivery.pickupVenueId)) {
        return;
      }
      const node = venueMapNodes.find((candidate) => candidate.venueId === delivery.pickupVenueId);
      if (!node) {
        return;
      }
      yield {
        id: active.deliveryId,
        label: delivery.pickupLabel,
        x: node.x,
        y: node.y,
        radius: Math.max(86, Math.min(node.radius, 118))
      };
      return;
    }
    if (delivery.dropoffVenueId && getInteriorByVenueId(delivery.dropoffVenueId)) {
      return;
    }
    yield {
      id: active.deliveryId,
      label: delivery.dropoffLabel,
      x: delivery.dropoffPoint.x,
      y: delivery.dropoffPoint.y,
      radius: delivery.dropoffPoint.radius
    };
  }

  private handleDeliveryInteraction(deliveryId: string): void {
    const active = this.world.life.hustle.activeDelivery;
    if (!active || active.deliveryId !== deliveryId) {
      this.showToast("That delivery is not active anymore.");
      return;
    }
    const wasPickup = active.stage === "accepted";
    const now = this.getAbsoluteMinute();
    const performanceScore = wasPickup ? undefined : getDeliveryRunPerformance(active);
    const previousMoney = this.playerState.money;
    const previousDriverRating = this.world.life.hustle.driverRating;
    const previousAct = this.world.life.actProgress.currentAct;
    const rentAmount = this.world.life.hustle.rentAmount;
    let chapterCutsceneDelayMs = 0;
    const result =
      wasPickup
        ? pickupDelivery(this.world, now)
        : completeDelivery(this.world, now, performanceScore);
    if (result.ok && wasPickup) {
      this.ensureDeliveryHazards(active.deliveryId);
      if (active.deliveryId === "act0_ibu_milk_madu_catering") {
        completeAct0Step(this.world, "pickup_first_delivery");
      } else if (active.deliveryId === ACT0_VILLA_DELIVERY_ID) {
        completeAct0Step(this.world, "pickup_villa_delivery");
      }
      this.spawnInteractionFlourish("pickup", this.player.x, this.player.y, "Picked up");
    } else if (result.ok && !this.world.life.hustle.activeDelivery) {
      this.clearDeliveryHazards();
      const negotiatedFee = active.deliveryId === "act0_ibu_milk_madu_catering"
        ? applyAct0NegotiatedCompletionFee(this.world, active.deliveryId)
        : 0;
      if (negotiatedFee > 0) {
        result.payout = (result.payout ?? 0) + negotiatedFee;
        result.message += ` Negotiated fee +Rp ${negotiatedFee}.`;
      }
      if (active.deliveryId === "act0_ibu_milk_madu_catering") {
        completeAct0Step(this.world, "dropoff_first_delivery");
      } else if (active.deliveryId === ACT0_STORM_DELIVERY_ID) {
        completeAct0Step(this.world, "dropoff_storm_delivery");
      } else if (active.deliveryId === ACT0_VILLA_DELIVERY_ID) {
        completeAct0Step(this.world, "dropoff_villa_delivery");
      }
      this.refreshSettlingInGoals(false);
      const baseCelebration = buildPayoutCelebrationSpec({
        payout: result.payout ?? 0,
        starRating: result.starRating ?? this.world.life.hustle.driverRating,
        previousDriverRating,
        nextDriverRating: this.world.life.hustle.driverRating,
        previousMoney,
        nextMoney: this.playerState.money,
        rentAmount,
        performanceScore
      });
      const celebration = active.deliveryId === ACT0_VILLA_DELIVERY_ID
        ? {
            ...baseCelebration,
            tier: "great" as const,
            scalePunch: baseCelebration.scalePunch * 1.22,
            totalDurationMs: baseCelebration.totalDurationMs + 700
          }
        : baseCelebration;
      chapterCutsceneDelayMs = getChapterCutsceneDelayMs(
        previousAct,
        this.world.life.actProgress.currentAct,
        celebration.totalDurationMs
      );
      this.playDeliveryFlourish(this.player.x, this.player.y, result.payout, celebration);
      this.showCargoCareDeliveryReaction(active.deliveryId, result);
      if (active.deliveryId === "act0_ibu_milk_madu_catering") {
        this.world.questFlags.act0_catering_on_time = Boolean(result.onTime);
        const line = result.onTime
          ? this.world.questFlags.act0_negotiated_fee
            ? "Ibu Sari texts: ‘Fee earned. And yes, I remember that you asked.’"
            : "Ibu Sari texts: ‘On time. Keep the keys — and keep your word.’"
          : "Ibu Sari texts: ‘Late. No bonus. But you finished — bring the scooter back in one piece.’";
        this.time.delayedCall(900, () => this.showToast(line));
        this.time.delayedCall(1100, () => {
          if (this.world.life.actProgress.act0Step === "buy_meal_and_coffee" && !this.activeInteriorId) {
            this.enterInterior("milk_madu_interior");
          }
        });
      } else if (active.deliveryId === ACT0_STORM_DELIVERY_ID) {
        this.time.delayedCall(Math.min(1800, celebration.totalDurationMs), () => this.startAct0LandlordUltimatum());
      } else if (active.deliveryId === ACT0_VILLA_DELIVERY_ID) {
        this.world.questFlags.act0_villa_five_star = (result.starRating ?? 0) >= 5;
        this.setTimePhaseForBeat("night");
        this.startWeather("rain");
        this.time.delayedCall(800, () => this.showToast("5.0★ — biggest payout yet. Get the deposit home."));
      }
    }
    saveWorldState(this.world);
    this.showToast(result.message);
    if (result.storyScene?.fired && result.storyScene.dialogue) {
      this.openDialogue("Kadek", result.storyScene.dialogue, "kadek");
    }
    if (result.breakdownScene?.fired && result.breakdownScene.dialogue) {
      this.openDialogue("Dropoff", result.breakdownScene.dialogue);
    }
    if (result.luxuryTipScene?.fired) {
      const scene = getRelationshipChoiceScene(ACT1_LUXURY_TIP_SCENE_ID);
      if (scene) this.openRelationshipChoiceScene(scene);
    }
    if (result.ariCrewInvitation?.fired && result.ariCrewInvitation.dialogue) {
      this.openStoryDialogue("Ari", result.ariCrewInvitation.dialogue, "ari", () => {
        saveWorldState(this.world);
        this.phone?.refresh();
      });
    }
    if (result.ok && !wasPickup && !isAct0StoryDelivery(active.deliveryId) && active.deliveryId !== "act0_ibu_milk_madu_catering") {
      if (chapterCutsceneDelayMs > 0) {
        this.time.delayedCall(chapterCutsceneDelayMs, () => {
          if (!shouldAdvanceGameplayBehindMenu(this.mode)) {
            this.pendingAct2CutscenePreviousAct = previousAct;
            return;
          }
          this.maybeStartAct2Cutscene(previousAct);
        });
      } else {
        this.maybeStartAct2Cutscene(previousAct);
      }
    }
  }

  private showCargoCareDeliveryReaction(deliveryId: string, result: ReturnType<typeof completeDelivery>): void {
    if (result.breakdownScene?.fired) {
      this.showNpcAmbientLine(
        "kadek",
        getAmbientNpcLine(this.world, "kadek", '"The list holds. Ratings are the app\'s opinion, not mine."')
      );
      return;
    }
    const villaRegularLine = getVillaRegularAmbientLine(this.world, deliveryId);
    if (villaRegularLine) {
      this.spawnFloatingText(villaRegularLine, this.player.x, this.player.y - scaleDistance(52), "#fff0bd");
      return;
    }
    const cargo = result.cargoCare;
    if (!cargo || !cargo.eligible || cargo.originalBonus <= 0) {
      return;
    }
    if (cargo.lostBonus > 0 && cargo.integrity < 45) {
      this.showNpcAmbientLine("kadek", "\"That box sounds like it met every pothole on the lane.\"");
      return;
    }
    const delivery = getDeliveryDefinition(deliveryId);
    if (cargo.integrity >= 95 && delivery?.dropoffName.toLowerCase().includes("villa")) {
      this.spawnFloatingText("Villa staff: \"Still perfect.\"", this.player.x, this.player.y - scaleDistance(52), "#fff0bd");
    }
  }

  private drawObjectiveMarkers(): void {
    if (!this.deliveryMarkerLayer) {
      return;
    }
    this.deliveryMarkerLayer.clear();
    const targets = this.getFieldObjectiveTargets();
    for (const target of targets) {
      const pulse = 0.55 + Math.sin(Date.now() / 180) * 0.12;
      const markerRadius = scaleDistance(9);
      this.deliveryMarkerLayer.fillStyle(0xfff0bd, 0.18);
      this.deliveryMarkerLayer.fillCircle(target.x, target.y, markerRadius);
      this.deliveryMarkerLayer.lineStyle(2, 0xfff0bd, Math.min(0.9, pulse));
      this.deliveryMarkerLayer.strokeCircle(target.x, target.y, markerRadius);
      this.deliveryMarkerLayer.fillStyle(0x253a35, 0.94);
      this.deliveryMarkerLayer.fillTriangle(target.x, target.y - 34, target.x - 16, target.y - 8, target.x + 16, target.y - 8);
      this.deliveryMarkerLayer.lineStyle(2, 0xfff0bd, 0.9);
      this.deliveryMarkerLayer.strokeTriangle(target.x, target.y - 34, target.x - 16, target.y - 8, target.x + 16, target.y - 8);
    }
  }

  private drawFieldIndicators(): void {
    if (!this.fieldIndicatorLayer) {
      return;
    }
    this.fieldIndicatorLayer.clear();
    const indicators = getFieldIndicators(this.world);
    for (const indicator of indicators.npcs) {
      const sprite = this.npcSprites.get(indicator.npcId);
      if (!sprite?.visible) {
        continue;
      }
      this.drawNpcFieldIndicator(sprite.x, sprite.y - scaleDistance(58));
    }

    const venueOffsets = new Map<string, number>();
    for (const indicator of indicators.venues) {
      const node = resolveWorldSceneVenueAnchor(indicator.venueId);
      if (!node) {
        continue;
      }
      const offset = venueOffsets.get(indicator.venueId) ?? 0;
      venueOffsets.set(indicator.venueId, offset + 1);
      this.drawVenueFieldIndicator(node.x + offset * scaleDistance(18), node.y - Math.min(node.radius + scaleDistance(48), scaleDistance(112)), indicator);
    }
  }

  private drawNpcFieldIndicator(x: number, y: number): void {
    const radius = scaleDistance(13);
    this.fieldIndicatorLayer.fillStyle(0x101820, 0.76);
    this.fieldIndicatorLayer.fillCircle(x, y + scaleDistance(3), radius + scaleDistance(4));
    this.fieldIndicatorLayer.fillStyle(0xfff0bd, 0.98);
    this.fieldIndicatorLayer.fillCircle(x, y, radius);
    this.fieldIndicatorLayer.lineStyle(2, 0x253a35, 0.88);
    this.fieldIndicatorLayer.strokeCircle(x, y, radius);
    this.fieldIndicatorLayer.lineStyle(3, 0x253a35, 0.95);
    this.fieldIndicatorLayer.lineBetween(x, y - scaleDistance(7), x, y + scaleDistance(2));
    this.fieldIndicatorLayer.fillStyle(0x253a35, 0.95);
    this.fieldIndicatorLayer.fillCircle(x, y + scaleDistance(7), scaleDistance(2));
  }

  private drawVenueFieldIndicator(x: number, y: number, indicator: VenueFieldIndicator): void {
    const radius = scaleDistance(12);
    const fill = indicator.type === "event" ? 0x8ee6ff : 0xffd45c;
    this.fieldIndicatorLayer.fillStyle(0x101820, 0.7);
    this.fieldIndicatorLayer.fillCircle(x, y + scaleDistance(3), radius + scaleDistance(4));
    this.fieldIndicatorLayer.fillStyle(fill, 0.98);
    this.fieldIndicatorLayer.fillCircle(x, y, radius);
    this.fieldIndicatorLayer.lineStyle(2, 0x253a35, 0.82);
    this.fieldIndicatorLayer.strokeCircle(x, y, radius);
    if (indicator.type === "event") {
      this.fieldIndicatorLayer.lineStyle(2, 0x253a35, 0.9);
      this.fieldIndicatorLayer.strokeRect(x - scaleDistance(5), y - scaleDistance(4), scaleDistance(10), scaleDistance(9));
      this.fieldIndicatorLayer.lineBetween(x - scaleDistance(5), y - scaleDistance(1), x + scaleDistance(5), y - scaleDistance(1));
    } else {
      this.fieldIndicatorLayer.fillStyle(0x253a35, 0.95);
      this.fieldIndicatorLayer.fillCircle(x, y, scaleDistance(3));
      this.fieldIndicatorLayer.lineStyle(2, 0x253a35, 0.9);
      this.fieldIndicatorLayer.strokeCircle(x, y, scaleDistance(6));
    }
  }

  private drawObjectiveDirectionCue(): void {
    this.objectiveArrowLayer.clear();
    if (this.isOverlayOpen()) {
      return;
    }
    let targets = this.getFieldObjectiveTargets();
    const activeInterior = this.getActiveInterior();
    if (activeInterior) {
      targets = targets.filter((target) => isInteriorPointInsideRoom(activeInterior, target));
      if (targets.length === 0) {
        return;
      }
    }
    const view = this.cameras.main.worldView;
    const offscreenTarget = targets.find((target) => !Phaser.Geom.Rectangle.Contains(view, target.x, target.y));
    if (!offscreenTarget) {
      return;
    }

    const viewportWidth = this.scale.width;
    const viewportHeight = this.scale.height;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const dx = offscreenTarget.x - (view.x + view.width / 2);
    const dy = offscreenTarget.y - (view.y + view.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance <= 0) {
      return;
    }

    const halfWidth = Math.max(24, centerX - 44);
    const halfHeight = Math.max(24, centerY - 52);
    const edgeScale = Math.min(halfWidth / Math.max(1, Math.abs(dx)), halfHeight / Math.max(1, Math.abs(dy)));
    const x = centerX + dx * edgeScale;
    const y = centerY + dy * edgeScale;
    const angle = Math.atan2(dy, dx);
    const size = 15;
    const tip = { x: x + Math.cos(angle) * size, y: y + Math.sin(angle) * size };
    const left = { x: x + Math.cos(angle + 2.45) * size, y: y + Math.sin(angle + 2.45) * size };
    const right = { x: x + Math.cos(angle - 2.45) * size, y: y + Math.sin(angle - 2.45) * size };

    this.objectiveArrowLayer.fillStyle(0x101820, 0.76);
    this.objectiveArrowLayer.fillCircle(x, y, size + 9);
    this.objectiveArrowLayer.lineStyle(2, 0xfff0bd, 0.82);
    this.objectiveArrowLayer.strokeCircle(x, y, size + 9);
    this.objectiveArrowLayer.fillStyle(0xffd45c, 0.98);
    this.objectiveArrowLayer.fillTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y);
    this.objectiveArrowLayer.lineStyle(2, 0x253a35, 0.72);
    this.objectiveArrowLayer.strokeTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y);
  }

  private getFieldObjectiveTargets(objective = getFieldObjective(this.world)): FieldObjectiveTarget[] {
    const activeInterior = this.getActiveInterior();
    if (activeInterior) {
      return resolveInteriorObjectiveTargets(this.world, activeInterior, objective.targets);
    }
    return objective.targets
      .map((target) => this.resolveFieldObjectiveTarget(target))
      .filter((target): target is FieldObjectiveTarget => Boolean(target));
  }

  private resolveFieldObjectiveTarget(target: FieldObjectiveTargetRef): FieldObjectiveTarget | null {
    if (target.type === "npc") {
      const closedInteriorSlot = this.getClosedInteriorNpcSlot(target.npcId);
      if (closedInteriorSlot) {
        const node = venueMapNodes.find((candidate) => candidate.venueId === closedInteriorSlot.interior.venueId);
        if (node) {
          return {
            id: target.id,
            label: target.label,
            x: node.x,
            y: node.y,
            radius: Math.min(node.radius, scaleDistance(92)),
            type: target.type
          };
        }
      }
      const sprite = this.npcSprites.get(target.npcId);
      const state = this.world.npcs[target.npcId];
      if (!sprite && !state) {
        return null;
      }
      const x = sprite?.x ?? state.x;
      const y = sprite?.y ?? state.y;
      return { id: target.id, label: target.label, x, y, radius: scaleDistance(92), type: target.type };
    }
    if (target.type === "venue") {
      const node = venueMapNodes.find((candidate) => candidate.venueId === target.venueId);
      if (!node) {
        return null;
      }
      return { id: target.id, label: target.label, x: node.x, y: node.y, radius: Math.min(node.radius, scaleDistance(118)), type: target.type };
    }
    if (target.type === "home") {
      const home = getPlayerHomeBase(this.world);
      return { id: target.id, label: target.label, x: home.x, y: home.y, radius: home.radius, type: target.type };
    }
    return target;
  }

  private getActGuideTargets(): Array<{ id: string; label: string; x: number; y: number; radius: number }> {
    if (this.world.life.actProgress.act0Step === "meet_ibu_sari") {
      const sari = this.npcSprites.get("ibu_sari") ?? this.world.npcs.ibu_sari;
      if (sari) {
        return [{ id: "act0_ibu_sari", label: "Find Ibu Sari", x: sari.x, y: sari.y, radius: scaleDistance(92) }];
      }
    }
    if (this.world.life.actProgress.act0Step === "buy_meal_and_coffee") {
      return ["milk_madu_berawa", "baked_berawa"]
        .map((venueId) => {
          const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
          return node ? { id: `act0_${venueId}`, label: node.venueId, x: node.x, y: node.y, radius: Math.min(node.radius, scaleDistance(104)) } : null;
        })
        .filter((target): target is { id: string; label: string; x: number; y: number; radius: number } => Boolean(target));
    }
    if (this.world.life.actProgress.act0Step === "sleep_first_night") {
      const home = getPlayerHomeBase(this.world);
      return [
        {
          id: home.id,
          label: home.name,
          x: home.x,
          y: home.y,
          radius: home.radius
        }
      ];
    }
    if (this.world.life.actProgress.currentAct >= 2 && this.world.life.joinedClubIds.length === 0) {
      return ["berawa_beach", "satu_satu_coffee", "milk_madu_berawa"]
        .map((venueId) => {
          const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
          const label =
            venueId === "berawa_beach" ? "Find beach crew" : venueId === "satu_satu_coffee" ? "Find focus table" : "Find brunch builders";
          return node ? { id: `act2_${venueId}`, label, x: node.x, y: node.y, radius: Math.min(node.radius, scaleDistance(118)) } : null;
        })
        .filter((target): target is { id: string; label: string; x: number; y: number; radius: number } => Boolean(target));
    }
    return [];
  }

  private refreshSettlingInGoals(showToast = true): string {
    const completed = updateSettlingInGoals(this.world);
    if (completed.length > 0) {
      const titles = completed.map((id) => getSettlingInGoalTitle(id)).join(", ");
      const suffix = this.world.life.settledIn ? " Settled in status reached." : "";
      const message = `Goal complete: ${titles}.${suffix}`;
      if (showToast) {
        this.showToast(message);
      }
      return message;
    }
    return "";
  }

  private startCutscene(
    script: CutsceneScript,
    onComplete?: () => void,
    actors?: Map<string, Phaser.GameObjects.Container>
  ): void {
    if (this.activeCutscene) {
      this.finishCutscene(true);
    }
    this.closePanel(false);
    const priorMode = this.mode === "cutscene" ? (this.activeInteriorId ? "interior" : "world") : this.mode;
    const overlay = this.createCutsceneOverlay();
    this.activeCutscene = {
      script,
      elapsedMs: 0,
      priorMode,
      overlay,
      onComplete,
      actors
    };
    this.mode = "cutscene";
    this.player.setVelocity(0, 0);
    this.playSound("toast");
    const firstState = getCutsceneStepState(script, 0);
    if (firstState.step) {
      this.handleCutsceneStepStart(firstState.step);
    }
    this.applyCutsceneVisual(firstState);
  }

  private updateCutscene(delta: number): void {
    const active = this.activeCutscene;
    if (!active) {
      return;
    }
    active.elapsedMs += delta;
    this.syncZoomCompensatedContainer(active.overlay.container);
    this.resizeCutsceneOverlay(active.overlay);
    const state = getCutsceneStepState(active.script, active.elapsedMs);
    if (state.step?.id !== active.activeStepId) {
      active.activeStepId = state.step?.id;
      if (state.step) {
        this.handleCutsceneStepStart(state.step);
      }
    }
    this.applyCutsceneVisual(state);
    if (state.step?.kind === "scripted_walk") {
      this.applyScriptedWalkStep(state.step, state.stepProgress);
    }
    if (state.complete) {
      this.finishCutscene(false);
    }
  }

  private skipActiveCutscene(): void {
    const active = this.activeCutscene;
    if (!active) {
      return;
    }
    const endState = skipCutscene(active.script);
    this.applyCutsceneVisual(endState);
    this.finishCutscene(true);
  }

  private finishCutscene(_skipped: boolean): void {
    const active = this.activeCutscene;
    if (!active) {
      return;
    }
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    active.overlay.container.destroy(true);
    for (const actor of active.actors?.values() ?? []) {
      actor.destroy(true);
    }
    const onComplete = active.onComplete;
    const priorMode = active.priorMode === "cutscene" ? (this.activeInteriorId ? "interior" : "world") : active.priorMode;
    this.activeCutscene = undefined;
    this.mode = priorMode;
    if (this.cutsceneDeferredSave) {
      this.cutsceneDeferredSave = false;
      saveWorldState(this.world);
    }
    onComplete?.();
  }

  private createCutsceneOverlay(): CutsceneOverlay {
    const container = this.createZoomCompensatedContainer(UI_DEPTH * 10);
    const { width, height } = this.scale;
    const dim = this.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0, 0);
    const topBar = this.add.rectangle(0, 0, width, 0, 0x05070a, 1).setOrigin(0, 0);
    const bottomBar = this.add.rectangle(0, height, width, 0, 0x05070a, 1).setOrigin(0, 1);
    const cardScrim = this.add.rectangle(width / 2, height * 0.46, width - 32, 120, 0x070b10, 0.88).setOrigin(0.5).setAlpha(0);
    const title = this.add
      .text(width / 2, height * 0.42, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "900",
        color: "#fff0bd",
        align: "center"
      })
      .setOrigin(0.5)
      .setAlpha(0);
    const subtitle = this.add
      .text(width / 2, height * 0.5, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "15px",
        fontStyle: "700",
        color: "#fff8df",
        align: "center",
        wordWrap: { width: Math.min(560, width - 48) }
      })
      .setOrigin(0.5)
      .setAlpha(0);
    container.add([dim, topBar, bottomBar, cardScrim, title, subtitle]);
    return { container, topBar, bottomBar, dim, cardScrim, title, subtitle };
  }

  private resizeCutsceneOverlay(overlay: CutsceneOverlay): void {
    const { width, height } = this.scale;
    overlay.dim.setSize(width, height);
    overlay.topBar.setSize(width, overlay.topBar.height);
    overlay.bottomBar.setPosition(0, height).setSize(width, overlay.bottomBar.height);
    overlay.title.setPosition(width / 2, height * 0.42);
    overlay.subtitle.setPosition(width / 2, height * 0.5).setWordWrapWidth(Math.min(560, width - 48), true);
    overlay.cardScrim.setSize(Math.min(660, width - 32), overlay.cardScrim.height);
  }

  private handleCutsceneStepStart(step: CutsceneStep): void {
    const active = this.activeCutscene;
    if (!active) {
      return;
    }
    if (step.kind === "camera_pan" && step.target && !this.activeInteriorId) {
      this.cameras.main.stopFollow();
      this.cameras.main.pan(step.target.x, step.target.y, step.durationMs, "Sine.easeInOut", true);
    }
    if (step.kind === "camera_return") {
      this.cameras.main.pan(this.player.x, this.player.y, step.durationMs, "Sine.easeInOut", true);
    }
    if (step.kind === "scripted_walk") {
      active.playerStart = { x: this.player.x, y: this.player.y };
    }
  }

  private applyCutsceneVisual(state: CutsceneStepState): void {
    const active = this.activeCutscene;
    if (!active) {
      return;
    }
    const { overlay } = active;
    const { height } = this.scale;
    const maxBarHeight = Math.min(98, Math.max(62, height * 0.13));
    const step = state.step;
    const barProgress = getCutsceneLetterboxProgress(state);
    const barHeight = maxBarHeight * barProgress;
    overlay.topBar.setSize(this.scale.width, barHeight);
    overlay.bottomBar.setPosition(0, height).setSize(this.scale.width, barHeight);

    const cardVisible = step?.kind === "act_card";
    const cardAlpha = cardVisible ? 1 : 0;
    overlay.dim.setAlpha(0);
    overlay.title.setText(cardVisible ? step.title ?? "" : "").setAlpha(Math.max(0, cardAlpha));
    overlay.subtitle.setText(cardVisible ? step.subtitle ?? "" : "").setAlpha(Math.max(0, cardAlpha));
    const cardTop = overlay.title.y - overlay.title.displayHeight / 2 - 16;
    const cardBottom = overlay.subtitle.y + overlay.subtitle.displayHeight / 2 + 16;
    overlay.cardScrim
      .setPosition(this.scale.width / 2, (cardTop + cardBottom) / 2)
      .setSize(Math.min(660, this.scale.width - 32), Math.max(104, cardBottom - cardTop))
      .setAlpha(Math.max(0, cardAlpha));
  }

  private applyScriptedWalkStep(step: CutsceneStep, progress: number): void {
    const waypoints = step.waypoints;
    if (!waypoints || waypoints.length < 2) {
      return;
    }
    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];
    const x = Phaser.Math.Linear(start.x, end.x, progress);
    const y = Phaser.Math.Linear(start.y, end.y, progress);
    if (step.actorId) {
      this.activeCutscene?.actors?.get(step.actorId)?.setPosition(x, y);
      return;
    }
    this.player.setPosition(x, y);
    this.player.body?.reset(x, y);
  }

  private maybeStartAct2Cutscene(previousAct: number, onComplete?: () => void): boolean {
    if (previousAct >= 2 || this.world.life.actProgress.currentAct < 2) {
      return false;
    }
    const beach = venueMapNodes.find((node) => node.venueId === "berawa_beach");
    const target = beach ? { x: beach.x, y: beach.y } : { x: this.player.x, y: this.player.y + scaleDistance(420) };
    this.startCutscene(buildAct2IntroCutscene(target), onComplete);
    return true;
  }

  private startAct1MoveOutMontage(): void {
    if (isAct1MoveOutComplete(this.world) || this.activeCutscene) return;
    if (!markMoveOutMontageStarted(this.world, this.getAbsoluteMinute())) return;
    saveWorldState(this.world);
    this.startCutscene(buildAct1MoveOutMontage(), () => {
      completeAct1MoveOut(this.world, this.getAbsoluteMinute());
      this.enterSharedRoomAfterMoveOut();
    });
  }

  private enterSharedRoomAfterMoveOut(): void {
    const interior = interiorDefinitions.shared_room_interior;
    const home = getPlayerHomeBase(this.world);
    this.renderInteriorIfNeeded(interior);
    this.activeInteriorId = interior.id;
    this.interiorReturnPoint = { x: home.x, y: home.y };
    this.mode = "interior";
    this.applyInteriorCameraBounds(interior);
    this.layoutForViewport();
    this.hudController.setMinimapHidden(true);
    this.placePlayerSprite(interior.entrance, false);
    this.drawHomeBaseStationMarker();
    this.syncAmbientBed();
    saveWorldState(this.world);
    this.showToast("New home: Bungalow Shared Room. Next: sign the weekly scooter contract.");
  }

  private startAct2FinaleCard(): void {
    const previousAct = this.world.life.actProgress.currentAct;
    if (!startAct2AfterFinale(this.world, this.getAbsoluteMinute())) return;
    saveWorldState(this.world);
    this.maybeStartAct2Cutscene(previousAct);
  }

  private canSleepHere(): boolean {
    if (this.world.life.actProgress.act0Step === "sleep_first_night") {
      return isPlayerAtHomeBase(this.world);
    }
    return isPlayerAtHomeBase(this.world) && canSleepNow(this.world.clock, this.world.meters);
  }

  private isAct0HomeSleepReady(): boolean {
    return canUseHomeSleep(this.world);
  }

  private sleepToMorning(): void {
    this.unlockAudio();
    this.playSound("sleep");
    const { morningPenaltyMessage } = sleepAtHomeUntilMorning(this.world);
    const completedAct0 = completeAct0Step(this.world, "sleep_first_night");
    const rateCut = completedAct0 ? triggerAct1RateCut(this.world, this.getAbsoluteMinute()) : { fired: false };
    if (rateCut.message) {
      appendOpportunityMessage(this.world.opportunities, rateCut.message);
    }
    this.mode = this.activeInteriorId ? "interior" : "world";
    this.updateLighting();
    const ledgerSummary = buildDayLedgerSummary(this.world);
    captureDayLedgerBaseline(this.world);
    saveWorldState(this.world);
    this.showToast(
      completedAct0
        ? `Slept until ${formatClock(this.world)}. Act 1 begins: keep hustling toward rent and your own place.${morningPenaltyMessage}`
        : `Slept until ${formatClock(this.world)}. Energy restored.${morningPenaltyMessage}`
    );
    this.updateOpportunityFeed(0, true);
    const openMorningFlow = () => {
      if (ledgerSummary) {
        this.openDayLedger(ledgerSummary);
        return;
      }
      this.openMorningHand();
    };
    if (completedAct0) {
      this.startCutscene(
        buildAct1IntroCutscene(this.world.life.hustle.rentAmount, this.world.life.hustle.rentDueDay, rateCut.fired),
        openMorningFlow
      );
      return;
    }
    if (ledgerSummary) {
      this.openDayLedger(ledgerSummary);
      return;
    }
    this.openMorningHand();
  }

  private isPickupAvailable(pickup: PickupDefinition): boolean {
    const lastCollected = this.world.collectedPickups[pickup.id];
    if (!lastCollected) {
      return true;
    }
    return this.getAbsoluteMinute() - lastCollected >= pickup.respawnMinutes;
  }

  private getAbsoluteMinute(): number {
    return Math.floor((Math.max(1, this.world.clock.day) - 1) * 1440 + this.world.clock.minuteOfDay);
  }

  private updateOpportunityFeed(delta: number, force = false): void {
    this.phoneBuzzTimer = Math.max(0, this.phoneBuzzTimer - delta);
    this.opportunityUpdateTimer += delta;
    if (!force && this.opportunityUpdateTimer < 5000) {
      return;
    }
    this.opportunityUpdateTimer = 0;

    const beforeUnread = getUnreadOpportunityMessageCount(this.world.opportunities);
    const tutorialActive = !isAct0Complete(this.world);
    const maintenance = tutorialActive
      ? { spawned: [], expired: [] }
      : maintainOpportunityPool(this.world.opportunities, this.world);
    const authoredTexts = tutorialActive ? [] : generateOpportunityPhoneTexts(this.world.opportunities, this.world);
    const kadekRushMessage = tutorialActive
      ? undefined
      : buildKadekRushOfferMessage(this.world, this.getAbsoluteMinute());
    const kadekRushMessageAdded = kadekRushMessage
      ? appendOpportunityMessage(this.world.opportunities, kadekRushMessage)
      : false;
    const madeRoomOfferMessage = tutorialActive
      ? undefined
      : buildMadeRoomOfferMessage(this.world, this.getAbsoluteMinute());
    const madeRoomOfferMessageAdded = madeRoomOfferMessage
      ? appendOpportunityMessage(this.world.opportunities, madeRoomOfferMessage)
      : false;
    const kitchenResidueMessage = tutorialActive
      ? undefined
      : buildKitchenCircleResidueMessage(this.world, this.getAbsoluteMinute());
    const kitchenResidueMessageAdded = kitchenResidueMessage
      ? appendOpportunityMessage(this.world.opportunities, kitchenResidueMessage)
      : false;
    const structuralUnlockMessagesAdded = tutorialActive
      ? 0
      : buildStructuralUnlockMessages(this.world, this.getAbsoluteMinute())
          .filter((message) => appendOpportunityMessage(this.world.opportunities, message)).length;
    const leoCadenceMessageAdded = tutorialActive
      ? false
      : flushAct1LeoCadence(this.world, this.getAbsoluteMinute());
    const eventMessages = tutorialActive ? 0 : this.appendActiveEventMessages();
    const afterUnread = getUnreadOpportunityMessageCount(this.world.opportunities);
    const changed =
      maintenance.spawned.length > 0 ||
      maintenance.expired.length > 0 ||
      authoredTexts.length > 0 ||
      kadekRushMessageAdded ||
      madeRoomOfferMessageAdded ||
      kitchenResidueMessageAdded ||
      structuralUnlockMessagesAdded > 0 ||
      leoCadenceMessageAdded ||
      eventMessages > 0;

    if (afterUnread > beforeUnread) {
      this.phoneBuzzTimer = 1800;
      if (!force && this.mode === "world") {
        this.showToast("Something nearby just kicked off. Look for the scene, then use the phone for details.");
      }
    }
    if (changed) {
      saveWorldState(this.world);
      this.phone?.refresh();
    }
  }

  private isOverlayOpen(): boolean {
    return this.mode !== "world" && this.mode !== "interior" && this.mode !== "warungRush";
  }

  private updateOverlayChrome(): void {
    this.hudController.setOverlayOpen(this.isOverlayOpen());
  }

  private appendActiveEventMessages(): number {
    const now = getOpportunityAbsoluteMinute(this.world.clock);
    let added = 0;
    for (const event of getActiveEvents(this.world.clock, this.world)) {
      const venue = getVenue(event.locationVenueId);
      const message = event.crewSession
        ? buildCrewSessionOpenMessage(
            this.world,
            event,
            now,
            this.world.clock.day,
            venue?.name ?? event.locationVenueId
          )
        : {
            id: `event-start:${event.id}:${this.world.clock.day}`,
            at: now,
            from: "Calendar",
            body: `${event.title} is happening now at ${venue?.name ?? event.locationVenueId}. Go on-site and press E to join.`,
            venueId: event.locationVenueId,
            read: false
          };
      if (!message) continue;
      const ok = appendOpportunityMessage(this.world.opportunities, message);
      if (ok) {
        added += 1;
      }
    }
    return added;
  }

  private acceptPhoneOpportunity(opportunityId: string): void {
    const result = acceptOpportunity(this.world.opportunities, opportunityId, getOpportunityAbsoluteMinute(this.world.clock));
    this.showToast(result.message);
    saveWorldState(this.world);
  }

  private acceptPhoneDelivery(deliveryId: string): ReturnType<typeof acceptDelivery> {
    const result = acceptDelivery(this.world, deliveryId, this.getAbsoluteMinute());
    this.showToast(result.ok ? `${result.message} Follow the delivery marker.` : result.message);
    saveWorldState(this.world);
    return result;
  }

  private devOpenPhoneTab(tab: string): DevProofInteractionResult {
    const phoneTab = parsePhoneTab(tab);
    if (!phoneTab) {
      return { ok: false, message: `Unknown phone tab: ${tab}.` };
    }
    if (this.phone?.isOpen) {
      this.phone.open(phoneTab);
      return { ok: true, message: `${phoneTab} opened.` };
    }
    if (this.mode !== "world") {
      return { ok: false, message: `Phone cannot open while mode=${this.mode}.` };
    }
    this.mode = "phone";
    this.phone?.open(phoneTab);
    return { ok: true, message: `${phoneTab} opened.` };
  }

  private devOpenVenuePanel(venueId: string): DevProofInteractionResult {
    if (!getVenueActivityContext(venueId)) {
      return { ok: false, message: `Unknown venue activity context: ${venueId}.` };
    }
    if (this.mode !== "world" && this.mode !== "interior") {
      return { ok: false, message: `Venue panel cannot open while mode=${this.mode}.` };
    }
    this.openVenueActivityMenu(venueId);
    return { ok: true, message: `${venueId} venue panel opened.` };
  }

  private devEnterInterior(interiorId: string): DevProofInteractionResult {
    if (!interiorDefinitions[interiorId]) {
      return { ok: false, message: `Unknown interior: ${interiorId}.` };
    }
    if (this.mode !== "world") {
      return { ok: false, message: `Interior cannot open while mode=${this.mode}.` };
    }
    this.enterInterior(interiorId);
    return { ok: true, message: `${interiorId} entered.` };
  }

  private devGetBoardOffers(): DevProofBoardOffer[] {
    return getDeliveryOfferAvailability(this.world).map((offer) => ({
      id: offer.delivery.id,
      label: offer.delivery.title,
      available: offer.available,
      reason: offer.reason
    }));
  }

  private devClickDialogueOption(index: number): DevProofInteractionResult {
    if (!Number.isInteger(index) || index < 0) {
      return { ok: false, message: `Dialogue option index must be a non-negative integer.` };
    }
    const options = document.querySelectorAll<HTMLButtonElement>(".bali-life-dialogue-choice");
    const option = options.item(index);
    if (!option) {
      return { ok: false, message: `Dialogue option ${index} is not available.` };
    }
    option.click();
    return { ok: true, message: `Dialogue option ${index} selected.` };
  }

  private payPhoneRent(): void {
    const previousAct = this.world.life.actProgress.currentAct;
    const result = payHustleRent(this.world, this.getAbsoluteMinute());
    this.showToast(result.message);
    saveWorldState(this.world);
    if (result.ok) {
      this.maybeStartAct2Cutscene(previousAct);
    }
  }

  private repairPhoneScooter(): void {
    const result = repairScooter(this.world, this.getAbsoluteMinute());
    this.showToast(result.message);
    if (result.ok) {
      this.updatePlayerBikeVisual();
    }
    saveWorldState(this.world);
  }

  private upgradePhoneScooter(): void {
    const result = upgradeToDailyScooter(this.world, this.getAbsoluteMinute());
    this.showToast(result.message);
    if (result.ok) {
      this.updatePlayerBikeVisual();
    }
    saveWorldState(this.world);
  }

  private trackPhoneOpportunity(opportunityId: string): void {
    const live = this.world.opportunities.live.find((candidate) => candidate.id === opportunityId);
    if (!live) {
      this.showToast("That opportunity is no longer available.");
      return;
    }
    this.world.opportunities.trackedOpportunityId = opportunityId;
    this.showToast("Opportunity tracked on the phone feed.");
    saveWorldState(this.world);
  }

  private markPhoneFeedRead(): void {
    const hadUnread = getUnreadOpportunityMessageCount(this.world.opportunities) > 0;
    if (hadUnread) markOpportunityMessagesRead(this.world.opportunities);
    const leoCadenceMessageAdded = flushAct1LeoCadence(this.world, this.getAbsoluteMinute());
    if (!hadUnread && !leoCadenceMessageAdded) return;
    const unread = getUnreadOpportunityMessageCount(this.world.opportunities);
    this.phoneBuzzTimer = unread > 0 ? 1800 : 0;
    this.hudController.updatePhoneBadge(unread, unread > 0);
    saveWorldState(this.world);
    if (leoCadenceMessageAdded) this.phone?.refresh();
  }

  private saveGame(): void {
    if (this.requestSave()) {
      this.showToast("Game saved locally.");
    } else {
      this.showToast("Save queued until the scene finishes.");
    }
  }

  private sendFeedback(): void {
    if (typeof window === "undefined") {
      return;
    }
    const objective = formatFieldObjectiveLine(getFieldObjective(this.world));
    window.location.href = createFeedbackMailto(this.world, {
      buildStamp: BUILD_STAMP,
      sessionStartedAt: this.sessionStartedAt,
      now: Date.now(),
      lastObjectiveLine: objective
    });
  }

  private requestSave(): boolean {
    if (this.activeCutscene) {
      this.cutsceneDeferredSave = true;
      return false;
    }
    saveWorldState(this.world);
    return true;
  }

  private dispatchIntent(intent: GameIntent): IntentResult {
    this.network.pushIntent(intent);
    return this.dispatcher.dispatch(intent, this.world, this.getAbsoluteMinute());
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    this.unlockAudio();
    this.finishPayoutCelebration();
    if (this.activeCutscene) {
      this.skipActiveCutscene();
      return;
    }
    this.hudController.handlePointerDown(pointer, this.mode);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    this.hudController.handlePointerMove(pointer);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    this.hudController.handlePointerUp(pointer);
  }

  private directionFromVector(vector: Phaser.Math.Vector2): Direction {
    if (Math.abs(vector.x) > Math.abs(vector.y)) {
      return vector.x < 0 ? "left" : "right";
    }
    return vector.y < 0 ? "up" : "down";
  }

  private applyCharacterAnimation(
    sprite: Phaser.GameObjects.Sprite,
    spriteKey: string,
    direction: Direction,
    moving: boolean,
    scale: number,
    scaleY = scale
  ): void {
    const animation = selectCharacterAnimation(spriteKey, direction, moving);
    sprite.play(animation.key, true);
    this.setSpriteFacing(sprite, animation.facingLeft, scale, scaleY);
  }

  private setSpriteFacing(sprite: Phaser.GameObjects.Components.Transform, facingLeft: boolean, scale: number, scaleY = scale): void {
    sprite.setScale(facingLeft ? -scale : scale, scaleY);
  }

  private layoutForViewport(): void {
    const { width, height } = this.scale;
    const interior = this.getActiveInterior();
    if (interior) {
      this.applyInteriorCameraBounds(interior);
      this.hudController?.setMinimapHidden(true);
    } else {
      this.cameras.main.setZoom(width < 720 ? STREET_CAMERA.mobileZoom : STREET_CAMERA.desktopZoom);
      this.applyWorldCameraBounds();
    }
    this.syncHudLayerToCamera();
    this.syncZoomCompensatedContainer(this.nightOverlayLayer);
    if (this.activeCutscene) {
      this.syncZoomCompensatedContainer(this.activeCutscene.overlay.container);
      this.resizeCutsceneOverlay(this.activeCutscene.overlay);
    }
    this.promptText.setPosition(16, height - 44);
    this.toastText
      .setPosition(width / 2, Math.max(92, height * 0.17))
      .setFontSize(width < 420 ? 14 : 16)
      .setWordWrapWidth(Math.max(220, Math.min(520, width - 48)), true);
    this.hudController.layoutTouchControls();
    this.redrawHudChrome();
  }

  private redrawHudChrome(): void {
    this.hudChrome.clear();
    this.drawHudChipBackplate(this.timeText);
    this.drawHudChipBackplate(this.questText);
    this.drawHudChipBackplate(this.wantedChipText);
    this.drawHudChipBackplate(this.depositChipText);
    this.drawHudChipBackplate(this.bikeChipText);
    this.drawHudChipBackplate(this.cargoChipText);
    this.drawHudChipBackplate(this.promptText);
  }

  private drawHudChipBackplate(text: Phaser.GameObjects.Text): void {
    if (!text.visible || text.text.trim().length === 0) {
      return;
    }
    const padX = 8;
    const padY = 5;
    const x = text.x - text.displayWidth * text.originX - padX;
    const y = text.y - text.displayHeight * text.originY - padY;
    const width = text.displayWidth + padX * 2;
    const height = text.displayHeight + padY * 2;
    text.getBounds();
    this.hudChrome.fillStyle(0x101820, 0.72);
    this.hudChrome.fillRoundedRect(x, y, width, height, 6);
    this.hudChrome.lineStyle(1, 0xf4d58d, 0.28);
    this.hudChrome.strokeRoundedRect(x, y, width, height, 6);
  }

  private syncHudLayerToCamera(): void {
    if (!this.hudLayer) {
      return;
    }
    this.syncZoomCompensatedContainer(this.hudLayer);
  }

  private createZoomCompensatedContainer(depth: number): Phaser.GameObjects.Container {
    const camera = this.cameras.main;
    return this.add
      .container(camera.worldView.x, camera.worldView.y)
      .setScrollFactor(1)
      .setDepth(depth)
      .setScale(getPhoneCameraScale(camera.zoom || 1));
  }

  private syncZoomCompensatedContainer(container: Phaser.GameObjects.Container): void {
    const camera = this.cameras.main;
    container
      .setPosition(camera.worldView.x, camera.worldView.y)
      .setScale(getPhoneCameraScale(camera.zoom || 1));
  }

  private showToast(message: string): void {
    if (this.toastTimer > 0 && this.toastText?.text === message) {
      return;
    }
    if (this.toastQueue.at(-1) === message) {
      return;
    }
    this.toastQueue.push(message);
    while (this.toastQueue.length > 4) {
      this.toastQueue.shift();
    }
  }

  private updateToastVisual(delta: number): void {
    if (shouldPauseQueuedFeedback(Boolean(this.activeCutscene), Boolean(this.phone?.activeStoryMomentId))) {
      this.toastText.setAlpha(0);
      return;
    }
    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - delta);
      const elapsed = TOAST_DURATION_MS - this.toastTimer;
      const fadeIn = Math.min(1, elapsed / TOAST_FADE_IN_MS);
      const fadeOut = this.toastTimer < TOAST_FADE_OUT_MS ? Math.max(0, this.toastTimer / TOAST_FADE_OUT_MS) : 1;
      this.toastText.setAlpha(Math.min(fadeIn, fadeOut));
      if (this.toastTimer <= 0) {
        this.toastText.setAlpha(0);
        this.toastGapTimer = TOAST_GAP_MS;
      }
      return;
    }

    if (this.toastGapTimer > 0) {
      this.toastGapTimer = Math.max(0, this.toastGapTimer - delta);
      this.toastText.setAlpha(0);
      return;
    }

    const nextToast = this.toastQueue.shift();
    if (nextToast) {
      this.toastText.setText(nextToast);
      this.toastTimer = TOAST_DURATION_MS;
      this.toastText.setAlpha(0);
      this.playSound("toast");
      return;
    }

    this.toastText.setAlpha(0);
  }

  private unlockAudio(): void {
    this.soundManager.unlock();
  }

  private playSound(cue: SoundCue): void {
    this.soundManager.play(cue);
  }

  private playUiClick(): void {
    this.unlockAudio();
    this.finishPayoutCelebration();
    this.playSound("uiClick");
  }

  private setAudioMuted(muted: boolean): void {
    this.soundManager.setMuted(muted);
    this.showToast(muted ? "Audio muted." : "Audio on.");
    this.phone?.refresh();
  }

  private publishDebugSnapshot(target: InteractionTarget | undefined, fieldObjective: FieldObjectiveState): void {
    if (typeof window === "undefined") {
      return;
    }

    const membershipDebug = getMembershipDebugState(this.world);
    const snapshot: BaliLifeDebugSnapshot = {
      schemaVersion: this.world.schemaVersion,
      mode: this.mode,
      overlayOpen: this.isOverlayOpen(),
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.playerState.direction,
        hasBike: this.playerState.hasBike,
        onBike: this.playerState.onBike,
        bikeStuck: this.playerState.bikeStuck,
        bikeCondition: this.playerState.bikeCondition,
        safety: this.playerState.safety
      },
      money: this.playerState.money,
      focus: this.world.meters.focus,
      socialEnergy: this.world.meters.social,
      connections: this.playerState.connections,
      meters: { ...this.world.meters },
      reputation: getReputationScore(this.world.reputation),
      wantedLevel: getWantedLevel(this.world.reputation),
      bounty: getBounty(this.world.reputation),
      reputationTags: [...this.world.reputation.tags],
      lifestyleTags: [...this.world.profile.lifestyleTags],
      portal: `${this.world.portal.current}:${this.world.portal.multiplayerStatus}`,
      act0Step: this.world.life.actProgress.act0Step,
      phoneStoryMoment: this.phone?.activeStoryMomentId ?? null,
      phoneStoryStep: this.phone?.activeStoryMomentStep ?? null,
      deposit: getAct0DepositState(this.world),
      act0CriticalPathMenuOpens: getAct0CriticalPathMenuOpenCount(this.world),
      act0StormTriggerCount: getAct0StormTriggerCount(this.world),
      currentAct: this.world.life.actProgress.currentAct,
      completedDeliveryCount: this.world.life.hustle.completedDeliveryCount,
      rateCutFired: Boolean(this.world.collectedPickups.act1_nusadrop_rate_cut_fired),
      kadekPriority: Boolean(this.world.collectedPickups.act1_kadek_priority_driver),
      breakdownFired: Boolean(this.world.collectedPickups[ACT1_BREAKDOWN_FLAG]),
      breakdownPushActive: isAct1BreakdownPushActive(this.world),
      scooterBlown: isAct1ScooterBlown(this.world),
      driverRating: this.world.life.hustle.driverRating,
      activeDelivery: this.world.life.hustle.activeDelivery?.deliveryId ?? null,
      activeDeliveryStage: this.world.life.hustle.activeDelivery?.stage ?? null,
      activeDeliveryDueAt: this.world.life.hustle.activeDelivery?.dueAt ?? null,
      deliveryRideRun: this.world.life.hustle.activeDelivery?.rideRun
        ? { ...this.world.life.hustle.activeDelivery.rideRun }
        : null,
      cutscene: this.activeCutscene
        ? {
            id: this.activeCutscene.script.id,
            stepId: this.activeCutscene.activeStepId ?? null,
            elapsedMs: Math.round(this.activeCutscene.elapsedMs)
          }
        : null,
      fieldObjective,
      fieldObjectiveLine: formatFieldObjectiveLine(fieldObjective),
      worldSceneAudit: getFieldFirstDiscoveryAudit(this.world),
      relationshipCount: this.world.relationships.length,
      inventory: formatInventory(this.playerState.inventory),
      activeQuestIds: [...this.playerState.activeQuestIds],
      completedQuestIds: [...this.playerState.completedQuestIds],
      joinedClubIds: membershipDebug.joinedClubIds,
      crewStates: getKnownCrewStates(this.world),
      joinedGroupIds: membershipDebug.legacyJoinedGroupIds,
      legacyJoinedGroupIds: membershipDebug.legacyJoinedGroupIds,
      prompt: this.promptText.text,
      time: formatClock(this.world),
      timePhase: getTimePhase(this.world.clock.minuteOfDay),
      authoredDay1Clock: { ...this.authoredDay1Clock },
      weather: { ...this.weather.state },
      ambientBed: this.soundManager.currentAmbientBed,
      rainDropCount: isWeatherWet(this.weather.state) && !this.activeInteriorId ? (this.scale.width <= 480 ? 72 : 128) : 0,
      fps: Math.round(this.game.loop.actualFps * 10) / 10,
      activeGroupId: this.playerState.activeGroupId,
      groupTravelMode: this.playerState.groupTravelMode,
      groupHelpers: this.countGroupHelpers(),
      touchControlsVisible: this.hudController.touchControlsVisible,
      nearestInteraction: target?.label,
      movementSpeedMultiplier: this.movementSpeedMultiplier,
      discoveredAreaIds: [...this.world.mapDiscovery.discoveredAreaIds],
      discoveredVenueIds: [...this.world.mapDiscovery.discoveredVenueIds],
      revealAllMap: this.world.mapDiscovery.revealAll,
      trafficHitCooldown: Math.round(this.trafficHitCooldown),
      npcRoutines: Object.fromEntries(
        Object.entries(this.world.npcs).map(([id, state]) => [id, state.currentRoutineId])
      ),
      objectiveTargets: this.getFieldObjectiveTargets(fieldObjective).map((t) => ({
        x: Math.round(t.x),
        y: Math.round(t.y)
      })),
      activeInteriorId: this.activeInteriorId,
      interiorExit: (() => {
        const interior = this.getActiveInterior();
        return interior ? { x: Math.round(interior.exitMat.x), y: Math.round(interior.exitMat.y) } : null;
      })(),
      interiorTransitioning: this.interiorTransitioning,
      ride: getRideTelemetry(this.rideModelOutput, this.playerState.onBike),
      updatedAt: Date.now()
    };

    window.__BALI_LIFE_DEBUG__ = snapshot;

    let debugNode = document.getElementById("bali-life-debug");
    if (!debugNode) {
      debugNode = document.createElement("pre");
      debugNode.id = "bali-life-debug";
      debugNode.setAttribute("data-testid", "bali-life-debug");
      debugNode.hidden = true;
      document.body.appendChild(debugNode);
    }
    debugNode.textContent = JSON.stringify(snapshot);
  }

  private mapLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "14px",
      color: "#fff8df",
      fontStyle: "700"
    };
  }

  private signStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "13px",
      color: "#fff8df",
      fontStyle: "700",
      align: "center"
    };
  }

  private hudTextStyle(size: number): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: `${size}px`,
      color: "#fff8df",
      lineSpacing: 4
    };
  }

  private panelTitleStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "24px",
      color: "#fff0bd",
      fontStyle: "700"
    };
  }

  private panelSectionStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "15px",
      color: "#f4d58d",
      fontStyle: "700"
    };
  }

  private panelBodyStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "15px",
      color: "#fff8df",
      lineSpacing: 5
    };
  }

  private panelHintStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "13px",
      color: "#d7c59b"
    };
  }
}
