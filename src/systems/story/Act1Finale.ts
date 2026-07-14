import type { OpportunityMessage, WorldState } from "../../types";
import { addItem, getQuantity } from "../Inventory";
import { getAct1MoveOutReadiness } from "../hustle/HustleMilestones";
import { appendOpportunityMessage } from "../opportunities/OpportunityEngine";
import {
  MADE_RECOMMENDATION_LETTER_FLAG,
  MADE_ROOM_KEY_FLAG,
  MADE_ROOM_OFFER_SCENE_FLAG
} from "./Act1MadeRoomOffer";

export const ACT1_MADE_KEY_FLAG = MADE_ROOM_KEY_FLAG;
export const ACT1_MOVE_OUT_MONTAGE_STARTED_FLAG = "act1_move_out_montage_started";
export const ACT1_MOVE_OUT_COMPLETE_FLAG = "act1_move_out_complete";
export const ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG = "act1_weekly_scooter_contract_signed";
export const ACT2_INTRO_CARD_FLAG = "act2_intro_card_seen";
export const ACT1_FINALE_LEO_MESSAGE_ID = "story:act1:leo-finale-respect";

const SCOOTER_KEY_ITEM_ID = "scooter_key";

export interface Act1FinaleMutationResult {
  ok: boolean;
  dialogue?: string;
}

export function canStartIbuGuaranteeScene(world: WorldState): boolean {
  const readiness = getAct1MoveOutReadiness(world);
  return (
    world.life.actProgress.currentAct === 1 &&
    Boolean(world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG]) &&
    readiness.deliveriesComplete &&
    readiness.earningsComplete &&
    readiness.firstRentCovered &&
    !isIbuGuaranteeComplete(world)
  );
}

export function isIbuGuaranteeComplete(world: WorldState): boolean {
  return Boolean(world.collectedPickups[MADE_RECOMMENDATION_LETTER_FLAG]);
}

export function completeIbuGuaranteeScene(world: WorldState, now: number): Act1FinaleMutationResult {
  if (!canStartIbuGuaranteeScene(world)) return { ok: false };
  world.collectedPickups[MADE_RECOMMENDATION_LETTER_FLAG] = Math.max(1, now);
  world.life.hustle.moveOutReady = getAct1MoveOutReadiness(world).complete;
  return {
    ok: true,
    dialogue:
      'Ibu Sari folds the rent receipt under one palm. "The app counted your worst day. I counted the catering box, the storm, the deposit."\n\n' +
      'She writes slowly, signs once, and slides the paper across. "Made asked for a local business owner. He did not ask for a machine."\n\n' +
      "RECOMMENDATION LETTER ✓"
  };
}

export function canMadeAcceptFinale(world: WorldState): boolean {
  return (
    world.life.actProgress.currentAct === 1 &&
    isIbuGuaranteeComplete(world) &&
    getAct1MoveOutReadiness(world).complete &&
    !world.collectedPickups[ACT1_MADE_KEY_FLAG]
  );
}

export function acceptMadeFinale(world: WorldState, now: number): Act1FinaleMutationResult {
  if (!canMadeAcceptFinale(world)) return { ok: false };
  world.collectedPickups[ACT1_MADE_KEY_FLAG] = Math.max(1, now);
  return {
    ok: true,
    dialogue:
      'Made reads the signature twice, then takes the small brass key from his ledger. "Ibu Sari\'s paper is worth more than the app\'s stars. Do not make either of them wrong."\n\n' +
      'He sets the key in your hand. "Pack the kos. The shared room is ready."'
  };
}

export function markMoveOutMontageStarted(world: WorldState, now: number): boolean {
  if (!world.collectedPickups[ACT1_MADE_KEY_FLAG] || isAct1MoveOutComplete(world)) return false;
  world.collectedPickups[ACT1_MOVE_OUT_MONTAGE_STARTED_FLAG] = Math.max(1, now);
  return true;
}

export function completeAct1MoveOut(world: WorldState, now: number): boolean {
  if (!world.collectedPickups[ACT1_MADE_KEY_FLAG] || isAct1MoveOutComplete(world)) return false;
  world.collectedPickups[ACT1_MOVE_OUT_MONTAGE_STARTED_FLAG] ||= Math.max(1, now);
  world.collectedPickups[ACT1_MOVE_OUT_COMPLETE_FLAG] = Math.max(1, now);
  world.life.hustle.moveOutReady = true;
  return true;
}

export function isAct1MoveOutComplete(world: WorldState): boolean {
  return Boolean(world.collectedPickups[ACT1_MOVE_OUT_COMPLETE_FLAG]);
}

export function canSignWeeklyScooterContract(world: WorldState): boolean {
  return isAct1MoveOutComplete(world) && !world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG];
}

export function signWeeklyScooterContract(world: WorldState, now: number): Act1FinaleMutationResult {
  if (!canSignWeeklyScooterContract(world)) return { ok: false };
  const player = world.players[world.localPlayerId];
  world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG] = Math.max(1, now);
  world.life.hustle.scooterTier = "daily_rental";
  player.hasBike = true;
  player.onBike = false;
  player.bikeStuck = false;
  player.bikeCondition = 100;
  if (getQuantity(player, SCOOTER_KEY_ITEM_ID) === 0) addItem(player, SCOOTER_KEY_ITEM_ID, 1);
  appendOpportunityMessage(world.opportunities, buildFinaleLeoMessage(now + 1));
  return {
    ok: true,
    dialogue:
      'The rental clerk stamps WEEKLY across the contract. "The borrowed rattletrap stays here. This one gets maintained before it complains."\n\n' +
      "Weekly rental signed · ride restored · rating unchanged."
  };
}

export function startAct2AfterFinale(world: WorldState, now: number): boolean {
  if (
    !world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG] ||
    world.collectedPickups[ACT2_INTRO_CARD_FLAG]
  ) {
    return false;
  }
  world.collectedPickups[ACT2_INTRO_CARD_FLAG] = Math.max(1, now);
  world.life.actProgress.currentAct = 2;
  return true;
}

export function getAct1FinaleAmbientLine(world: WorldState, npcId: string): string | undefined {
  if (!isAct1MoveOutComplete(world)) return undefined;
  if (npcId === "ibu_sari") return '"A better room is not the finish. It is somewhere decent to begin again."';
  if (npcId === "made") return '"The key works. The fan works. Keep both that way."';
  if (npcId === "kadek") return '"Shared room, weekly scooter. Good. Stability is an ingredient too."';
  return undefined;
}

function buildFinaleLeoMessage(now: number): OpportunityMessage {
  return {
    id: ACT1_FINALE_LEO_MESSAGE_ID,
    at: now,
    from: "Leo · NusaDrop",
    body: "A room and a weekly scooter after a 3.2 day. Annoyingly durable. We are not done racing.",
    read: false
  };
}
