import type { OpportunityMessage, WorldState } from "../../types";
import { appendOpportunityMessage } from "../opportunities/OpportunityEngine";
import {
  RIO_RACE_COMPLETED_FLAG,
  RIO_RACE_LOST_FLAG,
  RIO_RACE_WON_FLAG
} from "../ride/RivalRace";

export type Act1LeoCadenceMilestone = "priority" | "breakdown" | "finale";

export const ACT1_PRIORITY_LEO_MESSAGE_ID = "story:act1:leo-kadek-priority";
export const ACT1_BREAKDOWN_LEO_MESSAGE_ID = "story:act1:leo-breakdown";
export const ACT1_FINALE_LEO_MESSAGE_ID = "story:act1:leo-finale-respect";

const PENDING_FLAGS: Readonly<Record<Act1LeoCadenceMilestone, string>> = {
  priority: "act1_leo_cadence_pending_priority",
  breakdown: "act1_leo_cadence_pending_breakdown",
  finale: "act1_leo_cadence_pending_finale"
};

const MESSAGE_IDS: Readonly<Record<Act1LeoCadenceMilestone, string>> = {
  priority: ACT1_PRIORITY_LEO_MESSAGE_ID,
  breakdown: ACT1_BREAKDOWN_LEO_MESSAGE_ID,
  finale: ACT1_FINALE_LEO_MESSAGE_ID
};

const ORDER: readonly Act1LeoCadenceMilestone[] = ["priority", "breakdown", "finale"];

/** Records a reached beat, then posts it only when Leo has no other unread text. */
export function queueAct1LeoCadenceMilestone(
  world: WorldState,
  milestone: Act1LeoCadenceMilestone,
  now: number
): boolean {
  const messageId = MESSAGE_IDS[milestone];
  if (world.opportunities.messages.some((message) => message.id === messageId)) return false;
  world.questFlags[PENDING_FLAGS[milestone]] = Math.max(1, now);
  return flushAct1LeoCadence(world, now);
}

/** Posts at most one pending text, in story order, after the prior Leo text is read. */
export function flushAct1LeoCadence(world: WorldState, now: number): boolean {
  if (world.opportunities.messages.some((message) => !message.read && isLeoMessage(message))) {
    return false;
  }

  for (const milestone of ORDER) {
    const pendingFlag = PENDING_FLAGS[milestone];
    if (!world.questFlags[pendingFlag]) continue;
    const messageId = MESSAGE_IDS[milestone];
    delete world.questFlags[pendingFlag];
    if (world.opportunities.messages.some((message) => message.id === messageId)) continue;
    return appendOpportunityMessage(world.opportunities, buildLeoCadenceMessage(world, milestone, now));
  }
  return false;
}

export function getUnreadLeoMessageCount(world: WorldState): number {
  return world.opportunities.messages.filter((message) => !message.read && isLeoMessage(message)).length;
}

function isLeoMessage(message: OpportunityMessage): boolean {
  return message.from.toLowerCase().startsWith("leo");
}

function buildLeoCadenceMessage(
  world: WorldState,
  milestone: Act1LeoCadenceMilestone,
  now: number
): OpportunityMessage {
  if (milestone === "priority") {
    return {
      id: ACT1_PRIORITY_LEO_MESSAGE_ID,
      at: now,
      from: "Leo · #1 NusaDrop",
      body: "Kadek's artisan detour put you on a priority list. Cute. The app still ranks straight lines.",
      read: false
    };
  }
  if (milestone === "breakdown") {
    return {
      id: ACT1_BREAKDOWN_LEO_MESSAGE_ID,
      at: now,
      from: "Leo · #1 NusaDrop",
      body: "3.2? Your transmission optimized you out of premium. Push it in, rookie — a completed disaster still beats a DNF.",
      read: false
    };
  }
  return {
    id: ACT1_FINALE_LEO_MESSAGE_ID,
    at: now,
    from: "Leo · #1 NusaDrop",
    body: getFinaleLeoBody(world),
    read: false
  };
}

function getFinaleLeoBody(world: WorldState): string {
  if (!world.collectedPickups[RIO_RACE_COMPLETED_FLAG]) {
    return "A room and a weekly scooter after a 3.2 day. Annoyingly durable. The streak lap is still waiting; try not to arrive respectable.";
  }
  if (world.collectedPickups[RIO_RACE_WON_FLAG]) {
    return "A room, a weekly scooter, and one stolen streak. Annoyingly durable. Bring the new ride — I want the rematch.";
  }
  if (world.collectedPickups[RIO_RACE_LOST_FLAG]) {
    return "A room and a weekly scooter do not erase my win. Durable is not fast. Come defend the comeback in a rematch.";
  }
  return "A room and a weekly scooter. Annoyingly durable. The timing board still has both our names on it.";
}
