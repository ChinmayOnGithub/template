/*
 * init-project.mjs
 * Automates project initialization, profile selection, and capability provisioning.
 * Provides safe, deterministic workspace setup with dry-run and dependency validation.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "../../");

export const PROJECT_PROFILES = {
  web: {
    defaultProfile: "saas",
    profiles: ["saas", "minimal", "react"],
    description: "Web application (Next.js App Router, React, Tailwind CSS)",
  },
  backend: {
    defaultProfile: "node",
    profiles: ["node", "spring-boot"],
    description: "Backend service or API",
  },
  cli: {
    defaultProfile: "node",
    profiles: ["node", "native"],
    description: "Command-line tool or automation runner",
  },
  "browser-extension": {
    defaultProfile: "chrome",
    profiles: ["chrome", "firefox"],
    description: "Browser extension (Manifest V3)",
  },
  "developer-extension": {
    defaultProfile: "vscode",
    profiles: ["vscode"],
    description: "IDE or developer tool extension",
  },
  mobile: {
    defaultProfile: "react-native",
    profiles: ["react-native", "flutter"],
    description: "Mobile application",
  },
  native: {
    defaultProfile: "rust",
    profiles: ["rust", "cpp"],
    description: "Native systems application",
  },
};

export const CAPABILITIES = {
  database: {
    name: "database",
    description: "PostgreSQL and Prisma ORM integration, migrations, and seed scripts",
    requires: [],
  },
  auth: {
    name: "auth",
    description: "Server-side authentication, session verification, and role-based access control",
    requires: [],
  },
  billing: {
    name: "billing",
    description: "Product plans, entitlements, limits, and signature-verified webhook handler",
    requires: ["database", "auth"],
  },
  jobs: {
    name: "jobs",
    description: "Background job runner interface with exponential backoff and idempotency",
    requires: [],
  },
  observability: {
    name: "observability",
    description: "Liveness and readiness endpoints, structured logging with correlation IDs",
    requires: [],
  },
  analytics: {
    name: "analytics",
    description: "Provider-neutral product analytics adapter with privacy consent flags",
    requires: [],
  },
  storage: {
    name: "storage",
    description: "Object storage upload authorization and signed URL generation adapter",
    requires: [],
  },
  email: {
    name: "email",
    description: "Transactional email delivery adapter with mock and live transports",
    requires: [],
  },
  integration: {
    name: "integration",
    description:
      "SaaS Admin Portal integration layer for central handshake, entitlements, and events",
    requires: [],
  },
};

export function normalizePackageName(name) {
  if (!name) return "unnamed-project";
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/--+/g, "-") || "unnamed-project"
  );
}

export function parseArgs(rawArgs = process.argv.slice(2)) {
  const options = {
    name: "",
    type: "web",
    profile: "",
    capabilities: [],
    dryRun: false,
    force: false,
    cleanup: false,
    applyDefaults: true,
    help: false,
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--force" || arg === "-f") {
      options.force = true;
      continue;
    }

    if (arg === "--cleanup") {
      options.cleanup = true;
      continue;
    }

    if (arg === "--no-cleanup") {
      options.cleanup = false;
      continue;
    }

    if (arg === "--no-defaults") {
      options.applyDefaults = false;
      continue;
    }

    if (arg === "--all-capabilities") {
      options.capabilities = Object.keys(CAPABILITIES);
      continue;
    }

    if (arg.startsWith("--name=")) {
      options.name = arg
        .slice(7)
        .replace(/^["']|["']$/g, "")
        .trim();
      continue;
    }
    if (arg === "--name" && i + 1 < rawArgs.length) {
      options.name = rawArgs[++i].replace(/^["']|["']$/g, "").trim();
      continue;
    }

    if (arg.startsWith("--type=")) {
      options.type = arg.slice(7).toLowerCase().trim();
      continue;
    }
    if (arg === "--type" && i + 1 < rawArgs.length) {
      options.type = rawArgs[++i].toLowerCase().trim();
      continue;
    }

    if (arg.startsWith("--profile=")) {
      options.profile = arg.slice(10).toLowerCase().trim();
      continue;
    }
    if (arg === "--profile" && i + 1 < rawArgs.length) {
      options.profile = rawArgs[++i].toLowerCase().trim();
      continue;
    }

    if (arg.startsWith("--capabilities=")) {
      const list = arg
        .slice(15)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      options.capabilities = Array.from(new Set([...options.capabilities, ...list]));
      continue;
    }
    if (arg === "--capabilities" && i + 1 < rawArgs.length) {
      const list = rawArgs[++i]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      options.capabilities = Array.from(new Set([...options.capabilities, ...list]));
      continue;
    }

    throw new Error(`Unknown argument: "${arg}". Run with --help to see all supported options.`);
  }

  return options;
}

export function validateOptions(options) {
  if (!PROJECT_PROFILES[options.type]) {
    const validTypes = Object.keys(PROJECT_PROFILES).join(", ");
    throw new Error(`Invalid project type: "${options.type}". Supported types: ${validTypes}`);
  }

  const typeConfig = PROJECT_PROFILES[options.type];
  if (!options.profile) {
    options.profile = typeConfig.defaultProfile;
  } else if (!typeConfig.profiles.includes(options.profile)) {
    const validProfiles = typeConfig.profiles.join(", ");
    throw new Error(
      `Invalid profile "${options.profile}" for type "${options.type}". Supported: ${validProfiles}`,
    );
  }

  const validatedCapabilities = new Set(options.capabilities);
  for (const cap of validatedCapabilities) {
    if (!CAPABILITIES[cap]) {
      const validCaps = Object.keys(CAPABILITIES).join(", ");
      throw new Error(`Invalid capability: "${cap}". Supported: ${validCaps}`);
    }
  }

  // Resolve dependencies
  for (const cap of Array.from(validatedCapabilities)) {
    const def = CAPABILITIES[cap];
    for (const req of def.requires) {
      if (!validatedCapabilities.has(req)) {
        validatedCapabilities.add(req);
      }
    }
  }

  options.capabilities = Array.from(validatedCapabilities).sort();
  return options;
}

export function printHelp() {
  console.log(`
Universal AI Project Template Initializer

Usage:
  bun run init-project [options]
  node .agents/scripts/init-project.mjs [options]

Options:
  --name=<string>         Project display name (e.g. "Admin Portal")
  --type=<type>           Project type: web, backend, cli, browser-extension, developer-extension, mobile, native
  --profile=<profile>     Profile suited to type (default: saas for web, node for backend/cli)
  --capabilities=<list>   Comma-separated list of capabilities:
                          database, auth, billing, jobs, observability, analytics, storage, email
  --all-capabilities      Enable all 8 capabilities for full SaaS foundation
  --dry-run, -d           Preview planned additions, updates, and deletions without changing files
  --force, -f             Proceed without confirmation prompts
  --cleanup               Remove scaffolding irrelevant to non-web project types
  --no-defaults           Skip copying default favicon and branding assets
  --help, -h              Display this help menu

Examples:
  bun run init-project --name="Admin Portal" --type=web --profile=saas --capabilities=database,auth,billing
  bun run init-project --name="Namer" --type=web --profile=minimal
  bun run init-project --name="Stremora" --type=web --profile=saas --all-capabilities
  bun run init-project --name="Core API" --type=backend --profile=node --cleanup
  bun run init-project --dry-run --name="Preview" --type=web --profile=saas
`);
}

export function generatePlan(options, rootDir = DEFAULT_ROOT) {
  const plan = {
    options,
    mutations: [],
    deletions: [],
    packageUpdates: null,
    specUpdates: null,
    envUpdates: null,
  };

  const pkgPath = path.join(rootDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const normalizedName = normalizePackageName(options.name || pkg.name);
    const updatedPkg = JSON.parse(JSON.stringify(pkg));
    updatedPkg.name = normalizedName;

    if (!updatedPkg.templateMetadata) {
      updatedPkg.templateMetadata = {};
    }
    updatedPkg.templateMetadata = {
      initializedAt: new Date().toISOString().split("T")[0],
      projectType: options.type,
      profile: options.profile,
      capabilities: options.capabilities,
    };

    if (options.cleanup && options.type !== "web") {
      const webDeps = [
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-popover",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tooltip",
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

      if (updatedPkg.dependencies) {
        for (const dep of webDeps) delete updatedPkg.dependencies[dep];
      }
      if (updatedPkg.devDependencies) {
        for (const dep of webDevDeps) delete updatedPkg.devDependencies[dep];
      }
      if (updatedPkg.scripts) {
        delete updatedPkg.scripts.dev;
        delete updatedPkg.scripts.start;
        delete updatedPkg.scripts["test:e2e"];
      }
    }

    plan.packageUpdates = {
      path: pkgPath,
      before: pkg,
      after: updatedPkg,
    };
  }

  // Spec update
  const specPath = path.join(rootDir, "SPEC.md");
  if (fs.existsSync(specPath)) {
    const currentSpec = fs.readFileSync(specPath, "utf8");
    const projectName = options.name || "Software Project";
    const capsList = options.capabilities.length > 0 ? options.capabilities.join(", ") : "none";
    let newSpec = currentSpec.replace(
      /# (?:Project Specification \(SPEC\.md\)|Specification: .*)/,
      `# Project Specification: ${projectName}`,
    );
    newSpec = newSpec.replace(
      /\*What problem does this project solve, and for whom\?\*/,
      `*Type: ${options.type} | Profile: ${options.profile} | Active Capabilities: ${capsList}*`,
    );

    plan.specUpdates = {
      path: specPath,
      content: newSpec,
    };
  }

  // Environment file generation
  const envExamplePath = path.join(rootDir, ".env.example");
  const envLocalPath = path.join(rootDir, ".env.local");
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, "utf8");
    if (options.capabilities.includes("auth")) {
      const generatedSecret = crypto.randomBytes(32).toString("hex");
      envContent = envContent.replace(
        "AUTH_SECRET=replace_with_secure_random_string_in_env_local",
        `AUTH_SECRET=${generatedSecret}`,
      );
    }
    if (options.capabilities.includes("integration")) {
      const clientSecret = crypto.randomBytes(24).toString("hex");
      const signingSecret = crypto.randomBytes(32).toString("hex");
      envContent = envContent.replace(
        "ADMIN_PORTAL_CLIENT_SECRET=replace_with_product_client_secret_in_env_local",
        `ADMIN_PORTAL_CLIENT_SECRET=${clientSecret}`,
      );
      envContent = envContent.replace(
        "ADMIN_PORTAL_SIGNING_SECRET=replace_with_portal_signing_secret_in_env_local",
        `ADMIN_PORTAL_SIGNING_SECRET=${signingSecret}`,
      );
    }
    plan.envUpdates = {
      targetPath: envLocalPath,
      content: envContent,
      exists: fs.existsSync(envLocalPath),
    };
  }

  // Assets to copy
  if (options.applyDefaults && options.type === "web") {
    const faviconSrc = path.join(rootDir, ".agents/defaults/assets/favicon.svg");
    const faviconDest = path.join(rootDir, "public/favicon.svg");
    if (fs.existsSync(faviconSrc)) {
      plan.mutations.push({
        type: "copy",
        src: faviconSrc,
        dest: faviconDest,
      });
    }
  }

  // Cleanup for non-web projects
  if (options.cleanup && options.type !== "web") {
    const dirsToDelete = ["design-system", "public"];
    for (const d of dirsToDelete) {
      const target = path.join(rootDir, d);
      if (fs.existsSync(target)) {
        plan.deletions.push(target);
      }
    }
  }

  return plan;
}

export function executePlan(plan, rootDir = DEFAULT_ROOT) {
  const summary = {
    mutations: 0,
    deletions: 0,
    packageUpdated: false,
    specUpdated: false,
    envCreated: false,
    contextIndexed: false,
  };

  // 1. Mutate package.json
  if (plan.packageUpdates) {
    fs.writeFileSync(
      plan.packageUpdates.path,
      JSON.stringify(plan.packageUpdates.after, null, 2) + "\n",
      "utf8",
    );
    summary.packageUpdated = true;
  }

  // 2. Update SPEC.md
  if (plan.specUpdates) {
    fs.writeFileSync(plan.specUpdates.path, plan.specUpdates.content, "utf8");
    summary.specUpdated = true;
  }

  // 3. Write .env.local if not already present
  if (plan.envUpdates && !plan.envUpdates.exists) {
    fs.writeFileSync(plan.envUpdates.targetPath, plan.envUpdates.content, "utf8");
    summary.envCreated = true;
  }

  // 4. File mutations / copies
  for (const mut of plan.mutations) {
    if (mut.type === "copy") {
      fs.mkdirSync(path.dirname(mut.dest), { recursive: true });
      if (!fs.existsSync(mut.dest)) {
        fs.copyFileSync(mut.src, mut.dest);
        summary.mutations++;
      }
    }
  }

  // 5. Deletions
  for (const delPath of plan.deletions) {
    if (fs.existsSync(delPath)) {
      fs.rmSync(delPath, { recursive: true, force: true });
      summary.deletions++;
    }
  }

  // 6. Build context index
  try {
    const indexPath = path.join(rootDir, ".agents/scripts/context-index.mjs");
    if (fs.existsSync(indexPath)) {
      execFileSync(process.execPath, [indexPath], {
        cwd: rootDir,
        stdio: "pipe",
      });
      summary.contextIndexed = true;
    }
  } catch (err) {
    console.warn(`[CONTEXT] Context index regeneration warning: ${err.message}`);
  }

  return summary;
}

export function initProject(rawOptions = {}, rootDir = DEFAULT_ROOT) {
  const validated = validateOptions(rawOptions);
  const plan = generatePlan(validated, rootDir);

  if (validated.dryRun) {
    console.log("=== DRY RUN: PROJECT INITIALIZATION PLAN ===");
    console.log(`Project Name: ${validated.name || "(unnamed)"}`);
    console.log(`Normalized Package: ${normalizePackageName(validated.name)}`);
    console.log(`Type: ${validated.type}`);
    console.log(`Profile: ${validated.profile}`);
    console.log(
      `Capabilities (${validated.capabilities.length}): ${validated.capabilities.join(", ") || "none"}`,
    );
    console.log("\n[PLANNED CHANGES]");
    if (plan.packageUpdates) {
      console.log(
        `- Update ${path.relative(rootDir, plan.packageUpdates.path)} (name: "${plan.packageUpdates.after.name}")`,
      );
    }
    if (plan.specUpdates) {
      console.log(`- Update ${path.relative(rootDir, plan.specUpdates.path)}`);
    }
    if (plan.envUpdates) {
      console.log(
        `- ${plan.envUpdates.exists ? "Skip existing" : "Create"} ${path.relative(rootDir, plan.envUpdates.targetPath)}`,
      );
    }
    for (const m of plan.mutations) {
      console.log(`- Copy ${path.relative(rootDir, m.src)} -> ${path.relative(rootDir, m.dest)}`);
    }
    for (const d of plan.deletions) {
      console.log(`- Delete directory ${path.relative(rootDir, d)}`);
    }
    console.log("- Rebuild context index");
    console.log("=== END DRY RUN (NO FILES MODIFIED) ===");
    return { plan, executed: false, summary: null };
  }

  const summary = executePlan(plan, rootDir);
  return { plan, executed: true, summary };
}

// Direct CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  try {
    const parsed = parseArgs();
    if (parsed.help) {
      printHelp();
      process.exit(0);
    }

    console.log(`[INIT] Starting project bootstrap for: "${parsed.name || "unnamed"}"`);
    console.log(`[INIT] Target Profile: ${parsed.type}/${parsed.profile || "default"}`);
    if (parsed.capabilities.length > 0) {
      console.log(`[INIT] Requested Capabilities: ${parsed.capabilities.join(", ")}`);
    }

    const result = initProject(parsed, DEFAULT_ROOT);

    if (result.executed) {
      console.log("[INIT] Initialization completed successfully.");
      console.log(`[INIT] Package updated: ${result.summary.packageUpdated}`);
      console.log(`[INIT] Spec updated: ${result.summary.specUpdated}`);
      console.log(`[INIT] Environment initialized: ${result.summary.envCreated}`);
      console.log(`[INIT] Files copied: ${result.summary.mutations}`);
      console.log(`[INIT] Files pruned: ${result.summary.deletions}`);
      console.log(`[INIT] Context indexed: ${result.summary.contextIndexed}`);
      console.log("\n[NEXT STEPS]");
      console.log("1. Review SPEC.md and configure .env.local");
      console.log("2. Record technical architecture in docs/architecture/ARCHITECTURE.md");
      console.log("3. Run npm run test and npm run build to verify foundation");
    }
  } catch (err) {
    console.error(`[INIT ERROR] ${err.message}`);
    process.exit(1);
  }
}
