import { describe, it, expect } from "vitest";
import { teamAssets, conferenceAssets, bowlAssets, playoffAssets } from "../assetRegistry.js";

// Guards against the import.meta.glob pattern silently stopping to pick up
// the repository's real Images/ files (the source of truth for asset matching).
describe("assetRegistry", () => {
  it("discovers real team logos from Images/Teams", () => {
    expect(teamAssets.length).toBeGreaterThan(100);
    expect(teamAssets.some((a) => a.baseName === "Alabama")).toBe(true);
  });

  it("discovers real conference logos from Images/Conferences", () => {
    expect(conferenceAssets.some((a) => a.baseName === "SEC")).toBe(true);
  });

  it("discovers real bowl logos from Images/Bowls", () => {
    expect(bowlAssets.some((a) => a.baseName === "Rose Bowl")).toBe(true);
  });

  it("discovers playoff assets as filesystem-only entries", () => {
    expect(playoffAssets.length).toBeGreaterThan(0);
  });
});
