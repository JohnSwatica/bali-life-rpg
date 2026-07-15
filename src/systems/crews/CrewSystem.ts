import { crewDefinitions, getCrewDefinition } from "../../data/crews";
import type { CrewDefinition, CrewState, GameEvent, OpportunityMessage, WorldState } from "../../types";

export const CREW_REGULAR_ATTENDANCE_COUNT = 3;

const flagKey = (crewId: string, field: "invited" | "attendance" | "regular" | "benefit" | "lastOccurrence") =>
  `crew:${crewId}:${field}`;

export interface CrewMutationResult {
  ok: boolean;
  message: string;
  state?: CrewState;
}

export interface CrewAttendanceResult extends CrewMutationResult {
  becameRegular: boolean;
  regularBenefitActivated: boolean;
}

export function getCrewState(world: WorldState, crewId: string): CrewState {
  const attendance = world.questFlags[flagKey(crewId, "attendance")];
  return {
    crewId,
    invited: world.questFlags[flagKey(crewId, "invited")] === true,
    member: world.life.joinedClubIds.includes(crewId),
    attendanceCount:
      typeof attendance === "number" && Number.isFinite(attendance) ? Math.max(0, Math.floor(attendance)) : 0,
    regular: world.questFlags[flagKey(crewId, "regular")] === true,
    regularBenefitActive: world.questFlags[flagKey(crewId, "benefit")] === true
  };
}

export function getKnownCrewStates(world: WorldState): CrewState[] {
  return crewDefinitions
    .map((crew) => getCrewState(world, crew.id))
    .filter((state) => state.invited || state.member);
}

export function inviteToCrew(world: WorldState, crewId: string): CrewMutationResult {
  const crew = getCrewDefinition(crewId);
  if (!crew) return { ok: false, message: `Unknown crew: ${crewId}.` };
  if (world.life.actProgress.currentAct < 2) {
    return { ok: false, message: `${crew.name} invitations open in Act 2.` };
  }
  world.questFlags[flagKey(crewId, "invited")] = true;
  return { ok: true, message: `Invited to ${crew.name}.`, state: getCrewState(world, crewId) };
}

export function joinCrew(world: WorldState, crewId: string): CrewMutationResult {
  const crew = getCrewDefinition(crewId);
  if (!crew) return { ok: false, message: `Unknown crew: ${crewId}.` };
  const state = getCrewState(world, crewId);
  if (!state.invited) return { ok: false, message: `${crew.name} has not invited you yet.` };
  if (!state.member) world.life.joinedClubIds.push(crewId);
  return { ok: true, message: `Joined ${crew.name}.`, state: getCrewState(world, crewId) };
}

export function completeCrewSession(
  world: WorldState,
  event: GameEvent,
  occurrenceDay: number,
  now: number
): CrewAttendanceResult {
  const session = event.crewSession;
  if (!session) return attendanceFailure("That event is not a crew session.");
  const crew = getCrewDefinition(session.crewId);
  if (!crew) return attendanceFailure(`Unknown crew: ${session.crewId}.`);
  const before = getCrewState(world, crew.id);
  if (!before.member) return attendanceFailure(`Join ${crew.name} before attending its sessions.`, before);

  const occurrenceKey = `${event.id}:day-${Math.max(1, Math.floor(occurrenceDay))}`;
  if (world.questFlags[flagKey(crew.id, "lastOccurrence")] === occurrenceKey) {
    return attendanceFailure(`${crew.name} already counted this session.`, before);
  }

  const attendanceCount = before.attendanceCount + 1;
  world.questFlags[flagKey(crew.id, "attendance")] = attendanceCount;
  world.questFlags[flagKey(crew.id, "lastOccurrence")] = occurrenceKey;

  const becameRegular = attendanceCount === CREW_REGULAR_ATTENDANCE_COUNT && !before.regular;
  if (becameRegular) {
    world.questFlags[flagKey(crew.id, "regular")] = true;
    activateRegularBenefitHook(world, crew, now);
  }

  const state = getCrewState(world, crew.id);
  return {
    ok: true,
    message: becameRegular
      ? `${crew.name}: regular status reached (${attendanceCount}).`
      : `${crew.name}: attendance ${attendanceCount}/${CREW_REGULAR_ATTENDANCE_COUNT}.`,
    state,
    becameRegular,
    regularBenefitActivated: becameRegular && state.regularBenefitActive
  };
}

export function isCrewSessionVisible(world: WorldState, event: GameEvent): boolean {
  if (!event.crewSession || world.life.actProgress.currentAct < 2) return false;
  const state = getCrewState(world, event.crewSession.crewId);
  return state.invited || state.member;
}

export function isCrewSessionPingEligible(world: WorldState, event: GameEvent): boolean {
  return Boolean(event.crewSession && getCrewState(world, event.crewSession.crewId).member);
}

export function buildCrewSessionOpenMessage(
  world: WorldState,
  event: GameEvent,
  at: number,
  occurrenceDay: number,
  venueName: string
): OpportunityMessage | undefined {
  if (!event.crewSession || !isCrewSessionPingEligible(world, event)) return undefined;
  const crew = getCrewDefinition(event.crewSession.crewId);
  if (!crew) return undefined;
  return {
    id: `crew-session-open:${event.id}:day-${Math.max(1, Math.floor(occurrenceDay))}`,
    at,
    from: "Calendar",
    body: `${crew.name} is open now at ${venueName}. Go on-site and take part if you feel like it.`,
    venueId: event.locationVenueId,
    read: false
  };
}

function activateRegularBenefitHook(world: WorldState, crew: CrewDefinition, now: number): void {
  world.questFlags[flagKey(crew.id, "benefit")] = true;
  world.questFlags[`crew-benefit:${crew.regularBenefit.id}:activatedAt`] = Math.max(1, Math.floor(now));
}

function attendanceFailure(message: string, state?: CrewState): CrewAttendanceResult {
  return {
    ok: false,
    message,
    state,
    becameRegular: false,
    regularBenefitActivated: false
  };
}
