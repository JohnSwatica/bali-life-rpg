import { ARI_SURF_RUN_CREW_ID, getCrewSessionSlot } from "../../data/crews";
import type { DeliveryDefinition } from "../../data/deliveries";
import type { GameEvent, WorldState } from "../../types";
import { getCrewState, inviteToCrew } from "../crews/CrewSystem";
import { getAriCircleInviteExtension } from "./Act2StructuralUnlocks";

export const ARI_CREW_INVITATION_LINE = "Stay ten minutes. The ocean doesn't take tips.";
export const ARI_SECRET_PLANT_LINE = "Client calls, man. So many client calls.";

const ARI_PLANT_SEEN_FLAG = `crew:${ARI_SURF_RUN_CREW_ID}:ariPlantSeen`;

const SUNSET_MEMBER_LINES = [
  { speakerName: "Nia", line: "Ten minutes is enough. Tell us one thing the week gave you and one thing it took." },
  { speakerName: "Bimo", line: "Nobody has to perform here. Even Ari eventually stops filling the silence." },
  { speakerName: "Santi", line: "Pick a board, a patch of sand, or the fire. Staying is the whole assignment." }
] as const;

const RUN_MEMBER_LINES = [
  { speakerName: "Bimo", line: "Easy pace to the flags and back. If you can talk, you are running it right." },
  { speakerName: "Santi", line: "Beach edge, then hard sand. We turn together; nobody gets collected later." },
  { speakerName: "Nia", line: "No finish line. We stop when the coconuts start looking like breakfast." }
] as const;

export interface AriCrewInvitationSceneResult {
  fired: boolean;
  dialogue?: string;
}

export interface AriCrewSessionBeat {
  speakerName: string;
  dialogue: string;
  includesAriPlant: boolean;
  kind: "sunset_circle" | "morning_run";
}

export function triggerAriCrewInvitation(
  world: WorldState,
  delivery: DeliveryDefinition
): AriCrewInvitationSceneResult {
  if (
    world.life.actProgress.currentAct < 2 ||
    !delivery.beachAdjacentDropoff ||
    getCrewState(world, ARI_SURF_RUN_CREW_ID).invited
  ) {
    return { fired: false };
  }

  const invitation = inviteToCrew(world, ARI_SURF_RUN_CREW_ID);
  if (!invitation.ok) return { fired: false };
  return {
    fired: true,
    dialogue: `Ari is waiting at the dropoff with two boards under one arm.\n\n“${ARI_CREW_INVITATION_LINE}”\n\nHe nods toward the beach circle. The invitation lands on your Calendar. It does not expire.`
  };
}

export function prepareAriCrewSessionBeat(world: WorldState, event: GameEvent): AriCrewSessionBeat | undefined {
  if (event.crewSession?.crewId !== ARI_SURF_RUN_CREW_ID) return undefined;
  const slot = getCrewSessionSlot(event.crewSession.crewId, event.crewSession.sessionSlotId);
  const kind = slot?.kind;
  if (kind !== "sunset_circle" && kind !== "morning_run") return undefined;

  const attendanceCount = getCrewState(world, ARI_SURF_RUN_CREW_ID).attendanceCount;
  const pool = kind === "morning_run" ? RUN_MEMBER_LINES : SUNSET_MEMBER_LINES;
  const memberBeat = pool[attendanceCount % pool.length];
  const includesAriPlant = kind === "sunset_circle" && world.questFlags[ARI_PLANT_SEEN_FLAG] !== true;
  if (includesAriPlant) world.questFlags[ARI_PLANT_SEEN_FLAG] = true;

  const plant = includesAriPlant
    ? `\n\nAri glances at the closed laptop beside the boards. “${ARI_SECRET_PLANT_LINE}” Then he asks about your week instead.`
    : "";
  const organizerExtension = kind === "sunset_circle" ? getAriCircleInviteExtension(world) : undefined;
  return {
    speakerName: memberBeat.speakerName,
    dialogue: `“${memberBeat.line}”${plant}${organizerExtension ? `\n\n${organizerExtension}` : ""}\n\nYou stay for the participation beat.`,
    includesAriPlant,
    kind
  };
}

export function hasSeenAriSecretPlant(world: WorldState): boolean {
  return world.questFlags[ARI_PLANT_SEEN_FLAG] === true;
}
