/*
 * entitlements.ts
 * Evaluates feature entitlements and enforces numeric plan usage limits.
 * Protects premium capabilities and enforces billing boundaries server-side.
 */

import { ForbiddenError } from "@/lib/api/errors";
import { getPlan, PlanFeatures } from "./plans";

export function checkFeatureAccess(planId: string, feature: keyof PlanFeatures): boolean | number {
  const plan = getPlan(planId);
  return plan.features[feature];
}

export function assertFeatureEnabled(
  planId: string,
  feature: "customDomain" | "prioritySupport",
): void {
  const enabled = checkFeatureAccess(planId, feature);
  if (!enabled) {
    throw new ForbiddenError(
      `Feature "${feature}" is not available on the ${getPlan(planId).name} plan. Please upgrade to access this feature.`,
    );
  }
}

export function assertWithinUsageLimit(
  planId: string,
  metric: "maxProjects" | "storageBytes" | "teamMembers",
  currentUsage: number,
  increment = 1,
): void {
  const plan = getPlan(planId);
  const limit = plan.features[metric];
  if (currentUsage + increment > limit) {
    throw new ForbiddenError(
      `Plan limit reached for "${metric}" (${currentUsage}/${limit}). Please upgrade your subscription to increase limits.`,
    );
  }
}
