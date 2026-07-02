import { describe, expect, it } from "vitest";
import { interiorDefinitions } from "../data/interiors";
import { getInteriorByVenueId, isInteriorPointInsideRoom } from "../systems/interiors/InteriorState";

describe("interior definitions", () => {
  it("maps Warung Sari to the Canggu Station exterior door", () => {
    const interior = interiorDefinitions.warung_sari_interior;

    expect(interior.venueId).toBe("canggu_station");
    expect(getInteriorByVenueId("canggu_station")).toBe(interior);
  });

  it("keeps the Warung Sari entrance and exit mat inside the room rect", () => {
    const interior = interiorDefinitions.warung_sari_interior;

    expect(isInteriorPointInsideRoom(interior, interior.entrance)).toBe(true);
    expect(isInteriorPointInsideRoom(interior, interior.exitMat, interior.exitMat.radius)).toBe(true);
  });
});
