/*
 * context-index.mjs
 * Builds a deterministic repository index and compact ContextItem cache.
 * Keeps repository knowledge available without loading full files into agent context.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../");
const CONTEXT_DIR = path.join(ROOT, ".agents/context");
const OUTPUT = path.join(CONTEXT_DIR, "index.json");
const CACHE_OUTPUT = path.join(CONTEXT_DIR, "items.json");

const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".cache"
]);

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md",
  ".mdx", ".yaml", ".yml", ".toml", ".css", ".scss", ".html",
  ".rs", ".go", ".java", ".kt", ".cpp", ".cc", ".c", ".h", ".hpp",
  ".py", ".sh"
]);

const SYMBOL_PATTERNS = [
  /\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  /\b(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g,
  /\b(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/g,
  /\b(?:export\s+)?type\s+([A-Za-z_$][\w$]*)/g,
  /\b(?:export\s+)?enum\s+([A-Za-z_$][\w$]*)/g,
  /\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g
];

function hash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function walk(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) {
      const childPath = path.join(dir, entry.name);
      if (path.resolve(childPath) === path.resolve(CONTEXT_DIR)) continue;
      if (!IGNORED_DIRS.has(entry.name)) {
        walk(childPath, result);
      }
      continue;
    }

    const full = path.join(dir, entry.name);
    if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      result.push(full);
    }
  }

  return result;
}

function tokenize(value) {
  return [...new Set(
    value
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .split(/[^a-z0-9_$-]+/)
      .filter((token) => token.length >= 3)
  )];
}

function firstSummary(content, relativePath) {
  const lines = content.split(/\r?\n/);
  const heading = lines.find((line) => /^\s*#{1,3}\s+/.test(line));

  if (heading) {
    return heading.replace(/^\s*#{1,3}\s+/, "").trim().slice(0, 180);
  }

  const comment = lines.find((line) => /^\s*(?:\/\*|\*|\/\/|#)\s*[^/*#]/.test(line));
  if (comment) {
    return comment.replace(/^\s*(?:\/\*|\*|\/\/|#)\s*/, "").trim().slice(0, 180);
  }

  return relativePath;
}

function imports(content, parseCode) {
  if (!parseCode) return [];
  const values = [];
  const patterns = [
    /\bimport\s+(?:[^"'\n]+?\s+from\s+)?["']([^"']+)["']/g,
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
    /\b(?:use|mod)\s+([A-Za-z0-9_:/.-]+)/g
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      values.push(match[1]);
    }
  }

  return [...new Set(values)].sort();
}

function symbols(content, parseCode) {
  if (!parseCode) return [];
  const found = [];

  for (const pattern of SYMBOL_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      const index = match.index ?? 0;
      const line = content.slice(0, index).split(/\r?\n/).length;
      found.push({ name: match[1], line });
    }
  }

  const seen = new Set();
  return found
    .filter((item) => {
      const key = `${item.name}:${item.line}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.line - b.line || a.name.localeCompare(b.name));
}

function classifyType(relativePath) {
  if (/INVARIANTS\.md$/i.test(relativePath)) return "invariant";
  if (/\bADR\b|DECISIONS\.md$/i.test(relativePath)) return "decision";
  if (/\.agents\/skills\//i.test(relativePath)) return "skill";
  if (/\.agents\/memory\//i.test(relativePath)) return "memory";
  if (/ARCHITECTURE\.md$/i.test(relativePath)) return "architecture";
  return "file";
}

function build() {
  fs.mkdirSync(CONTEXT_DIR, { recursive: true });

  const files = walk(ROOT);
  const entries = [];
  const items = [];

  for (const fullPath of files) {
    const relativePath = path.relative(ROOT, fullPath).replaceAll(path.sep, "/");
    const content = fs.readFileSync(fullPath, "utf8");
    const sourceHash = hash(content);
    const parseCode = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".rs", ".go", ".java", ".kt", ".cpp", ".cc", ".c", ".h", ".hpp", ".py", ".sh"].includes(path.extname(relativePath).toLowerCase());
    const fileSymbols = symbols(content, parseCode);
    const dependencies = imports(content, parseCode);
    const keywords = tokenize(
      `${relativePath} ${firstSummary(content, relativePath)} ${fileSymbols.map((item) => item.name).join(" ")}`
    );
    const itemType = classifyType(relativePath);

    entries.push({
      path: relativePath,
      bytes: Buffer.byteLength(content, "utf8"),
      lines: content.split(/\r?\n/).length,
      sourceHash,
      keywords,
      symbols: fileSymbols,
      dependencies
    });

    items.push({
      id: `${itemType}:${relativePath}`,
      type: itemType,
      source: relativePath,
      summary: firstSummary(content, relativePath),
      keywords,
      symbols: fileSymbols.map((item) => item.name),
      relations: { dependsOn: dependencies },
      stability: itemType === "memory" ? "volatile" : "stable",
      sourceHash
    });

    for (const symbol of fileSymbols) {
      items.push({
        id: `symbol:${relativePath}:${symbol.name}`,
        type: "symbol",
        source: `${relativePath}:${symbol.line}`,
        summary: `${symbol.name} declared in ${relativePath}`,
        keywords: tokenize(`${relativePath} ${symbol.name}`),
        symbols: [symbol.name],
        relations: { relatedTo: [`${itemType}:${relativePath}`] },
        stability: "stable",
        sourceHash
      });
    }
  }

  const index = {
    version: 1,
    root: ".",
    files: entries
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2) + "\n", "utf8");
  fs.writeFileSync(CACHE_OUTPUT, JSON.stringify({ version: 1, items }, null, 2) + "\n", "utf8");

  console.log(`[CONTEXT] Indexed ${entries.length} files and ${items.length} cached items.`);
}

build();
