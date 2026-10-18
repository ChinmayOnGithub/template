/*
 * entitlements.ts
 * Product-side entitlement cache and synchronization manager.
 * Enforces monotonic versioning and safe fallback policies during control-plane outages.
 */

import { type EntitlementSnapshot } from "./types";
import { validateEntitlementSnapshot } from "./contract";
import { logger } from "../observability/logger";

export interface EntitlementManagerOptions {
  gracePeriodMs?: number; // Maximum age allowed during outage before denying features
  strictMode?: boolean; // If true, never use stale data after expiration
}

export class EntitlementManager {
  private cache = new Map<string, EntitlementSnapshot>();
  private lastSyncTime = new Map<string, number>();
  private gracePeriodMs: number;
  private strictMode: boolean;

  constructor(options: EntitlementManagerOptions = {}) {
    this.gracePeriodMs = options.gracePeriodMs ?? 24 * 60 * 60 * 1000; // 24h default grace
    this.strictMode = options.strictMode ?? false;
  }

  private getKey(productId: string, tenantId?: string): string {
    return `${productId}:${tenantId || "global"}`;
  }

  /**
   * Updates entitlement snapshot monotonically. Rejects older versions.
   */
  public applySnapshot(snapshotData: unknown): { updated: boolean; version: number } {
    const snapshot = validateEntitlementSnapshot(snapshotData);
    const key = this.getKey(snapshot.productId, snapshot.tenantId);
    const current = this.cache.get(key);

    if (current && snapshot.version < current.version) {
      logger.warn("Rejected stale entitlement snapshot version", {
        incomingVersion: snapshot.version,
        currentVersion: current.version,
        productId: snapshot.productId,
      });
      return { updated: false, version: current.version };
    }

    this.cache.set(key, snapshot);
    this.lastSyncTime.set(key, Date.now());

    logger.info("Applied entitlement snapshot", {
      productId: snapshot.productId,
      tenantId: snapshot.tenantId,
      version: snapshot.version,
    });

    return { updated: true, version: snapshot.version };
  }

  public getSnapshot(productId: string, tenantId?: string): EntitlementSnapshot | undefined {
    const key = this.getKey(productId, tenantId);
    const snapshot = this.cache.get(key);
    if (!snapshot) return undefined;

    // Check expiration
    if (snapshot.expiresAt) {
      const expires = new Date(snapshot.expiresAt).getTime();
      const now = Date.now();

      if (now > expires) {
        if (this.strictMode) {
          logger.warn("Entitlement snapshot expired in strict mode", { productId, tenantId });
          return undefined;
        }

        // Check grace period
        if (now - expires > this.gracePeriodMs) {
          logger.warn("Entitlement snapshot grace period exceeded", { productId, tenantId });
          return undefined;
        }
      }
    }

    return snapshot;
  }

  public hasFeature(productId: string, feature: string, tenantId?: string): boolean {
    const snapshot = this.getSnapshot(productId, tenantId);
    if (!snapshot) return false;
    return Boolean(snapshot.features[feature]);
  }

  public getLimit(
    productId: string,
    limitKey: string,
    defaultValue: number = 0,
    tenantId?: string,
  ): number {
    const snapshot = this.getSnapshot(productId, tenantId);
    if (!snapshot) return defaultValue;
    return snapshot.limits[limitKey] ?? defaultValue;
  }

  public getLastSyncTime(productId: string, tenantId?: string): number | undefined {
    return this.lastSyncTime.get(this.getKey(productId, tenantId));
  }

  public clear(): void {
    this.cache.clear();
    this.lastSyncTime.clear();
  }
}

// Global singleton instance for product usage
export const entitlementManager = new EntitlementManager();
