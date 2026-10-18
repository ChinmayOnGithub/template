/*
 * dependency-boundaries.eval.test.ts
 * Architectural evaluation asserting layer boundaries and import restrictions.
 * Enforces modular monolith dependency hierarchy and prevents architectural drift.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = path.resolve(__dirname, "../../../");

function getSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf8");
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  const matches: string[] = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) {
      matches.push(match[1]);
    }
  }
  return matches;
}

describe("Modular Monolith Layer Boundaries", () => {
  it("enforces design-system never imports server, features, or app modules", () => {
    const dsFiles = getSourceFiles(path.join(ROOT_DIR, "design-system"));
    const violations: { file: string; target: string }[] = [];

    for (const file of dsFiles) {
      const imports = extractImports(file);
      for (const imp of imports) {
        if (
          imp.startsWith("@/server") ||
          imp.startsWith("@/features") ||
          imp.startsWith("@/app") ||
          imp.includes("../server") ||
          imp.includes("../features") ||
          imp.includes("../app")
        ) {
          violations.push({ file: path.relative(ROOT_DIR, file), target: imp });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("enforces server infrastructure never imports from features or app", () => {
    const serverFiles = getSourceFiles(path.join(ROOT_DIR, "server"));
    const violations: { file: string; target: string }[] = [];

    for (const file of serverFiles) {
      const imports = extractImports(file);
      for (const imp of imports) {
        if (
          imp.startsWith("@/features") ||
          imp.startsWith("@/app") ||
          imp.includes("../features") ||
          imp.includes("../app")
        ) {
          violations.push({ file: path.relative(ROOT_DIR, file), target: imp });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("enforces features never import from app layer", () => {
    const featureFiles = getSourceFiles(path.join(ROOT_DIR, "features"));
    const violations: { file: string; target: string }[] = [];

    for (const file of featureFiles) {
      const imports = extractImports(file);
      for (const imp of imports) {
        if (imp.startsWith("@/app") || imp.includes("../app")) {
          violations.push({ file: path.relative(ROOT_DIR, file), target: imp });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("enforces pure foundation utilities in lib never import from app or features", () => {
    const foundationDirs = [
      path.join(ROOT_DIR, "lib/api"),
      path.join(ROOT_DIR, "lib/config"),
      path.join(ROOT_DIR, "lib/observability"),
      path.join(ROOT_DIR, "lib/consent"),
      path.join(ROOT_DIR, "lib/seo"),
    ];

    const violations: { file: string; target: string }[] = [];

    for (const dir of foundationDirs) {
      const files = getSourceFiles(dir);
      for (const file of files) {
        const imports = extractImports(file);
        for (const imp of imports) {
          if (
            imp.startsWith("@/app") ||
            imp.startsWith("@/features") ||
            imp.includes("../app") ||
            imp.includes("../features")
          ) {
            violations.push({ file: path.relative(ROOT_DIR, file), target: imp });
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
