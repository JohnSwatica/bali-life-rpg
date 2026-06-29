import { getSocialGroup } from "../groups/GroupRegistry";
import type { WorldState } from "../../types";

export interface Act2GoalState {
  id: "join_first_crew" | "attend_club_rhythm" | "deepen_a_bond";
  title: string;
  description: string;
  complete: boolean;
}

export function getAct2GoalStates(world: WorldState): Act2GoalState[] {
  if (world.life.actProgress.currentAct < 2) {
    return [];
  }

  return [
    {
      id: "join_first_crew",
      title: "Find your first circle",
      description: "Follow Ari's ping to Berawa Beach or find a focus table, then join a local crew.",
      complete: world.life.joinedClubIds.length > 0
    },
    {
      id: "attend_club_rhythm",
      title: "Show up again",
      description: "Attend a recurring event from a club you joined.",
      complete: hasAttendedJoinedClubEvent(world)
    },
    {
      id: "deepen_a_bond",
      title: "Turn a face into a friend",
      description: "Complete one relationship beat with a club member or familiar NPC.",
      complete: Object.values(world.life.relationshipArcProgress).some((progress) => progress.completedBeatIds.length > 0)
    }
  ];
}

function hasAttendedJoinedClubEvent(world: WorldState): boolean {
  const joinedRecurringEventIds = new Set(
    world.life.joinedClubIds.flatMap((groupId) => getSocialGroup(groupId)?.recurringEventIds ?? [])
  );
  return world.runtimeEvents.attendedEventIds.some((eventId) => joinedRecurringEventIds.has(eventId));
}
