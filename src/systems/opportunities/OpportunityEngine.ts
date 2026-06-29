import { opportunityTemplates } from "../../data/opportunities";
import { addItem } from "../Inventory";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import {
  formatPerformanceSummary,
  scaleMeterDeltasForPerformance,
  scaleMoneyDeltaForPerformance
} from "../minigames/ActivityMinigames";
import { bumpRelationshipAffinity, getAffinityTier, getRelationship, recordRelationshipMemory } from "../relationships/RelationshipMemory";
import { adjustReputation, awardReputationTag } from "../reputation/ReputationState";
import { getRentPressureState } from "../hustle/HustleEconomy";
import { advanceWorldMinutes } from "../time/DailyClock";
import type {
  LiveOpportunity,
  OpportunityMessage,
  OpportunityRuntimeState,
  OpportunityTemplate,
  OpportunityType,
  WorldClockState,
  WorldState
} from "../../types";

const DEFAULT_MIN_LIVE = 2;
const DEFAULT_MAX_LIVE = 4;
const DEFAULT_COOLDOWN_MIN = 360;
const MAX_FEED_MESSAGES = 48;
const AFFINITY_TIER_RANK = {
  stranger: 0,
  acquaintance: 1,
  friendly: 2,
  regular: 3,
  trusted: 4
} as const;

export interface OpportunityMaintenanceResult {
  spawned: LiveOpportunity[];
  expired: LiveOpportunity[];
}

export interface OpportunityResolveResult {
  ok: boolean;
  message: string;
  opportunity?: LiveOpportunity;
  spawnedChain?: LiveOpportunity;
}

export interface OpportunityEngineOptions {
  minLive?: number;
  maxLive?: number;
}

export function createDefaultOpportunityState(): OpportunityRuntimeState {
  return {
    live: [],
    completedTemplateIds: [],
    missedTemplateIds: [],
    messages: [],
    trackedOpportunityId: null,
    lastSpawnAt: 0,
    templateCooldownUntil: {}
  };
}

export function migrateOpportunityState(raw: unknown): OpportunityRuntimeState {
  if (!isRecord(raw)) {
    return createDefaultOpportunityState();
  }
  return {
    live: Array.isArray(raw.live) ? raw.live.filter(isLiveOpportunity) : [],
    completedTemplateIds: readStringArray(raw.completedTemplateIds),
    missedTemplateIds: readStringArray(raw.missedTemplateIds),
    messages: Array.isArray(raw.messages) ? raw.messages.filter(isOpportunityMessage).slice(-MAX_FEED_MESSAGES) : [],
    trackedOpportunityId: typeof raw.trackedOpportunityId === "string" ? raw.trackedOpportunityId : null,
    lastSpawnAt: readFiniteNumber(raw.lastSpawnAt, 0),
    templateCooldownUntil: isRecord(raw.templateCooldownUntil)
      ? Object.fromEntries(
          Object.entries(raw.templateCooldownUntil)
            .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
        )
      : {}
  };
}

export function getOpportunityTemplate(templateId: string): OpportunityTemplate | undefined {
  return opportunityTemplates.find((template) => template.id === templateId);
}

export function getOpportunityTemplateForLive(live: LiveOpportunity): OpportunityTemplate | undefined {
  return getOpportunityTemplate(live.templateId);
}

export function getUnreadOpportunityMessageCount(state: OpportunityRuntimeState): number {
  return state.messages.filter((message) => !message.read).length;
}

export function markOpportunityMessagesRead(state: OpportunityRuntimeState): void {
  for (const message of state.messages) {
    message.read = true;
  }
}

export function appendOpportunityMessage(state: OpportunityRuntimeState, message: OpportunityMessage): boolean {
  if (state.messages.some((existing) => existing.id === message.id)) {
    return false;
  }
  pushOpportunityMessage(state, message);
  return true;
}

export function generateOpportunityPhoneTexts(state: OpportunityRuntimeState, world: WorldState): OpportunityMessage[] {
  const now = getAbsoluteMinute(world.clock);
  const hour = world.clock.minuteOfDay / 60;
  const dayKey = world.clock.day;
  const created: OpportunityMessage[] = [];
  const candidates: OpportunityMessage[] = [];

  const ariMemory = getRelationship(world, "npc", "ari");
  if (AFFINITY_TIER_RANK[getAffinityTier(ariMemory)] >= AFFINITY_TIER_RANK.acquaintance && isHourInWindow(hour, 16, 18.5)) {
    candidates.push({
      id: `npc-text:ari-sunset:${dayKey}`,
      at: now,
      from: "Ari",
      body: "Sunset crowd is mellow today. If the phone pings a beach thing, come through before the light changes.",
      venueId: "berawa_beach",
      read: false
    });
  }

  const madeMemory = getRelationship(world, "npc", "made");
  if (AFFINITY_TIER_RANK[getAffinityTier(madeMemory)] >= AFFINITY_TIER_RANK.friendly && isHourInWindow(hour, 9, 11.5)) {
    candidates.push({
      id: `npc-text:made-focus:${dayKey}`,
      at: now,
      from: "Made",
      body: "I saved you a focus-table seat if you want a productive morning instead of drifting.",
      venueId: "satu_satu_coffee",
      read: false
    });
  }

  if (world.life.joinedClubIds.includes("berawa_run_crew") && isHourInWindow(hour, 5.75, 7.25)) {
    candidates.push({
      id: `club-text:run-crew:${dayKey}`,
      at: now,
      from: "Berawa Run Crew",
      body: "Shoes on? Sunrise loop window is tiny, and breakfast tastes better after you earn it.",
      venueId: "berawa_beach",
      read: false
    });
  }

  if (world.reputation.score >= 62 && isHourInWindow(hour, 13, 15)) {
    candidates.push({
      id: `npc-text:ibu-market:${dayKey}`,
      at: now,
      from: "Ibu Sari",
      body: "Afternoon errands are easier before the rush. If you are nearby, check the market board.",
      venueId: "canggu_station",
      read: false
    });
  }

  if (world.life.actProgress.firstDayComplete && !world.life.hustle.activeDelivery && isHourInWindow(hour, 8, 20)) {
    candidates.push({
      id: `hustle-board:ibu-sari:${dayKey}`,
      at: now,
      from: "Ibu Sari",
      body: "If the day feels empty, check the Hustle Board. Small runs become rent money if you keep your rating clean.",
      venueId: "canggu_station",
      read: false
    });
  }

  const rentPressure = getRentPressureState(world);
  if (world.life.actProgress.firstDayComplete && rentPressure.status !== "comfortable" && isHourInWindow(hour, 7, 21)) {
    candidates.push({
      id: `rent-reminder:ibu-sari:${dayKey}`,
      at: now,
      from: "Ibu Sari",
      body: `${rentPressure.shortLabel}. ${rentPressure.message}`,
      venueId: "canggu_station",
      read: false
    });
  }

  for (const message of candidates) {
    if (appendOpportunityMessage(state, message)) {
      created.push(message);
    }
  }
  return created;
}

export function getAbsoluteMinute(clock: WorldClockState): number {
  return Math.floor((Math.max(1, clock.day) - 1) * 1440 + clock.minuteOfDay);
}

export function maintainOpportunityPool(
  state: OpportunityRuntimeState,
  world: WorldState,
  templates: OpportunityTemplate[] = opportunityTemplates,
  options: OpportunityEngineOptions = {}
): OpportunityMaintenanceResult {
  const now = getAbsoluteMinute(world.clock);
  const expired = expireOpportunities(state, world, now);
  const minLive = options.minLive ?? DEFAULT_MIN_LIVE;
  const maxLive = options.maxLive ?? DEFAULT_MAX_LIVE;
  const liveCount = state.live.filter((entry) => entry.status === "live" || entry.status === "accepted").length;
  const targetLive = liveCount === 0 ? Math.max(1, minLive) : minLive;
  const spawnCount = Math.max(0, Math.min(maxLive - liveCount, targetLive - liveCount));
  const spawned: LiveOpportunity[] = [];

  for (let index = 0; index < spawnCount; index += 1) {
    const candidates = getEligibleOpportunityTemplates(world, state, templates)
      .filter((template) => !state.live.some((entry) => entry.templateId === template.id))
      .sort((a, b) => rankTemplate(b, now, index) - rankTemplate(a, now, index));
    const next = candidates[0];
    if (!next) {
      break;
    }
    spawned.push(spawnOpportunity(state, next, now));
  }

  return { spawned, expired };
}

export function getEligibleOpportunityTemplates(
  world: WorldState,
  state: OpportunityRuntimeState,
  templates: OpportunityTemplate[] = opportunityTemplates
): OpportunityTemplate[] {
  const now = getAbsoluteMinute(world.clock);
  return templates.filter((template) => isOpportunityEligible(template, world, state, now));
}

export function isOpportunityEligible(
  template: OpportunityTemplate,
  world: WorldState,
  state: OpportunityRuntimeState,
  now = getAbsoluteMinute(world.clock)
): boolean {
  if ((state.templateCooldownUntil[template.id] ?? 0) > now) {
    return false;
  }
  const trigger = template.trigger;
  if (trigger.timeWindow && !isHourInWindow(world.clock.minuteOfDay / 60, trigger.timeWindow.startHour, trigger.timeWindow.endHour)) {
    return false;
  }
  if (trigger.venueIds && trigger.venueIds.length > 0 && !trigger.venueIds.includes(template.locationVenueId)) {
    return false;
  }
  if (trigger.areas && trigger.areas.length > 0 && !world.mapDiscovery.revealAll) {
    const knownAreas = new Set(world.mapDiscovery.discoveredAreaIds);
    if (!trigger.areas.some((areaId) => knownAreas.has(areaId))) {
      return false;
    }
  }
  if (trigger.minReputation != null && world.reputation.score < trigger.minReputation) {
    return false;
  }
  if (trigger.requiresClubId && !world.life.joinedClubIds.includes(trigger.requiresClubId)) {
    return false;
  }
  if (trigger.requiresAffinity) {
    const memory = getRelationship(world, "npc", trigger.requiresAffinity.npcId);
    const actual = getAffinityTier(memory);
    if (AFFINITY_TIER_RANK[actual] < AFFINITY_TIER_RANK[trigger.requiresAffinity.tier]) {
      return false;
    }
  }
  return true;
}

export function acceptOpportunity(state: OpportunityRuntimeState, opportunityId: string, now: number): OpportunityResolveResult {
  const live = state.live.find((entry) => entry.id === opportunityId);
  if (!live) {
    return { ok: false, message: "That opportunity is no longer available." };
  }
  if (live.status === "completed" || live.status === "missed") {
    return { ok: false, message: "That opportunity has already closed." };
  }
  live.status = "accepted";
  live.acceptedAt = now;
  state.trackedOpportunityId = live.id;
  const template = getOpportunityTemplate(live.templateId);
  appendOpportunityMessage(state, {
    id: createMessageId("accepted", live.id, now),
    at: now,
    from: "Bali Life Phone",
    body: template ? `Tracking: ${template.title}. Get to the venue before it expires.` : "Opportunity tracked.",
    opportunityId: live.id,
    venueId: live.locationVenueId,
    read: false
  });
  return { ok: true, message: template ? `Tracking ${template.title}.` : "Opportunity tracked.", opportunity: live };
}

export function resolveOpportunity(
  state: OpportunityRuntimeState,
  world: WorldState,
  opportunityId: string,
  now = getAbsoluteMinute(world.clock),
  performanceScore?: number
): OpportunityResolveResult {
  const live = state.live.find((entry) => entry.id === opportunityId);
  if (!live) {
    return { ok: false, message: "That opportunity is gone." };
  }
  if (live.expiresAt <= now) {
    expireOpportunity(state, live, now, world);
    return { ok: false, message: "That opportunity expired." };
  }
  const template = getOpportunityTemplate(live.templateId);
  if (!template) {
    return { ok: false, message: "Opportunity content is missing." };
  }
  const moneyDelta = scaleMoneyDeltaForPerformance(template.reward.money ?? 0, performanceScore);
  const player = world.players[world.localPlayerId];
  if (moneyDelta < 0 && player.money + moneyDelta < 0) {
    return { ok: false, message: `Need Rp ${Math.abs(moneyDelta)} to take that opportunity.` };
  }

  applyOpportunityReward(world, template, now, performanceScore);
  live.status = "completed";
  live.completedAt = now;
  state.completedTemplateIds.push(template.id);
  state.templateCooldownUntil[template.id] = now + (template.cooldownMin ?? DEFAULT_COOLDOWN_MIN);
  state.live = state.live.filter((entry) => entry.id !== live.id);
  if (state.trackedOpportunityId === live.id) {
    state.trackedOpportunityId = null;
  }
  appendOpportunityMessage(state, {
    id: createMessageId("completed", live.id, now),
    at: now,
    from: "Bali Life Phone",
    body: `Completed: ${template.title}. ${formatRewardSummary(template, performanceScore)}`,
    opportunityId: live.id,
    venueId: live.locationVenueId,
    read: false
  });

  let spawnedChain: LiveOpportunity | undefined;
  if (template.chainTo) {
    const nextTemplate = opportunityTemplates.find((candidate) => candidate.id === template.chainTo);
    if (nextTemplate) {
      spawnedChain = spawnOpportunity(state, nextTemplate, getAbsoluteMinute(world.clock));
    }
  }

  return {
    ok: true,
    message: `Completed ${template.title}. ${formatRewardSummary(template, performanceScore)}`,
    opportunity: live,
    spawnedChain
  };
}

export function expireOpportunities(state: OpportunityRuntimeState, world: WorldState, now = getAbsoluteMinute(world.clock)): LiveOpportunity[] {
  const expired: LiveOpportunity[] = [];
  for (const live of [...state.live]) {
    if (live.expiresAt <= now) {
      expired.push(expireOpportunity(state, live, now, world));
    }
  }
  return expired;
}

export function spawnOpportunity(
  state: OpportunityRuntimeState,
  template: OpportunityTemplate,
  now: number
): LiveOpportunity {
  const live: LiveOpportunity = {
    id: `${template.id}:${now}:${stableHash(`${template.id}:${now}:${state.live.length}`) % 10000}`,
    templateId: template.id,
    status: "live",
    spawnedAt: now,
    expiresAt: now + template.durationMin,
    locationVenueId: template.locationVenueId
  };
  state.live.push(live);
  state.lastSpawnAt = now;
  appendOpportunityMessage(state, {
    id: createMessageId("spawned", live.id, now),
    at: now,
    from: messageSender(template.type),
    body: `${template.title}: ${template.blurb}`,
    opportunityId: live.id,
    venueId: template.locationVenueId,
    read: false
  });
  return live;
}

export function getLiveOpportunityCountdown(live: LiveOpportunity, clock: WorldClockState): number {
  return Math.max(0, live.expiresAt - getAbsoluteMinute(clock));
}

function applyOpportunityReward(world: WorldState, template: OpportunityTemplate, now: number, performanceScore?: number): void {
  const player = world.players[world.localPlayerId];
  player.money = Math.max(0, player.money + scaleMoneyDeltaForPerformance(template.reward.money ?? 0, performanceScore));
  if (template.reward.meterDeltas) {
    adjustPlayerMeters(world, scaleMeterDeltasForPerformance(template.reward.meterDeltas, performanceScore));
  }
  for (const item of template.reward.items ?? []) {
    addItem(player, item.itemId, item.quantity);
  }
  if (template.reward.reputation?.delta) {
    adjustReputation(world.reputation, template.reward.reputation.delta, template.reward.reputation.reason, now);
  }
  if (template.reward.reputation?.tag) {
    awardReputationTag(world.reputation, template.reward.reputation.tag, template.reward.reputation.reason, now);
  }
  for (const bump of template.reward.affinityBumps ?? []) {
    bumpRelationshipAffinity(world, "npc", bump.npcId, bump.amount, `Opportunity: ${template.title}`, now);
  }
  advanceWorldMinutes(world, template.timeCostMin);
}

function expireOpportunity(state: OpportunityRuntimeState, live: LiveOpportunity, now: number, world?: WorldState): LiveOpportunity {
  live.status = "missed";
  live.missedAt = now;
  state.missedTemplateIds.push(live.templateId);
  state.templateCooldownUntil[live.templateId] = now + DEFAULT_COOLDOWN_MIN;
  state.live = state.live.filter((entry) => entry.id !== live.id);
  if (state.trackedOpportunityId === live.id) {
    state.trackedOpportunityId = null;
  }
  const template = getOpportunityTemplate(live.templateId);
  if (world && template?.type === "social") {
    const npcIds = new Set((template.reward.affinityBumps ?? []).map((bump) => bump.npcId));
    for (const npcId of npcIds) {
      recordRelationshipMemory(world, "npc", npcId, "missed_opportunity", `Missed ${template.title}`, now);
    }
  }
  appendOpportunityMessage(state, {
    id: createMessageId("missed", live.id, now),
    at: now,
    from: "Bali Life Phone",
    body: template ? `Missed: ${template.title}. Another window may open later.` : "An opportunity expired.",
    opportunityId: live.id,
    venueId: live.locationVenueId,
    read: false
  });
  return live;
}

function pushOpportunityMessage(state: OpportunityRuntimeState, message: OpportunityMessage): void {
  state.messages.push(message);
  if (state.messages.length > MAX_FEED_MESSAGES) {
    state.messages = state.messages.slice(-MAX_FEED_MESSAGES);
  }
}

function isHourInWindow(hour: number, startHour: number, endHour: number): boolean {
  if (startHour === endHour) {
    return true;
  }
  if (endHour > startHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

function rankTemplate(template: OpportunityTemplate, now: number, slot: number): number {
  return (template.weight ?? 1) * 100000 + (stableHash(`${template.id}:${Math.floor(now / 60)}:${slot}`) % 100000);
}

function stableHash(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createMessageId(kind: string, opportunityId: string, now: number): string {
  return `${kind}:${opportunityId}:${now}`;
}

function messageSender(type: OpportunityType): string {
  if (type === "gig") return "Gig Radar";
  if (type === "social") return "Friends Nearby";
  if (type === "help_out") return "Local Help";
  if (type === "flash_deal") return "Venue Ping";
  if (type === "rumor") return "Rumor Mill";
  return "Trade Board";
}

function formatRewardSummary(template: OpportunityTemplate, performanceScore?: number): string {
  const parts: string[] = [];
  const money = scaleMoneyDeltaForPerformance(template.reward.money ?? 0, performanceScore);
  if (money > 0) parts.push(`Rp +${money}`);
  if (money < 0) parts.push(`Rp ${money}`);
  const meterParts = Object.entries(scaleMeterDeltasForPerformance(template.reward.meterDeltas ?? {}, performanceScore)).map(
    ([meter, delta]) => `${meter} ${Number(delta) >= 0 ? "+" : ""}${delta}`
  );
  parts.push(...meterParts);
  if (template.reward.items?.length) {
    parts.push(`items ${template.reward.items.map((item) => item.itemId).join(", ")}`);
  }
  const summary = parts.length ? parts.join(" | ") : "No immediate reward.";
  return `${summary}${formatPerformanceSummary(performanceScore)}`;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function readFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLiveOpportunity(value: unknown): value is LiveOpportunity {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.templateId === "string" &&
    typeof value.status === "string" &&
    typeof value.spawnedAt === "number" &&
    typeof value.expiresAt === "number" &&
    typeof value.locationVenueId === "string"
  );
}

function isOpportunityMessage(value: unknown): value is OpportunityMessage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.at === "number" &&
    typeof value.from === "string" &&
    typeof value.body === "string" &&
    typeof value.read === "boolean"
  );
}
