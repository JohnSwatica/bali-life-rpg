import { describe, expect, it } from "vitest";
import { createDefaultPlayerProfile, normalizeLifestyleTags, setLifestyleTags } from "./ProfileState";

describe("ProfileState", () => {
  it("creates a local-only default profile with stable timestamp-derived id", () => {
    const profile = createDefaultPlayerProfile(123456789);

    expect(profile).toMatchObject({
      profileId: `local-${(123456789).toString(36)}`,
      displayName: "New Neighbor",
      lifestyleTags: ["founder", "surfer"],
      homeArea: "Berawa",
      createdAt: 123456789,
      remoteAccountId: null
    });
  });

  it("normalizes lifestyle tags for the cross-app identity bridge", () => {
    expect(
      normalizeLifestyleTags([
        " Founder ",
        "SURFER",
        "sober curious",
        "",
        "founder",
        "  ",
        "Yoga Group",
        "coffee",
        "night owl",
        "remote work",
        "runner",
        "extra"
      ])
    ).toEqual(["founder", "surfer", "sober_curious", "yoga_group", "coffee", "night_owl", "remote_work", "runner"]);
  });

  it("sets normalized tags in place", () => {
    const profile = createDefaultPlayerProfile(1);

    setLifestyleTags(profile, [" Party ", "Yogi", "party"]);

    expect(profile.lifestyleTags).toEqual(["party", "yogi"]);
  });
});
