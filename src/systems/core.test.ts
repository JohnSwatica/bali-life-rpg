import { describe, expect, it } from "vitest";

describe("core test harness", () => {
  it("runs deterministic TypeScript tests", () => {
    expect(1 + 1).toBe(2);
  });
});
