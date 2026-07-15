import type { CrewDefinition, GameEvent } from "../types";

export const ARI_SURF_RUN_CREW_ID = "berawa_surf_run_crew";
export const KITCHEN_CIRCLE_CREW_ID = "warung_kitchen_circle";

export const crewDefinitions: CrewDefinition[] = [
  {
    id: ARI_SURF_RUN_CREW_ID,
    name: "Berawa Surf & Run Crew",
    venueId: "berawa_beach",
    memberNpcIds: ["ari"],
    sessionSlots: [
      {
        id: "wednesday_sunset_circle",
        dayOfWeek: 3,
        startHour: 17,
        endHour: 19,
        title: "Sunset Beach Circle",
        kind: "sunset_circle",
        description: "Boards in the sand, a small fire, and one honest ten-minute check-in before dark.",
        timeCost: 20
      },
      {
        id: "friday_sunset_circle",
        dayOfWeek: 5,
        startHour: 17,
        endHour: 19,
        title: "Sunset Beach Circle",
        kind: "sunset_circle",
        description: "Boards in the sand, a small fire, and one honest ten-minute check-in before dark.",
        timeCost: 20
      },
      {
        id: "sunday_morning_run",
        dayOfWeek: 0,
        startHour: 6.5,
        endHour: 8.5,
        title: "Sunday Beach-Edge Run",
        kind: "morning_run",
        description: "An easy out-and-back along the beach edge. No clock, no race, no penalty for missing it.",
        timeCost: 30
      }
    ],
    regularBenefit: {
      id: "berawa_surf_run_regular_benefit",
      label: "Surf & Run regular benefit hook ready"
    }
  },
  {
    id: KITCHEN_CIRCLE_CREW_ID,
    name: "Warung Kitchen Circle",
    venueId: "canggu_station",
    memberNpcIds: ["ibu_sari", "kadek"],
    sessionSlots: [
      {
        id: "tuesday_evening_kitchen",
        dayOfWeek: 2,
        startHour: 18,
        endHour: 20,
        title: "Warung Kitchen Circle",
        kind: "kitchen_serve",
        description: "Run Ibu's real dinner SERVE round with the crew. A rough room still counts; missing it costs nothing.",
        timeCost: 25
      },
      {
        id: "saturday_evening_kitchen",
        dayOfWeek: 6,
        startHour: 18,
        endHour: 20,
        title: "Warung Kitchen Circle",
        kind: "kitchen_serve",
        description: "Run Ibu's real dinner SERVE round with the crew. A rough room still counts; missing it costs nothing.",
        timeCost: 25
      }
    ],
    regularBenefit: {
      id: "warung_kitchen_regular_benefit",
      label: "Kitchen Circle regular benefit hook ready"
    }
  }
];

export function getCrewDefinition(crewId: string): CrewDefinition | undefined {
  return crewDefinitions.find((crew) => crew.id === crewId);
}

export function getCrewSessionSlot(crewId: string, slotId: string) {
  return getCrewDefinition(crewId)?.sessionSlots.find((slot) => slot.id === slotId);
}

export function buildCrewSessionEvents(definitions: readonly CrewDefinition[] = crewDefinitions): GameEvent[] {
  return definitions.flatMap((crew) =>
    crew.sessionSlots.map((slot) => {
      const memberNpcIds = crew.memberNpcIds ?? [];
      return {
        id: `crew-session:${crew.id}:${slot.id}`,
        title: slot.title,
        type: slot.kind === "morning_run" ? ("run" as const) : ("crew_meetup" as const),
        host: { type: "venue" as const, id: crew.venueId },
        locationVenueId: crew.venueId,
        schedule: {
          recurringDays: [slot.dayOfWeek],
          startHour: slot.startHour,
          endHour: slot.endHour
        },
        description: slot.description ?? "A crew session on the weekly calendar.",
        participation: {
          timeCost: slot.timeCost ?? 20,
          cost: 0,
          meterDeltas: slot.kind === "morning_run"
            ? { energy: -8, wellbeing: 8, social: 5 }
            : slot.kind === "kitchen_serve"
              ? { energy: -5, wellbeing: 4, social: 7 }
              : { energy: -3, wellbeing: 6, social: 7 },
          affinityBumps: memberNpcIds[0] ? [{ npcId: memberNpcIds[0], amount: 1 }] : undefined,
          meetNpcs: memberNpcIds
        },
        crewSession: {
          crewId: crew.id,
          sessionSlotId: slot.id
        }
      };
    })
  );
}
