import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addHiddenTrustFlag,
  adjustReputation,
  awardReputationTag,
  clearWantedStanding,
  createDefaultReputationState,
  getBounty,
  getFlaggedByVictims,
  getLastFlagReason,
  getReputationScore,
  getWantedLevel,
  recordRecklessDamageFlag,
  reduceWantedStanding
} from "./ReputationState";

describe("ReputationState", () => {
  it("adjusts score with clamps and appends history", () => {
    const reputation = createDefaultReputationState(60);

    adjustReputation(reputation, 15, "Helped a neighbor", 10);
    adjustReputation(reputation, 200, "Upper clamp", 11);
    adjustReputation(reputation, -250, "Lower clamp", 12);

    expect(getReputationScore(reputation)).toBe(-100);
    expect(reputation.history).toEqual([
      { at: 10, change: "Helped a neighbor", delta: 15 },
      { at: 11, change: "Upper clamp", delta: 200 },
      { at: 12, change: "Lower clamp", delta: -250 }
    ]);
  });

  it("records reckless damage flags with wanted and bounty caps", () => {
    const reputation = createDefaultReputationState();
    const limits = {
      maxWantedLevel: 2,
      maxBounty: 70,
      firstFlagBounty: 30,
      repeatFlagBounty: 25
    };

    const first = recordRecklessDamageFlag(reputation, "Made", 20, limits);
    const second = recordRecklessDamageFlag(reputation, "Kadek", 21, limits);
    const third = recordRecklessDamageFlag(reputation, "Ibu Sari", 22, limits);

    expect(first).toEqual({ wantedLevel: 1, bounty: 30, bountyIncrease: 30, flaggedByVictims: 1 });
    expect(second).toEqual({ wantedLevel: 2, bounty: 55, bountyIncrease: 25, flaggedByVictims: 2 });
    expect(third).toEqual({ wantedLevel: 2, bounty: 70, bountyIncrease: 25, flaggedByVictims: 3 });
    expect(getWantedLevel(reputation)).toBe(2);
    expect(getBounty(reputation)).toBe(70);
    expect(getFlaggedByVictims(reputation)).toBe(3);
    expect(getLastFlagReason(reputation)).toBe("Bike hit reported by Ibu Sari");
    expect(reputation.history.map((event) => event.change)).toEqual([
      "Flagged by Made for reckless riding",
      "Flagged by Kadek for reckless riding",
      "Flagged by Ibu Sari for reckless riding"
    ]);
  });

  it("reduces and clears wanted standing without negative values", () => {
    const reputation = createDefaultReputationState();
    recordRecklessDamageFlag(reputation, "Made", 20, {
      maxWantedLevel: 4,
      maxBounty: 120,
      firstFlagBounty: 30,
      repeatFlagBounty: 30
    });
    recordRecklessDamageFlag(reputation, "Kadek", 21, {
      maxWantedLevel: 4,
      maxBounty: 120,
      firstFlagBounty: 30,
      repeatFlagBounty: 30
    });

    reduceWantedStanding(reputation, 1, 20, "Apologized and helped repair damage", 30);
    expect(reputation).toMatchObject({
      wantedLevel: 1,
      bounty: 40,
      flaggedByVictims: 2,
      lastFlagReason: "Bike hit reported by Kadek"
    });

    reduceWantedStanding(reputation, 99, 99, "Completed local redemption", 31);
    expect(reputation).toMatchObject({
      wantedLevel: 0,
      bounty: 0,
      flaggedByVictims: 2,
      lastFlagReason: undefined
    });

    clearWantedStanding(reputation, "Council cleared standing", 32);
    expect(reputation).toMatchObject({
      wantedLevel: 0,
      bounty: 0,
      flaggedByVictims: 0,
      lastFlagReason: undefined
    });
    expect(reputation.history.at(-1)).toEqual({ at: 32, change: "Council cleared standing", delta: 0 });
  });

  it("keeps visible tags separate from hidden trust flags", () => {
    const reputation = createDefaultReputationState();

    awardReputationTag(reputation, "helpful", "Finished grocery restock", 40);
    awardReputationTag(reputation, "helpful", "Duplicate award should not duplicate tag", 41);
    addHiddenTrustFlag(reputation, { type: "red", reason: "Private moderation marker", source: "test" }, 42);
    addHiddenTrustFlag(reputation, { type: "green", reason: "Private reliability marker", source: "test" }, 43);

    expect(reputation.tags).toEqual(["helpful"]);
    expect(reputation.hiddenFlags).toEqual([
      { type: "red", reason: "Private moderation marker", source: "test", createdAt: 42 },
      { type: "green", reason: "Private reliability marker", source: "test", createdAt: 43 }
    ]);
    expect(reputation.history).toEqual([
      { at: 40, change: "Finished grocery restock" },
      { at: 41, change: "Duplicate award should not duplicate tag" }
    ]);
  });

  it("preserves the explicit redemption placeholder state", () => {
    const reputation = createDefaultReputationState();

    expect(reputation.redemption).toEqual({ active: false, challengeId: null });
    reputation.redemption = { active: true, challengeId: "beach_cleanup" };

    expect(reputation.redemption).toEqual({ active: true, challengeId: "beach_cleanup" });
  });

  it("does not read removed flat standing fields from player state outside persistence migration", () => {
    const offenders = scanSourceForFlatPlayerStandingReads();

    expect(offenders).toEqual([]);
  });
});

function scanSourceForFlatPlayerStandingReads(): string[] {
  const srcRoot = fileURLToPath(new URL("../../", import.meta.url));
  const sourceFiles = listSourceFiles(srcRoot).filter((file) => {
    const normalized = file.replaceAll("\\", "/");
    return !normalized.endsWith(".test.ts") && !normalized.endsWith("/systems/Persistence.ts");
  });
  const flatPlayerStandingRead = /\b(?:player|playerState|localPlayer)\.(?:reputation|wantedLevel|bounty|flaggedByVictims|lastFlagReason)\b/g;
  const offenders: string[] = [];

  for (const file of sourceFiles) {
    const text = readFileSync(file, "utf8");
    const matches = text.match(flatPlayerStandingRead);
    if (matches) {
      offenders.push(`${file.replace(srcRoot, "src/")}: ${matches.join(", ")}`);
    }
  }

  return offenders;
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return listSourceFiles(path);
    }
    return path.endsWith(".ts") ? [path] : [];
  });
}
