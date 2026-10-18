/*
 * doctor.mjs
 * Developer diagnostic CLI tool for verifying local environment and starter kit readiness.
 * Validates dependencies, database configurations, authentication setup, and quality gates.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();

console.log("\n=======================================================");
console.log("   STARTER KIT DIAGNOSTICS & SYSTEM SETUP DOCTOR       ");
console.log("=======================================================\n");

let failedCount = 0;
let needsSetupCount = 0;
let warningCount = 0;
let passedCount = 0;

function report(status, label, message, hint) {
  if (status === "passed") {
    passedCount++;
    console.log(`[PASS] ${label}: ${message}`);
  } else if (status === "warning") {
    warningCount++;
    console.log(`[WARN] ${label}: ${message}`);
    if (hint) console.log(`       Hint: ${hint}`);
  } else if (status === "needs_setup") {
    needsSetupCount++;
    console.log(`[SETUP] ${label}: ${message}`);
    if (hint) console.log(`        Hint: ${hint}`);
  } else if (status === "failed") {
    failedCount++;
    console.log(`[FAIL] ${label}: ${message}`);
    if (hint) console.log(`       Hint: ${hint}`);
  } else {
    console.log(`[INFO] ${label}: ${message}`);
  }
}

// 1. Runtime Environment Check
try {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (major < 18) {
    report(
      "failed",
      "Runtime Environment",
      `Node ${nodeVersion} is below minimum supported version (>=18.0.0)`,
      "Upgrade Node.js to v18, v20, or v22.",
    );
  } else {
    report("passed", "Runtime Environment", `Node ${nodeVersion} supported`);
  }
} catch (err) {
  report("failed", "Runtime Environment", err.message);
}

// 2. Package Manifest & Dependency Check
try {
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const requiredPackages = [
    "next",
    "better-auth",
    "@prisma/client",
    "prisma",
    "zod",
    "tailwindcss",
  ];
  const missing = requiredPackages.filter((p) => !deps[p]);

  if (missing.length > 0) {
    report(
      "failed",
      "Dependencies",
      `Missing packages in package.json: ${missing.join(", ")}`,
      "Run 'bun install'.",
    );
  } else {
    report(
      "passed",
      "Dependencies",
      `All core packages declared (Better Auth, Prisma, Next.js, Zod)`,
    );
  }
} catch (err) {
  report("failed", "Dependencies", err.message);
}

// 3. Environment Configuration & Secret Hygiene
try {
  const isProd = process.env.NODE_ENV === "production";
  const authSecret = process.env.AUTH_SECRET;
  const isDefaultSecret =
    !authSecret || authSecret === "dev_fallback_secret_must_not_be_used_in_production_32b";

  if (isProd && isDefaultSecret) {
    report(
      "failed",
      "Auth Secret",
      "AUTH_SECRET is using development fallback secret in production mode.",
      "Set AUTH_SECRET to a random 32+ character string.",
    );
  } else if (isDefaultSecret) {
    report(
      "warning",
      "Auth Secret",
      "Using development fallback secret.",
      "Generate a secure secret with 'openssl rand -hex 32' for production.",
    );
  } else if (authSecret.length < 32) {
    report(
      "warning",
      "Auth Secret",
      `AUTH_SECRET length (${authSecret.length}) is below recommended 32 characters.`,
    );
  } else {
    report("passed", "Auth Secret", `Configured (${authSecret.length} chars)`);
  }
} catch (err) {
  report("failed", "Auth Secret", err.message);
}

// 4. Prisma Schema Validation
try {
  const dummyEnv = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/db",
  };
  execSync("bunx prisma validate", { stdio: "pipe", env: dummyEnv });
  report("passed", "Prisma Schema", "prisma/schema.prisma is valid");
} catch (_err) {
  report(
    "failed",
    "Prisma Schema",
    "Prisma schema validation failed",
    "Run 'bunx prisma validate' to inspect syntax errors.",
  );
}

// 5. Database Connection Probe (Genuine Verification)
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  report(
    "needs_setup",
    "Database Connection",
    "DATABASE_URL is not configured in environment.",
    "Set DATABASE_URL in .env.local (e.g., postgresql://user:pass@localhost:5432/dbname).",
  );
} else {
  try {
    const probeScript = `
      import { PrismaClient } from '@prisma/client';
      const client = new PrismaClient();
      await Promise.race([
        client.$connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 2000ms')), 2000))
      ]);
      await client.$disconnect();
    `;
    execSync(`bun -e "${probeScript.replace(/\n/g, " ")}"`, { stdio: "pipe", env: process.env });
    report("passed", "Database Connection", "Successfully connected to PostgreSQL");
  } catch (_err) {
    report(
      "failed",
      "Database Connection",
      "DATABASE_URL is defined but connection failed or timed out.",
      "Verify PostgreSQL server is active and credentials are correct.",
    );
  }
}

// 6. Better Auth Configuration Check
try {
  const authTestScript = `
    import { auth } from './lib/auth/better-auth';
    if (!auth || typeof auth.handler !== 'function') {
      process.exit(1);
    }
  `;
  execSync(`bun -e "${authTestScript.replace(/\n/g, " ")}"`, { stdio: "pipe", env: process.env });
  report("passed", "Better Auth Handler", "Initialized successfully with catch-all route support");
} catch (_err) {
  report(
    "failed",
    "Better Auth Handler",
    "Failed to initialize Better Auth server module",
    "Inspect lib/auth/better-auth.ts.",
  );
}

// 7. Email Delivery Mode
const emailFrom = process.env.EMAIL_FROM;
const hasLiveEmail = Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
if (hasLiveEmail) {
  report(
    "passed",
    "Email Delivery",
    `Live email transport configured (from: ${emailFrom || "default"})`,
  );
} else {
  report(
    "warning",
    "Email Delivery",
    "In-memory test sink active (outbound emails recorded in memory only, not sent)",
    "Configure email credentials when ready to send live transactional emails.",
  );
}

// 8. Admin Portal Integration Mode
const portalUrl = process.env.ADMIN_PORTAL_URL;
const portalClient = process.env.ADMIN_PORTAL_CLIENT_ID;
if (portalUrl && portalClient) {
  report("passed", "Admin Portal Linkage", `Configured for remote portal at ${portalUrl}`);
} else {
  report(
    "warning",
    "Admin Portal Linkage",
    "Disconnected (running in local self-contained mock mode)",
    "Set ADMIN_PORTAL_URL and ADMIN_PORTAL_CLIENT_ID to connect to control plane.",
  );
}

// 9. Source File Header Check
try {
  execSync("node .agents/scripts/check-headers.mjs", { stdio: "pipe" });
  report("passed", "Source File Headers", "All maintained source files comply with header rules");
} catch {
  report(
    "failed",
    "Source File Headers",
    "Header verification failed",
    "Run 'npm run check-headers'.",
  );
}

// 10. Template Integrity & Safety Check
try {
  execSync("node .agents/scripts/validate-template.mjs", { stdio: "pipe" });
  report(
    "passed",
    "Template Integrity",
    "Skill maps, relative links, and template contracts validated",
  );
} catch {
  report(
    "failed",
    "Template Integrity",
    "Template validation checks failed",
    "Run 'npm run validate-template'.",
  );
}

console.log("\n-------------------------------------------------------");
console.log(
  `SUMMARY: ${passedCount} passed, ${needsSetupCount} needs setup, ${warningCount} warning(s), ${failedCount} failed.`,
);

if (failedCount > 0) {
  console.log("STATUS: SETUP FAILED (Blocking issues must be resolved)");
  console.log("-------------------------------------------------------\n");
  process.exit(1);
} else if (needsSetupCount > 0) {
  console.log(
    "STATUS: SETUP INCOMPLETE (Complete required setup above before testing DB features)",
  );
  console.log("-------------------------------------------------------\n");
  process.exit(0);
} else if (warningCount > 0) {
  console.log("STATUS: READY FOR LOCAL DEVELOPMENT (With non-blocking warnings)");
  console.log("-------------------------------------------------------\n");
  process.exit(0);
} else {
  console.log("STATUS: ALL CHECKS PASSED (Ready for development and deployment)");
  console.log("-------------------------------------------------------\n");
  process.exit(0);
}
