/*
 * init-project.mjs
 * Automates initial project setup, category selection, and template cleanup.
 * Streamlines repository bootstrapping and removes irrelevant template scaffolding.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    name: "",
    type: "web",
    cleanup: false,
    applyDefaults: true,
  };

  for (const arg of args) {
    if (arg.startsWith("--name=")) {
      options.name = arg.split("=")[1].replace(/^["']|["']$/g, "");
    } else if (arg.startsWith("--type=")) {
      options.type = arg.split("=")[1].toLowerCase();
    } else if (arg === "--cleanup") {
      options.cleanup = true;
    } else if (arg === "--no-defaults") {
      options.applyDefaults = false;
    }
  }
  return options;
}

function updatePackageJson(projectName, projectType, cleanup) {
  const pkgPath = path.join(ROOT, "package.json");
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (projectName) {
    pkg.name = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  }

  if (cleanup && projectType !== "web") {
    // Remove web-specific dependencies
    const webDeps = [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "next",
      "react",
      "react-dom",
      "tailwind-merge",
    ];
    const webDevDeps = [
      "@playwright/test",
      "@tailwindcss/postcss",
      "@tailwindcss/typography",
      "@types/react",
      "@types/react-dom",
      "eslint-config-next",
      "postcss",
      "tailwindcss",
    ];

    if (pkg.dependencies) {
      for (const d of webDeps) delete pkg.dependencies[d];
    }
    if (pkg.devDependencies) {
      for (const d of webDevDeps) delete pkg.devDependencies[d];
    }
    if (pkg.scripts) {
      delete pkg.scripts.dev;
      delete pkg.scripts.start;
      delete pkg.scripts["test:e2e"];
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

function removeNonWebFiles() {
  const designSystemPath = path.join(ROOT, "design-system");
  if (fs.existsSync(designSystemPath)) {
    fs.rmSync(designSystemPath, { recursive: true, force: true });
    console.log("[CLEANUP] Removed design-system/ directory for non-web project.");
  }
}

function copyDefaultAssets() {
  const publicDir = path.join(ROOT, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const faviconSource = path.join(ROOT, ".agents/defaults/assets/favicon.svg");
  const faviconDest = path.join(publicDir, "favicon.svg");
  if (fs.existsSync(faviconSource) && !fs.existsSync(faviconDest)) {
    fs.copyFileSync(faviconSource, faviconDest);
    console.log("[DEFAULTS] Copied adaptive SVG favicon to public/favicon.svg.");
  }
}

function updateSpec(projectName) {
  const specPath = path.join(ROOT, "SPEC.md");
  if (fs.existsSync(specPath) && projectName) {
    let content = fs.readFileSync(specPath, "utf8");
    content = content.replace("# Project Specification (SPEC.md)", `# Specification: ${projectName}`);
    fs.writeFileSync(specPath, content, "utf8");
  }
}

function run() {
  const opts = parseArgs();
  console.log(`[INIT] Initializing project: ${opts.name || "unnamed"} (Category: ${opts.type})`);

  if (opts.name) {
    updatePackageJson(opts.name, opts.type, opts.cleanup);
    updateSpec(opts.name);
  }

  if (opts.cleanup && opts.type !== "web") {
    removeNonWebFiles();
  }

  if (opts.applyDefaults && opts.type === "web") {
    copyDefaultAssets();
  }

  console.log("[INIT] Initialization completed successfully.");
  console.log("[NEXT STEPS]");
  console.log("1. Review SPEC.md and docs/product/PRODUCT_BRIEF.md");
  console.log("2. Record technical choices in docs/engineering/TECH_STACK.md");
  console.log("3. Run .agents/prompts/plan-feature.md or start implementation.");
}

run();
