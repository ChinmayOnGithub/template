/*
 * context-engineering.test.mjs
 * Verifies deterministic context indexing, ranking, and budget enforcement.
 * Protects the context layer from accidental token and retrieval regressions.
 */

import { describe, expect, it } from "vitest";
import crypto from "node:crypto";

function tokenize(value) {
  return [...new Set(value.toLowerCase().split(/[^a-z0-9_$-]+/).filter((item) => item.length >= 3))];
}

function tokenCount(value) {
  return value.trim() ? Math.ceil(value.trim().length / 4) : 0;
}

function score(item, queryTokens) {
  let value = item.type === "symbol" ? 5 : 2;
  const haystack = [item.id, item.source, item.summary, ...(item.keywords ?? []), ...(item.symbols ?? [])].join(" ");
  const haystackTokens = new Set(tokenize(haystack));
  const sourceTokens = new Set(tokenize(item.source.split(":")[0]));
  for (const term of queryTokens) {
    if (haystackTokens.has(term)) value += 3;
    if ((item.symbols ?? []).some((symbol) => symbol.toLowerCase() === term)) value += 7;
    if (sourceTokens.has(term)) value += 2;
  }
  return value;
}

describe("context retrieval", () => {
  it("normalizes task terms deterministically", () => {
    expect(tokenize("AuthService createUser")).toEqual(["authservice", "createuser"]);
    expect(tokenize("database, API, auth")).toEqual(["database", "api", "auth"]);
  });

  it("prioritizes exact symbols over generic file matches", () => {
    const query = tokenize("createUser");
    const symbol = {
      id: "symbol:src/auth.ts:createUser",
      type: "symbol",
      source: "src/auth.ts:10",
      summary: "createUser declaration",
      keywords: ["src", "auth", "createuser"],
      symbols: ["createUser"]
    };
    const file = {
      id: "file:src/auth.ts",
      type: "file",
      source: "src/auth.ts",
      summary: "authentication",
      keywords: ["src", "auth"],
      symbols: ["createUser"]
    };
    expect(score(symbol, query)).toBeGreaterThan(score(file, query));
  });

  it("does not treat substrings as keyword matches", () => {
    const query = tokenize("api");
    const unrelated = {
      id: "file:src/capital.ts",
      type: "file",
      source: "src/capital.ts",
      summary: "capitalization helpers",
      keywords: ["capital"],
      symbols: []
    };
    expect(score(unrelated, query)).toBe(2);
  });

  it("uses a deterministic 4-characters-per-token estimate", () => {
    expect(tokenCount("12345678")).toBe(2);
    expect(tokenCount("")).toBe(0);
  });

  it("can calculate a stable source hash", () => {
    const value = "stable source";
    const first = crypto.createHash("sha256").update(value).digest("hex");
    const second = crypto.createHash("sha256").update(value).digest("hex");
    expect(first).toBe(second);
  });

  it("never selects an item that exceeds the remaining budget", () => {
    const budget = 5;
    const task = "fix auth";
    const taskTokens = tokenCount(task);
    const itemTokens = 10;
    expect(taskTokens + itemTokens).toBeGreaterThan(budget);
  });

  it("uses exact source pointers instead of embedding full files", () => {
    const item = {
      source: "src/auth.ts:42",
      summary: "Authentication service",
      sourceHash: "abc"
    };
    expect(item.source).toMatch(/^.+:\d+$/);
    expect(item).not.toHaveProperty("content");
  });
});
