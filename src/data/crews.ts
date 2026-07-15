import type { CrewDefinition, GameEvent } from "../types";

/**
 * Temporary core-loop fixture. W2-02 replaces or repurposes this definition
 * when Ari's authored crew content lands.
 */
export const ACT2_TEST_CREW_ID = "act2_test_crew";

export const crewDefinitions: CrewDefinition[] = [
  {
    id: ACT2_TEST_CREW_ID,
    name: "Berawa Crew Session (Test)",
    venueId: "berawa_beach",
    sessionSlots: [
      {
        id: "weekly_beach_check_in",
        dayOfWeek: 3,
        startHour: 17,
        endHour: 19,
        title: "Crew Session Stub"
      }
    ],
    regularBenefit: {
      id: "act2_test_crew_regular_benefit",
      label: "Regular benefit hook ready"
    }
  }
];

export function getCrewDefinition(crewId: string): CrewDefinition | undefined {
  return crewDefinitions.find((crew) => crew.id === crewId);
}

export function buildCrewSessionEvents(definitions: readonly CrewDefinition[] = crewDefinitions): GameEvent[] {
  return definitions.flatMap((crew) =>
    crew.sessionSlots.map((slot) => ({
      id: `crew-session:${crew.id}:${slot.id}`,
      title: slot.title,
      type: "crew_meetup" as const,
      host: { type: "venue" as const, id: crew.venueId },
      locationVenueId: crew.venueId,
      schedule: {
        recurringDays: [slot.dayOfWeek],
        startHour: slot.startHour,
        endHour: slot.endHour
      },
      description: "A minimal participation beat proving the weekly crew rhythm. No authored crew story ships in this packet.",
      participation: {
        timeCost: 20,
        cost: 0,
        meterDeltas: {}
      },
      crewSession: {
        crewId: crew.id,
        sessionSlotId: slot.id
      }
    }))
  );
}
