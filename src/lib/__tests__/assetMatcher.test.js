import { describe, it, expect } from "vitest";
import { matchAsset, summarizeMatches, findUnusedAssets } from "../assetMatcher.js";

const assets = [
  { baseName: "Alabama", filename: "Alabama.png", url: "/a.png" },
  { baseName: "Arizona State", filename: "Arizona State.png", url: "/b.png" },
  { baseName: "Miami (OH)", filename: "Miami (OH).png", url: "/c.png" },
  { baseName: "Hawai'i Bowl", filename: "Hawai'i Bowl.png", url: "/d.png" },
  { baseName: "Duke's Mayo Bowl", filename: "Duke's Mayo Bowl.png", url: "/e.png" }
];

describe("matchAsset", () => {
  it("finds an exact match", () => {
    const result = matchAsset("Alabama", assets, "Images/Teams");
    expect(result.status).toBe("exact");
    expect(result.asset.filename).toBe("Alabama.png");
  });

  it("finds a case-insensitive match as normalized", () => {
    const result = matchAsset("alabama", assets, "Images/Teams");
    expect(result.status).toBe("normalized");
    expect(result.asset.filename).toBe("Alabama.png");
  });

  it("normalizes trimmed whitespace", () => {
    const result = matchAsset("  Alabama  ", assets, "Images/Teams");
    expect(result.status === "exact" || result.status === "normalized").toBe(true);
  });

  it("normalizes curly apostrophes against straight ones", () => {
    const result = matchAsset("Hawai’i Bowl", assets, "Images/Bowls");
    expect(result.status).toBe("normalized");
    expect(result.asset.filename).toBe("Hawai'i Bowl.png");
  });

  it("suggests a fuzzy match without auto-applying it", () => {
    const result = matchAsset("Arizona St", assets, "Images/Teams");
    expect(result.status).toBe("fuzzy");
    expect(result.asset).toBeNull();
    expect(result.suggestions[0].filename).toBe("Arizona State.png");
  });

  it("reports missing when nothing is close", () => {
    const result = matchAsset("Merrimack", assets, "Images/Teams");
    expect(result.status).toBe("missing");
    expect(result.expectedPath).toBe("Images/Teams/Merrimack.png");
  });

  it("never mutates the requested name", () => {
    const name = "Merrimack";
    matchAsset(name, assets, "Images/Teams");
    expect(name).toBe("Merrimack");
  });

  it("treats an empty name as missing rather than throwing", () => {
    expect(matchAsset("", assets, "Images/Teams").status).toBe("missing");
    expect(matchAsset(undefined, assets, "Images/Teams").status).toBe("missing");
  });
});

describe("summarizeMatches", () => {
  it("tallies each status", () => {
    const matches = [
      matchAsset("Alabama", assets, "Images/Teams"),
      matchAsset("alabama", assets, "Images/Teams"),
      matchAsset("Arizona St", assets, "Images/Teams"),
      matchAsset("Merrimack", assets, "Images/Teams")
    ];
    const summary = summarizeMatches(matches);
    expect(summary).toEqual({ exact: 1, normalized: 1, fuzzy: 1, missing: 1, total: 4 });
  });
});

describe("findUnusedAssets", () => {
  it("finds registry assets not referenced by any entity name", () => {
    const unused = findUnusedAssets(assets, ["Alabama", "Arizona State"]);
    expect(unused.map((a) => a.baseName)).toEqual(["Miami (OH)", "Hawai'i Bowl", "Duke's Mayo Bowl"]);
  });
});
