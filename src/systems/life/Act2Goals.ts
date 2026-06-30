import { gameEventDefinitions } from "../../data/events";
import { getSocialGroup } from "../groups/GroupRegistry";
import { getRelationshipArcStates } from "../relationships/RelationshipArcs";
import type { WorldState } from "../../types";

export interface Act2GoalState {
  id: "join_first_crew" | "attend_club_rhythm" | "deepen_a_bond";
  title: string;
  description: string;
  progress: string;
  complete: boolean;
}

export interface Act2NextStepState {
  title: string;
  detail: string;
  urgency: "normal" | "complete";
}

export function getAct2GoalStates(world: WorldState): Act2GoalState[] {
  if (world.life.actProgress.currentAct < 2) {
    return [];
  }

  const completedBeatCount = getCompletedRelationshipBeatCount(world);
  const attendedClubEvent = getAttendedJoinedClubEventId(world);
  return [
    {
      id: "join_first_crew",
      title: "Find your first circle",
      description: "Follow Ari's ping to Berawa Beach or find a focus table, then join a local crew.",
      progress: `${Math.min(1, world.life.joinedClubIds.length)}/1 crew joined`,
      complete: world.life.joinedClubIds.length > 0
    },
    {
      id: "attend_club_rhythm",
      title: "Show up again",
      description: "Attend a recurring event from a club you joined.",
      progress: attendedClubEvent ? `${eventTitle(attendedClubEvent)} attended` : "0/1 joined-club events attended",
      complete: attendedClubEvent !== null
    },
    {
      id: "deepen_a_bond",
      title: "Turn a face into a friend",
      description: "Complete one relationship beat with a club member or familiar NPC.",
      progress: `${Math.min(1, completedBeatCount)}/1 relationship beat`,
      complete: completedBeatCount > 0
    }
  ];
}

export function getAct2NextStep(world: WorldState): Act2NextStepState | null {
  if (world.life.actProgress.currentAct < 2) {
    return null;
  }

  if (world.life.joinedClubIds.length === 0) {
    return {
      title: "Join a first crew",
      detail: "Follow the beach or focus-table marker and join one group so the calendar starts creating rhythm.",
      urgency: "normal"
    };
  }

  if (!getAttendedJoinedClubEventId(world)) {
    const nextEventId = world.life.joinedClubIds.flatMap((groupId) => getSocialGroup(groupId)?.recurringEventIds ?? [])[0];
    return {
      title: nextEventId ? `Attend ${eventTitle(nextEventId)}` : "Attend a club rhythm",
      detail: nextEventId
        ? "Use Phone > Calendar and show up at the venue during its event window."
        : "Join a group with a recurring event, then show up once.",
      urgency: "normal"
    };
  }

  if (getCompletedRelationshipBeatCount(world) === 0) {
    const availableBeat = getRelationshipArcStates(world).find((state) => state.available);
    const blockedBeat = getRelationshipArcStates(world).find((state) => !state.complete);
    return {
      title: availableBeat ? `Talk to ${availableBeat.arc.npcId}` : "Deepen one bond",
      detail: availableBeat
        ? `${availableBeat.beat.title} is ready. Find them and complete the next relationship beat.`
        : blockedBeat
          ? `${blockedBeat.beat.title} needs ${blockedBeat.blockedReason}.`
          : "Build affinity through events, activities, and useful help until a relationship beat opens.",
      urgency: "normal"
    };
  }

  return {
    title: "Act 2 foundation complete",
    detail: "You have a crew, a rhythm, and a real bond. Better social opportunities can now point toward Act 3 hooks.",
    urgency: "complete"
  };
}

export function areAct2GoalsComplete(world: WorldState): boolean {
  const goals = getAct2GoalStates(world);
  return goals.length > 0 && goals.every((goal) => goal.complete);
}

function getAttendedJoinedClubEventId(world: WorldState): string | null {
  const joinedRecurringEventIds = new Set(
    world.life.joinedClubIds.flatMap((groupId) => getSocialGroup(groupId)?.recurringEventIds ?? [])
  );
  return world.runtimeEvents.attendedEventIds.find((eventId) => joinedRecurringEventIds.has(eventId)) ?? null;
}

function getCompletedRelationshipBeatCount(world: WorldState): number {
  return Object.values(world.life.relationshipArcProgress).reduce((total, progress) => total + progress.completedBeatIds.length, 0);
}

function eventTitle(eventId: string): string {
  return gameEventDefinitions.find((event) => event.id === eventId)?.title ?? eventId;
}
