/*
 * context-build.mjs
 * Builds a small deterministic task context from cached repository items.
 * Loads exact source ranges only for selected high-value items.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../");
const INDEX_PATH = path.join(ROOT, ".agents/context/index.json");
const CACHE_PATH = path.join(ROOT, ".agents/context/items.json");

function arg(name, fallback = "") {
  const prefix = `--${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function tokens(value) {
  return [...new Set(
    value.toLowerCase()
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(/[^a-z0-9_$-]+/)
      .filter((item) => item.length >= 3)
  )];
}

function tokenCount(value) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function changedFiles() {
  try {
    return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/).map((v) => v.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function readRange(source) {
  const match = source.match(/^(.*):(\d+)$/);
  if (!match) return "";
  const file = path.join(ROOT, match[1]);
  if (!fs.existsSync(file)) return "";
  const line = Number(match[2]);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const start = Math.max(1, line - 4);
  const end = Math.min(lines.length, line + 20);
  return lines.slice(start - 1, end).map((text, index) => `${start + index}: ${text}`).join("\n");
}

function score(item, queryTokens, changed) {
  let score = item.type === "symbol" ? 5 : 2;
  const haystack = [
    item.id, item.source, item.summary,
    ...(item.keywords ?? []), ...(item.symbols ?? [])
  ].join(" ").toLowerCase();

  for (const term of queryTokens) {
    if (haystack.includes(term)) score += 3;
    if ((item.symbols ?? []).some((symbol) => symbol.toLowerCase() === term)) score += 7;
    if (item.source.toLowerCase().includes(term)) score += 2;
  }

  const sourcePath = item.source.split(":")[0];
  if (changed.has(sourcePath)) score += 5;
  if (item.type === "architecture" || item.type === "invariant" || item.type === "decision") score += 4;
  return score;
}

function main() {
  const task = arg("task");
  if (!task) {
    console.error("Usage: npm run context:build -- --task=\"your task\" [--budget=2000] [--source=false]");
    process.exit(1);
  }

  if (!fs.existsSync(INDEX_PATH) || !fs.existsSync(CACHE_PATH)) {
    console.error("Context index is missing. Run npm run context:index first.");
    process.exit(1);
  }

  const budget = Number(arg("budget", "2000"));
  const includeSource = arg("source", "true") !== "false";
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  const queryTokens = tokens(task);
  const changed = new Set(changedFiles());

  const ranked = cache.items
    .map((item) => ({ item, score: score(item, queryTokens, changed) }))
    .filter((entry) => entry.score > 2)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));

  const selected = [];
  let usedTokens = tokenCount(task);

  for (const entry of ranked) {
    const summary = `[${entry.item.type}] ${entry.item.source}\n${entry.item.summary}`;
    const summaryTokens = tokenCount(summary);
    const source = includeSource ? readRange(entry.item.source) : "";
    const sourceTokens = tokenCount(source);
    const cost = summaryTokens + sourceTokens;
    if (usedTokens + cost > budget) continue;

    selected.push({
      ...entry.item,
      score: entry.score,
      sourceEvidence: source || undefined
    });
    usedTokens += cost;
  }

  const result = {
    version: 1,
    task,
    budget,
    usedTokens,
    selectedItems: selected.length,
    items: selected
  };

  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}

main();
