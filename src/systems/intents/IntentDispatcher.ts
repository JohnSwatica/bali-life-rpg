import { getEvent } from "../events/EventScheduler";
import { joinSocialGroup } from "../groups/GroupRegistry";
import { switchPortalMode } from "../portal/PortalState";
import { adjustReputation, awardReputationTag } from "../reputation/ReputationState";
import { recordRelationshipMemory } from "../relationships/RelationshipMemory";
import type { GameIntent, ReputationTag, WorldState } from "../../types";

export interface IntentResult {
  ok: boolean;
  message: string;
}

type IntentHandler<T extends GameIntent> = (intent: T, world: WorldState, at: number) => IntentResult;
type AnyIntentHandler = (intent: GameIntent, world: WorldState, at: number) => IntentResult;

export class IntentDispatcher {
  private handlers: Partial<Record<GameIntent["kind"], AnyIntentHandler>> = {};

  constructor() {
    this.register("SwitchPortal", (intent, world) => ({
      ok: intent.mode === "single" || world.portal.multiplayerStatus !== "locked",
      message: switchPortalMode(world.portal, intent.mode)
    }));

    this.register("RecordMemory", (intent, world, at) => {
      recordRelationshipMemory(world, intent.subjectType, intent.subjectId, intent.memory, intent.detail, at);
      return { ok: true, message: "Memory recorded." };
    });

    this.register("AwardReputationTag", (intent, world, at) => {
      awardReputationTag(world.reputation, intent.tag, intent.reason, at);
      return { ok: true, message: `Reputation tag awarded: ${intent.tag}.` };
    });

    this.register("AdjustReputation", (intent, world, at) => {
      adjustReputation(world.reputation, intent.delta, intent.reason, at);
      return { ok: true, message: `Reputation ${intent.delta >= 0 ? "+" : ""}${intent.delta}.` };
    });

    this.register("VisitVenue", (intent, world, at) => {
      recordRelationshipMemory(world, "venue", intent.venueId, "visited", "Phone/venue visit recorded.", at);
      return { ok: true, message: "Venue visit recorded." };
    });

    this.register("AttendEvent", (intent, world, at) => {
      const event = getEvent(intent.eventId);
      if (!event) {
        return { ok: false, message: "Event not found." };
      }
      if (!world.runtimeEvents.attendedEventIds.includes(event.id)) {
        world.runtimeEvents.attendedEventIds.push(event.id);
      }
      recordRelationshipMemory(world, "venue", event.locationVenueId, "attended_event", event.title, at);
      if (event.participation.reputationTag) {
        awardReputationTag(world.reputation, event.participation.reputationTag as ReputationTag, `Attended ${event.title}`, at);
      }
      if (event.participation.reputationDelta) {
        adjustReputation(world.reputation, event.participation.reputationDelta, `Attended ${event.title}`, at);
      }
      return { ok: true, message: `Attended ${event.title}.` };
    });

    this.register("JoinClub", (intent, world, at) => joinSocialGroup(world, intent.groupId, at));
  }

  dispatch(intent: GameIntent, world: WorldState, at: number): IntentResult {
    const handler = this.handlers[intent.kind] as IntentHandler<GameIntent> | undefined;
    if (!handler) {
      return { ok: false, message: `No handler for ${intent.kind}.` };
    }
    return handler(intent, world, at);
  }

  private register<K extends GameIntent["kind"]>(
    kind: K,
    handler: IntentHandler<Extract<GameIntent, { kind: K }>>
  ): void {
    this.handlers[kind] = handler as AnyIntentHandler;
  }
}
