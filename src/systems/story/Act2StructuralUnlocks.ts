import { ARI_SURF_RUN_CREW_ID, KITCHEN_CIRCLE_CREW_ID, getCrewSessionSlot } from "../../data/crews";
import { itemDefinitions } from "../../data/items";
import type { GameEvent, Meter, OpportunityMessage, ShopDefinition, WorldState } from "../../types";
import { addItem, removeItem } from "../Inventory";
import { getCrewState } from "../crews/CrewSystem";
import { activateFocusBuffer, FOCUS_BUFFER_DURATION_MIN } from "../meters/FocusBuffer";
import { getAffinityTier, getRelationship, type AffinityTier } from "../relationships/RelationshipMemory";
import {
  isKadekPriorityDriver,
  KADEK_FOCUS_BUFFER_ITEM_ID
} from "./Act1KadekPriority";
import { isKitchenCircleInvitationPending } from "./Act2KitchenCircle";

export const STRUCTURAL_AFFINITY_TIER: AffinityTier = "friendly";
export const IBU_BULK_NASI_PRICE = 30;
export const KADEK_FOCUS_PASTRY_PRICE = 18;
export const SURF_RUN_REGULAR_RECOVERY_BONUS: Partial<Record<Meter, number>> = {
  energy: 4,
  wellbeing: 4
};
export const WARUNG_PUBLIC_CLOSE_MINUTE = 18 * 60;
export const WARUNG_REGULAR_CLOSE_MINUTE = 22 * 60;

const KADEK_PASTRY_PURCHASE_DAY_FLAG = "act2:structural:kadekPastryPurchaseDay";

const AFFINITY_TIER_RANK: Record<AffinityTier, number> = {
  stranger: 0,
  acquaintance: 1,
  friendly: 2,
  regular: 3,
  trusted: 4
};

const IBU_WARMER_LINES = [
  'Ibu holds the nearest stool with one hand. "You eat first. Then you can tell me what the app thinks is urgent."',
  '"Sit," Ibu says, already reaching for a plate. "People make worse decisions when they pretend coffee was lunch."',
  'Ibu moves a bowl out of the rush and toward you. "No arguing. Rice before ratings."'
] as const;

export interface StructuralEventMeterState {
  meterDeltas: Partial<Record<Meter, number>>;
  benefitMessage?: string;
}

export interface WarungInteriorAccessState {
  allowed: boolean;
  kind: "legacy" | "public" | "active_commitment" | "crew_session" | "regular_after_hours" | "closed";
  message: string;
}

export interface StructuralShopItemOffer {
  itemId: string;
  displayName: string;
  price: number;
  available: boolean;
  reason?: string;
  benefitLabel?: string;
}

export interface StructuralPurchaseResult {
  ok: boolean;
  message: string;
  bufferUntil?: number;
}

export function isNpcStructuralAffinityUnlocked(world: WorldState, npcId: "ibu_sari" | "kadek" | "ari"): boolean {
  if (world.life.actProgress.currentAct < 2) return false;
  const tier = getAffinityTier(getRelationship(world, "npc", npcId));
  return AFFINITY_TIER_RANK[tier] >= AFFINITY_TIER_RANK[STRUCTURAL_AFFINITY_TIER];
}

export function hasSurfRunRegularBenefit(world: WorldState): boolean {
  return getCrewState(world, ARI_SURF_RUN_CREW_ID).regularBenefitActive;
}

export function hasKitchenCircleRegularBenefit(world: WorldState): boolean {
  return getCrewState(world, KITCHEN_CIRCLE_CREW_ID).regularBenefitActive;
}

export function getStructuralEventMeterState(world: WorldState, event: GameEvent): StructuralEventMeterState {
  const slot = event.crewSession
    ? getCrewSessionSlot(event.crewSession.crewId, event.crewSession.sessionSlotId)
    : undefined;
  if (
    event.crewSession?.crewId !== ARI_SURF_RUN_CREW_ID ||
    slot?.kind !== "morning_run" ||
    !hasSurfRunRegularBenefit(world)
  ) {
    return { meterDeltas: { ...event.participation.meterDeltas } };
  }

  return {
    meterDeltas: {
      ...event.participation.meterDeltas,
      energy: (event.participation.meterDeltas.energy ?? 0) + (SURF_RUN_REGULAR_RECOVERY_BONUS.energy ?? 0),
      wellbeing: (event.participation.meterDeltas.wellbeing ?? 0) + (SURF_RUN_REGULAR_RECOVERY_BONUS.wellbeing ?? 0)
    },
    benefitMessage: "Surf & Run regular recovery: Energy +4, Wellbeing +4."
  };
}

export function getWarungInteriorAccessState(world: WorldState): WarungInteriorAccessState {
  if (world.life.actProgress.currentAct < 2) {
    return { allowed: true, kind: "legacy", message: "Existing Act 0/1 warung access remains unchanged." };
  }
  if (world.life.hustle.activeDelivery) {
    return { allowed: true, kind: "active_commitment", message: "The active delivery keeps the counter reachable." };
  }

  const minute = world.clock.minuteOfDay;
  if (minute >= 7 * 60 && minute < WARUNG_PUBLIC_CLOSE_MINUTE) {
    return { allowed: true, kind: "public", message: "Warung Sari is open." };
  }

  const dayOfWeek = world.clock.day % 7;
  const isKitchenNight = dayOfWeek === 2 || dayOfWeek === 6;
  const kitchenState = getCrewState(world, KITCHEN_CIRCLE_CREW_ID);
  const isSessionWindow = isKitchenNight && minute >= 18 * 60 && minute < 20 * 60;
  if (isSessionWindow && (kitchenState.invited || kitchenState.member || isKitchenCircleInvitationPending(world))) {
    return { allowed: true, kind: "crew_session", message: "The Kitchen Circle side door is open for tonight's session." };
  }
  if (
    isKitchenNight &&
    minute >= WARUNG_PUBLIC_CLOSE_MINUTE &&
    minute < WARUNG_REGULAR_CLOSE_MINUTE &&
    hasKitchenCircleRegularBenefit(world)
  ) {
    return {
      allowed: true,
      kind: "regular_after_hours",
      message: "Kitchen regular access: Ibu leaves the side door open until 22:00."
    };
  }
  return {
    allowed: false,
    kind: "closed",
    message: "Warung Sari is closed. Kitchen regulars can use the side door on Tue/Sat evenings."
  };
}

export function getStructuralShopItemIds(world: WorldState, shop: ShopDefinition): string[] {
  const itemIds = [...shop.sells];
  if (shop.id === "canggu_station" && isNpcStructuralAffinityUnlocked(world, "ibu_sari")) {
    const nasiIndex = itemIds.indexOf("nasi_bungkus");
    if (nasiIndex > 0) itemIds.unshift(...itemIds.splice(nasiIndex, 1));
  }
  if (
    shop.id === "baked_berawa" &&
    isKadekFocusPastryUnlocked(world) &&
    !itemIds.includes(KADEK_FOCUS_BUFFER_ITEM_ID)
  ) {
    itemIds.unshift(KADEK_FOCUS_BUFFER_ITEM_ID);
  }
  return itemIds;
}

export function getStructuralShopItemOffer(
  world: WorldState,
  shopId: string,
  itemId: string
): StructuralShopItemOffer {
  const item = itemDefinitions[itemId];
  if (shopId === "canggu_station" && itemId === "nasi_bungkus") {
    const priority = isNpcStructuralAffinityUnlocked(world, "ibu_sari");
    const bulkPrice = hasKitchenCircleRegularBenefit(world);
    return {
      itemId,
      displayName: priority ? "You eat first · Nasi Bungkus" : item.name,
      price: bulkPrice ? IBU_BULK_NASI_PRICE : item.buyPrice,
      available: true,
      benefitLabel: bulkPrice ? `crew bulk (was Rp ${item.buyPrice})` : priority ? "Ibu holds your stool" : undefined
    };
  }
  if (shopId === "baked_berawa" && itemId === KADEK_FOCUS_BUFFER_ITEM_ID) {
    const unlocked = isKadekFocusPastryUnlocked(world);
    const purchasedToday = hasPurchasedKadekFocusPastryToday(world);
    return {
      itemId,
      displayName: "Focus Buffer Pastry · 3h",
      price: KADEK_FOCUS_PASTRY_PRICE,
      available: unlocked && !purchasedToday,
      reason: !unlocked ? "Kadek's friendly priority list only." : purchasedToday ? "One pastry per day. Kadek has put the tray away." : undefined,
      benefitLabel: "once daily"
    };
  }
  return { itemId, displayName: item.name, price: item.buyPrice, available: true };
}

export function isKadekFocusPastryUnlocked(world: WorldState): boolean {
  return isKadekPriorityDriver(world) && isNpcStructuralAffinityUnlocked(world, "kadek");
}

export function hasPurchasedKadekFocusPastryToday(world: WorldState): boolean {
  return world.questFlags[KADEK_PASTRY_PURCHASE_DAY_FLAG] === world.clock.day;
}

export function purchaseKadekFocusBufferPastry(world: WorldState, now: number): StructuralPurchaseResult {
  if (!isKadekFocusPastryUnlocked(world)) {
    return { ok: false, message: "Kadek's Focus Buffer pastry needs friendly affinity and his priority list." };
  }
  if (hasPurchasedKadekFocusPastryToday(world)) {
    return { ok: false, message: "One Focus Buffer pastry per day. Kadek has put the tray away." };
  }
  const player = world.players[world.localPlayerId];
  if (player.money < KADEK_FOCUS_PASTRY_PRICE) {
    return { ok: false, message: `Need Rp ${KADEK_FOCUS_PASTRY_PRICE} for Kadek's Focus Buffer pastry.` };
  }

  player.money -= KADEK_FOCUS_PASTRY_PRICE;
  addItem(player, KADEK_FOCUS_BUFFER_ITEM_ID, 1);
  removeItem(player, KADEK_FOCUS_BUFFER_ITEM_ID, 1);
  const bufferUntil = activateFocusBuffer(world, now);
  world.questFlags[KADEK_PASTRY_PURCHASE_DAY_FLAG] = world.clock.day;
  return {
    ok: true,
    message: `Focus Buffer pastry Rp ${KADEK_FOCUS_PASTRY_PRICE}. Focus loss is paused for ${FOCUS_BUFFER_DURATION_MIN / 60} in-game hours.`,
    bufferUntil
  };
}

export function getStructuralNpcDialogueLine(world: WorldState, npcId: string): string | undefined {
  if (npcId === "ibu_sari" && isNpcStructuralAffinityUnlocked(world, "ibu_sari")) {
    const memoryCount = getRelationship(world, "npc", "ibu_sari")?.memories.length ?? 0;
    return IBU_WARMER_LINES[memoryCount % IBU_WARMER_LINES.length];
  }
  if (npcId === "ari" && hasSurfRunRegularBenefit(world)) {
    return '"Board goes here, shoes there," Ari says. "Regulars know the circle makes room before it asks questions."';
  }
  return undefined;
}

export function getAriCircleInviteExtension(world: WorldState): string | undefined {
  return isNpcStructuralAffinityUnlocked(world, "ari")
    ? 'Ari looks around the circle. "Bring someone next time. You make the circle wider without making it louder."'
    : undefined;
}

export function buildStructuralUnlockMessages(world: WorldState, at: number): OpportunityMessage[] {
  if (world.life.actProgress.currentAct < 2) return [];
  const candidates: OpportunityMessage[] = [
    ...(hasSurfRunRegularBenefit(world)
      ? [{
          id: "story:act2:unlock:surf-run-regular",
          at,
          from: "Berawa Surf & Run Crew",
          body: "Ari leaves a spare board by the circle. Run-day recovery and regular beach talk are open now.",
          venueId: "berawa_beach",
          read: false
        }]
      : []),
    ...(hasKitchenCircleRegularBenefit(world)
      ? [{
          id: "story:act2:unlock:kitchen-regular",
          at,
          from: "Warung Kitchen Circle",
          body: `Ibu marks your Nasi Bungkus at Rp ${IBU_BULK_NASI_PRICE}. The side door stays open after hours on Kitchen nights.`,
          venueId: "canggu_station",
          read: false
        }]
      : []),
    ...(isNpcStructuralAffinityUnlocked(world, "ibu_sari")
      ? [{
          id: "story:act2:unlock:ibu-friendly",
          at,
          from: "Ibu Sari",
          body: "Ibu holds a stool for you now. You eat first.",
          venueId: "canggu_station",
          read: false
        }]
      : []),
    ...(isKadekFocusPastryUnlocked(world)
      ? [{
          id: "story:act2:unlock:kadek-friendly",
          at,
          from: "BAKED. · Kadek",
          body: `One Focus Buffer pastry per day is on your tray for Rp ${KADEK_FOCUS_PASTRY_PRICE}. Same three-hour hold.`,
          venueId: "baked_berawa",
          read: false
        }]
      : []),
    ...(isNpcStructuralAffinityUnlocked(world, "ari")
      ? [{
          id: "story:act2:unlock:ari-friendly",
          at,
          from: "Ari",
          body: "Bring someone who needs ten minutes. You know how to make room in the circle now.",
          venueId: "berawa_beach",
          read: false
        }]
      : [])
  ];
  const existing = new Set(world.opportunities.messages.map((message) => message.id));
  return candidates.filter((message) => !existing.has(message.id));
}

export function getStructuralUnlockProfileLines(world: WorldState): string[] {
  const lines: string[] = [];
  if (hasSurfRunRegularBenefit(world)) {
    lines.push("Surf & Run regular: Sunday recovery +4 Energy / +4 Wellbeing; beach regular dialogue");
  }
  if (hasKitchenCircleRegularBenefit(world)) {
    lines.push(`Kitchen regular: Nasi Bungkus Rp ${IBU_BULK_NASI_PRICE}; Tue/Sat side-door access until 22:00`);
  }
  if (isNpcStructuralAffinityUnlocked(world, "ibu_sari")) {
    lines.push("Ibu friendly: warmer dialogue; you-eat-first stool priority");
  }
  if (isKadekFocusPastryUnlocked(world)) {
    lines.push(`Kadek friendly + priority: Focus Buffer pastry Rp ${KADEK_FOCUS_PASTRY_PRICE}, once daily / 3h`);
  }
  if (isNpcStructuralAffinityUnlocked(world, "ari")) {
    lines.push("Ari friendly: +1 circle invitation line; organizer plant");
  }
  return lines;
}
