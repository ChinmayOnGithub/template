/*
 * plans.ts
 * Product plan tiers, feature flags, and numeric usage limit definitions.
 * Defines canonical billing plans for subscriptions and entitlement evaluation.
 */

export interface PlanFeatures {
  maxProjects: number;
  storageBytes: number;
  teamMembers: number;
  customDomain: boolean;
  prioritySupport: boolean;
  analyticsRetentionDays: number;
}

export interface PlanDefinition {
  id: "free" | "pro" | "enterprise";
  name: string;
  priceInCents: number;
  currency: string;
  interval: "month" | "year";
  features: PlanFeatures;
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: "free",
    name: "Starter (Free)",
    priceInCents: 0,
    currency: "USD",
    interval: "month",
    features: {
      maxProjects: 3,
      storageBytes: 1024 * 1024 * 100, // 100 MB
      teamMembers: 1,
      customDomain: false,
      prioritySupport: false,
      analyticsRetentionDays: 7,
    },
  },
  pro: {
    id: "pro",
    name: "Professional",
    priceInCents: 2900, // $29.00
    currency: "USD",
    interval: "month",
    features: {
      maxProjects: 50,
      storageBytes: 1024 * 1024 * 1024 * 10, // 10 GB
      teamMembers: 5,
      customDomain: true,
      prioritySupport: true,
      analyticsRetentionDays: 90,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceInCents: 19900, // $199.00
    currency: "USD",
    interval: "month",
    features: {
      maxProjects: 1000,
      storageBytes: 1024 * 1024 * 1024 * 500, // 500 GB
      teamMembers: 100,
      customDomain: true,
      prioritySupport: true,
      analyticsRetentionDays: 365,
    },
  },
};

export function getPlan(planId = "free"): PlanDefinition {
  const plan = PLANS[planId];
  if (plan) return plan;
  return PLANS["free"] as PlanDefinition;
}
