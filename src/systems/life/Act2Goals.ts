import { gameEventDefinitions } from "../../data/events";
import { opportunityTemplates } from "../../data/opportunities";
import { getSocialGroup } from "../groups/GroupRegistry";
import { getEligibleOpportunityTemplates } from "../opportunities/OpportunityEngine";
import { getRelationshipArcStates } from "../relationships/RelationshipArcs";
import type { WorldState } from "../../types";

export interface Act2GoalState {
  id: "join_first_crew" | "attend_club_rhythm" | "deepen_a_bond" | "open_better_door";
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

export interface Act2PayoffOpportunityState {
  templateId: string;
  title: string;
  venueId: string;
  status: "eligible" | "live" | "accepted" | "completed";
}

const ACT2_PAYOFF_TEMPLATE_IDS = [
  "focus_table_client_referral",
  "run_crew_breakfast_shift",
  "brunch_builders_paid_intro",
  "surf_circle_board_repair"
] as const;

export function getAct2GoalStates(world: WorldState): Act2GoalState[] {
  if (world.life.actProgress.currentAct < 2) {
    return [];
  }

  const completedBeatCount = getCompletedRelationshipBeatCount(world);
  const attendedClubEvent = getAttendedJoinedClubEventId(world);
  const payoff = getAct2PayoffOpportunityState(world);
  const payoffComplete = payoff?.status === "completed";
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
    },
    {
      id: "open_better_door",
      title: "Open a better door",
      description: "Let the crew turn trust into one better opportunity, perk, or paid lead.",
      progress: payoff ? `${payoff.title} ${payoffComplete ? "completed" : payoff.status}` : "No crew payoff ready yet",
      complete: payoffComplete
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
        ? "Follow the event marker to the venue during its event window and join the rhythm there."
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

  const payoff = getAct2PayoffOpportunityState(world);
  if (payoff?.status !== "completed") {
    if (payoff) {
      return {
        title:
          payoff.status === "live" || payoff.status === "accepted"
            ? `Follow ${payoff.title}`
            : `Find ${payoff.title}`,
        detail:
          payoff.status === "live" || payoff.status === "accepted"
            ? `Your crew opened this at ${formatVenueName(payoff.venueId)}. It is visible in the world; use the phone only for details.`
            : `Move through ${formatVenueName(payoff.venueId)} during the right window and look for the visible opportunity scene.`,
        urgency: "normal"
      };
    }
    return {
      title: "Create a useful door",
      detail: "Keep showing up for your crew until one club-gated opportunity or paid lead opens in the world.",
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

export function getAct2PayoffOpportunityState(world: WorldState): Act2PayoffOpportunityState | null {
  const payoffTemplates = opportunityTemplates.filter((template) => isAct2PayoffTemplateId(template.id));
  const completed = payoffTemplates.find((template) => world.opportunities.completedTemplateIds.includes(template.id));
  if (completed) {
    return toPayoffState(completed, "completed");
  }

  const live = world.opportunities.live.find(
    (opportunity) =>
      isAct2PayoffTemplateId(opportunity.templateId) &&
      (opportunity.status === "live" || opportunity.status === "accepted")
  );
  const liveTemplate = live ? payoffTemplates.find((template) => template.id === live.templateId) : undefined;
  if (live && liveTemplate) {
    return toPayoffState(liveTemplate, live.status === "accepted" ? "accepted" : "live");
  }

  const eligible = getEligibleOpportunityTemplates(world, world.opportunities, payoffTemplates)[0];
  return eligible ? toPayoffState(eligible, "eligible") : null;
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

function isAct2PayoffTemplateId(templateId: string): templateId is (typeof ACT2_PAYOFF_TEMPLATE_IDS)[number] {
  return ACT2_PAYOFF_TEMPLATE_IDS.includes(templateId as (typeof ACT2_PAYOFF_TEMPLATE_IDS)[number]);
}

function toPayoffState(
  template: (typeof opportunityTemplates)[number],
  status: Act2PayoffOpportunityState["status"]
): Act2PayoffOpportunityState {
  return {
    templateId: template.id,
    title: template.title,
    venueId: template.locationVenueId,
    status
  };
}

function formatVenueName(venueId: string): string {
  return venueId.replace(/_/g, " ");
}
