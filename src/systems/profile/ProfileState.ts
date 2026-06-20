import type { PlayerProfile } from "../../types";

export const DEFAULT_LIFESTYLE_TAGS = ["founder", "surfer", "coffee", "wellness"];

export function createDefaultPlayerProfile(now = Date.now()): PlayerProfile {
  return {
    profileId: `local-${now.toString(36)}`,
    displayName: "New Neighbor",
    avatar: {
      body: "teal",
      hair: "dark",
      outfit: "linen",
      accessory: "daypack"
    },
    lifestyleTags: ["founder", "surfer"],
    bio: "New to Berawa, figuring out routines, cafes, beach time, and community.",
    homeArea: "Berawa",
    createdAt: now,
    remoteAccountId: null
  };
}

export function normalizeLifestyleTags(tags: string[]): string[] {
  const normalized = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .map((tag) => tag.replace(/\s+/g, "_"));
  return [...new Set(normalized)].slice(0, 8);
}

export function setLifestyleTags(profile: PlayerProfile, tags: string[]): void {
  profile.lifestyleTags = normalizeLifestyleTags(tags);
}
