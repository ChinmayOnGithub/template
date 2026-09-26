/*
 * validate-template.mjs
 * Validates template integrity, skill structures, markdown links, and secret safety.
 * Automates template self-validation checks across documentation and configuration.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../");
let errors = 0;

function logError(msg) {
  console.error(`[VALIDATION ERROR] ${msg}`);
  errors++;
}

function checkSkills() {
  const skillsDir = path.join(ROOT, ".agents/skills");
  if (!fs.existsSync(skillsDir)) {
    logError("Skills directory missing: .agents/skills");
    return;
  }
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const s of skills) {
    if (s.isDirectory()) {
      const skillMd = path.join(skillsDir, s.name, "SKILL.md");
      if (!fs.existsSync(skillMd)) {
        logError(`Skill '${s.name}' missing SKILL.md`);
        continue;
      }
      const content = fs.readFileSync(skillMd, "utf8");
      if (!content.startsWith("---")) {
        logError(`Skill '${s.name}/SKILL.md' missing YAML frontmatter opening '---'`);
      }
      if (!/name:\s*[a-zA-Z0-9_-]+/.test(content)) {
        logError(`Skill '${s.name}/SKILL.md' missing 'name' in frontmatter`);
      }
      if (!/description:\s*.+/.test(content)) {
        logError(`Skill '${s.name}/SKILL.md' missing 'description' in frontmatter`);
      }
    }
  }
}

function checkProjectTypes() {
  const ptDir = path.join(ROOT, ".agents/project-types");
  if (!fs.existsSync(ptDir)) {
    logError("Project types directory missing: .agents/project-types");
    return;
  }
  const expectedTypes = ["web", "browser-extension", "developer-extension", "mobile", "backend", "native"];
  for (const t of expectedTypes) {
    const guidePath = path.join(ptDir, t, "GUIDE.md");
    if (!fs.existsSync(guidePath)) {
      logError(`Project type '${t}' missing GUIDE.md at ${path.relative(ROOT, guidePath)}`);
    }
  }
}

function checkDocsStructure() {
  const expectedDocs = [
    "docs/product/PRODUCT_BRIEF.md",
    "docs/product/GOALS.md",
    "docs/product/BUSINESS_MODEL.md",
    "docs/product/USER_STORIES.md",
    "docs/product/SUCCESS_METRICS.md",
    "docs/architecture/ARCHITECTURE.md",
    "docs/architecture/INVARIANTS.md",
    "docs/architecture/DECISIONS.md",
    "docs/architecture/ADR/ADR-001-template.md",
    "docs/design/DESIGN_BRIEF.md",
    "docs/design/DESIGN_DEFAULTS.md",
    "docs/design/DESIGN_SYSTEM.md",
    "docs/design/DESIGN_PRINCIPLES.md",
    "docs/design/UX_RULES.md",
    "docs/engineering/TECH_STACK.md",
    "docs/engineering/DEVELOPMENT.md",
    "docs/engineering/TESTING.md",
    "docs/engineering/SECURITY.md",
    "docs/engineering/PERFORMANCE.md",
    "docs/engineering/ERROR_HANDLING.md",
    "docs/engineering/IDEMPOTENCY.md",
    "docs/engineering/OBSERVABILITY.md",
    "docs/engineering/RELEASE.md",
    "docs/engineering/DEPENDENCIES.md",
    "docs/research/RESEARCH.md",
    "docs/AI/AI_WORKFLOW.md",
  ];

  for (const doc of expectedDocs) {
    const docPath = path.join(ROOT, doc);
    if (!fs.existsSync(docPath)) {
      logError(`Core documentation file missing: ${doc}`);
    }
  }
}

function checkMarkdownLinks() {
  function getMdFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      if (item.name === "node_modules" || item.name === ".git") continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        results.push(...getMdFiles(full));
      } else if (item.name.endsWith(".md")) {
        results.push(full);
      }
    }
    return results;
  }

  const mdFiles = getMdFiles(ROOT);
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const file of mdFiles) {
    const content = fs.readFileSync(file, "utf8");
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const target = match[2];
      if (target.startsWith("http") || target.startsWith("#") || target.startsWith("mailto:")) continue;
      const cleanTarget = target.split("#")[0];
      if (!cleanTarget) continue;
      const resolved = path.resolve(path.dirname(file), cleanTarget);
      if (!fs.existsSync(resolved)) {
        logError(`Broken link in ${path.relative(ROOT, file)}: -> ${target}`);
      }
    }
  }
}

function checkSecretSafety() {
  const forbiddenFiles = [".env", ".env.local", ".env.production", "id_rsa", "credentials.json"];
  for (const f of forbiddenFiles) {
    if (fs.existsSync(path.join(ROOT, f))) {
      logError(`Accidental secret or local environment file committed: ${f}`);
    }
  }
}

console.log("[VALIDATE] Starting template self-validation checks...");
checkSkills();
checkProjectTypes();
checkDocsStructure();
checkMarkdownLinks();
checkSecretSafety();

if (errors > 0) {
  console.error(`[VALIDATE] Template self-validation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log("[VALIDATE] All template structure, skills, markdown links, and safety checks passed.");
  process.exit(0);
}
