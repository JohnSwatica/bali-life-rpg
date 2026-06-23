import type { SocialGroupDefinition } from "../types";

export const socialGroupDefinitions: SocialGroupDefinition[] = [
  {
    id: "berawa_run_crew",
    name: "Berawa Run Crew",
    purpose: "run",
    owner: { type: "npc", id: "ari" },
    homeVenueId: "berawa_beach",
    memberIds: ["ari", "kadek"],
    recurringEventIds: ["berawa_run_crew_loop"],
    description: "Morning runners who turn beach laps into a soft landing for new people.",
    joinHook: "Join for regular sunrise runs and a low-pressure way to meet locals and nomads."
  },
  {
    id: "focus_table_collective",
    name: "Focus Table Collective",
    purpose: "coworking",
    owner: { type: "venue", id: "satu_satu_coffee" },
    homeVenueId: "satu_satu_coffee",
    memberIds: ["made", "kadek"],
    recurringEventIds: ["focus_collective_sprint"],
    description: "Laptop people who keep each other honest with quiet sprints and useful intros.",
    joinHook: "Join for recurring coworking sessions and a small circle of accountability."
  },
  {
    id: "berawa_surf_circle",
    name: "Berawa Surf Circle",
    purpose: "surf",
    owner: { type: "npc", id: "ari" },
    homeVenueId: "berawa_beach",
    memberIds: ["ari"],
    recurringEventIds: ["sunset_surf_check"],
    description: "A casual tide-check crew for surfers and beach regulars.",
    joinHook: "Join to learn the rhythm of the beach and unlock more Ari hangouts."
  },
  {
    id: "brunch_builders_table",
    name: "Brunch Builders Table",
    purpose: "food",
    owner: { type: "venue", id: "milk_madu_berawa" },
    homeVenueId: "milk_madu_berawa",
    memberIds: ["made"],
    recurringEventIds: ["milk_madu_brunch_social"],
    description: "A founder and freelancer brunch circle that starts social and becomes useful.",
    joinHook: "Join for brunch meetups where small talk turns into project leads."
  }
];
