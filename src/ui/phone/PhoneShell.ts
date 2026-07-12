import Phaser from "phaser";
import { itemDefinitions } from "../../data/items";
import { lifestyleTagSuggestions } from "../../data/lifestyleTags";
import { npcDefinitions } from "../../data/npcs";
import { questDefinitions } from "../../data/quests";
import { gameEventDefinitions } from "../../data/events";
import { discoveryLedgerEntries } from "../../data/discoveryLedger";
import { getActiveEvents, getUpcomingEvents, formatEventSchedule, formatEventTime, getEventsForGroup } from "../../systems/events/EventScheduler";
import { getAllSocialGroups, isSocialGroupJoined } from "../../systems/groups/GroupRegistry";
import { isDiscoveryLedgerEntryUnlocked } from "../../systems/discovery/DiscoveryLedger";
import type { IntentDispatcher } from "../../systems/intents/IntentDispatcher";
import { setLifestyleTags } from "../../systems/profile/ProfileState";
import { getAllVenues, getPriorityVenueCandidates, getVenue, getVisibleVenues } from "../../systems/venues/VenueRegistry";
import { getOfflineActivities } from "../../systems/offline/OfflineActivityRegistry";
import { getLiveOpportunityCountdown, getOpportunityTemplate } from "../../systems/opportunities/OpportunityEngine";
import { getAffinityPerk, getAffinityTier, summarizeRelationshipMemories } from "../../systems/relationships/RelationshipMemory";
import { getRelationshipArcStatesForNpc } from "../../systems/relationships/RelationshipArcs";
import { getSettlingInGoalStates } from "../../systems/life/SettlingInGoals";
import { getAct2GoalStates, getAct2NextStep } from "../../systems/life/Act2Goals";
import { getAct3ReadinessGoalStates, getAct3ReadinessNextStep } from "../../systems/life/Act3Readiness";
import { getAct0StepState } from "../../systems/life/ActProgression";
import { formatVisibleMeterValues } from "../../systems/guidance/MeterVisibility";
import { getDeliveryDefinition } from "../../data/deliveries";
import { getDeliveryOfferAvailability, getEffectiveDeliveryTerms, previewDeliveryCondition } from "../../systems/hustle/DeliverySystem";
import { getRentPressureState, getScooterRepairStatus, getScooterUpgradeStatus } from "../../systems/hustle/HustleEconomy";
import { getHustleGoalStates, getHustleNextStep } from "../../systems/hustle/HustleGoals";
import type { GameEvent, RelationshipMemory, Venue, WorldState } from "../../types";
import { getPhoneCameraScale, getPhonePanelLayout, PHONE_CONTENT_INSET_PX } from "./PhoneLayout";

const PHONE_DEPTH = 1500;
const TABS = ["Feed", "Map", "Contacts", "Threads", "Quests", "Calendar", "Profile", "Events", "Venues", "Community"] as const;
type PhoneTab = (typeof TABS)[number];

interface PhoneShellOptions {
  scene: Phaser.Scene;
  getWorld: () => WorldState;
  dispatcher: IntentDispatcher;
  getNow: () => number;
  save: () => void;
  toast: (message: string) => void;
  playUiClick?: () => void;
  isAudioMuted?: () => boolean;
  onAudioMutedChange?: (muted: boolean) => void;
  onOpportunityAccept: (opportunityId: string) => void;
  onOpportunityTrack: (opportunityId: string) => void;
  onDeliveryAccept: (deliveryId: string) => void;
  onPayRent: () => void;
  onRepairScooter: () => void;
  onUpgradeScooter: () => void;
  onFeedViewed: () => void;
  onFeedback: () => void;
  onClose: () => void;
}

export class PhoneShell {
  private container?: Phaser.GameObjects.Container;
  private activeTab: PhoneTab = "Feed";
  private selectedVenueId?: string;

  constructor(private readonly options: PhoneShellOptions) {}

  get isOpen(): boolean {
    return Boolean(this.container);
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
      return;
    }
    this.open();
  }

  open(tab: PhoneTab = this.activeTab): void {
    this.activeTab = tab;
    this.render();
  }

  close(): void {
    this.container?.destroy(true);
    this.container = undefined;
    this.options.onClose();
  }

  refresh(): void {
    if (this.isOpen) {
      this.render();
    }
  }

  private render(): void {
    this.container?.destroy(true);
    const { scene } = this.options;
    const { width, height } = scene.scale;
    const { panelWidth, panelHeight, x, y, bodyX, bodyWidth } = getPhonePanelLayout(width, height);
    const camera = scene.cameras.main;
    const cameraZoom = camera.zoom || 1;
    const container = scene
      .add.container(camera.worldView.x, camera.worldView.y)
      .setScrollFactor(1)
      .setDepth(PHONE_DEPTH)
      .setScale(getPhoneCameraScale(cameraZoom));
    const bg = scene.add.graphics();
    bg.fillStyle(0x101820, 0.97);
    bg.fillRoundedRect(x, y, panelWidth, panelHeight, 10);
    bg.lineStyle(2, 0xf4d58d, 0.58);
    bg.strokeRoundedRect(x, y, panelWidth, panelHeight, 10);
    container.add(bg);

    this.renderPortalHeader(container, x, y, panelWidth);
    this.renderTabs(container, x, y + 74, panelWidth);
    this.renderActiveTab(container, bodyX, y + 148, bodyWidth, panelHeight - 198);
    this.addButton(container, x + panelWidth - 116, y + panelHeight - 42, 92, 30, "Close", () => this.close(), 0x4a3331);
    this.container = container;
  }

  private renderPortalHeader(container: Phaser.GameObjects.Container, x: number, y: number, panelWidth: number): void {
    const world = this.options.getWorld();
    container.add(this.options.scene.add.text(x + PHONE_CONTENT_INSET_PX, y + 16, "Bali Life Phone", this.titleStyle()));
    container.add(
      this.options.scene.add.text(
        x + PHONE_CONTENT_INSET_PX,
        y + 46,
        `Portal: ${world.portal.current === "single" ? "Single Player" : "Multiplayer"}  |  Multiplayer ${world.portal.multiplayerStatus}`,
        this.bodyStyle(13)
      )
    );
    this.addButton(container, x + panelWidth - 278, y + 18, 112, 30, "Single", () => this.dispatchAndRefresh({ kind: "SwitchPortal", mode: "single" }), 0x253a35);
    this.addButton(container, x + panelWidth - 158, y + 18, 134, 30, "Multiplayer Locked", () => this.dispatchAndRefresh({ kind: "SwitchPortal", mode: "multiplayer" }), 0x2d3036);
  }

  private renderTabs(container: Phaser.GameObjects.Container, x: number, y: number, panelWidth: number): void {
    const gap = 6;
    const columns = panelWidth < 560 ? 4 : 8;
    const tabWidth = (panelWidth - PHONE_CONTENT_INSET_PX * 2 - gap * (columns - 1)) / columns;
    TABS.forEach((tab, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const tabX = x + PHONE_CONTENT_INSET_PX + column * (tabWidth + gap);
      const tabY = y + row * 34;
      this.addButton(
        container,
        tabX,
        tabY,
        tabWidth,
        28,
        tab,
        () => this.open(tab),
        tab === this.activeTab ? 0x35533f : 0x253040
      );
    });
  }

  private renderActiveTab(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    panelWidth: number,
    contentHeight: number
  ): void {
    const bodyX = x;
    const bodyY = y;
    const bodyWidth = panelWidth;
    const title = this.options.scene.add.text(bodyX, bodyY, this.activeTab, this.sectionStyle());
    container.add(title);
    const textY = bodyY + 30;
    if (this.activeTab === "Feed") {
      this.renderFeed(container, bodyX, textY, bodyWidth);
    } else if (this.activeTab === "Map") {
      this.renderTextList(container, bodyX, textY, bodyWidth, this.mapLines());
    } else if (this.activeTab === "Contacts") {
      this.renderTextList(container, bodyX, textY, bodyWidth, this.contactLines());
    } else if (this.activeTab === "Threads") {
      this.renderTextList(container, bodyX, textY, bodyWidth, this.threadLines());
    } else if (this.activeTab === "Quests") {
      this.renderTextList(container, bodyX, textY, bodyWidth, this.questLines());
    } else if (this.activeTab === "Calendar") {
      this.renderTextList(container, bodyX, textY, bodyWidth, this.calendarLines());
    } else if (this.activeTab === "Profile") {
      this.renderProfile(container, bodyX, textY, bodyWidth, contentHeight - 32);
    } else if (this.activeTab === "Events") {
      this.renderEvents(container, bodyX, textY, bodyWidth);
    } else if (this.activeTab === "Venues") {
      this.renderVenues(container, bodyX, textY, bodyWidth);
    } else {
      this.renderCommunity(container, bodyX, textY, bodyWidth);
    }
  }

  private mapLines(): string[] {
    const world = this.options.getWorld();
    const visibleVenues = getVisibleVenues(world.mapDiscovery);
    const hiddenCount = getAllVenues().length - visibleVenues.length;
    return [
      "Known Areas",
      ...(world.mapDiscovery.revealAll || world.mapDiscovery.discoveredAreaIds.length
        ? world.mapDiscovery.revealAll
          ? ["- Jl. Nelayan", "- Jl. Pantai Berawa", "- Jl. Tegal Sari", "- FINNS / Canggu Club Area", "- Berawa Beach direction"]
          : world.mapDiscovery.discoveredAreaIds.map((id) => `- ${id.replace(/_/g, " ")}`)
        : ["- Main roads visible. Explore to reveal names and venues."]),
      "",
      "Discovered Venues",
      ...(visibleVenues.length
        ? visibleVenues.map((venue) => `- ${venue.name} (${venue.implementationStatus})`)
        : ["- None yet. Walk or ride closer to venues."]),
      hiddenCount > 0 ? `${hiddenCount} venue details still hidden.` : "All seeded venue details revealed."
    ];
  }

  private renderFeed(container: Phaser.GameObjects.Container, x: number, y: number, width: number): void {
    const world = this.options.getWorld();
    const state = world.opportunities;
    let rowY = y;
    rowY = this.renderHustleBoard(container, x, rowY, width);
    rowY += 8;
    const live = [...state.live].sort((a, b) => a.expiresAt - b.expiresAt);
    if (live.length === 0) {
      this.renderTextList(container, x, rowY, width, [
        "No live pings right now.",
        "The phone will buzz when a gig, social invite, help-out, rumor, trade, or simulated deal opens."
      ]);
      rowY += 72;
    } else {
      for (const opportunity of live.slice(0, 4)) {
        const template = getOpportunityTemplate(opportunity.templateId);
        const venue = getVenue(opportunity.locationVenueId);
        const countdown = this.formatCountdown(getLiveOpportunityCountdown(opportunity, world.clock));
        const tracked = state.trackedOpportunityId === opportunity.id;
        this.renderTextList(container, x, rowY, width - 196, [
          `${template?.title ?? opportunity.templateId} (${template?.type.replace(/_/g, " ") ?? "opportunity"})`,
          `${venue?.name ?? opportunity.locationVenueId} | ${opportunity.status} | expires in ${countdown}`,
          template?.blurb ?? "Go to the venue before the timer runs out."
        ]);
        this.addButton(
          container,
          x + width - 180,
          rowY + 2,
          78,
          30,
          opportunity.status === "accepted" ? "Accepted" : "Accept",
          () => {
            this.options.onOpportunityAccept(opportunity.id);
            this.open("Feed");
          },
          opportunity.status === "accepted" ? 0x2d3036 : 0x253a35
        );
        this.addButton(
          container,
          x + width - 94,
          rowY + 2,
          74,
          30,
          tracked ? "Tracked" : "Track",
          () => {
            this.options.onOpportunityTrack(opportunity.id);
            this.open("Feed");
          },
          tracked ? 0x2d3036 : 0x2c4650
        );
        rowY += 86;
        if (rowY > y + 320) break;
      }
    }

    const messages = [...state.messages].sort((a, b) => b.at - a.at).slice(0, 5);
    this.renderTextList(container, x, rowY + 6, width, [
      "Messages",
      ...(messages.length
        ? messages.map((message) => `${message.read ? "" : "* "}${message.from}: ${message.body}`)
        : ["No messages yet."])
    ]);
    this.options.onFeedViewed();
  }

  private renderHustleBoard(container: Phaser.GameObjects.Container, x: number, y: number, width: number): number {
    const world = this.options.getWorld();
    const activeDelivery = world.life.hustle.activeDelivery;
    const rentPressure = getRentPressureState(world);
    const player = world.players[world.localPlayerId];
    this.renderTextList(container, x, y, width, [
      `NusaDrop Board: ${world.life.hustle.completedDeliveryCount} runs | Rp ${world.life.hustle.deliveryEarnings} earned | ${world.life.hustle.driverRating.toFixed(1)}★`,
      `Rent target: Rp ${world.life.hustle.rentAmount} by Day ${world.life.hustle.rentDueDay} (${rentPressure.shortLabel}) | Scooter: ${world.life.hustle.scooterTier.replace(/_/g, " ")} ${player.bikeCondition}%`
    ]);
    let rowY = y + 50;
    const rentReady = player.money >= world.life.hustle.rentAmount;
    const repairStatus = getScooterRepairStatus(world);
    const scooterUpgrade = getScooterUpgradeStatus(world);
    const compactActions = width < 460;
    const actionGap = 10;
    const actionWidth = compactActions ? Math.max(112, (width - actionGap) / 2) : 126;
    const upgradeWidth = compactActions ? actionWidth : 158;
    const repairX = compactActions ? x : x + 304;
    const repairY = compactActions ? rowY + 36 : rowY;
    this.addButton(
      container,
      x,
      rowY,
      actionWidth,
      28,
      rentReady ? "Pay Rent" : "Rent Goal",
      () => {
        if (rentReady) {
          this.options.onPayRent();
          this.open("Feed");
        } else {
          this.options.toast(`Need Rp ${world.life.hustle.rentAmount - player.money} more for rent.`);
        }
      },
      rentReady ? 0x253a35 : 0x2d3036
    );
    this.addButton(
      container,
      x + actionWidth + actionGap,
      rowY,
      upgradeWidth,
      28,
      scooterUpgrade.available ? "Upgrade Scooter" : "Scooter Locked",
      () => {
        if (scooterUpgrade.available) {
          this.options.onUpgradeScooter();
          this.open("Feed");
        } else {
          this.options.toast(scooterUpgrade.reason ?? "Scooter upgrade is locked.");
        }
      },
      scooterUpgrade.available ? 0x253a47 : 0x2d3036
    );
    this.addButton(
      container,
      repairX,
      repairY,
      compactActions ? actionWidth : 132,
      28,
      repairStatus.available ? `Repair Rp ${repairStatus.cost}` : "Repair Locked",
      () => {
        if (repairStatus.available) {
          this.options.onRepairScooter();
          this.open("Feed");
        } else {
          this.options.toast(repairStatus.reason ?? "Scooter repair is locked.");
        }
      },
      repairStatus.available ? 0x334532 : 0x2d3036
    );
    rowY += compactActions ? 78 : 42;

    if (activeDelivery) {
      const delivery = getDeliveryDefinition(activeDelivery.deliveryId);
      const timeLeft = Math.max(0, Math.ceil(activeDelivery.dueAt - this.options.getNow()));
      const condition = delivery?.conditions?.find((candidate) => candidate.id === activeDelivery.conditionId);
      this.renderTextList(container, x, rowY, width - 150, [
        `Active: ${delivery?.title ?? activeDelivery.deliveryId}${condition ? ` — ${condition.label}` : ""}`,
        `${activeDelivery.stage === "accepted" ? delivery?.pickupLabel ?? "Go to pickup." : delivery?.dropoffLabel ?? "Go to dropoff."} ${timeLeft} min left.`
      ]);
      this.addButton(container, x + width - 132, rowY + 2, 112, 30, "Tracked", () => {
        this.options.toast("Follow the delivery marker and press E / ACT.");
      }, 0x2d3036);
      return rowY + 62;
    }

    const offers = getDeliveryOfferAvailability(world);
    if (offers.length === 0) {
      this.renderTextList(container, x, rowY, width, ["Delivery board unlocks after Ibu Sari's first run."]);
      return rowY + 42;
    }

    for (const offer of offers.slice(0, 5)) {
      const delivery = offer.delivery;
      const condition = offer.available ? previewDeliveryCondition(world, delivery, this.options.getNow()) : undefined;
      const terms = getEffectiveDeliveryTerms(delivery, condition);
      const gate = offer.available
        ? `Rp ${terms.payout} | ${terms.timeLimitMin} min${condition ? ` | ${condition.label}` : ""}`
        : offer.reason ?? "Locked";
      this.renderTextList(container, x, rowY, width - 150, [
        `${delivery.title}${offer.available ? "" : " (locked)"}`,
        `${gate}. ${condition?.description ?? delivery.description}`
      ]);
      this.addButton(
        container,
        x + width - 132,
        rowY + 2,
        112,
        30,
        offer.available ? "Start" : "Locked",
        () => {
          if (offer.available) {
            this.options.onDeliveryAccept(delivery.id);
            this.open("Feed");
          } else {
            this.options.toast(offer.reason ?? "That delivery is locked.");
          }
        },
        offer.available ? 0x253a35 : 0x2d3036
      );
      rowY += 64;
    }
    return rowY;
  }

  private contactLines(): string[] {
    const world = this.options.getWorld();
    const npcRelationships = world.relationships.filter((memory) => memory.subjectType === "npc");
    if (npcRelationships.length === 0) {
      return ["No relationship memories yet. Talk, help, buy, or finish quests to build memory."];
    }
    return npcRelationships.flatMap((memory) => {
      const npc = npcDefinitions[memory.subjectId];
      const tier = getAffinityTier(memory);
      const memories = summarizeRelationshipMemories(memory, 2);
      const arcStates = getRelationshipArcStatesForNpc(world, memory.subjectId);
      const completeArcCount = arcStates.filter((state) => state.complete).length;
      const nextArc = arcStates.find((state) => !state.complete);
      return [
        `${npc?.name ?? memory.subjectId}: ${tier} (affinity ${memory.affinity})`,
        `  Perk: ${getAffinityPerk(memory)}`,
        arcStates.length
          ? `  Arc: ${completeArcCount}/${arcStates.length}${nextArc ? ` next ${nextArc.beat.title}${nextArc.blockedReason ? ` (${nextArc.blockedReason})` : ""}` : " complete"}`
          : "  Arc: none authored yet",
        memories.length ? `  Known: ${memories.join(" / ")}` : "  Known: no specific memories yet"
      ];
    });
  }

  private threadLines(): string[] {
    const world = this.options.getWorld();
    const unlocked = discoveryLedgerEntries.filter((entry) =>
      isDiscoveryLedgerEntryUnlocked(world, entry));
    const lockedCount = discoveryLedgerEntries.length - unlocked.length;
    if (unlocked.length === 0) {
      return ["Nothing here yet. Keep exploring Berawa."];
    }
    return [
      ...unlocked.flatMap((entry) => [
        `${entry.kind === "investigation" ? "Investigation" : "Codex"}: ${entry.title}`,
        entry.body,
        ""
      ]),
      lockedCount > 0
        ? `${lockedCount} entr${lockedCount === 1 ? "y" : "ies"} still locked.`
        : "All current entries unlocked."
    ];
  }

  private questLines(): string[] {
    const world = this.options.getWorld();
    const player = world.players[world.localPlayerId];
    const active = player.activeQuestIds.map((id) => `Active: ${questDefinitions[id]?.title ?? id}`);
    const complete = player.completedQuestIds.map((id) => `Done: ${questDefinitions[id]?.title ?? id}`);
    const quests = [...active, ...complete].length ? [...active, ...complete] : ["No active quests. Talk to Ibu Sari or Kadek."];
    const goals = getSettlingInGoalStates(world).map((goal) => `${goal.complete ? "Done" : "Goal"}: ${goal.title} - ${goal.description}`);
    const hustleGoals = getHustleGoalStates(world).map((goal) => {
      const progress = goal.complete ? goal.progress : `${goal.description} (${goal.progress})`;
      return `${goal.complete ? "Done" : "NusaDrop"}: ${goal.title} - ${progress}`;
    });
    const hustleNext = getHustleNextStep(world);
    const act2Next = getAct2NextStep(world);
    const act2Goals = getAct2GoalStates(world).map((goal) => {
      const progress = goal.complete ? goal.progress : `${goal.description} (${goal.progress})`;
      return `${goal.complete ? "Done" : "Social"}: ${goal.title} - ${progress}`;
    });
    const act3Next = getAct3ReadinessNextStep(world);
    const act3Goals = getAct3ReadinessGoalStates(world).map((goal) => {
      const progress = goal.complete ? goal.progress : `${goal.description} (${goal.progress})`;
      return `${goal.complete ? "Ready" : "Build"}: ${goal.title} - ${progress}`;
    });
    const act0Step = getAct0StepState(world);
    return [
      ...quests,
      ...(!world.life.actProgress.firstDayComplete
        ? ["", "Act 0 First Day", `Current: ${act0Step.title} - ${act0Step.objective}`]
        : []),
      "",
      "Act 1 NusaDrop",
      `Next: ${hustleNext.title} - ${hustleNext.detail}`,
      ...hustleGoals,
      ...(act2Goals.length
        ? ["", "Act 2 Find Your People", ...(act2Next ? [`Next: ${act2Next.title} - ${act2Next.detail}`] : []), ...act2Goals]
        : []),
      ...(act3Goals.length
        ? ["", "Act 3 Building Something", ...(act3Next ? [`Next: ${act3Next.title} - ${act3Next.detail}`] : []), ...act3Goals]
        : []),
      "",
      "Settling In",
      ...goals,
      world.life.settledIn ? "Status: settled in. Next chapter teaser: deeper friendships and housing." : "Status: still finding your rhythm."
    ];
  }

  private calendarLines(): string[] {
    const world = this.options.getWorld();
    const active = getActiveEvents(world.clock, world).map((event) => `Now: ${event.title} @ ${getVenue(event.locationVenueId)?.name ?? event.locationVenueId} (${formatEventTime(event)})`);
    const upcoming = getUpcomingEvents(world.clock, world).map((event) => `Soon: ${event.title} @ ${getVenue(event.locationVenueId)?.name ?? event.locationVenueId} (${formatEventTime(event)})`);
    return [...active, ...upcoming].length ? [...active, ...upcoming] : ["No events in the next window."];
  }

  private renderProfile(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    width: number,
    _height: number
  ): void {
    const world = this.options.getWorld();
    const profile = world.profile;
    const reputation = world.reputation;
    this.renderTextList(container, x, y, width, [
      `${profile.displayName} @ ${profile.homeArea}`,
      `Avatar: ${profile.avatar.body}, ${profile.avatar.hair}, ${profile.avatar.outfit}${profile.avatar.accessory ? `, ${profile.avatar.accessory}` : ""}`,
      `Bio: ${profile.bio}`,
      `Lifestyle tags: ${profile.lifestyleTags.length ? profile.lifestyleTags.join(", ") : "none"}`,
      `Reputation score: ${reputation.score}`,
      `Meters: ${formatVisibleMeterValues(world)}`,
      `Visible reputation tags: ${reputation.tags.length ? reputation.tags.join(", ") : "none yet"}`,
      `Audio: ${this.options.isAudioMuted?.() ? "muted" : "on"}`,
      "Tap tags below to edit local profile tags."
    ]);

    const muted = this.options.isAudioMuted?.() ?? false;
    this.addButton(
      container,
      x,
      y + 174,
      116,
      28,
      muted ? "Audio Muted" : "Audio On",
      () => this.options.onAudioMutedChange?.(!muted),
      muted ? 0x4a3331 : 0x35533f
    );
    this.addButton(container, x + 124, y + 174, 132, 28, "Send feedback", () => this.options.onFeedback(), 0x253a35);

    let tagX = x;
    let tagY = y + 216;
    for (const tag of lifestyleTagSuggestions) {
      const active = profile.lifestyleTags.includes(tag);
      const labelWidth = Math.max(74, Math.min(116, tag.length * 8 + 26));
      if (tagX + labelWidth > x + width) {
        tagX = x;
        tagY += 34;
      }
      this.addButton(container, tagX, tagY, labelWidth, 28, active ? `* ${tag}` : tag, () => {
        const next = active
          ? profile.lifestyleTags.filter((candidate) => candidate !== tag)
          : [...profile.lifestyleTags, tag];
        setLifestyleTags(profile, next);
        this.options.save();
        this.open("Profile");
      }, active ? 0x35533f : 0x253040);
      tagX += labelWidth + 6;
    }
  }

  private renderEvents(container: Phaser.GameObjects.Container, x: number, y: number, width: number): void {
    let rowY = y;
    const world = this.options.getWorld();
    const visibleEvents = gameEventDefinitions.filter((event) => {
      const requiredGroupId = event.visibility?.requiresJoinedGroupId;
      return !requiredGroupId || world.life.joinedClubIds.includes(requiredGroupId);
    });
    for (const event of visibleEvents) {
      this.renderTextList(container, x, rowY, width - 150, [
        `${event.title} @ ${getVenue(event.locationVenueId)?.name ?? event.locationVenueId}`,
        `${formatEventSchedule(event)} | ${event.type}`,
        event.description
      ]);
      this.addButton(
        container,
        x + width - 136,
        rowY + 2,
        116,
        30,
        "On-site E",
        () => this.options.toast("Go to the venue during the event window and press E."),
        0x2d3036
      );
      rowY += 78;
      if (rowY > y + 350) break;
    }
    if (visibleEvents.length < gameEventDefinitions.length) {
      this.renderTextList(container, x, rowY + 6, width, [`${gameEventDefinitions.length - visibleEvents.length} club event(s) unlock after joining their club.`]);
    }
  }

  private renderVenues(container: Phaser.GameObjects.Container, x: number, y: number, width: number): void {
    let rowY = y;
    const venues = getVisibleVenues(this.options.getWorld().mapDiscovery);
    const selectedVenue = venues.find((venue) => venue.id === this.selectedVenueId);
    if (this.selectedVenueId && selectedVenue) {
      this.renderVenueDetail(container, selectedVenue, x, y, width);
      return;
    }
    if (this.selectedVenueId && !selectedVenue) {
      this.selectedVenueId = undefined;
    }

    for (const venue of venues) {
      this.renderVenueRow(container, venue, x, rowY, width);
      rowY += 64;
      if (rowY > y + 385) break;
    }
    if (venues.length === 0) {
      this.renderTextList(container, x, y, width, ["No discovered venue details yet. Explore Berawa to reveal them."]);
    }
  }

  private renderVenueRow(container: Phaser.GameObjects.Container, venue: Venue, x: number, y: number, width: number): void {
    const ratingCopy =
      venue.rating && venue.reviewCount
        ? `Rating ${venue.rating} (${venue.reviewCount} reviews)`
        : `Rating data ${venue.verificationStatus.replace(/_/g, " ")}`;
    this.renderTextList(container, x, y, width - 132, [
      `${venue.name} (${venue.venueCategory}, ${venue.implementationStatus})`,
      `${ratingCopy}. ${venue.description}`
    ]);
    this.addButton(
      container,
      x + width - 118,
      y + 2,
      98,
      30,
      "Details",
      () => {
        this.selectedVenueId = venue.id;
        this.open("Venues");
      },
      0x253a35
    );
  }

  private renderVenueDetail(container: Phaser.GameObjects.Container, venue: Venue, x: number, y: number, width: number): void {
    this.addButton(
      container,
      x,
      y,
      90,
      30,
      "Back",
      () => {
        this.selectedVenueId = undefined;
        this.open("Venues");
      },
      0x394155
    );

    const npcNames = venue.npcIds.map((id) => npcDefinitions[id]?.name ?? id);
    const itemNames = venue.itemIds.map((id) => itemDefinitions[id]?.name ?? id);
    const questTitles = venue.questIds.map((id) => questDefinitions[id]?.title ?? id);
    const quality = venue.rating && venue.reviewCount
      ? `Rating ${venue.rating} / ${venue.reviewCount} reviews (${venue.ratingSource}, ${venue.verificationStatus})`
      : `Rating/review data: ${venue.verificationStatus.replace(/_/g, " ")} (${venue.ratingSource})`;
    const verified = venue.lastVerifiedAt ? `Last verified: ${venue.lastVerifiedAt}` : "Last verified: not verified in this local slice";

    this.renderTextList(container, x, y + 44, width, [
      venue.name,
      `Category: ${venue.venueCategory}  |  Type: ${venue.type}  |  Status: ${venue.implementationStatus}`,
      `Hours: ${this.formatOpenHours(venue)}`,
      `Discovery: ${venue.discoveryState}  |  Map visibility: ${venue.mapVisibility}`,
      quality,
      verified,
      "",
      venue.description,
      "",
      `NPCs: ${npcNames.length ? npcNames.join(", ") : "none assigned yet"}`,
      `Items: ${itemNames.length ? itemNames.join(", ") : "none assigned yet"}`,
      `Related quests: ${questTitles.length ? questTitles.join(", ") : "none yet"}`,
      "",
      "Commerce/check-in/booking/delivery seams are placeholders only; no live integration in this slice."
    ]);
  }

  private formatOpenHours(venue: Venue): string {
    const entries = Object.entries(venue.openHours);
    if (entries.length === 0) {
      return "unknown";
    }
    return entries
      .map(([day, hours]) => {
        if (hours === "closed") {
          return `${day}: closed`;
        }
        return `${day}: ${hours.open}:00-${hours.close}:00`;
      })
      .join(" / ");
  }

  private renderCommunity(container: Phaser.GameObjects.Container, x: number, y: number, width: number): void {
    const world = this.options.getWorld();
    const offline = getOfflineActivities().map(
      (activity) => `- ${activity.onlinePreview} [${activity.status}${activity.requiresMultiplayer ? ", multiplayer locked" : ""}]`
    );
    this.renderTextList(container, x, y, width, [
      `Reputation score: ${world.reputation.score}`,
      `Visible tags: ${world.reputation.tags.length ? world.reputation.tags.join(", ") : "none yet"}`,
      "Community Council - coming soon. No live moderation in this slice.",
      `Priority venue candidates: ${getPriorityVenueCandidates().length} seeded, all manual/needs verification.`,
      "Map data © OpenStreetMap contributors. Cached offline for this slice."
    ]);

    let rowY = y + 102;
    this.renderTextList(container, x, rowY, width, ["Clubs / Groups"]);
    rowY += 30;
    for (const group of getAllSocialGroups()) {
      const joined = isSocialGroupJoined(world, group.id);
      const home = group.homeVenueId ? getVenue(group.homeVenueId)?.name ?? group.homeVenueId : "roaming";
      const members = group.memberIds.map((id) => npcDefinitions[id]?.name ?? id).join(", ");
      const events = (group.recurringEventIds ?? getEventsForGroup(group.id).map((event) => event.id))
        .map((eventId) => gameEventDefinitions.find((event) => event.id === eventId)?.title ?? eventId)
        .join(", ");
      this.renderTextList(container, x, rowY, width - 138, [
        `${joined ? "Joined: " : ""}${group.name} (${group.purpose}) @ ${home}`,
        `${group.description} Members: ${members || "none yet"}. Events: ${events || "none yet"}.`
      ]);
      this.addButton(
        container,
        x + width - 118,
        rowY + 2,
        98,
        30,
        joined ? "Joined" : "Join",
        () => this.dispatchAndRefresh({ kind: "JoinClub", groupId: group.id }),
        joined ? 0x2d3036 : 0x253a35
      );
      rowY += 72;
      if (rowY > y + 368) break;
    }

    if (rowY <= y + 390) {
      this.renderTextList(container, x, rowY + 4, width, ["Simulated Offline Activity Previews", ...offline.slice(0, 2)]);
    }
  }

  private formatCountdown(minutes: number): string {
    const rounded = Math.max(0, Math.ceil(minutes));
    if (rounded >= 60) {
      const hours = Math.floor(rounded / 60);
      const mins = rounded % 60;
      return `${hours}h${mins ? ` ${mins}m` : ""}`;
    }
    return `${rounded}m`;
  }

  private renderTextList(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    width: number,
    lines: string[]
  ): Phaser.GameObjects.Text {
    const text = this.options.scene.add.text(x, y, lines.join("\n"), {
      ...this.bodyStyle(14),
      wordWrap: { width }
    });
    container.add(text);
    return text;
  }

  private dispatchAndRefresh(intent: Parameters<IntentDispatcher["dispatch"]>[0]): void {
    const result = this.options.dispatcher.dispatch(intent, this.options.getWorld(), this.options.getNow());
    this.options.toast(result.message);
    this.options.save();
    this.refresh();
  }

  private addButton(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    fill = 0x253a47
  ): void {
    const scene = this.options.scene;
    const button = scene.add.container(x, y);
    const bg = scene.add.graphics();
    bg.fillStyle(fill, 1);
    bg.fillRoundedRect(0, 0, width, height, 6);
    bg.lineStyle(1, 0xf4d58d, 0.28);
    bg.strokeRoundedRect(0, 0, width, height, 6);
    const text = scene.add
      .text(8, height / 2, label, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "12px",
        color: "#fff8df"
      })
      .setOrigin(0, 0.5);
    text.setWordWrapWidth(width - 12);
    button.add([bg, text]);
    button.setSize(width, height);
    button.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    container.add(button);

    if (button.input) {
      button.input.cursor = "pointer";
    }
    button.on("pointerover", () => bg.setAlpha(0.86));
    button.on("pointerout", () => bg.setAlpha(1));
    button.on("pointerdown", (pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Phaser.Types.Input.EventData) => {
      event?.stopPropagation();
      pointer.event?.stopPropagation();
      this.options.playUiClick?.();
      onClick();
    });
  }

  private titleStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "22px",
      color: "#fff0bd",
      fontStyle: "700"
    };
  }

  private sectionStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "17px",
      color: "#f4d58d",
      fontStyle: "700"
    };
  }

  private bodyStyle(size: number): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: `${size}px`,
      color: "#fff8df",
      lineSpacing: 4
    };
  }
}
