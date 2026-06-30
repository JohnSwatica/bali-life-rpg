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
import { itemDefinitions } from "../data/items";
import { playerHomeBase } from "../data/homeBase";
import { collisionRects, pickupDefinitions, WORLD_HEIGHT, WORLD_WIDTH } from "../data/map";
import { npcDefinitions } from "../data/npcs";
import { questDefinitions } from "../data/quests";
import { shopDefinitions } from "../data/shops";
import { getDeliveryDefinition } from "../data/deliveries";
import { getStreetVenueFlavor } from "../data/streetVenueFlavors";
import { addItem, formatInventory, getQuantity, removeItem } from "../systems/Inventory";
import { LocalNetworkAdapter, type NetworkAdapter } from "../systems/NetworkAdapter";
import { clearSave, loadWorldState, saveWorldState } from "../systems/Persistence";
import { ScriptedDialogueProvider, type DialogueProvider } from "../systems/dialogue/DialogueProvider";
import { getAmbientNpcLine, getNpcDialogueSurface } from "../systems/dialogue/DialoguePresentation";
import { InteractionController, type InteractionTarget } from "../systems/interaction/InteractionController";
import { InputController, type GameKeyMap } from "../systems/input/InputController";
import { IntentDispatcher, type IntentResult } from "../systems/intents/IntentDispatcher";
import {
  formatFieldObjectiveLine,
  getFieldObjective,
  type FieldObjectiveState,
  type FieldObjectiveTargetRef
} from "../systems/guidance/FieldObjective";
import { getFieldIndicators, type VenueFieldIndicator } from "../systems/guidance/FieldIndicators";
import {
  getEventWorldScenes,
  getOpportunityWorldScenes,
  type EventWorldScene,
  type OpportunityWorldScene,
  type WorldSceneActor
} from "../systems/world/WorldScenes";
import { getSocialGroupsForVenue, isSocialGroupJoined } from "../systems/groups/GroupRegistry";
import { PLAYER_UNIT, POKEMON_SCALE } from "../systems/map/PlayerUnitScale";
import { getPresentedRoads, getVenueSnapRoads } from "../systems/map/RoadPresentation";
import { renderStreetTemplate } from "../systems/map/StreetRenderer";
import { STREET_CAMERA } from "../systems/map/TileStreetScale";
import { scaleDistance, scalePoint } from "../systems/map/WorldScale";
import {
  advanceNpcRouteMotion,
  getActiveNpcRoute,
  getNpcRouteActivityLabel,
  type NpcRouteMotionState
} from "../systems/npcs/NpcRoutineRoutes";
import { getNpcIdleCue, getNpcIdleTag, getNpcIdleVisual } from "../systems/npcs/NpcIdleBehavior";
import {
  getNpcProximityReaction as resolveNpcProximityReaction,
  type NpcProximityReaction
} from "../systems/npcs/NpcProximityReactions";
import { adjustPlayerMeters } from "../systems/meters/PlayerMeters";
import {
  createActiveMinigame,
  getActivityMinigameDefinition,
  getOpportunityMinigameDefinition,
  resolvePerformanceScore,
  rewardMultiplier,
  scoreChoice,
  scoreTimingAttempt
} from "../systems/minigames/ActivityMinigames";
import { getActiveEvents, getActiveEventsAtVenue, isEventActive } from "../systems/events/EventScheduler";
import { advanceWorldMinutes, canSleepNow, sleepUntilNextMorning } from "../systems/time/DailyClock";
import {
  applyActivity,
  getActivityAvailability,
  getVenueActivityContext,
  type VenueActivityContext
} from "../systems/life/ActivityEngine";
import { getSettlingInGoalTitle, updateSettlingInGoals } from "../systems/life/SettlingInGoals";
import { completeAct0Step, isAct0Complete, markAct0MealProgress } from "../systems/life/ActProgression";
import { canUseHomeSleep, isPlayerAtHomeBase } from "../systems/life/HomeBase";
import { acceptDelivery, completeDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { payHustleRent, repairScooter, upgradeToDailyScooter } from "../systems/hustle/HustleEconomy";
import {
  acceptOpportunity,
  appendOpportunityMessage,
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
import { bumpRelationshipAffinity, getRelationship } from "../systems/relationships/RelationshipMemory";
import { completeNextRelationshipArcBeat } from "../systems/relationships/RelationshipArcs";
import {
  clearWantedStanding,
  getBounty,
  getReputationScore,
  getWantedLevel,
  recordRecklessDamageFlag,
  reduceWantedStanding
} from "../systems/reputation/ReputationState";
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
  advanceClock,
  formatClock,
  getLocalPlayer,
  getTimePhase
} from "../systems/WorldState";
import { isQuestActive, isQuestComplete, startQuest } from "../systems/QuestSystem";
import { resolveNpcQuestInteraction } from "../systems/quests/QuestRegistry";
import { HudController } from "../ui/hud/HudController";
import { PhoneShell } from "../ui/phone/PhoneShell";
import { getAllVenues, getVenue } from "../systems/venues/VenueRegistry";
import type {
  Direction,
  ActiveActivityState,
  GameEvent,
  GameIntent,
  GroupTravelMode,
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

type Mode = "world" | "dialogue" | "shop" | "inventory" | "activity" | "committedActivity" | "community" | "phone" | "godmode";

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
  driverRating: number;
  activeDelivery: string | null;
  fieldObjective: FieldObjectiveState;
  fieldObjectiveLine: string;
  relationshipCount: number;
  inventory: string[];
  activeQuestIds: string[];
  completedQuestIds: string[];
  joinedGroupIds: string[];
  prompt: string;
  time: string;
  timePhase: string;
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
  updatedAt: number;
}

declare global {
  interface Window {
    __BALI_LIFE_DEBUG__?: BaliLifeDebugSnapshot;
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

interface TrafficBikeRuntime {
  sprite: Phaser.GameObjects.Sprite;
  route: TrafficRouteDefinition;
  targetIndex: number;
  direction: 1 | -1;
  speed: number;
  velocity: Phaser.Math.Vector2;
  seed: number;
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
const BIKE_SPEED = scaleDistance(345);
const GROUP_WALK_SPEED = scaleDistance(92);
const GROUP_BIKE_SPEED = scaleDistance(255);
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

function formatMeterDeltaSummary(deltas: Partial<Record<Meter, number>>): string {
  const parts = Object.entries(deltas)
    .filter(([, value]) => typeof value === "number" && value !== 0)
    .map(([meter, value]) => `${meter} ${formatSigned(Number(value))}`);
  return parts.join(", ");
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
  private npcAmbientLineLabels = new Map<string, Phaser.GameObjects.Text>();
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
  private hudController!: HudController;
  private phone?: PhoneShell;
  private godmodePanel?: Phaser.GameObjects.Container;
  private movementSpeedMultiplier = 1;
  private discoveryLabels: Array<{ subjectType: "area" | "venue"; id: string; label: Phaser.GameObjects.Text }> = [];
  private unsubscribeNetwork?: () => void;
  private networkPushTimer = 0;
  private autosaveTimer = 0;
  private opportunityUpdateTimer = 0;
  private phoneBuzzTimer = 0;

  private hudChrome!: Phaser.GameObjects.Graphics;
  private timeText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private questText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;
  private toastTimer = 0;
  private panel?: Phaser.GameObjects.Container;
  private dialogueOverlay?: HTMLElement;
  private committedActivity?: ActiveActivityState;
  private committedActivityOverlay?: HTMLElement;
  private committedActivityProgress?: HTMLDivElement;
  private committedActivityStatus?: HTMLDivElement;
  private committedMinigameMarker?: HTMLDivElement;
  private committedMinigameFeedback?: HTMLDivElement;
  private nightOverlay!: Phaser.GameObjects.Graphics;
  private lanternGlow!: Phaser.GameObjects.Graphics;
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

  create(): void {
    this.world = loadWorldState();
    this.playerState = getLocalPlayer(this.world);
    this.phone = new PhoneShell({
      scene: this,
      getWorld: () => this.world,
      dispatcher: this.dispatcher,
      getNow: () => this.getAbsoluteMinute(),
      save: () => saveWorldState(this.world),
      toast: (message) => this.showToast(message),
      onOpportunityAccept: (opportunityId) => this.acceptPhoneOpportunity(opportunityId),
      onOpportunityTrack: (opportunityId) => this.trackPhoneOpportunity(opportunityId),
      onDeliveryAccept: (deliveryId) => this.acceptPhoneDelivery(deliveryId),
      onPayRent: () => this.payPhoneRent(),
      onRepairScooter: () => this.repairPhoneScooter(),
      onUpgradeScooter: () => this.upgradePhoneScooter(),
      onFeedViewed: () => this.markPhoneFeedRead(),
      onClose: () => {
        if (this.mode === "phone") {
          this.mode = "world";
        }
      }
    });

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
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
    this.updateMapDiscovery(true);
    this.resumeCommittedActivityIfNeeded();
    this.updateOpportunityFeed(0, true);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.layoutForViewport();

    this.unsubscribeNetwork = this.network.subscribeToWorldPatches(() => undefined);
    void this.network.connect(this.world);

    this.showToast("Welcome to Berawa near FINNS. Press E near people, venues, and pickups.");
    this.openFirstRunHint();
  }

  update(_time: number, delta: number): void {
    advanceClock(this.world, delta);
    this.discoveryToastCooldown = Math.max(0, this.discoveryToastCooldown - delta);
    this.waterBoundaryToastCooldown = Math.max(0, this.waterBoundaryToastCooldown - delta);
    this.autosaveTimer += delta;
    if (this.autosaveTimer > 15000) {
      this.autosaveTimer = 0;
      saveWorldState(this.world);
    }

    this.updatePlayer(delta);
    this.updateMapDiscovery();
    this.updateTraffic(delta);
    this.updateWantedOffenders(delta);
    this.updateGroupLine(delta);
    this.updateNpcRoutines(delta);
    this.updateAmbientNpcs(delta);
    this.updatePickups();
    this.updateOpportunityFeed(delta);
    this.updateCommittedActivity(delta);
    this.updateHud(delta);
    this.updateLighting();
    this.updateDynamicObjectCulling();
  }

  destroy(): void {
    this.destroyDialogueOverlay();
    this.destroyCommittedActivityOverlay();
    this.unsubscribeNetwork?.();
    this.network.disconnect();
  }

  private drawNeighborhood(): void {
    renderStreetTemplate(this, activeStreetTemplate);
    this.opportunityMarkerLayer = this.add.graphics().setDepth(210);
    this.deliveryMarkerLayer = this.add.graphics().setDepth(211);
    this.fieldIndicatorLayer = this.add.graphics().setDepth(212);
    this.worldSceneLayer = this.add.graphics().setDepth(213);
    this.addAreaLabels();
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
    for (const node of venueMapNodes) {
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
    this.player = this.physics.add.sprite(this.playerState.x, this.playerState.y, "player");
    this.applyCharacterAnimation(this.player, "player", this.playerState.direction, false, CHARACTER_SPRITE_SCALE);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(this.player.y);
    this.player.body?.setSize(PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT);
    this.player.body?.setOffset(PLAYER_BODY_OFFSET_X, PLAYER_BODY_OFFSET_Y);
    this.playerBike = this.add.sprite(this.playerState.x, this.playerState.y + scaleDistance(10), "player-bike").setVisible(false);
    this.playerBikeSpeedCue = this.add.graphics().setVisible(false);
    this.physics.add.collider(this.player, this.obstacleGroup);
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
      getNpcSprite: (npcId) => this.npcSprites.get(npcId),
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
        if (this.godmodePanel) {
          this.closeGodmodePanel();
        } else if (this.mode === "committedActivity") {
          this.cancelCommittedActivity();
        } else if (this.phone?.isOpen) {
          this.phone.close();
        } else {
          this.closePanel();
        }
      },
      save: () => this.saveGame(),
      reset: () => {
        clearSave();
        this.world = loadWorldState();
        this.playerState = getLocalPlayer(this.world);
        this.player.setPosition(this.playerState.x, this.playerState.y);
        this.clearGroupLine();
        this.updatePlayerBikeVisual();
        this.showToast("Save cleared. New neighbor day started.");
      }
    });
    if (!bindings) {
      return;
    }

    this.cursors = bindings.cursors;
    this.keys = bindings.keys;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.handlePointerUp(pointer));
    this.scale.on("resize", () => this.layoutForViewport());
  }

  private createHud(): void {
    this.hudChrome = this.add.graphics().setScrollFactor(0).setDepth(UI_DEPTH);
    this.timeText = this.add.text(20, 16, "", this.hudTextStyle(16)).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    this.moneyText = this.add.text(20, 42, "", this.hudTextStyle(16)).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    this.questText = this.add.text(20, 92, "", this.hudTextStyle(14)).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    this.promptText = this.add.text(20, 0, "", this.hudTextStyle(15)).setScrollFactor(0).setDepth(UI_DEPTH + 1);
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
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 3)
      .setAlpha(0);
    this.objectiveArrowLayer = this.add.graphics().setScrollFactor(0).setDepth(UI_DEPTH + 2);
    this.nightOverlay = this.add.graphics().setScrollFactor(0).setDepth(900);
    this.lanternGlow = this.add.graphics().setDepth(905);
    this.hudController = new HudController(this, UI_DEPTH, {
      action: () => this.handleAction(),
      inventory: () => this.toggleInventory(),
      community: () => this.toggleCommunityBoard(),
      bike: () => this.toggleBike(),
      phone: () => this.togglePhone(),
      save: () => this.saveGame()
    });
    this.hudController.createTouchControls();
    this.layoutForViewport();
  }

  private updatePlayer(delta: number): void {
    if (!this.player.body) {
      return;
    }

    const movement = this.inputController.getMovementVector(this.mode, this.cursors, this.keys, this.hudController.joystickVector);

    if (movement.lengthSq() > 0) {
      movement.normalize();
      const baseSpeed = this.playerState.onBike && !this.playerState.bikeStuck ? BIKE_SPEED : WALK_SPEED;
      const speed = baseSpeed * this.movementSpeedMultiplier;
      this.player.setVelocity(movement.x * speed, movement.y * speed);
      this.playerState.direction = this.directionFromVector(movement);
    } else {
      this.player.setVelocity(0, 0);
    }
    const walkingOnFoot = movement.lengthSq() > 0 && !this.playerState.onBike;
    this.applyCharacterAnimation(this.player, "player", this.playerState.direction, walkingOnFoot, CHARACTER_SPRITE_SCALE);

    this.enforceWaterBoundary();

    this.playerState.x = Math.round(this.player.x);
    this.playerState.y = Math.round(this.player.y);
    this.player.setDepth(this.player.y);
    this.updatePlayerBikeVisual(delta);
    this.checkBikeTerrain();
    this.checkPlayerBikeHarmToOthers();
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
    const visible = this.playerState.onBike || this.playerState.bikeStuck;
    const bodyVelocity = this.player.body?.velocity;
    const visual = getScooterVisualState({
      tier: this.world.life.hustle.scooterTier,
      bikeCondition: this.playerState.bikeCondition,
      velocityX: visible ? bodyVelocity?.x ?? 0 : 0,
      velocityY: visible ? bodyVelocity?.y ?? 0 : 0,
      maxSpeed: BIKE_SPEED * this.movementSpeedMultiplier,
      elapsedMs: this.scooterMotionElapsedMs
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
    for (const bike of this.trafficBikes) {
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
    this.applyTrafficKnockback(source);
    this.cameras.main.shake(180, 0.006);
    this.spawnHitSplash(this.player.x, this.player.y);
    this.spawnFloatingText("Ouch!", this.player.x, this.player.y - scaleDistance(34), "#ffdfb3");
    if (moneyLoss > 0) {
      this.spawnCashBurst(this.player.x, this.player.y, moneyLoss);
      this.spawnFloatingText(`-Rp ${moneyLoss}`, this.player.x + scaleDistance(20), this.player.y - scaleDistance(12), "#fff0bd");
    }
    saveWorldState(this.world);
    this.showToast(`A passing scooter clipped you. Safety -12, Focus -5${moneyLoss > 0 ? `, Rp -${moneyLoss}` : ""}.`);
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
    const edgeMargin = scaleDistance(28);
    const nextX = Phaser.Math.Clamp(this.player.x + knockback.x * TRAFFIC_KNOCKBACK_DISTANCE, edgeMargin, WORLD_WIDTH - edgeMargin);
    const nextY = Phaser.Math.Clamp(this.player.y + knockback.y * TRAFFIC_KNOCKBACK_DISTANCE, edgeMargin, WORLD_HEIGHT - edgeMargin);
    this.player.setVelocity(0, 0);
    this.player.setPosition(nextX, nextY);
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

  private spawnFloatingText(text: string, x: number, y: number, color: string): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "15px",
        color,
        fontStyle: "700",
        backgroundColor: "rgba(17, 24, 32, 0.62)",
        padding: { x: 7, y: 3 }
      })
      .setOrigin(0.5)
      .setDepth(UI_DEPTH - 8);
    this.tweens.add({
      targets: label,
      y: y - scaleDistance(34),
      alpha: 0,
      duration: 900,
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
      this.spawnFloatingText(label, x, y - scaleDistance(32), spec.textColor);
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
  }

  private playDeliveryFlourish(x: number, y: number, payout?: number): void {
    this.spawnInteractionFlourish("delivery", x, y, payout ? `Delivered +Rp ${payout}` : "Delivered");
    if (payout && payout > 0) {
      this.spawnCashBurst(x, y, payout);
    }
  }

  private playActivityCommitFlourish(x: number, y: number, label: string): void {
    this.spawnInteractionFlourish("activity", x, y, label);
    this.cameras.main.flash(120, 244, 213, 141, false);
  }

  private checkBikeTerrain(): void {
    if (!this.playerState.onBike || this.playerState.bikeStuck) {
      return;
    }

    const zone = BIKE_MUD_ZONES.find((candidate) => this.isPointInZone(this.player.x, this.player.y, candidate));
    if (!zone) {
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
    this.player.setPosition(
      Phaser.Math.Clamp(correction.x, scaleDistance(24), WORLD_WIDTH - scaleDistance(24)),
      Phaser.Math.Clamp(correction.y, scaleDistance(24), WORLD_HEIGHT - scaleDistance(24))
    );
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
        this.flagLocalPlayerForBikeHit(npc.name);
        return;
      }
    }

    for (const traveler of this.getGroupTravelers()) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, traveler.sprite.x, traveler.sprite.y) < scaleDistance(34)) {
        this.flagLocalPlayerForBikeHit(traveler.name);
        return;
      }
    }
  }

  private flagLocalPlayerForBikeHit(victimName: string): void {
    this.bikeHarmCooldown = 2400;
    const standing = recordRecklessDamageFlag(this.world.reputation, victimName, this.getAbsoluteMinute(), {
      maxWantedLevel: MAX_PLAYER_WANTED_LEVEL,
      maxBounty: MAX_PLAYER_BOUNTY,
      firstFlagBounty: FIRST_FLAG_BOUNTY,
      repeatFlagBounty: REPEAT_FLAG_BOUNTY
    });
    this.dispatchIntent({ kind: "AdjustReputation", delta: -8, reason: `Flagged by ${victimName} for reckless riding` });
    adjustPlayerMeters(this.world, { focus: -6 });
    saveWorldState(this.world);
    this.updatePlayerWantedSign();
    this.showToast(`${victimName} flagged you for reckless bike damage. Wanted level ${standing.wantedLevel}.`);
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
    this.npcAmbientLines.set(npcId, { text, remainingMs: 2600 });
  }

  private updateNpcAmbientLineVisual(npcId: string, sprite: Phaser.GameObjects.Sprite, delta: number): void {
    const line = this.npcAmbientLines.get(npcId);
    const existingLabel = this.npcAmbientLineLabels.get(npcId);
    if (!line) {
      existingLabel?.setVisible(false);
      return;
    }

    const remainingMs = line.remainingMs - delta;
    if (remainingMs <= 0) {
      this.npcAmbientLines.delete(npcId);
      existingLabel?.setVisible(false);
      return;
    }

    this.npcAmbientLines.set(npcId, { ...line, remainingMs });
    const label = this.getNpcAmbientLineLabel(npcId);
    label
      .setText(line.text)
      .setPosition(sprite.x, sprite.y - scaleDistance(76))
      .setDepth(sprite.y + 9)
      .setAlpha(Math.min(1, remainingMs / 350))
      .setVisible(true);
  }

  private getNpcAmbientLineLabel(npcId: string): Phaser.GameObjects.Text {
    const existing = this.npcAmbientLineLabels.get(npcId);
    if (existing) {
      return existing;
    }
    const label = this.add
      .text(0, 0, "", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "11px",
        color: "#123026",
        backgroundColor: "rgba(230,255,244,0.92)",
        padding: { x: 6, y: 3 },
        wordWrap: { width: scaleDistance(160) }
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
    this.npcAmbientLineLabels.set(npcId, label);
    return label;
  }

  private updateNpcIdleVisual(npc: NpcDefinition, sprite: Phaser.Physics.Arcade.Sprite, isIdle: boolean, delta: number): void {
    const label = this.getNpcIdleLabel(npc);
    if (!isIdle) {
      this.npcIdlePhases.set(npc.id, 0);
      sprite.setAngle(0);
      label.setVisible(false);
      return;
    }

    const elapsed = ((this.npcIdlePhases.get(npc.id) ?? 0) + delta) % 6000;
    const visual = getNpcIdleVisual(npc, elapsed);
    const facingDirection = this.npcFacingDirections.get(npc.id) ?? "down";
    this.npcIdlePhases.set(npc.id, elapsed);
    sprite.play(npcIdleAnimationKey(npc.spriteKey, getNpcIdleTag(npc)), true);
    sprite.setAngle(visual.angleDegrees);
    this.setSpriteFacing(sprite, facingDirection === "left", CHARACTER_SPRITE_SCALE, CHARACTER_SPRITE_SCALE * visual.scaleY);
    label
      .setText(visual.cue)
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
        fontSize: "10px",
        color: "#2b1d17",
        backgroundColor: "#fff7d6",
        padding: { x: 5, y: 2 }
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
    this.timeText.setText(formatClock(this.world));
    const bikeLabel = this.getBikeStatusLabel();
    const wantedLevel = getWantedLevel(this.world.reputation);
    const bounty = getBounty(this.world.reputation);
    const wantedLabel =
      wantedLevel > 0 ? `Wanted ${wantedLevel} Rp ${bounty}` : "Clean";
    this.moneyText.setText(
      `Rp ${this.playerState.money}  Rep ${getReputationScore(this.world.reputation)}  Rating ${this.world.life.hustle.driverRating.toFixed(1)}★  Safety ${this.playerState.safety}  ${wantedLabel}\n${bikeLabel}`
    );
    this.hudController.updateMeterReadout({
      money: this.playerState.money,
      energy: this.world.meters.energy,
      wellbeing: this.world.meters.wellbeing,
      focus: this.world.meters.focus,
      social: this.world.meters.social
    });
    this.hudController.updatePhoneBadge(getUnreadOpportunityMessageCount(this.world.opportunities), this.phoneBuzzTimer > 0);
    this.updateOverlayChrome();
    const fieldObjective = getFieldObjective(this.world);
    this.questText.setText(formatFieldObjectiveLine(fieldObjective));
    this.questText.setColor(this.objectiveColor(fieldObjective));
    this.questText.setWordWrapWidth(Math.min(520, this.scale.width - 40));

    const homeSleepReady = this.isAct0HomeSleepReady();
    const target = this.getNearestInteraction();
    if (this.mode === "world" && this.playerState.bikeStuck) {
      this.promptText.setText(`E / ACT: ask ${REQUIRED_BIKE_HELPERS} helpers to drag the bike out`);
    } else if (this.mode === "world" && homeSleepReady) {
      this.promptText.setText(`E / ACT: sleep at ${playerHomeBase.name}.`);
    } else if (this.mode === "world" && target) {
      this.promptText.setText(`E / ACT: ${target.label}`);
    } else if (this.mode === "world" && this.canSleepHere()) {
      this.promptText.setText("E / ACT: sleep until morning.");
    } else if (this.mode === "world" && !isAct0Complete(this.world)) {
      this.promptText.setText("Follow the field marker. P opens the phone later for deeper details.");
    } else if (this.mode === "world") {
      this.promptText.setText("WASD/arrows move. B bike. P phone. I bag. C community. F5 save.");
    } else if (this.mode === "phone") {
      this.promptText.setText("ESC closes the phone.");
    } else if (this.mode === "committedActivity") {
      this.promptText.setText("Activity in progress. ESC cancels early.");
    } else {
      this.promptText.setText("ESC closes the current panel.");
    }

    if (this.toastTimer > 0) {
      this.toastTimer -= delta;
      this.toastText.setAlpha(Math.min(1, this.toastTimer / 250));
    } else {
      this.toastText.setAlpha(0);
    }

    this.redrawHudChrome();
    this.drawOpportunityMarkers();
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
    const phase = getTimePhase(this.world.clock.minuteOfDay);
    const minute = this.world.clock.minuteOfDay;
    let alpha = 0;
    let color = 0x111a31;

    if (phase === "night") {
      alpha = minute < 360 ? 0.5 : 0.44;
      color = 0x071126;
    } else if (phase === "dawn") {
      alpha = 0.16;
      color = 0x6c4a7c;
    } else if (phase === "dusk") {
      alpha = 0.24;
      color = 0x5c3452;
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
        this.lanternGlow.fillStyle(0xffcc66, phase === "night" ? 0.23 : 0.13);
        this.lanternGlow.fillCircle(point.x, point.y, scaleDistance(phase === "night" ? 84 : 56));
        this.lanternGlow.fillStyle(0xffefad, 0.65);
        this.lanternGlow.fillCircle(point.x, point.y, scaleDistance(8));
      }
    }
  }

  private handleAction(): void {
    if (this.mode === "dialogue") {
      this.closePanel();
      return;
    }

    if (this.mode !== "world") {
      return;
    }

    if (this.playerState.bikeStuck) {
      this.tryFreeBike();
      return;
    }

    if (this.isAct0HomeSleepReady()) {
      this.sleepToMorning();
      return;
    }

    const target = this.getNearestInteraction();
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
      shop: (id) => this.openVenueActivityMenu(id),
      venue: (id) => this.openVenueActivityMenu(id),
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
      this.showToast(`The bike is stuck. Bring ${REQUIRED_BIKE_HELPERS} group helpers and press E.`);
      return;
    }

    this.playerState.onBike = !this.playerState.onBike;
    if (this.playerState.onBike && this.playerState.tutorialStep === "rent_bike") {
      this.playerState.tutorialStep = "join_group";
    }
    saveWorldState(this.world);
    this.updatePlayerBikeVisual();
    this.showToast(this.playerState.onBike ? "Bike mode on. Roads are fast; mud and beach sand are not." : "Bike parked. You are back on foot.");
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

    const questInteraction = resolveNpcQuestInteraction(this.playerState, npcId);
    if (questInteraction?.handled) {
      for (const intent of questInteraction.intents) {
        this.dispatchIntent(intent);
      }
      this.openDialogue(npc.name, questInteraction.dialogue);
      if (questInteraction.shouldSave) {
        this.refreshSettlingInGoals();
        saveWorldState(this.world);
      }
      return;
    }

    const arcBeat = completeNextRelationshipArcBeat(this.world, npcId, this.getAbsoluteMinute());
    if (arcBeat) {
      this.refreshSettlingInGoals(false);
      saveWorldState(this.world);
    }
    const baseLine = this.getNpcDialogueLine(npcId);
    if (getNpcDialogueSurface({ relationshipBeat: Boolean(arcBeat) }).surface === "ambient") {
      this.showNpcAmbientLine(npcId, getAmbientNpcLine(this.world, npcId, baseLine, routineLabel));
      return;
    }
    const arcCopy = arcBeat
      ? `\n\n${arcBeat.arc.title} - ${arcBeat.beat.title}\n${arcBeat.beat.description}\nPerk: ${arcBeat.payoffMessage}`
      : "";
    this.openDialogue(
      npc.name,
      `${baseLine}\n\nRight now ${npc.name} is ${routineLabel ?? "taking in the neighborhood"}.${arcCopy}`
    );
  }

  private getNpcDialogueLine(npcId: string): string {
    const line = this.dialogueProvider.getLine(npcId, { memory: getRelationship(this.world, "npc", npcId) });
    if (typeof line === "string") {
      return line;
    }
    return npcDefinitions[npcId]?.defaultLine ?? "The neighborhood hums around you.";
  }

  private openDialogue(title: string, body: string): void {
    this.closePanel();
    this.mode = "dialogue";
    this.createDialogueOverlay(title, body);
  }

  private createDialogueOverlay(title: string, body: string): void {
    this.destroyDialogueOverlay();
    if (typeof document === "undefined") {
      return;
    }

    const overlay = document.createElement("section");
    overlay.className = "bali-life-dialogue";
    overlay.dataset.dialoguePanel = "true";
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
    hint.textContent = "E / ESC";

    overlay.append(titleEl, bodyEl, hint);
    document.body.appendChild(overlay);
    this.dialogueOverlay = overlay;
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
    const statLine = isFirstVisit
      ? `\n\nFirst visit: Focus ${formatSigned(flavor.focusDelta)}  |  Social ${formatSigned(flavor.socialEnergyDelta)}  |  Links ${formatSigned(flavor.connectionDelta)}`
      : "\n\nYou have already mapped this stop. It still feels useful as a landmark.";
    this.openDialogue(venue?.name ?? node.name, `${flavor.body}${statLine}`);
    this.showToast(isFirstVisit ? flavor.firstVisitToast : flavor.repeatToast);
  }

  private startAct0WithIbuSari(): void {
    this.playerState.hasBike = true;
    this.playerState.onBike = true;
    this.playerState.bikeStuck = false;
    this.playerState.bikeCondition = Math.min(this.playerState.bikeCondition, 48);
    this.playerState.tutorialStep = "free_roam";
    this.world.life.hustle.scooterTier = "borrowed_rattletrap";
    if (getQuantity(this.playerState, SCOOTER_KEY_ITEM_ID) === 0) {
      addItem(this.playerState, SCOOTER_KEY_ITEM_ID, 1);
    }
    const accepted = acceptDelivery(this.world, "first_baked_villa_delivery", this.getAbsoluteMinute());
    completeAct0Step(this.world, "meet_ibu_sari");
    saveWorldState(this.world);
    this.updatePlayerBikeVisual();
    this.openDialogue(
      "Ibu Sari",
      [
        "You found me. Good. Berawa is easier when one person is in your corner.",
        "Take this scooter. It rattles, but it knows the lane better than you do.",
        accepted.ok
          ? "Your first gig is already on the phone: pick up pastries at BAKED and take them to the villa gate. Do this clean and you get your first rating."
          : accepted.message
      ].join("\n\n")
    );
    this.showToast("Borrowed scooter unlocked. First delivery accepted.");
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

    const { width, height } = this.scale;
    const panelWidth = Math.min(760, width - 28);
    const panelHeight = Math.min(640, height - 44);
    const x = (width - panelWidth) / 2;
    const y = (height - panelHeight) / 2;
    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(UI_DEPTH + 12);
    const bg = this.add.graphics();
    bg.fillStyle(0x111820, 0.96);
    bg.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    bg.lineStyle(2, 0xf4d58d, 0.52);
    bg.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    container.add(bg);

    const availability = getActivityAvailability(this.world, context);
    container.add(this.add.text(x + 22, y + 18, context.name, this.panelTitleStyle()));
    container.add(
      this.add.text(
        x + 22,
        y + 54,
        `${context.category.replace(/_/g, " ")} activities  |  ${formatClock(this.world)}\nEnergy ${this.world.meters.energy}  Wellbeing ${this.world.meters.wellbeing}  Focus ${this.world.meters.focus}  Social ${this.world.meters.social}  Rp ${this.playerState.money}`,
        { ...this.panelBodyStyle(), wordWrap: { width: panelWidth - 44 } }
      )
    );

    let rowY = y + 112;
    if (shop) {
      this.addPanelButton(container, x + 22, rowY, 156, 34, "Open buy/sell", () => this.openShop(venueId), 0x253a35);
      container.add(
        this.add.text(x + 192, rowY + 7, "Existing shop flow, unchanged.", {
          ...this.panelBodyStyle(),
          fontSize: "13px",
          wordWrap: { width: panelWidth - 214 }
        })
      );
      rowY += 50;
    }

    const activeEvents = getActiveEventsAtVenue(this.world.clock, venueId, this.world);
    if (activeEvents.length > 0) {
      container.add(this.add.text(x + 22, rowY, "Happening now", this.panelSectionStyle()));
      rowY += 28;
      for (const event of activeEvents.slice(0, 2)) {
        const cost = event.participation.cost ?? 0;
        const canAfford = cost <= 0 || this.playerState.money >= cost;
        const moneyCopy = cost < 0 ? `Earn Rp ${Math.abs(cost)}` : cost > 0 ? `Cost Rp ${cost}` : "Free";
        const meterCopy = formatMeterDeltaSummary(event.participation.meterDeltas);
        container.add(
          this.add.text(x + 22, rowY, `${event.title}`, {
            ...this.panelBodyStyle(),
            fontSize: "14px",
            color: "#ffe9a6",
            wordWrap: { width: panelWidth - 202 }
          })
        );
        container.add(
          this.add.text(
            x + 22,
            rowY + 22,
            `${event.description}\n${event.participation.timeCost} min | ${moneyCopy}${meterCopy ? ` | ${meterCopy}` : ""}`,
            {
              ...this.panelBodyStyle(),
              fontSize: "12px",
              wordWrap: { width: panelWidth - 202 }
            }
          )
        );
        this.addPanelButton(
          container,
          x + panelWidth - 154,
          rowY + 18,
          132,
          34,
          canAfford ? "Attend" : "Need Rp",
          () => {
            if (canAfford) {
              this.attendVenueEvent(event);
            } else {
              this.showToast(`Need Rp ${cost} for ${event.title}.`);
            }
          },
          canAfford ? 0x2c4650 : 0x3a3030
        );
        rowY += 82;
      }
      rowY += 6;
    }

    const liveVenueOpportunities = this.world.opportunities.live.filter((opportunity) => opportunity.locationVenueId === venueId);
    if (liveVenueOpportunities.length > 0) {
      container.add(this.add.text(x + 22, rowY, "Phone pings here", this.panelSectionStyle()));
      rowY += 28;
      for (const opportunity of liveVenueOpportunities.slice(0, 2)) {
        const template = getOpportunityTemplate(opportunity.templateId);
        const countdown = getLiveOpportunityCountdown(opportunity, this.world.clock);
        const canResolve = opportunity.status === "accepted";
        container.add(
          this.add.text(
            x + 22,
            rowY,
            `${template?.title ?? opportunity.templateId}\n${template?.blurb ?? "Resolve this before the timer runs out."}\n${opportunity.status} | ${Math.ceil(countdown)} min left`,
            {
              ...this.panelBodyStyle(),
              fontSize: "13px",
              wordWrap: { width: panelWidth - 202 }
            }
          )
        );
        this.addPanelButton(
          container,
          x + panelWidth - 154,
          rowY + 18,
          132,
          34,
          canResolve ? "Resolve" : "Accept",
          () => {
            if (canResolve) {
              this.startCommittedOpportunity(opportunity.id, venueId);
            } else {
              const result = acceptOpportunity(this.world.opportunities, opportunity.id, getOpportunityAbsoluteMinute(this.world.clock));
              saveWorldState(this.world);
              this.showToast(result.message);
              this.openVenueActivityMenu(venueId);
            }
          },
          canResolve ? 0x2c4650 : 0x253a35
        );
        rowY += 78;
      }
      rowY += 6;
    }

    const venueGroups = getSocialGroupsForVenue(venueId);
    const joinableGroups = venueGroups.filter((group) => !isSocialGroupJoined(this.world, group.id));
    if (joinableGroups.length > 0) {
      container.add(this.add.text(x + 22, rowY, "Local clubs", this.panelSectionStyle()));
      rowY += 28;
      for (const group of joinableGroups.slice(0, 2)) {
        const eventCopy = group.recurringEventIds?.length ? `Recurring events: ${group.recurringEventIds.length}` : "Recurring event hooks reserved";
        container.add(
          this.add.text(x + 22, rowY, `${group.name} (${group.purpose})\n${group.joinHook}\n${eventCopy}`, {
            ...this.panelBodyStyle(),
            fontSize: "13px",
            wordWrap: { width: panelWidth - 202 }
          })
        );
        this.addPanelButton(
          container,
          x + panelWidth - 154,
          rowY + 14,
          132,
          34,
          "Join",
          () => {
            const result = this.dispatchIntent({ kind: "JoinClub", groupId: group.id });
            saveWorldState(this.world);
            this.showToast(result.message);
            this.openVenueActivityMenu(venueId);
          },
          0x253a35
        );
        rowY += 74;
      }
      rowY += 6;
    }

    if (availability.length === 0) {
      container.add(
        this.add.text(x + 22, rowY, "No daily-life activities are defined for this venue category yet.", {
          ...this.panelBodyStyle(),
          wordWrap: { width: panelWidth - 44 }
        })
      );
    }

    for (const option of availability.slice(0, 6)) {
      const activity = option.activity;
      const moneyCopy = activity.cost
        ? activity.cost < 0
          ? `Earn Rp ${Math.abs(activity.cost)}`
          : `Cost Rp ${activity.cost}`
        : "Free";
      const status = option.available ? `${activity.timeCost} min | ${moneyCopy}` : option.reason ?? "Unavailable";
      container.add(this.add.text(x + 22, rowY, `${activity.label}`, this.panelSectionStyle()));
      container.add(
        this.add.text(x + 22, rowY + 23, `${activity.description}\n${status}`, {
          ...this.panelBodyStyle(),
          fontSize: "13px",
          wordWrap: { width: panelWidth - 202 }
        })
      );
      this.addPanelButton(
        container,
        x + panelWidth - 154,
        rowY + 14,
        132,
        34,
        option.available ? "Do" : "Blocked",
        () => {
          if (option.available) {
            this.performVenueActivity(context, activity.id);
          } else {
            this.showToast(option.reason ?? "Activity unavailable.");
          }
        },
        option.available ? 0x253a35 : 0x3a3030
      );
      rowY += 78;
      if (rowY > y + panelHeight - 102) {
        break;
      }
    }

    this.addPanelButton(container, x + panelWidth - 160, y + panelHeight - 54, 138, 36, "Close", () => this.closePanel(), 0x4a3331);
    this.panel = container;
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
    if (activityId === "grab_coffee" && markAct0MealProgress(this.world, "coffee")) {
      act0Message = " First earnings spent. Sleep when ready.";
    }
    if (activityId === "eat_properly" && markAct0MealProgress(this.world, "meal")) {
      act0Message = " First earnings spent. Sleep when ready.";
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

    const node = venueMapNodes.find((candidate) => candidate.venueId === context.venueId);
    this.placePlayerAtCommittedVenue(node);

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
    this.showToast(`${option.activity.label} started. ESC cancels early.`);
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
    const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
    this.placePlayerAtCommittedVenue(node);

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
    this.showToast(`${template.title} started. ESC cancels early.`);
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

  private completeCommittedActivity(): void {
    const active = this.committedActivity;
    if (!active) {
      return;
    }
    this.committedActivity = undefined;
    this.world.activeActivity = null;
    this.destroyCommittedActivityOverlay();
    this.mode = "world";
    const performanceScore = resolvePerformanceScore(active.minigame);
    active.performanceScore = performanceScore;
    if (active.source === "activity") {
      const context = getVenueActivityContext(active.venueId);
      if (!context) {
        this.showToast("Activity finished, but the venue context was missing.");
        return;
      }
      this.resolveVenueActivity(context, active.activityId, performanceScore);
      return;
    }
    this.finishCommittedOpportunity(active.opportunityId, performanceScore);
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
    this.committedActivity = undefined;
    this.world.activeActivity = null;
    this.destroyCommittedActivityOverlay();
    this.mode = "world";
    saveWorldState(this.world);
    this.showToast(`${label} cancelled. No reward earned.`);
  }

  private resumeCommittedActivityIfNeeded(): void {
    if (!this.world.activeActivity) {
      return;
    }
    this.committedActivity = { ...this.world.activeActivity };
    this.mode = "committedActivity";
    const node = venueMapNodes.find((candidate) => candidate.venueId === this.committedActivity?.venueId);
    this.placePlayerAtCommittedVenue(node);
    this.createCommittedActivityOverlay(this.committedActivity);
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

    const cost = event.participation.cost ?? 0;
    if (cost > 0 && this.playerState.money < cost) {
      this.showToast(`Need Rp ${cost} for ${event.title}.`);
      return;
    }

    this.playerState.money -= cost;
    adjustPlayerMeters(this.world, event.participation.meterDeltas);
    advanceWorldMinutes(this.world, event.participation.timeCost);

    for (const itemId of event.participation.itemIds ?? []) {
      addItem(this.playerState, itemId, 1);
    }

    const npcAffinity = new Map<string, number>();
    for (const npcId of event.participation.meetNpcs ?? []) {
      npcAffinity.set(npcId, (npcAffinity.get(npcId) ?? 0) + 1);
    }
    for (const bump of event.participation.affinityBumps ?? []) {
      npcAffinity.set(bump.npcId, (npcAffinity.get(bump.npcId) ?? 0) + bump.amount);
    }
    for (const [npcId, amount] of npcAffinity) {
      bumpRelationshipAffinity(this.world, "npc", npcId, amount, `Attended ${event.title}`, this.getAbsoluteMinute());
    }

    const intentResult = this.dispatchIntent({ kind: "AttendEvent", eventId: event.id });
    const goalMessage = this.refreshSettlingInGoals(false);
    this.updateLighting();
    saveWorldState(this.world);

    const moneyCopy = cost < 0 ? `Rp ${Math.abs(cost)} earned` : cost > 0 ? `Rp ${cost} spent` : "free";
    const meterCopy = formatMeterDeltaSummary(event.participation.meterDeltas);
    const details = `${moneyCopy}${meterCopy ? ` | ${meterCopy}` : ""}`;
    this.showToast(goalMessage ? `${intentResult.message} ${details}. ${goalMessage}` : `${intentResult.message} ${details}.`);
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
    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(UI_DEPTH + 10);
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
    for (const itemId of shop.sells) {
      const item = itemDefinitions[itemId];
      this.addPanelButton(container, x + 22, rowY, panelWidth - 44, 38, `${item.name}  -  Rp ${item.buyPrice}`, () => {
        if (itemId === BIKE_RENTAL_ITEM_ID) {
          this.buyBikeRental(shop);
          return;
        }
        if (this.playerState.money < item.buyPrice) {
          this.showToast("Not enough money.");
          return;
        }
        this.playerState.money -= item.buyPrice;
        addItem(this.playerState, itemId, 1);
        this.dispatchIntent({
          kind: "RecordMemory",
          subjectType: "venue",
          subjectId: shop.id,
          memory: "bought_item",
          detail: item.name
        });
        this.showToast(`Bought ${item.name}.`);
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
    this.playerState.onBike = true;
    this.playerState.bikeStuck = false;
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
    this.updatePlayerBikeVisual();
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
    const { width, height } = this.scale;
    const panelWidth = Math.min(760, width - 28);
    const panelHeight = Math.min(520, height - 44);
    const x = (width - panelWidth) / 2;
    const y = (height - panelHeight) / 2;
    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(UI_DEPTH + 10);
    const bg = this.add.graphics();
    bg.fillStyle(0x111820, 0.96);
    bg.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    bg.lineStyle(2, 0xf4d58d, 0.52);
    bg.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    container.add(bg);

    const group = activity.groupId ? interestGroupDefinitions[activity.groupId] : undefined;
    const joined = group ? this.playerState.joinedGroupIds.includes(group.id) : false;
    const matchingShop = Object.values(shopDefinitions).find((shop) => shop.name === activity.venueName);
    const costLine = activity.moneyCost > 0 ? `Cost: Rp ${activity.moneyCost}` : "Cost: free";
    const energyLine =
      activity.socialEnergyDelta < 0
        ? `Social energy: ${activity.socialEnergyDelta}`
        : `Social energy: +${activity.socialEnergyDelta}`;
    const redemptionLine = activity.isRedemption
      ? `\nRepair: Rep +${activity.reputationReward ?? 0}  |  Wanted -${activity.wantedReduction ?? 0}  |  Bounty -Rp ${activity.bountyReduction ?? 0}`
      : "";

    container.add(this.add.text(x + 22, y + 18, activity.title, this.panelTitleStyle()));
    container.add(
      this.add.text(
        x + 22,
        y + 54,
        `${activity.venueName}\n${activity.description}\n${activity.schedule}  |  ${activity.tags.join(" / ")}\n${costLine}  |  Focus ${activity.focusReward >= 0 ? "+" : ""}${activity.focusReward}  |  ${energyLine}  |  Links +${activity.connectionReward}${redemptionLine}`,
        {
          ...this.panelBodyStyle(),
          wordWrap: { width: panelWidth - 44 }
        }
      )
    );

    if (group) {
      container.add(this.add.text(x + 22, y + 174, "Interest Group", this.panelSectionStyle()));
      container.add(
        this.add.text(x + 22, y + 202, `${group.name}: ${group.hook}\nVibe: ${group.vibe}`, {
          ...this.panelBodyStyle(),
          wordWrap: { width: panelWidth - 44 }
        })
      );
    }

    const buttonY = y + panelHeight - 104;
    this.addPanelButton(
      container,
      x + 22,
      buttonY,
      Math.min(220, panelWidth - 44),
      38,
      "Do Activity",
      () => this.participateInActivity(activity),
      0x253a35
    );

    if (group) {
      this.addPanelButton(
        container,
        x + 252,
        buttonY,
        Math.min(220, panelWidth - 274),
        38,
        joined ? "Group Joined" : "Join Group",
        () => this.joinInterestGroup(group.id, activity),
        joined ? 0x2d3036 : 0x253a47
      );
    }

    if (matchingShop) {
      this.addPanelButton(
        container,
        x + 22,
        y + panelHeight - 54,
        Math.min(220, panelWidth - 44),
        36,
        "Venue Shop",
        () => this.renderShopPanel(matchingShop),
        0x394155
      );
    }

    this.addPanelButton(container, x + panelWidth - 160, y + panelHeight - 54, 138, 36, "Close", () => this.closePanel(), 0x4a3331);
    this.panel = container;
  }

  private participateInActivity(activity: VenueActivityDefinition): void {
    if (this.playerState.money < activity.moneyCost) {
      this.showToast("Not enough money for that plan.");
      return;
    }

    if (activity.socialEnergyDelta < 0 && this.world.meters.social < Math.abs(activity.socialEnergyDelta)) {
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
      this.playerState.onBike = true;
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
    const startX = Phaser.Math.Clamp(this.player.x + scaleDistance(92), scaleDistance(80), WORLD_WIDTH - scaleDistance(80));
    const startY = Phaser.Math.Clamp(this.player.y + scaleDistance(8), scaleDistance(80), WORLD_HEIGHT - scaleDistance(240));
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
    const helpers = this.countGroupHelpers();
    if (helpers < REQUIRED_BIKE_HELPERS) {
      this.showToast(`Need ${REQUIRED_BIKE_HELPERS} group helpers to drag it out. You have ${helpers}. Join a group first.`);
      return;
    }

    this.playerState.bikeStuck = false;
    this.playerState.onBike = true;
    this.playerState.bikeCondition = Phaser.Math.Clamp(this.playerState.bikeCondition + 8, 1, 100);
    this.playerState.tutorialStep = "free_roam";
    this.syncGroupWorldState("traveling");
    saveWorldState(this.world);
    this.updatePlayerBikeVisual();
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
    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(UI_DEPTH + 10);
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
    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(UI_DEPTH + 10);
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
        `Money: Rp ${this.playerState.money}  |  Energy ${this.world.meters.energy}  |  Wellbeing ${this.world.meters.wellbeing}  |  Focus ${this.world.meters.focus}  |  Social ${this.world.meters.social}\nRep ${getReputationScore(this.world.reputation)}  |  Wanted ${getWantedLevel(this.world.reputation)}  |  Bounty Rp ${getBounty(this.world.reputation)}  |  ${this.getBikeStatusLabel()}`,
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
    this.panel?.destroy(true);
    this.panel = undefined;
    this.destroyDialogueOverlay();
    if (setWorldMode) {
      this.mode = "world";
    }
  }

  private openFirstRunHint(): void {
    if (this.world.questFlags.firstRunHintSeen) {
      return;
    }
    this.world.questFlags.firstRunHintSeen = true;
    saveWorldState(this.world);
    this.openDialogue(
      "Welcome to Berawa",
      "WASD or arrows move. E interacts. P opens the phone. I opens the bag. B toggles your bike after rental. F5 saves locally. ESC closes panels."
    );
  }

  private updateMapDiscovery(initial = false): void {
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
      saveWorldState(this.world);
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
      const node = venueMapNodes.find((candidate) => candidate.venueId === opportunity.locationVenueId);
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

  private drawWorldInteractionScenes(): void {
    if (!this.worldSceneLayer) {
      return;
    }
    this.worldSceneLayer.clear();
    const activeLabelIds = new Set<string>();
    const phase = Date.now() / 1000;

    for (const scene of getOpportunityWorldScenes(this.world)) {
      const node = venueMapNodes.find((candidate) => candidate.venueId === scene.venueId);
      if (!node) {
        continue;
      }
      const yOffset = Math.min(node.radius + scaleDistance(24), scaleDistance(92));
      const x = node.x;
      const y = node.y - yOffset;
      this.drawOpportunityWorldScene(scene, x, y, phase, activeLabelIds);
    }

    for (const scene of getEventWorldScenes(this.world)) {
      const node = venueMapNodes.find((candidate) => candidate.venueId === scene.venueId);
      if (!node) {
        continue;
      }
      const yOffset = Math.min(node.radius + scaleDistance(66), scaleDistance(136));
      const x = node.x + scaleDistance(44);
      const y = node.y - yOffset;
      this.drawEventWorldScene(scene, x, y, phase, activeLabelIds);
    }

    for (const [id, label] of this.worldSceneLabels) {
      if (!activeLabelIds.has(id)) {
        label.setVisible(false);
      }
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
    const pulse = 0.62 + Math.sin(phase * (scene.clubId ? 5.2 : 3.6)) * 0.18;
    this.worldSceneLayer.fillStyle(0x101820, 0.24);
    this.worldSceneLayer.fillEllipse(x, y + scaleDistance(28), scaleDistance(104), scaleDistance(28));
    this.worldSceneLayer.lineStyle(scaleDistance(scene.clubId ? 3 : 2), color, 0.34 + pulse * 0.26);
    this.worldSceneLayer.strokeEllipse(x, y + scaleDistance(28), scaleDistance(112), scaleDistance(36));

    if (scene.sceneKind === "work_table") {
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
    scene: { id: string; cue: string; accepted?: boolean },
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
        fontSize: "10px",
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
    return 0xf4d58d;
  }

  private eventSceneColor(kind: EventWorldScene["sceneKind"]): number {
    if (kind === "run_gathering") return 0x8fe3b4;
    if (kind === "work_table") return 0x91b7dd;
    if (kind === "market_walk") return 0xffd45c;
    if (kind === "party_pulse") return 0xd95c8a;
    return 0xf4d58d;
  }

  private drawMinimap(): void {
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
    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(UI_DEPTH + 12);
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
      this.playerState.onBike = !this.playerState.onBike;
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
      this.playerState.onBike = true;
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
    addGodButton("Teleport Canggu Station", () => this.devTeleportToBasePoint(610, 742), 0x394155);
    addGodButton("Teleport FINNS", () => this.devTeleportToBasePoint(1768, 300), 0x394155);
    addGodButton("Teleport Beach", () => this.devTeleportToBasePoint(350, 1225), 0x394155);
    addGodButton("Clear Wanted", () => {
      clearWantedStanding(this.world.reputation, "Dev wanted state cleared.", this.getAbsoluteMinute());
      this.updatePlayerWantedSign();
      this.showToast("Dev wanted state cleared.");
    }, 0x4a3331);

    this.addPanelButton(container, x + panelWidth - 160, y + panelHeight - 54, 138, 36, "Close", () => this.closeGodmodePanel(), 0x4a3331);
    this.godmodePanel = container;
  }

  private refreshHustleMoveOutReady(): void {
    this.world.life.hustle.moveOutReady =
      this.world.life.hustle.completedDeliveryCount >= 5 &&
      this.world.life.hustle.deliveryEarnings >= 700 &&
      this.world.life.hustle.driverRating >= 4.2;
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

  private devTeleportToBasePoint(x: number, y: number): void {
    const point = scalePoint({ x, y });
    this.devTeleport(point.x, point.y);
  }

  private devTeleport(x: number, y: number): void {
    const edgeMargin = scaleDistance(28);
    this.player.setVelocity(0, 0);
    this.player.setPosition(Phaser.Math.Clamp(x, edgeMargin, WORLD_WIDTH - edgeMargin), Phaser.Math.Clamp(y, edgeMargin, WORLD_HEIGHT - edgeMargin));
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

    const hitZone = this.add.zone(x + width / 2, y + height / 2, width, height).setScrollFactor(0).setDepth(container.depth + 2);
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
    container.once(Phaser.GameObjects.Events.DESTROY, () => hitZone.destroy());
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
    const result =
      wasPickup
        ? pickupDelivery(this.world, this.getAbsoluteMinute())
        : completeDelivery(this.world, this.getAbsoluteMinute());
    if (result.ok && wasPickup) {
      completeAct0Step(this.world, "pickup_first_delivery");
      this.spawnInteractionFlourish("pickup", this.player.x, this.player.y, "Picked up");
    } else if (result.ok && !this.world.life.hustle.activeDelivery) {
      completeAct0Step(this.world, "dropoff_first_delivery");
      this.refreshSettlingInGoals(false);
      this.playDeliveryFlourish(this.player.x, this.player.y, result.payout);
    }
    saveWorldState(this.world);
    this.showToast(result.message);
  }

  private drawObjectiveMarkers(): void {
    if (!this.deliveryMarkerLayer) {
      return;
    }
    this.deliveryMarkerLayer.clear();
    const targets = this.getFieldObjectiveTargets();
    for (const target of targets) {
      const pulse = 0.55 + Math.sin(Date.now() / 180) * 0.12;
      this.deliveryMarkerLayer.fillStyle(0xfff0bd, 0.18);
      this.deliveryMarkerLayer.fillCircle(target.x, target.y, target.radius);
      this.deliveryMarkerLayer.lineStyle(4, 0xfff0bd, pulse);
      this.deliveryMarkerLayer.strokeCircle(target.x, target.y, target.radius);
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
      const node = venueMapNodes.find((candidate) => candidate.venueId === indicator.venueId);
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
    const targets = this.getFieldObjectiveTargets();
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
    return objective.targets
      .map((target) => this.resolveFieldObjectiveTarget(target))
      .filter((target): target is FieldObjectiveTarget => Boolean(target));
  }

  private resolveFieldObjectiveTarget(target: FieldObjectiveTargetRef): FieldObjectiveTarget | null {
    if (target.type === "npc") {
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
      return { id: target.id, label: target.label, x: playerHomeBase.x, y: playerHomeBase.y, radius: playerHomeBase.radius, type: target.type };
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
      return [
        {
          id: playerHomeBase.id,
          label: playerHomeBase.name,
          x: playerHomeBase.x,
          y: playerHomeBase.y,
          radius: playerHomeBase.radius
        }
      ];
    }
    if (this.world.life.actProgress.currentAct >= 2 && this.world.life.joinedClubIds.length === 0) {
      return ["berawa_beach", "satu_satu_coffee"]
        .map((venueId) => {
          const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
          const label = venueId === "berawa_beach" ? "Find beach crew" : "Find focus table";
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

  private canSleepHere(): boolean {
    if (this.world.life.actProgress.act0Step === "sleep_first_night") {
      return isPlayerAtHomeBase(this.world);
    }
    return canSleepNow(this.world.clock, this.world.meters);
  }

  private isAct0HomeSleepReady(): boolean {
    return canUseHomeSleep(this.world);
  }

  private sleepToMorning(): void {
    sleepUntilNextMorning(this.world);
    this.world.meters.energy = 100;
    adjustPlayerMeters(this.world, { wellbeing: 8, focus: 6, social: -4 });
    const completedAct0 = completeAct0Step(this.world, "sleep_first_night");
    this.updateLighting();
    saveWorldState(this.world);
    this.showToast(
      completedAct0
        ? `Slept until ${formatClock(this.world)}. Act 1 begins: keep hustling toward rent and your own place.`
        : `Slept until ${formatClock(this.world)}. Energy restored.`
    );
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
    const eventMessages = tutorialActive ? 0 : this.appendActiveEventMessages();
    const afterUnread = getUnreadOpportunityMessageCount(this.world.opportunities);
    const changed =
      maintenance.spawned.length > 0 ||
      maintenance.expired.length > 0 ||
      authoredTexts.length > 0 ||
      eventMessages > 0;

    if (afterUnread > beforeUnread) {
      this.phoneBuzzTimer = 1800;
      if (!force && this.mode === "world") {
        this.showToast("Phone buzz: something nearby just opened up.");
      }
    }
    if (changed) {
      saveWorldState(this.world);
      this.phone?.refresh();
    }
  }

  private isOverlayOpen(): boolean {
    return this.mode !== "world";
  }

  private updateOverlayChrome(): void {
    this.hudController.setOverlayOpen(this.isOverlayOpen());
  }

  private appendActiveEventMessages(): number {
    const now = getOpportunityAbsoluteMinute(this.world.clock);
    let added = 0;
    for (const event of getActiveEvents(this.world.clock, this.world)) {
      const venue = getVenue(event.locationVenueId);
      const ok = appendOpportunityMessage(this.world.opportunities, {
        id: `event-start:${event.id}:${this.world.clock.day}`,
        at: now,
        from: "Calendar",
        body: `${event.title} is happening now at ${venue?.name ?? event.locationVenueId}. Go on-site and press E to join.`,
        venueId: event.locationVenueId,
        read: false
      });
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

  private acceptPhoneDelivery(deliveryId: string): void {
    const result = acceptDelivery(this.world, deliveryId, this.getAbsoluteMinute());
    this.showToast(result.ok ? `${result.message} Follow the delivery marker.` : result.message);
    saveWorldState(this.world);
  }

  private payPhoneRent(): void {
    const result = payHustleRent(this.world, this.getAbsoluteMinute());
    this.showToast(result.message);
    saveWorldState(this.world);
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
    if (getUnreadOpportunityMessageCount(this.world.opportunities) === 0) {
      return;
    }
    markOpportunityMessagesRead(this.world.opportunities);
    this.phoneBuzzTimer = 0;
    this.hudController.updatePhoneBadge(0, false);
    saveWorldState(this.world);
  }

  private saveGame(): void {
    saveWorldState(this.world);
    this.showToast("Game saved locally.");
  }

  private dispatchIntent(intent: GameIntent): IntentResult {
    this.network.pushIntent(intent);
    return this.dispatcher.dispatch(intent, this.world, this.getAbsoluteMinute());
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
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
    this.cameras.main.setZoom(width < 720 ? STREET_CAMERA.mobileZoom : STREET_CAMERA.desktopZoom);
    this.promptText.setPosition(20, height - 36);
    this.toastText.setPosition(width / 2, Math.max(92, height * 0.17));
    this.hudController.layoutTouchControls();
    this.redrawHudChrome();
  }

  private redrawHudChrome(): void {
    const { width, height } = this.scale;
    this.hudChrome.clear();
    this.hudChrome.fillStyle(0x101820, 0.62);
    this.hudChrome.fillRoundedRect(12, 10, Math.min(620, width - 24), 148, 8);
    this.hudChrome.fillRoundedRect(12, height - 48, Math.min(620, width - 24), 38, 8);
    this.hudChrome.lineStyle(1, 0xf4d58d, 0.25);
    this.hudChrome.strokeRoundedRect(12, 10, Math.min(620, width - 24), 148, 8);
    this.hudChrome.strokeRoundedRect(12, height - 48, Math.min(620, width - 24), 38, 8);
  }

  private showToast(message: string): void {
    this.toastText?.setText(message);
    this.toastTimer = 2600;
  }

  private publishDebugSnapshot(target: InteractionTarget | undefined, fieldObjective: FieldObjectiveState): void {
    if (typeof window === "undefined") {
      return;
    }

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
      driverRating: this.world.life.hustle.driverRating,
      activeDelivery: this.world.life.hustle.activeDelivery?.deliveryId ?? null,
      fieldObjective,
      fieldObjectiveLine: formatFieldObjectiveLine(fieldObjective),
      relationshipCount: this.world.relationships.length,
      inventory: formatInventory(this.playerState.inventory),
      activeQuestIds: [...this.playerState.activeQuestIds],
      completedQuestIds: [...this.playerState.completedQuestIds],
      joinedGroupIds: [...this.playerState.joinedGroupIds],
      prompt: this.promptText.text,
      time: formatClock(this.world),
      timePhase: getTimePhase(this.world.clock.minuteOfDay),
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
