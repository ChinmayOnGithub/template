/*
 * check-headers.mjs
 * Validates mandatory file header format across human-maintained source files.
 * Automates engineering rule verification in CI and local pre-commit checks.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".git",
]);

let failed = false;
let checkedCount = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8").trimStart();
  const relPath = path.relative(ROOT_DIR, filePath);
  const baseName = path.basename(filePath);

  // File header pattern:
  // /*
  //  * filename.ext
  //  * What this file does.
  //  * Why this file matters.
  //  */
  const headerMatch = content.match(
    /^\/\*\r?\n\s*\*\s*([^\r\n]+)\r?\n\s*\*\s*([^\r\n]+)\r?\n\s*\*\s*([^\r\n]+)\r?\n\s*\*\//,
  );

  checkedCount++;

  if (!headerMatch) {
    console.error(`[HEADER MISSING] ${relPath} does not begin with standard 3-line file header comment.`);
    failed = true;
    return;
  }

  const declaredName = headerMatch[1].trim();
  if (declaredName !== baseName) {
    console.error(
      `[HEADER MISMATCH] ${relPath} declares filename '${declaredName}' instead of '${baseName}'.`,
    );
    failed = true;
    return;
  }

  // Check for emojis or em dashes in header
  const headerText = headerMatch[0];
  if (/[\u2014\u2013]/.test(headerText)) {
    console.error(`[HEADER FORMAT] ${relPath} header contains forbidden em dash or en dash.`);
    failed = true;
  }
  if (/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(headerText)) {
    console.error(`[HEADER FORMAT] ${relPath} header contains forbidden emoji.`);
    failed = true;
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SOURCE_EXTENSIONS.has(ext)) {
        checkFile(path.join(dir, entry.name));
      }
    }
  }
}

walk(ROOT_DIR);
console.log(`Checked file headers in ${checkedCount} source files.`);

if (failed) {
  console.error("File header check failed. Please fix header formatting.");
  process.exit(1);
} else {
  console.log("All source file headers passed validation.");
  process.exit(0);
}
