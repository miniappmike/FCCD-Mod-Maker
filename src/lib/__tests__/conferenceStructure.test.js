import { describe, it, expect } from "vitest";
import { isValidConferenceStructure } from "../conferenceStructure.js";

function divisionsOf(...sizes) {
  return sizes.map((size, i) => ({ name: `D${i}`, teams: Array.from({ length: size }, (_, t) => ({ abbreviation: `T${i}-${t}` })) }));
}

describe("isValidConferenceStructure", () => {
  it("accepts a single division of exactly 10", () => {
    expect(isValidConferenceStructure(divisionsOf(10))).toBe(true);
    expect(isValidConferenceStructure(divisionsOf(9))).toBe(false);
  });

  it("accepts 2 divisions only when both sizes match and are 6, 7, or 9", () => {
    expect(isValidConferenceStructure(divisionsOf(6, 6))).toBe(true);
    expect(isValidConferenceStructure(divisionsOf(7, 7))).toBe(true);
    expect(isValidConferenceStructure(divisionsOf(9, 9))).toBe(true);
  });

  it("rejects mismatched 2-division sizes even when each individual size is allowed", () => {
    // This is the real bug the game surfaced: a 6+7 split totals 13 teams,
    // which the game's own validator rejects, even though 6 and 7 are each
    // individually valid division sizes.
    expect(isValidConferenceStructure(divisionsOf(6, 7))).toBe(false);
  });

  it("accepts 4 divisions only when all sizes match and are 4 or 5", () => {
    expect(isValidConferenceStructure(divisionsOf(4, 4, 4, 4))).toBe(true);
    expect(isValidConferenceStructure(divisionsOf(5, 5, 5, 5))).toBe(true);
    expect(isValidConferenceStructure(divisionsOf(4, 4, 5, 5))).toBe(false);
  });

  it("rejects any other division count", () => {
    expect(isValidConferenceStructure(divisionsOf(5, 5, 5))).toBe(false);
    expect(isValidConferenceStructure([])).toBe(false);
  });

  it("handles missing/empty input without throwing", () => {
    expect(isValidConferenceStructure(null)).toBe(false);
    expect(isValidConferenceStructure(undefined)).toBe(false);
  });
});
