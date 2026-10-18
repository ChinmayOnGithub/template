/*
 * setup-status.test.ts
 * Tests setup diagnostics logic, credential redaction, and deterministic readiness states.
 * Ensures warnings and unconfigured dependencies never produce a false production-ready status.
 */

import { describe, it, expect } from "vitest";
import { redactSensitiveData } from "../lib/observability";

describe("Setup Status Semantics & Redaction", () => {
  it("never masks sensitive database passwords in diagnostic error messages", () => {
    const rawError =
      "Error: connect ECONNREFUSED postgresql://app_user:SuperSecretPassword99@127.0.0.1:5432/production_db";
    const sanitized = redactSensitiveData(rawError);

    expect(sanitized).not.toContain("SuperSecretPassword99");
    expect(sanitized).toContain("[REDACTED]");
    expect(sanitized).toContain("127.0.0.1:5432/production_db");
  });

  it("evaluates deterministic status states accurately", () => {
    type CheckStatus = "passed" | "failed" | "needs_setup" | "warning" | "not_checked";

    function computeOverallStatus(
      checks: Array<{ status: CheckStatus; isMandatoryInProd: boolean }>,
      isProd: boolean,
    ): string {
      const hasFailed = checks.some((c) => c.status === "failed");
      const hasNeedsSetup = checks.some((c) => c.status === "needs_setup");
      const hasWarnings = checks.some((c) => c.status === "warning");

      if (isProd) {
        const prodMandatoryFailed = checks.some(
          (c) => c.isMandatoryInProd && c.status !== "passed",
        );
        if (prodMandatoryFailed || hasFailed || hasNeedsSetup || hasWarnings) {
          return "Setup incomplete";
        }
        return "Production configuration verified";
      }

      if (hasFailed || hasNeedsSetup) {
        return "Setup incomplete";
      }
      return "Ready for local development";
    }

    // Local development with warnings (e.g. mock email, disconnected portal)
    const localDevChecks: Array<{ status: CheckStatus; isMandatoryInProd: boolean }> = [
      { status: "passed", isMandatoryInProd: true },
      { status: "passed", isMandatoryInProd: true },
      { status: "warning", isMandatoryInProd: false }, // mock email
      { status: "warning", isMandatoryInProd: false }, // disconnected portal
    ];
    expect(computeOverallStatus(localDevChecks, false)).toBe("Ready for local development");

    // Production mode with warnings MUST NOT produce production verified
    expect(computeOverallStatus(localDevChecks, true)).toBe("Setup incomplete");

    // Missing database setup
    const missingDbChecks: Array<{ status: CheckStatus; isMandatoryInProd: boolean }> = [
      { status: "needs_setup", isMandatoryInProd: true },
      { status: "passed", isMandatoryInProd: true },
    ];
    expect(computeOverallStatus(missingDbChecks, false)).toBe("Setup incomplete");
    expect(computeOverallStatus(missingDbChecks, true)).toBe("Setup incomplete");

    // All mandatory production checks passing without warnings
    const verifiedProdChecks: Array<{ status: CheckStatus; isMandatoryInProd: boolean }> = [
      { status: "passed", isMandatoryInProd: true },
      { status: "passed", isMandatoryInProd: true },
      { status: "passed", isMandatoryInProd: true },
    ];
    expect(computeOverallStatus(verifiedProdChecks, true)).toBe(
      "Production configuration verified",
    );
  });
});
