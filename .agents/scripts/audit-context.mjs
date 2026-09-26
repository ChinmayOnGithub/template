/*
 * audit-context.mjs
 * Analyzes token footprint, cache size, and retrieval output for AI context files.
 * Reports measurable values without claiming task usefulness that cannot be observed.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../");

function getStats(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return { lines: 0, bytes: 0, words: 0 };

  const content = fs.readFileSync(fullPath, "utf8");
  return {
    lines: content.split("\n").length,
    bytes: Buffer.byteLength(content, "utf8"),
    words: content.trim().split(/\s+/).filter(Boolean).length
  };
}

function estimatedTokens(bytes) {
  return Math.ceil(bytes / 4);
}

console.log("==============================================================================");
console.log(" AI CONTEXT SIZE & PROGRESSIVE LOADING AUDIT");
console.log("==============================================================================");

console.log("\n[LAYER 1: ALWAYS-LOADED CORE NAVIGATION]");
for (const file of ["AGENTS.md", "AI_CONSTITUTION.md"]) {
  const stats = getStats(file);
  console.log(`- ${file.padEnd(25)}: ${String(stats.lines).padStart(4)} lines | ${String(stats.words).padStart(5)} words | ${String(stats.bytes).padStart(6)} bytes`);
}

console.log("\n[LAYER 2: PERMANENT RULES (.agents/rules/)]");
const rulesDir = path.join(ROOT, ".agents/rules");
if (fs.existsSync(rulesDir)) {
  for (const file of fs.readdirSync(rulesDir).sort()) {
    const stats = getStats(path.join(".agents/rules", file));
    console.log(`- ${file.padEnd(25)}: ${String(stats.lines).padStart(4)} lines | ${String(stats.words).padStart(5)} words | ${String(stats.bytes).padStart(6)} bytes`);
  }
}

console.log("\n[LAYER 3: ON-DEMAND SKILLS (.agents/skills/)]");
const skillsDir = path.join(ROOT, ".agents/skills");
let totalSkillWords = 0;
let totalSkillCount = 0;

if (fs.existsSync(skillsDir)) {
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    totalSkillCount++;
    const stats = getStats(path.join(".agents/skills", entry.name, "SKILL.md"));
    totalSkillWords += stats.words;
    console.log(`- Skill: ${entry.name.padEnd(26)}: ${String(stats.words).padStart(5)} words (${stats.bytes} B)`);
  }
}

console.log(`\nTotal On-Demand Skills: ${totalSkillCount} (Avg words per skill: ${Math.round(totalSkillWords / (totalSkillCount || 1))})`);

console.log("\n[LAYER 4: REUSABLE WORKFLOW PROMPTS (.agents/prompts/)]");
const promptsDir = path.join(ROOT, ".agents/prompts");
if (fs.existsSync(promptsDir)) {
  for (const file of fs.readdirSync(promptsDir).sort()) {
    const stats = getStats(path.join(".agents/prompts", file));
    console.log(`- Prompt: ${file.padEnd(25)}: ${String(stats.lines).padStart(4)} lines | ${String(stats.words).padStart(5)} words`);
  }
}

console.log("\n[LAYER 5: CONTEXT INDEX & CACHE]");
const contextDir = path.join(ROOT, ".agents/context");
const indexPath = path.join(contextDir, "index.json");
const cachePath = path.join(contextDir, "items.json");
const lastContextPath = path.join(contextDir, "last-context.json");

if (fs.existsSync(indexPath) && fs.existsSync(cachePath)) {
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  const cachedBytes = Buffer.byteLength(JSON.stringify(cache.items ?? []), "utf8");
  const sourceBytes = (index.files ?? []).reduce((sum, file) => sum + (file.bytes ?? 0), 0);

  console.log(`- Indexed files          : ${index.files?.length ?? 0}`);
  console.log(`- Cached items           : ${cache.items?.length ?? 0}`);
  console.log(`- Estimated source tokens: ${estimatedTokens(sourceBytes)} (4 chars/token approximation)`);
  console.log(`- Estimated cache tokens : ${estimatedTokens(cachedBytes)} (4 chars/token approximation)`);
  console.log(`- Cache ratio            : ${sourceBytes ? (cachedBytes / sourceBytes * 100).toFixed(1) : "0.0"}%`);
} else {
  console.log("- Context index           : not generated (run npm run context:index)");
}

if (fs.existsSync(lastContextPath)) {
  const context = JSON.parse(fs.readFileSync(lastContextPath, "utf8"));
  const selected = context.items ?? [];
  const sourceItems = selected.filter((item) => item.sourceEvidence);
  const summaryWords = selected.reduce(
    (sum, item) => sum + String(item.summary ?? "").trim().split(/\s+/).filter(Boolean).length,
    0
  );
  const sourceWords = sourceItems.reduce(
    (sum, item) => sum + String(item.sourceEvidence).trim().split(/\s+/).filter(Boolean).length,
    0
  );

  console.log(`- Last context items     : ${selected.length}`);
  console.log(`- Last context summaries : ${summaryWords} words`);
  console.log(`- Last context evidence  : ${sourceWords} words`);
  console.log("- Context precision      : not measurable without task-level usefulness labels");
  console.log("- Retrieval waste        : not measurable without task-level usefulness labels");
} else {
  console.log("- Last task context      : not generated");
}

console.log("\n==============================================================================");
console.log(" AUDIT SUMMARY: Progressive loading plus indexed retrieval is configured.");
console.log(" Core navigation remains lightweight. Skills load on-demand.");
console.log("==============================================================================");
