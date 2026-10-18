/*
 * init-project.test.mjs
 * Unit and integration tests for template project initialization logic.
 * Validates argument parsing, profile verification, and safe directory mutations.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  parseArgs,
  validateOptions,
  normalizePackageName,
  initProject,
  PROJECT_PROFILES,
  CAPABILITIES,
} from "../.agents/scripts/init-project.mjs";

describe("init-project argument parsing", () => {
  it("parses name, type, profile, and capabilities correctly", () => {
    const raw = [
      "--name=Admin Portal",
      "--type=web",
      "--profile=saas",
      "--capabilities=database,auth,billing",
    ];
    const parsed = parseArgs(raw);
    expect(parsed.name).toBe("Admin Portal");
    expect(parsed.type).toBe("web");
    expect(parsed.profile).toBe("saas");
    expect(parsed.capabilities).toEqual(["database", "auth", "billing"]);
  });

  it("handles space-separated arguments", () => {
    const raw = ["--name", "Tracker App", "--type", "backend", "--profile", "node"];
    const parsed = parseArgs(raw);
    expect(parsed.name).toBe("Tracker App");
    expect(parsed.type).toBe("backend");
    expect(parsed.profile).toBe("node");
  });

  it("handles --all-capabilities flag", () => {
    const parsed = parseArgs(["--all-capabilities"]);
    expect(parsed.capabilities).toEqual(Object.keys(CAPABILITIES));
  });

  it("rejects unknown arguments with an actionable error", () => {
    expect(() => parseArgs(["--unknown-flag=true"])).toThrow(
      /Unknown argument: "--unknown-flag=true"/,
    );
  });
});

describe("init-project name normalization", () => {
  it("converts mixed case and spaces to valid package name", () => {
    expect(normalizePackageName("Admin Portal")).toBe("admin-portal");
    expect(normalizePackageName("Stremora Video Platform")).toBe("stremora-video-platform");
  });

  it("strips invalid characters and multiple consecutive hyphens", () => {
    expect(normalizePackageName("My Project (2026)! #1")).toBe("my-project-2026-1");
  });

  it("falls back to default for empty string", () => {
    expect(normalizePackageName("")).toBe("unnamed-project");
    expect(normalizePackageName("   ")).toBe("unnamed-project");
  });
});

describe("init-project option validation", () => {
  it("defaults profile if none provided", () => {
    const validated = validateOptions({
      type: "web",
      profile: "",
      capabilities: [],
    });
    expect(validated.profile).toBe(PROJECT_PROFILES.web.defaultProfile);
  });

  it("rejects invalid project types", () => {
    expect(() => validateOptions({ type: "invalid-type", profile: "", capabilities: [] })).toThrow(
      /Invalid project type: "invalid-type"/,
    );
  });

  it("rejects invalid profile for a given type", () => {
    expect(() => validateOptions({ type: "web", profile: "flutter", capabilities: [] })).toThrow(
      /Invalid profile "flutter" for type "web"/,
    );
  });

  it("rejects unknown capabilities", () => {
    expect(() =>
      validateOptions({ type: "web", profile: "saas", capabilities: ["teleportation"] }),
    ).toThrow(/Invalid capability: "teleportation"/);
  });

  it("auto-resolves capability dependencies (billing requires database and auth)", () => {
    const validated = validateOptions({
      type: "web",
      profile: "saas",
      capabilities: ["billing"],
    });
    expect(validated.capabilities).toContain("billing");
    expect(validated.capabilities).toContain("database");
    expect(validated.capabilities).toContain("auth");
  });
});

describe("init-project execution on temporary fixture", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "init-test-"));
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify(
        {
          name: "template-baseline",
          version: "1.0.0",
          scripts: { dev: "next dev", test: "vitest" },
          dependencies: { next: "^15.0.0" },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(
      path.join(tempDir, "SPEC.md"),
      "# Project Specification (SPEC.md)\n\n*What problem does this project solve, and for whom?*\n",
    );
    fs.writeFileSync(
      path.join(tempDir, ".env.example"),
      "NODE_ENV=development\nAUTH_SECRET=replace_with_secure_random_string_in_env_local\nADMIN_PORTAL_CLIENT_SECRET=replace_with_product_client_secret_in_env_local\nADMIN_PORTAL_SIGNING_SECRET=replace_with_portal_signing_secret_in_env_local\n",
    );
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not modify files during dry-run", () => {
    const result = initProject(
      {
        name: "Dry Run Project",
        type: "web",
        profile: "saas",
        capabilities: ["auth"],
        dryRun: true,
      },
      tempDir,
    );

    expect(result.executed).toBe(false);
    expect(fs.existsSync(path.join(tempDir, ".env.local"))).toBe(false);
    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf8"));
    expect(pkg.name).toBe("template-baseline");
  });

  it("executes changes and generates environment secrets", () => {
    const result = initProject(
      {
        name: "Admin Portal",
        type: "web",
        profile: "saas",
        capabilities: ["auth", "database", "integration"],
        dryRun: false,
      },
      tempDir,
    );

    expect(result.executed).toBe(true);
    expect(result.summary.packageUpdated).toBe(true);
    expect(result.summary.specUpdated).toBe(true);
    expect(result.summary.envCreated).toBe(true);

    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf8"));
    expect(pkg.name).toBe("admin-portal");
    expect(pkg.templateMetadata.projectType).toBe("web");
    expect(pkg.templateMetadata.profile).toBe("saas");
    expect(pkg.templateMetadata.capabilities).toEqual(["auth", "database", "integration"]);

    const envLocal = fs.readFileSync(path.join(tempDir, ".env.local"), "utf8");
    expect(envLocal).not.toContain("replace_with_secure_random_string_in_env_local");
    expect(envLocal).not.toContain("replace_with_product_client_secret_in_env_local");
    expect(envLocal).not.toContain("replace_with_portal_signing_secret_in_env_local");
    expect(envLocal).toMatch(/AUTH_SECRET=[a-f0-9]{64}/);
    expect(envLocal).toMatch(/ADMIN_PORTAL_CLIENT_SECRET=[a-f0-9]{48}/);
    expect(envLocal).toMatch(/ADMIN_PORTAL_SIGNING_SECRET=[a-f0-9]{64}/);
  });

  it("is idempotent and does not overwrite existing .env.local without authorization", () => {
    const envLocalPath = path.join(tempDir, ".env.local");
    fs.writeFileSync(envLocalPath, "CUSTOM_VAR=existing_value\n");

    const result = initProject(
      {
        name: "Admin Portal",
        type: "web",
        profile: "saas",
        capabilities: ["auth"],
        dryRun: false,
      },
      tempDir,
    );

    expect(result.summary.envCreated).toBe(false);
    const envLocalContent = fs.readFileSync(envLocalPath, "utf8");
    expect(envLocalContent).toBe("CUSTOM_VAR=existing_value\n");
  });

  it("initializes a minimal web tool without optional capabilities", () => {
    const result = initProject(
      {
        name: "Namer Utility",
        type: "web",
        profile: "minimal",
        capabilities: [],
        dryRun: false,
      },
      tempDir,
    );

    expect(result.executed).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf8"));
    expect(pkg.name).toBe("namer-utility");
    expect(pkg.templateMetadata.projectType).toBe("web");
    expect(pkg.templateMetadata.profile).toBe("minimal");
    expect(pkg.templateMetadata.capabilities).toEqual([]);

    const spec = fs.readFileSync(path.join(tempDir, "SPEC.md"), "utf8");
    expect(spec).toContain("# Project Specification: Namer Utility");
    expect(spec).toContain("Type: web | Profile: minimal | Active Capabilities: none");
  });

  it("initializes a backend API and performs cleanup of web scaffolding", () => {
    fs.mkdirSync(path.join(tempDir, "design-system"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "public"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "design-system/Button.tsx"),
      "export const Button = () => null;",
    );

    const result = initProject(
      {
        name: "Core API",
        type: "backend",
        profile: "node",
        capabilities: ["database", "observability"],
        cleanup: true,
        dryRun: false,
      },
      tempDir,
    );

    expect(result.executed).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf8"));
    expect(pkg.name).toBe("core-api");
    expect(pkg.templateMetadata.projectType).toBe("backend");
    expect(pkg.templateMetadata.profile).toBe("node");
    expect(pkg.dependencies.next).toBeUndefined();
    expect(pkg.scripts["test:e2e"]).toBeUndefined();

    expect(fs.existsSync(path.join(tempDir, "design-system"))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, "public"))).toBe(false);
  });

  it("initializes a CLI tool with node profile and cleanup", () => {
    fs.mkdirSync(path.join(tempDir, "public"), { recursive: true });

    const result = initProject(
      {
        name: "Sync CLI",
        type: "cli",
        profile: "node",
        capabilities: [],
        cleanup: true,
        dryRun: false,
      },
      tempDir,
    );

    expect(result.executed).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf8"));
    expect(pkg.name).toBe("sync-cli");
    expect(pkg.templateMetadata.projectType).toBe("cli");
    expect(pkg.templateMetadata.profile).toBe("node");
    expect(fs.existsSync(path.join(tempDir, "public"))).toBe(false);
  });

  it("initializes a browser extension profile", () => {
    const result = initProject(
      {
        name: "Tab Assistant",
        type: "browser-extension",
        profile: "chrome",
        capabilities: [],
        dryRun: false,
      },
      tempDir,
    );

    expect(result.executed).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf8"));
    expect(pkg.name).toBe("tab-assistant");
    expect(pkg.templateMetadata.projectType).toBe("browser-extension");
    expect(pkg.templateMetadata.profile).toBe("chrome");
  });

  it("initializes a native Rust project profile", () => {
    const result = initProject(
      {
        name: "Fast Engine",
        type: "native",
        profile: "rust",
        capabilities: [],
        dryRun: false,
      },
      tempDir,
    );

    expect(result.executed).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf8"));
    expect(pkg.name).toBe("fast-engine");
    expect(pkg.templateMetadata.projectType).toBe("native");
    expect(pkg.templateMetadata.profile).toBe("rust");
  });
});
