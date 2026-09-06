import { describe, it, expect } from "vitest";
import { setAt, deleteAt, removeArrayItem, insertArrayItem, moveArrayItem, safeJsonParse, getUnknownEntries } from "../jsonUtils.js";

describe("setAt", () => {
  it("updates a nested field without mutating the original object", () => {
    const original = { a: { b: 1, c: "keep-me" } };
    const updated = setAt(original, ["a", "b"], 2);
    expect(updated.a.b).toBe(2);
    expect(updated.a.c).toBe("keep-me");
    expect(original.a.b).toBe(1);
  });

  it("preserves sibling and unknown properties (schema-preservation guarantee)", () => {
    const original = { name: "Alabama", customModField: { nested: true }, list: [1, 2, 3] };
    const updated = setAt(original, ["name"], "Auburn");
    expect(updated.customModField).toEqual({ nested: true });
    expect(updated.list).toEqual([1, 2, 3]);
    expect(updated.name).toBe("Auburn");
  });
});

describe("deleteAt", () => {
  it("removes an object key without touching other keys", () => {
    const original = { a: 1, b: 2, c: 3 };
    const updated = deleteAt(original, ["b"]);
    expect(updated).toEqual({ a: 1, c: 3 });
  });
});

describe("array helpers", () => {
  it("insertArrayItem inserts at the given index", () => {
    const updated = insertArrayItem({ list: ["a", "c"] }, ["list"], 1, "b");
    expect(updated.list).toEqual(["a", "b", "c"]);
  });

  it("removeArrayItem removes exactly one item", () => {
    const updated = removeArrayItem({ list: ["a", "b", "c"] }, ["list"], 1);
    expect(updated.list).toEqual(["a", "c"]);
  });

  it("moveArrayItem reorders without losing items", () => {
    const updated = moveArrayItem({ list: ["a", "b", "c"] }, ["list"], 0, 2);
    expect(updated.list).toEqual(["b", "c", "a"]);
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    const result = safeJsonParse('{"a": 1}');
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({ a: 1 });
  });

  it("reports a readable line/column for malformed JSON", () => {
    const text = '{\n  "a": 1,\n  "b":\n}';
    const result = safeJsonParse(text);
    expect(result.ok).toBe(false);
    expect(result.error.message).toBeTruthy();
    expect(typeof result.error.readable).toBe("string");
  });

  it("handles a completely empty string", () => {
    const result = safeJsonParse("");
    expect(result.ok).toBe(false);
  });
});

describe("getUnknownEntries", () => {
  it("returns only keys not in the known set, preserving unusual values", () => {
    const entity = { name: "Alabama", mascot: "Tide", customFlag: true, meta: { x: 1 }, arr: [1, null] };
    const known = new Set(["name", "mascot"]);
    const unknown = getUnknownEntries(entity, known);
    expect(unknown).toEqual([
      ["customFlag", true],
      ["meta", { x: 1 }],
      ["arr", [1, null]]
    ]);
  });

  it("returns an empty array for non-object entities", () => {
    expect(getUnknownEntries(null, new Set())).toEqual([]);
    expect(getUnknownEntries([1, 2], new Set())).toEqual([]);
  });
});
